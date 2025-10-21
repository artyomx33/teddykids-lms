# Fix All 5 Critical Issues

**Date**: October 17, 2025  
**Status**: Ready for Architect Review  
**Priority**: HIGH - Multiple user-reported bugs blocking testing

---

## Issue 1: Review Form Card Layout Not Visible (Browser Cache)

**Root Cause**: Changes to `ReviewForm.tsx` ARE committed (verified via git diff) but not visible in browser. This is a Vite dev server cache issue.

**Fix**:
1. Clear Vite cache: Remove `.vite` directory
2. Restart dev server with cache cleared

**Action**: User needs to:
```bash
rm -rf node_modules/.vite
# Then restart the dev server
```

The card layout changes ARE in the code (lines 401-420 show Card components with emoji headers), but Vite isn't serving the updated version.

**Evidence**:
- Git diff confirms Card/CardHeader/CardContent wrappers added
- Emoji headers (📝, 💭, 🎨, ⭐, 🎯, ✍️) present in code
- User sees OLD plain layout in browser

---

## Issue 2: Schedule Review API Error

**Root Cause**: `ScheduleReviewDialog.tsx` line 64-70 attempts to insert into `review_schedules` table. The error "Failed to schedule review" suggests:
- Table doesn't exist, OR
- Required fields are missing, OR
- RLS policy blocking insert

**Investigation Needed**: Check console for full error message details to identify exact cause.

**Likely Fix**: The `review_schedules` table may not have been created in migrations. Need to verify table exists and has correct schema.

**File**: `src/components/reviews/ScheduleReviewDialog.tsx`

**Console Error**: 
```
Failed to schedule review: Object
```

**Migration Check Required**: Verify `20251006110000_complete_fresh_start.sql` or subsequent migrations created `review_schedules` table.

---

## Issue 3: Drag-and-Drop Highlights All Rows

**Root Cause**: `StaffDocumentsTab.tsx` lines 229-248 - Child `TableCell` elements trigger `onDragOver` repeatedly, causing state updates that highlight multiple rows during a single drag operation.

**User Report**: "drag and drop still all is highlighted, document is not preselected on drop"

**Fix**: Add `pointer-events: none` to child elements during drag state.

**File**: `src/components/staff/StaffDocumentsTab.tsx`

**Change** line 264 from:
```tsx
>
  {/* Document Type */}
  <TableCell>
```

To:
```tsx
>
  {/* Document Type */}
  <TableCell style={{ pointerEvents: dragOverRow ? 'none' : 'auto' }}>
```

Apply same to ALL `TableCell` elements inside the row (lines 266, 274, 278, etc.).

**Why This Works**: Prevents child elements from triggering drag events, ensuring only the parent `TableRow` handles drag state.

---

## Issue 4: Interns Page Using Mock Data

**Root Cause**: `src/pages/Interns.tsx` lines 16-54 use hardcoded `mockInterns` array instead of querying database.

**User Report**: "interns... this is still mock data... (perhaps because no employes are marked as intern?) but then list should be empty..."

**Fix**: Replace mock data with real query to `staff_with_lms_data` where `is_intern = true`.

**File**: `src/pages/Interns.tsx`

**Changes**:
1. Remove lines 16-54 (mockInterns array)
2. Add React Query hook to fetch real interns:
```tsx
const { data: interns = [], isLoading } = useQuery({
  queryKey: ['interns'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('staff_with_lms_data')
      .select('*')
      .eq('is_intern', true)
      .order('full_name');
    
    if (error) throw error;
    
    // Transform to match component structure
    return data?.map(staff => ({
      id: staff.id,
      name: staff.full_name,
      year: staff.intern_year || 1,
      department: staff.lms_location || 'Unassigned',
      startDate: staff.start_date || '',
      mentor: staff.mentor_name,
      email: staff.email,
      progress: 0, // TODO: Calculate from documents
      completedDocuments: 0,
      totalDocuments: 0
    })) || [];
  }
});
```

3. Update component to show empty state if no interns found (not mock data)
4. Add imports: `import { useQuery } from "@tanstack/react-query";` and `import { supabase } from "@/integrations/supabase/client";`

**Expected Behavior**: If no staff marked as `is_intern = true`, show empty state, not fake data.

---

## Issue 5: Contract Compliance Shows IDs Instead of Names

**Root Cause**: `ContractComplianceWidget.tsx` line 76 queries `staff_with_lms_data` using `.in('id', employeeIds)`, but `employeeIds` contains API employee IDs from `employes_timeline_v2.employee_id`, not UUIDs. The lookup should use `employes_id` field.

**User Report**: "contract compliance still shows ids"

**File**: `src/components/dashboard/ContractComplianceWidget.tsx`

**Fix** line 74-77:
```tsx
// BEFORE:
const { data: staffData, error: staffError } = await supabase
  .from('staff_with_lms_data')
  .select('id, full_name, employes_id')
  .in('id', employeeIds);

// AFTER:
const { data: staffData, error: staffError } = await supabase
  .from('staff_with_lms_data')
  .select('id, full_name, employes_id')
  .in('employes_id', employeeIds);
```

**Why This Works**: `employes_timeline_v2.employee_id` stores the API employee ID (e.g., "12345"), which matches `staff_with_lms_data.employes_id`, NOT the UUID in `staff_with_lms_data.id`.

**Impact**: Line 193's `staffMap.get(contract.employee_id)` will now find the correct mapping.

---

## Implementation Order

1. **Issue 1** (Cache) - User clears cache and restarts server - **USER ACTION REQUIRED**
2. **Issue 5** (Contract names) - Quick one-line fix - 1 minute
3. **Issue 4** (Interns) - Replace mock data with query - 5 minutes
4. **Issue 3** (Drag-drop) - Add pointer-events style - 3 minutes
5. **Issue 2** (Schedule review) - Investigate error, likely need migration - 10-15 minutes

**Total Estimated Time**: 20-25 minutes (after user clears cache)

---

## Testing Checklist

After fixes:
- [ ] Review form shows colored cards with emojis (📝💭🎨⭐🎯✍️)
- [ ] Schedule review saves without error
- [ ] Drag-drop highlights ONLY the hovered row
- [ ] Interns page shows real data (or empty if none)
- [ ] Contract compliance shows employee names (not IDs)

---

## Architecture Notes for Review

**Design Patterns Used**:
- React Query for data fetching (Issue 4)
- Inline styles for dynamic UI state (Issue 3)
- Database view abstraction (`staff_with_lms_data`) for clean queries
- Proper field mapping between API data and LMS data

**Questions for Architect**:
1. Should we add a migration to create `review_schedules` table if missing? (Issue 2)
2. Is `pointer-events: none` the best approach for drag state, or should we use event.stopPropagation()? (Issue 3)
3. Should interns progress/documents be calculated or stored? (Issue 4)

---

## Files to Modify

1. `src/components/dashboard/ContractComplianceWidget.tsx` - Line 76 (1 change)
2. `src/pages/Interns.tsx` - Lines 16-105 (remove mock, add query)
3. `src/components/staff/StaffDocumentsTab.tsx` - Lines 266+ (add pointer-events to all TableCell)
4. TBD: Migration file for `review_schedules` table (Issue 2)

---

**Status**: Awaiting architect approval to proceed with implementation.

