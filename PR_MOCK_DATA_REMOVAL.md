# 🔧 Remove Mock Data & Connect to Real Database Tables

## 📋 Summary

This PR eliminates mock data fallbacks in 4 dashboard/analytics components and connects them to real database tables that already exist in the system.

## 🎯 Problem Solved

Previously, several widgets were using hardcoded mock data instead of querying the actual database:
- **Document compliance** widgets returned `{ any_missing: 0, missing_count: 0, total_staff: 80 }` (fake data)
- **Intern tracking** widgets returned empty arrays `[]` instead of real intern data
- Users couldn't see actual compliance status or intern progress

## ✅ Changes Made

### 1. Document Compliance Fixes (2 files)

#### `src/components/dashboard/AppiesInsight.tsx`
**Before:**
```typescript
// TODO: CONNECT - staff_document_compliance table not available yet
log.mockData('AppiesInsight', 'staff_document_compliance needs connection');
return { any_missing: 0, missing_count: 0, total_staff: 80 };
```

**After:**
```typescript
const { data, error } = await supabase
  .from('staff_docs_status')
  .select('is_compliant, staff_id');

const missingCount = data?.filter(d => !d.is_compliant).length || 0;
return { any_missing: anyMissing, missing_count: missingCount, total_staff: totalStaff };
```

#### `src/components/staff/StaffActionCards.tsx`
- Same fix: Now queries `staff_docs_status` table
- Shows real document compliance counts instead of mock data

### 2. Intern Tracking Fixes (2 files)

#### `src/components/analytics/PredictiveInsights.tsx`
**Before:**
```typescript
// TODO: CONNECT - staff.is_intern column not available yet
// Returning mock data until database column is created
return [];
```

**After:**
```typescript
const { data, error } = await supabase
  .from('staff_with_lms_data')
  .select('id, full_name, intern_year, is_intern')
  .eq('is_intern', true);

return data || [];
```

#### `src/components/dashboard/InternWatchWidget.tsx`
- Same fix: Now queries `staff_with_lms_data` with `is_intern = true`
- Shows real intern data by year
- Removed unused logger imports

### 3. Error Handling Component (1 new file)

#### `src/components/error-boundaries/MissingDataBoundary.tsx`
- Created new component for future data connection errors
- Shows user-friendly error messages with debug info in development
- Ready for use when expanding error boundaries

## 🔍 Technical Details

### Database Tables Used
- **`staff_docs_status`**: Existing table tracking document compliance per staff member
  - Fields: `is_compliant`, `vog_status`, `id_verified`, `contract_signed`, etc.
  - Computed `is_compliant` field based on all required documents
  
- **`staff_with_lms_data`**: Existing view with staff + LMS metadata
  - Fields: `is_intern`, `intern_year`, `full_name`, etc.
  - Already includes intern flag from `employee_info` table

### Error Handling
- All queries now have `retry: 2` for transient failures
- Proper error logging with descriptive messages
- Existing ErrorBoundary wrappers already in place (verified)

## 🧪 Testing

### Manual Testing
✅ Dev server running on port 8082
✅ No TypeScript errors
✅ No linting errors
✅ All components render without crashing

### Expected Behavior
1. **If tables have data**: Widgets show real counts/info
2. **If tables are empty**: Widgets show "0" or "No data" gracefully
3. **If query fails**: ErrorBoundary catches and shows error

## 📊 Impact

### Before
- 4 widgets with hardcoded fake data
- No visibility into real document compliance
- No visibility into real intern status

### After
- 0 widgets with mock data ✅
- Real document compliance tracking ✅
- Real intern progress tracking ✅
- Better error handling with retry logic ✅

## 🚫 Out of Scope (Deferred)

As discussed, **Part 4** (replacing `contracts_enriched_v2` references) is deferred to a separate effort.
- This affects ~22 files
- Requires mapping to replacement tables (`employes_changes`, `cao_salary_history`, etc.)
- Will be handled in a future PR

## 🔗 Related Work

- Technical Debt Sweep: `TECHNICAL_DEBT_SWEEP_COMPLETE.md`
- Database Inventory: `DATABASE_INVENTORY.md`
- Architecture Analysis: `src/agents/AGENT_architecture-analyst.md`

## 📝 Files Changed

```
M  src/components/analytics/PredictiveInsights.tsx
M  src/components/dashboard/AppiesInsight.tsx
M  src/components/dashboard/InternWatchWidget.tsx
M  src/components/staff/StaffActionCards.tsx
A  src/components/error-boundaries/MissingDataBoundary.tsx
```

**Stats**: 5 files changed, 95 insertions(+), 30 deletions(-)

## ✅ Checklist

- [x] Code follows project conventions
- [x] No linting errors
- [x] No TypeScript errors
- [x] Tested locally on port 8082
- [x] All TODOs removed or addressed
- [x] Error handling implemented
- [x] Commit message is descriptive
- [x] Branch synced from main

## 🚀 Deployment Notes

**Safe to deploy**: All changes are backward compatible. If tables are empty, widgets gracefully show "0" instead of crashing.

## 👥 Reviewers

Please verify:
1. Query logic is correct for `staff_docs_status` and `staff_with_lms_data`
2. Error handling is appropriate
3. No performance concerns with the queries

---

**Branch**: `fix/remove-mock-data-add-error-boundaries`  
**Base**: `main`  
**Type**: Bug Fix / Data Connection  
**Priority**: High (fixes mock data issues)

