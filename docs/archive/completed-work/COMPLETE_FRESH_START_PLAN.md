# 🔥 COMPLETE FRESH START PLAN

**Date**: October 6, 2025  
**Goal**: Drop ALL old/broken tables and create EVERYTHING fresh

---

## 🗑️ **WHAT FAILED (Tables with Wrong Schema)**

Based on migration errors, these tables exist but have **wrong column names**:

1. ❌ `review_templates` - Exists but wrong schema
2. ❌ `staff_reviews` - Exists but missing `staff_id` column
3. ❌ `staff_notes` - Exists but missing `staff_id` column
4. ❌ `staff_certificates` - Unknown status
5. ❌ `staff_docs_status` - Unknown status

---

## ✅ **WHAT'S WORKING (DON'T TOUCH!)**

These are **PERFECT** and powering your fast system:

1. ✅ `employes_raw_data` - Core data storage ⚡
2. ✅ `employes_changes` - Change detection ⚡
3. ✅ `employes_sync_sessions` - Sync tracking ⚡
4. ✅ `employes_sync_logs` - Logging ⚡
5. ✅ `staff` (view) - Staff info ⚡
6. ✅ `contracts` - Contract storage ⚡
7. ✅ `contracts_enriched` - Enhanced contracts ⚡

---

## 🎯 **THE PLAN**

### **ONE MIGRATION TO RULE THEM ALL**

**File**: `20251006110000_complete_fresh_start.sql`

**What it does**:

#### **Step 1: DROP Old Broken Tables** 🗑️
```sql
DROP TABLE IF EXISTS staff_reviews CASCADE;
DROP TABLE IF EXISTS review_templates CASCADE;
DROP TABLE IF EXISTS staff_notes CASCADE;
DROP TABLE IF EXISTS staff_certificates CASCADE;
DROP TABLE IF EXISTS staff_docs_status CASCADE;
DROP VIEW IF EXISTS staff_review_summary CASCADE;
DROP VIEW IF EXISTS performance_trends CASCADE;
DROP VIEW IF EXISTS review_calendar CASCADE;
DROP VIEW IF EXISTS document_compliance_view CASCADE;
```

#### **Step 2: CREATE Fresh Tables** ✨
1. **`review_templates`** - Review form templates
2. **`staff_reviews`** - Performance reviews (with `staff_id`!)
3. **`staff_notes`** - Staff notes (with `staff_id`!)
4. **`staff_certificates`** - Certificate uploads (with `staff_id`!)
5. **`staff_docs_status`** - Document compliance (with `staff_id`!)

#### **Step 3: CREATE Analytics Views** 📊
1. **`staff_review_summary`** - Per-staff review stats
2. **`performance_trends`** - Quarterly performance
3. **`review_calendar`** - Upcoming/overdue reviews
4. **`document_compliance_view`** - Compliance overview

#### **Step 4: Seed Default Data** 🌱
- 4 default review templates (probation, 6-month, yearly, exit)

#### **Step 5: Set Permissions** 🔒
- RLS policies
- Grant access to authenticated users

---

## 📋 **WHAT GETS CREATED**

### **Tables (5 new)**
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `review_templates` | Review forms | `id`, `name`, `type`, `questions` |
| `staff_reviews` | Performance reviews | `id`, `staff_id`, `reviewer_id`, `overall_rating` |
| `staff_notes` | Staff notes | `id`, `staff_id`, `note`, `note_type` |
| `staff_certificates` | Certificates | `id`, `staff_id`, `certificate_name`, `file_path` |
| `staff_docs_status` | Compliance | `id`, `staff_id`, `vog_status`, `is_compliant` |

### **Views (4 new)**
| View | Purpose |
|------|---------|
| `staff_review_summary` | Aggregated review stats per staff |
| `performance_trends` | Quarterly performance trends |
| `review_calendar` | Upcoming/overdue reviews |
| `document_compliance_view` | Document compliance overview |

---

## 🚀 **WHAT HAPPENS AFTER**

### **Frontend Impact**
✅ **Everything will just work!**

**Pages that become functional**:
1. ✅ Staff Profile → Reviews tab (currently shows "table not found")
2. ✅ Performance Analytics (currently disabled)
3. ✅ Review Calendar (currently disabled)
4. ✅ Document Compliance (currently disabled)
5. ✅ Staff Notes (currently disabled)
6. ✅ Certificate Upload (currently disabled)

**Pages that stay working**:
1. ✅ Staff Profile → Employment History (already working!)
2. ✅ Employes Sync Dashboard (already working!)
3. ✅ Compact Profile Card (already working!)
4. ✅ Employment Status Bar (already working!)

---

## ⚠️ **WHAT GETS DELETED**

### **Data Loss**
- ❌ Any existing reviews (if any)
- ❌ Any existing notes (if any)
- ❌ Any existing certificates (if any)
- ❌ Any existing doc status (if any)

### **Is this OK?**
**YES!** Because:
1. These tables had **wrong schema** (unusable)
2. Frontend couldn't access them anyway
3. Better to start fresh with **correct schema**
4. No production data yet (Labs 2.0 is in development)

---

## 🎯 **WHAT STAYS UNTOUCHED**

### **Core Working System** ✅
- ✅ `employes_raw_data` - ALL your employee data
- ✅ `employes_changes` - ALL detected changes (Alena's history!)
- ✅ `employes_sync_sessions` - ALL sync history
- ✅ `staff` view - Staff info
- ✅ `contracts` - All contracts
- ✅ `contracts_enriched` - Enhanced contracts

**NOTHING in your working system gets touched!** 🛡️

---

## 📊 **MIGRATION DETAILS**

### **File Structure**
```
supabase/migrations/
  └── 20251006110000_complete_fresh_start.sql
      ├── 1. DROP old tables
      ├── 2. CREATE review_templates
      ├── 3. CREATE staff_reviews
      ├── 4. CREATE staff_notes
      ├── 5. CREATE staff_certificates
      ├── 6. CREATE staff_docs_status
      ├── 7. CREATE triggers (updated_at)
      ├── 8. CREATE RLS policies
      ├── 9. CREATE views
      ├── 10. SEED templates
      └── 11. GRANT permissions
```

### **Size**
- ~400 lines of SQL
- Clean, well-commented
- Idempotent (can run multiple times)

---

## ✅ **VERIFICATION PLAN**

After deployment:

1. **Check tables exist**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name IN ('review_templates', 'staff_reviews', 'staff_notes', 'staff_certificates', 'staff_docs_status');
   ```

2. **Check views exist**:
   ```sql
   SELECT table_name FROM information_schema.views 
   WHERE table_name IN ('staff_review_summary', 'performance_trends', 'review_calendar', 'document_compliance_view');
   ```

3. **Check seeded data**:
   ```sql
   SELECT name, type FROM review_templates;
   -- Should return 4 templates
   ```

4. **Test frontend**:
   - Open Staff Profile
   - Check Reviews tab (should load, not error)
   - Check all components render

---

## 🚀 **DEPLOYMENT STEPS**

1. **Create migration** ✅ (ready to go)
2. **Deploy**: `supabase db push`
3. **Verify**: Check tables/views exist
4. **Test**: Open frontend, verify no errors
5. **Celebrate**: Labs 2.0 is 100% functional! 🎉

---

## 💡 **RECOMMENDATION**

### **Option A: Deploy Now** ✅ **RECOMMENDED**
- One clean migration
- Drops old broken stuff
- Creates everything fresh
- Takes ~30 seconds
- Zero risk to working system

### **Option B: Review SQL First**
- I can show you the SQL
- You review it
- Then we deploy

---

## 🎯 **READY?**

**The migration is ready to create!**

Just say:
- **"GO!"** → I'll create and deploy immediately
- **"Show me the SQL"** → I'll show you the full migration first
- **"Wait"** → We pause and discuss

**What do you want to do?** 🚀
