import { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface MissingDataBoundaryProps {
  children: ReactNode;
  dataRequirement: string;
  fallbackMessage: string;
}

export function MissingDataBoundary({ 
  children, 
  dataRequirement,
  fallbackMessage 
}: MissingDataBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Missing Data Connection</AlertTitle>
          <AlertDescription>
            <p className="text-sm mb-2">{fallbackMessage}</p>
            <code className="text-xs bg-gray-100 p-1 rounded">
              Required: {dataRequirement}
            </code>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs">Debug Info</summary>
                <pre className="text-xs mt-1">{error.message}</pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

