# 🚨 CRITICAL ARCHITECTURE: `staff` is a VIEW, NOT a TABLE!

## ⚠️ READ THIS BEFORE ANY DATABASE WORK

Last Updated: October 2025
**This is the #1 source of database errors in our codebase!**

---

## 🏗️ The Real Architecture

```
External API → employes_raw_data (TABLE) → staff (VIEW) → Application
                     ↑                          ↓
                Real storage              Generated UUIDs
```

### What `staff` Actually Is:

```sql
-- staff is a VIEW that:
CREATE VIEW staff AS
SELECT
  -- 1. Generates deterministic UUID from employee_id
  md5('employes_employee:' || employee_id)::uuid as id,
  
  -- 2. Maps employee_id to employes_id
  employee_id as employes_id,
  
  -- 3. Extracts JSON data into columns
  TRIM(CONCAT(
    api_response->>'first_name', 
    ' ', 
    api_response->>'last_name'
  )) as full_name,
  
  -- ... other fields extracted from JSON
FROM employes_raw_data
WHERE is_latest = true;
```

---

## ❌ What You CANNOT Do

### 1. **CANNOT Create Foreign Keys to `staff`**
```sql
-- ❌ THIS WILL FAIL!
ALTER TABLE some_table 
ADD FOREIGN KEY (staff_id) 
REFERENCES staff(id);  -- ERROR: staff is not a table!
```

### 2. **CANNOT Insert/Update/Delete `staff` Directly**
```sql
-- ❌ THIS WILL FAIL!
INSERT INTO staff (full_name) VALUES ('John Doe');  -- ERROR: cannot insert into view
UPDATE staff SET email = 'new@email.com';           -- ERROR: cannot update view
DELETE FROM staff WHERE id = '123';                 -- ERROR: cannot delete from view
```

### 3. **CANNOT Alter `staff` Structure**
```sql
-- ❌ THIS WILL FAIL!
ALTER TABLE staff ADD COLUMN new_field TEXT;  -- ERROR: staff is not a table!
```

---

## ✅ What You CAN Do

### 1. **CAN Use `staff_id` Columns (without FK constraint)**
```sql
-- ✅ CORRECT: Add column, populate it, index it
ALTER TABLE your_table ADD COLUMN staff_id UUID;

-- Populate from relationship
UPDATE your_table t
SET staff_id = s.id
FROM staff s
WHERE s.employes_id = t.some_employes_reference;

-- Add index for performance (NOT a foreign key!)
CREATE INDEX idx_your_table_staff_id ON your_table(staff_id);
```

### 2. **CAN Join to `staff` VIEW**
```sql
-- ✅ CORRECT: Join for queries
SELECT 
  t.*,
  s.full_name,
  s.email
FROM your_table t
LEFT JOIN staff s ON t.staff_id = s.id;
```

### 3. **CAN Reference in RLS Policies**
```sql
-- ✅ CORRECT: Use in policies
CREATE POLICY "Users see their own data"
ON your_table FOR SELECT
USING (
  staff_id IN (
    SELECT id FROM staff WHERE email = auth.email()
  )
);
```

---

## 🔄 How Data Actually Flows

1. **External Employes API** → Syncs raw JSON data
2. **`employes_raw_data` table** → Stores JSON with `is_latest` flag
3. **`staff` VIEW** → Transforms JSON into relational columns
4. **Application queries** → Read from `staff` VIEW
5. **Other tables** → Store `staff_id` UUID (no FK constraint)

---

## 🎯 Common Patterns

### Pattern 1: Adding Staff Reference to New Table
```sql
-- Step 1: Add column
ALTER TABLE new_table ADD COLUMN staff_id UUID;

-- Step 2: Add index (NOT FK!)
CREATE INDEX idx_new_table_staff_id ON new_table(staff_id);

-- Step 3: Document it
COMMENT ON COLUMN new_table.staff_id IS 
'References staff.id (VIEW) - no FK constraint possible';
```

### Pattern 2: Migrating from `employes_employee_id`
```sql
-- Step 1: Add new column
ALTER TABLE old_table ADD COLUMN staff_id UUID;

-- Step 2: Populate from relationship
UPDATE old_table o
SET staff_id = s.id
FROM staff s
WHERE s.employes_id = o.employes_employee_id;

-- Step 3: Drop old column
ALTER TABLE old_table DROP COLUMN employes_employee_id;
```

### Pattern 3: Querying with Staff Data
```typescript
// TypeScript - Always join to get staff data
const { data } = await supabase
  .from('your_table')
  .select(`
    *,
    staff!inner(
      id,
      full_name,
      email
    )
  `)
  .eq('staff_id', staffId);
```

---

## ⚠️ Why This Architecture?

1. **Flexibility**: Raw data structure can change without breaking the app
2. **Consistency**: UUID generation is deterministic and stable
3. **Performance**: VIEW is automatically updated when raw data changes
4. **Simplicity**: No complex sync logic needed

---

## 🔍 How to Check if Something is a View or Table

```sql
-- Check what type an object is
SELECT 
  schemaname,
  tablename as name,
  'TABLE' as type
FROM pg_tables
WHERE tablename = 'staff'
UNION ALL
SELECT 
  schemaname,
  viewname as name,
  'VIEW' as type
FROM pg_views
WHERE viewname = 'staff';

-- Result: staff = VIEW
```

---

## 📝 Tables That Reference `staff.id` (without FK)

- `staff_reviews.staff_id` - UUID, no FK
- `cao_salary_history.staff_id` - UUID, no FK
- `contracts.staff_id` - UUID, no FK
- `staff_documents.staff_id` - UUID, no FK
- `staff_goals.staff_id` - UUID, no FK
- `staff_employment_history.staff_id` - UUID, no FK

All these tables store the UUID but CANNOT have a foreign key constraint!

---

## 🚨 Common Error Messages and Solutions

### Error: "referenced relation "staff" is not a table"
**Cause**: Trying to create FK to staff VIEW
**Solution**: Don't create FK, just add index

### Error: "cannot insert into view"
**Cause**: Trying to INSERT into staff
**Solution**: Insert into `employes_raw_data` instead

### Error: "column staff.new_column does not exist"
**Cause**: Trying to add columns to VIEW
**Solution**: Modify the VIEW definition in migrations

---

## 📚 References

- Main VIEW definition: `supabase/migrations/20251005000001_temporal_architecture.sql`
- Raw data table: `employes_raw_data`
- View creation: Line 392-450 in temporal architecture migration

---

**Remember: `staff` is a VIEW, not a TABLE! No foreign keys possible!**
