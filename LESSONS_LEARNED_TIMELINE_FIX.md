# 🎓 Lessons Learned: Timeline Data Fix

## 📊 What Happened: The 5 Hidden Blockers

### Issue 1: Schema Mismatch - Column Names
**What broke:** Change detector used `field_name` and `effective_date`, but DB had `field_path` and `detected_at`

**Why it happened:**
- Code was written assuming schema without verifying actual database
- No TypeScript types generated from real schema
- Schema likely changed in later migrations after change detector was written

**How it manifested:** Silent failures, 0 inserts

---

### Issue 2: Missing Required Field - `endpoint`
**What broke:** `endpoint` column is `NOT NULL` with no default, but change detector never set it

**Why it happened:**
- Incomplete schema analysis during initial development
- Column was added to schema after change detector was written
- No database validation errors surfaced properly

**How it manifested:** All inserts failed silently

---

### Issue 3: Type Mismatch - UUID vs String
**What broke:** `sync_session_id` is UUID type, but code passed `'unknown'` string

**Why it happened:**
- Default value logic (`|| 'unknown'`) didn't consider column type
- No type safety between TypeScript and PostgreSQL

**How it manifested:** `invalid input syntax for type uuid: "unknown"`

---

### Issue 4: CHECK Constraint Violation
**What broke:** Database enforced `change_type IN ('created', 'updated', 'deleted')` but code used `'salary_change'`, etc.

**Why it happened:**
- CHECK constraint existed from earlier design (generic CRUD)
- Change detector was written for newer, more specific design
- Constraint wasn't documented or discoverable

**How it manifested:** `violates check constraint "employes_changes_change_type_check"`

---

### Issue 5: Silent Error Handling
**What broke:** Change detector caught errors but didn't throw them

**Why it happened:**
```typescript
if (error) {
  console.error('Failed to insert change:', error.message);
  // Don't throw - log and continue  ← THIS WAS THE PROBLEM!
}
```

**How it manifested:** Function reported `"success": true` with `"total_changes": 0` and no visible errors

---

## 🔍 Root Cause: Schema Drift

**The Real Problem:** Schema in database ≠ Schema in code's mental model

**Why this happens in your app:**
1. Migrations run incrementally over time
2. Edge functions written at different times
3. No single source of truth for current schema
4. No automated schema sync between DB and TypeScript

---

## ✅ PREVENTION STRATEGIES (Ranked by Impact)

### 🥇 **Priority 1: Schema-First Development (CRITICAL)**

**Before writing ANY database code:**

```sql
-- ALWAYS run this FIRST to get actual schema
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'YOUR_TABLE'
ORDER BY ordinal_position;

-- Check for constraints
SELECT 
  conname,
  pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'YOUR_TABLE'::regclass;
```

**Why this works:** You code against REALITY, not assumptions

**Implementation:**
- Create `scripts/check-schema.sql` template
- ALWAYS run before writing DB code
- Save output to `schema-snapshots/table_name_YYYYMMDD.json`

---

### 🥈 **Priority 2: Supabase Type Generation (HIGH IMPACT)**

**Setup:** Generate TypeScript types from live database

```bash
# Run this after ANY migration
npx supabase gen types typescript --project-id gjlgaufihseaagzmidhc > src/types/supabase.ts
```

**Why this works:** TypeScript will catch type mismatches at compile time

**Example:**
```typescript
// Before (unsafe)
const change = {
  field_name: 'salary',  // Wrong column name - no error until runtime
  sync_session_id: 'unknown'  // Wrong type - no error until runtime
};

// After (type-safe)
import { Database } from '@/types/supabase';
type EmployesChange = Database['public']['Tables']['employes_changes']['Insert'];

const change: EmployesChange = {
  field_path: 'salary',  // ✅ Correct column name
  sync_session_id: null  // ✅ Correct type (UUID | null)
};
```

**Implementation:**
- Add to `package.json` scripts: `"types:generate": "supabase gen types typescript --project-id gjlgaufihseaagzmidhc > src/types/supabase.ts"`
- Run after every migration
- Import types in Edge Functions

---

### 🥉 **Priority 3: Fail-Fast Error Handling (MEDIUM IMPACT)**

**Never catch and swallow errors in critical paths:**

```typescript
// ❌ BAD: Silent failure
if (error) {
  console.error('Failed:', error.message);
  // continues execution - reports success with 0 results
}

// ✅ GOOD: Fail fast
if (error) {
  console.error('CRITICAL ERROR:', error);
  throw new Error(`Failed to insert: ${error.message}`);
}
```

**Why this works:** Errors surface immediately instead of cascading

**Implementation:**
- Update all Edge Functions to throw on critical errors
- Only catch for retry logic or graceful degradation
- Return detailed error responses

---

### 🏅 **Priority 4: Schema Validation in Migrations (MEDIUM IMPACT)**

**Add validation to migrations:**

```sql
-- Before making changes, verify assumptions
DO $$
BEGIN
  -- Check column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employes_changes' AND column_name = 'endpoint'
  ) THEN
    RAISE EXCEPTION 'Column endpoint does not exist! Migration assumptions invalid.';
  END IF;
  
  -- Check constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'employes_changes_change_type_check'
  ) THEN
    RAISE EXCEPTION 'Expected constraint not found! Schema has changed.';
  END IF;
END $$;
```

**Why this works:** Migrations fail early if schema is unexpected

---

### 🎖️ **Priority 5: Integration Tests (LOWER PRIORITY but valuable)**

**Test Edge Functions against real DB:**

```typescript
// tests/integration/change-detector.test.ts
describe('Change Detector', () => {
  it('should insert changes with correct schema', async () => {
    const response = await invokeEdgeFunction('employes-change-detector');
    
    expect(response.result.errors).toHaveLength(0);
    expect(response.result.total_changes).toBeGreaterThan(0);
    
    // Verify actual DB
    const { data } = await supabase
      .from('employes_changes')
      .select('*')
      .limit(1);
      
    expect(data[0]).toHaveProperty('field_path');  // Not field_name!
    expect(data[0]).toHaveProperty('endpoint');
  });
});
```

---

## 🚀 QUICK WIN CHECKLIST

### For Your Next Database Feature:

- [ ] **Step 1:** Run schema query FIRST, save output
- [ ] **Step 2:** Generate TypeScript types from DB
- [ ] **Step 3:** Write code using generated types
- [ ] **Step 4:** Add schema validation to migration
- [ ] **Step 5:** Use fail-fast error handling
- [ ] **Step 6:** Test with real data in Supabase

**Estimated time saved:** 2-4 hours per feature (vs debugging like we just did!)

---

## 📋 SPECIFIC FIXES FOR YOUR APP

### Fix 1: Create `scripts/schema-checker.sql`

```sql
-- Paste table name below and run this BEFORE writing code
\set table_name 'employes_changes'

-- Get full schema
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = :'table_name'
ORDER BY ordinal_position;

-- Get constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = (:'table_name')::regclass;

-- Get indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = :'table_name';
```

---

### Fix 2: Update Change Detector with Type Safety

```typescript
// Import generated types
import { Database } from '../../../src/types/supabase.ts';

type EmployesChange = Database['public']['Tables']['employes_changes']['Insert'];

// Use type-safe object creation
function createSalaryChange(
  employeeId: string,
  oldWage: number,
  newWage: number,
  startDate: string
): EmployesChange {
  return {
    employee_id: employeeId,
    endpoint: '/employments',
    change_type: 'salary_change',
    field_path: 'monthly_wage',
    detected_at: startDate,
    old_value: oldWage,
    new_value: newWage,
    metadata: {
      // ...
    }
  };
}
```

---

### Fix 3: Add Pre-flight Check to Edge Functions

```typescript
// At the start of change detector
async function validateSchema(supabase: any): Promise<void> {
  // Quick check that expected columns exist
  const { data, error } = await supabase
    .from('employes_changes')
    .select('id, employee_id, endpoint, field_path, detected_at')
    .limit(0);  // Don't fetch data, just validate columns
    
  if (error) {
    throw new Error(`Schema validation failed: ${error.message}`);
  }
}

// Call before processing
await validateSchema(supabase);
```

---

## 💡 THE #1 RULE GOING FORWARD

**"Never assume schema - always verify first"**

**Time to verify schema:** 2 minutes  
**Time to debug schema mismatch:** 2-4 hours  

**ROI:** 60-120x time savings! 🎯

---

## 🎯 SUMMARY

**What went wrong:**
1. Code written for assumed schema, not actual schema
2. Silent error handling hid all problems
3. No type safety between TypeScript and PostgreSQL
4. CHECK constraint from old design blocked new design
5. Missing required field wasn't caught

**How to prevent:**
1. ✅ ALWAYS query schema FIRST
2. ✅ Generate & use TypeScript types from Supabase
3. ✅ Fail fast - throw errors, don't swallow them
4. ✅ Add schema validation to migrations
5. ✅ Test against real database

**Next feature ETA:**
- ❌ Old way: 2-4 hours of debugging
- ✅ New way: 30 minutes with zero debugging

---

## 🔥 ACTION ITEMS (Do These NOW)

1. **Generate types:** `npm run types:generate` (after adding to package.json)
2. **Create schema checker:** Save `scripts/schema-checker.sql`
3. **Update change detector:** Add type imports and validation
4. **Document process:** Add to your `CODING_RULES.md`

**Winner mindset:** Spend 10 minutes on process = Save hours on debugging! 🏆

