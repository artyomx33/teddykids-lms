# 🔍 TIMELINE UI VS DATABASE - COMPLETE AUDIT

## 📊 **DATABASE SCHEMA - employes_timeline_v2**

### **Migration History (Chronological Order):**

#### **1. Migration: 20251006160000_timeline_system_v2.sql**
```sql
CREATE TABLE employes_timeline_v2 (
  id UUID PRIMARY KEY,
  employee_id UUID NOT NULL,
  
  -- Event details:
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_description TEXT,
  
  -- Snapshot of values:
  salary_at_event DECIMAL(10,2),      ← EXISTS HERE
  hours_at_event DECIMAL(5,2),        ← EXISTS HERE
  role_at_event TEXT,                 ← EXISTS HERE
  department_at_event TEXT,           ← EXISTS HERE
  
  -- Change details:
  previous_value JSONB,
  new_value JSONB,
  change_amount DECIMAL(10,2),
  change_percentage DECIMAL(5,2),
  
  -- Context:
  change_reason TEXT,
  is_milestone BOOLEAN DEFAULT false,
  milestone_type TEXT,
  
  -- Metadata:
  source_change_id UUID,
  detected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

#### **2. Migration: 20251006215000_fix_temporal_tables.sql** (OVERWRITES ABOVE!)
```sql
DROP TABLE IF EXISTS employes_timeline_v2 CASCADE;  ← DROPS THE TABLE!

CREATE TABLE employes_timeline_v2 (
  id UUID PRIMARY KEY,
  employee_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  event_title TEXT NOT NULL,
  event_description TEXT,
  event_data JSONB,
  change_id UUID,
  created_at TIMESTAMPTZ
);
```

**Result:** ALL the fields (salary_at_event, hours_at_event, role_at_event, etc.) were REMOVED!

#### **3. Migration: 20251011000000_add_complete_temporal_fields.sql** (OUR FIX)
```sql
ALTER TABLE employes_timeline_v2 
ADD COLUMN IF NOT EXISTS role_at_event TEXT,
ADD COLUMN IF NOT EXISTS department_at_event TEXT,
ADD COLUMN IF NOT EXISTS contract_type_at_event TEXT,
ADD COLUMN IF NOT EXISTS employment_type_at_event TEXT,
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS contract_phase TEXT;
```

**Result:** Added 7 new columns, BUT still missing salary_at_event and hours_at_event!

---

## ❌ **THE PROBLEM DISCOVERED:**

Migration 20251006215000 **DROPPED and RECREATED** the table WITHOUT the essential fields:
- ❌ `salary_at_event` - MISSING!
- ❌ `hours_at_event` - MISSING!
- ❌ `previous_value` - MISSING!
- ❌ `new_value` - MISSING!
- ❌ `change_amount` - MISSING!
- ❌ `change_percentage` - MISSING!
- ❌ `change_reason` - MISSING!
- ❌ `is_milestone` - MISSING!
- ❌ `milestone_type` - MISSING!

---

## 🎯 **CURRENT ACTUAL SCHEMA (After All Migrations):**

```sql
employes_timeline_v2:
  ✅ id UUID
  ✅ employee_id UUID
  ✅ event_type TEXT
  ✅ event_date TIMESTAMPTZ
  ✅ event_title TEXT
  ✅ event_description TEXT
  ✅ event_data JSONB
  ✅ change_id UUID
  ✅ created_at TIMESTAMPTZ
  
  -- From our 20251011000000 migration:
  ✅ role_at_event TEXT
  ✅ department_at_event TEXT
  ✅ contract_type_at_event TEXT
  ✅ employment_type_at_event TEXT
  ✅ contract_start_date DATE
  ✅ contract_end_date DATE
  ✅ contract_phase TEXT
  
  -- MISSING (dropped by 20251006215000):
  ❌ salary_at_event DECIMAL(10,2)
  ❌ hours_at_event DECIMAL(5,2)
  ❌ previous_value JSONB
  ❌ new_value JSONB
  ❌ change_amount DECIMAL(10,2)
  ❌ change_percentage DECIMAL(5,2)
  ❌ change_reason TEXT
  ❌ is_milestone BOOLEAN
  ❌ milestone_type TEXT
```

---

## 🎨 **UI COMPONENT - What It Expects:**

File: `src/components/staff/EmployeeTimeline.tsx`

### **Interface Definition (Lines 33-47):**
```typescript
export interface TimelineEvent {
  id: string;
  event_type: string;
  event_date: string;
  event_description: string;
  
  // UI expects these BUT they don't exist in DB:
  salary_at_event: number | null;        ❌ NOT IN DB!
  hours_at_event: number | null;         ❌ NOT IN DB!
  change_amount: number | null;          ❌ NOT IN DB!
  change_percentage: number | null;      ❌ NOT IN DB!
  is_milestone: boolean;                 ❌ NOT IN DB!
  milestone_type: string | null;         ❌ NOT IN DB!
  change_reason: string | null;          ❌ NOT IN DB!
  previous_value: any;                   ❌ NOT IN DB!
  new_value: any;                        ❌ NOT IN DB!
}
```

### **What UI Displays (Lines 356-395):**
```typescript
// Displays salary if exists:
{displaySalary != null && displaySalary > 0 && (
  <div className="grid grid-cols-3 gap-3">
    {/* Bruto */}
    <div>€{displaySalary.toFixed(0)}</div>
    
    {/* Neto */}
    <div>€{calculateNetSalary(displaySalary).netMonthly}</div>
    
    {/* Hours */}
    <div>{displayHours}h</div>
  </div>
)}
```

### **What UI Does NOT Display (but DB has):**
- ❌ `contract_type_at_event` - In DB, NOT displayed
- ❌ `employment_type_at_event` - In DB, NOT displayed
- ❌ `contract_start_date` - In DB, NOT displayed
- ❌ `role_at_event` - In DB, NOT displayed
- ❌ `department_at_event` - In DB, NOT displayed

---

## 📋 **COMPLETE COMPARISON TABLE:**

| Field | Migration 1 (160000) | Migration 2 (215000) | Migration 3 (251011000000) | Current DB | UI Expects | UI Displays |
|-------|---------------------|---------------------|---------------------------|-----------|-----------|-------------|
| `id` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `employee_id` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `event_type` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `event_date` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `event_description` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `salary_at_event` | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `hours_at_event` | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `change_amount` | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `change_percentage` | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `is_milestone` | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `milestone_type` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `change_reason` | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `previous_value` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `new_value` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `role_at_event` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `department_at_event` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `contract_type_at_event` | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `employment_type_at_event` | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `contract_start_date` | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `contract_end_date` | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `contract_phase` | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |

---

## 🔥 **THE ROOT CAUSE:**

**Migration 20251006215000_fix_temporal_tables.sql:**
- Has `DROP TABLE IF EXISTS employes_timeline_v2 CASCADE;`
- Recreated table with ONLY basic fields
- Lost ALL the rich timeline fields from previous migration

**This explains:**
- ✅ Why salary/hours data was working before (it was in DB)
- ❌ Why it stopped working (20251006215000 dropped those columns)
- ❌ Why our new fields aren't showing (UI doesn't display them)

---

## ✅ **THE FIX NEEDED:**

### **1. Add Missing Columns Back:**
```sql
ALTER TABLE employes_timeline_v2
ADD COLUMN IF NOT EXISTS salary_at_event DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS hours_at_event DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS previous_value JSONB,
ADD COLUMN IF NOT EXISTS new_value JSONB,
ADD COLUMN IF NOT EXISTS change_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS change_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS change_reason TEXT,
ADD COLUMN IF NOT EXISTS is_milestone BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS milestone_type TEXT;
```

### **2. Update UI to Display New Fields:**
```typescript
// Add to TimelineEventCard component:
{contract_type_at_event && (
  <Badge>{contract_type_at_event}</Badge>
)}
{employment_type_at_event && (
  <Badge>{employment_type_at_event}</Badge>
)}
{contract_start_date && (
  <div>Contract: {contract_start_date}</div>
)}
```

---

## 📊 **SUMMARY:**

**What Happened:**
1. ✅ First migration created table with all fields
2. ❌ Second migration DROPPED table and recreated with fewer fields
3. ✅ Third migration added new contract fields
4. ❌ BUT missing the essential salary/hours/change fields

**Current State:**
- DB has: Basic fields + New contract fields
- DB missing: Salary, hours, change tracking fields
- UI expects: Salary, hours, change tracking fields
- UI doesn't use: New contract fields we added

**Fix Required:**
1. Add back the missing columns (salary, hours, change tracking)
2. Update UI to display new contract fields
3. Verify everything works

---

**This is why NO assumptions are critical - migrations can overwrite each other!**

