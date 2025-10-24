import React, { ErrorInfo, ReactNode } from 'react';
interface SectionErrorBoundaryProps {
  children: ReactNode;
  sectionName: string;
  fallback?: ReactNode;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  state: SectionErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): SectionErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('SectionErrorBoundary', `Section "${this.props.sectionName}" error:`, { error, info });
    }
  }

  render() {
    const { children, fallback, sectionName } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="rounded-md border border-amber-300/60 bg-amber-50 p-4 text-amber-900">
          <h3 className="text-base font-semibold">Section temporarily unavailable</h3>
          <p className="mt-1 text-sm text-amber-800">
            We hit a problem while rendering the {sectionName} section. Please try again later or contact support if the issue persists.
          </p>
        </div>
      );
    }

    return children;
  }
}
