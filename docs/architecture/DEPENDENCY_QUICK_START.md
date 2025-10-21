# 🚀 Dependency Health - Quick Start Guide

**TL;DR**: Your app has 7 security vulnerabilities (3 high, 4 moderate) and 32 outdated packages. Follow the steps below to fix them.

---

## ⚡ 5-Minute Quick Fix

### Step 1: Run Health Check (30 seconds)
```bash
npm run deps:health
```

This will show you:
- Security vulnerabilities
- Outdated packages
- Unused dependencies
- Overall health score

### Step 2: Fix Critical Security Issues (2 minutes)
```bash
npm run deps:fix:security
```

This will:
- Update jsPDF from 2.5.2 → 3.0.3 (fixes DoS vulnerabilities)
- Run build test
- Verify security fix

**⚠️ IMPORTANT**: Test PDF generation after this update!
- Go to Contracts page
- Generate a contract PDF
- Verify it works correctly

### Step 3: Apply Safe Updates (2 minutes)
```bash
npm run deps:update:safe
```

This will update 11 packages (only patch/minor versions - no breaking changes):
- @supabase/supabase-js
- @tanstack/react-query
- @types/node
- eslint
- framer-motion
- react-datepicker
- react-hook-form
- And 4 more...

---

## 📋 Available Commands

### Health Checks
```bash
npm run deps:check        # Show outdated packages
npm run deps:audit        # Security audit
npm run deps:health       # Full health check (recommended!)
npm run deps:unused       # Find unused dependencies
npm run deps:licenses     # Check package licenses
```

### Updates
```bash
npm run deps:update:safe  # Safe updates (patch/minor only)
npm run deps:fix:security # Fix security vulnerabilities
npm run deps:audit:fix    # Auto-fix compatible vulnerabilities
```

### Maintenance
```bash
npm run deps:clean        # Clean reinstall (fixes corruption)
```

---

## 🎯 Recommended Schedule

### Daily (Automated)
- GitHub Actions runs `npm audit` on every push
- Dependabot creates PRs for security updates

### Weekly (5 minutes)
```bash
# Monday morning routine
npm run deps:health
npm run deps:audit
# Review and merge Dependabot PRs
```

### Monthly (30 minutes)
```bash
# First Monday of the month
npm run deps:check
npm run deps:update:safe
npm run build
npm run dev
# Test critical features
git commit -m "chore(deps): monthly safe updates"
```

### Quarterly (2-3 hours)
- Review major version updates
- Plan migration for breaking changes
- Update documentation
- Run bundle size analysis

---

## 🚨 Current Critical Issues

### 1. jsPDF - HIGH SEVERITY 🔴
**Issue**: Denial of Service (DoS) vulnerability  
**Current**: 2.5.2  
**Fix**: 3.0.3  
**Command**: `npm run deps:fix:security`  
**Test**: PDF generation in Contracts page

### 2. @vercel/node - HIGH SEVERITY 🔴
**Issue**: Multiple vulnerabilities (esbuild, path-to-regexp, undici)  
**Current**: 3.2.29  
**Fix**: 5.4.0  
**Command**: `npm install @vercel/node@5.4.0`  
**Test**: API endpoints (contracts cache refresh)

### 3. Vite - MODERATE SEVERITY 🟡
**Issue**: Development server CORS bypass  
**Current**: 5.4.20  
**Fix**: 7.1.10 (major update - wait for stable)  
**Impact**: Development only, not production

---

## 📊 Current Status

| Metric | Value | Target |
|--------|-------|--------|
| **Health Score** | B (82/100) | A (95/100) |
| **Vulnerabilities** | 7 (3 high, 4 moderate) | 0 |
| **Outdated Packages** | 32 (44%) | <10 (14%) |
| **Bundle Size** | 456MB | <400MB |

---

## 🎯 This Week's Action Plan

### Monday (30 minutes)
1. ✅ Run health check: `npm run deps:health`
2. ✅ Fix jsPDF security: `npm run deps:fix:security`
3. ✅ Test PDF generation
4. ✅ Commit: `git commit -m "fix(deps): update jsPDF to 3.0.3 (security)"`

### Tuesday (15 minutes)
1. ✅ Apply safe updates: `npm run deps:update:safe`
2. ✅ Test app: `npm run dev`
3. ✅ Commit: `git commit -m "chore(deps): safe minor/patch updates"`

### Wednesday (30 minutes)
1. ✅ Fix @vercel/node: `npm install @vercel/node@5.4.0`
2. ✅ Test API endpoints
3. ✅ Commit: `git commit -m "fix(deps): update @vercel/node to 5.4.0 (security)"`

### Thursday (15 minutes)
1. ✅ Run final health check: `npm run deps:health`
2. ✅ Verify 0 high vulnerabilities
3. ✅ Update DEPENDENCY_HEALTH_REPORT.md

### Friday (Optional)
1. 📝 Review Dependabot PRs
2. 📝 Plan next month's major updates

---

## 🔧 Troubleshooting

### "Build failed after update"
```bash
# Rollback to previous version
git checkout package.json package-lock.json
npm install

# Check what changed
git diff HEAD~1 package.json
```

### "Tests failing after update"
```bash
# Clean reinstall
npm run deps:clean

# Rebuild
npm run build
```

### "Can't find module after update"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 📚 Resources

- **Full Report**: [DEPENDENCY_HEALTH_REPORT.md](./DEPENDENCY_HEALTH_REPORT.md)
- **Agent Docs**: [src/agents/dependency-health-monitor.md](./src/agents/dependency-health-monitor.md)
- **npm audit docs**: https://docs.npmjs.com/cli/v10/commands/npm-audit
- **Dependabot**: https://docs.github.com/en/code-security/dependabot

---

## 🎉 Success Criteria

After completing the action plan:
- ✅ 0 high-severity vulnerabilities
- ✅ <10 outdated packages
- ✅ Health score: A (95/100)
- ✅ All tests passing
- ✅ App running smoothly

---

**Questions?** Check the full report or run `npm run deps:health` for detailed analysis.

**Need help?** The Dependency Health Monitor agent is here to help! 🤖

