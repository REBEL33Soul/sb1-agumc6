import { TestRunner } from './TestRunner';
import { AudioProcessingTests } from './AudioProcessingTests';
import { IntegrationTests } from './IntegrationTests';
import { SystemMonitor } from '../monitoring/SystemMonitor';
import { ErrorManager } from '../core/ErrorManager';

export class E2ETests {
  private static instance: E2ETests;
  private testRunner: TestRunner;
  private audioTests: AudioProcessingTests;
  private integrationTests: IntegrationTests;
  private systemMonitor: SystemMonitor;
  private errorManager: ErrorManager;

  private constructor() {
    this.testRunner = TestRunner.getInstance();
    this.audioTests = new AudioProcessingTests();
    this.integrationTests = new IntegrationTests();
    this.systemMonitor = SystemMonitor.getInstance();
    this.errorManager = ErrorManager.getInstance();
  }

  static getInstance(): E2ETests {
    if (!E2ETests.instance) {
      E2ETests.instance = new E2ETests();
    }
    return E2ETests.instance;
  }

  async runAllTests(): Promise<{
    passed: boolean;
    results: {
      audio: any;
      integration: any;
      system: any;
      performance: any;
    };
    metrics: any;
  }> {
    try {
      // Run all test suites
      const [audioResults, integrationResults] = await Promise.all([
        this.audioTests.runTests(),
        this.integrationTests.runTests()
      ]);

      // Run system tests
      const systemResults = await this.testRunner.runAllTests();

      // Run performance tests
      const performanceResults = await this.runPerformanceTests();

      // Collect metrics
      const metrics = await this.systemMonitor.getMetrics();

      // Determine overall pass/fail
      const passed = this.evaluateResults(
        audioResults,
        integrationResults,
        systemResults,
        performanceResults
      );

      return {
        passed,
        results: {
          audio: audioResults,
          integration: integrationResults,
          system: systemResults,
          performance: performanceResults
        },
        metrics
      };
    } catch (error) {
      await this.errorManager.handleError(error, {
        context: 'e2e_tests'
      });
      throw error;
    }
  }

  private async runPerformanceTests(): Promise<{
    passed: boolean;
    results: Array<{
      name: string;
      passed: boolean;
      value: number;
      threshold: number;
    }>;
  }> {
    const tests = [
      {
        name: 'Audio Processing Latency',
        run: () => this.testProcessingLatency(),
        threshold: 100 // 100ms
      },
      {
        name: 'Model Loading Time',
        run: () => this.testModelLoadingTime(),
        threshold: 2000 // 2s
      },
      {
        name: 'Memory Usage',
        run: () => this.testMemoryUsage(),
        threshold: 500 // 500MB
      },
      {
        name: 'CPU Usage',
        run: () => this.testCPUUsage(),
        threshold: 80 // 80%
      }
    ];

    const results = [];
    let allPassed = true;

    for (const test of tests) {
      const value = await test.run();
      const passed = value <= test.threshold;
      allPassed = allPassed && passed;

      results.push({
        name: test.name,
        passed,
        value,
        threshold: test.threshold
      });
    }

    return {
      passed: allPassed,
      results
    };
  }

  private async testProcessingLatency(): Promise<number> {
    const sampleRate = 48000;
    const duration = 1;
    const buffer = new AudioBuffer({
      length: sampleRate * duration,
      numberOfChannels: 2,
      sampleRate
    });

    const start = performance.now();
    await this.audioTests['processor'].processAudio(buffer, {
      denoise: true,
      normalize: true,
      removeClipping: true,
      enhanceStereo: true
    });
    return performance.now() - start;
  }

  private async testModelLoadingTime(): Promise<number> {
    const start = performance.now();
    await this.integrationTests['modelManager'].loadModel('default-model');
    return performance.now() - start;
  }

  private async testMemoryUsage(): Promise<number> {
    const metrics = await this.systemMonitor.getMetrics();
    return metrics.memory.used / (1024 * 1024); // Convert to MB
  }

  private async testCPUUsage(): Promise<number> {
    const metrics = await this.systemMonitor.getMetrics();
    return metrics.cpu.usage * 100; // Convert to percentage
  }

  private evaluateResults(
    audioResults: any,
    integrationResults: any,
    systemResults: any,
    performanceResults: any
  ): boolean {
    // All test suites must pass
    return (
      audioResults.failed === 0 &&
      integrationResults.failed === 0 &&
      systemResults.status === 'passed' &&
      performanceResults.passed
    );
  }
}