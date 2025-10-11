# COMPLETE SCHEMA ANALYSIS - Change Detector vs Database

## Phase 1 Diagnostic Results - ACTUAL Schema

From `phase1_diagnose_schema.sql` query results:

```
employes_changes table columns (12 total):
1.  id                - uuid
2.  employee_id       - uuid
3.  endpoint          - text
4.  field_path        - text     ⚠️ Change detector uses: field_name
5.  old_value         - jsonb
6.  new_value         - jsonb
7.  change_type       - text
8.  detected_at       - timestamp with time zone  ⚠️ Change detector uses: effective_date
9.  sync_session_id   - uuid
10. is_duplicate      - boolean
11. is_significant    - boolean
12. metadata          - jsonb
```

## Change Detector Code - What It's Trying to Insert

### Lines 186-207 (Salary Changes):
```typescript
{
  employee_id: employeeId,           ✅ EXISTS
  change_type: 'salary_change',      ✅ EXISTS
  field_path: '...',                 ✅ FIXED (was field_name)
  detected_at: curr.start_date,      ✅ FIXED (was effective_date)
  old_value: oldWage,                ✅ EXISTS
  new_value: newWage,                ✅ EXISTS
  metadata: {                        ✅ EXISTS (JSONB - can contain anything)
    change_amount: changeAmount,     ✅ MOVED to metadata
    change_percent: changePercent,   ✅ MOVED to metadata
    business_impact: '...',          ✅ MOVED to metadata
    old_hourly: prev.hour_wage,
    new_hourly: curr.hour_wage,
    old_monthly: prev.month_wage,
    new_monthly: curr.month_wage,
    old_yearly: prev.yearly_wage,
    new_yearly: curr.yearly_wage,
    period_start: curr.start_date,
    period_end: curr.end_date || null
  }
}
```

### Lines 231-252 (Hours Changes):
```typescript
{
  employee_id: employeeId,           ✅ EXISTS
  change_type: 'hours_change',       ✅ EXISTS
  field_path: 'hours_per_week',      ✅ FIXED
  detected_at: curr.start_date,      ✅ FIXED
  old_value: oldHours,               ✅ EXISTS
  new_value: newHours,               ✅ EXISTS
  metadata: {                        ✅ EXISTS
    change_amount: changeAmount,     ✅ MOVED to metadata
    change_percent: changePercent,   ✅ MOVED to metadata
    business_impact: '...',          ✅ MOVED to metadata
    old_hours: prev.hours_per_week,
    new_hours: curr.hours_per_week,
    old_days: prev.days_per_week,
    new_days: curr.days_per_week,
    old_type: prev.employee_type,
    new_type: curr.employee_type,
    period_start: curr.start_date,
    period_end: curr.end_date || null
  }
}
```

### Lines 276-297 (Contract Changes):
```typescript
{
  employee_id: employeeId,           ✅ EXISTS
  change_type: 'contract_change',    ✅ EXISTS
  field_path: 'contract_duration',   ✅ FIXED
  detected_at: curr.start_date,      ✅ FIXED
  old_value: oldType,                ✅ EXISTS
  new_value: newType,                ✅ EXISTS
  metadata: {                        ✅ EXISTS
    business_impact: '...',          ✅ MOVED to metadata
    old_contract_type: oldType,
    new_contract_type: newType,
    old_start: prev.start_date,
    new_start: curr.start_date,
    old_end: prev.end_date || null,
    new_end: curr.end_date || null,
    is_signed: curr.is_signed || false,
    sign_date: curr.sign_date || null
  }
}
```

## Missing Columns Analysis

### What change detector is trying to use that DON'T exist:
❌ `field_name` → Should be `field_path` (FIXED)
❌ `effective_date` → Should be `detected_at` (FIXED)
❌ `change_amount` → Should be in `metadata` (FIXED)
❌ `change_percent` → Should be in `metadata` (FIXED)
❌ `confidence_score` → Should be in `metadata` or removed (FIXED - moved to metadata)
❌ `business_impact` → Should be in `metadata` (FIXED)

### What columns exist but change detector doesn't populate:
⚠️ `endpoint` - Not being set! (defaults to NOT NULL)
⚠️ `is_significant` - Not being set (has default: true)
⚠️ `sync_session_id` - Being set correctly ✅
⚠️ `is_duplicate` - Being set correctly ✅

## CRITICAL ISSUE: `endpoint` column is NOT NULL!

```sql
endpoint - text - NOT NULL - no default
```

**The change detector is NOT setting the `endpoint` field, but it's required!**

This will cause ALL inserts to fail!

## Complete Fix Required

### 1. Add `endpoint` field to all change objects:
```typescript
// Salary changes
{
  employee_id: employeeId,
  endpoint: '/employments',  // ← MISSING!
  change_type: 'salary_change',
  field_path: '...',
  detected_at: curr.start_date,
  old_value: oldWage,
  new_value: newWage,
  metadata: { ... }
}

// Hours changes
{
  employee_id: employeeId,
  endpoint: '/employments',  // ← MISSING!
  change_type: 'hours_change',
  ...
}

// Contract changes
{
  employee_id: employeeId,
  endpoint: '/employments',  // ← MISSING!
  change_type: 'contract_change',
  ...
}
```

### 2. All other fields are now correct after fixes

## Summary

**Total Issues Found:**
1. ✅ field_name → field_path (FIXED)
2. ✅ effective_date → detected_at (FIXED)
3. ✅ change_amount → metadata.change_amount (FIXED)
4. ✅ change_percent → metadata.change_percent (FIXED)
5. ✅ confidence_score → removed (FIXED)
6. ✅ business_impact → metadata.business_impact (FIXED)
7. ❌ **endpoint → NOT SET (CRITICAL - CAUSING ALL FAILURES!)**

**Root Cause of 0 inserts:**
The `endpoint` column is `NOT NULL` with no default, so ALL inserts fail when it's not provided.

