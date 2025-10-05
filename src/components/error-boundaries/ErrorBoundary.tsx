import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'section';
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
    // Log the error to console
    console.error('🛡️ [ErrorBoundary] Caught error:', error, errorInfo);
    
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
    // Example: Sentry.captureException(error, { extra: errorInfo });
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

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI based on level
      const isPageLevel = this.props.level === 'page';
      const showDetails = this.props.showDetails ?? (process.env.NODE_ENV === 'development');

      return (
        <Card className={`${isPageLevel ? 'w-full max-w-2xl mx-auto mt-8' : 'w-full'} border-red-200 bg-red-50`}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
              <div className="flex-1">
                <CardTitle className="text-red-900">
                  {isPageLevel ? 'Something went wrong' : 'Section unavailable'}
                </CardTitle>
                <CardDescription className="text-red-700">
                  {isPageLevel 
                    ? 'An unexpected error occurred while loading this page.'
                    : 'This section encountered an error and cannot be displayed.'}
                </CardDescription>
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

            <div className="flex gap-2">
              <Button
                onClick={this.handleReset}
                variant="default"
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
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
      onError={(error) => {
        console.error(`🛡️ [${sectionName}] Section error:`, error.message);
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
        console.error('🛡️ [Page] Critical error:', error, errorInfo);
        // TODO: Send to error tracking service
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
