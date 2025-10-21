import React, { ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface ReviewFormErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ReviewFormErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ReviewFormErrorBoundary extends React.Component<
  ReviewFormErrorBoundaryProps,
  ReviewFormErrorBoundaryState
> {
  state: ReviewFormErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ReviewFormErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      logger.error('ReviewFormErrorBoundary', 'Error caught in ReviewForm:', { error, info });
    }
  }

  render() {
    const { children, fallback } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6 text-destructive">
          <h2 className="text-lg font-semibold">Something went wrong.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The review form encountered an unexpected error. Please refresh the page or try again later.
          </p>
        </div>
      );
    }

    return children;
  }
}
