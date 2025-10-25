# 🏗️ TeddyKids LMS Architecture Quick Reference

## 🚨 CRITICAL: Views vs Tables

| Name | Type | Can Have FK? | Can Insert? | Purpose |
|------|------|-------------|------------|---------|
| `staff` | **VIEW** | ❌ NO | ❌ NO | Transforms `employes_raw_data` JSON |
| `employes_raw_data` | TABLE | ✅ YES | ✅ YES | Stores raw API data |
| `staff_reviews` | TABLE | ✅ YES | ✅ YES | Review records |
| `contracts` | TABLE | ✅ YES | ✅ YES | Contract records |
| `cao_salary_history` | TABLE | ✅ YES | ✅ YES | Salary history |
| `contracts_enriched_v2` | VIEW | ❌ NO | ❌ NO | Enriched contract data |
| `staff_with_lms_data` | VIEW | ❌ NO | ❌ NO | Staff + LMS data |

## 🔄 Data Flow

```
Employes API
    ↓ (JSON)
employes_raw_data (TABLE)
    ↓ (Transform)
staff (VIEW) ← generates UUID from employee_id
    ↓ (UUID)
All other tables use staff_id (UUID) with NO FK constraint
```

## ✅ Correct Patterns

### Adding Staff Reference
```sql
-- ✅ CORRECT
ALTER TABLE your_table ADD COLUMN staff_id UUID;
CREATE INDEX idx_your_table_staff_id ON your_table(staff_id);
-- NO FOREIGN KEY!
```

### Joining to Staff
```sql
-- ✅ CORRECT
SELECT t.*, s.full_name 
FROM your_table t
LEFT JOIN staff s ON t.staff_id = s.id;
```

## ❌ Common Mistakes

```sql
-- ❌ WRONG - staff is a VIEW!
ALTER TABLE your_table 
ADD FOREIGN KEY (staff_id) REFERENCES staff(id);

-- ❌ WRONG - can't insert into VIEW!
INSERT INTO staff (full_name) VALUES ('John');

-- ❌ WRONG - can't alter VIEW structure!
ALTER TABLE staff ADD COLUMN new_field TEXT;
```

## 📝 Quick Checks

```sql
-- Is it a table or view?
SELECT tablename, 'TABLE' as type FROM pg_tables WHERE tablename = 'your_name'
UNION
SELECT viewname, 'VIEW' as type FROM pg_views WHERE viewname = 'your_name';

-- What columns does it have?
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'your_name';
```

## 🎯 Key Points

1. **`staff` is a VIEW** - Never try to create FKs to it
2. **`staff.id` is generated** - MD5 hash of employee_id
3. **Use indexes, not FKs** - For staff_id columns
4. **Join for data** - Don't expect FK cascade
5. **Views are read-only** - Can't INSERT/UPDATE/DELETE

---

**When in doubt: Check if it's a VIEW before creating any FK!**
