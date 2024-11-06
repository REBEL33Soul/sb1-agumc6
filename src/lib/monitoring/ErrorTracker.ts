import { BaseErrorHandler, type ErrorSeverity, type ErrorReport } from '../errorHandling/BaseErrorHandler';

export class ErrorTracker extends BaseErrorHandler {
  private static instance: ErrorTracker;
  private errors: ErrorReport[] = [];
  private readonly maxErrors = 100;

  private constructor() {
    super();
    this.setupGlobalHandlers();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private setupGlobalHandlers() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.trackError(error || new Error(String(message)), 'high', {
        source,
        line: lineno,
        column: colno,
      });
    };

    window.onunhandledrejection = (event) => {
      this.trackError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        'high',
        { type: 'unhandledRejection' }
      );
    };
  }

  trackError(
    error: Error,
    severity: ErrorSeverity = 'medium',
    context: Record<string, any> = {}
  ): void {
    const errorReport = BaseErrorHandler.createErrorReport(error, severity, context);
    this.errors.push(errorReport);
    
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    this.handleError(errorReport);
  }

  private async handleError(error: ErrorReport): Promise<void> {
    if (error.severity === 'critical') {
      await this.notifyTeam(error);
    }

    await this.logError(error);
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}