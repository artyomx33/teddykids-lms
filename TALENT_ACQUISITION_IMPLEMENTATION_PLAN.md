# 🚀 Talent Acquisition - Full Implementation Plan (LUNA-APPROVED)

> **Created:** October 22, 2025  
> **Reviewed & Approved By:** Luna (AI Hiring Expert) + Artem  
> **Agents Used:** Component Refactoring Architect, Database Schema Guardian, Design System Enforcer, Form Validation Agent  
> **Goal:** Build the cleanest, fastest, most emotionally intelligent hiring pipeline in childcare 🧠🧸

---

## 🎯 Executive Summary

### The Current Challenge
The Talent Acquisition page has **TWO critical issues**:

1. **Conceptual Flaw in the "Magic Moment"**:
   - Currently: Candidate → Approval → **Direct Staff Creation** ❌
   - Reality: Staff records come from **employes.nl** (external HR system)
   - Problem: We can't auto-create staff records that don't exist in employes.nl!

2. **Incorrect Review Template Logic**:
   - Currently: Using `staff_reviews` for candidates ❌
   - Reality: Candidates aren't employees yet - they need a **trial review system**
   - Problem: Mixing candidate evaluation with employee reviews causes confusion!

### The Solution: Two-Pronged Approach

#### Part 1: Fix Employes.nl Integration
Create an intermediate state: **"Ready for Employes.nl Submission"**

```
CURRENT FLOW (BROKEN):
Candidate → Review → Approve → [Auto-create Staff Record] ❌

NEW FLOW (WORKS):
Candidate → Trial → Decision → [Export for Employes.nl] → Manual Entry → [Staff Sync] ✅

FUTURE FLOW (IDEAL):
Candidate → Trial → Decision → [API to Employes.nl] → [Staff Sync] 🚀
```

#### Part 2: Fix Candidate Evaluation Flow
Replace review templates with proper **trial evaluation system**

```
OLD (WRONG):
Candidate → staff_reviews table → Confusion ❌

NEW (RIGHT):
Candidate → candidate_trial_reviews table → Clear evaluation ✅
```

---

## 🧭 Candidate Flow (LUNA-APPROVED - FINAL VERSION)

This is the **official candidate journey** that must be implemented across all components:

### Stage 1: 📝 Application Submitted
```typescript
Status: 'application_received'
Badge Color: gray
Badge Emoji: 📩
```
**What happens:**
- Candidate completes application form (profile + docs + 40Q DISC assessment)
- Candidate record created in `candidates` table
- DISC profile calculated automatically
- Redflag detection runs
- Group fit determined
- Documents uploaded (diploma, ID, CV)

**Actions Available:**
- View application
- Verify documents
- Send acknowledgment email

---

### Stage 2: 🔍 Documents Verified
```typescript
Status: 'verified'
Badge Color: blue
Badge Emoji: 🔎
```
**What happens:**
- HR reviews uploaded documents (diploma, ID, CV)
- Document verification checklist completed
- Basic qualifications confirmed
- Candidate marked as "ready for trial"

**Actions Available:**
- Schedule trial
- Request additional documents
- Reject (if documents invalid)

---

### Stage 3: 📅 Trial Scheduled
```typescript
Status: 'trial_invited'
Badge Color: purple
Badge Emoji: ✉️
```
**What happens:**
- Trial invitation sent to candidate
- Trial details logged:
  - Trial date & time
  - Location
  - Group/age range (Babies, 1-2 years, 3+)
  - Trial style (observation, active participation)
  - Assigned supervisor
- Calendar event created

**Actions Available:**
- Reschedule trial
- Cancel trial
- View trial details

---

### Stage 4: 👀 Trial Completed
```typescript
Status: 'trial_completed'
Badge Color: yellow
Badge Emoji: ✅
```
**What happens:**
- Supervisor completes trial evaluation checklist
- Pre-trial rating recorded (optional)
- Post-trial rating recorded (required)
- Supervisor notes added
- Trial performance stored in `candidate_trial_reviews`

**Actions Available:**
- View trial evaluation
- Make hiring decision
- Schedule second trial (if needed)

---

### Stage 5: ✅ Decision Finalized
```typescript
Status: 'decision_finalized'
Badge Color: green
Badge Emoji: 🟢
```
**What happens:**
- HR makes final decision:
  - ✅ **Hired** → Move to "Offer Signed" or "Export for Employes.nl"
  - ⏸️ **On Hold** → Keep in system, revisit later
  - ❌ **Not Hired** → Archive with reason
- Decision reason logged
- Candidate notified

**Actions Available (if hired):**
- Generate offer letter
- Export for employes.nl
- Send offer

---

### Stage 6: 📝 Offer Signed (Optional)
```typescript
Status: 'offer_signed'
Badge Color: gold
Badge Emoji: 📝
```
**What happens:**
- Candidate signed offer letter
- Contract details finalized
- Ready for employes.nl entry
- Awaiting start date

**Actions Available:**
- Export for employes.nl
- View contract
- Schedule onboarding

---

## 🎨 DISC Profile & Group Fit (LUNA-APPROVED LOGIC)

### Full DISC Calculation from 40-Question Form

The DISC assessment must calculate and store:

```typescript
interface DISCProfile {
  // Primary and secondary colors
  primary_color: 'Red' | 'Blue' | 'Green' | 'Yellow';
  secondary_color: 'Red' | 'Blue' | 'Green' | 'Yellow';
  
  // Score distribution (total = 40)
  color_distribution: {
    red: number;    // 0-40
    blue: number;   // 0-40
    green: number;  // 0-40
    yellow: number; // 0-40
  };
  
  // Red flag detection
  redflag_count: number;
  redflag_question_ids: number[]; // Which questions triggered flags
  redflag_details: {
    question_id: number;
    question_text: string;
    answer_given: string;
    why_flagged: string;
  }[];
  
  // Group fit recommendation
  group_fit: 'Babies (0-1)' | '1-2 years' | '3+ years' | 'Multi-age' | 'Administrative';
  group_fit_confidence: number; // 0-100%
  
  // Additional insights
  personality_traits: string[];
  strengths: string[];
  potential_challenges: string[];
}
```

### Where DISC Profile Appears

The DISC profile must be displayed in:

1. **CandidateProfile Component**
   - Full DISC breakdown with pie chart
   - Redflag alert banner (if ≥2 flags)
   - Group fit recommendation
   - All 40 questions and answers viewable

2. **CandidateList / Dashboard**
   - DISC badge (e.g., "Red/Green")
   - Redflag count badge (if any)
   - Group fit icon

3. **CandidateSummaryCard**
   - Primary color badge
   - Redflag indicator
   - Group fit label

4. **LMS Summary Email** (optional)
   - DISC colors
   - Redflag warning
   - Group fit

---

## 🛑 REMOVE: Review Templates Section

### ❌ What Was Wrong

The original implementation suggested:
> "Candidates may be reviewed using existing review templates"

**This is INCORRECT because:**
- Candidates are **not employees yet**
- The `staff_reviews` table is for **current staff performance reviews**
- Mixing candidate evaluation with employee reviews causes data confusion
- Different workflows require different tables

### ✅ What's Right

**Candidates are evaluated via:**
1. **Trial Performance** → `candidate_trial_reviews` table (NEW)
2. **DISC Assessment** → Automatic from 40Q form
3. **Document Verification** → Checklist in `candidates` table
4. **Supervisor Notes** → Part of trial review

### 🎯 New Trial Review System

Create a completely separate table for trial evaluations:

```sql
-- NEW TABLE: candidate_trial_reviews
-- Agent: Database Schema Guardian

CREATE TABLE IF NOT EXISTS candidate_trial_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  -- Trial details
  trial_date DATE NOT NULL,
  trial_location TEXT NOT NULL,
  trial_group TEXT NOT NULL, -- "Babies", "1-2 years", "3+ years"
  trial_duration_hours DECIMAL(3,1), -- e.g., 3.5 hours
  supervisor_id UUID, -- Could reference staff table if available
  supervisor_name TEXT NOT NULL,
  
  -- Pre-trial (optional)
  pre_trial_rating INTEGER, -- 1-5 stars
  pre_trial_notes TEXT,
  
  -- Trial evaluation checklist
  checklist_interaction_with_children INTEGER NOT NULL, -- 1-5
  checklist_communication_skills INTEGER NOT NULL, -- 1-5
  checklist_follows_instructions INTEGER NOT NULL, -- 1-5
  checklist_initiative INTEGER NOT NULL, -- 1-5
  checklist_safety_awareness INTEGER NOT NULL, -- 1-5
  checklist_punctuality INTEGER NOT NULL, -- 1-5
  checklist_teamwork INTEGER NOT NULL, -- 1-5
  checklist_adaptability INTEGER NOT NULL, -- 1-5
  
  -- Post-trial (required)
  post_trial_rating INTEGER NOT NULL, -- 1-5 stars
  post_trial_notes TEXT NOT NULL,
  
  -- Overall assessment
  overall_performance DECIMAL(3,1), -- Calculated average
  would_hire BOOLEAN,
  concerns TEXT,
  strengths TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_candidate_trial_reviews_candidate_id 
  ON candidate_trial_reviews(candidate_id);

CREATE INDEX idx_candidate_trial_reviews_trial_date 
  ON candidate_trial_reviews(trial_date);

-- NO RLS (Development-first)
ALTER TABLE candidate_trial_reviews DISABLE ROW LEVEL SECURITY;
COMMENT ON TABLE candidate_trial_reviews IS 'Trial evaluations for candidates. RLS disabled for development.';
```

---

## 📋 Implementation Phases (REVISED)

### Phase 0: Database Schema Overhaul (Week 1 - Priority 🔥)
**Agent Lead:** Database Schema Guardian + Component Refactoring Architect

#### 1.1 Add New Candidate Status: "approved_awaiting_employes"
```sql
-- Migration: 001_add_candidate_employes_status.sql
-- Agent: Database Schema Guardian

-- Add new status to candidate system
ALTER TYPE candidate_status ADD VALUE IF NOT EXISTS 'approved_awaiting_employes';

-- Create employes_export_data table
CREATE TABLE IF NOT EXISTS candidate_employes_export (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  -- Data for employes.nl manual entry
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  manager TEXT NOT NULL,
  start_date DATE NOT NULL,
  contract_type TEXT NOT NULL,
  hours_per_week INTEGER NOT NULL,
  salary_amount DECIMAL(10,2),
  hourly_wage DECIMAL(10,2),
  employee_number TEXT,
  
  -- Export tracking
  exported_at TIMESTAMPTZ DEFAULT NOW(),
  exported_by UUID REFERENCES auth.users(id),
  employes_id TEXT, -- Will be filled after manual entry
  employes_synced_at TIMESTAMPTZ,
  
  -- Additional data
  notes TEXT,
  disc_profile JSONB,
  ai_insights JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NO RLS! (Development-first approach)
ALTER TABLE candidate_employes_export DISABLE ROW LEVEL SECURITY;
COMMENT ON TABLE candidate_employes_export IS 'RLS disabled for development. Export data for employes.nl manual entry.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_candidate_employes_export_candidate_id 
  ON candidate_employes_export(candidate_id);

CREATE INDEX IF NOT EXISTS idx_candidate_employes_export_employes_id 
  ON candidate_employes_export(employes_id) 
  WHERE employes_id IS NOT NULL;

-- Update trigger
CREATE OR REPLACE FUNCTION update_candidate_employes_export_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_candidate_employes_export_timestamp
  BEFORE UPDATE ON candidate_employes_export
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_employes_export_timestamp();
```

#### 1.2 Modify ApprovalWorkflowSystem Component
**Agent: Component Refactoring Architect**

```typescript
// Phase 1 Change: Replace "Staff Setup" with "Export for Employes.nl"

// OLD (BROKEN):
<TabsTrigger value="staff-setup">
  <User className="h-4 w-4 mr-2" />
  Staff Setup
</TabsTrigger>

// NEW (WORKS):
<TabsTrigger value="employes-export">
  <FileText className="h-4 w-4 mr-2" />
  Export for Employes.nl
</TabsTrigger>

// New Tab Content:
<TabsContent value="employes-export" className="space-y-6">
  <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
    <CardHeader>
      <CardTitle className="text-white flex items-center gap-2">
        <FileText className="h-5 w-5 text-purple-400" />
        Export Candidate for Employes.nl Entry
      </CardTitle>
      <p className="text-purple-300 text-sm">
        Prepare candidate data for manual entry into employes.nl system
      </p>
    </CardHeader>
    
    <CardContent className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-blue-300 font-medium mb-1">Manual Entry Required</h3>
            <p className="text-blue-400 text-sm">
              TeddyKids staff records are managed via employes.nl. After exporting this 
              candidate, you'll need to manually create their profile in employes.nl. 
              Once synced, they'll appear in the Staff page.
            </p>
          </div>
        </div>
      </div>

      {/* Candidate Summary Card */}
      <Card className="bg-purple-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Candidate Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-purple-300">Full Name</Label>
              <div className="text-white font-medium">{candidate.full_name}</div>
            </div>
            <div>
              <Label className="text-purple-300">Email</Label>
              <div className="text-white font-medium">{candidate.email}</div>
            </div>
            <div>
              <Label className="text-purple-300">Position</Label>
              <div className="text-white font-medium">{candidate.position_applied}</div>
            </div>
            <div>
              <Label className="text-purple-300">DISC Profile</Label>
              <Badge className={getColorBadge(discProfile.primaryColor)}>
                {getColorName(discProfile.primaryColor)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Details Form (for employes.nl) */}
      <Card className="bg-purple-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Employment Details for Employes.nl</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-purple-300">Department *</Label>
              <Select
                value={exportData.department}
                onValueChange={(value) => setExportData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger className="bg-black/30 border-purple-500/30">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nursery (0-2 years)">Nursery (0-2 years)</SelectItem>
                  <SelectItem value="Toddler Care (2-4 years)">Toddler Care (2-4 years)</SelectItem>
                  <SelectItem value="BSO (4-12 years)">BSO (4-12 years)</SelectItem>
                  <SelectItem value="Special Needs">Special Needs</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                  <SelectItem value="Kitchen">Kitchen</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-purple-300">Location *</Label>
              <Select
                value={exportData.location}
                onValueChange={(value) => setExportData(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger className="bg-black/30 border-purple-500/30">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Amsterdam Central">Amsterdam Central</SelectItem>
                  <SelectItem value="Amsterdam Noord">Amsterdam Noord</SelectItem>
                  <SelectItem value="Utrecht Centrum">Utrecht Centrum</SelectItem>
                  <SelectItem value="Den Haag">Den Haag</SelectItem>
                  <SelectItem value="Rotterdam">Rotterdam</SelectItem>
                  <SelectItem value="Eindhoven">Eindhoven</SelectItem>
                  <SelectItem value="Groningen">Groningen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-purple-300">Manager *</Label>
              <Select
                value={exportData.manager}
                onValueChange={(value) => setExportData(prev => ({ ...prev, manager: value }))}
              >
                <SelectTrigger className="bg-black/30 border-purple-500/30">
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sarah de Vries">Sarah de Vries - Lead Supervisor</SelectItem>
                  <SelectItem value="Mark Jansen">Mark Jansen - Department Head</SelectItem>
                  <SelectItem value="Lisa van Meer">Lisa van Meer - Site Manager</SelectItem>
                  <SelectItem value="Tom Bakker">Tom Bakker - Regional Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-purple-300">Start Date *</Label>
              <Input
                type="date"
                value={exportData.start_date}
                onChange={(e) => setExportData(prev => ({ ...prev, start_date: e.target.value }))}
                className="bg-black/30 border-purple-500/30 text-white"
              />
            </div>

            <div>
              <Label className="text-purple-300">Contract Type *</Label>
              <Select
                value={exportData.contract_type}
                onValueChange={(value) => setExportData(prev => ({ ...prev, contract_type: value }))}
              >
                <SelectTrigger className="bg-black/30 border-purple-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-purple-300">Hours per Week *</Label>
              <Input
                type="number"
                value={exportData.hours_per_week}
                onChange={(e) => setExportData(prev => ({ ...prev, hours_per_week: parseInt(e.target.value) }))}
                min="1"
                max="40"
                className="bg-black/30 border-purple-500/30 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-purple-300">Notes for Employes.nl Entry</Label>
            <Textarea
              value={exportData.notes}
              onChange={(e) => setExportData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information for the employes.nl profile..."
              className="bg-black/30 border-purple-500/30 text-white min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <Button
            onClick={handleExportForEmployes}
            disabled={!isExportDataValid || isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Export...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Employes.nl Export Package
              </>
            )}
          </Button>

          <Button
            onClick={handleCopyToClipboard}
            variant="outline"
            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Data
          </Button>
        </div>

        {/* Instructions */}
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-yellow-300 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Next Steps After Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-yellow-400 text-sm space-y-2 list-decimal list-inside">
              <li>Download the export package (PDF + JSON)</li>
              <li>Log into <a href="https://employes.nl" target="_blank" className="underline">employes.nl</a></li>
              <li>Create new employee profile using the exported data</li>
              <li>Note the Employes.nl employee ID</li>
              <li>Return here and click "Mark as Entered in Employes.nl"</li>
              <li>Wait for next sync to see staff member in Staff page</li>
            </ol>
          </CardContent>
        </Card>

        {/* Mark as Entered (after manual entry) */}
        {exportRecord && !exportRecord.employes_id && (
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-300 text-sm">After Entry in Employes.nl</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-blue-300">Employes.nl Employee ID</Label>
                <Input
                  value={employesId}
                  onChange={(e) => setEmployesId(e.target.value)}
                  placeholder="Enter employee ID from employes.nl"
                  className="bg-black/30 border-blue-500/30 text-white"
                />
              </div>
              <Button
                onClick={handleMarkAsEntered}
                disabled={!employesId || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Entered in Employes.nl
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {exportRecord?.employes_id && (
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div>
                  <h3 className="text-green-300 font-medium">Successfully Entered in Employes.nl</h3>
                  <p className="text-green-400 text-sm">
                    Employee ID: {exportRecord.employes_id} • 
                    Will sync to Staff page on next refresh
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

---

### Phase 2: Export Package Generator (Week 1-2)
**Agent Lead:** Component Refactoring Architect + Form Validation Agent

#### 2.1 Create Export Service
```typescript
// src/services/candidateExportService.ts
// Agent: Component Refactoring Architect

import { jsPDF } from 'jspdf';
import type { CandidateDashboardView, CandidateAiInsights } from '@/types/assessmentEngine';

interface EmployesExportData {
  // Personal info
  full_name: string;
  email: string;
  phone?: string;
  
  // Employment
  position: string;
  department: string;
  location: string;
  manager: string;
  start_date: string;
  contract_type: string;
  hours_per_week: number;
  
  // Compensation
  salary_amount?: number;
  hourly_wage?: number;
  
  // Additional
  notes?: string;
  disc_profile?: any;
  ai_insights?: CandidateAiInsights;
}

export class CandidateExportService {
  /**
   * Generate complete export package for employes.nl entry
   */
  static async generateExportPackage(
    candidate: CandidateDashboardView,
    exportData: EmployesExportData,
    aiInsights?: CandidateAiInsights
  ): Promise<{ pdf: Blob; json: string; csv: string }> {
    // Generate PDF document
    const pdf = await this.generatePDF(candidate, exportData, aiInsights);
    
    // Generate JSON data
    const json = this.generateJSON(candidate, exportData, aiInsights);
    
    // Generate CSV row
    const csv = this.generateCSV(candidate, exportData);
    
    return { pdf, json, csv };
  }
  
  /**
   * Generate professional PDF for printing/reference
   */
  private static async generatePDF(
    candidate: CandidateDashboardView,
    exportData: EmployesExportData,
    aiInsights?: CandidateAiInsights
  ): Promise<Blob> {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('TeddyKids - New Employee Profile', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    
    // Personal Information Section
    let y = 45;
    doc.setFontSize(14);
    doc.text('Personal Information', 20, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.text(`Full Name: ${exportData.full_name}`, 20, y);
    y += 7;
    doc.text(`Email: ${exportData.email}`, 20, y);
    y += 7;
    if (exportData.phone) {
      doc.text(`Phone: ${exportData.phone}`, 20, y);
      y += 7;
    }
    
    // Employment Details Section
    y += 10;
    doc.setFontSize(14);
    doc.text('Employment Details', 20, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.text(`Position: ${exportData.position}`, 20, y);
    y += 7;
    doc.text(`Department: ${exportData.department}`, 20, y);
    y += 7;
    doc.text(`Location: ${exportData.location}`, 20, y);
    y += 7;
    doc.text(`Manager: ${exportData.manager}`, 20, y);
    y += 7;
    doc.text(`Start Date: ${exportData.start_date}`, 20, y);
    y += 7;
    doc.text(`Contract Type: ${exportData.contract_type}`, 20, y);
    y += 7;
    doc.text(`Hours per Week: ${exportData.hours_per_week}`, 20, y);
    y += 7;
    
    // Assessment Summary
    y += 10;
    doc.setFontSize(14);
    doc.text('Assessment Summary', 20, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.text(`Assessment Score: ${candidate.overall_score}%`, 20, y);
    y += 7;
    doc.text(`AI Match Score: ${candidate.ai_match_score}%`, 20, y);
    y += 7;
    
    if (exportData.disc_profile) {
      doc.text(`DISC Profile: ${exportData.disc_profile.primaryColor} / ${exportData.disc_profile.secondaryColor}`, 20, y);
      y += 7;
    }
    
    // AI Insights Summary (if available)
    if (aiInsights) {
      y += 10;
      doc.setFontSize(14);
      doc.text('AI Hiring Recommendation', 20, y);
      
      y += 10;
      doc.setFontSize(10);
      doc.text(`Recommendation: ${aiInsights.hiring_recommendation.toUpperCase()}`, 20, y);
      y += 7;
      doc.text(`Confidence: ${Math.round(aiInsights.recommendation_confidence * 100)}%`, 20, y);
      y += 7;
      doc.text(`Cultural Fit: ${aiInsights.cultural_fit_score}%`, 20, y);
      y += 7;
      
      y += 10;
      doc.text('Key Strengths:', 20, y);
      y += 7;
      aiInsights.key_strengths?.slice(0, 3).forEach(strength => {
        doc.text(`• ${strength}`, 25, y);
        y += 7;
      });
      
      y += 5;
      doc.text('Development Areas:', 20, y);
      y += 7;
      aiInsights.potential_concerns?.slice(0, 3).forEach(concern => {
        doc.text(`• ${concern}`, 25, y);
        y += 7;
      });
    }
    
    // Notes
    if (exportData.notes) {
      y += 10;
      doc.setFontSize(14);
      doc.text('Additional Notes', 20, y);
      
      y += 10;
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(exportData.notes, 170);
      doc.text(splitNotes, 20, y);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.text('TeddyKids LMS - Confidential', 20, 280);
    
    return doc.output('blob');
  }
  
  /**
   * Generate JSON for system integration
   */
  private static generateJSON(
    candidate: CandidateDashboardView,
    exportData: EmployesExportData,
    aiInsights?: CandidateAiInsights
  ): string {
    const data = {
      candidate: {
        id: candidate.id,
        full_name: exportData.full_name,
        email: exportData.email,
        phone: exportData.phone,
        position_applied: candidate.position_applied,
        application_date: candidate.application_date,
      },
      employment: {
        position: exportData.position,
        department: exportData.department,
        location: exportData.location,
        manager: exportData.manager,
        start_date: exportData.start_date,
        contract_type: exportData.contract_type,
        hours_per_week: exportData.hours_per_week,
        salary_amount: exportData.salary_amount,
        hourly_wage: exportData.hourly_wage,
      },
      assessment: {
        overall_score: candidate.overall_score,
        ai_match_score: candidate.ai_match_score,
        passed: candidate.passed,
        disc_profile: exportData.disc_profile,
      },
      ai_insights: aiInsights ? {
        recommendation: aiInsights.hiring_recommendation,
        confidence: aiInsights.recommendation_confidence,
        cultural_fit_score: aiInsights.cultural_fit_score,
        role_suitability_score: aiInsights.role_suitability_score,
        key_strengths: aiInsights.key_strengths,
        potential_concerns: aiInsights.potential_concerns,
      } : null,
      notes: exportData.notes,
      export_metadata: {
        exported_at: new Date().toISOString(),
        exported_from: 'TeddyKids LMS - Talent Acquisition',
        version: '1.0',
      },
    };
    
    return JSON.stringify(data, null, 2);
  }
  
  /**
   * Generate CSV for spreadsheet import
   */
  private static generateCSV(
    candidate: CandidateDashboardView,
    exportData: EmployesExportData
  ): string {
    const headers = [
      'Full Name',
      'Email',
      'Phone',
      'Position',
      'Department',
      'Location',
      'Manager',
      'Start Date',
      'Contract Type',
      'Hours per Week',
      'Assessment Score',
      'AI Match Score',
      'DISC Profile',
    ];
    
    const row = [
      exportData.full_name,
      exportData.email,
      exportData.phone || '',
      exportData.position,
      exportData.department,
      exportData.location,
      exportData.manager,
      exportData.start_date,
      exportData.contract_type,
      exportData.hours_per_week.toString(),
      candidate.overall_score?.toString() || '',
      candidate.ai_match_score?.toString() || '',
      exportData.disc_profile ? `${exportData.disc_profile.primaryColor}/${exportData.disc_profile.secondaryColor}` : '',
    ];
    
    return [headers.join(','), row.map(cell => `"${cell}"`).join(',')].join('\n');
  }
  
  /**
   * Download export package as ZIP
   */
  static async downloadExportPackage(
    candidate: CandidateDashboardView,
    exportData: EmployesExportData,
    aiInsights?: CandidateAiInsights
  ): Promise<void> {
    const { pdf, json, csv } = await this.generateExportPackage(candidate, exportData, aiInsights);
    
    // Create ZIP file (using JSZip library)
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    const fileName = `${exportData.full_name.replace(/\s+/g, '_')}_${candidate.id.substring(0, 8)}`;
    
    zip.file(`${fileName}.pdf`, pdf);
    zip.file(`${fileName}.json`, json);
    zip.file(`${fileName}.csv`, csv);
    
    // Add README
    const readme = `
TeddyKids - New Employee Export Package
========================================

Candidate: ${exportData.full_name}
Position: ${exportData.position}
Export Date: ${new Date().toLocaleString()}

Files Included:
- ${fileName}.pdf - Complete profile for printing/reference
- ${fileName}.json - Structured data for system integration
- ${fileName}.csv - Data for spreadsheet import

Next Steps:
1. Review the PDF document
2. Log into employes.nl
3. Create new employee profile using this data
4. Note the employee ID from employes.nl
5. Return to TeddyKids LMS and mark as entered

For questions, contact: hr@teddykids.nl
`;
    
    zip.file('README.txt', readme);
    
    // Generate ZIP and download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_employes_export.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
```

---

### Phase 3: Database Integration (Week 2)
**Agent Lead:** Database Schema Guardian

#### 3.1 API Routes for Export
```typescript
// src/api/candidateExport.ts

import { supabase } from '@/lib/supabase';
import type { EmployesExportData } from '@/services/candidateExportService';

export const candidateExportAPI = {
  /**
   * Create export record
   */
  async createExport(candidateId: string, exportData: EmployesExportData) {
    const { data, error } = await supabase
      .from('candidate_employes_export')
      .insert({
        candidate_id: candidateId,
        ...exportData,
        exported_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update candidate status
    await supabase
      .from('candidates')
      .update({ 
        overall_status: 'approved_awaiting_employes',
        updated_at: new Date().toISOString(),
      })
      .eq('id', candidateId);
    
    return data;
  },
  
  /**
   * Mark as entered in employes.nl
   */
  async markAsEntered(exportId: string, employesId: string) {
    const { data, error } = await supabase
      .from('candidate_employes_export')
      .update({
        employes_id: employesId,
        employes_synced_at: new Date().toISOString(),
      })
      .eq('id', exportId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Get export record for candidate
   */
  async getExport(candidateId: string) {
    const { data, error } = await supabase
      .from('candidate_employes_export')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found"
    return data;
  },
};
```

---

### Phase 4: Design System Compliance (Week 2-3)
**Agent Lead:** Design System Enforcer

#### 4.1 Standardize All Components
```typescript
// Run design system audit
@design-system-enforcer audit talent acquisition components

// Fix violations:
// 1. Consistent color usage (semantic colors only)
// 2. Standard spacing (4-point grid)
// 3. Button variants (shadcn/ui only)
// 4. Icon library (Lucide only)
// 5. Card styling (consistent patterns)
```

#### 4.2 Create Reusable Export Components
```typescript
// src/components/talent/EmployesExportCard.tsx
// Agent: Design System Enforcer

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Copy, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export const EmployesExportCard = () => {
  // Standardized design system compliant component
  // All colors use semantic tokens
  // All spacing uses 4-point grid
  // All icons from Lucide
};
```

---

### Phase 5: Form Validation (Week 3)
**Agent Lead:** Form Validation Agent

#### 5.1 Add Validation to Export Form
```typescript
// src/schemas/employesExportSchema.ts
// Agent: Form Validation Agent

import { z } from 'zod';

export const EmployesExportSchema = z.object({
  // Required fields
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  manager: z.string().min(1, 'Manager is required'),
  start_date: z.string()
    .min(1, 'Start date is required')
    .refine(
      (date) => new Date(date) >= new Date(),
      { message: 'Start date must be in the future' }
    ),
  contract_type: z.enum(['permanent', 'temporary', 'internship'], {
    required_error: 'Contract type is required',
  }),
  hours_per_week: z.number()
    .min(1, 'Hours must be at least 1')
    .max(40, 'Hours cannot exceed 40'),
  
  // Optional fields with validation
  salary_amount: z.number()
    .min(0, 'Salary cannot be negative')
    .max(1000000, 'Salary seems unrealistic')
    .optional(),
  hourly_wage: z.number()
    .min(0, 'Wage cannot be negative')
    .max(200, 'Wage seems unrealistic')
    .optional(),
  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
});

// Usage in component:
const form = useFormValidation(initialData, EmployesExportSchema);
```

#### 5.2 Real-time Validation
```typescript
// Agent: Form Validation Agent

// Add validation indicators
<ValidatedField 
  name="department" 
  label="Department" 
  required
  error={form.errors.department}
  touched={form.touched.department}
>
  <Select ... />
</ValidatedField>

// Show validation summary
{Object.keys(form.errors).length > 0 && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Please fix the following errors:</AlertTitle>
    <AlertDescription>
      <ul className="list-disc list-inside">
        {Object.entries(form.errors).map(([field, error]) => (
          <li key={field}>{error}</li>
        ))}
      </ul>
    </AlertDescription>
  </Alert>
)}
```

---

### Phase 6: Future Release - Auto Staff Creation (Week 4+)
**Agent Lead:** Database Schema Guardian + Component Refactoring Architect

#### 6.1 API Integration with Employes.nl
```typescript
// FUTURE RELEASE: When employes.nl provides API

// src/services/employesAPI.ts
export class EmployesAPI {
  /**
   * Create employee in employes.nl via API
   */
  static async createEmployee(employeeData: EmployeeCreateData): Promise<string> {
    const response = await fetch('https://api.employes.nl/v1/employees', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EMPLOYES_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
    
    if (!response.ok) throw new Error('Failed to create employee');
    
    const data = await response.json();
    return data.employee_id; // Employes.nl ID
  }
  
  /**
   * Sync employee data from employes.nl
   */
  static async syncEmployee(employesId: string): Promise<EmployeeData> {
    // Fetch from employes.nl
    // This will be picked up by existing employes sync
  }
}

// Then update ApprovalWorkflowSystem to use API
const handleApproveWithAutoCreation = async () => {
  // 1. Create in employes.nl via API
  const employesId = await EmployesAPI.createEmployee(exportData);
  
  // 2. Create export record with employes_id
  await candidateExportAPI.createExport(candidate.id, {
    ...exportData,
    employes_id: employesId,
    employes_synced_at: new Date().toISOString(),
  });
  
  // 3. Trigger immediate sync
  await triggerEmployesSync();
  
  // 4. Staff will appear after sync!
};
```

---

## 📊 Updated Data Flow

### Current Flow (Phase 1-5)
```
1. CANDIDATE APPLIES
   DiscAssessmentWidget → saves to DB
   
2. HR REVIEWS
   CandidateAssessmentDashboard → views all candidates
   
3. HR VIEWS AI INSIGHTS
   AiInsightsEngine → shows recommendation
   
4. HR APPROVES
   ApprovalWorkflowSystem → "Export for Employes.nl" tab
   
5. **NEW: EXPORT FOR EMPLOYES.NL**
   - Fill employment details form
   - Generate export package (PDF + JSON + CSV)
   - Download ZIP file
   - Candidate status → "approved_awaiting_employes"
   
6. **MANUAL ENTRY** (Outside System)
   - HR logs into employes.nl
   - Creates employee profile manually
   - Notes employee ID
   
7. **MARK AS ENTERED**
   - Return to TeddyKids LMS
   - Enter employes.nl employee ID
   - System links candidate to future staff record
   
8. **AUTOMATIC SYNC**
   - Existing employes sync runs (hourly/daily)
   - New employee synced to staff table
   - Staff appears in Staff page! ✅
```

### Future Flow (Phase 6)
```
1-4: Same as above

5. **AUTO-CREATE IN EMPLOYES.NL**
   - API call to employes.nl
   - Employee created automatically
   - Returns employee ID
   
6. **IMMEDIATE SYNC**
   - Trigger sync immediately
   - Staff record created
   - Appears in Staff page instantly! 🚀
```

---

## 🎯 Success Metrics

### Phase 1-5 (Manual Process)
- ✅ No broken auto-staff-creation
- ✅ Smooth employes.nl integration
- ✅ Complete export packages
- ✅ Proper tracking of all candidates
- ✅ Clear instructions for HR team
- ⏱️ Time to staff: ~1-2 hours (manual entry + sync wait)

### Phase 6 (Automated)
- ✅ Zero manual entry
- ✅ Instant staff creation
- ✅ No data loss
- ✅ Full audit trail
- ⏱️ Time to staff: ~1 minute (API + sync)

---

## 📋 Implementation Checklist

### Week 1: Critical Fix
- [ ] Create migration for `candidate_employes_export` table
- [ ] Disable RLS on new table (Guardian verification)
- [ ] Add new status: `approved_awaiting_employes`
- [ ] Modify ApprovalWorkflowSystem component
- [ ] Replace "Staff Setup" tab with "Export for Employes.nl"
- [ ] Test manual workflow

### Week 2: Export System
- [ ] Build CandidateExportService
- [ ] PDF generator with all candidate data
- [ ] JSON generator for system integration
- [ ] CSV generator for spreadsheet
- [ ] ZIP packaging with README
- [ ] API routes for export CRUD
- [ ] Test export generation

### Week 3: Polish & Validation
- [ ] Design system audit (Enforcer)
- [ ] Fix color/spacing violations
- [ ] Add form validation (Validation Agent)
- [ ] Real-time error feedback
- [ ] Success/error states
- [ ] Instructions and tooltips
- [ ] E2E testing

### Week 4: Documentation & Training
- [ ] HR user guide
- [ ] Video walkthrough
- [ ] Troubleshooting guide
- [ ] Monitor first uses
- [ ] Gather feedback
- [ ] Iterate on UX

### Future: API Integration
- [ ] Negotiate employes.nl API access
- [ ] Build API integration layer
- [ ] Add auto-creation feature flag
- [ ] Test API workflow
- [ ] Gradual rollout
- [ ] Monitor sync success rates

---

## 🚨 Rollback Plan

If something goes wrong:

```sql
-- Rollback migration
DROP TABLE IF EXISTS candidate_employes_export CASCADE;

-- Restore old behavior (Phase 6 future work)
-- Just don't enable auto-creation feature
```

---

## 💡 Key Insights

### Why This Approach Works
1. **Reality First**: Acknowledges employes.nl is source of truth
2. **No Breaking Changes**: Existing staff sync unchanged
3. **Clear Bridge**: Export → Manual Entry → Sync
4. **Future-Proof**: Easy to add API when available
5. **Audit Trail**: Complete tracking of all steps

### What We Avoid
- ❌ Creating staff records that don't exist in employes.nl
- ❌ Data inconsistencies between systems
- ❌ Confusion about where staff data lives
- ❌ Breaking existing employes sync
- ❌ Premature optimization (API when we can't use it yet)

---

## 🎓 Training Materials Needed

### For HR Team
1. **Video**: "How to Export a Candidate for Employes.nl" (5 min)
2. **PDF**: "Step-by-Step: New Hire Process" (2 pages)
3. **FAQ**: "Common Questions About Candidate Export"

### For Developers
1. **Docs**: "Candidate Export Architecture"
2. **Docs**: "Future API Integration Plan"
3. **Runbook**: "Troubleshooting Export Issues"

---

*Implementation Plan Created: October 22, 2025*  
*Agents: Refactoring Architect, Schema Guardian, Design Enforcer, Form Validator*  
*Ready for Development: ✅ Let's build this!* 🚀

