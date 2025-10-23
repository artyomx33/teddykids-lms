/**
 * 🛡️ TALENT ACQUISITION ERROR BOUNDARIES
 * Component Refactoring Architect - Error resilience layer
 * Provides 4-layer error boundary strategy for talent acquisition system
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  componentName: string;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Main Error Boundary for Talent Acquisition Features
 * Layer 2: Feature-Level Boundaries
 */
export class TalentErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    console.error('🚨 Talent Acquisition Error Caught:', error);
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName } = this.props;
    
    console.group(`🔴 ${componentName} Component Error`);
    console.error('Error:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Store error info for display
    this.setState({
      errorInfo
    });

    // TODO: Report to error monitoring service
    // reportErrorToService(error, errorInfo, componentName);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Error in {this.props.componentName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Technical Details
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto rounded bg-gray-100 p-2 text-xs">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={this.handleReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="default"
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Section-Level Error Boundary
 * Layer 3: Isolates risky sections within features
 */
export function SectionErrorBoundary({ 
  children, 
  sectionName,
  fallback
}: { 
  children: ReactNode; 
  sectionName: string;
  fallback?: ReactNode;
}) {
  return (
    <TalentErrorBoundary 
      componentName={sectionName}
      fallback={fallback}
    >
      {children}
    </TalentErrorBoundary>
  );
}

/**
 * Component-Level Micro Boundary
 * Layer 4: For individual complex components
 */
export function ComponentErrorBoundary({
  children,
  componentName,
  onError
}: {
  children: ReactNode;
  componentName: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}) {
  return (
    <TalentErrorBoundary componentName={componentName}>
      {children}
    </TalentErrorBoundary>
  );
}

/**
 * Lightweight error handler for non-critical sections
 * Shows minimal error UI, doesn't break the page
 */
export function SoftErrorBoundary({
  children,
  fallbackMessage = 'Unable to load this section'
}: {
  children: ReactNode;
  fallbackMessage?: string;
}) {
  class SoftBoundary extends Component<{}, { hasError: boolean }> {
    state = { hasError: false };

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: Error) {
      console.warn('⚠️ Soft error caught:', error.message);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {fallbackMessage}
            </p>
          </div>
        );
      }
      return this.props.children;
    }
  }

  return <SoftBoundary>{children}</SoftBoundary>;
}

/**
 * Async operation error boundary
 * Specifically for data fetching and async operations
 */
export function AsyncErrorBoundary({
  children,
  onRetry
}: {
  children: ReactNode;
  onRetry?: () => void;
}) {
  class AsyncBoundary extends Component<{}, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
      hasError: false,
      error: null,
      errorInfo: null
    };

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      console.error('❌ Async operation failed:', error.message);
      console.error('Details:', errorInfo.componentStack);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
            <h3 className="mt-2 text-lg font-semibold text-red-700">
              Failed to load data
            </h3>
            <p className="mt-1 text-sm text-red-600">
              {this.state.error?.message || 'An error occurred while fetching data'}
            </p>
            {onRetry && (
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  onRetry();
                }}
                className="mt-4"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
          </div>
        );
      }
      return this.props.children;
    }
  }

  return <AsyncBoundary>{children}</AsyncBoundary>;
}

// Export all boundary types
export default TalentErrorBoundary;

