export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div 
      className="flex items-center justify-center min-h-[400px]"
      role="status"
      aria-live="polite"
    >
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto" aria-hidden="true">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
        <span className="sr-only">Loading content, please wait...</span>
      </div>
    </div>
  );
}

