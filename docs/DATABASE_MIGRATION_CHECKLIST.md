# 🗄️ Database Migration Checklist

**Step-by-step guide for safe database migrations**

---

## 🎯 **Quick Start**

### **Before ANY Migration**

```markdown
## Pre-Migration Checklist
- [ ] Understand what you're changing and WHY
- [ ] Document the reason in migration comments
- [ ] Backup current database
- [ ] Test locally first
- [ ] Have rollback plan ready
```

---

## 📋 **Migration Process**

### **Phase 1: Planning & Preparation**

#### **1.1 Document the Change**

```markdown
## Migration Purpose
**What:** Adding cao_salary_scales table
**Why:** Need metadata for CAO scales 2-12
**Impact:** New table, no breaking changes to existing data
**Rollback:** DROP TABLE cao_salary_scales
```

#### **1.2 Backup Database**

```bash
# Local backup
pg_dump teddykids_lms > backup_$(date +%Y%m%d_%H%M%S).sql

# Supabase backup
# Go to Supabase Dashboard → Database → Backups → Create backup

# Or export via SQL
SELECT * FROM important_table
INTO OUTFILE '/tmp/backup_important_table.csv';
```

#### **1.3 Identify Affected Areas**

```markdown
## Impact Analysis
**Tables affected:**
- cao_salary_history (adding column)

**Views affected:**
- staff (references cao data)

**Functions affected:**
- get_cao_salary()
- calculate_salary()

**Code affected:**
- src/components/cao/CaoSelector.tsx
- src/lib/CaoService.ts

**RLS policies affected:**
- cao_salary_history policies
```

---

### **Phase 2: Create Migration**

#### **2.1 Migration File Naming**

```bash
# Format: YYYYMMDDHHMMSS_descriptive_name.sql
20251025120000_add_cao_salary_scales.sql
20251025130000_update_staff_view.sql
20251025140000_fix_rls_policies.sql
```

#### **2.2 Migration Template**

```sql
-- Migration: [Descriptive Title]
-- Created: YYYY-MM-DD
-- Author: [Your Name]
-- Purpose: [Why this migration exists]
-- Related: [PR #, Issue #, or Context]

-- ============================================
-- PRE-FLIGHT CHECKS
-- ============================================

-- Check current state
SELECT COUNT(*) as existing_records FROM my_table;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'my_table';

-- ============================================
-- MIGRATION START
-- ============================================

BEGIN;

-- Step 1: Create new table/column
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE new_table IS 'Purpose of this table and when it was added';

-- Step 2: Add indexes
CREATE INDEX IF NOT EXISTS idx_new_table_name 
ON new_table(name);

-- Step 3: Migrate existing data (if applicable)
INSERT INTO new_table (id, name)
SELECT id, old_name 
FROM old_table
ON CONFLICT (id) DO NOTHING;

-- Step 4: Update dependent views/functions
CREATE OR REPLACE VIEW my_view AS
SELECT * FROM new_table WHERE active = true;

-- Step 5: Update RLS policies
DROP POLICY IF EXISTS old_policy ON new_table;
CREATE POLICY new_policy ON new_table
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify data migrated correctly
SELECT 
  COUNT(*) as new_count,
  (SELECT COUNT(*) FROM old_table) as old_count;

-- Check for orphaned data
SELECT * FROM new_table 
WHERE id NOT IN (SELECT id FROM old_table);

COMMIT;

-- ============================================
-- ROLLBACK SCRIPT (Keep commented)
-- ============================================

/*
BEGIN;
DROP TABLE IF EXISTS new_table CASCADE;
-- Restore old state if needed
COMMIT;
*/
```

---

### **Phase 3: Local Testing**

#### **3.1 Test Migration**

```bash
# Run migration locally
npm run supabase:migrate

# Or manually in SQL editor
psql teddykids_lms < migrations/20251025120000_add_cao_salary_scales.sql
```

#### **3.2 Verify Changes**

```sql
-- Check table structure
\d+ table_name

-- Check data
SELECT COUNT(*), 
       MIN(created_at), 
       MAX(created_at)
FROM new_table;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'new_table';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'new_table';

-- Check views
\d+ view_name
```

#### **3.3 Test Application**

```bash
# 1. Regenerate types
npm run supabase:types

# 2. Check for TypeScript errors
npm run type-check

# 3. Build
npm run build

# 4. Start dev server
npm run dev

# 5. Manually test affected features
```

---

### **Phase 4: Update Code**

#### **4.1 Update TypeScript Types**

```bash
# Always regenerate types after schema changes
npm run supabase:types

# Commit the updated types
git add src/integrations/supabase/types.ts
```

#### **4.2 Update Queries**

```typescript
// Before
const { data } = await supabase
  .from('old_table')
  .select('old_column');

// After
const { data } = await supabase
  .from('new_table')
  .select('new_column');
```

#### **4.3 Handle Breaking Changes**

If migration breaks existing code:

```typescript
// Option 1: Gradual migration - support both
const { data } = await supabase
  .from('new_table')
  .select('*');

if (!data) {
  // Fallback to old table temporarily
  const { data: oldData } = await supabase
    .from('old_table')
    .select('*');
  // Map old data to new format
}

// Option 2: Feature flag
if (USE_NEW_TABLE) {
  // New code
} else {
  // Old code (remove after migration complete)
}
```

---

### **Phase 5: Production Deployment**

#### **5.1 Pre-Deployment Checklist**

```markdown
- [ ] Migration tested locally
- [ ] Types regenerated
- [ ] Code updated and tested
- [ ] Build passes
- [ ] Rollback script prepared
- [ ] Team notified (if breaking change)
- [ ] Backup verified
```

#### **5.2 Run Migration in Production**

```bash
# Option A: Via Supabase Dashboard
# Go to SQL Editor → Run migration script

# Option B: Via CLI (if configured)
supabase db push

# Option C: Via migration tool
npm run supabase:migrate --env production
```

#### **5.3 Monitor Migration**

```sql
-- Check migration ran successfully
SELECT * FROM _migrations 
ORDER BY executed_at DESC 
LIMIT 5;

-- Verify data
SELECT COUNT(*) FROM new_table;

-- Check for errors in logs
SELECT * FROM postgres_logs 
WHERE level = 'ERROR' 
  AND timestamp > NOW() - INTERVAL '5 minutes';
```

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: Foreign Key Constraint Fails**

```sql
-- ❌ Error: cannot add foreign key to a view
ALTER TABLE my_table 
ADD CONSTRAINT fk_staff_id 
FOREIGN KEY (staff_id) REFERENCES staff(id);

-- ✅ Solution: staff is a view, not a table!
-- Check CRITICAL_ARCHITECTURE_STAFF_IS_VIEW.md
-- Use JOIN instead of FK
```

### **Issue 2: Column Already Exists**

```sql
-- ❌ Error: column "new_column" already exists
ALTER TABLE my_table ADD COLUMN new_column TEXT;

-- ✅ Solution: Use IF NOT EXISTS
ALTER TABLE my_table 
ADD COLUMN IF NOT EXISTS new_column TEXT;
```

### **Issue 3: RLS Policy Prevents Migration**

```sql
-- ❌ Error: new row violates row-level security policy
INSERT INTO protected_table VALUES (...);

-- ✅ Solution: Temporarily disable RLS or run as superuser
ALTER TABLE protected_table DISABLE ROW LEVEL SECURITY;
-- Run migration
ALTER TABLE protected_table ENABLE ROW LEVEL SECURITY;
```

### **Issue 4: Data Type Mismatch**

```sql
-- ❌ Error: column "id" cannot be cast to type uuid
ALTER TABLE my_table 
ALTER COLUMN id TYPE UUID;

-- ✅ Solution: Use USING clause
ALTER TABLE my_table 
ALTER COLUMN id TYPE UUID 
USING id::UUID;
```

### **Issue 5: Orphaned Data After Migration**

```sql
-- Find orphaned records
SELECT nt.* 
FROM new_table nt
LEFT JOIN old_table ot ON nt.old_id = ot.id
WHERE ot.id IS NULL;

-- Clean up or migrate orphaned data
DELETE FROM new_table
WHERE id IN (
  SELECT nt.id 
  FROM new_table nt
  LEFT JOIN old_table ot ON nt.old_id = ot.id
  WHERE ot.id IS NULL
);
```

---

## 🔄 **Rollback Procedures**

### **Simple Rollback**

```sql
BEGIN;

-- Reverse the changes
DROP TABLE IF EXISTS new_table CASCADE;
ALTER TABLE old_table RENAME TO my_table;
DROP FUNCTION IF EXISTS new_function();

COMMIT;
```

### **Rollback with Data Preservation**

```sql
BEGIN;

-- Create backup of new data first
CREATE TABLE new_table_backup AS 
SELECT * FROM new_table;

-- Rollback structure
DROP TABLE new_table;

-- Verify backup
SELECT COUNT(*) FROM new_table_backup;

COMMIT;
```

---

## 📊 **Migration Types**

### **Type 1: Additive (Safe)**

Adding new columns, tables, or indexes (non-breaking):

```sql
-- ✅ Safe - doesn't break existing code
ALTER TABLE users ADD COLUMN phone TEXT;
CREATE INDEX idx_users_phone ON users(phone);
```

### **Type 2: Transformation (Moderate Risk)**

Changing data structure but preserving data:

```sql
-- ⚠️ Moderate - requires code update
ALTER TABLE users RENAME COLUMN name TO full_name;
UPDATE users SET full_name = CONCAT(first_name, ' ', last_name);
```

### **Type 3: Destructive (High Risk)**

Removing or significantly changing structure:

```sql
-- 🔴 High risk - breaking change
ALTER TABLE users DROP COLUMN deprecated_field;
DROP TABLE IF EXISTS old_unused_table;
```

---

## 📝 **Special Cases**

### **Large Data Migrations**

```sql
-- For tables with millions of rows
-- Use batching to avoid locks

DO $$
DECLARE
  batch_size INT := 10000;
  offset_val INT := 0;
  total INT;
BEGIN
  SELECT COUNT(*) INTO total FROM large_table;
  
  WHILE offset_val < total LOOP
    -- Process batch
    UPDATE large_table
    SET new_column = UPPER(old_column)
    WHERE id IN (
      SELECT id FROM large_table
      ORDER BY id
      LIMIT batch_size OFFSET offset_val
    );
    
    offset_val := offset_val + batch_size;
    
    -- Log progress
    RAISE NOTICE 'Processed %/%', offset_val, total;
    
    -- Give other queries a chance
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;
```

### **Zero-Downtime Migrations**

```sql
-- Step 1: Add new column (non-breaking)
ALTER TABLE users ADD COLUMN new_email TEXT;

-- Step 2: Backfill data
UPDATE users SET new_email = old_email 
WHERE new_email IS NULL;

-- Step 3: Deploy code that writes to both columns

-- Step 4: Verify all data migrated
SELECT COUNT(*) FROM users WHERE new_email IS NULL;

-- Step 5: Drop old column (after code deployed)
ALTER TABLE users DROP COLUMN old_email;
```

---

## 🎓 **Best Practices**

### **DO:**

✅ Always backup before migration  
✅ Test locally first  
✅ Use transactions (BEGIN/COMMIT)  
✅ Add comments explaining WHY  
✅ Include rollback script  
✅ Regenerate TypeScript types  
✅ Monitor after deployment  
✅ Use IF EXISTS / IF NOT EXISTS  

### **DON'T:**

❌ Run migrations in production without testing  
❌ Forget to regenerate types  
❌ Skip documentation  
❌ Make breaking changes without notice  
❌ Forget about indexes  
❌ Ignore RLS policies  
❌ Delete data without backup  

---

## 📚 **Related Documentation**

- `CRITICAL_ARCHITECTURE_STAFF_IS_VIEW.md` - Database architecture
- `LESSONS_LEARNED_POST_VITE_RECOVERY.md` - Real migration examples
- `CONTRIBUTING.md` - Development workflow
- Supabase Migrations Docs: https://supabase.com/docs/guides/cli/local-development

---

## 🆘 **Emergency Contacts**

If migration fails in production:

1. **Immediate rollback** (use prepared rollback script)
2. **Check error logs** (Supabase Dashboard → Logs)
3. **Restore from backup** (if rollback doesn't work)
4. **Document incident** (what went wrong, how it was fixed)

---

**Remember: Measure twice, migrate once! 🔨**

