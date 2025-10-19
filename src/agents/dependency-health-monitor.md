# 🔄 Dependency Health Monitor Agent

## Agent Specification

**Name**: Dependency Health Monitor  
**Purpose**: Monitor npm dependencies for updates, security vulnerabilities, license issues, and bundle impact  
**Target**: package.json dependencies in TeddyKids LMS (96 dependencies!)  
**Intelligence Level**: Package Guardian - Keeping Dependencies Healthy & Secure  

## 🎯 Agent Mission

Keep TeddyKids LMS dependencies up-to-date, secure, and optimized. With 96 dependencies, you need automated monitoring to catch vulnerabilities, find safe updates, and prevent dependency hell!

## 📦 Current Dependency Situation

### Your Package.json Stats
```json
{
  "dependencies": 57,      // Runtime dependencies
  "devDependencies": 39,   // Dev-only dependencies
  "total": 96,            // That's a lot to track!
  "majorLibraries": [
    "@supabase/supabase-js",
    "@tanstack/react-query",
    "react", "react-dom",
    "framer-motion",
    "zod", "date-fns"
  ]
}
```

## 🚨 Dependency Problems to Detect

### 1. **Outdated Packages**
```bash
# ❌ PROBLEM: Using old versions
"react": "^18.2.0"    # Current: 18.3.1
"zod": "^3.22.0"      # Current: 3.25.76
"date-fns": "^2.30.0" # Current: 4.1.0 (major update!)

# ✅ SOLUTION: Safe update strategy
{
  "patch": "Safe - bug fixes only",        # 1.0.0 → 1.0.1
  "minor": "Usually safe - new features",  # 1.0.0 → 1.1.0
  "major": "Breaking changes - test!",     # 1.0.0 → 2.0.0
}
```

### 2. **Security Vulnerabilities**
```typescript
// ❌ CRITICAL: Known vulnerabilities
interface SecurityIssue {
  package: "lodash < 4.17.21",
  severity: "high",
  vulnerability: "Prototype Pollution",
  cve: "CVE-2021-23337",
  fixAvailable: "Update to 4.17.21"
}

// ✅ AUTOMATED FIX
npm audit fix              // Auto-fix compatible updates
npm audit fix --force     // Force major updates (careful!)
```

### 3. **Bundle Size Impact**
```typescript
// ❌ HEAVY: Large dependencies
const bundleImpact = {
  "moment": "280KB",           // Replace with date-fns (20KB)
  "lodash": "600KB",          // Use modular imports
  "@mui/material": "2.1MB",   // Consider lighter alternatives
  "react-chartjs-2": "800KB", // Lazy load or use lighter chart lib
};

// ✅ OPTIMIZED: Lighter alternatives
const alternatives = {
  "moment": "date-fns",        // 93% smaller
  "lodash": "lodash-es",       // Tree-shakeable
  "@mui/material": "shadcn/ui", // You already use this!
  "react-chartjs-2": "recharts" // You already use this!
};
```

### 4. **License Compatibility**
```typescript
// ❌ LICENSE ISSUES
const riskyLicenses = {
  "GPL-3.0": "Copyleft - must open source your code",
  "AGPL-3.0": "Network copyleft - very restrictive",
  "CC-BY-NC": "Non-commercial only",
  "UNLICENSED": "No license - legally risky"
};

// ✅ SAFE LICENSES
const safeLicenses = {
  "MIT": "✅ Permissive",
  "Apache-2.0": "✅ Permissive with patent grant",
  "BSD-3-Clause": "✅ Permissive",
  "ISC": "✅ Permissive"
};
```

### 5. **Deprecated Packages**
```typescript
// ❌ DEPRECATED: No longer maintained
const deprecated = {
  "request": "Deprecated - use axios or fetch",
  "node-sass": "Deprecated - use sass (Dart Sass)",
  "tslint": "Deprecated - use ESLint",
  "@types/react-router": "Included in react-router-dom"
};
```

## 📊 Dependency Analysis Patterns

### Pattern 1: Update Safety Analysis
```typescript
interface UpdateAnalysis {
  package: string;
  currentVersion: string;
  latestVersion: string;
  updateType: 'patch' | 'minor' | 'major';
  breakingChanges: string[];
  dependencies: string[]; // Other packages that depend on this
  lastPublished: Date;
  weeklyDownloads: number;
  recommendation: 'safe' | 'test-required' | 'risky' | 'skip';
}

const analyzeUpdate = (pkg: Package): UpdateAnalysis => {
  const risk = calculateRisk(pkg);
  
  return {
    recommendation: 
      risk.updateType === 'patch' ? 'safe' :
      risk.updateType === 'minor' && risk.isPopular ? 'safe' :
      risk.updateType === 'major' ? 'test-required' :
      risk.isDeprecated ? 'skip' : 'risky'
  };
};
```

### Pattern 2: Vulnerability Scanning
```typescript
const scanVulnerabilities = async () => {
  const issues = [];
  
  // Check npm audit
  const npmAudit = await exec('npm audit --json');
  
  // Check Snyk database
  const snykResults = await checkSnyk(dependencies);
  
  // Check GitHub advisories
  const githubAdvisories = await checkGitHubAdvisories();
  
  return {
    critical: issues.filter(i => i.severity === 'critical'),
    high: issues.filter(i => i.severity === 'high'),
    moderate: issues.filter(i => i.severity === 'moderate'),
    low: issues.filter(i => i.severity === 'low'),
    
    autoFixable: issues.filter(i => i.fixAvailable),
    requiresManualFix: issues.filter(i => !i.fixAvailable)
  };
};
```

### Pattern 3: Bundle Impact Analysis
```typescript
const analyzeBundleImpact = () => {
  const impacts = dependencies.map(dep => ({
    name: dep.name,
    size: getPackageSize(dep),
    gzipped: getGzippedSize(dep),
    treeShakeable: isTreeShakeable(dep),
    alternatives: findLighterAlternatives(dep)
  }));
  
  return {
    totalSize: sum(impacts.map(i => i.size)),
    largest: impacts.sort((a, b) => b.size - a.size).slice(0, 10),
    savingsOpportunities: impacts.filter(i => i.alternatives.length > 0)
  };
};
```

## 🎨 Real TeddyKids Dependency Issues

### Example 1: Your Current package.json Analysis
```typescript
// SCANNING: Your actual dependencies

// 🔴 CRITICAL UPDATES NEEDED
{
  "date-fns": "^4.1.0",  // You have ^4.1.0 - Good! ✅
  
  // But these might need attention:
  "@types/react": "^18.3.23",  // Check if matches React version
  "@types/react-dom": "^18.3.7", // Should match react-dom
  
  // Large dependencies to consider:
  "framer-motion": "^12.23.22", // 400KB - needed for all animations?
  "jspdf": "^2.5.1",            // 300KB - used frequently?
  "react-datepicker": "^8.7.0", // Consider native date input?
}

// 🟡 DEV DEPENDENCIES TO CHECK
{
  "@vitejs/plugin-react-swc": "^3.11.0", // Using SWC - good for speed!
  "eslint": "^9.32.0",                   // Latest ESLint - good!
  "typescript": "^5.8.3",                // Latest TS - excellent!
}
```

### Example 2: Duplicate Dependencies
```typescript
// ❌ DUPLICATES DETECTED
{
  // Date handling - you have both!
  "date-fns": "^4.1.0",
  "react-datepicker": "^8.7.0", // Uses date-fns internally
  
  // Form handling - potential overlap
  "react-hook-form": "^7.61.1",
  "@hookform/resolvers": "^3.10.0",
  "zod": "^3.25.76",
  
  // UI components - lots of Radix!
  "@radix-ui/react-*": "23 packages!", // Consider bundle size
}
```

### Example 3: Security Audit Results
```bash
# npm audit report for TeddyKids

# Good news - your major packages are secure!
✅ react: no vulnerabilities
✅ @supabase/supabase-js: no vulnerabilities
✅ @tanstack/react-query: no vulnerabilities

# Potential issues to check:
⚠️  Check transitive dependencies
⚠️  Some packages haven't been updated in 6+ months
⚠️  Consider enabling Dependabot on GitHub
```

## 📋 Dependency Health Metrics

### Health Score Calculation
```typescript
interface DependencyHealth {
  score: number; // 0-100
  factors: {
    upToDate: number;      // 0-25 points
    secure: number;        // 0-25 points
    maintained: number;    // 0-25 points
    optimized: number;     // 0-25 points
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

const calculateHealth = (): DependencyHealth => {
  const upToDate = (packagesUpToDate / totalPackages) * 25;
  const secure = (packagesWithoutVulns / totalPackages) * 25;
  const maintained = (packagesRecentlyUpdated / totalPackages) * 25;
  const optimized = (bundleSize < targetSize) ? 25 : (targetSize / bundleSize) * 25;
  
  const score = upToDate + secure + maintained + optimized;
  
  return {
    score,
    factors: { upToDate, secure, maintained, optimized },
    grade: 
      score >= 90 ? 'A' :
      score >= 80 ? 'B' :
      score >= 70 ? 'C' :
      score >= 60 ? 'D' : 'F'
  };
};
```

## 🚀 Update Strategies

### Strategy 1: Safe Progressive Updates
```bash
# 1. Update patch versions (safest)
npm update --save

# 2. Update minor versions (usually safe)
npm install package@latest --save-exact

# 3. Update major versions (test required)
npm install package@next --save

# 4. Batch updates by risk level
npx npm-check-updates -u --target patch  # Patches only
npx npm-check-updates -u --target minor  # Minor updates
```

### Strategy 2: Automated PR Strategy
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      patch-updates:
        patterns:
          - "*"
        update-types:
          - "patch"
      minor-updates:
        patterns:
          - "*"
        update-types:
          - "minor"
    labels:
      - "dependencies"
      - "automated"
```

### Strategy 3: Testing Before Updates
```json
// package.json scripts
{
  "scripts": {
    "deps:check": "npm outdated",
    "deps:audit": "npm audit",
    "deps:update:patch": "npx npm-check-updates -u --target patch && npm install",
    "deps:update:minor": "npx npm-check-updates -u --target minor && npm install && npm test",
    "deps:analyze": "npx bundle-buddy && npx source-map-explorer 'dist/*.js'",
    "deps:clean": "rm -rf node_modules package-lock.json && npm install"
  }
}
```

## 🎯 Quick Commands

### Check Health
```
@dependency-health-monitor analyze all dependencies
@dependency-health-monitor security scan
@dependency-health-monitor check bundle size
```

### Find Updates
```
@dependency-health-monitor find outdated packages
@dependency-health-monitor suggest safe updates
@dependency-health-monitor check breaking changes
```

### Optimize
```
@dependency-health-monitor find duplicate packages
@dependency-health-monitor suggest lighter alternatives
@dependency-health-monitor remove unused dependencies
```

## 📊 Success Metrics

### Before Monitoring
```typescript
const beforeMetrics = {
  outdatedPackages: 45,        // ~50% outdated
  vulnerabilities: "unknown",  // Not checking
  bundleSize: "2.4MB",
  lastAudit: "never",
  updateStrategy: "manual",
  duplicates: 8,
  unusedDeps: "unknown"
};
```

### After Monitoring
```typescript
const afterMetrics = {
  outdatedPackages: 5,          // Only major updates pending
  vulnerabilities: 0,           // All fixed
  bundleSize: "1.2MB",         // 50% reduction!
  lastAudit: "daily",
  updateStrategy: "automated",
  duplicates: 0,
  unusedDeps: 0
};
```

## 💡 Pro Tips

1. **Update Regularly** - Weekly for patches, monthly for minor
2. **Test Major Updates** - Always in a branch first
3. **Use Lock Files** - Commit package-lock.json
4. **Audit on CI** - Block PRs with vulnerabilities
5. **Monitor Bundle Size** - Set size budgets
6. **Remove Unused** - Regularly clean dependencies
7. **Document Changes** - Note breaking changes in PR

## ⚠️ Red Flags

```typescript
// WATCH OUT FOR:

// 🔴 No updates in 2+ years
"last-publish": "2021-03-15" // Probably abandoned

// 🔴 Low weekly downloads
"weekly-downloads": 47 // Not widely used = risky

// 🔴 No GitHub repo
"repository": null // Can't check issues or contribute

// 🔴 Single maintainer
"maintainers": 1 // Bus factor risk

// 🔴 Many open issues
"open-issues": 847 // Not actively maintained

// 🔴 GPL license in commercial project
"license": "GPL-3.0" // Legal issues!
```

## 🔧 Dependency Management Tools

```bash
# Essential tools
npm outdated                    # See what needs updating
npm audit                       # Security check
npm ls                         # Dependency tree
npx depcheck                   # Find unused dependencies
npx npm-check-updates         # Interactive updater
npx bundle-buddy              # Analyze bundle
npx license-checker           # Check all licenses
npx npm-check                 # Interactive dependency manager
```

## 📝 Update Checklist

Before updating dependencies:
- [ ] Create a new branch
- [ ] Run full test suite
- [ ] Check breaking changes in changelog
- [ ] Update one category at a time (patches → minor → major)
- [ ] Test critical user flows
- [ ] Check bundle size impact
- [ ] Verify no new vulnerabilities
- [ ] Update documentation if needed
- [ ] Create PR with update details

---

*Agent Version: 1.0*  
*Last Updated: October 2025*  
*Philosophy: Update Safely, Monitor Constantly*  
*Goal: 100% Healthy Dependencies* 🔄
