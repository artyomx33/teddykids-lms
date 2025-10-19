# 🔧 Manual Deployment Guide - Document System Migrations

The automated `supabase db push` is failing because `staff` is a view, not a table. Here's how to deploy manually:

## Option 1: Supabase Dashboard (Recommended)

### Step 1: Go to SQL Editor
1. Open https://supabase.com/dashboard/project/gjlgaufihseaagzmidhc/sql/new
2. Create a new query

### Step 2: Fix the Migration
Before running the migrations, we need to find the actual staff table name. Run this first:

```sql
-- Find the real staff table
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name LIKE '%staff%';
```

### Step 3: Update Migration File
Open `supabase/migrations/20251006240000_document_management_system.sql` and replace:
```sql
staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
```

With (use the actual table name from Step 2, probably `raw_staff` or `staff_master`):
```sql
staff_id uuid NOT NULL,  -- Remove foreign key temporarily
```

Or if you know the table name:
```sql
staff_id uuid NOT NULL REFERENCES raw_staff(id) ON DELETE CASCADE,
```

### Step 4: Run Each Migration

Copy and paste each migration file content into the SQL Editor and run:

**Migration 1**: `20251006240000_document_management_system.sql`
**Migration 2**: `20251006240001_document_storage_setup.sql`  
**Migration 3**: `20251006240002_document_system_fixes.sql`

### Step 5: Record Migrations
After successful execution, record them:

```sql
INSERT INTO supabase_migrations.schema_migrations (version)
VALUES 
  ('20251006240000'),
  ('20251006240001'),
  ('20251006240002');
```

---

## Option 2: Fix Foreign Key and Re-push

### Quick Fix

1. Find the actual staff table:
```bash
supabase db diff --schema public | grep "CREATE TABLE.*staff"
```

2. Update the migration file with the correct table name

3. Push again:
```bash
supabase db push
```

---

## What Went Wrong?

The TeddyKids system uses a **raw data architecture** where `staff` is a VIEW, not a table. The migrations reference `staff(id)` as a foreign key, but PostgreSQL won't allow foreign keys to views.

**Solution**: Either:
- Reference the underlying table (e.g., `raw_staff`)
- Remove the foreign key constraint and add it as a check or trigger

---

## Quick Alternative: Use UUID Without Foreign Key

If you want to deploy NOW without finding the table, just remove the foreign key constraint:

**Edit line 15 of `20251006240000_document_management_system.sql`:**
```sql
-- BEFORE
staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,

-- AFTER  
staff_id uuid NOT NULL,  -- Foreign key handled by application
```

Then run:
```bash
supabase db push
```

This will work immediately, and you can add proper foreign keys later once you identify the correct table structure.

---

## Need Help?

Let me know which option you prefer and I can help implement it!

