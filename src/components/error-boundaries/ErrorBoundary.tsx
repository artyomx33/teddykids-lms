import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Copy, Bug, FileText, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'section';
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 * 
 * Usage:
 * <ErrorBoundary level="page">
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const componentName = this.props.componentName || 'Unknown Component';

    // Enhanced logging with component identification
    console.group(`🛡️ [ErrorBoundary] ${componentName} Failed`);
    logger.error('ErrorBoundary', '💥 Error caught:', {
      message: error.message,
      component: componentName,
      stack: error.stack,
      reactStack: errorInfo.componentStack,
    });
    console.groupEnd();

    // Store error info in state
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send to error reporting service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: { componentName, ...errorInfo } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  copyErrorToClipboard = () => {
    if (!this.state.error) return;

    const componentName = this.props.componentName || 'Unknown Component';
    const errorText = `🛡️ ErrorBoundary Report\n\nComponent: ${componentName}\nError: ${this.state.error.message}\n\nStack Trace:\n${this.state.error.stack}\n\nReact Component Stack:\n${this.state.errorInfo?.componentStack || 'N/A'}`;

    navigator.clipboard.writeText(errorText).then(() => {
      toast({
        title: '📋 Error copied to clipboard',
        description: 'You can now paste this into your issue tracker or debug notes'
      });
    }).catch(() => {
      console.log('📋 Error Report:\n', errorText);
      toast({
        title: '📋 Error logged to console',
        description: 'Check browser console for the full error report'
      });
    });
  };

  getErrorHint = (error: Error): string => {
    const message = error.message.toLowerCase();

    if (message.includes('cannot read property') && message.includes('undefined')) {
      return '💡 Hint: Check if data is loaded before rendering. Add null checks or loading states.';
    }
    if (message.includes('cannot read properties of null')) {
      return '💡 Hint: A required prop or state value is null. Verify data dependencies.';
    }
    if (message.includes('too many re-renders')) {
      return '💡 Hint: Check useEffect dependencies or state updates in render functions.';
    }
    if (message.includes('invalid hook call')) {
      return '💡 Hint: Hooks must be called at the top level. Check conditional hook usage.';
    }
    if (message.includes('failed to fetch') || message.includes('network')) {
      return '💡 Hint: API call failed. Check network connectivity and endpoint URLs.';
    }
    if (message.includes('unexpected token')) {
      return '💡 Hint: JSON parsing error. Check API response format.';
    }
    if (message.includes('hydration')) {
      return '💡 Hint: Server/client mismatch. Check for dynamic content or useEffect usage.';
    }

    return '💡 Hint: Check the component\'s props, state, and data dependencies.';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI based on level
      const isPageLevel = this.props.level === 'page';
      const showDetails = this.props.showDetails ?? (process.env.NODE_ENV === 'development');

      const componentName = this.props.componentName;
      const errorHint = this.state.error ? this.getErrorHint(this.state.error) : '';

      return (
        <Card className={`${isPageLevel ? 'w-full max-w-2xl mx-auto mt-8' : 'w-full'} border-red-200 bg-red-50`}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
              <div className="flex-1">
                <CardTitle className="text-red-900 flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  {componentName ? `${componentName} Component Failed` : (isPageLevel ? 'Page Error' : 'Component Error')}
                </CardTitle>
                <CardDescription className="text-red-700">
                  {this.state.error?.message || (isPageLevel
                    ? 'An unexpected error occurred while loading this page.'
                    : 'This section encountered an error and cannot be displayed.')}
                </CardDescription>
                {errorHint && (
                  <div className="mt-2 p-2 bg-blue-100 border border-blue-200 rounded text-blue-800 text-sm">
                    {errorHint}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {showDetails && this.state.error && (
              <div className="rounded-lg bg-red-100 p-4 font-mono text-sm text-red-900">
                <div className="font-semibold mb-2">Error Details:</div>
                <div className="mb-2">
                  <strong>Message:</strong> {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-semibold">Stack Trace</summary>
                    <pre className="mt-2 text-xs overflow-x-auto whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-semibold">Component Stack</summary>
                    <pre className="mt-2 text-xs overflow-x-auto whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={this.handleReset}
                variant="default"
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>

              <Button
                onClick={this.copyErrorToClipboard}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Error
              </Button>

              {isPageLevel && (
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  size="sm"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              )}

              {process.env.NODE_ENV === 'development' && (
                <Button
                  onClick={() => console.log('🐛 Full Error Object:', this.state.error, this.state.errorInfo)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Log to Console
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * SectionErrorBoundary
 * Convenient wrapper for section-level errors
 */
export const SectionErrorBoundary = ({ children, sectionName }: { children: ReactNode; sectionName: string }) => {
  return (
    <ErrorBoundary
      level="section"
      componentName={sectionName}
      onError={(error) => {
        logger.error('SectionErrorBoundary', `Section "${sectionName}" error:`, error.message);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * PageErrorBoundary
 * Convenient wrapper for page-level errors
 */
export const PageErrorBoundary = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary
      level="page"
      showDetails={true}
      onError={(error, errorInfo) => {
        logger.error('PageErrorBoundary', 'Critical page error:', { error, errorInfo });
        // TODO: Send to error tracking service
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
