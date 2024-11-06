export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorReport {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  timestamp: number;
  context: Record<string, any>;
  recoveryAttempts?: number;
}

export class BaseErrorHandler {
  protected static createErrorReport(
    error: Error,
    severity: ErrorSeverity = 'medium',
    context: Record<string, any> = {}
  ): ErrorReport {
    return {
      message: error.message,
      stack: error.stack,
      severity,
      timestamp: Date.now(),
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    };
  }

  protected async logError(error: ErrorReport): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(error),
        });
      } catch (e) {
        console.error('Failed to log error:', e);
      }
    }
  }

  protected async notifyTeam(error: ErrorReport): Promise<void> {
    console.error('Critical error:', error);
  }
}