# 🤖 Claude Development Setup

## Quick Commands

### Database Operations
```bash
npm run db:push          # Push migrations to Supabase
npm run db:pull          # Pull schema from Supabase
npm run db:reset         # Reset database to migrations
npm run db:inspect staff # Inspect table structure
npm run db:peek staff 10 # Peek at table data
npm run db:query "SELECT COUNT(*) FROM staff"
```

### Development Helpers
```bash
npm run claude:helpers   # Load Claude helper functions
node claude-helpers.js   # Direct helper access
```

## Live Editing Capabilities

### 🔥 GitHub Integration
- ✅ Create commits & pull requests
- ✅ Push/pull code changes
- ✅ Branch management
- ✅ Live file editing

### ⚡ Supabase Integration
- ✅ Service role access (full admin)
- ✅ Direct SQL execution
- ✅ Schema modifications
- ✅ Live data operations
- ✅ RLS policy management

## Helper Functions

```javascript
import * as h from './claude-helpers.js'

// Quick database queries
await h.quickQuery('SELECT * FROM staff LIMIT 5')

// Inspect table structure
await h.inspectTable('staff')

// Peek at data
await h.peekData('staff', 10)

// Refresh PostgREST schema cache
await h.refreshSchema()
```

## Environment Setup

- ✅ Service role key configured
- ✅ GitHub repository access
- ✅ Supabase project linked
- ✅ Development scripts ready

## What We Can Do Live

1. **Code Changes** → Instant GitHub commits
2. **Database Changes** → Direct Supabase execution
3. **Schema Updates** → Real-time modifications
4. **Bug Fixes** → Immediate deployment
5. **Feature Development** → Live iteration

Ready for rapid development! 🚀