# 📊 Timeline Available Data Analysis

## 🎯 Current State

### What We're Currently Displaying:
Based on the timeline UI, we show:
- ✅ **Event Type** (Salary Change, Hours Change)
- ✅ **Event Date**
- ✅ **Bruto (Gross Salary)** - €2846, €2777, etc.
- ✅ **Neto (Net Salary)** - €1287, €1263, etc. (estimated)
- ✅ **Hours** - 30h/week (NOW WORKING after state completion!)

### What's Missing (from your screenshot):
You mentioned seeing these before:
- ❌ **Contract Type** (Fixed-term, Permanent, etc.)
- ❌ **Contract Start/End Dates**
- ❌ **Employee Type** (Full-time, Part-time)
- ❌ **Contract Milestones** (Contract started, Contract ended, etc.)

---

## 📋 Available Fields in Database Schema

### `employes_timeline_v2` Table Schema:
```sql
CREATE TABLE employes_timeline_v2 (
  -- Currently Used:
  salary_at_event DECIMAL(10,2),      ✅ Populated
  hours_at_event DECIMAL(5,2),        ✅ Populated
  
  -- Available but NOT Populated:
  role_at_event TEXT,                 ❌ NULL
  department_at_event TEXT,           ❌ NULL
  previous_value JSONB,               ⚠️  Partially used
  new_value JSONB,                    ⚠️  Partially used
  change_reason TEXT,                 ❌ NULL
  milestone_type TEXT,                ❌ NULL
)
```

---

## 🗂️ Data Available in Source (`employes_raw_data`)

### From `/employments` endpoint:
```json
{
  "start_date": "2024-09-01",
  "end_date": "2025-11-09",  // Contract end date!
  "employment_type": "parttime",  // Full-time vs Part-time
  "contract": {
    "contract_id": 123456,
    "contract_type": "definite",  // or "indefinite"
    "hours_per_week": 30,
    "phase": "active"
  },
  "salary": {
    "month_wage": 2846.00,
    "hour_wage": 16.50,
    "scale": "..."
  },
  "function": {
    "name": "Pedagogisch medewerker",  // Job title/role!
    "code": "PM"
  },
  "cost_center": {
    "name": "Teddy Ouderkerk"  // Department/Location!
  }
}
```

---

## 💡 Data We COULD Add to Timeline

### **Priority 1: Contract Information** (High Value!)

**1. Contract Type**
- Source: `employment.contract.contract_type`
- Values: "definite" (fixed-term) or "indefinite" (permanent)
- Display: "Fixed-term Contract" vs "Permanent Contract"
- **Impact:** Shows employment stability

**2. Contract Start/End Dates**
- Source: `employment.start_date` and `employment.end_date`
- Display: "Contract: 01 Sep 2024 → 09 Nov 2025"
- **Impact:** Shows contract duration and expiry

**3. Employment Type**
- Source: `employment.employment_type`
- Values: "fulltime", "parttime", "on_call"
- Display: "Full-time" / "Part-time"
- **Impact:** Context for hours worked

### **Priority 2: Role & Department** (Medium Value)

**4. Job Title/Function**
- Source: `employment.function.name`
- Example: "Pedagogisch medewerker", "Groepsleider"
- **Impact:** Shows career progression

**5. Department/Location**
- Source: `employment.cost_center.name`
- Example: "Teddy Ouderkerk", "Teddy Amsterdam"
- **Impact:** Shows transfers between locations

### **Priority 3: Contract Milestones** (Medium Value)

**6. Contract Phase**
- Source: `employment.contract.phase`
- Values: "active", "ended", "pending"
- **Impact:** Shows current contract status

---

## 🎨 Enhanced Timeline Display Ideas

### **Option A: Add Contract Details to Each Event**
```
┌─────────────────────────────────────────────┐
│ 📄 Salary Change - Jul 1, 2025             │
│                                             │
│ Bruto: €2846    Neto: €1287    Hours: 30h  │
│ Contract: Fixed-term (ends Nov 9, 2025)    │  ← NEW!
│ Role: Pedagogisch medewerker               │  ← NEW!
│ Location: Teddy Ouderkerk                  │  ← NEW!
└─────────────────────────────────────────────┘
```

### **Option B: Add Dedicated Contract Events**
```
┌─────────────────────────────────────────────┐
│ 📋 Contract Started - Sep 1, 2024          │
│                                             │
│ Type: Fixed-term                            │  ← NEW EVENT TYPE!
│ Duration: Sep 1, 2024 → Nov 9, 2025       │
│ Hours: 30h/week                             │
│ Salary: €2115.83                            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ⚠️ Contract Ending Soon - Nov 9, 2025      │  ← NEW EVENT TYPE!
│                                             │
│ Fixed-term contract expires in 30 days     │
└─────────────────────────────────────────────┘
```

### **Option C: Hybrid Approach** (Recommended!)
- Show contract context on ALL events (Option A)
- Add special milestone events for contract start/end (Option B)
- **Best of both worlds!**

---

## 🔧 Implementation Complexity

### **Easy Additions** (10-15 minutes each):

1. **Contract Type** 
   - Add to state completion: `contract_type_at_event`
   - Extract from: `employment.contract.contract_type`
   - Display: Badge or label

2. **Employment Type**
   - Add to state completion: `employment_type_at_event`
   - Extract from: `employment.employment_type`
   - Display: "Full-time" / "Part-time" badge

3. **Role/Function**
   - Add to state completion: `role_at_event` (field exists!)
   - Extract from: `employment.function.name`
   - Display: Below salary/hours

4. **Department/Location**
   - Add to state completion: `department_at_event` (field exists!)
   - Extract from: `employment.cost_center.name`
   - Display: Below role

### **Medium Complexity** (30-45 minutes):

5. **Contract Start/End Dates**
   - Add to state completion: `contract_start_date`, `contract_end_date`
   - Extract from: `employment.start_date`, `employment.end_date`
   - Display: Date range or "expires in X days"

6. **Contract Milestone Events**
   - Detect in change detector: contract start, contract end
   - Create new event types: `contract_started`, `contract_ended`, `contract_extended`
   - Display: Special event cards

---

## 📊 Recommended Implementation Order

### **Phase 1: Essential Context** (20 minutes)
1. Add `role_at_event` (job title) ✅ Field exists!
2. Add `department_at_event` (location) ✅ Field exists!
3. Update state completion to carry forward these values

**Impact:** Every event shows WHERE and WHAT ROLE

### **Phase 2: Contract Basics** (15 minutes)
4. Add `contract_type_at_event` (fixed-term vs permanent)
5. Add `employment_type_at_event` (full-time vs part-time)
6. Update state completion to carry forward these values

**Impact:** Every event shows CONTRACT TYPE

### **Phase 3: Contract Dates** (20 minutes)
7. Add `contract_start_date` and `contract_end_date`
8. Calculate "days until contract ends"
9. Show warnings for expiring contracts

**Impact:** Proactive contract management

### **Phase 4: Milestone Events** (45 minutes)
10. Add contract start/end detection to change detector
11. Create contract milestone event types
12. Design special event cards for milestones

**Impact:** Full contract lifecycle tracking

---

## 🎯 Quick Wins (What to Add First)

### **Immediate Value** (30 minutes total):

```sql
-- Enhance state completion to include:
UPDATE employes_timeline_v2 
SET 
  role_at_event = employment.function.name,           -- Job title
  department_at_event = employment.cost_center.name,  -- Location
  contract_type = employment.contract.contract_type,  -- Fixed/Permanent
  employment_type = employment.employment_type        -- Full/Part-time
WHERE ...
```

**Result in UI:**
```
Salary Change - Jul 1, 2025
Bruto: €2846  |  Neto: €1287  |  Hours: 30h
📍 Teddy Ouderkerk  |  👤 Pedagogisch medewerker  |  📄 Fixed-term
```

**This gives HUGE context with minimal effort!**

---

## 💬 What Would You Like to Add?

Based on your screenshot showing contract data before, I recommend:

**Option 1: Quick Win** (30 mins)
- Add role, department, contract type to all events
- Carries forward like salary/hours
- Immediate value!

**Option 2: Full Contract Tracking** (2 hours)
- Everything from Option 1
- Plus contract start/end dates
- Plus contract milestone events
- Complete contract lifecycle!

**Option 3: Just Milestones** (45 mins)
- Keep current salary/hours display
- Add contract start/end/extension events
- Shows major milestones only

---

## 📝 Next Steps

**Tell me what you want:**
1. Which data points matter most to you?
2. Should we show contract info on EVERY event, or just special milestone events?
3. Do you want contract expiry warnings?

**Then we'll:**
1. Update the database schema (if needed)
2. Enhance the state completion service
3. Update the change detector
4. Test in the UI

**Ready to choose?** 🎯

