# 🚀 Timeline Data Fix - Deployment Instructions

## ✅ What's Been Done

1. **Created Migration**: `supabase/migrations/20251010000000_fix_timeline_generator.sql`
   - Fixes `generate_timeline_v2()` function to properly extract salary/hours from metadata
   - Structures `previous_value` and `new_value` as proper JSONB objects
   - Regenerates timeline for all employees
   - Includes data quality report

2. **Cleaned Up Debug Logs**:
   - ✅ `src/integrations/supabase/client.ts` - already clean
   - ✅ `src/components/staff/EmployeeTimeline.tsx` - already clean
   - ✅ Deleted temporary diagnostic files

3. **Created Verification Script**: `verify_timeline_fix.sql`

---

## 🎯 What You Need to Do

### Step 1: Apply the Migration

1. Open **Supabase SQL Editor**: https://supabase.com/dashboard/project/gjlgaufihseaagzmidhc/sql
2. Copy the contents of `supabase/migrations/20251010000000_fix_timeline_generator.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Watch the console output - you should see:
   ```
   🔄 Regenerating timeline for all employees...
     ✅ Employee [id]: X events
     ✅ Employee [id]: X events
     ...
   🎉 Complete! Regenerated X total events
   
   📊 Data Quality Report:
   ═══════════════════════════════════════
   salary_increase (X events):
     - Salary: X/X (100%)
     - Hours: X/X (XX%)
     ...
   ```

### Step 2: Verify the Fix

Run the verification script `verify_timeline_fix.sql` in Supabase SQL Editor:

**Expected Results:**
- ✅ Overall salary coverage: >50%
- ✅ Overall hours coverage: >50%
- ✅ `salary_change` events: 100% salary coverage
- ✅ `hours_change` events: 100% hours coverage
- ✅ Adéla Jarošová's timeline: populated `salary_at_event` and `hours_at_event`
- ✅ JSONB structure includes `"monthly_wage"` and `"hours_per_week"` keys

### Step 3: Test in Browser

1. **Hard Refresh**: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. Open Adéla Jarošová's staff profile
3. Scroll to "Employment Timeline"
4. **Verify Timeline Cards Show**:
   ```
   ┌─────────────────────────────────────────┐
   │ Salary Increase                         │
   │ Salary increased by €200                │
   │                                         │
   │ ┌───────┬──────────┬────────┐          │
   │ │ Bruto │ Neto ~   │ Hours  │          │
   │ │ €2600 │ €1820    │ 36h    │          │
   │ │ /month│ estimated│ /week  │          │
   │ └───────┴──────────┴────────┘          │
   │                                         │
   │ 1 Jan 2024                              │
   └─────────────────────────────────────────┘
   ```
5. **Check Console** - should see NO errors like:
   - ❌ ~~`salary_at_event: undefined`~~
   - ❌ ~~`hours_at_event: undefined`~~
   - ✅ Should see: `salary: 2600, salary_source: 'timeline_cache'`

### Step 4: Test Event Click

1. Click on a timeline card
2. **Verify slide panel opens** with:
   - Full contract text (for contract events)
   - Addendum details (for change events) showing Bruto/Neto
3. No console errors

---

## 🐛 Troubleshooting

### If timeline cards still show empty:

**Check 1: Did migration run successfully?**
```sql
-- Check if function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'generate_timeline_v2';
```
Should return the NEW function (not the old one)

**Check 2: Is data in timeline table?**
```sql
SELECT COUNT(*), 
       COUNT(salary_at_event), 
       COUNT(hours_at_event)
FROM employes_timeline_v2;
```
All counts should be > 0

**Check 3: Is Adéla's data there?**
```sql
SELECT * FROM employes_timeline_v2 
WHERE employee_id = 'ee6427c2-39eb-4129-a090-1a3cca81af4e'
LIMIT 5;
```
Should show populated `salary_at_event` and `hours_at_event`

### If you see "Cannot read property 'monthly_wage' of undefined":

This means the JSONB structure is wrong. Check:
```sql
SELECT 
  jsonb_typeof(previous_value) as prev_type,
  jsonb_typeof(new_value) as new_type,
  previous_value,
  new_value
FROM employes_timeline_v2 
WHERE employee_id = 'ee6427c2-39eb-4129-a090-1a3cca81af4e'
LIMIT 1;
```

Both should be `"object"` and should have keys `"monthly_wage"` and `"hours_per_week"`.

---

## 📸 What Success Looks Like

1. **Database**: All timeline events have `salary_at_event` and/or `hours_at_event` populated
2. **Console**: No "undefined" logs, source indicators show `'timeline_cache'`
3. **UI**: Timeline cards display the Bruto/Neto/Hours grid for all relevant events
4. **Slide Panel**: Opens with full details when clicking events

---

## 🎉 After Verification

Once everything works:
1. Take a screenshot of Adéla's timeline showing the data
2. Commit the migration file
3. Create a PR with the fix

**Commit message suggestion**:
```
fix: populate salary and hours in timeline generator

- Extract salary from metadata.new_monthly for all events
- Extract hours from metadata.new_hours for all events  
- Structure previous_value/new_value as JSONB with field names
- Regenerate timeline for all employees

Fixes #[issue-number] - Timeline cards not showing salary/hours data
```

---

## 📋 Files Changed

**Added:**
- `supabase/migrations/20251010000000_fix_timeline_generator.sql`
- `verify_timeline_fix.sql` (temporary, can delete after verification)
- `TIMELINE_FIX_DEPLOYMENT.md` (this file, can delete after deployment)

**Deleted:**
- `check_timeline_data.sql` (temporary diagnostic)
- `check_data_sources.sql` (temporary diagnostic)
- `verify_adela_data.sql` (temporary diagnostic)
- `ADELA_DATA_VERIFICATION.md` (temporary doc)

**No code changes needed** - all frontend code already has the fallback logic in place!

---

Ready to deploy! 🚀

