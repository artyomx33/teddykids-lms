# Staff Management System - Critical Fixes (FINAL)

## Overview

Fix all disconnected features with simplified architecture. Staff VIEW is read-only from employes_raw_data, so create employee_info table for LMS-specific data.

---

## Issue 1: Manual Timeline Events for Historical Contracts

**Problem**: No way to add historical paper/PDF contracts from before 2004 to employee timeline.

**Solution**: Add manual events directly to `employes_timeline_v2` with new event_type "manual_adjustment".

### Changes Required:

1. **Database Migration - Add manual event support**
   ```sql
   -- Add columns for manual entries
   ALTER TABLE employes_timeline_v2 
   ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT false,
   ADD COLUMN IF NOT EXISTS manual_notes TEXT,
   ADD COLUMN IF NOT EXISTS contract_pdf_path TEXT,
   ADD COLUMN IF NOT EXISTS created_by UUID;
   
   COMMENT ON COLUMN employes_timeline_v2.is_manual IS 'True for manually added historical events';
   ```

2. **Create ManualTimelineEventDialog component**
   - Location: `src/components/staff/ManualTimelineEventDialog.tsx`
   - Fields:
     - Event date (date picker)
     - Event type: "manual_adjustment" (fixed)
     - Monthly gross salary (€, number)
     - Hours per week (number)
     - Contract PDF upload (file upload)
     - Notes (optional textarea)
   - Insert with: `event_type = 'manual_adjustment'`, `is_manual = true`

3. **Update EmployeeTimeline.tsx** (line 400-450)
   - Add "Add Historical Event" button in header
   - Query fetches all events from `employes_timeline_v2` (automatic + manual)
   - Style manual events:
     - Background: `bg-pink-50 border-pink-300` (pink theme)
     - Badge: "MANUAL" with pink styling
     - Automatic events keep grey/blue theme
   - Display uploaded PDF as downloadable link if present

4. **Update timeline display logic** (line 600-650)
   - Check `is_manual` flag or `event_type === 'manual_adjustment'`
   - Render TimelineEventCard with pink styling for manual events
   - Show "Historical Entry" label

---

## Issue 2: Document Drag & Drop Upload

**Problem**: Can only upload via button - want drag onto specific document rows.

**Solution**: Add drag-and-drop zone on each table row + reorder functionality.

### Changes Required:

1. **Update StaffDocumentsTab.tsx** (lines 150-330)
   - Add state: `const [dragOverRow, setDragOverRow] = useState<string | null>(null);`
   - Add to each TableRow:
     ```typescript
     onDragOver={(e) => {
       e.preventDefault();
       e.stopPropagation();
       setDragOverRow(doc.type_id);
     }}
     onDragLeave={() => setDragOverRow(null)}
     onDrop={(e) => {
       e.preventDefault();
       const files = e.dataTransfer.files;
       if (files.length > 0) {
         handleUpload(doc.type_id);
       }
       setDragOverRow(null);
     }}
     className={`cursor-pointer transition-colors ${
       dragOverRow === doc.type_id 
         ? 'border-2 border-primary bg-primary/5' 
         : 'border-b hover:bg-muted/50'
     }`}
     ```

2. **Add drag-to-reorder (optional enhancement)**
   - Install: `npm install @dnd-kit/core @dnd-kit/sortable`
   - Add GripVertical icon to left of each row
   - Wrap table in DndContext
   - Save new order to database

3. **Visual feedback**
   - Show upload icon when dragging over valid row
   - Highlight row border in primary color
   - Add "Drop to upload" text overlay

---

## Issue 3: Review Form Layout Redesign (ALL Review Types)

**Problem**: Current review form doesn't match clean segmented design.

**Solution**: Apply card-based layout to ALL review types - consistent UI, different content per type.

### Changes Required:

1. **Restructure ReviewForm.tsx** (entire file)
   - Wrap each section in Card component
   - Use consistent spacing: `space-y-6` between cards, `p-6` inside cards
   - Section order for all types:
     1. Template Questions Card
     2. Self-Assessment: Reflect & Respond Card (emoji 💭)
     3. DISC Personality Check-in Card (emoji 🎨)
     4. Type-specific Cards (warning levels, promotion criteria, etc.)
     5. Performance Assessment Card
     6. Goals & Development Card
     7. Review Summary Card

2. **Card Headers**
   - Use emoji + title format from screenshot
   - Examples:
     - "💭 Self-Assessment: Reflect & Respond"
     - "🎨 DISC Personality Check-in"  
     - "⭐ Performance Assessment"
     - "🎯 Goals & Development"
   - Subtle background colors per section

3. **Keep ALL existing functionality**
   - All 8 review types (probation, 6-month, yearly, performance, exit, promotion, salary, warning)
   - Each type keeps its specific questions and logic
   - Warning reviews: keep warning level selection
   - Promotion reviews: keep readiness scoring
   - **Only layout changes**, no functional changes

---

## Issue 4: Document Expiry - Make Optional (SIMPLIFIED)

**Problem**: All documents force expiry date even when not applicable.

**Solution**: Make expiry date field optional - no code changes needed, just make field optional.

### Changes Required:

1. **Update DocumentUploadDialog** (find component)
   - Remove `required` attribute from expiry date field
   - Add helper text: "Leave blank if document doesn't expire"
   - Allow form submission with null expiry date

2. **Update StaffDocumentsTab.tsx display**
   - Line ~100-120: In Expires column logic:
     ```typescript
     {doc.expires_at ? (
       format(new Date(doc.expires_at), 'MM/dd/yyyy')
     ) : (
       <span className="text-muted-foreground text-sm">No expiry</span>
     )}
     ```
   - Don't show expiry warnings for docs with null expires_at

3. **No database migration needed**
   - expires_at column already allows NULL
   - Existing functionality supports optional expiry

---

## Issue 5: Timeline Click Integration - Fix Data Binding

**Problem**: Timeline side panel opens but fields are empty.

**Solution**: Pass complete event data to slide panel and fix field mappings.

### Changes Required:

1. **Find TimelineEventSlidePanel component**
   - Search: `grep -r "SlidePanel\|SidePanel" src/components/staff/`
   - Likely: `TimelineEventPanel.tsx` or `EventDetailPanel.tsx`

2. **Update EmployeeTimeline.tsx event click handler** (line ~320-340)
   - Verify event object passed has all fields:
     - `month_wage_at_event`
     - `hours_per_week_at_event` (note: was `hours_at_event` in table)
     - `contract_type_at_event`
     - `role_at_event`
     - `department_at_event`
   - Pass full event object: `onClick={() => handleEventClick(event)}`

3. **Fix slide panel component**
   - Update field mappings to match database column names
   - Example fixes:
     - `event.monthlyWage` → `event.month_wage_at_event`
     - `event.hoursPerWeek` → `event.hours_per_week_at_event`
     - `event.contractType` → `event.contract_type_at_event`
   - Add null checks for optional fields

4. **Test both event types**
   - Contract events (have salary, hours)
   - Addendum events (may have different fields)
   - Manual events (have manual_notes, contract_pdf_path)

---

## Issue 6: Staff Location Assignment - Create employee_info Table

**Problem**: Cannot save location because staff is a VIEW from employes_raw_data.

**Solution**: Create `employee_info` table for LMS-specific data (location, is_intern, etc.).

### Current Architecture:

- `staff` VIEW = Read-only from `employes_raw_data` (single source of truth from Employes.nl)
- Fields: id, employes_id, full_name, email, birth_date, role, department, status, location
- Location in VIEW comes from API data (read-only)

### Solution: Create employee_info Table

1. **Database Migration - Create employee_info table**
   ```sql
   CREATE TABLE IF NOT EXISTS employee_info (
     staff_id UUID PRIMARY KEY,
     
     -- LMS-specific overrides
     assigned_location TEXT,
     is_intern BOOLEAN DEFAULT false,
     intern_year INTEGER,
     
     -- Future expansion
     custom_role TEXT,
     notes TEXT,
     tags TEXT[],
     
     -- Metadata
     updated_at TIMESTAMPTZ DEFAULT now(),
     updated_by UUID,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   
   COMMENT ON TABLE employee_info IS 'LMS-specific employee data that overrides or extends Employes.nl data';
   
   -- Trigger for updated_at
   CREATE TRIGGER update_employee_info_updated_at
     BEFORE UPDATE ON employee_info
     FOR EACH ROW
     EXECUTE FUNCTION update_updated_at_column();
   
   GRANT SELECT, INSERT, UPDATE ON employee_info TO authenticated;
   ```

2. **Update staff VIEW to include employee_info**
   ```sql
   CREATE OR REPLACE VIEW staff_with_lms_data AS
   SELECT 
     s.*,
     ei.assigned_location,
     ei.is_intern,
     ei.intern_year,
     ei.custom_role,
     -- Use assigned_location if set, otherwise fall back to API location
     COALESCE(ei.assigned_location, s.location) as effective_location
   FROM staff s
   LEFT JOIN employee_info ei ON s.id = ei.staff_id;
   ```

3. **Update BulkLocationAssignment.tsx** (line 58-62)
   ```typescript
   const { error } = await supabase
     .from("employee_info")
     .upsert(
       selectedStaffIds.map(id => ({ 
         staff_id: id, 
         assigned_location: selectedLocation,
         updated_at: new Date().toISOString()
       })),
       { onConflict: 'staff_id' }
     );
   ```

4. **Update frontend queries**
   - Change `from("staff")` to `from("staff_with_lms_data")`
   - Or join employee_info in queries that need location
   - Display `effective_location` in UI

---

## Issue 7: Interns Menu - Wire Up Filter

**Problem**: is_intern field doesn't exist, interns filter not working.

**Solution**: Use employee_info table (from Issue 6) for is_intern field.

### Changes Required:

1. **Populate is_intern data** (same employee_info table)
   - Field already added in Issue 6: `is_intern BOOLEAN`
   - Add UI to mark staff as intern (in staff profile or admin panel)
   - Or auto-detect: salary < threshold, role contains "intern", etc.

2. **Update Staff.tsx query** (line 35-65)
   - Query `staff_with_lms_data` view instead of `staff`
   - Or join employee_info:
     ```typescript
     const { data, error } = await supabase
       .from("staff")
       .select(`
         *,
         employee_info (
           is_intern,
           intern_year,
           assigned_location
         )
       `);
     ```

3. **Update filtering logic** (line 180-190)
   - Current: `filters.internsOnly`
   - Update to check: `staff.employee_info?.is_intern === true`
   - Or if using VIEW: `staff.is_intern === true`

4. **Update StaffFilterBar.tsx**
   - Verify "Interns Only" checkbox works
   - Intern year filter (optional)
   - Update state: `internsOnly: boolean`

5. **Display intern badge** (line 364-369)
   - Already shows GraduationCap icon
   - Verify condition: `staff.is_intern` or `staff.employee_info?.is_intern`
   - Show year: `Y{staff.intern_year || '?'}`

6. **Admin UI to set is_intern** (future enhancement)
   - Add toggle in StaffProfile to mark as intern
   - Set intern year
   - Auto-save to employee_info table

---

## Testing Checklist

1. Manual timeline: Create historical 2010 contract → verify pink card with "MANUAL" badge
2. Document drag-drop: Drag PDF onto VOG row → upload dialog opens with type pre-selected
3. Review form: Create all 8 review types → verify each has clean card layout
4. Document expiry: Upload diploma without expiry → shows "No expiry"
5. Timeline click: Click salary increase event → side panel shows all fields (salary, hours, etc.)
6. Location assignment: Select 2 staff → assign location → verify saved in employee_info and displayed
7. Interns filter: Mark staff as intern → toggle filter → verify list shows only interns

---

## Implementation Order

1. **Issue 6 (employee_info table)** - Foundation for Issues 6 & 7
2. **Issue 7 (Interns filter)** - Uses employee_info from Issue 6  
3. **Issue 4 (Optional expiry)** - Quick fix, just remove required
4. **Issue 5 (Timeline binding)** - Fix existing broken feature
5. **Issue 1 (Manual timeline)** - Add columns and component
6. **Issue 3 (Review form UI)** - Redesign all 8 types
7. **Issue 2 (Drag-drop docs)** - Enhancement, needs library

---

## Database Schema Summary

### New Table: employee_info

Stores LMS-specific employee data that extends Employes.nl data:

| Column | Type | Purpose |
|--------|------|---------|
| staff_id | UUID PK | Links to staff VIEW |
| assigned_location | TEXT | Override Employes.nl location |
| is_intern | BOOLEAN | Mark as intern (for filtering) |
| intern_year | INTEGER | Intern year (Y1, Y2, etc.) |
| custom_role | TEXT | Override role display |
| notes | TEXT | Internal LMS notes |
| tags | TEXT[] | Custom tags |

### Updated Table: employes_timeline_v2

Add manual event support:

| Column | Type | Purpose |
|--------|------|---------|
| is_manual | BOOLEAN | True for manual entries |
| manual_notes | TEXT | Notes for manual events |
| contract_pdf_path | TEXT | Uploaded contract PDF |
| created_by | UUID | Who added manual event |

### New View: staff_with_lms_data

Combines staff + employee_info for complete picture:
- All fields from staff VIEW
- Joined employee_info fields
- `effective_location` = COALESCE(assigned_location, api_location)

---

## Key Decisions

1. **Issue 1**: Use `event_type = 'manual_adjustment'` (not separate table)
2. **Issue 6**: Create `employee_info` table (not modify employes_raw_data)
3. **Issue 7**: Use same `employee_info` table for is_intern
4. Architecture: Keep employes_raw_data as single source of truth, extend with employee_info

---

## Todo List

- [ ] Create employee_info table and staff_with_lms_data view
- [ ] Update BulkLocationAssignment to use employee_info table
- [ ] Wire up interns filter with employee_info data
- [ ] Make document expiry field optional in DocumentUploadDialog
- [ ] Fix data binding in TimelineEventSlidePanel
- [ ] Add manual event columns to employes_timeline_v2 and create ManualTimelineEventDialog
- [ ] Redesign ReviewForm.tsx with card layout for all 8 types
- [ ] Add drag-and-drop to document rows

