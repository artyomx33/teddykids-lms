import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  /**
   * User-friendly error message to display
   */
  message?: string;
  
  /**
   * Optional detailed error information (for debugging)
   */
  error?: Error | unknown;
  
  /**
   * Optional retry/reload callback
   */
  onRetry?: () => void;
  
  /**
   * Show reload button (defaults to true)
   */
  showReload?: boolean;
  
  /**
   * Compact mode (smaller padding, no icon)
   */
  compact?: boolean;
}

/**
 * ErrorFallback Component
 * 
 * Displays user-friendly error messages with optional retry functionality.
 * Use this instead of silent failures or returning empty arrays.
 * 
 * @example
 * ```tsx
 * if (error) {
 *   return <ErrorFallback message="Unable to load performance data" />;
 * }
 * ```
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  message = 'Unable to load data',
  error,
  onRetry,
  showReload = true,
  compact = false,
}) => {
  const handleReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span>{message}</span>
        {showReload && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReload}
            className="h-6 px-2"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {showReload && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReload}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
      {error && process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs opacity-70">
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}
    </Alert>
  );
};

