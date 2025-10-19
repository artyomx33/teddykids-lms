# 🏗️ TIMELINE DATA ARCHITECTURE - ANALYSIS & PLAN

**Created:** October 8, 2025  
**Purpose:** Understand current data flow and design proper solution  
**Status:** Planning Phase - NO CODING YET

---

## 📊 CURRENT STATE ANALYSIS

### **Data Sources (What We Have)**

1. **`employes_raw_data` table**
   - Stores complete API responses from employes.nl
   - Fields: `employee_id`, `endpoint`, `api_response` (JSONB), `collected_at`
   - Purpose: Single source of truth, raw data storage
   - Status: ✅ Working - data is being stored

2. **`employes_changes` table**
   - Tracks detected changes between API syncs
   - Fields: `employee_id`, `change_type`, `old_value` (JSONB), `new_value` (JSONB), `change_amount`, `effective_date`
   - Purpose: Change detection and tracking
   - Status: ⚠️ Populated but not used correctly

3. **`employes_timeline_v2` table**
   - Timeline of employment events for UI display
   - Fields: `employee_id`, `event_type`, `event_date`, `salary_at_event`, `hours_at_event`, `previous_value`, `new_value`
   - Purpose: Pre-computed timeline for fast UI rendering
   - Status: ❌ BROKEN - salary/hours fields are NULL

4. **`staff` view**
   - Aggregated view of current employee state
   - Purpose: Current snapshot of employee data
   - Status: ✅ Working

---

## 🔄 CURRENT DATA FLOW (How It Works Now)

```
STEP 1: API Sync
├── employes.nl API
├── Fetch employee data
└── Store in employes_raw_data (JSONB)

STEP 2: Change Detection
├── Read employes_raw_data
├── Compare with previous versions
├── Detect changes (salary, hours, contract)
└── Store in employes_changes
    ├── old_value: {monthly_wage: 2501, hours_per_week: 36}
    └── new_value: {monthly_wage: 2539, hours_per_week: 36}

STEP 3: Timeline Generation (BROKEN HERE!)
├── Read employes_changes
├── Loop through each change
└── Insert into employes_timeline_v2
    ├── ❌ salary_at_event: NULL (only for salary_change events)
    ├── ❌ hours_at_event: NOT POPULATED AT ALL
    └── ❌ Logic: Only extracts for specific event types

STEP 4: UI Display
├── EmployeeTimeline component
├── Query: SELECT * FROM employes_timeline_v2
└── Result: salary_at_event = undefined, hours_at_event = undefined
    └── ❌ Bruto/Neto/Hours grid doesn't show!
```

---

## 🐛 ROOT CAUSE ANALYSIS

### **Problem #1: Incomplete Timeline Generator**

**Location:** `generate_timeline_v2()` function in `20251006160000_timeline_system_v2.sql`

**Current Logic:**
```
IF change_type = 'salary_change' THEN
  salary_at_event = new_value (as number)
ELSE
  salary_at_event = NULL
END
```

**Issues:**
- Only populates `salary_at_event` for `'salary_change'` events
- Contract events (`contract_change`) don't get salary populated
- Hours change events don't get salary populated
- `hours_at_event` field is COMPLETELY MISSING from INSERT statement

**Why This Happens:**
- Generator was built incrementally
- Only handled salary changes initially
- Contract events were added later but forgot to extract salary
- Hours field was never added to the INSERT

---

### **Problem #2: Data is JSONB, Extraction is Hard-Coded**

**The Data We Have:**
```json
employes_changes.new_value = {
  "monthly_wage": 2539,
  "hours_per_week": 36,
  "hourly_wage": 16.25,
  "contract_type": "Bepaalde tijd",
  "start_date": "2024-09-01"
}
```

**Current Extraction:**
- Only looks at specific event types
- Only extracts specific fields
- Doesn't handle variations in field names:
  - `monthly_wage` vs `monthlyWage` vs `salary`
  - `hours_per_week` vs `hoursPerWeek`

---

### **Problem #3: No Fallback Logic**

**What Should Happen:**
- If timeline doesn't have salary → Look up current salary from `staff` view
- If timeline doesn't have hours → Look up current hours from `staff` view
- If `employes_changes` doesn't have data → Extract from `employes_raw_data`

**What Actually Happens:**
- Timeline shows `undefined`
- UI breaks
- No graceful degradation

---

## 🎯 DESIRED STATE (How It Should Work)

### **Goal: Timeline Should ALWAYS Have Salary/Hours**

**For EVERY event type:**
- Contract Started → Show salary & hours at that time
- Contract Renewed → Show salary & hours at that time
- Salary Increase → Show old & new salary, current hours
- Hours Change → Show old & new hours, current salary
- Position Change → Show current salary & hours

---

## 💡 PROPOSED SOLUTION ARCHITECTURE

### **Option A: Fix Timeline Generator (Recommended)**

**Approach:** Make the generator smarter

**Changes Needed:**
1. Extract salary from JSONB for ALL event types
2. Extract hours from JSONB for ALL event types
3. Add fallback logic if JSONB fields are missing
4. Handle multiple field name variations

**Pros:**
- ✅ One-time fix
- ✅ Fast UI performance (pre-computed)
- ✅ Clean architecture

**Cons:**
- ⚠️ Need to regenerate timeline for all employees
- ⚠️ Timeline can get out of sync if not regenerated

---

### **Option B: Real-Time Lookup in UI (Alternative)**

**Approach:** Skip timeline, query raw data directly

**Changes Needed:**
1. UI queries `employes_changes` directly
2. Extract salary/hours from JSONB in real-time
3. Join with `staff` view for current values

**Pros:**
- ✅ Always up-to-date
- ✅ No pre-computation needed
- ✅ Single source of truth

**Cons:**
- ❌ Slower UI (complex queries)
- ❌ More database load
- ❌ Complex frontend logic

---

### **Option C: Hybrid Approach (Best of Both)**

**Approach:** Use timeline as cache with fallback

**Logic:**
```
1. Try to get salary/hours from employes_timeline_v2
2. If NULL → Look up from employes_changes.new_value (JSONB)
3. If still NULL → Look up current value from staff view
4. Cache result for next time
```

**Pros:**
- ✅ Fast (uses cache when available)
- ✅ Resilient (falls back when cache empty)
- ✅ Graceful degradation
- ✅ Works even if timeline not regenerated

**Cons:**
- ⚠️ More complex logic
- ⚠️ Need to maintain fallback queries

---

## 📋 IMPLEMENTATION PLAN (Recommended: Option C)

### **Phase 1: Immediate Fix (Frontend Fallback)**
**Goal:** Get it working NOW without DB changes

1. **Enhance EmployeeTimeline component**
   - If `salary_at_event` is NULL → Query `employes_changes`
   - Extract salary from `new_value` JSONB
   - Extract hours from `new_value` JSONB
   - Display in UI

2. **Benefits:**
   - ✅ Works immediately
   - ✅ No DB migrations
   - ✅ No regeneration needed

3. **Timeline:** 30 minutes

---

### **Phase 2: Fix Timeline Generator (Proper Solution)**
**Goal:** Make timeline self-sufficient

1. **Update `generate_timeline_v2()` function**
   - Extract salary from JSONB for ALL events
   - Extract hours from JSONB for ALL events
   - Handle field name variations
   - Add NULL fallbacks

2. **Add `hours_at_event` to INSERT**
   - Currently missing!
   - Extract from `old_value` and `new_value`

3. **Regenerate Timeline**
   - Run for all employees
   - Populate missing fields

4. **Timeline:** 2-3 hours

---

### **Phase 3: Add Smart Fallbacks (Resilience)**
**Goal:** Never show `undefined` again

1. **Create helper function**
   - `get_salary_at_date(employee_id, date)`
   - Looks in multiple places:
     1. Timeline cache
     2. Changes JSONB
     3. Raw data JSONB
     4. Current staff view

2. **Create helper function**
   - `get_hours_at_date(employee_id, date)`
   - Same multi-source approach

3. **Update UI to use helpers**

4. **Timeline:** 2-3 hours

---

## 🔍 DATA INVESTIGATION NEEDED

### **Questions to Answer:**

1. **What field names does employes.nl actually use?**
   - `monthly_wage` or `monthlyWage` or `salary`?
   - `hours_per_week` or `hoursPerWeek`?
   - Need to check actual JSONB data

2. **Is salary/hours data in `employes_changes`?**
   - Check: `SELECT new_value FROM employes_changes LIMIT 5`
   - Verify JSONB structure

3. **Is salary/hours data in `employes_raw_data`?**
   - Check: `SELECT api_response FROM employes_raw_data WHERE endpoint = '/employments' LIMIT 5`
   - Verify JSONB structure

4. **What's the current state of `employes_timeline_v2`?**
   - Check: `SELECT * FROM employes_timeline_v2 LIMIT 5`
   - Verify what's NULL and what's populated

---

## 📊 SUCCESS METRICS

**When This Is Fixed:**

1. ✅ Timeline cards show Bruto/Neto/Hours for ALL events
2. ✅ No `undefined` values in UI
3. ✅ Contract events show full financial picture
4. ✅ Salary events show accurate before/after
5. ✅ Data updates automatically from API syncs
6. ✅ Fast UI performance (<100ms query time)

---

## ⚠️ RISKS & MITIGATIONS

### **Risk 1: JSONB Structure Varies**
**Mitigation:** Add multiple fallback field names

### **Risk 2: Historical Data Missing**
**Mitigation:** Use current values as fallback

### **Risk 3: Performance Impact**
**Mitigation:** Use timeline cache, only query raw on cache miss

### **Risk 4: Timeline Out of Sync**
**Mitigation:** Add auto-regeneration trigger on data changes

---

## 🎯 RECOMMENDATION

**Go with Option C: Hybrid Approach**

**Reasoning:**
1. **Fast:** Uses pre-computed timeline when available
2. **Resilient:** Falls back to source data if timeline empty
3. **Incremental:** Can implement in phases
4. **Safe:** Doesn't break existing functionality

**Priority:**
1. 🔥 **URGENT:** Phase 1 (Frontend Fallback) - Get it working NOW
2. ⚠️ **HIGH:** Phase 2 (Fix Generator) - Proper long-term solution
3. ✅ **MEDIUM:** Phase 3 (Smart Fallbacks) - Nice to have resilience

---

## 📝 NEXT STEPS

### **Before Coding:**

1. ✅ Review this plan
2. ✅ Verify data structure in database
3. ✅ Decide on approach (A, B, or C)
4. ✅ Get approval to proceed

### **After Approval:**

1. Run SQL queries to inspect actual data
2. Document JSONB field names
3. Write migration if needed
4. Implement chosen solution
5. Test with real employee data
6. Deploy and verify

---

## 💭 QUESTIONS FOR DECISION

1. **Do we want timeline to be a cache or source of truth?**
   - Cache → Option C (Hybrid)
   - Source of truth → Option A (Fix Generator)

2. **How important is UI performance?**
   - Critical → Option A or C
   - Not critical → Option B

3. **How often does data change?**
   - Rarely → Option A (pre-compute)
   - Often → Option B (real-time)

4. **Can we afford a 2-hour migration?**
   - Yes → Fix generator now
   - No → Frontend fallback first

---

**AWAITING DECISION TO PROCEED** 🎯

Once you decide the approach, we can execute with confidence!
