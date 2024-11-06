import { AudioProcessingTests } from './AudioProcessingTests';
import { IntegrationTests } from './IntegrationTests';
import { E2ETests } from './E2ETests';
import { SystemMonitor } from '../monitoring/SystemMonitor';
import { ErrorManager } from '../core/ErrorManager';

export class TestRunner {
  private static instance: TestRunner;
  private audioTests: AudioProcessingTests;
  private integrationTests: IntegrationTests;
  private e2eTests: E2ETests;
  private systemMonitor: SystemMonitor;
  private errorManager: ErrorManager;

  private constructor() {
    this.audioTests = new AudioProcessingTests();
    this.integrationTests = new IntegrationTests();
    this.e2eTests = E2ETests.getInstance();
    this.systemMonitor = SystemMonitor.getInstance();
    this.errorManager = ErrorManager.getInstance();
  }

  static getInstance(): TestRunner {
    if (!TestRunner.instance) {
      TestRunner.instance = new TestRunner();
    }
    return TestRunner.instance;
  }

  async runAllTests(): Promise<{
    status: 'passed' | 'failed';
    results: {
      audio: any;
      integration: any;
      e2e: any;
      performance: any;
      health: any;
    };
    metrics: any;
    recommendations: string[];
  }> {
    try {
      // Run all test suites in parallel
      const [
        audioResults,
        integrationResults,
        e2eResults,
        performanceResults,
        healthResults
      ] = await Promise.all([
        this.audioTests.runTests(),
        this.integrationTests.runTests(),
        this.e2eTests.runAllTests(),
        this.runPerformanceTests(),
        this.runHealthCheck()
      ]);

      // Collect system metrics
      const metrics = await this.systemMonitor.getMetrics();

      // Generate recommendations based on results
      const recommendations = this.generateRecommendations({
        audio: audioResults,
        integration: integrationResults,
        e2e: e2eResults,
        performance: performanceResults,
        health: healthResults,
        metrics
      });

      // Determine overall status
      const status = this.determineOverallStatus({
        audio: audioResults,
        integration: integrationResults,
        e2e: e2eResults,
        performance: performanceResults,
        health: healthResults
      });

      return {
        status,
        results: {
          audio: audioResults,
          integration: integrationResults,
          e2e: e2eResults,
          performance: performanceResults,
          health: healthResults
        },
        metrics,
        recommendations
      };
    } catch (error) {
      await this.errorManager.handleError(error, {
        context: 'test_runner',
        severity: 'high'
      });
      throw error;
    }
  }

  private async runPerformanceTests(): Promise<{
    passed: boolean;
    results: Array<{
      name: string;
      value: number;
      threshold: number;
      passed: boolean;
    }>;
  }> {
    const tests = [
      {
        name: 'Audio Processing Latency',
        run: async () => {
          const start = performance.now();
          await this.audioTests['processor'].processAudio(
            new ArrayBuffer(48000 * 2), // 1 second stereo
            { denoise: true, normalize: true }
          );
          return performance.now() - start;
        },
        threshold: 100 // 100ms
      },
      {
        name: 'Memory Usage',
        run: async () => {
          const metrics = await this.systemMonitor.getMetrics();
          return metrics.memory.used / (1024 * 1024); // MB
        },
        threshold: 500 // 500MB
      },
      {
        name: 'CPU Usage',
        run: async () => {
          const metrics = await this.systemMonitor.getMetrics();
          return metrics.cpu.usage * 100;
        },
        threshold: 80 // 80%
      },
      {
        name: 'WebAssembly Performance',
        run: async () => {
          const start = performance.now();
          await this.audioTests['processor']['processWithWasm'](
            new ArrayBuffer(48000 * 2),
            { denoise: true }
          );
          return performance.now() - start;
        },
        threshold: 50 // 50ms
      }
    ];

    const results = await Promise.all(
      tests.map(async (test) => {
        const value = await test.run();
        return {
          name: test.name,
          value,
          threshold: test.threshold,
          passed: value <= test.threshold
        };
      })
    );

    return {
      passed: results.every(r => r.passed),
      results
    };
  }

  private async runHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Array<{
      name: string;
      status: 'passed' | 'failed';
      message?: string;
    }>;
  }> {
    const checks = [
      {
        name: 'WebAssembly Support',
        check: async () => {
          return typeof WebAssembly !== 'undefined';
        }
      },
      {
        name: 'AudioContext Support',
        check: async () => {
          return typeof AudioContext !== 'undefined' ||
                 typeof (window as any).webkitAudioContext !== 'undefined';
        }
      },
      {
        name: 'SharedArrayBuffer Support',
        check: async () => {
          return typeof SharedArrayBuffer !== 'undefined';
        }
      },
      {
        name: 'WebGL Support',
        check: async () => {
          const canvas = document.createElement('canvas');
          return !!canvas.getContext('webgl2');
        }
      },
      {
        name: 'Storage Access',
        check: async () => {
          try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
          } catch {
            return false;
          }
        }
      }
    ];

    const results = await Promise.all(
      checks.map(async ({ name, check }) => {
        try {
          const passed = await check();
          return {
            name,
            status: passed ? 'passed' as const : 'failed' as const,
            message: passed ? undefined : `${name} not available`
          };
        } catch (error) {
          return {
            name,
            status: 'failed' as const,
            message: error instanceof Error ? error.message : `${name} check failed`
          };
        }
      })
    );

    const failedCount = results.filter(r => r.status === 'failed').length;
    const status = failedCount === 0 ? 'healthy' :
                   failedCount <= 2 ? 'degraded' : 'unhealthy';

    return { status, checks: results };
  }

  private generateRecommendations(results: any): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (results.performance.results.some(r => !r.passed)) {
      const failedTests = results.performance.results.filter(r => !r.passed);
      failedTests.forEach(test => {
        recommendations.push(
          `Optimize ${test.name.toLowerCase()}: currently ${test.value.toFixed(2)} vs threshold ${test.threshold}`
        );
      });
    }

    // Health check recommendations
    if (results.health.status !== 'healthy') {
      const failedChecks = results.health.checks.filter(c => c.status === 'failed');
      failedChecks.forEach(check => {
        recommendations.push(
          `Enable ${check.name.toLowerCase()} for optimal performance`
        );
      });
    }

    // Resource usage recommendations
    if (results.metrics.memory.used > results.metrics.memory.total * 0.8) {
      recommendations.push('Consider implementing memory optimization strategies');
    }

    if (results.metrics.cpu.usage > 0.7) {
      recommendations.push('Optimize CPU-intensive operations or consider offloading to WebAssembly');
    }

    return recommendations;
  }

  private determineOverallStatus(results: any): 'passed' | 'failed' {
    const checks = [
      results.audio.passed,
      results.integration.passed,
      results.e2e.passed,
      results.performance.passed,
      results.health.status !== 'unhealthy'
    ];

    return checks.every(Boolean) ? 'passed' : 'failed';
  }
}