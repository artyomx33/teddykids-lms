# 🚀 REVIEWS SYSTEM v1.1 - LUNA + GAMIFICATION + DISC INTEGRATION

**Branch:** `feature/2.2-employee-reviews`  
**Date:** October 16, 2025  
**Status:** 🎯 PLAN APPROVED - READY TO BUILD  
**Upgrade:** v1.0 → v1.1 (Legendary Edition)

---

## 🌟 WHAT'S NEW IN v1.1?

### The Upgrade Story

**v1.0** gave us a solid foundation - 6 review templates, proper schema, analytics views.  
**v1.1** transforms reviews into a **legendary talent development engine** that:

✨ **Integrates with Gamification** - XP, coins, achievements, quests  
✨ **Uses DISC Personalities** - Red/Blue/Green/Yellow color-coded insights  
✨ **Feeds Emotional Intelligence** - Empathy, stress tolerance, team mood  
✨ **Includes Self-Assessment** - Staff rate themselves on same metrics  
✨ **Tracks Goals Properly** - Dedicated table, completion rates, milestones  
✨ **Implements Luna's Vision** - Enhanced templates with research-backed metrics

---

## 📊 COMPARISON: v1.0 vs v1.1

| Feature | v1.0 | v1.1 |
|---------|------|------|
| **Review Templates** | 6 basic templates | 6 enhanced templates with Luna's metrics |
| **Self-Assessment** | ❌ None | ✅ Full mirror section + reflection |
| **DISC Integration** | ❌ None | ✅ 3 rotating mini-questions per review |
| **Gamification** | ❌ None | ✅ XP, coins, achievements awarded |
| **Goal Tracking** | JSONB array only | ✅ Dedicated staff_goals table + completion % |
| **Emotional Intelligence** | ❌ None | ✅ 5 EI metrics tracked per review |
| **Team Mood Mapping** | ❌ None | ✅ Mood impact tracking (positive/neutral/needs_support) |
| **Manager vs Self Delta** | ❌ None | ✅ Calculated and stored |
| **Review Triggers** | Manual only | ✅ 6 types: manual, auto, warning, salary, promotion, intervention |
| **Dashboard Widgets** | Basic analytics | ✅ 3 new widgets: Review Readiness, Trend Tracker, Gamified Radar |
| **Database Columns** | 44 columns | **65+ columns** (21 new fields) |

---

## 🎯 THE 6 ENHANCED REVIEW TEMPLATES

### 1. **First-Month Review** (Probation)
**Focus:** Initial impressions, onboarding success, early engagement  
**New Metrics:**
- Adaptability speed (1-5 stars)
- Initiative taken (1-5 stars)
- "How well has the team received this person?" (text)
- 3 rotating DISC mini-questions
- Self-assessment: "How supported do you feel?" (1-5 stars)

**XP Reward:** 250  
**Gamification:** Unlocks "Probation Complete" badge

---

### 2. **6-Month Review**
**Focus:** Performance, team fit, goal progress, DISC evolution  
**New Metrics:**
- Self-assessment questions (mirror all manager metrics)
- "One thing I'm proud of" (text)
- "One thing I want to work on" (text)
- Goal progress from last review (completion %)
- 3 rotating DISC questions

**XP Reward:** 500  
**Gamification:** Unlocks "6-Month Survivor" badge

---

### 3. **Annual Review**
**Focus:** Full performance + growth + career development  
**New Metrics:**
- Goal completion rate % (auto-calculated)
- DISC evolution check: "Still RED-GREEN" or "Shifting toward YELLOW"
- "What would you like to become within Teddy Kids?" (open field)
- Career aspiration tracking
- Leadership readiness scoring

**XP Reward:** 1000  
**Gamification:** Unlocks "Yearly Champion" badge + bonus 250 XP if 4+ stars

---

### 4. **Position/Promotion Review** (replaces "Custom")
**Focus:** Leadership readiness, team impact, growth potential  
**New Metrics:**
- Leadership readiness criteria (structured scoring)
- Team impact assessment (1-5 stars)
- "Why this person could lead others?" (open pitch field)
- Problem-solving maturity (1-5 stars)
- Initiative and ownership (1-5 stars)

**XP Reward:** 1500  
**Gamification:** Unlocks "Rising Star" achievement

---

### 5. **Salary Review / Growth Plan**
**Focus:** Performance stability, financial responsibility, growth path  
**New Metrics:**
- Performance stability over time (trend analysis)
- Initiative tracking (concrete examples)
- Financial responsibility indicators
- "If no raise yet, what to build toward in 3–6 months" (milestones)
- Clear salary recommendation with reasoning

**XP Reward:** 750  
**Gamification:** Unlocks "Growth Minded" badge

---

### 6. **Warning / Intervention Review**
**Focus:** Addressing concerns, support planning, recovery path  
**New Metrics:**
- 3 levels of concern tracking (yellow/orange/red flags)
- Behavior vs impact scoring (separate ratings)
- Support suggestions (structured list)
- Gamified recovery path: "Complete X milestones by date Y"
- Check-in timeline: 1 month, 2 months, or 3 months

**XP Reward:** 0 (recovery focused, not performance)  
**Gamification:** Unlocks "Comeback Kid" badge if improvement shown

---

## 📐 CORE METRICS FRAMEWORK

### Essential Metrics (All Templates)
1. **Teamwork** - Collaboration with colleagues
2. **Communication** - Verbal and written effectiveness
3. **Reliability** - Consistency and dependability
4. **Initiative** - Proactive behavior and ownership
5. **Flexibility** - Adapting to schedule chaos
6. **Professional Behavior** - Timing, dress, hygiene, boundaries
7. **Energy/Positivity** - Enthusiasm and attitude
8. **Routines Followed** - Adherence to procedures
9. **Safety Awareness** - Child safety vigilance
10. **Trust from Team** - Colleague confidence

### Childcare-Specific Metrics
11. **Conflict Handling (Kids)** - Managing child disputes
12. **Conflict Handling (Colleagues)** - Professional conflict resolution
13. **Conflict Handling (Parents)** - Parent communication

### Gamification Metrics (Auto-Populated)
14. **Coins/Stars Earned** - From gamification system
15. **Goals Completed %** - From staff_goals table
16. **DISC Color Balance** - Primary/secondary colors

### Emotional Intelligence Metrics
17. **Empathy** - Understanding others' feelings
18. **Stress Tolerance** - Handling pressure
19. **Emotional Regulation** - Managing own emotions
20. **Team Support** - Supporting colleagues emotionally
21. **Conflict Resolution** - Resolving tensions

---

## 🗄️ DATABASE SCHEMA CHANGES

### New Columns Added to `staff_reviews`

```sql
-- DISC Integration (3 columns)
disc_snapshot JSONB           -- Snapshot of DISC profile at review time
disc_evolution TEXT           -- "Red->Green" if personality shifts
disc_questions_answered JSONB -- Responses to mini-questions

-- Gamification Integration (3 columns)
xp_earned INTEGER             -- XP awarded for this review
coins_earned INTEGER          -- Coins awarded
achievement_ids TEXT[]        -- Badges/achievements unlocked

-- Self-Assessment (3 columns)
self_assessment JSONB         -- Staff's self-ratings
self_rating_average NUMERIC   -- Average of self-ratings
manager_vs_self_delta NUMERIC -- Difference between manager & self

-- Emotional Intelligence (3 columns)
emotional_scores JSONB        -- {empathy: 4, stress_handling: 5, ...}
team_mood_impact TEXT         -- 'positive', 'neutral', 'needs_support'
wellbeing_score INTEGER       -- 1-5 overall wellbeing

-- Review Context (2 columns)
review_trigger_type TEXT      -- manual, auto, warning, salary, promotion, intervention
triggered_by_goal_id UUID     -- If triggered by goal completion

-- Goal Tracking (3 columns)
goal_completion_rate NUMERIC  -- Percentage of goals achieved
goals_achieved INTEGER        -- Count of completed goals
goals_total INTEGER           -- Count of total goals
```

**Total New Columns:** 21  
**Schema Size:** 44 → 65 columns

---

### New Table: `staff_goals`

```sql
CREATE TABLE staff_goals (
  id UUID PRIMARY KEY,
  staff_id UUID NOT NULL,
  goal_text TEXT NOT NULL,
  goal_category TEXT,          -- skill_development, performance, leadership, certification, custom
  created_in_review_id UUID,   -- Which review created this goal
  target_date DATE,
  completed_at TIMESTAMPTZ,
  status TEXT,                 -- active, completed, abandoned, revised
  xp_reward INTEGER,           -- XP earned when completed
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Purpose:** Proper goal tracking instead of JSONB arrays

---

### New Table: `disc_mini_questions`

```sql
CREATE TABLE disc_mini_questions (
  id UUID PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT,          -- scenario, preference, reaction
  options JSONB NOT NULL,      -- [{text: "...", disc_color: "red"}, ...]
  is_active BOOLEAN,
  usage_count INTEGER,         -- Track which questions are shown most
  created_at TIMESTAMPTZ
);
```

**Purpose:** Rotating DISC questions for personality tracking

---

### Enhanced `review_templates` Table

```sql
ALTER TABLE review_templates ADD COLUMN
  disc_injection_enabled BOOLEAN,      -- Show DISC questions?
  self_assessment_required BOOLEAN,    -- Require self-assessment?
  gamification_enabled BOOLEAN,        -- Award XP/coins?
  xp_base_reward INTEGER,              -- Base XP for completion
  emotional_metrics JSONB;             -- Which EI metrics to track
```

---

## 🎮 GAMIFICATION INTEGRATION

### XP Award Calculation

```typescript
// Base XP from template
const baseXP = template.xp_base_reward || 500;

// Performance bonus (4+ stars = +250 XP)
const bonusXP = review.star_rating >= 4 ? 250 : 0;

// Achievement multiplier (each achievement = +100 XP)
const achievementXP = review.achievements?.length * 100 || 0;

// Total XP
const totalXP = baseXP + bonusXP + achievementXP;
```

### Achievement Unlocks

- **"Probation Complete"** - Complete first-month review
- **"6-Month Survivor"** - Complete 6-month review
- **"Yearly Champion"** - Complete annual review
- **"Rising Star"** - Complete promotion review
- **"Growth Minded"** - Complete salary review
- **"Comeback Kid"** - Show improvement after intervention
- **"Top Performer"** - Get 5 stars on annual review
- **"Goal Crusher"** - Achieve 5+ goals in one period
- **"Self-Aware"** - Complete self-assessment with <1.0 delta from manager

---

## 🧠 DISC PERSONALITY INTEGRATION

### DISC Mini-Question Pool (20+ Questions)

**Example Questions:**

1. **"When something breaks during the day, I usually..."**
   - Fix it immediately without asking **(RED)**
   - Find a fun way to adapt the activity **(YELLOW)**
   - Check the routine and make a structured plan **(BLUE)**
   - Ask a colleague and stay calm **(GREEN)**

2. **"When there's conflict in the team, I tend to..."**
   - Step in and take control **(RED)**
   - Avoid it and hope it passes **(GREEN)**
   - Try to explain with facts **(BLUE)**
   - Make a joke or break the tension **(YELLOW)**

3. **"When a child is upset, my first instinct is to..."**
   - Take charge and solve the problem quickly **(RED)**
   - Give them space and be patient **(GREEN)**
   - Follow the calming routine systematically **(BLUE)**
   - Distract them with something fun **(YELLOW)**

**Rotation Logic:**
- Show 3 questions per review
- Prioritize least-shown questions (usage_count)
- Calculate DISC scores from responses
- Compare to last known profile
- Detect evolution: "RED-GREEN → GREEN-YELLOW"

### DISC Profile Display

```typescript
// In ReviewForm
if (staffDISCProfile) {
  // Show: "Jamie is RED-GREEN (Captain Energy + The Heart)"
  // Show: "Last assessed: 6 months ago"
  // Show: "Mini-check reveals: Still RED-GREEN ✓"
  // Or: "Evolution detected: Shifting toward YELLOW 🌟"
}
```

---

## 💭 SELF-ASSESSMENT SECTION

### Layout

```
┌─────────────────────────────────────────┐
│ 🪞 Self-Reflection                      │
│ How do you rate yourself on these?     │
├─────────────────────────────────────────┤
│ [Mirror of all manager metrics]        │
│ • Teamwork: ⭐⭐⭐⭐⭐                    │
│ • Communication: ⭐⭐⭐⭐☆              │
│ • Reliability: ⭐⭐⭐⭐⭐                │
│ ...                                     │
├─────────────────────────────────────────┤
│ One thing I'm proud of:                │
│ [Text area]                            │
├─────────────────────────────────────────┤
│ One thing I want to work on:           │
│ [Text area]                            │
├─────────────────────────────────────────┤
│ How supported do you feel lately?      │
│ ⭐⭐⭐⭐⭐                                │
└─────────────────────────────────────────┘
```

### Manager vs Self Delta

```typescript
// Calculate average difference
const delta = calculateRatingDelta(managerRatings, selfRatings);

// Interpretation:
// < 0.5: Aligned perception ✅
// 0.5-1.0: Minor differences ⚠️
// > 1.0: Significant gap 🚨
```

**Dashboard Widget:** Show staff with largest deltas (coaching opportunity)

---

## 📊 DASHBOARD WIDGETS (NEW)

### 1. Review Readiness Widget

```
┌─────────────────────────────────────────┐
│ 🎯 Review Readiness                     │
├─────────────────────────────────────────┤
│ 🔴 OVERDUE (3)                          │
│   • Sofia Martinez - 2 months overdue   │
│   • Tom Johnson - 1 month overdue       │
│   • Lisa Chen - 3 weeks overdue         │
├─────────────────────────────────────────┤
│ 🟡 SALARY REVIEW DUE (2)                │
│   • Antonella - 80+ performance, no     │
│     raise in 8 months 💰               │
│   • Marcus - Top performer, eligible    │
├─────────────────────────────────────────┤
│ 🟢 PROMOTION READY (1)                  │
│   • Emma - Exceeds criteria, ready     │
│     for senior role 🚀                  │
└─────────────────────────────────────────┘
```

---

### 2. Trend Tracker Widget

```
┌─────────────────────────────────────────┐
│ 📈 Performance Trends (Q4 2025)         │
├─────────────────────────────────────────┤
│ 🔼 IMPROVING (5)                        │
│   • Jamie: 3.5 → 4.5 stars (+1.0)      │
│   • Alex: 4.0 → 4.8 stars (+0.8)       │
│   • Sara: 3.2 → 4.0 stars (+0.8)       │
├─────────────────────────────────────────┤
│ 🔽 DECLINING (2)                        │
│   • Chris: 4.5 → 3.8 stars (-0.7) ⚠️   │
│   • Morgan: 4.0 → 3.5 stars (-0.5)     │
├─────────────────────────────────────────┤
│ ➖ STAGNATING (3)                       │
│   • Taylor: 3.5 → 3.6 (same)           │
├─────────────────────────────────────────┤
│ 🏆 TOP COIN EARNERS                     │
│   • Jamie: +2500 coins (most goals)    │
│   • Antonella: +2200 coins             │
└─────────────────────────────────────────┘
```

---

### 3. Gamified Radar Widget

```
┌─────────────────────────────────────────┐
│ 🎮 Gamification Leaderboard             │
├─────────────────────────────────────────┤
│ 🏅 MOST SELF-ASSESSMENTS                │
│   • Jamie: 4 completed                  │
│   • Antonella: 3 completed              │
├─────────────────────────────────────────┤
│ 🏆 TOP PERFORMER BADGES                 │
│   • Marcus: 2x "Top Performer"          │
│   • Emma: 2x "Top Performer"            │
├─────────────────────────────────────────┤
│ 🔄 DISC REFRESH NEEDED (6)              │
│   • Sofia: Profile 18 months old        │
│   • Tom: Profile 14 months old          │
│   • Lisa: No profile yet ❌             │
├─────────────────────────────────────────┤
│ ⚡ XP LEADERS (This Quarter)            │
│   • Jamie: 3500 XP                      │
│   • Antonella: 3200 XP                  │
│   • Marcus: 2800 XP                     │
└─────────────────────────────────────────┘
```

---

## 🎯 IMPLEMENTATION PHASES

### ✅ Phase 0: Preparation (DONE)
- [x] Research existing systems
- [x] Create comprehensive plan
- [x] Get approval
- [x] Dev server running

---

### 📊 Phase 1: Schema & Seed Data (NEXT)

**Files to Create:**
1. `supabase/migrations/20251016000002_reviews_v11_integration.sql`
   - Add 21 new columns to staff_reviews
   - Create staff_goals table
   - Create disc_mini_questions table
   - Update review_templates table

2. `supabase/migrations/20251016000003_seed_review_templates_v11.sql`
   - Update all 6 templates with new metrics
   - Add xp_base_reward values
   - Add emotional_metrics arrays
   - Enable disc_injection and self_assessment

3. `supabase/migrations/20251016000004_seed_disc_mini_questions.sql`
   - Seed 20+ DISC mini-questions
   - Diverse scenarios covering all 4 colors

**Testing:**
- [ ] Apply migrations in Supabase SQL Editor
- [ ] Verify new columns exist
- [ ] Verify templates updated
- [ ] Verify 20+ DISC questions seeded
- [ ] Check indexes created

---

### 🧩 Phase 2: Core Library Functions

**Files to Create:**
1. `src/lib/reviewMetrics.ts`
   - CORE_METRICS definitions
   - GAMIFICATION_METRICS definitions
   - EMOTIONAL_INTELLIGENCE_METRICS definitions

2. `src/lib/goalTracking.ts`
   - migrateReviewGoalsToTable()
   - calculateGoalCompletionRate()
   - createGoal(), updateGoal(), completeGoal()

3. `src/lib/emotionalIntelligence.ts`
   - mapReviewToEmotionalProfile()
   - aggregateTeamMoodFromReviews()
   - calculateWellbeingTrend()

4. `src/lib/discIntegration.ts`
   - fetchDISCProfile()
   - calculateDISCFromMiniQuestions()
   - detectDISCEvolution()

**Testing:**
- [ ] Unit test each function
- [ ] Test goal migration with sample data
- [ ] Test DISC calculation accuracy
- [ ] Test EI aggregation

---

### 🎨 Phase 3: UI Components

**Files to Create:**
1. `src/components/reviews/SelfAssessmentSection.tsx`
   - Mirror manager metrics
   - "Proud of" / "Want to work on" fields
   - "How supported" star rating

2. `src/components/reviews/DISCMiniQuestions.tsx`
   - Fetch 3 random questions
   - Display scenario options
   - Calculate DISC scores
   - Show evolution

3. `src/components/reviews/GoalProgressTracker.tsx`
   - List previous goals
   - Checkboxes for completion
   - Add new goals section
   - Calculate completion %

4. `src/components/reviews/GamificationPreview.tsx`
   - Show XP to be earned
   - Show potential achievements
   - Progress bar
   - "Complete this to unlock..." teaser

5. `src/components/reviews/EmotionalMetricsSection.tsx`
   - 5 EI metrics with star ratings
   - Wellbeing score (1-5)
   - Team mood impact selector

**Testing:**
- [ ] Test each component in isolation
- [ ] Test with mock data
- [ ] Verify visual design matches Teddy Kids theme

---

### 🔗 Phase 4: Integration & Enhanced Form

**Files to Modify:**
1. `src/components/reviews/ReviewForm.tsx`
   - Add SelfAssessmentSection
   - Add DISCMiniQuestions
   - Add GoalProgressTracker
   - Add GamificationPreview
   - Add EmotionalMetricsSection
   - Update save logic

2. `src/lib/hooks/useReviews.ts`
   - Add useStaffGoals()
   - Add useDISCMiniQuestions()
   - Add useStaffDISCProfile()
   - Update useCreateReview() to include new fields
   - Add useCompleteGoal()

**Testing:**
- [ ] Create a review end-to-end
- [ ] Verify all sections save correctly
- [ ] Check DISC questions rotate
- [ ] Verify goals are created in database

---

### 🎮 Phase 5: Gamification Integration

**Files to Modify:**
1. `src/pages/labs/Gamification.tsx`
   - Add awardReviewXP() function
   - Listen for review completion
   - Update character XP automatically

**Files to Create:**
1. `src/lib/achievementUnlock.ts`
   - checkAchievementCriteria()
   - unlockAchievement()
   - sendAchievementNotification()

**Testing:**
- [ ] Complete review and verify XP awarded
- [ ] Verify achievement unlocked
- [ ] Check character level updates
- [ ] Test coin award

---

### 📊 Phase 6: Dashboard Widgets

**Files to Create:**
1. `src/components/dashboard/ReviewReadinessWidget.tsx`
2. `src/components/dashboard/TrendTrackerWidget.tsx`
3. `src/components/dashboard/GamifiedRadarWidget.tsx`

**Files to Modify:**
1. `src/pages/Dashboard.tsx`
   - Add new widgets to grid

**Testing:**
- [ ] Verify widgets show correct data
- [ ] Test with various data scenarios
- [ ] Check performance with large datasets

---

### 📈 Phase 7: Analytics Enhancement

**Files to Modify:**
1. `src/components/reviews/PerformanceAnalytics.tsx`
   - Add "DISC Evolution" tab
   - Add "Self vs Manager" tab
   - Add "Goal Trends" tab
   - Add "Emotional Intelligence Radar" tab

**Testing:**
- [ ] Test each new tab
- [ ] Verify charts render correctly
- [ ] Test with multiple reviews over time

---

### 🧪 Phase 8: End-to-End Testing

**Test Scenarios:**
1. Complete first-month review (probation)
2. Complete 6-month review with goals from previous
3. Complete annual review with DISC evolution
4. Complete promotion review
5. Complete salary review
6. Complete intervention review

**Verify:**
- [ ] XP awarded correctly
- [ ] Goals created in database
- [ ] DISC snapshot saved
- [ ] Self-assessment captured
- [ ] Emotional scores saved
- [ ] Manager vs self delta calculated
- [ ] Goal completion rate accurate
- [ ] Dashboard widgets update
- [ ] Gamification system reflects changes

---

## 🔄 MIGRATION PATH v1.0 → v1.1

### Backward Compatibility

✅ **All v1.0 reviews remain functional**
- Old reviews display correctly
- New columns are nullable
- No data loss

### Backfill Tasks

1. **Convert JSONB goals to staff_goals table**
```sql
INSERT INTO staff_goals (staff_id, goal_text, created_in_review_id, status)
SELECT 
  sr.staff_id,
  jsonb_array_elements_text(sr.goals_next),
  sr.id,
  'active'
FROM staff_reviews sr
WHERE sr.goals_next IS NOT NULL AND jsonb_array_length(sr.goals_next) > 0;
```

2. **Link staff to DISC profiles (if they exist)**
```sql
UPDATE staff_reviews sr
SET disc_snapshot = (
  SELECT jsonb_build_object(
    'primary', ta.color_primary,
    'secondary', ta.color_secondary,
    'counts', ta.color_counts
  )
  FROM ta_applicants ta
  WHERE ta.staff_id = sr.staff_id
)
WHERE EXISTS (
  SELECT 1 FROM ta_applicants WHERE staff_id = sr.staff_id
);
```

3. **Calculate goal completion rates for existing reviews**
```sql
-- Logic to calculate based on goals_next vs goals_previous
```

---

## 🎯 SUCCESS CRITERIA

### Must Have ✅
- [ ] All 21 new columns added and working
- [ ] 6 enhanced templates functional
- [ ] Self-assessment section saves correctly
- [ ] DISC mini-questions rotate properly
- [ ] Goals tracked in staff_goals table
- [ ] XP awarded after review completion
- [ ] Emotional scores captured
- [ ] Manager vs self delta calculated

### Nice to Have 🌟
- [ ] All 3 dashboard widgets working
- [ ] DISC evolution timeline visualization
- [ ] Goal completion gamification active
- [ ] Team mood heatmap by location
- [ ] Automated review reminders

---

## 📞 QUICK REFERENCE

### Dev Server
```bash
npm run dev
# Opens on http://localhost:8080
```

### Database
```bash
# Apply migrations
# Use Supabase SQL Editor: https://supabase.com/dashboard/project/gjlgaufihseaagzmidhc

# Verify schema
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'staff_reviews' 
ORDER BY ordinal_position;
```

### Git
```bash
git status
git add .
git commit -m "feat(reviews): Phase X complete"
```

---

## 🚀 LET'S BUILD!

**Current Status:** Phase 0 Complete ✅  
**Next Up:** Phase 1 - Schema & Seed Data  
**Dev Server:** Running on http://localhost:8080 ✅

**Ready when you are!** 🔥

