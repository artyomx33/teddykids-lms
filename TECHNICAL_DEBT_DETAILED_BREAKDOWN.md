# 📋 Technical Debt - Detailed Breakdown & Fix Guide

## Part 1: CRITICAL DATABASE ISSUES

### Critical Issue #1: Missing `staff_document_compliance` Table

#### Current State
**Files Affected**:
- `src/components/dashboard/AppiesInsight.tsx` (line 77-79)
- `src/components/staff/StaffActionCards.tsx` (line 37)

**Current Code** (AppiesInsight.tsx):
```typescript
const { data: docCounts } = useQuery<DocumentCounts>({
  queryKey: ["appies-doc-counts"],
  retry: false,
  queryFn: async () => {
    // TODO: CONNECT - staff_document_compliance table not available yet
    log.mockData('AppiesInsight', 'staff_document_compliance needs connection');
    return { any_missing: 0, missing_count: 0, total_staff: 80 };
  },
});
```

#### Required Database Schema

```sql
-- Create document compliance tracking table
CREATE TABLE public.staff_document_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  -- Document types: 'ID', 'Contract', 'Medical', 'Background Check', 'Insurance', etc.
  required BOOLEAN DEFAULT true,
  document_path TEXT,
  uploaded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'submitted', 'verified', 'expired', 'rejected')),
  verified_by UUID REFERENCES staff(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(staff_id, document_type)
);

-- Index for common queries
CREATE INDEX idx_staff_document_compliance_staff_id 
  ON staff_document_compliance(staff_id);
CREATE INDEX idx_staff_document_compliance_status 
  ON staff_document_compliance(status);
CREATE INDEX idx_staff_document_compliance_expires 
  ON staff_document_compliance(expires_at);

-- Materialized view for dashboard widget
CREATE MATERIALIZED VIEW public.staff_document_summary AS
SELECT 
  s.id as staff_id,
  s.full_name,
  COUNT(*) FILTER (WHERE sdc.status IN ('pending', 'rejected')) as missing_count,
  COUNT(*) FILTER (WHERE sdc.expires_at IS NOT NULL AND sdc.expires_at < NOW()) as expired_count,
  COUNT(*) FILTER (WHERE sdc.status = 'verified' OR (sdc.status = 'submitted' AND sdc.expires_at > NOW())) as valid_count,
  COUNT(*) as total_documents
FROM staff s
LEFT JOIN staff_document_compliance sdc ON s.id = sdc.staff_id
GROUP BY s.id, s.full_name;

CREATE INDEX idx_staff_document_summary_staff_id ON staff_document_summary(staff_id);
```

#### Updated Component Code

```typescript
const { data: docCounts } = useQuery<DocumentCounts>({
  queryKey: ["appies-doc-counts"],
  retry: 2,
  queryFn: async () => {
    try {
      const { data: counts, error } = await supabase
        .from('staff_document_summary')
        .select('missing_count, valid_count, total_documents')
        .match({ staff_id: staffId });
      
      if (error) throw error;
      
      return {
        any_missing: (counts?.[0]?.missing_count ?? 0) > 0,
        missing_count: counts?.[0]?.missing_count ?? 0,
        total_staff: counts?.[0]?.total_documents ?? 0
      };
    } catch (error) {
      console.error('Document compliance query failed:', error);
      return { any_missing: false, missing_count: 0, total_staff: 0 };
    }
  },
});
```

#### Implementation Steps
1. Run migration to create table and views
2. Add RLS policies for document access
3. Update AppiesInsight.tsx to use real data
4. Update StaffActionCards.tsx to use real data
5. Add error boundary around widget
6. Test with sample data

---

### Critical Issue #2: Missing `staff.is_intern` Column

#### Current State
**Files Affected**:
- `src/components/analytics/PredictiveInsights.tsx` (line 46-49)
- `src/components/dashboard/InternWatchWidget.tsx` (line 17-19)

**Current Code** (PredictiveInsights.tsx):
```typescript
const { data: internData = [] } = useQuery({
  queryKey: ["predictive-intern-data"],
  retry: false,
  queryFn: async () => {
    // TODO: CONNECT - staff.is_intern column not available yet
    // Returning mock data until database column is created
    // Silently use mock data - controlled by LOG_CONFIG.mockData;
    return [];
  },
});
```

#### Required Database Migration

```sql
-- Add intern tracking columns to staff table
ALTER TABLE public.staff 
ADD COLUMN is_intern BOOLEAN DEFAULT false,
ADD COLUMN intern_cohort_id UUID REFERENCES intern_cohorts(id),
ADD COLUMN intern_start_date TIMESTAMPTZ,
ADD COLUMN intern_end_date TIMESTAMPTZ,
ADD COLUMN expected_graduation TIMESTAMPTZ;

-- Create intern cohorts table (if not exists)
CREATE TABLE IF NOT EXISTS public.intern_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  program_type TEXT NOT NULL, -- 'Summer', 'Full-time', 'Academic Year', etc.
  start_date DATE NOT NULL,
  end_date DATE,
  requirements JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for intern queries
CREATE INDEX idx_staff_is_intern ON staff(is_intern);
CREATE INDEX idx_staff_intern_cohort_id ON staff(intern_cohort_id);
CREATE INDEX idx_staff_expected_graduation ON staff(expected_graduation);

-- View for intern analytics
CREATE VIEW public.intern_analytics AS
SELECT 
  s.id,
  s.full_name,
  s.intern_cohort_id,
  ic.year,
  ic.program_type,
  s.intern_start_date,
  s.expected_graduation,
  EXTRACT(MONTH FROM s.expected_graduation - NOW()) as months_to_graduation,
  COUNT(DISTINCT sr.id) as review_count,
  AVG(sr.star_rating) as avg_rating
FROM staff s
LEFT JOIN intern_cohorts ic ON s.intern_cohort_id = ic.id
LEFT JOIN staff_reviews sr ON s.id = sr.staff_id
WHERE s.is_intern = true
GROUP BY s.id, s.full_name, s.intern_cohort_id, ic.year, ic.program_type, 
         s.intern_start_date, s.expected_graduation;
```

#### Updated Component Code

```typescript
const { data: internData = [] } = useQuery({
  queryKey: ["predictive-intern-data"],
  retry: 2,
  queryFn: async () => {
    try {
      const { data, error } = await supabase
        .from('intern_analytics')
        .select('*')
        .order('expected_graduation', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Intern data query failed:', error);
      // Fail gracefully - don't return mock data
      return [];
    }
  },
});
```

#### Implementation Steps
1. Create intern_cohorts table
2. Add columns to staff table
3. Run data migration for existing interns (manual identification)
4. Update PredictiveInsights.tsx
5. Update InternWatchWidget.tsx
6. Create views and indexes
7. Add RLS policies
8. Enable Phase 4 features

---

### Critical Issue #3: Verify `contracts_enriched_v2` Data

#### Current State
**Investigation Needed**:
- 22 files query `contracts_enriched_v2` 
- `src/pages/Staff.tsx` (line 40): "contracts_enriched_v2 is empty anyway"
- No errors logged but data might be stale

#### Diagnostic Query

```sql
-- Check if table exists and has data
SELECT 
  EXISTS(SELECT 1 FROM contracts_enriched_v2 LIMIT 1) as table_has_data,
  COUNT(*) as record_count,
  COUNT(DISTINCT staff_id) as unique_staff,
  MAX(updated_at) as last_update,
  MIN(created_at) as first_record
FROM contracts_enriched_v2;

-- Check for data freshness
SELECT 
  EXTRACT(DAYS FROM NOW() - MAX(updated_at)) as days_since_last_update
FROM contracts_enriched_v2;

-- Check for sync issues
SELECT status, COUNT(*) 
FROM contracts_enriched_v2 
GROUP BY status;
```

#### Required Verification Checklist
- [ ] Table exists and has recent data
- [ ] All staff records are represented
- [ ] Join relationships are correct
- [ ] Indexes are performing well
- [ ] RLS policies are applied correctly
- [ ] Refresh function is working

#### Fix If Empty

```typescript
// In any component using contracts_enriched_v2:
const { data: enrichedContracts } = useQuery({
  queryKey: ["enriched-contracts"],
  retry: 3, // Add retry logic
  queryFn: async () => {
    try {
      const { data, error } = await supabase
        .from('contracts_enriched_v2')
        .select('*')
        .limit(1);
      
      if (!data || data.length === 0) {
        console.warn('contracts_enriched_v2 appears empty, triggering refresh');
        // Trigger refresh function
        await supabase.rpc('refresh_contracts_enriched_v2');
        // Retry query
        const retry = await supabase
          .from('contracts_enriched_v2')
          .select('*');
        return retry.data || [];
      }
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching enriched contracts:', error);
      throw error; // Don't silently fail
    }
  },
});
```

---

## Part 2: HIGH PRIORITY - Mock Data Fallbacks

### Pattern Analysis: Where Mock Data Lives

#### Dashboard Mock Pattern (5 files)

**Files**:
- `src/components/dashboard/AppiesInsight.tsx` - Returns `[]`
- `src/components/dashboard/InternWatchWidget.tsx` - Returns `[]`
- `src/components/dashboard/TeddyStarsWidget.tsx` - Fallback pattern
- `src/components/dashboard/BirthdayWidget.tsx` - Silently handles errors
- `src/components/dashboard/ContractComplianceWidget.tsx` - Silently handles errors

**Pattern Detection**:
```typescript
// ❌ BAD: Returns empty without explanation
return [];

// ❌ BAD: Silent error handling
console.log('Silently query staff data - no logs needed');

// ❌ BAD: Controlled mock data
log.mockData('component', 'reason');
```

**Fix Template**:
```typescript
// ✅ GOOD: Explicit error handling with fallback
const { data = [] } = useQuery({
  queryFn: async () => {
    try {
      const { data, error } = await supabase.from('table').select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Show error in UI, don't silently fail
      throw error;
    }
  },
});
```

---

#### Insights Mock Data (src/pages/Insights.tsx)

**Current State** (Lines 28, 40, 51-52):
```typescript
problems.push({ full_name: 'Mock Staff A' }, { full_name: 'Mock Staff B' });
opportunities += 4; // Mock count
console.log('Insights: staff.is_intern column error, using mock intern count');
opportunities += Math.floor(8 * 0.3); // Mock: 8 interns, 30% ready
```

**Fix Required**:
```typescript
// Replace with actual queries
const { data: problemStaff = [] } = useQuery({
  queryKey: ['problem-staff'],
  queryFn: async () => {
    const { data } = await supabase
      .from('staff')
      .select('id, full_name, last_review_date')
      .gt('days_since_review', 90) // Staff needing reviews
      .limit(5);
    return data || [];
  }
});

const { data: readyInterns = [] } = useQuery({
  queryKey: ['ready-interns'],
  queryFn: async () => {
    const { data } = await supabase
      .from('intern_analytics')
      .select('id')
      .eq('is_intern', true)
      .gte('months_to_graduation', 0)
      .lt('months_to_graduation', 3); // Graduating within 3 months
    return data || [];
  }
});

opportunities = readyInterns.length;
```

---

#### TeamMoodMapping Component (src/pages/labs/TeamMoodMapping.tsx)

**Issue**: 69+ lines of hardcoded mock data controlling entire component

**Current Code** (Lines 69+):
```typescript
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Developer',
    department: 'Engineering',
    // ... 20 properties
  },
  // ... 10 more mock entries
];

const teamMembers = mockTeamMembers; // Hard-coded!
```

**Fix Strategy** (Replace with real data):
```typescript
const { data: teamMembers = [] } = useQuery({
  queryKey: ['team-members-mood'],
  queryFn: async () => {
    const { data } = await supabase
      .from('staff')
      .select(`
        id,
        full_name: name,
        role,
        department,
        status: employment_status
      `);
    return data || [];
  }
});

// Mood data from separate analytics table
const { data: moodData = {} } = useQuery({
  queryKey: ['team-mood'],
  queryFn: async () => {
    const { data } = await supabase
      .from('staff_mood_tracking')
      .select('*')
      .gte('measured_at', new Date(Date.now() - 24*60*60*1000)); // Last 24h
    
    return Object.fromEntries(
      (data || []).map(m => [m.staff_id, m])
    );
  }
});
```

**Note**: This is a LABS feature, so migration can happen gradually

---

## Part 3: MEDIUM PRIORITY - Logger TODOs

### Logger Re-enable Pattern (23 instances)

**Affected Files**:
```
src/components/dashboard/AppiesInsight.tsx (6 instances)
src/components/assessment/CandidateAssessmentDashboard.tsx (1)
src/pages/labs/TalentAcquisition.tsx (1)
src/lib/staff.ts (1)
src/components/reviews/PerformanceAnalytics.tsx (multiple)
```

**Example Pattern**:
```typescript
// logger.debug('dashboardWidgets', 'Fetching top performers'); 
// TODO: Re-enable when logger is back
```

#### Options to Resolve

**Option A: Remove the comments** (if logger is not coming back)
```typescript
// Just delete these lines - they're noise
```

**Option B: Restore logger functionality**
```typescript
import { logger } from '@/lib/logger';

logger.debug('dashboardWidgets', 'Fetching top performers');
```

**Option C: Replace with console.debug** (temporary)
```typescript
if (process.env.DEBUG) {
  console.debug('dashboardWidgets', 'Fetching top performers');
}
```

#### Recommendation
**Decision Needed**: Is logger coming back or not?
- If YES: Restore it properly
- If NO: Remove all commented logger lines (search/replace)
- If MAYBE: Replace with conditional console.debug

---

## Part 4: LOW PRIORITY - Incomplete Features

### Feature Completion Status

| Feature | Location | Status | Work Required |
|---------|----------|--------|-----------------|
| AI Insights | `src/hooks/talent/useAiInsights.ts:123` | 🔴 TODO | Call AI endpoint |
| Email Integration | `src/lib/api/hiring.ts:513` | 🔴 TODO | SendGrid integration |
| Wage Calculation | `src/pages/StaffProfile.tsx:168` | 🟡 Partial | Complete formula |
| Gamification | `src/pages/labs/Gamification.tsx:642` | 🟡 Partial | Power-up logic |
| Contract DNA | `src/pages/labs/ContractDNA.tsx:109` | 🟡 Partial | Satisfaction calc |
| Alternative Salaries | `src/lib/CaoService.ts:259` | 🟡 Partial | Matching logic |

### AI Insights Implementation

**Current Code** (useAiInsights.ts:123):
```typescript
// TODO: Call AI service endpoint
return [];
```

**Required Implementation**:
```typescript
const { data: aiInsights } = useQuery({
  queryKey: ['ai-insights', candidateId],
  queryFn: async () => {
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        body: JSON.stringify({ candidateId }),
      });
      
      if (!response.ok) throw new Error('AI service error');
      return await response.json();
    } catch (error) {
      console.error('AI insights failed:', error);
      return {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        confidenceScore: 0
      };
    }
  }
});
```

---

## Part 5: Component Refactoring Priorities

### ReviewForm.tsx - 917 Lines (CRITICAL for MEDIUM priority)

**Current Issues** (per AGENT_component-refactoring-architect.md):
- 30+ state variables
- Multiple responsibilities
- No error boundaries
- Mixed concerns (UI, data, validation, API)

**Refactoring Strategy**:
1. Extract 5 custom hooks (form, validation, API, templates, calculations)
2. Split into 8 sub-components
3. Add error boundaries
4. Move business logic to separate module

**Estimated Effort**: 4-6 hours

---

### Error Boundary Coverage Gaps

**Current Gap Analysis**:
- 🔴 Page-level: Missing
- 🟡 Feature-level: Partial
- 🟡 Section-level: Partial
- 🟡 Component-level: Partial

**Priority Implementation**:
1. Add page-level boundaries for Dashboard, Staff, Insights
2. Add feature boundaries for Reviews, Assessment, Employes
3. Add section boundaries for risky sections

---

## Part 6: Implementation Roadmap

### Week 1: Database Work (CRITICAL)
- [ ] Day 1: Create `staff_document_compliance` table + view
- [ ] Day 2: Add `is_intern` columns to staff + create intern_cohorts
- [ ] Day 3: Verify `contracts_enriched_v2` and fix if empty
- [ ] Day 4: Test all database changes
- [ ] Day 5: Write migrations + rollback procedures

### Week 2-3: Component Updates (HIGH)
- [ ] Update AppiesInsight.tsx to use real data
- [ ] Update InternWatchWidget.tsx to use real data
- [ ] Update PredictiveInsights.tsx to use real data
- [ ] Fix Insights.tsx mock data
- [ ] Add error boundaries to all dashboard widgets

### Week 4: Feature Completion (MEDIUM)
- [ ] Implement email integration
- [ ] Enable AI service endpoint
- [ ] Fix wage calculations
- [ ] Complete gamification logic

### Ongoing: Code Quality (LOW)
- [ ] Refactor ReviewForm (917 lines)
- [ ] Remove logger comment noise or restore logger
- [ ] Archive backup files
- [ ] Implement keyboard navigation

---

## Summary Statistics

### By Complexity
- **5 minutes**: Remove logger comments (23 instances)
- **2 hours**: Fix mock data patterns (5 files)
- **4 hours**: Database schema work (3 critical issues)
- **8 hours**: Component updates (6 files)
- **6 hours**: Feature completion (4 features)
- **12 hours**: Major refactoring (ReviewForm + error boundaries)

**Total Effort**: ~40 hours for full remediation

### By Impact
- **Critical**: Fixes 3 database blockers
- **High**: Improves data quality in 5+ components
- **Medium**: Completes 4 features + improves resilience
- **Low**: Improves code quality and maintainability

---

**Next Action**: Prioritize and create sprint tasks from this roadmap
