# 📋 Dependency Health - Action Plan

**Goal**: Improve health score from B (82/100) to A (95/100)  
**Timeline**: 1 week  
**Total Effort**: ~1.5 hours

---

## Week 1: Critical Fixes (4 days)

### Day 1: Fix jsPDF Security Vulnerability
**Time**: 30 minutes  
**Priority**: 🔴 CRITICAL

#### Tasks
1. **Update jsPDF** (5 min)
   ```bash
   npm run deps:fix:security
   ```

2. **Test PDF Generation** (20 min)
   ```bash
   npm run dev
   ```
   - Navigate to Contracts page
   - Generate a contract PDF
   - Verify PDF content and formatting
   - Check all PDF-related features

3. **Commit Changes** (5 min)
   ```bash
   git add package.json package-lock.json
   git commit -m "fix(deps): update jsPDF to 3.0.3 to fix DoS vulnerability

- Fixes CVE GHSA-8mvj-3j78-4qmw (ReDoS)
- Fixes CVE GHSA-w532-jxjh-hjhj (infinite loop DoS)
- BREAKING CHANGE: jsPDF 3.0 - tested PDF generation
- Tested: Contract PDF generation works correctly"
   ```

#### Expected Outcome
- ✅ jsPDF updated to 3.0.3
- ✅ DoS vulnerabilities fixed
- ✅ PDF generation tested and working
- ✅ 2 high-severity vulnerabilities resolved

---

### Day 2: Apply Safe Updates
**Time**: 15 minutes  
**Priority**: 🟢 LOW RISK

#### Tasks
1. **Run Safe Update Script** (5 min)
   ```bash
   npm run deps:update:safe
   ```
   
   This will update 11 packages:
   - @supabase/supabase-js: 2.58.0 → 2.75.1
   - @tanstack/react-query: 5.90.2 → 5.90.5
   - @types/node: 24.6.2 → 24.8.1
   - eslint: 9.37.0 → 9.38.0
   - @eslint/js: 9.37.0 → 9.38.0
   - eslint-plugin-react-refresh: 0.4.23 → 0.4.24
   - framer-motion: 12.23.22 → 12.23.24
   - lovable-tagger: 1.1.10 → 1.1.11
   - react-datepicker: 8.7.0 → 8.8.0
   - react-hook-form: 7.64.0 → 7.65.0
   - typescript-eslint: 8.45.0 → 8.46.1

2. **Test Application** (8 min)
   ```bash
   npm run dev
   ```
   - Test data loading (React Query)
   - Test forms (react-hook-form)
   - Test date pickers
   - Test animations (framer-motion)
   - Browse through key pages

3. **Commit Changes** (2 min)
   ```bash
   git add package.json package-lock.json
   git commit -m "chore(deps): update 11 packages with safe patch/minor versions

- Update @supabase/supabase-js 2.58.0 → 2.75.1
- Update @tanstack/react-query 5.90.2 → 5.90.5
- Update eslint and related packages
- Update framer-motion, react-hook-form, react-datepicker
- All updates tested: no breaking changes
- Build and dev server: ✅ passing"
   ```

#### Expected Outcome
- ✅ 11 packages updated (no breaking changes)
- ✅ All tests passing
- ✅ Application working normally
- ✅ Outdated packages: 32 → 21

---

### Day 3: Fix @vercel/node Vulnerability
**Time**: 30 minutes  
**Priority**: 🔴 CRITICAL

#### Tasks
1. **Update @vercel/node** (5 min)
   ```bash
   npm install @vercel/node@5.4.0
   ```

2. **Test API Endpoints** (20 min)
   ```bash
   npm run build
   ```
   - Test contracts cache refresh API
   - Verify API endpoints respond correctly
   - Check for any runtime errors
   - Test edge cases

3. **Commit Changes** (5 min)
   ```bash
   git add package.json package-lock.json
   git commit -m "fix(deps): update @vercel/node to 5.4.0 to fix security vulnerabilities

- Fixes vulnerabilities in esbuild, path-to-regexp, undici
- BREAKING CHANGE: @vercel/node 3.2.29 → 5.4.0
- Tested: API endpoints working correctly
- Tested: Contracts cache refresh functioning"
   ```

#### Expected Outcome
- ✅ @vercel/node updated to 5.4.0
- ✅ Multiple vulnerabilities fixed
- ✅ API endpoints tested and working
- ✅ 1 high-severity vulnerability resolved

---

### Day 4: Verify and Report
**Time**: 15 minutes  
**Priority**: 🟢 VERIFICATION

#### Tasks
1. **Run Health Check** (5 min)
   ```bash
   npm run deps:health
   ```
   
   Expected output:
   - Security: 25/25 (was 18/25)
   - Vulnerabilities: 0 high (was 3 high)
   - Total score: 95/100 (was 82/100)
   - Grade: A (was B)

2. **Update Documentation** (5 min)
   - Update `docs/dependency-health/README.md` with new scores
   - Mark action items as complete
   - Document any issues encountered

3. **Push Branch** (5 min)
   ```bash
   git push origin chore/dependency-health-monitoring
   ```
   
   Create PR with summary:
   - Health score improvement: B (82) → A (95)
   - Vulnerabilities fixed: 7 → 0 high-severity
   - Packages updated: 12 total
   - Time invested: 1.5 hours

#### Expected Outcome
- ✅ Health score: A (95/100)
- ✅ 0 high-severity vulnerabilities
- ✅ Documentation updated
- ✅ PR ready for review

---

## Week 2: Automation Setup (Optional)

### Setup Dependabot
**Time**: 30 minutes

Create `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    groups:
      patch-updates:
        patterns: ["*"]
        update-types: ["patch"]
      minor-updates:
        patterns: ["*"]
        update-types: ["minor"]
    labels:
      - "dependencies"
      - "automated"
    reviewers:
      - "artyomx"
```

### Setup CI/CD Security Checks
**Time**: 20 minutes

Add to `.github/workflows/security.yml`:
```yaml
name: Security Audit
on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 9 * * 1' # Monday 9am

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm audit --audit-level=moderate
      - run: npm outdated || true
```

---

## Month 2: Major Updates Planning

### React 19 Migration
**Time**: 2-3 days  
**Status**: Research phase

#### Blockers
- Need to verify all UI libraries support React 19
- Breaking changes in concurrent features
- New hooks API

#### Plan
1. Research breaking changes (2 hours)
2. Test in separate branch (1 day)
3. Update codebase (1-2 days)
4. Thorough testing (4 hours)

### Vite 7 Migration
**Time**: 1 day  
**Status**: Wait for stable release

#### Blockers
- Vite 7 still in beta
- Plugin ecosystem needs to catch up

#### Plan
1. Wait for stable release
2. Review migration guide
3. Update vite.config.ts
4. Test dev server and builds
5. Update plugins

---

## Success Criteria

### Week 1 Goals (Must Have)
- ✅ Health score: A (95/100)
- ✅ 0 high-severity vulnerabilities
- ✅ jsPDF updated and tested
- ✅ @vercel/node updated and tested
- ✅ 11 safe updates applied
- ✅ All tests passing

### Week 2 Goals (Should Have)
- ⏳ Dependabot configured
- ⏳ CI/CD security checks added
- ⏳ Team trained on process
- ⏳ Documentation complete

### Long-term Goals (Nice to Have)
- ⏳ React 19 migration planned
- ⏳ Vite 7 migration planned
- ⏳ Maintain A grade score
- ⏳ Automated dependency updates

---

## Risk Mitigation

### If jsPDF Update Breaks PDF Generation
1. Check jsPDF 3.0 changelog for breaking changes
2. Review `src/lib/contracts.ts` for API changes
3. Test with different contract types
4. If critical, rollback: `npm install jsPDF@2.5.2`
5. Document issue for later fix

### If @vercel/node Update Breaks API
1. Check @vercel/node 5.0 changelog
2. Review `api/db/refresh-contracts-cache.ts`
3. Test API endpoints manually
4. Check Vercel deployment logs
5. If critical, rollback: `npm install @vercel/node@3.2.29`
6. Keep vulnerability documented

### If Safe Updates Cause Issues
1. Review `package-lock.json` diff
2. Identify which package caused issue
3. Rollback specific package
4. Document incompatibility
5. Update in separate PR later

---

## Checklist

### Pre-Flight
- [ ] On correct branch: `chore/dependency-health-monitoring`
- [ ] Clean working directory
- [ ] All scripts executable: `chmod +x scripts/deps-*.sh`
- [ ] npm scripts added to package.json

### Day 1
- [ ] Run `npm run deps:fix:security`
- [ ] Test PDF generation
- [ ] Verify no errors in console
- [ ] Commit changes

### Day 2
- [ ] Run `npm run deps:update:safe`
- [ ] Test application thoroughly
- [ ] Run `npm run build`
- [ ] Commit changes

### Day 3
- [ ] Update @vercel/node
- [ ] Test API endpoints
- [ ] Verify no errors
- [ ] Commit changes

### Day 4
- [ ] Run `npm run deps:health`
- [ ] Verify A grade
- [ ] Update documentation
- [ ] Push branch and create PR

---

**Ready to start?** Begin with Day 1: `npm run deps:fix:security`

