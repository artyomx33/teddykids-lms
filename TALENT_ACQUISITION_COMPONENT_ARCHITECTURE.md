# 🎯 Talent Acquisition Page - Component Architecture & Data Flow

> **Page URL:** `http://localhost:8081/labs/talent`  
> **Main File:** `/src/pages/labs/TalentAcquisition.tsx`  
> **Status:** Beta - AI-Powered Hiring Pipeline  
> **Purpose:** Complete talent acquisition workflow from application to staff integration

---

## 📊 Overview

The Talent Acquisition page is a comprehensive hiring management system that handles:
- Candidate application submissions via DISC assessment widget
- Assessment dashboard for candidate review
- AI-powered insights and recommendations
- Analytics and reporting
- Template management for assessments
- Approval workflow leading to staff system integration

---

## 🏗️ Main Page Structure

### **TalentAcquisition.tsx** (707 lines)

**Location:** `/src/pages/labs/TalentAcquisition.tsx`

#### Purpose:
Master orchestrator that brings together all talent acquisition components into a unified workflow.

#### Key Responsibilities:
1. **Tab Management**: Manages 6 main tabs (Candidates, Analytics, AI Insights, Approval, Templates, Dashboard)
2. **State Management**: Tracks candidates, selected candidate, tab state, widget visibility
3. **Mock Data**: Provides sample data for development (will connect to real APIs)
4. **Quick Stats Display**: Shows 6 KPI cards (Total Applications, Active, Hired, Time to Hire, Conversion Rate, Top Source)

#### Tab Structure:
```typescript
<Tabs>
  1. Candidates Tab → CandidateAssessmentDashboard
  2. Analytics Tab → AssessmentAnalytics
  3. AI Insights Tab → AiInsightsEngine (requires candidate selection)
  4. Approval Tab → ApprovalWorkflowSystem (requires candidate selection)
  5. Templates Tab → AssessmentTemplateBuilder
  6. Dashboard Tab → Overview with pipeline stats
</Tabs>
```

#### State Flow:
```
User selects candidate from Candidates tab
  → selectedCandidateId is set
  → Tab switches to AI Insights or Approval
  → Component receives candidateId prop
  → Displays detailed analysis/workflow
```

#### Key Methods:
- `onCandidateSelect(candidateId)` - Switches to AI Insights tab
- `onStatusChange(candidateId, newStatus)` - Updates candidate status
- `onReviewAssign(candidateId, reviewerId)` - Assigns reviewer
- `onBulkAction(candidateIds, action)` - Bulk operations

---

## 🧩 Component 1: CandidateAssessmentDashboard

**File:** `/src/components/assessment/CandidateAssessmentDashboard.tsx` (863 lines)

### Purpose:
Primary interface for viewing, filtering, and managing all candidates in the hiring pipeline.

### Functionality:
1. **Candidate Cards Display**
   - Shows all candidates with avatar, name, email, position
   - Displays assessment scores (0-100%)
   - Shows AI match score
   - Progress bars for in-progress assessments
   - Status badges (pending, in_progress, completed, etc.)

2. **Advanced Filtering**
   - Search by name, email, or position
   - Filter by status (7 different statuses)
   - Filter by role category (childcare_staff, educational_staff, support_staff, management)
   - Filter by score range
   - Filter by application source (widget, referral, job_board)
   - Filter by review status

3. **Sorting Options**
   - By application date (newest/oldest)
   - By name (A-Z, Z-A)
   - By overall score (highest/lowest)
   - By AI match score

4. **Bulk Actions**
   - Multi-select candidates with checkboxes
   - Select all / Deselect all
   - Bulk review assignment
   - Export functionality

5. **Summary Metrics** (Top Cards)
   - Total Candidates
   - In Progress
   - Completed
   - Pass Rate
   - Average Score
   - Pending Review

6. **Individual Candidate Actions**
   - View Details (opens AI Insights)
   - Assign Review
   - Approve / Reject (for completed assessments)
   - Contact candidate

### Use Case:
**HR Manager/Recruiter** uses this to:
- Get overview of all applicants
- Quickly filter to find candidates in specific stages
- Review assessment scores and AI recommendations
- Take immediate action (approve, reject, assign review)
- Monitor pending reviews and take action

### Data Input:
```typescript
interface CandidateDashboardView {
  id: string;
  full_name: string;
  email: string;
  position_applied: string;
  role_category: AssessmentRoleCategory;
  overall_status: CandidateAssessmentStatus;
  overall_score?: number;
  ai_match_score?: number;
  application_source: string;
  application_date: string;
  assessment_status?: string;
  percentage_score?: number;
  passed?: boolean;
  progress_percentage: number;
  review_status?: ReviewStatus;
  final_decision?: FinalDecision;
}
```

### Data Output:
- `onCandidateSelect(candidateId)` → Opens detailed view
- `onStatusChange(candidateId, newStatus)` → Updates candidate status
- `onReviewAssign(candidateId, reviewerId)` → Assigns reviewer
- `onBulkAction(candidateIds[], action)` → Batch operations

---

## 🧩 Component 2: AssessmentTemplateBuilder

**File:** `/src/components/assessment/AssessmentTemplateBuilder.tsx` (1027 lines)

### Purpose:
Create and manage assessment templates with questions for different role categories.

### Functionality:
1. **Template Configuration** (Basic Info Tab)
   - Template name
   - Description
   - Role category (childcare, educational, support, management)
   - Time limit (5-180 minutes, optional)
   - Passing threshold (0-100%, slider control)
   - Weighted scoring toggle

2. **Question Builder** (Questions Tab)
   - Side-by-side view: Questions list + Editor
   - Add different question types:
     * Multiple Choice
     * Scenario Response
     * Video Response
     * File Upload
     * Rating Scale
     * Time Challenge
     * Text Response
     * Emotional Intelligence
     * Cultural Fit
   - Question categories (10 types):
     * Communication Skills
     * Childcare Scenarios
     * Cultural Fit
     * Technical Competency
     * Emotional Intelligence
     * Emergency Response
     * Teamwork
     * Leadership
     * Creativity
     * Problem Solving

3. **Question Editor Features**
   - Question text (rich textarea)
   - Question type selector
   - Category assignment
   - Points value (1-10)
   - Weight multiplier (0.1-3.0)
   - Auto-scoring toggle
   - Options management (for multiple choice)
   - Time limits (for timed questions)
   - Text constraints (min/max length)
   - Duplicate question
   - Delete question
   - Drag to reorder (visual indicator with GripVertical)

4. **TeddyKids Scenario Library** (Scenarios Tab)
   - Pre-built real-world scenarios for:
     * Childcare Staff (e.g., "Handling a Toddler Meltdown")
     * Educational Staff (e.g., "Learning Difficulty Support")
     * Management (e.g., "Staff Conflict Resolution")
   - One-click to add scenario to template
   - Context + Question format

5. **Scoring Configuration** (Scoring Tab)
   - Weighted scoring toggle
   - Passing threshold slider
   - Time limit configuration
   - Preview: Total questions, total points
   - Category breakdown chart
   - Estimated duration calculation

6. **Validation & Save**
   - Real-time validation
   - Error messages (name required, questions required, etc.)
   - Save to database
   - Preview mode
   - Cancel option

### Use Case:
**HR Manager/Assessment Designer** uses this to:
- Create custom assessments for different positions
- Adapt questions based on role requirements
- Set appropriate difficulty and passing criteria
- Use pre-built scenarios for consistency
- Maintain question library for reuse

### Data Input:
```typescript
interface TemplateBuilder {
  name: string;
  description: string;
  role_category: AssessmentRoleCategory;
  time_limit_minutes?: number;
  passing_threshold: number;
  weighted_scoring: boolean;
  questions: QuestionBuilder[];
}

interface QuestionBuilder {
  question_text: string;
  question_type: AssessmentQuestionType;
  category: AssessmentCategory;
  scenario_context?: string;
  options: string[];
  correct_answers: string[];
  points: number;
  weight: number;
  auto_scorable: boolean;
  constraints: Record<string, any>;
  order_sequence: number;
}
```

### Data Output:
- `onSave(template)` → Saves to database
- `onCancel()` → Discards changes
- `onPreview(template)` → Shows template preview

---

## 🧩 Component 3: AssessmentAnalytics

**File:** `/src/components/assessment/AssessmentAnalytics.tsx` (1005 lines)

### Purpose:
Comprehensive analytics dashboard for hiring pipeline performance metrics.

### Functionality:
1. **Overview Metrics** (6 Top Cards)
   - Total Applications (with +12.5% trend)
   - Completion Rate % (with +3.2% trend)
   - Pass Rate % (with -1.8% trend)
   - Hire Rate % (with +5.7% trend)
   - Average Score (with +2.1% trend)
   - Pending Review count (with -4.3% trend)

2. **Filters**
   - Date range (week, month, quarter, year)
   - Role category filter
   - Export report button

3. **Analytics Tabs**:

   **Tab 1: Overview**
   - Conversion Funnel Chart
     * Applied → Started → Completed → Passed → Hired
     * Shows drop-off rates at each stage
     * Color-coded progress bars
   - Score Distribution Pie Chart
     * 90-100%, 80-89%, 70-79%, 60-69%, 0-59%
   - Performance by Role Category Cards
     * Applications, Pass Rate, Avg Score, Avg Time
     * Top Strengths badges
     * Areas for Improvement badges

   **Tab 2: Performance**
   - Daily Assessment Volume Bar Chart
     * Applications, Completed, Passed (7-day trend)
   - Average Score Trend Area Chart
     * 7-day rolling average
   - Detailed Performance Metrics Table
     * Template name, Started, Completed, Pass Rate, Avg Score, Avg Time, AI Accuracy

   **Tab 3: Categories**
   - Category Performance Cards (10 categories)
     * Average score for each category
     * Pass rate for each category
     * Number of questions
     * Progress bars for visual comparison

   **Tab 4: Trends**
   - Multi-line trend chart
     * Applications, Completed, Passed over time
     * 7-day rolling view

   **Tab 5: AI Insights**
   - Performance Insights Cards:
     * Strong Performance (green) - success stories
     * Optimization Opportunity (yellow) - areas to improve
     * Trending Pattern (blue) - interesting discoveries
   - AI Recommendations (numbered list):
     1. Reduce Assessment Length
     2. Enhance AI Training
     3. Expand Scenario Questions
     4. Review Thresholds

### Use Case:
**HR Director/Manager** uses this to:
- Monitor hiring pipeline health
- Identify bottlenecks in the process
- Track conversion rates at each stage
- Compare performance across role categories
- Make data-driven decisions on assessment design
- Identify which question categories need improvement
- Track AI model accuracy

### Data Input:
```typescript
interface AssessmentAnalytics {
  id: string;
  date: string;
  template_id: string;
  role_category: AssessmentRoleCategory;
  total_started: number;
  total_completed: number;
  total_passed: number;
  total_failed: number;
  average_score: number;
  average_completion_time: number;
  abandonment_rate: number;
  pass_rate: number;
  average_time_per_question: number;
  questions_requiring_review: number;
  ai_accuracy_rate: number;
  created_at: string;
}

interface AssessmentPipelineMetrics {
  total_applications: number;
  pending_start: number;
  in_progress: number;
  completed: number;
  passed: number;
  failed: number;
  approved_for_hire: number;
  rejected: number;
  start_rate: number;
  completion_rate: number;
  pass_rate: number;
  hire_rate: number;
}
```

### Data Output:
- `onDateRangeChange(range)` → Filters data by time period
- `onRoleCategoryChange(category)` → Filters by role type

---

## 🧩 Component 4: AiInsightsEngine

**File:** `/src/components/assessment/AiInsightsEngine.tsx` (843 lines)

### Purpose:
AI-powered deep analysis of individual candidates with hiring recommendations.

### Functionality:
1. **Candidate Header**
   - Avatar with initials
   - Full name and position
   - Role category badge
   - Overall score badge
   - AI badge indicator

2. **AI Recommendation Summary Card**
   - Hiring recommendation badge (Hire, Interview, Reassess, Reject)
   - Confidence score (0-100%)
   - Cultural fit score
   - Role suitability score
   - Key Strengths (top 3)
   - Areas for Development (top 3)
   - AI Reasoning (detailed explanation)

3. **Analysis Tabs**:

   **Tab 1: Overview**
   - Personality Profile Chart
     * Openness, Conscientiousness, Extraversion, Agreeableness, Emotional Stability
     * Progress bars with percentage scores
   - Competency Scores
     * Childcare Expertise, Educational Skills, Communication
     * Problem Solving, Emotional Intelligence, Adaptability, Cultural Alignment
   - Quick Action Buttons:
     * Approve Hire (green)
     * Schedule Interview (blue)
     * Request Reassessment (yellow)
     * Reject Candidate (red)

   **Tab 2: Personality**
   - Big Five Personality Traits (detailed)
   - Work Style Profile Cards:
     * Communication Style (collaborative, direct, supportive, analytical)
     * Work Preferences (team, individual, mixed)
     * Stress Management (high, medium, low tolerance)

   **Tab 3: Competencies**
   - Core Competencies (first 4 skills)
     * Detailed breakdown with interpretation
     * "Exceptional", "Strong", "Competent", "Developing" labels
   - Soft Skills & Cultural Fit (remaining skills)
     * Cultural alignment assessment
     * Team fit analysis

   **Tab 4: Recommendations**
   - Development Suggestions (numbered list)
     * Specific training programs
     * Mentorship opportunities
     * Growth track suggestions
   - Risk Assessment & Mitigation
     * Potential concerns
     * Mitigation strategies for each
     * Overall risk level (Low, Medium, High)

   **Tab 5: Interview Guide**
   - Recommended Focus Areas (numbered cards)
     * Specific topics to explore
     * Why to explore them
   - Suggested Interview Questions:
     * Scenario-Based Questions
     * Cultural Fit Questions
     * Development & Growth Questions

4. **Advanced Mode** (Toggle)
   - Custom Recommendation Override
   - Reasoning text area
   - Override to Hire / Override to Reject buttons

5. **Actions**
   - Regenerate AI Analysis (Sparkles icon)
   - Export Report (Download icon)
   - Simple/Advanced View Toggle

### Use Case:
**Hiring Manager** uses this to:
- Get AI-powered assessment of candidate fit
- Understand personality and competencies in depth
- Identify strengths and growth opportunities
- Prepare for interviews with suggested questions
- Make informed hiring decisions with data backing
- Document reasoning for approval/rejection

### Data Input:
```typescript
interface CandidateAiInsights {
  id: string;
  candidate_id: string;
  personality_profile: PersonalityProfile;
  competency_analysis: CompetencyAnalysis;
  cultural_fit_score: number;
  role_suitability_score: number;
  hiring_recommendation: HiringRecommendation;
  recommendation_confidence: number;
  recommendation_reasoning: string;
  key_strengths: string[];
  potential_concerns: string[];
  development_suggestions: string[];
  interview_focus_areas: string[];
  ai_model_version: string;
  generated_at: string;
}

interface PersonalityProfile {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  emotional_stability: number;
  communication_style: string;
  work_preferences: string;
  stress_tolerance: string;
}
```

### Data Output:
- `onGenerateInsights(candidateId)` → Triggers AI analysis
- `onUpdateRecommendation(candidateId, recommendation, reasoning)` → Updates decision

---

## 🧩 Component 5: ApprovalWorkflowSystem

**File:** `/src/components/assessment/ApprovalWorkflowSystem.tsx` (1113 lines)

### Purpose:
Manages the transition from candidate to staff member with approval workflow.

### Functionality:
1. **Workflow Progress Visualization**
   - 4 Steps with icons:
     1. Assessment (completed)
     2. Review (current/pending)
     3. Decision (pending)
     4. Staff Integration (pending)
   - Color-coded status (green=completed, blue=current, gray=pending)
   - Connection lines showing progression

2. **Workflow Tabs**:

   **Tab 1: Review**
   - Candidate Summary Card:
     * Email, Application Date
     * Assessment Score, AI Match Score
     * Application Source, Status
     * Assessment completion progress bar
   - Review Status Card:
     * Review ID
     * Status badge (pending, in_review, completed)
     * Priority level (1-5 with dots)
     * Created date, Assigned reviewer
     * Reviewer notes (if any)
   - Quick Review Actions:
     * Approve for Hiring (green)
     * Schedule Interview (blue)
     * Request Changes (yellow)
     * Reject Application (red)

   **Tab 2: Decision**
   - Approval Section:
     * Ready indicator
     * Description of next steps
     * "Proceed to Staff Setup" button
   - Rejection Section:
     * Rejection reason textarea (required)
     * Warning about permanence
     * Reject button (requires reason)
   - Request Changes Section:
     * Add change requests (with + button)
     * List of requested changes (removable)
     * Send changes button

   **Tab 3: Staff Setup** (THE KEY INTEGRATION POINT)
   - Personal Information:
     * Full Name (pre-filled from candidate)
     * Email (pre-filled)
     * Phone
     * Employee Number (auto-generate or manual)
   - Employment Details:
     * Position (pre-filled from application)
     * Department (dropdown: Nursery, Toddler Care, BSO, Special Needs, Admin, Kitchen, Maintenance, Management)
     * Location (dropdown: Amsterdam Central, Amsterdam Noord, Utrecht, Den Haag, Rotterdam, Eindhoven, Groningen)
     * Manager (dropdown: Sarah de Vries, Mark Jansen, Lisa van Meer, Tom Bakker)
     * Start Date (date picker)
     * Contract Type (Permanent, Temporary, Internship)
   - Compensation:
     * Hours per Week (1-40)
     * Monthly Salary €
     * Hourly Wage €
   - Additional Notes (textarea)
   - **"Create Staff Profile & Approve"** button → THIS CREATES STAFF RECORD

   **Tab 4: Interview**
   - Interview Scheduling Form:
     * Interviewer (dropdown)
     * Interview Type (In Person, Video Call, Phone Call)
     * Date & Time pickers
     * Duration (30/45/60/90 minutes)
     * Location/Link field
     * Preparation notes textarea
   - Schedule Interview button

3. **Action Buttons Throughout**
   - Export Profile (PDF)
   - View Assessment (link back)
   - Back to Review (navigation)

### Use Case:
**HR Manager + Department Head** use this to:
- Review candidate details before final decision
- Approve/reject with documented reasoning
- Request additional information if needed
- Schedule interviews when needed
- **MOST IMPORTANTLY**: Create staff profile with all employment details
- Seamlessly transition candidate → staff member

### Critical Integration Point:
```typescript
// When "Create Staff Profile & Approve" is clicked:
onApprove(candidateId, staffData) → {
  // 1. Creates new staff record in staff table
  // 2. Populates all employment fields
  // 3. Sets start date and contract details
  // 4. Assigns to location and manager
  // 5. Marks candidate as "approved_for_hire"
  // 6. Triggers onboarding workflow
}
```

### Data Input:
```typescript
interface StaffCreationData {
  full_name: string;
  email: string;
  phone?: string;
  start_date: string;
  position: string;
  department: string;
  location: string;
  manager: string;
  contract_type: 'permanent' | 'temporary' | 'internship';
  hours_per_week: number;
  salary_amount?: number;
  hourly_wage?: number;
  employee_number?: string;
  notes?: string;
}
```

### Data Output:
- `onApprove(candidateId, staffData)` → **Creates staff member**
- `onReject(candidateId, reason)` → Rejects and archives
- `onRequestChanges(candidateId, changes[])` → Sends change request
- `onScheduleInterview(candidateId, interviewData)` → Books interview

---

## 🧩 Component 6: DiscAssessmentWidget

**File:** `/src/modules/talent-acquisition/components/DiscAssessmentWidget.tsx` (1037 lines)

### Purpose:
The applicant-facing widget that candidates use to apply + take the 40-question DISC assessment.

### Functionality:
1. **Step 1: Personal Information**
   - Full Name (required)
   - Email (required)
   - Phone
   - City

2. **Step 2: Role Preferences**
   - Preferred Role (Intern/Stagiair or Teacher/Pedagoog)
   - Language Track (English, Dutch, Bilingual)
   - Preferred Start Date

3. **Step 3: DISC Assessment** (40 Questions)
   - Luna's exact 40-question DISC assessment
   - 8 sections:
     1. Background & Education (Q1-Q3)
     2. Work Style & Initiative (Q4-Q6)
     3. Group Fit (Q7-Q14)
     4. Communication & Parents (Q15-Q16)
     5. Special Skills (Q17-Q18)
     6. Availability & Flexibility (Q19-Q20)
     7. **Red-Flag Detectors** (Q21-Q30) - Critical behavioral screening
     8. General Fit (Q31-Q40)

   - Question Format:
     * Section badge (blue)
     * Question number (X of 40)
     * Behavioral Assessment badge (for red-flag questions)
     * Question text in gradient box
     * 4 clickable answer cards (A, B, C, D)
     * Auto-advances to next question on click

   - Color Tracking (Hidden from candidate):
     * Each answer maps to a DISC color (red, blue, green, yellow)
     * 15 questions are color-scored
     * Red: Captain Energy (leadership, direct)
     * Blue: Planner (structured, organized)
     * Green: Heart (caring, supportive)
     * Yellow: Spark Maker (creative, energetic)

   - Red-Flag Detection (Hidden from candidate):
     * 10 questions flag risky behaviors
     * Examples:
       - Leaving crying baby to focus on group
       - Waiting for colleagues instead of taking initiative
       - Defensive about feedback
       - Minimal effort on tired days

4. **Step 4: Results & Completion**
   - Confetti animation
   - "Assessment Complete" message
   - DISC Profile Results:
     * Primary color (highest percentage)
     * Secondary color
     * Percentage breakdown (Red: X%, Blue: Y%, Green: Z%, Yellow: W%)
     * 4 cards with icons (Target, Brain, Heart, Sparkles)
     * Description of primary personality type
   - Reference code (e.g., TK3F8A2D)
   - "Thank you" message
   - Complete Application button

5. **Data Persistence**
   - Saves to database via `assessmentService.saveAssessment()`
   - Creates applicant record
   - Stores all 40 answers
   - Stores calculated DISC results
   - Stores red flag count
   - Generates reference code
   - Returns applicantId for tracking

6. **Preview Mode**
   - Can be shown in preview mode
   - "Preview" badge at top
   - All functionality works same way

### Use Case:
**Job Applicant** uses this to:
- Apply for a position at TeddyKids
- Complete the DISC personality assessment
- Get immediate feedback on their personality type
- Receive a reference code to track application

**HR Team** benefits:
- Automatic screening via red-flag detection
- DISC profile for team fit assessment
- Consistent assessment across all candidates
- Behavioral insights beyond just test scores

### Data Input:
```typescript
interface ApplicantFormData {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  languageTrack: string;
  city?: string;
  startDate?: string;
}
```

### Data Output:
```typescript
interface AssessmentResults {
  colorCounts: Record<DISCColor, number>;
  colorPercentages: Record<DISCColor, number>;
  primaryColor: DISCColor;
  secondaryColor: DISCColor;
  redFlagCount: number;
  redFlagQuestions: number[];
}

// On completion:
onComplete({
  formData: ApplicantFormData,
  answers: Record<number, string>,
  results: AssessmentResults,
  refCode: string,
  applicantId: string
})
```

---

## 🔄 Complete Data Flow

### Application to Hire Flow:

```
1. CANDIDATE APPLIES
   DiscAssessmentWidget
   ↓ (saves to DB)
   - Creates applicant record
   - Stores answers
   - Calculates DISC profile
   - Generates reference code

2. HR REVIEWS APPLICATIONS
   CandidateAssessmentDashboard
   ↓ (filters, sorts, views)
   - Shows all candidates
   - Displays scores and status
   - Allows bulk actions
   
3. HR VIEWS AI INSIGHTS
   Click "View Details" on candidate
   ↓ (navigates to)
   AiInsightsEngine
   - Shows AI recommendation (Hire/Interview/Reassess/Reject)
   - Displays personality and competency analysis
   - Provides interview questions
   - Shows development suggestions

4. HR MAKES DECISION
   Click "Approve" / Navigate to Approval tab
   ↓ (navigates to)
   ApprovalWorkflowSystem
   - Reviews candidate summary
   - Can request changes or schedule interview
   - OR proceeds to Staff Setup

5. **CRITICAL STEP: STAFF CREATION**
   Staff Setup Tab in ApprovalWorkflowSystem
   ↓ (fills out form)
   - Employee details (name, email, phone, employee #)
   - Employment details (position, department, location, manager, start date, contract type)
   - Compensation (hours, salary, wage)
   - Notes
   ↓ (clicks "Create Staff Profile & Approve")
   **onApprove(candidateId, staffData)**
   ↓
   - Creates staff record in staff table
   - Links to candidate record
   - Updates candidate status to "approved_for_hire"
   - Triggers onboarding workflow
   - Candidate becomes a staff member! ✅

6. ONGOING MONITORING
   AssessmentAnalytics
   - Tracks conversion rates
   - Monitors bottlenecks
   - Analyzes AI performance
   - Identifies optimization opportunities
```

---

## 🔧 Component Dependencies

```
TalentAcquisition (Main Page)
├── UI Components (shadcn/ui)
│   ├── Card, CardContent, CardHeader, CardTitle
│   ├── Badge
│   ├── Button
│   ├── Tabs, TabsContent, TabsList, TabsTrigger
│   └── Progress
│
├── Icons (lucide-react)
│   ├── Users, UserPlus, Brain
│   ├── BarChart3, Settings, Sparkles
│   └── Many more...
│
├── CandidateAssessmentDashboard
│   ├── Filters: Search, Status, Role, Sort
│   ├── Summary Metrics (6 cards)
│   ├── Candidate Grid (cards with actions)
│   └── Bulk Actions
│
├── AssessmentTemplateBuilder
│   ├── Basic Info Form
│   ├── Questions List + Editor
│   ├── Scenario Library
│   └── Scoring Configuration
│
├── AssessmentAnalytics
│   ├── Overview Tab (Funnel + Score Distribution)
│   ├── Performance Tab (Charts + Table)
│   ├── Categories Tab (Category cards)
│   ├── Trends Tab (Line chart)
│   └── AI Insights Tab (Recommendations)
│
├── AiInsightsEngine
│   ├── Overview Tab (Personality + Competencies + Actions)
│   ├── Personality Tab (Big Five + Work Style)
│   ├── Competencies Tab (Core + Soft Skills)
│   ├── Recommendations Tab (Development + Risk)
│   └── Interview Tab (Focus Areas + Questions)
│
├── ApprovalWorkflowSystem
│   ├── Review Tab (Summary + Actions)
│   ├── Decision Tab (Approve/Reject/Changes)
│   ├── **Staff Setup Tab** (Complete employee form)
│   └── Interview Tab (Schedule)
│
└── DiscAssessmentWidget (Modal)
    ├── Step 1: Personal Info
    ├── Step 2: Role Preferences
    ├── Step 3: 40-Question DISC Assessment
    └── Step 4: Results Display
```

---

## 📋 Key Type Definitions

```typescript
// Main candidate interface
interface CandidateDashboardView {
  id: string;
  full_name: string;
  email: string;
  position_applied: string;
  role_category: 'childcare_staff' | 'educational_staff' | 'support_staff' | 'management';
  overall_status: 'pending_start' | 'in_progress' | 'completed' | 'approved_for_hire' | 'rejected' | 'failed' | 'expired';
  overall_score?: number; // 0-100
  ai_match_score?: number; // 0-100
  application_source: 'widget' | 'referral' | 'job_board';
  application_date: string;
  assessment_status?: string;
  percentage_score?: number;
  passed?: boolean;
  progress_percentage: number;
  review_status?: 'pending' | 'in_review' | 'completed';
  final_decision?: 'approved_for_hire' | 'rejected' | 'pending';
}

// DISC Assessment results
interface AssessmentResults {
  colorCounts: Record<'red' | 'blue' | 'green' | 'yellow', number>;
  colorPercentages: Record<'red' | 'blue' | 'green' | 'yellow', number>;
  primaryColor: 'red' | 'blue' | 'green' | 'yellow';
  secondaryColor: 'red' | 'blue' | 'green' | 'yellow';
  redFlagCount: number;
  redFlagQuestions: number[];
}

// Staff creation (THE BRIDGE TO STAFF SYSTEM)
interface StaffCreationData {
  full_name: string;
  email: string;
  phone?: string;
  start_date: string;
  position: string;
  department: string;
  location: string;
  manager: string;
  contract_type: 'permanent' | 'temporary' | 'internship';
  hours_per_week: number;
  salary_amount?: number;
  hourly_wage?: number;
  employee_number?: string;
  notes?: string;
}
```

---

## 🎯 Critical Integration Points

### 1. **Widget → Database** (Application Entry)
```typescript
// In DiscAssessmentWidget
await assessmentService.saveAssessment(
  formData,  // Applicant info
  answers,   // All 40 DISC answers
  results    // Calculated DISC profile + red flags
)
// Returns: { success, applicantId, refCode }
```

### 2. **Dashboard → AI Insights** (Candidate Selection)
```typescript
// In CandidateAssessmentDashboard
onCandidateSelect={(candidateId) => {
  setSelectedCandidateId(candidateId);
  setSelectedTab('ai-insights');
}}
```

### 3. **AI Insights → Decision Making** (Quick Actions)
```typescript
// In AiInsightsEngine
handleUpdateRecommendation(recommendation) // 'hire', 'interview', 'reassess', 'reject'
```

### 4. **Approval → Staff System** (THE CRITICAL BRIDGE)
```typescript
// In ApprovalWorkflowSystem
onApprove(candidate.id, staffData) → {
  // 1. Create staff record
  // 2. Copy candidate data → staff table
  // 3. Set employment details
  // 4. Mark candidate as hired
  // 5. Link records (candidate_id → staff_id)
  // 6. Initiate onboarding
}
```

### 5. **Analytics → Template Optimization** (Feedback Loop)
```typescript
// In AssessmentAnalytics
// Data shows which questions need review
// HR adjusts templates in AssessmentTemplateBuilder
// Improved templates lead to better candidate matching
```

---

## 🚀 Optimization Opportunities

### Current State:
- ✅ Complete candidate application flow via DISC widget
- ✅ Comprehensive dashboard with filtering and sorting
- ✅ AI-powered insights and recommendations
- ✅ Detailed analytics and reporting
- ✅ Flexible template builder
- ✅ Full approval workflow with staff creation
- ⚠️ Using mock data (needs API integration)
- ⚠️ No real-time updates (needs WebSocket/polling)
- ⚠️ No email notifications

### Recommended Improvements:
1. **API Integration**
   - Connect to Supabase for real candidate data
   - Replace mock data with live queries
   - Implement real-time subscriptions

2. **AI Integration**
   - Connect to actual AI service for insights generation
   - Implement RAG for interview question suggestions
   - Add confidence scoring based on historical data

3. **Email Automation**
   - Send confirmation email after application
   - Notify HR on new applications
   - Auto-email interview invitations
   - Send rejection/acceptance letters

4. **Real-time Updates**
   - WebSocket for live candidate status changes
   - Push notifications for HR team
   - Real-time collaboration (multiple reviewers)

5. **Advanced Features**
   - Video interview integration
   - Reference check workflow
   - Background check integration
   - Automated scheduling with calendar sync

6. **Performance**
   - Implement pagination for large candidate lists
   - Add virtualization for long lists
   - Optimize chart rendering
   - Cache AI insights

---

## 📝 Summary

The Talent Acquisition page is a **complete end-to-end hiring solution** that takes candidates from application through to staff integration. The key strength is the seamless flow between components, with the **ApprovalWorkflowSystem serving as the critical bridge** between the candidate pool and the staff management system.

**Component Interaction Summary:**
1. **DiscAssessmentWidget** captures applicant → stores in DB
2. **CandidateAssessmentDashboard** displays all → enables filtering/actions
3. **AiInsightsEngine** analyzes individual → provides AI recommendation
4. **ApprovalWorkflowSystem** manages decision → **creates staff record**
5. **AssessmentAnalytics** monitors process → identifies improvements
6. **AssessmentTemplateBuilder** maintains quality → ensures consistency

**The Magic Moment:** When HR clicks "Create Staff Profile & Approve" in the ApprovalWorkflowSystem, a candidate officially becomes a TeddyKids employee with a complete staff profile, ready for onboarding!

---

*Generated: October 22, 2025*  
*For use in optimizing talent acquisition logic with ChatGPT*

