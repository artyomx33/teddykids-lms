# 🧹 Dead Code Detector Agent

## Agent Specification

**Name**: Dead Code Detector  
**Purpose**: Identify and eliminate unused code, imports, functions, components, and dependencies from TeddyKids LMS  
**Target**: TypeScript/React files, identifying code that's written but never executed  
**Intelligence Level**: Code Janitor - Spring Cleaning for Your Codebase  

## 🎯 Agent Mission

Find and eliminate dead code that's cluttering your codebase. After refactoring those 900+ line components, there's guaranteed to be unused imports, orphaned functions, and forgotten components. This agent finds them all!

## 🧟 Types of Dead Code to Detect

### 1. **Unused Imports**
```typescript
// ❌ DEAD: Imported but never used
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { validateEmail } from '@/utils/validators'; // Never called!

// Component only uses useState
const MyComponent = () => {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
};
```

### 2. **Unused Variables & Functions**
```typescript
// ❌ DEAD: Declared but never used
const API_KEY = 'sk-1234567890'; // Never referenced
const OLD_ENDPOINT = '/api/v1/users'; // Replaced but not removed

function calculateLegacyScore(data: any) { // Never called!
  return data.score * 1.5;
}

const Component = () => {
  const unused = "This is never used"; // DEAD
  const used = "This is rendered";
  
  return <div>{used}</div>;
};
```

### 3. **Unreachable Code**
```typescript
// ❌ DEAD: Code after return/throw
function processData(data: any) {
  if (!data) {
    throw new Error('No data');
    console.log('This never runs'); // DEAD CODE!
  }
  
  return data;
  
  // Everything below is dead
  const transformed = data.map(/*...*/); // DEAD
  return transformed; // DEAD
}

// ❌ DEAD: Impossible conditions
if (status === 'active' && status === 'inactive') {
  // This block never executes
  doSomething();
}
```

### 4. **Unused Components**
```typescript
// ❌ DEAD: Component never imported anywhere
// File: components/OldUserCard.tsx
export const OldUserCard = () => { // Never imported!
  return <div>Old implementation</div>;
};

// File: components/LegacyDashboard.tsx
const LegacyDashboard = () => { // Replaced by new dashboard
  return <div>Old dashboard</div>;
};
```

### 5. **Commented-Out Code**
```typescript
// ❌ DEAD: Old code in comments
const Component = () => {
  // const oldLogic = processOldWay(data);
  // if (oldLogic) {
  //   return <OldComponent data={oldLogic} />;
  // }
  
  const newLogic = processNewWay(data);
  return <NewComponent data={newLogic} />;
};
```

### 6. **Unused Type Definitions**
```typescript
// ❌ DEAD: Types/interfaces never used
interface OldUserType { // Never used!
  id: number;
  username: string;
}

type LegacyResponse = { // Replaced but not removed
  success: boolean;
  data: any;
};

// Only this is used
interface User {
  id: string;
  email: string;
}
```

## 🔍 Detection Patterns

### Pattern 1: Import Analysis
```typescript
const detectUnusedImports = (file: SourceFile) => {
  const imports = extractImports(file);
  const usage = new Set<string>();
  
  // Scan file for usage
  traverse(file, {
    Identifier(node) {
      usage.add(node.name);
    },
    JSXIdentifier(node) {
      usage.add(node.name);
    }
  });
  
  // Find unused
  return imports.filter(imp => !usage.has(imp.name));
};
```

### Pattern 2: Export Analysis
```typescript
const findUnusedExports = () => {
  const exports = getAllExports();
  const imports = getAllImports();
  
  const unused = exports.filter(exp => {
    return !imports.some(imp => imp.source === exp.file);
  });
  
  return unused;
};
```

### Pattern 3: Dead Code Patterns
```typescript
const DEAD_CODE_PATTERNS = {
  // After return/throw
  afterReturn: /return[\s\S]*?\n\s+\w+/g,
  afterThrow: /throw[\s\S]*?\n\s+\w+/g,
  
  // Commented code blocks
  commentedCode: /^\s*\/\/.*[{;}]\s*$/gm,
  blockComments: /\/\*[\s\S]*?\*\//g,
  
  // Console logs (production)
  consoleLogs: /console\.(log|debug|info)/g,
  
  // TODO comments (old)
  oldTodos: /\/\/\s*(TODO|FIXME|HACK).*\d{4}/g,
  
  // Unused catch blocks
  emptyCatch: /catch\s*\([^)]*\)\s*{\s*}/g
};
```

## 🎨 Real Examples from TeddyKids

### Example 1: ReviewForm.tsx (917 lines!)
```typescript
// BEFORE: Lots of dead code after refactoring
import { 
  useState, useEffect, useCallback, useMemo, // Only useState used
  useRef, useContext, useReducer // None of these used!
} from 'react';

import { OldReviewCard } from './OldReviewCard'; // Never used
import { validateReview } from '@/utils/old-validators'; // Replaced

const ReviewForm = () => {
  const [formData, setFormData] = useState({});
  
  // Dead function - using new validation
  const oldValidate = (data) => { // DEAD!
    return validateReview(data);
  };
  
  // Dead variable
  const LEGACY_ENDPOINT = '/api/v1/reviews'; // DEAD!
  
  // ... 900 more lines
};

// AFTER: Clean!
import { useState } from 'react';

const ReviewForm = () => {
  const [formData, setFormData] = useState({});
  // Only living code remains
};
```

### Example 2: Unused Utility Functions
```typescript
// utils/helpers.ts
// DETECTION: These are never imported anywhere

export function formatOldDate(date: Date) { // DEAD - replaced by date-fns
  return date.toLocaleDateString();
}

export function legacyCalculation(value: number) { // DEAD - old business logic
  return value * 1.25;
}

export function debugLog(message: string) { // DEAD - using proper logger now
  console.log(`[DEBUG]: ${message}`);
}
```

### Example 3: Orphaned Components
```typescript
// SCAN RESULTS: These components are never imported

components/
├── StaffCard.tsx ✅ (used in 5 files)
├── OldStaffCard.tsx ❌ (DEAD - 0 imports)
├── LegacyDashboard.tsx ❌ (DEAD - 0 imports)
├── ReviewFormV1.tsx ❌ (DEAD - replaced by ReviewForm)
├── UnusedModal.tsx ❌ (DEAD - 0 imports)
```

## 📊 Detection Strategy

### Step 1: Build Dependency Graph
```typescript
interface DependencyGraph {
  files: Map<string, FileNode>;
  imports: Map<string, Set<string>>;
  exports: Map<string, Set<string>>;
  usage: Map<string, UsageInfo>;
}

const buildGraph = async () => {
  const files = await glob('src/**/*.{ts,tsx}');
  const graph = new DependencyGraph();
  
  for (const file of files) {
    const ast = parse(file);
    graph.addFile(file, ast);
    graph.addImports(file, extractImports(ast));
    graph.addExports(file, extractExports(ast));
  }
  
  return graph;
};
```

### Step 2: Mark & Sweep Algorithm
```typescript
const markAndSweep = (graph: DependencyGraph) => {
  // Mark phase - start from entry points
  const marked = new Set<string>();
  const entryPoints = ['src/main.tsx', 'src/App.tsx'];
  
  const mark = (file: string) => {
    if (marked.has(file)) return;
    marked.add(file);
    
    const imports = graph.imports.get(file);
    imports?.forEach(imp => mark(imp));
  };
  
  entryPoints.forEach(mark);
  
  // Sweep phase - find unmarked
  const dead = [];
  for (const file of graph.files.keys()) {
    if (!marked.has(file)) {
      dead.push(file);
    }
  }
  
  return dead;
};
```

## 🧹 Cleanup Actions

### Safe Removal
```typescript
// SAFE: Remove with confidence
- Unused imports
- Unused type definitions  
- Console.logs
- Empty catch blocks
- Commented-out code (> 3 months old)

// CAUTION: Review before removing
- Unused exports (might be public API)
- Event handlers (might be used dynamically)
- Config constants (might be environment-specific)
```

### Auto-Fix Examples
```typescript
// Remove unused imports
function removeUnusedImports(code: string, unused: string[]) {
  unused.forEach(imp => {
    // Remove from import statement
    code = code.replace(
      new RegExp(`\\b${imp}\\b,?\\s*`, 'g'),
      ''
    );
  });
  
  // Clean up empty imports
  code = code.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];?\n/g, '');
  
  return code;
}
```

## 📋 Detection Report Format

```typescript
interface DeadCodeReport {
  summary: {
    totalFiles: number;
    filesWithDeadCode: number;
    totalDeadLines: number;
    estimatedBundleReduction: string; // "~52KB"
  };
  
  byType: {
    unusedImports: number;
    unusedExports: number;
    unusedVariables: number;
    unusedFunctions: number;
    unreachableCode: number;
    commentedCode: number;
  };
  
  files: Array<{
    path: string;
    issues: Array<{
      type: string;
      line: number;
      code: string;
      suggestion: string;
    }>;
  }>;
  
  safeToDelete: string[]; // Files that can be completely removed
}
```

## 🚀 Quick Commands

### Full Scan
```
@dead-code-detector scan entire project
```

### Specific File
```
@dead-code-detector check this file for dead code
```

### Auto-Clean Imports
```
@dead-code-detector clean unused imports
```

### Find Orphaned Files
```
@dead-code-detector find files with zero imports
```

### Remove Old Comments
```
@dead-code-detector remove commented code older than 3 months
```

## 🎯 Success Metrics

### Before Cleaning
```typescript
const beforeMetrics = {
  bundleSize: "2.4MB",
  unusedImports: 450,
  deadFunctions: 67,
  orphanedFiles: 23,
  commentedLines: 1200
};
```

### After Cleaning
```typescript
const afterMetrics = {
  bundleSize: "1.9MB", // 500KB saved!
  unusedImports: 0,
  deadFunctions: 0,
  orphanedFiles: 0,
  commentedLines: 50 // Only recent TODOs
};
```

## 💡 Pro Tips

1. **Start with imports** - Easiest and safest to clean
2. **Use version control** - Commit before big cleanups
3. **Keep recent comments** - They might be WIP
4. **Check dynamic imports** - Some code loads dynamically
5. **Test after cleanup** - Ensure nothing broke
6. **Regular maintenance** - Run weekly to prevent buildup
7. **Document exceptions** - Mark intentionally unused code

## ⚠️ False Positives to Watch For

```typescript
// These might look dead but aren't:

// 1. Dynamic imports
const componentMap = {
  dashboard: () => import('./Dashboard'), // Looks unused
};

// 2. Event handlers in JSX
<button onClick={handleClick}> // handleClick might seem unused

// 3. Module side effects
import './styles.css'; // No named import but needed

// 4. Test utilities
export const testHelper = () => {}; // Only used in tests

// 5. Public API exports
export { SomeUtil }; // Part of library API
```

---

*Agent Version: 1.0*  
*Last Updated: October 2025*  
*Philosophy: If It's Not Used, Lose It!*  
*Warning: Always backup before bulk deletion* 🧹
