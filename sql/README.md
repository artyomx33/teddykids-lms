# 🗄️ SQL Directory

## 📁 Structure

### **Root SQL Files** (Active Utilities)
- `add_sample_templates.sql` - Add sample template data
- `check_tables.sql` - Check table structure and data
- `fix_document_compliance_view.sql` - Fix document compliance view

### **archive/** (Old SQL Fixes)
- `dependency_safe_deployment.sql` - Old dependency fix
- `manual_database_fix.sql` - Manual database fix
- `production_database_fix.sql` - Production database fix
- `fixed_database_deployment.sql` - Fixed deployment SQL

---

## ⚠️ Important Distinction

### **This folder (`sql/`):**
- Utility SQL files
- One-off fixes
- Testing queries
- Manual operations

### **`supabase/migrations/` folder:**
- Schema migrations
- Version-controlled changes
- Applied automatically
- Production database updates

---

## 🎯 Usage

### **Run a SQL File**
```bash
# Via Supabase CLI
supabase db query < sql/check_tables.sql

# Or copy-paste into Supabase SQL Editor
```

### **Add Sample Data**
```bash
supabase db query < sql/add_sample_templates.sql
```

### **Check Tables**
```bash
supabase db query < sql/check_tables.sql
```

---

## 📝 Guidelines

### **When to use `sql/`:**
- ✅ One-off utility queries
- ✅ Testing/debugging SQL
- ✅ Manual data fixes
- ✅ Investigation queries

### **When to use `supabase/migrations/`:**
- ✅ Schema changes
- ✅ Production updates
- ✅ Version-controlled changes
- ✅ Automated deployments

---

## 🔄 Workflow

1. **Test SQL here** (`sql/`) first
2. **If it works** and needs to be permanent
3. **Create migration** in `supabase/migrations/`
4. **Archive the test SQL** to `sql/archive/`

---

## 📦 Archive

Old SQL files are kept in `sql/archive/` for reference.

**Why keep them?**
- Historical context
- Reference for similar issues
- Understanding what was tried
- Learning from past fixes

**Safe to delete?**
- Yes, if no longer needed
- Keep for reference if unsure

---

## 🚀 Best Practices

- ✅ Test SQL on local database first
- ✅ Use transactions for safety
- ✅ Comment your SQL well
- ✅ Document what problem it solves
- ❌ Don't run untested SQL on production
- ❌ Don't skip migrations for schema changes

---

## 📊 SQL Examples

### **Check for Duplicates**
```sql
SELECT data_hash, COUNT(*) as count
FROM employes_raw_data
WHERE is_latest = true
GROUP BY data_hash
HAVING COUNT(*) > 1;
```

### **Inspect Timeline**
```sql
SELECT *
FROM employes_timeline_v2
WHERE employee_id = 'some-id'
ORDER BY detected_at DESC
LIMIT 10;
```

### **Check RLS Policies**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'your_table_name';
```

---

**Organized**: October 6, 2025

