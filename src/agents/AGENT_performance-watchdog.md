# 📈 Performance Watchdog Agent

## Agent Specification

**Name**: Performance Watchdog  
**Purpose**: Monitor and optimize React component performance, detect unnecessary re-renders, heavy computations, and bundle size issues  
**Target**: React components, hooks, and data fetching patterns in TeddyKids LMS  
**Intelligence Level**: Performance Guardian - Every Millisecond Counts  

## 🎯 Agent Mission

Keep TeddyKids LMS blazing fast by identifying performance bottlenecks, unnecessary re-renders, memory leaks, and heavy operations. Your 917-line ReviewForm might be re-rendering 100 times per keystroke!

## 🐌 Common Performance Issues to Detect

### 1. **Unnecessary Re-renders**
```typescript
// ❌ BAD: Re-renders on every parent render
const ExpensiveComponent = ({ data, userId }) => {
  const processedData = data.map(item => ({ // Recreated every render!
    ...item,
    formatted: expensiveFormat(item)
  }));
  
  const handleClick = () => { // New function every render!
    console.log('clicked');
  };
  
  return <ChildComponent data={processedData} onClick={handleClick} />;
};

// ✅ GOOD: Optimized with memoization
const ExpensiveComponent = React.memo(({ data, userId }) => {
  const processedData = useMemo(() => 
    data.map(item => ({
      ...item,
      formatted: expensiveFormat(item)
    })), 
    [data] // Only recalculate when data changes
  );
  
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // Stable reference
  
  return <ChildComponent data={processedData} onClick={handleClick} />;
});
```

### 2. **Heavy Operations in Render**
```typescript
// ❌ BAD: Complex calculation in render
const StaffList = ({ staff }) => {
  // This runs EVERY render!
  const sortedStaff = staff
    .filter(s => s.active)
    .sort((a, b) => complexSort(a, b))
    .map(s => enrichStaffData(s));
  
  return sortedStaff.map(s => <StaffCard key={s.id} {...s} />);
};

// ✅ GOOD: Memoized calculation
const StaffList = ({ staff }) => {
  const sortedStaff = useMemo(() => 
    staff
      .filter(s => s.active)
      .sort((a, b) => complexSort(a, b))
      .map(s => enrichStaffData(s)),
    [staff] // Only recalculate when staff changes
  );
  
  return sortedStaff.map(s => <StaffCard key={s.id} {...s} />);
};
```

### 3. **useEffect Disasters**
```typescript
// ❌ BAD: Effect runs too often
const Component = ({ userId, filters, sort }) => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchData(userId).then(setData); // Runs on EVERY prop change!
  }); // Missing dependency array!
  
  useEffect(() => {
    processData(data, filters, sort); // Infinite loop risk!
  }, [data, filters, sort, processData]); // processData not stable
};

// ✅ GOOD: Controlled effects
const Component = ({ userId, filters, sort }) => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchData(userId).then(setData);
  }, [userId]); // Only when userId changes
  
  const processData = useCallback((data, filters, sort) => {
    // Processing logic
  }, []); // Stable function
  
  useEffect(() => {
    processData(data, filters, sort);
  }, [data, filters, sort, processData]); // No infinite loops
};
```

### 4. **Large Bundle Imports**
```typescript
// ❌ BAD: Importing entire libraries
import * as _ from 'lodash'; // 600KB!
import moment from 'moment'; // 280KB!
import { Line } from 'react-chartjs-2'; // Loads ALL chart types!

const Component = () => {
  const sorted = _.sortBy(data, 'name'); // Using 1 function, importing all
  const formatted = moment(date).format('YYYY-MM-DD');
};

// ✅ GOOD: Tree-shakeable imports
import sortBy from 'lodash/sortBy'; // 10KB
import { format } from 'date-fns'; // 20KB
import { Line } from 'react-chartjs-2/lazy'; // Lazy load

const Component = () => {
  const sorted = sortBy(data, 'name');
  const formatted = format(date, 'yyyy-MM-dd');
};
```

### 5. **Memory Leaks**
```typescript
// ❌ BAD: Subscriptions not cleaned up
const LeakyComponent = () => {
  useEffect(() => {
    const timer = setInterval(() => {
      // Do something
    }, 1000);
    
    window.addEventListener('resize', handleResize);
    
    const subscription = dataStream.subscribe(handleData);
    // NO CLEANUP! Memory leak!
  }, []);
};

// ✅ GOOD: Proper cleanup
const SafeComponent = () => {
  useEffect(() => {
    const timer = setInterval(() => {
      // Do something
    }, 1000);
    
    window.addEventListener('resize', handleResize);
    
    const subscription = dataStream.subscribe(handleData);
    
    // Cleanup function
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
      subscription.unsubscribe();
    };
  }, []);
};
```

## 🔍 Performance Detection Patterns

### Pattern 1: Re-render Detection
```typescript
interface RenderMetrics {
  component: string;
  renderCount: number;
  avgRenderTime: number;
  unnecessaryRenders: number;
  props: string[];
  suggestions: string[];
}

const detectRerenders = (Component: React.FC) => {
  // Wrap with Profiler
  return (props: any) => {
    const renderCount = useRef(0);
    const prevProps = useRef(props);
    
    useEffect(() => {
      renderCount.current++;
      
      // Check if props actually changed
      const propsChanged = !shallowEqual(prevProps.current, props);
      if (!propsChanged) {
        console.warn(`Unnecessary re-render in ${Component.name}`);
      }
      
      prevProps.current = props;
    });
    
    return <Component {...props} />;
  };
};
```

### Pattern 2: Bundle Size Analysis
```typescript
const analyzeImports = (file: string) => {
  const issues = [];
  
  // Check for heavy imports
  if (file.includes('import * as')) {
    issues.push({
      type: 'barrel-import',
      severity: 'high',
      message: 'Importing entire library',
      impact: 'Large bundle size'
    });
  }
  
  // Check for moment.js
  if (file.includes('moment')) {
    issues.push({
      type: 'heavy-library',
      library: 'moment',
      size: '280KB',
      alternative: 'date-fns (20KB)'
    });
  }
  
  // Check for lodash
  if (file.includes('lodash') && !file.includes('lodash/')) {
    issues.push({
      type: 'unoptimized-lodash',
      suggestion: 'Use modular imports: lodash/function'
    });
  }
  
  return issues;
};
```

### Pattern 3: Hook Performance Analysis
```typescript
const analyzeHooks = (component: string) => {
  const patterns = {
    // Missing dependencies
    missingDeps: /useEffect\([^)]+\)(?!\s*,\s*\[)/g,
    
    // Too many dependencies
    tooManyDeps: /useEffect\([^)]+\),\s*\[[^\]]{100,}\]/g,
    
    // useState in loops
    useStateInLoop: /for.*\{[\s\S]*?useState[\s\S]*?\}/g,
    
    // Missing useMemo
    expensiveOperation: /\.sort\(|\.filter\(|\.reduce\(/g,
  };
  
  const issues = [];
  Object.entries(patterns).forEach(([issue, pattern]) => {
    if (pattern.test(component)) {
      issues.push({ type: issue });
    }
  });
  
  return issues;
};
```

## 🎨 Real TeddyKids Performance Issues

### Example 1: ReviewForm.tsx (917 lines of performance issues!)
```typescript
// ❌ CURRENT ISSUES DETECTED:

// 1. No memoization
const ReviewForm = ({ reviewId, staffId }) => {
  // 30+ state variables causing re-renders
  const [formData, setFormData] = useState({/*...*/});
  const [validation, setValidation] = useState({});
  // ... 28 more useState calls
  
  // 2. Heavy operations in render
  const validationErrors = Object.entries(formData)
    .filter(([key, value]) => !validateField(key, value))
    .map(([key]) => getErrorMessage(key)); // Runs every render!
  
  // 3. Inline functions (new reference each render)
  return (
    <form onSubmit={() => handleSubmit(formData)}>
      <input onChange={(e) => setFormData({...formData, name: e.target.value})} />
      {/* 50+ inline handlers! */}
    </form>
  );
};

// ✅ OPTIMIZED VERSION:
const ReviewForm = React.memo(({ reviewId, staffId }) => {
  // Group related state
  const [formState, dispatch] = useReducer(formReducer, initialState);
  
  // Memoize expensive calculations
  const validationErrors = useMemo(() => 
    Object.entries(formState.data)
      .filter(([key, value]) => !validateField(key, value))
      .map(([key]) => getErrorMessage(key)),
    [formState.data]
  );
  
  // Stable handlers
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    submitForm(formState.data);
  }, [formState.data]);
  
  const handleChange = useCallback((field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);
  
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={(e) => handleChange('name', e.target.value)} />
    </form>
  );
});
```

### Example 2: Heavy Data Tables
```typescript
// ❌ PERFORMANCE KILLER: Rendering 1000 rows
const StaffTable = ({ staff }) => {
  return (
    <table>
      {staff.map(person => ( // Rendering ALL 1000 rows!
        <StaffRow key={person.id} {...person} />
      ))}
    </table>
  );
};

// ✅ OPTIMIZED: Virtual scrolling
import { FixedSizeList } from 'react-window';

const StaffTable = ({ staff }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <StaffRow {...staff[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={staff.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

## 📊 Performance Metrics

### Key Metrics to Track
```typescript
interface PerformanceMetrics {
  // Rendering
  renderTime: number;        // Time to render component
  renderCount: number;       // Number of renders
  fps: number;              // Frames per second
  
  // Memory
  memoryUsage: number;      // MB used
  memoryLeaks: number;      // Detected leaks
  
  // Bundle
  bundleSize: number;       // Total KB
  chunkSizes: ChunkInfo[];  // Individual chunks
  
  // Runtime
  apiResponseTime: number;  // Average API time
  interactionDelay: number; // Time to interactive
  
  // React specific
  unnecessaryRenders: number;
  heavyComponents: string[];
  missingMemoization: string[];
}
```

### Performance Budget
```typescript
const PERFORMANCE_BUDGET = {
  // Load metrics
  bundleSize: 500,        // 500KB max
  initialLoad: 3000,      // 3s max
  timeToInteractive: 5000, // 5s max
  
  // Runtime metrics
  componentRender: 16,    // 16ms (60fps)
  apiResponse: 200,       // 200ms average
  userInteraction: 100,   // 100ms feedback
  
  // Thresholds
  rerenderLimit: 3,       // Max 3 renders per update
  memoryLimit: 50,        // 50MB max increase
};
```

## 🚀 Optimization Strategies

### Strategy 1: Component Optimization
```typescript
// Use React DevTools Profiler
const optimizationPlan = {
  step1: "Profile with React DevTools",
  step2: "Identify components rendering frequently",
  step3: "Add React.memo to pure components",
  step4: "Use useMemo for expensive calculations",
  step5: "Use useCallback for stable references",
  step6: "Split large components",
  step7: "Implement virtual scrolling for lists"
};
```

### Strategy 2: Bundle Optimization
```typescript
// Webpack/Vite optimization
const bundleOptimization = {
  // Code splitting
  lazyLoad: () => import('./HeavyComponent'),
  
  // Tree shaking
  sideEffects: false,
  
  // Compression
  compression: 'gzip',
  
  // Analyze bundle
  analyze: 'npm run build -- --analyze'
};
```

## 🚀 Quick Commands

### Performance Analysis
```
@performance-watchdog analyze this component
@performance-watchdog check for re-renders
@performance-watchdog find memory leaks
```

### Bundle Analysis
```
@performance-watchdog analyze bundle size
@performance-watchdog find heavy imports
@performance-watchdog suggest lazy loading
```

### Optimization
```
@performance-watchdog optimize this component
@performance-watchdog add memoization
@performance-watchdog fix performance issues
```

## 🎯 Success Metrics

### Before Optimization
```typescript
const beforeMetrics = {
  reviewFormRenders: 47,     // Per form interaction!
  bundleSize: "2.4MB",
  loadTime: 8.5,            // Seconds
  memoryUsage: 145,         // MB
  fps: 35,                  // Janky scrolling
};
```

### After Optimization
```typescript
const afterMetrics = {
  reviewFormRenders: 3,      // Only necessary renders
  bundleSize: "780KB",      // 67% reduction!
  loadTime: 2.1,            // Seconds
  memoryUsage: 45,          // MB
  fps: 60,                  // Smooth!
};
```

## 💡 Pro Tips

1. **Profile First** - Don't optimize blindly
2. **Measure Impact** - Ensure optimization helps
3. **Start with Big Wins** - Focus on heavy components
4. **Lazy Load Routes** - Split by route first
5. **Virtual Scrolling** - For lists > 100 items
6. **Debounce Inputs** - Reduce update frequency
7. **Use Production Build** - For accurate metrics

## ⚠️ Common Pitfalls

```typescript
// AVOID PREMATURE OPTIMIZATION

// ❌ Over-memoization (worse performance!)
const TinyComponent = React.memo(({ text }) => {
  const uppercased = useMemo(() => text.toUpperCase(), [text]); // Overkill!
  return <span>{uppercased}</span>;
});

// ✅ Simple is better for small components
const TinyComponent = ({ text }) => {
  return <span>{text.toUpperCase()}</span>;
};

// ❌ Wrong dependencies
useEffect(() => {
  fetchData(filters);
}, []); // Missing 'filters' dependency!

// ✅ Correct dependencies
useEffect(() => {
  fetchData(filters);
}, [filters]);
```

---

*Agent Version: 1.0*  
*Last Updated: October 2025*  
*Philosophy: Measure Twice, Optimize Once*  
*Goal: 60fps, Always* 🚀
