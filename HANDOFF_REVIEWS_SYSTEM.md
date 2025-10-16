# 🎯 REVIEWS SYSTEM - Next Phase Development

## 📍 Current Status

**Branch:** `main` (clean, all work merged)  
**Last Major Work:** Dutch Employment Law Compliance System (PR #39) ✅  
**Next Focus:** Reviews System Enhancement

---

## 🎯 Mission: Make Reviews Work + Expand with Review Types

### Goals
1. **Fix/Complete Current Review System** - Make the existing review functionality fully operational
2. **Expand with Review Types** - Add structured review types (probation, 6-month, yearly, exit, custom)
3. **Integrate with Dutch Employment Law** - Ensure reviews comply with Dutch labor regulations

---

## 📊 Current System Architecture

### Database Schema (from migrations)

**Review Tables:**
```sql
-- Main review table
CREATE TABLE staff_reviews (
  id UUID PRIMARY KEY,
  staff_id UUID NOT NULL,
  reviewer_id UUID,
  template_id UUID REFERENCES review_templates(id),
  review_date DATE NOT NULL,
  review_type TEXT CHECK (review_type IN ('probation', 'six_month', 'yearly', 'exit', 'custom')),
  status TEXT CHECK (status IN ('draft', 'completed', 'approved', 'archived')),
  overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  strengths TEXT,
  areas_for_improvement TEXT,
  goals_set JSONB,
  notes TEXT,
  responses JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supporting tables
- review_templates (template system)
- performance_metrics (linked to reviews)
- staff_notes (can link to reviews)
```

**Views:**
```sql
- staff_review_summary (aggregate stats per staff)
- performance_trends (trends over time)
- staff_reviews_needed (who needs reviews)
```

### Frontend Components (src/components/reviews/)

```
src/components/reviews/
├── ReviewForm.tsx              // Main review creation/editing form
├── PerformanceAnalytics.tsx    // Analytics dashboard
└── ReviewCalendar.tsx          // Calendar view of reviews
```

**Integration Points:**
```typescript
// StaffProfile.tsx - Reviews Tab
- Uses useReviews() hook
- Uses useStaffReviewSummary() hook  
- Uses usePerformanceTrends() hook
- Has ReviewForm component with create/edit modes
```

### Data Hooks (src/lib/hooks/useReviews.ts)

```typescript
- useReviews({ staffId? }) - Fetch reviews
- useStaffReviewSummary(staffId) - Get summary stats
- usePerformanceTrends(staffId) - Get performance trends
```

---

## 🔍 Known Issues / Current State

### What Works ✅
1. Database schema is complete and well-designed
2. Review types are defined (probation, six_month, yearly, exit, custom)
3. Frontend components exist (ReviewForm, PerformanceAnalytics, ReviewCalendar)
4. React Query hooks are set up
5. Staff profile has Reviews tab integrated

### What Needs Attention ⚠️
1. **Review System Availability Check** - There's error handling for missing tables/views
2. **Template System** - review_templates table exists but may need population
3. **Review Types Implementation** - Types defined but workflow may need enhancement
4. **Dutch Law Integration** - Need to ensure review timing aligns with labor law
5. **User Experience** - Form flow, validation, and UX polish

### Code Evidence (from StaffProfile.tsx lines 86-97)
```typescript
// Phase 2 Review Data (with error handling for missing tables)
const { data: staffReviews = [], isLoading: reviewsLoading, error: reviewsError } = useReviews({ staffId: id });
const { data: staffSummary, error: summaryError } = useStaffReviewSummary(id);
const { data: performanceTrends = [], error: trendsError } = usePerformanceTrends(id || '');

// Check if review system is available - only hide tabs for critical auth errors, not missing views
const isCriticalError = (error: any) => {
  if (!error) return false;
  return error.code === 'PGRST301' || error.code === '42501' || error.message?.includes('permission denied');
};
const isReviewSystemAvailable = !isCriticalError(reviewsError) && !isCriticalError(summaryError) && !isCriticalError(trendsError);
```

---

## 🎯 Recommended Implementation Approach

### Phase 1: Debug & Fix Current System (Priority: HIGH)
1. **Verify Database State**
   - Check if review tables/views exist
   - Check if sample data exists
   - Test queries from Supabase SQL editor
   
2. **Test Data Hooks**
   - Verify useReviews() returns data
   - Check error states
   - Ensure proper typing

3. **Test UI Components**
   - Can ReviewForm be opened?
   - Can a review be created?
   - Does validation work?

### Phase 2: Review Types Enhancement
1. **Review Type Workflows**
   - Define triggers for each type (employment start date, etc.)
   - Create review scheduling system
   - Link to Dutch employment law timelines

2. **Template System**
   - Create default templates for each review type
   - Allow customization per review type
   - Different questions for probation vs yearly

3. **Automated Reminders**
   - Detect when reviews are due
   - Show in dashboard widgets (AppiesInsight?)
   - Email/notification system

### Phase 3: Dutch Law Integration
1. **Probation Reviews** (1 month, 2 month marks for 2-month probation)
2. **6-Month Check-ins** (Dutch best practice)
3. **Yearly Reviews** (Required for salary discussions)
4. **Exit Reviews** (When contract ends or employee leaves)

---

## 📁 Key Files to Examine

### Frontend
```
src/components/reviews/ReviewForm.tsx          // Main form component
src/components/reviews/PerformanceAnalytics.tsx // Analytics
src/components/reviews/ReviewCalendar.tsx      // Calendar view
src/lib/hooks/useReviews.ts                    // Data fetching
src/pages/StaffProfile.tsx                     // Integration point (lines 86-97, 350-500)
```

### Database
```
supabase/migrations/20251006110000_complete_fresh_start.sql
  - Lines 52-82: staff_reviews table
  - Lines 289-319: staff_review_summary view
  - Lines 307-319: performance_trends view
```

---

## 🚀 Suggested First Steps

### 1. System Health Check (15 mins)
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM staff_reviews;
SELECT COUNT(*) FROM review_templates;
SELECT * FROM staff_reviews LIMIT 5;
SELECT * FROM staff_review_summary LIMIT 5;
```

### 2. Frontend Component Test (10 mins)
- Open Staff Profile page
- Click Reviews tab
- Try to create a new review
- Check console for errors

### 3. Code Review (20 mins)
- Read `src/components/reviews/ReviewForm.tsx`
- Read `src/lib/hooks/useReviews.ts`
- Understand data flow and current implementation

### 4. Plan Enhancement (30 mins)
- Document current state findings
- Design review type workflows
- Create implementation plan for expansion

---

## 🎓 Context: Recent Achievements

### Just Completed ✅
1. **Dutch Employment Law Compliance System**
   - ContractComplianceWidget with legal risk detection
   - AppiesInsight with compliance warnings
   - Timeline system with contract milestones
   - Integrated with employes_timeline_v2

2. **Document Management System**
   - Staff documents with expiry tracking
   - VOG, EHBO, diploma tracking
   - Upload dialogs with inline UX

3. **Navigation & Theme**
   - Labs 2.0 purple theme
   - Theme toggle (dark/light)
   - Complete navigation consolidation

---

## 💡 Technical Patterns to Follow

### Data Fetching (Two-Step Batch Lookup Pattern)
```typescript
// BEST PRACTICE: Always used for joining data
// Step 1: Get core data with IDs
const { data: coreData } = await supabase
  .from('some_table')
  .select('id, employee_id, other_fields');

// Step 2: Batch lookup related data
const employeeIds = [...new Set(coreData.map(item => item.employee_id))];
const { data: enrichmentData } = await supabase
  .from('staff')
  .select('id, full_name')
  .in('id', employeeIds);

// Step 3: Merge with Map for O(1) performance
const dataMap = new Map(enrichmentData?.map(item => [item.id, item]));
const enrichedData = coreData.map(item => ({
  ...item,
  full_name: dataMap.get(item.employee_id)!
}));
```

### Error Handling
- Always use explicit error checks at each step
- Provide meaningful console logs
- Graceful degradation (don't crash, show empty states)

### Type Safety
- Define proper TypeScript types for all data structures
- Use strict typing for review types, status enums

---

## 🎯 Success Criteria

### Must Have
- [ ] Reviews can be created successfully
- [ ] Reviews display in staff profile
- [ ] Review types work as expected
- [ ] Analytics show meaningful data
- [ ] No console errors

### Nice to Have
- [ ] Automated review scheduling
- [ ] Email reminders
- [ ] Review templates per type
- [ ] Dutch law compliance checks

---

## 📞 Quick Commands

```bash
# Check current status
git status
git branch

# Start new feature branch
git checkout -b feature/reviews-enhancement

# Run development server
npm run dev

# Check for TypeScript errors
npm run type-check

# Access Supabase
# URL: https://supabase.com/dashboard/project/[your-project-id]
```

---

## 🚀 Ready to Start!

**Current State:** Clean main branch, all work merged  
**Next Task:** Make reviews work + expand with review types  
**Approach:** Debug → Fix → Enhance → Integrate with Dutch law

**Let's build an amazing review system! 🎯**


