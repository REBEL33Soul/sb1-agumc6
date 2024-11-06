import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorRecoveryManager } from '../lib/errorHandling/ErrorRecoveryManager';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRecovering: boolean;
  recoveryAttempts: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private errorRecoveryManager: ErrorRecoveryManager;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isRecovering: false,
      recoveryAttempts: 0
    };
    this.errorRecoveryManager = ErrorRecoveryManager.getInstance();
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.attemptRecovery(error);
  }

  private async attemptRecovery(error: Error) {
    this.setState({ isRecovering: true });
    
    try {
      const recovered = await this.errorRecoveryManager.handleError(error);
      if (recovered) {
        this.setState({
          hasError: false,
          error: null,
          isRecovering: false,
          recoveryAttempts: 0
        });
      } else {
        this.setState(state => ({
          isRecovering: false,
          recoveryAttempts: state.recoveryAttempts + 1
        }));
      }
    } catch (recoveryError) {
      this.setState({
        isRecovering: false,
        recoveryAttempts: this.state.recoveryAttempts + 1
      });
    }
  }

  private handleRetry = () => {
    if (this.state.error) {
      this.attemptRecovery(this.state.error);
    }
  };

  private handleReset = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
            <p className="text-gray-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {this.state.isRecovering ? (
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-400">Attempting recovery...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {this.state.recoveryAttempts < 3 && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={this.handleReset}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Reload Application
                </button>
              </div>
            )}
            {this.state.recoveryAttempts > 0 && (
              <p className="mt-4 text-sm text-gray-500">
                Recovery attempts: {this.state.recoveryAttempts}/3
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}