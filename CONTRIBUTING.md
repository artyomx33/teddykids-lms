# 🤝 Contributing to TeddyKids LMS

Welcome! This guide will help you work effectively on this codebase.

---

## 🚀 **Quick Start**

### **First Time Setup**

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Generate TypeScript types from Supabase
npm run supabase:types

# 4. Start development server
npm run dev
```

**Access the app:** http://localhost:8081

---

## 📋 **Development Workflow**

### **Session Workflow (Recommended)**

Use this workflow for any development session, big or small:

#### **1. Start of Session**

```markdown
## Session Goals
- [ ] Fix [specific issue]
- [ ] Add [specific feature]
- [ ] Update [specific documentation]

## Priority
🔴 Critical | 🟡 Important | 🟢 Nice-to-have
```

Create a TODO list in your session notes or use `todo_write` tool if working with AI assistants.

#### **2. During Development**

```bash
# Create feature branch
git checkout -b fix/descriptive-name
# or
git checkout -b feat/descriptive-name

# Commit frequently (every logical unit)
git add [files]
git commit -m "type: descriptive message"

# Push incrementally
git push origin [branch-name]
```

**Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring
- `docs:` - Documentation updates
- `chore:` - Maintenance tasks
- `test:` - Test additions/updates

#### **3. Before Committing**

```bash
# Run linter
npm run lint

# Run type check
npm run type-check

# Build verification
npm run build

# Regenerate types if DB changed
npm run supabase:types
```

#### **4. End of Session**

```markdown
## Session Summary
✅ Completed:
- Item 1
- Item 2

⏳ Deferred to Next Session:
- Item A (reason: low priority)
- Item B (reason: needs more research)

📝 Notes:
- Important decisions made
- Known issues to watch
```

---

## 🎯 **Problem-Solving Framework**

### **When Things Break After an Upgrade**

1. **Identify ONE broken feature** - Don't try to fix everything at once
2. **Find the root cause** - What changed? (imports, APIs, dependencies)
3. **Search for pattern** - Use grep to find similar issues
4. **Fix systematically** - Batch-fix all instances
5. **Test incrementally** - Build after each batch
6. **Move to next issue** - Only after current is verified

### **When You're Stuck**

```markdown
## Debug Checklist
- [ ] Read the error message carefully
- [ ] Check console for additional errors
- [ ] Verify database schema matches types
- [ ] Check network tab for API errors
- [ ] Search codebase for similar patterns
- [ ] Check recent git history for changes
- [ ] Review relevant documentation
```

---

## 🛡️ **Error Handling Standards**

### **Always Provide User Feedback**

**❌ Bad:**
```typescript
if (error) {
  console.error(error);
  return [];  // User sees blank screen
}
```

**✅ Good:**
```typescript
if (error) {
  return <ErrorFallback message="Unable to load data" error={error} />;
}
```

### **Three Layers of Protection**

```typescript
// Layer 1: ErrorBoundary (catches crashes)
<SectionErrorBoundary>
  
  // Layer 2: ErrorFallback (handles query errors)
  {error && <ErrorFallback message="..." />}
  
  // Layer 3: Loading states
  {loading && <Spinner />}
  
  {data && <Content data={data} />}
  
</SectionErrorBoundary>
```

See `docs/ERROR_HANDLING_GUIDE.md` for complete patterns.

---

## 🗄️ **Database Guidelines**

### **Before Any Migration**

```bash
# 1. Backup current schema
pg_dump > backup_$(date +%Y%m%d).sql

# 2. Document what you're changing
# Create migration file with comments explaining WHY

# 3. Test locally first
npm run supabase:migrate

# 4. Regenerate types
npm run supabase:types

# 5. Update affected queries/components
```

### **Critical Architecture Rules**

⚠️ **`staff` is a VIEW, not a table!**
- ✅ Can: SELECT, JOIN, filter
- ❌ Cannot: INSERT, UPDATE, ALTER TABLE, ADD CONSTRAINT

See `docs/CRITICAL_ARCHITECTURE_STAFF_IS_VIEW.md`

### **Migration Checklist**

See `docs/DATABASE_MIGRATION_CHECKLIST.md` for complete guide.

---

## 🎨 **Component Standards**

### **Data-Heavy Components**

Every component that fetches data should have:

```typescript
export function MyComponent() {
  const { data, error, isLoading } = useQuery({...});

  // 1. Handle loading state
  if (isLoading) return <Spinner />;
  
  // 2. Handle errors
  if (error) return <ErrorFallback message="..." />;
  
  // 3. Handle empty data
  if (!data?.length) return <EmptyState />;
  
  // 4. Render actual content
  return <Content data={data} />;
}
```

### **Async Operations with Cleanup**

```typescript
useEffect(() => {
  const abortController = new AbortController();
  
  fetchData(abortController.signal);
  
  // Cleanup: prevent setState after unmount
  return () => {
    abortController.abort();
  };
}, [dependencies]);
```

---

## 📝 **Code Quality Standards**

### **Configuration Over Hard-Coding**

**❌ Bad:**
```typescript
const defaultScale = 6;  // Hard-coded in component
```

**✅ Good:**
```typescript
// src/config/app.config.ts
export const APP_DEFAULTS = {
  caoScale: 6,
  ...
};

// Component
import { APP_DEFAULTS } from '@/config/app.config';
const defaultScale = APP_DEFAULTS.caoScale;
```

### **TypeScript Strictness**

```typescript
// ❌ Bad: Optional chaining everywhere
const name = data?.user?.profile?.name;

// ✅ Good: Validate shape first
if (!data?.user?.profile) {
  return <ErrorFallback message="Invalid user data" />;
}
const { name } = data.user.profile;
```

---

## 🧪 **Testing Strategy**

### **Before Pushing**

```bash
# 1. Lint
npm run lint

# 2. Type check
npm run type-check

# 3. Build
npm run build

# 4. Visual test in browser
npm run dev
# → Test the specific feature you changed
```

### **Manual Testing Checklist**

```markdown
When you change:
- [ ] Component → Test in browser
- [ ] Database → Verify queries work
- [ ] Types → Run type-check
- [ ] Config → Test affected features
- [ ] Error handling → Trigger the error
```

---

## 📚 **Documentation Standards**

### **When to Document**

Create documentation for:
- ✅ Non-obvious architecture decisions
- ✅ Repeated mistakes (e.g., "staff is a view")
- ✅ Complex business logic
- ✅ Migration strategies
- ✅ Session learnings

### **Documentation Types**

```
docs/
├── CRITICAL_*.md        # Architecture decisions
├── LESSONS_LEARNED_*.md # Session summaries
├── *_GUIDE.md          # How-to guides
├── *_CHECKLIST.md      # Step-by-step processes
└── architecture/       # System design docs
```

---

## 🔄 **Pull Request Process**

### **Before Creating PR**

```markdown
## Pre-PR Checklist
- [ ] All commits have descriptive messages
- [ ] Build passes (`npm run build`)
- [ ] Types regenerated if DB changed
- [ ] Linter passes
- [ ] Documentation updated if needed
- [ ] PR description is comprehensive
```

### **PR Description Template**

```markdown
## 🎯 Summary
Brief description of what changed and why.

## 🚀 Changes
- Change 1
- Change 2

## 🧪 Testing
- [ ] Tested feature X
- [ ] Verified build
- [ ] No console errors

## 📝 Notes
Any important context or decisions made.

## 🔮 Deferred
Items intentionally not included (if any).
```

---

## 🚨 **Emergency Procedures**

### **If Production is Broken**

```bash
# 1. Quick rollback
git revert [commit-hash]
git push origin main

# 2. Or revert to last known good
git reset --hard [good-commit-hash]
git push --force origin main  # ⚠️ Coordinate with team first!

# 3. Hotfix branch
git checkout -b hotfix/critical-issue
# Fix, test, push, merge immediately
```

### **If Build is Broken**

```bash
# 1. Check error message
npm run build 2>&1 | tee build-error.log

# 2. Common fixes
npm run supabase:types  # Sync types
npm install            # Update dependencies
rm -rf dist && npm run build  # Clean build

# 3. If still broken, bisect
git bisect start
git bisect bad         # Current commit is broken
git bisect good [hash] # Last known working commit
# Git will help you find the breaking commit
```

---

## 🎓 **Learning Resources**

### **Internal Documentation**

- `docs/LESSONS_LEARNED_POST_VITE_RECOVERY.md` - Upgrade recovery patterns
- `docs/ERROR_HANDLING_GUIDE.md` - Error handling patterns
- `docs/DATABASE_MIGRATION_CHECKLIST.md` - Migration best practices
- `docs/CRITICAL_ARCHITECTURE_STAFF_IS_VIEW.md` - Database architecture

### **Tech Stack**

- **Frontend:** React 19, TypeScript, Vite 7, TailwindCSS
- **Backend:** Supabase (PostgreSQL), Row Level Security
- **State:** React Query (TanStack Query)
- **UI:** shadcn/ui components

---

## 💡 **Pro Tips**

### **Speed Up Development**

```bash
# Alias for common commands
alias dev="npm run dev"
alias build="npm run build"
alias types="npm run supabase:types"

# Quick context switch
git stash           # Save current work
git checkout other-branch
# Do quick fix
git checkout -      # Back to previous branch
git stash pop       # Resume work
```

### **Debugging Tips**

1. **React DevTools** - Inspect component state
2. **Network Tab** - Check API calls
3. **Console** - Use `console.table()` for arrays
4. **Supabase Studio** - Verify database queries
5. **Git Bisect** - Find when bug was introduced

---

## 🤝 **Getting Help**

### **Before Asking**

```markdown
## I tried:
- [ ] Searched codebase for similar patterns
- [ ] Checked documentation
- [ ] Read error message carefully
- [ ] Googled the error
- [ ] Checked git history

## My question:
[Clear, specific question with context]

## What I've tried:
1. Attempt 1 - Result
2. Attempt 2 - Result
```

---

## 🎯 **Success Metrics**

You're doing well when:

✅ Build time < 10 seconds  
✅ No TypeScript errors  
✅ No console errors in dev  
✅ PR reviews are quick (clear changes)  
✅ Features work on first deploy  
✅ Code is self-documenting  

---

**Happy Coding! 🚀**

Remember: Working code > Perfect code. Ship incrementally, iterate on polish!

