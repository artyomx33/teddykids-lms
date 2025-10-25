# 🛡️ Error Handling Guide

**Complete patterns for error handling in TeddyKids LMS**

---

## 📋 **Table of Contents**

1. [Three Layers of Protection](#three-layers-of-protection)
2. [Component-Level Error Handling](#component-level-error-handling)
3. [ErrorFallback Component](#errorfallback-component)
4. [ErrorBoundary Components](#errorboundary-components)
5. [Data Fetching Errors](#data-fetching-errors)
6. [Form Validation Errors](#form-validation-errors)
7. [Database Errors](#database-errors)
8. [Race Condition Prevention](#race-condition-prevention)
9. [Error Logging](#error-logging)
10. [Testing Error States](#testing-error-states)

---

## 🏗️ **Three Layers of Protection**

Every data-heavy component should have three layers:

```typescript
import { ErrorFallback } from '@/components/ui/error-fallback';
import { SectionErrorBoundary } from '@/components/error-boundaries/SectionErrorBoundary';

export function MyComponent() {
  const { data, error, isLoading } = useQuery({...});

  // Layer 3: Loading State (prevents flash of empty content)
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  // Layer 2: Query Error Handling (network/database errors)
  if (error) {
    return <ErrorFallback 
      message="Unable to load data" 
      error={error}
      onRetry={() => refetch()}
    />;
  }

  // Render actual content
  return <Content data={data} />;
}

// Layer 1: Component Error Boundary (JavaScript crashes)
// Wrapped at parent level:
<SectionErrorBoundary sectionName="MyComponent">
  <MyComponent />
</SectionErrorBoundary>
```

### **What Each Layer Catches**

| Layer | Catches | Example |
|-------|---------|---------|
| **ErrorBoundary** | React rendering errors, undefined errors, crashes | `data.user.name` when `user` is undefined |
| **ErrorFallback** | Network errors, database errors, API failures | `fetch()` fails, Supabase query error |
| **Loading State** | Async race conditions, slow networks | Data not loaded yet |

---

## 🎨 **Component-Level Error Handling**

### **Pattern 1: Simple Query**

```typescript
export function SimpleComponent() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['simple-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('my_table')
        .select('*');
      
      if (error) throw error;  // ← Throw, don't return
      return data;
    },
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorFallback message="Unable to load data" />;
  if (!data?.length) return <EmptyState />;
  
  return <DataDisplay data={data} />;
}
```

### **Pattern 2: Multiple Queries**

```typescript
export function MultiQueryComponent() {
  const { data: users, error: usersError, isLoading: usersLoading } = useQuery({...});
  const { data: posts, error: postsError, isLoading: postsLoading } = useQuery({...});

  // Handle loading
  if (usersLoading || postsLoading) return <Spinner />;
  
  // Handle errors separately or together
  if (usersError || postsError) {
    return <ErrorFallback 
      message="Unable to load page data"
      error={usersError || postsError}
    />;
  }

  return (
    <div>
      <Users data={users} />
      <Posts data={posts} />
    </div>
  );
}
```

### **Pattern 3: Graceful Degradation**

```typescript
export function GracefulComponent() {
  const { data: critical, error: criticalError } = useQuery({...});
  const { data: optional, error: optionalError } = useQuery({...});

  // Critical data must succeed
  if (criticalError) {
    return <ErrorFallback message="Unable to load critical data" />;
  }

  return (
    <div>
      <CriticalSection data={critical} />
      
      {/* Optional section - show error inline */}
      {optionalError ? (
        <Alert variant="warning">
          Optional features unavailable
        </Alert>
      ) : (
        <OptionalSection data={optional} />
      )}
    </div>
  );
}
```

---

## 🎯 **ErrorFallback Component**

### **Basic Usage**

```typescript
import { ErrorFallback } from '@/components/ui/error-fallback';

// Minimal
<ErrorFallback message="Unable to load users" />

// With retry
<ErrorFallback 
  message="Unable to load users" 
  onRetry={() => refetch()}
/>

// With error details (dev only)
<ErrorFallback 
  message="Unable to load users" 
  error={error}
/>

// Compact mode (for inline errors)
<ErrorFallback 
  message="Load failed" 
  compact 
/>
```

### **Custom ErrorFallback**

```typescript
interface CustomErrorFallbackProps {
  title?: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export function CustomErrorFallback({
  title = "Something went wrong",
  message,
  actionText = "Try Again",
  onAction
}: CustomErrorFallbackProps) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{message}</p>
        {onAction && (
          <Button onClick={onAction} variant="outline">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 🚨 **ErrorBoundary Components**

### **SectionErrorBoundary**

For individual sections that can fail independently:

```typescript
<SectionErrorBoundary sectionName="User Profile">
  <UserProfile userId={id} />
</SectionErrorBoundary>

<SectionErrorBoundary sectionName="Recent Activity">
  <RecentActivity userId={id} />
</SectionErrorBoundary>
```

If UserProfile crashes, RecentActivity still works!

### **PageErrorBoundary**

For entire pages:

```typescript
<PageErrorBoundary>
  <Dashboard />
</PageErrorBoundary>
```

### **Custom ErrorBoundary**

```typescript
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CustomErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorFallback 
          message="This section encountered an error"
          error={this.state.error}
        />
      );
    }

    return this.props.children;
  }
}
```

---

## 🔄 **Data Fetching Errors**

### **React Query Pattern**

```typescript
const { data, error, isLoading, refetch } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Fetch error:', error);
      throw error;  // Let React Query handle it
    }
    
    return data;
  },
  retry: 2,  // Retry failed requests
  retryDelay: 1000,  // Wait 1s between retries
});
```

### **Manual Fetch Pattern**

```typescript
const [data, setData] = useState(null);
const [error, setError] = useState<Error | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const abortController = new AbortController();
  
  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/data', {
        signal: abortController.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const json = await response.json();
      setData(json);
      
    } catch (err) {
      if (err.name === 'AbortError') {
        return;  // Component unmounted, ignore
      }
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }
  
  fetchData();
  
  return () => {
    abortController.abort();  // Cleanup
  };
}, []);
```

---

## 📝 **Form Validation Errors**

### **Field-Level Errors**

```typescript
interface FormErrors {
  email?: string;
  password?: string;
}

const [errors, setErrors] = useState<FormErrors>({});

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Email is invalid';
  }
  
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  return errors;
}

// Display errors
<Input
  type="email"
  error={errors.email}
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && (
  <p id="email-error" className="text-sm text-destructive mt-1">
    {errors.email}
  </p>
)}
```

### **Form-Level Errors**

```typescript
async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  
  const validationErrors = validateForm(formValues);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  try {
    await submitForm(formValues);
    toast.success('Form submitted successfully!');
  } catch (error) {
    // Show error at form level
    toast.error(
      error.message || 'Failed to submit form. Please try again.'
    );
  }
}
```

---

## 🗄️ **Database Errors**

### **Supabase Error Handling**

```typescript
const { data, error } = await supabase
  .from('users')
  .insert({ name: 'John' });

if (error) {
  // Check error code for specific handling
  switch (error.code) {
    case '23505':  // Unique violation
      toast.error('User already exists');
      break;
    case '23503':  // Foreign key violation
      toast.error('Related record not found');
      break;
    case 'PGRST116':  // No rows returned
      toast.error('Record not found');
      break;
    default:
      console.error('Database error:', error);
      toast.error('Database operation failed');
  }
}
```

### **RLS Policy Errors**

```typescript
const { data, error } = await supabase
  .from('private_data')
  .select('*');

if (error) {
  if (error.code === '42501') {  // Insufficient privilege
    return <ErrorFallback 
      message="You don't have permission to view this data"
    />;
  }
  
  // Other error
  return <ErrorFallback 
    message="Unable to load data"
    error={error}
  />;
}
```

---

## 🏃 **Race Condition Prevention**

### **AbortController Pattern**

```typescript
useEffect(() => {
  const abortController = new AbortController();
  
  async function fetchData(signal: AbortSignal) {
    try {
      // Check if aborted before fetch
      if (signal.aborted) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      // Check if aborted after fetch
      if (signal.aborted) return;
      
      if (error) throw error;
      
      // Only update state if not aborted
      if (!signal.aborted) {
        setData(data);
      }
    } catch (err) {
      // Don't set error if aborted
      if (!signal.aborted) {
        setError(err);
      }
    }
  }
  
  fetchData(abortController.signal);
  
  // Cleanup: abort on unmount
  return () => {
    abortController.abort();
  };
}, [dependencies]);
```

### **useRef for Flags**

```typescript
const isFetchingRef = useRef(false);

const fetchData = useCallback(async () => {
  // Prevent concurrent fetches
  if (isFetchingRef.current) {
    return;
  }
  
  try {
    isFetchingRef.current = true;
    // ... fetch logic
  } finally {
    isFetchingRef.current = false;
  }
}, []);
```

---

## 📊 **Error Logging**

### **Console Logging Best Practices**

```typescript
// ✅ Good: Structured logging
console.error('Failed to fetch users', {
  error: error.message,
  code: error.code,
  timestamp: new Date().toISOString(),
  userId: currentUser?.id
});

// ❌ Bad: No context
console.error(error);
```

### **Production Error Tracking** (Future)

```typescript
// When we add Sentry/LogRocket:
import * as Sentry from '@sentry/react';

try {
  await riskyOperation();
} catch (error) {
  // Log to Sentry
  Sentry.captureException(error, {
    tags: {
      feature: 'user-management',
      severity: 'high'
    },
    extra: {
      userId: user.id,
      operation: 'create-user'
    }
  });
  
  // Show user-friendly error
  toast.error('Something went wrong. Our team has been notified.');
}
```

---

## 🧪 **Testing Error States**

### **Manual Testing**

```typescript
// Force error state for testing
const FORCE_ERROR = false;  // Toggle in dev

const { data, error } = useQuery({
  queryFn: async () => {
    if (FORCE_ERROR) {
      throw new Error('Forced error for testing');
    }
    return await fetchData();
  }
});
```

### **Error Simulation**

```typescript
// Create test utilities
export const TestUtils = {
  simulateNetworkError: () => {
    throw new Error('Network request failed');
  },
  
  simulateDatabaseError: () => {
    return {
      data: null,
      error: {
        code: '23505',
        message: 'duplicate key value violates unique constraint'
      }
    };
  },
  
  simulateTimeout: async (ms = 5000) => {
    await new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    );
  }
};
```

---

## 📋 **Error Handling Checklist**

When adding a new component:

```markdown
- [ ] Loading state implemented
- [ ] Error state implemented
- [ ] Empty state implemented
- [ ] Retry mechanism (if appropriate)
- [ ] Wrapped in ErrorBoundary (if data-heavy)
- [ ] AbortController cleanup (if async)
- [ ] Error logging (console.error with context)
- [ ] User-friendly error messages
- [ ] Tested error states manually
```

---

## 🎯 **Quick Reference**

| Scenario | Solution |
|----------|----------|
| Query fails | `<ErrorFallback>` |
| Component crashes | `<ErrorBoundary>` |
| Slow network | Loading state |
| Empty results | `<EmptyState>` |
| Form validation | Field-level errors |
| Permission denied | Specific error message |
| Network timeout | Retry button |
| Race condition | AbortController |

---

## 📚 **Related Documentation**

- `CONTRIBUTING.md` - Development workflow
- `LESSONS_LEARNED_POST_VITE_RECOVERY.md` - Real-world examples
- `src/components/ui/error-fallback.tsx` - ErrorFallback component
- `src/components/error-boundaries/` - ErrorBoundary components

---

**Remember:** Good error handling = Better UX = Fewer support tickets! 🎉

