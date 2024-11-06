import { AudioEngine } from './AudioEngine';
import { ProjectManager } from './ProjectManager';
import { ResourceManager } from './ResourceManager';
import { ErrorManager } from './ErrorManager';
import { SystemMonitor } from '../monitoring/SystemMonitor';
import { AdaptiveAIManager } from '../ai/AdaptiveAIManager';
import { SecurityManager } from '../auth/security';

export class SystemVerification {
  private static instance: SystemVerification;
  private audioEngine: AudioEngine;
  private projectManager: ProjectManager;
  private resourceManager: ResourceManager;
  private errorManager: ErrorManager;
  private systemMonitor: SystemMonitor;
  private aiManager: AdaptiveAIManager;
  private securityManager: SecurityManager;

  private constructor() {
    this.audioEngine = AudioEngine.getInstance();
    this.projectManager = ProjectManager.getInstance();
    this.resourceManager = ResourceManager.getInstance();
    this.errorManager = ErrorManager.getInstance();
    this.systemMonitor = SystemMonitor.getInstance();
    this.aiManager = AdaptiveAIManager.getInstance();
    this.securityManager = SecurityManager.getInstance();
  }

  static getInstance(): SystemVerification {
    if (!SystemVerification.instance) {
      SystemVerification.instance = new SystemVerification();
    }
    return SystemVerification.instance;
  }

  async verifyAllSystems(): Promise<{
    status: 'ready' | 'degraded' | 'failed';
    issues: string[];
    capabilities: string[];
  }> {
    const issues: string[] = [];
    const capabilities: string[] = [];

    try {
      // Verify core processing capabilities
      const audioStatus = await this.verifyAudioEngine();
      if (!audioStatus.ready) issues.push(audioStatus.issue);
      capabilities.push(...audioStatus.capabilities);

      // Check resource availability
      const resourceStatus = await this.resourceManager.validateConnections();
      if (resourceStatus.status !== 'healthy') {
        issues.push(...resourceStatus.issues);
      }

      // Verify AI capabilities
      const aiCapabilities = await this.aiManager.detectCapabilities();
      capabilities.push(...Object.keys(aiCapabilities));

      // Check security measures
      const securityStatus = await this.verifySecurityMeasures();
      if (!securityStatus.ready) issues.push(securityStatus.issue);

      // Verify monitoring systems
      const monitoringStatus = await this.verifyMonitoring();
      if (!monitoringStatus.ready) issues.push(monitoringStatus.issue);

      return {
        status: issues.length === 0 ? 'ready' : 
                issues.length < 3 ? 'degraded' : 'failed',
        issues,
        capabilities
      };
    } catch (error) {
      await this.errorManager.handleError(error, {
        context: 'system_verification'
      });
      return {
        status: 'failed',
        issues: ['System verification failed'],
        capabilities: []
      };
    }
  }

  private async verifyAudioEngine(): Promise<{
    ready: boolean;
    issue?: string;
    capabilities: string[];
  }> {
    try {
      const capabilities = [];

      // Check WebAudio support
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        capabilities.push('web_audio');
      }

      // Check AudioWorklet support
      if ('audioWorklet' in AudioContext.prototype) {
        capabilities.push('audio_worklet');
      }

      // Check WebAssembly support
      if ('WebAssembly' in window) {
        capabilities.push('wasm');
      }

      // Check SharedArrayBuffer support
      if ('SharedArrayBuffer' in window) {
        capabilities.push('shared_array_buffer');
      }

      // Check WebGL support for visualizations
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (gl) capabilities.push('webgl2');

      return {
        ready: capabilities.length >= 3,
        capabilities
      };
    } catch (error) {
      return {
        ready: false,
        issue: 'Audio engine initialization failed',
        capabilities: []
      };
    }
  }

  private async verifySecurityMeasures(): Promise<{
    ready: boolean;
    issue?: string;
  }> {
    try {
      // Verify CSRF protection
      const csrfToken = await this.securityManager.generateToken();
      if (!csrfToken) {
        return { ready: false, issue: 'CSRF protection not available' };
      }

      // Verify rate limiting
      const rateLimitOk = await this.securityManager.checkRateLimit('test', 'verify');
      if (!rateLimitOk) {
        return { ready: false, issue: 'Rate limiting not configured' };
      }

      // Verify secure headers
      const headers = this.securityManager.getSecurityHeaders();
      if (!headers['Content-Security-Policy']) {
        return { ready: false, issue: 'Security headers not configured' };
      }

      return { ready: true };
    } catch (error) {
      return {
        ready: false,
        issue: 'Security verification failed'
      };
    }
  }

  private async verifyMonitoring(): Promise<{
    ready: boolean;
    issue?: string;
  }> {
    try {
      // Check metrics collection
      const metrics = await this.systemMonitor.getMetrics();
      if (!metrics) {
        return { ready: false, issue: 'Metrics collection not available' };
      }

      // Check alert system
      const alertsConfigured = await this.systemMonitor.verifyAlertSystem();
      if (!alertsConfigured) {
        return { ready: false, issue: 'Alert system not configured' };
      }

      return { ready: true };
    } catch (error) {
      return {
        ready: false,
        issue: 'Monitoring system verification failed'
      };
    }
  }
}