# 🗄️ Review System - Complete Database Schema

## Overview

Complete database schema for the TeddyKids LMS Review System including all tables, columns, relationships, constraints, and views.

**System Version**: v1.1  
**Last Updated**: October 20, 2025  
**Migration Files**: `supabase/migrations/2025101600000*.sql`

---

## 📊 Core Tables

### 1. `staff_reviews` - Main Reviews Table

**Purpose**: Stores all staff performance reviews

```sql
CREATE TABLE staff_reviews (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  template_id UUID REFERENCES review_templates(id) ON DELETE SET NULL,
  
  -- Review Classification
  review_type TEXT NOT NULL CHECK (review_type IN (
    'probation', 'six_month', 'yearly', 'exit', 
    'performance', 'promotion_review', 'salary_review', 'warning'
  )),
  
  -- Status Management
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'scheduled', 'in_progress', 'completed', 
    'approved', 'overdue', 'cancelled', 'archived'
  )),
  
  -- Scheduling Fields
  review_period_start DATE,
  review_period_end DATE,
  review_date DATE NOT NULL,
  due_date DATE,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Response Data
  responses JSONB DEFAULT '{}'::jsonb,
  
  -- Performance Assessment
  summary TEXT,
  goals_previous JSONB DEFAULT '[]'::jsonb,
  goals_next JSONB DEFAULT '[]'::jsonb,
  development_areas JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  
  -- Scoring
  overall_score NUMERIC(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5 OR star_rating IS NULL),
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  
  -- Performance Level
  performance_level TEXT CHECK (performance_level IN (
    'exceptional', 'exceeds', 'meets', 'below', 'unsatisfactory'
  )),
  
  -- Recommendations
  promotion_ready BOOLEAN DEFAULT false,
  salary_recommendation TEXT CHECK (salary_recommendation IN (
    'increase', 'maintain', 'review', 'decrease'
  )),
  
  -- Signatures
  signed_by_employee BOOLEAN DEFAULT false,
  signed_by_reviewer BOOLEAN DEFAULT false,
  employee_signature_date TIMESTAMPTZ,
  reviewer_signature_date TIMESTAMPTZ,
  
  -- Document Storage
  document_path TEXT,
  
  -- === v1.1 FIELDS - GAMIFICATION ===
  xp_earned INTEGER DEFAULT 0,
  gamification_level_achieved INTEGER,
  gamification_badges_unlocked JSONB DEFAULT '[]'::jsonb,
  gamification_achievements JSONB DEFAULT '[]'::jsonb,
  
  -- === v1.1 FIELDS - DISC PERSONALITY ===
  disc_snapshot JSONB,  -- Full DISC profile at review time
  disc_evolution TEXT CHECK (disc_evolution IN ('evolving', 'stable', 'significant_change')),
  disc_questions_answered JSONB DEFAULT '[]'::jsonb,
  disc_responses JSONB DEFAULT '{}'::jsonb,
  
  -- === v1.1 FIELDS - EMOTIONAL INTELLIGENCE ===
  emotional_scores JSONB,  -- {empathy, stress_tolerance, emotional_regulation, team_support, conflict_resolution}
  wellbeing_score NUMERIC(3,2) CHECK (wellbeing_score >= 1.0 AND wellbeing_score <= 5.0),
  
  -- === v1.1 FIELDS - SELF ASSESSMENT ===
  self_assessment JSONB,  -- Staff's own perspective before manager review
  self_assessment_completed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes**:
```sql
CREATE INDEX idx_staff_reviews_staff_id ON staff_reviews(staff_id);
CREATE INDEX idx_staff_reviews_reviewer_id ON staff_reviews(reviewer_id);
CREATE INDEX idx_staff_reviews_template_id ON staff_reviews(template_id);
CREATE INDEX idx_staff_reviews_review_date ON staff_reviews(review_date);
CREATE INDEX idx_staff_reviews_due_date ON staff_reviews(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_staff_reviews_status ON staff_reviews(status);
CREATE INDEX idx_staff_reviews_review_type ON staff_reviews(review_type);
CREATE INDEX idx_staff_reviews_star_rating ON staff_reviews(star_rating) WHERE star_rating IS NOT NULL;
CREATE INDEX idx_staff_reviews_performance_level ON staff_reviews(performance_level) WHERE performance_level IS NOT NULL;
```

---

### 2. `review_templates` - Review Templates

**Purpose**: Defines templates/types of reviews with questions and criteria

```sql
CREATE TABLE review_templates (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template Identification
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'probation', 'six_month', 'yearly', 'exit', 'performance', 'custom'
  )),
  
  -- Template Content
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  criteria JSONB DEFAULT '{}'::jsonb,
  scoring_method TEXT DEFAULT 'five_star' CHECK (scoring_method IN (
    'five_star', 'percentage', 'qualitative'
  )),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- === v1.1 TEMPLATE SETTINGS ===
  disc_injection_enabled BOOLEAN DEFAULT false,
  self_assessment_required BOOLEAN DEFAULT false,
  xp_reward INTEGER DEFAULT 0,
  badge_unlocked TEXT,
  emotional_intelligence_metrics JSONB DEFAULT '[]'::jsonb,
  gamification_metrics JSONB DEFAULT '[]'::jsonb,
  goal_tracking_enabled BOOLEAN DEFAULT true,
  warning_levels_enabled BOOLEAN DEFAULT false,
  promotion_criteria JSONB,
  salary_review_fields JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes**:
```sql
CREATE INDEX idx_review_templates_type ON review_templates(type);
CREATE INDEX idx_review_templates_is_active ON review_templates(is_active);
```

---

### 3. `review_schedules` - Review Scheduling

**Purpose**: Manages future scheduled reviews

```sql
CREATE TABLE review_schedules (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  staff_id UUID NOT NULL,  -- No FK constraint for flexibility
  template_id UUID REFERENCES review_templates(id) ON DELETE SET NULL,
  
  -- Scheduling
  next_due_date DATE NOT NULL,
  auto_schedule BOOLEAN DEFAULT true,
  grace_period_days INTEGER DEFAULT 7,
  reminder_days_before INTEGER DEFAULT 14,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Tracking
  last_completed_review_id UUID REFERENCES staff_reviews(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Note**: `frequency_months` column exists in migration file but is **not required** for basic scheduling. Removed from app to simplify.

**Indexes**:
```sql
CREATE INDEX idx_review_schedules_staff_id ON review_schedules(staff_id) WHERE is_active = true;
CREATE INDEX idx_review_schedules_next_due_date ON review_schedules(next_due_date) WHERE is_active = true;
CREATE INDEX idx_review_schedules_template_id ON review_schedules(template_id) WHERE template_id IS NOT NULL;
```

---

### 4. `disc_mini_questions` - DISC Assessment Questions

**Purpose**: Stores rotating DISC personality mini-questions for reviews

```sql
CREATE TABLE disc_mini_questions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Question Content
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'scenario' CHECK (question_type IN (
    'scenario', 'preference', 'reaction', 'style'
  )),
  
  -- Options as JSONB
  options JSONB NOT NULL,
  -- Format: [
  --   {"text": "Option text", "disc_color": "red", "points": 3},
  --   {"text": "Option text", "disc_color": "blue", "points": 3},
  --   {"text": "Option text", "disc_color": "green", "points": 3},
  --   {"text": "Option text", "disc_color": "yellow", "points": 3}
  -- ]
  
  -- Usage Tracking (for rotation)
  usage_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**:
```sql
CREATE INDEX idx_disc_mini_questions_usage_count ON disc_mini_questions(usage_count);
CREATE INDEX idx_disc_mini_questions_is_active ON disc_mini_questions(is_active);
```

**Total Questions Seeded**: 25 questions (see `review_questions.md`)

---

### 5. `staff_goals` - Goal Tracking

**Purpose**: Tracks goals set during reviews

```sql
CREATE TABLE staff_goals (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  review_id UUID REFERENCES staff_reviews(id) ON DELETE SET NULL,
  
  -- Goal Content
  goal_text TEXT NOT NULL,
  category TEXT,  -- e.g., 'professional_development', 'performance', 'skill_building'
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'completed', 'abandoned', 'deferred'
  )),
  
  -- Tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  target_date DATE,
  completed_date DATE,
  
  -- Gamification
  xp_reward INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**:
```sql
CREATE INDEX idx_staff_goals_staff_id ON staff_goals(staff_id);
CREATE INDEX idx_staff_goals_review_id ON staff_goals(review_id);
CREATE INDEX idx_staff_goals_status ON staff_goals(status);
```

---

## 📈 Views

### 1. `overdue_reviews` - Overdue Reviews Dashboard

**Purpose**: Show all overdue reviews with urgency levels

```sql
CREATE OR REPLACE VIEW overdue_reviews AS
SELECT 
  sr.id,
  sr.staff_id,
  sr.review_type,
  sr.review_date,
  sr.due_date,
  sr.status,
  sr.reviewer_id,
  CURRENT_DATE - sr.due_date as days_overdue,
  CASE 
    WHEN CURRENT_DATE - sr.due_date > 30 THEN 'critical'
    WHEN CURRENT_DATE - sr.due_date > 14 THEN 'high'
    WHEN CURRENT_DATE - sr.due_date > 7 THEN 'medium'
    ELSE 'low'
  END as urgency_level
FROM staff_reviews sr
WHERE sr.due_date < CURRENT_DATE
  AND sr.status NOT IN ('completed', 'approved', 'cancelled', 'archived')
ORDER BY sr.due_date ASC;
```

---

### 2. `review_calendar_unified` - Calendar Events View

**Purpose**: Unified calendar view combining reviews and contract events

```sql
CREATE VIEW review_calendar_unified AS
-- Completed Reviews (Green)
SELECT 
  CONCAT('review-completed-', sr.id) AS event_id,
  sr.review_date AS event_date,
  sr.review_date::date AS event_day,
  'review_completed' AS event_type,
  sr.staff_id,
  sr.review_type,
  sr.status,
  COALESCE(s.full_name, 'Unknown Staff') AS label,
  format('Review completed on %s', to_char(sr.review_date, 'YYYY-MM-DD')) AS description,
  'green'::text AS color,
  jsonb_build_object(
    'review_id', sr.id,
    'review_date', sr.review_date,
    'template_id', sr.template_id,
    'review_type', sr.review_type
  ) AS metadata
FROM staff_reviews sr
LEFT JOIN staff s ON sr.staff_id = s.id
WHERE sr.review_date IS NOT NULL
  AND sr.status IN ('completed', 'approved')

UNION ALL

-- Scheduled Reviews (Amber)
SELECT 
  CONCAT('review-scheduled-', sr.id) AS event_id,
  sr.due_date AS event_date,
  sr.due_date::date AS event_day,
  'review_scheduled' AS event_type,
  sr.staff_id,
  sr.review_type,
  sr.status,
  COALESCE(s.full_name, 'Unknown Staff') AS label,
  format('Review scheduled for %s', to_char(sr.due_date, 'YYYY-MM-DD')) AS description,
  'amber'::text AS color,
  jsonb_build_object(
    'review_id', sr.id,
    'due_date', sr.due_date,
    'template_id', sr.template_id,
    'review_type', sr.review_type
  ) AS metadata
FROM staff_reviews sr
LEFT JOIN staff s ON sr.staff_id = s.id
WHERE sr.due_date IS NOT NULL
  AND sr.status IN ('scheduled', 'in_progress')

UNION ALL

-- Warning/Exit Reviews (Red)
SELECT 
  CONCAT('review-warning-', sr.id) AS event_id,
  COALESCE(sr.due_date, sr.review_date) AS event_date,
  COALESCE(sr.due_date, sr.review_date)::date AS event_day,
  'review_warning' AS event_type,
  sr.staff_id,
  sr.review_type,
  sr.status,
  COALESCE(s.full_name, 'Unknown Staff') AS label,
  format('Warning/exit review: %s', sr.review_type) AS description,
  'red'::text AS color,
  jsonb_build_object(
    'review_id', sr.id,
    'due_date', sr.due_date,
    'review_date', sr.review_date,
    'template_id', sr.template_id,
    'review_type', sr.review_type
  ) AS metadata
FROM staff_reviews sr
LEFT JOIN staff s ON sr.staff_id = s.id
WHERE sr.review_type IN ('warning', 'exit')

UNION ALL

-- Contract Events from Timeline (Purple)
SELECT
  CONCAT('contract-', etv.id::text) AS event_id,
  etv.event_date,
  etv.event_date::date AS event_day,
  etv.event_type,
  etv.employee_id AS staff_id,
  NULL::text AS review_type,
  'info'::text AS status,
  COALESCE(
    s.full_name,
    CONCAT_WS(' ', etv.first_name_at_event, etv.last_name_at_event),
    initcap(replace(etv.event_type, '_', ' '))
  ) AS label,
  COALESCE(
    etv.event_description,
    etv.manual_notes,
    format('%s change recorded', initcap(replace(etv.event_type, '_', ' ')))
  ) AS description,
  'purple'::text AS color,
  jsonb_build_object(
    'timeline_event_id', etv.id,
    'contract_pdf', etv.contract_pdf_path,
    'hours_per_week', etv.hours_per_week_at_event,
    'gross_monthly', etv.gross_monthly_at_event
  ) AS metadata
FROM employes_timeline_v2 etv
LEFT JOIN staff s ON etv.employee_id = s.id
WHERE etv.event_date IS NOT NULL;
```

---

### 3. `staff_goal_stats` - Goal Completion Statistics

**Purpose**: Aggregate goal statistics per staff member

```sql
CREATE OR REPLACE VIEW staff_goal_stats AS
SELECT 
  staff_id,
  COUNT(*) as total_goals,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_goals,
  COUNT(*) FILTER (WHERE status = 'active') as active_goals,
  COUNT(*) FILTER (WHERE status = 'abandoned') as abandoned_goals,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'completed')::numeric / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as completion_rate_percent,
  COALESCE(SUM(xp_reward) FILTER (WHERE status = 'completed'), 0) as total_xp_from_goals
FROM staff_goals
GROUP BY staff_id;
```

---

## 🔗 Relationships

### Entity Relationship Diagram

```
staff
  ├── staff_reviews (staff_id) [1:many]
  ├── staff_reviews (reviewer_id) [1:many]
  ├── review_schedules (staff_id) [1:many]
  └── staff_goals (staff_id) [1:many]

review_templates
  ├── staff_reviews (template_id) [1:many]
  └── review_schedules (template_id) [1:many]

staff_reviews
  └── staff_goals (review_id) [1:many]

disc_mini_questions
  └── staff_reviews.disc_questions_answered (referenced in JSONB)
```

---

## 📋 JSONB Field Schemas

### 1. `staff_reviews.responses`
```json
{
  "question_id_1": "answer_value",
  "question_id_2": 4,
  "question_id_3": ["multiple", "values"],
  "custom_field": "any value"
}
```

### 2. `staff_reviews.goals_next`
```json
[
  {
    "goal_text": "Complete leadership training",
    "category": "professional_development",
    "target_date": "2025-12-31",
    "priority": "high"
  }
]
```

### 3. `staff_reviews.disc_snapshot`
```json
{
  "profile": "Blue-Green",
  "primary_color": "blue",
  "secondary_color": "green",
  "scores": {
    "red": 8,
    "blue": 22,
    "green": 18,
    "yellow": 12
  },
  "traits": ["Analytical", "Supportive", "Detail-oriented"],
  "measured_at": "2025-10-20T10:30:00Z"
}
```

### 4. `staff_reviews.emotional_scores`
```json
{
  "empathy": 4.5,
  "stress_tolerance": 3.8,
  "emotional_regulation": 4.2,
  "team_support": 4.7,
  "conflict_resolution": 3.9
}
```

### 5. `staff_reviews.self_assessment`
```json
{
  "strengths": ["Team collaboration", "Time management"],
  "areas_for_growth": ["Public speaking", "Conflict resolution"],
  "achievements_noted": ["Led successful project", "Mentored 2 interns"],
  "goals_suggested": ["Complete certification", "Lead team workshop"],
  "overall_satisfaction": 4,
  "comments": "Feeling confident in role, ready for more responsibility"
}
```

### 6. `review_templates.questions`
```json
[
  {
    "id": "q1",
    "text": "How would you rate this employee's communication skills?",
    "type": "rating",
    "required": true,
    "min": 1,
    "max": 5
  },
  {
    "id": "q2",
    "text": "Describe the employee's key achievements this period",
    "type": "textarea",
    "required": true,
    "max_length": 1000
  }
]
```

### 7. `disc_mini_questions.options`
```json
[
  {
    "text": "Take charge and solve quickly",
    "disc_color": "red",
    "points": 3
  },
  {
    "text": "Follow established procedures",
    "disc_color": "blue",
    "points": 3
  },
  {
    "text": "Provide emotional support",
    "disc_color": "green",
    "points": 3
  },
  {
    "text": "Use creative distractions",
    "disc_color": "yellow",
    "points": 3
  }
]
```

---

## 🎯 TypeScript Interfaces

### TypeScript types for all schemas available in:
`src/lib/hooks/useReviews.ts` (lines 8-197)

Key interfaces:
- `Review` - Full review object
- `ReviewTemplate` - Template definition
- `ReviewSchedule` - Scheduling object
- `CreateReviewData` - Create review payload
- `UpdateReviewData` - Update review payload

---

## 🚀 Migration Files

### Complete Migration Sequence:

1. `20251016000000_fix_reviews_system_schema.sql` - Core schema
2. `20251016000002_reviews_v11_integration.sql` - v1.1 features
3. `20251016000004_seed_disc_mini_questions.sql` - DISC questions (25 questions)
4. `20251019210000_fix_review_schedules_fk_constraint.sql` - FK fixes
5. `20251019230000_fix_reviews_v11_complete_schema.sql` - Complete schema

---

## 📊 UI Components Using This Schema

### Components:
- `ReviewCalendar` - Uses `review_calendar_unified` view
- `ScheduleReviewDialog` - Creates `review_schedules`
- `ReviewForm` - Creates/updates `staff_reviews`
- `OverdueDashboard` - Uses `overdue_reviews` view
- `ReviewFormDialog` - Orchestrates review creation

### Hooks:
- `useReviews()` - List reviews
- `useReviewCalendar()` - Calendar events
- `useOverdueReviews()` - Overdue reviews
- `useReviewSchedules()` - Scheduled reviews
- `useCreateReview()` - Create review
- `useUpdateReview()` - Update review
- `useCompleteReview()` - Complete review
- `useCreateReviewSchedule()` - Schedule review

---

*Schema documented: October 20, 2025*  
*Ready for UI upgrade work*  
*All tables, views, and relationships mapped*

