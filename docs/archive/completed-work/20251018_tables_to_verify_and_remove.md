# 🗄️ **TABLES TO VERIFY AND REMOVE**
## Database Cleanup Safety Check List

**Date**: October 18, 2025
**Status**: 🔍 **VERIFICATION REQUIRED**
**Purpose**: Safety check before removing unused database tables

---

## 🚨 **CRITICAL SAFETY CHECKS BEFORE REMOVAL**

### **✅ CHECK 1: Application Code References**
Search for any code that references these tables:

```bash
# Search for table names in source code
grep -r "job_applications\|job_postings\|application_documents" src/
grep -r "employee_notes\|employee_contacts\|employee_emergency_contacts" src/
grep -r "employee_skills\|employee_certifications\|employee_training_records" src/
grep -r "employee_performance_metrics\|staff_roles\|staff_permissions" src/
grep -r "staff_team_memberships\|staff_availability\|staff_work_schedules" src/
grep -r "contract_templates\|contract_negotiations\|review_feedback" src/
grep -r "review_action_items\|review_approvals\|performance_improvement_plans" src/
grep -r "review_reminders" src/
```

**❌ BLOCKING CONDITION**: If ANY code references found → **DON'T DELETE**

### **✅ CHECK 2: Migration File Dependencies**
Search migration files for table references:

```bash
# Check migration files
grep -r "job_applications\|employee_skills\|staff_roles" supabase/migrations/
grep -r "CREATE TABLE.*job_applications\|ALTER TABLE.*employee_skills" supabase/migrations/
```

**❌ BLOCKING CONDITION**: If migration files reference them → **Update migrations first**

### **✅ CHECK 3: Current Development Work**
Review recent activity:
- Any talent acquisition features **in progress this week**?
- Any staff management features **being built right now**?
- Any components or pages using these table areas?

**❌ BLOCKING CONDITION**: If actively developing → **Keep tables for now**

### **✅ CHECK 4: Supabase Configuration**
Check database configuration:
- RLS policies on target tables
- Triggers, views, or functions using these tables
- API endpoints specifically built for them
- Any foreign key relationships

**❌ BLOCKING CONDITION**: If database dependencies → **Remove dependencies first**

---

## 🎯 **TABLES PENDING REMOVAL**

### **📋 TALENT ACQUISITION SYSTEM (3 tables)**
| Table | Records | Dependencies | Status |
|-------|---------|--------------|--------|
| `job_applications` | 0 | None | 🟡 Verify |
| `job_postings` | 0 | None | 🟡 Verify |
| `application_documents` | 0 | None | 🟡 Verify |

**Rationale**: Feature never implemented, can redesign when actually needed

### **📋 EXTENDED EMPLOYEE FEATURES (7 tables)**
| Table | Records | Dependencies | Status |
|-------|---------|--------------|--------|
| `employee_notes` | 0 | None | 🟡 Verify |
| `employee_contacts` | 0 | None | 🟡 Verify |
| `employee_emergency_contacts` | 0 | None | 🟡 Verify |
| `employee_skills` | 0 | None | 🟡 Verify |
| `employee_certifications` | 0 | None | 🟡 Verify |
| `employee_training_records` | 0 | None | 🟡 Verify |
| `employee_performance_metrics` | 0 | None | 🟡 Verify |

**Rationale**: Planned but unused, architect can redesign when needed

### **📋 STAFF MANAGEMENT EXTENSIONS (5 tables)**
| Table | Records | Dependencies | Status |
|-------|---------|--------------|--------|
| `staff_roles` | 0 | None | 🟡 Verify |
| `staff_permissions` | 0 | None | 🟡 Verify |
| `staff_team_memberships` | 0 | None | 🟡 Verify |
| `staff_availability` | 0 | None | 🟡 Verify |
| `staff_work_schedules` | 0 | None | 🟡 Verify |

**Rationale**: Advanced features, currently empty and unused

### **📋 CONTRACT/REVIEW EXTENSIONS (7 tables)**
| Table | Records | Dependencies | Status |
|-------|---------|--------------|--------|
| `contract_templates` | 0 | None | 🟡 Verify |
| `contract_negotiations` | 0 | None | 🟡 Verify |
| `review_feedback` | 0 | None | 🟡 Verify |
| `review_action_items` | 0 | None | 🟡 Verify |
| `review_approvals` | 0 | None | 🟡 Verify |
| `performance_improvement_plans` | 0 | None | 🟡 Verify |
| `review_reminders` | 0 | None | 🟡 Verify |

**Rationale**: Extended features, empty and no current use

### **📋 LEGACY TABLES (4 tables)**
| Table | Records | Dependencies | Status |
|-------|---------|--------------|--------|
| `review_templates_legacy` | 15 | None | ⚠️ Migrate first |
| `employees_legacy` | 0 | None | 🟡 Verify |
| `documents_legacy` | 0 | None | 🟡 Verify |
| `contracts_legacy` | 0 | None | 🟡 Verify |

**Rationale**: Old implementations replaced by current system

---

## ✅ **TABLES TO PRESERVE (CRITICAL)**

### **🔴 NEVER REMOVE - CORE SYSTEM**
| Table | Purpose | Status |
|-------|---------|--------|
| `employes_raw_data` | API source of truth | 🔴 CRITICAL |
| `employes_changes` | Change tracking | 🔴 CRITICAL |
| `employes_timeline_v2` | Event timeline | 🔴 CRITICAL |
| `employes_current_state` | Current state | 🔴 CRITICAL |
| `staff` (VIEW) | Employee interface | 🔴 CRITICAL |
| `employee_info` | LMS extensions | 🟢 ACTIVE |

### **🟢 ACTIVE FEATURES - KEEP**
| Table | Purpose | Status |
|-------|---------|--------|
| `reviews` | Review records | 🟢 ACTIVE |
| `review_templates` | Review forms | 🟢 ACTIVE |
| `review_schedules` | Review scheduling | 🟢 ACTIVE |
| `documents` | Document storage | 🟢 ACTIVE |
| `staff_documents` | Staff-doc links | 🟢 ACTIVE |

---

## 🚀 **VERIFICATION RESULTS**

### **CHECK 1: Code References**
- [ ] **PASSED** - No application code references found
- [ ] **FAILED** - Found references in: `_____________`

### **CHECK 2: Migration Dependencies**
- [ ] **PASSED** - No migration file dependencies
- [ ] **FAILED** - Found dependencies in: `_____________`

### **CHECK 3: Active Development**
- [ ] **PASSED** - No current development on these features
- [ ] **FAILED** - Active work on: `_____________`

### **CHECK 4: Database Configuration**
- [ ] **PASSED** - No database dependencies
- [ ] **FAILED** - Found dependencies: `_____________`

---

## 📋 **FINAL DECISION**

### **🟢 SAFE TO REMOVE (after verification)**
- [ ] All 22 unused tables verified safe
- [ ] No blocking conditions found
- [ ] Ready for cleanup execution

### **🔴 BLOCKING ISSUES FOUND**
- [ ] Code references: `_____________`
- [ ] Migration dependencies: `_____________`
- [ ] Active development: `_____________`
- [ ] Database dependencies: `_____________`

### **📝 NOTES**
```
[Add any specific findings or concerns here]
```

---

## 🎯 **MODERN AI DEVELOPMENT REALITY**

**Why "Clean Slate" Approach Works:**
- ✅ **Architect agent** can redesign tables in minutes
- ✅ **Implementation** happens in hours, not weeks
- ✅ **Real requirements** > old assumptions
- ✅ **Clean schema** = faster current development

**When you actually need these features:**
1. **Ask architect**: "Design optimal [feature] system"
2. **Get modern schema** based on current requirements
3. **Implement in 30 minutes** with proper relationships
4. **Result**: Better than old unused tables anyway!

---

**Status**: 🔍 **VERIFICATION PENDING**
**Next Step**: Run safety checks via agent
**Goal**: Clean 48% of database tables safely