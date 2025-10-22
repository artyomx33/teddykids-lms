-- =============================================================================
-- TALENT ACQUISITION - LUNA-APPROVED SCHEMA
-- =============================================================================
-- Migration: 001_talent_acquisition_luna_approved.sql
-- Agent: Database Schema Guardian
-- Created: October 22, 2025
-- Purpose: Implement complete talent acquisition system with trial reviews
--
-- CHANGES:
-- 1. Create candidates table with full DISC profile support
-- 2. Create candidate_trial_reviews table (separate from staff_reviews)
-- 3. Create candidate_employes_export table (for employes.nl integration)
-- 4. Add proper status enums
-- 5. Add indexes and triggers
-- 6. DISABLE RLS (development-first approach)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CANDIDATE STATUS ENUM
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE candidate_status AS ENUM (
    'application_received',  -- 📩 Just applied
    'verified',              -- 🔎 Documents checked
    'trial_invited',         -- ✉️ Trial scheduled
    'trial_completed',       -- ✅ Trial done
    'decision_finalized',    -- 🟢 Hired/Rejected/Hold
    'offer_signed'           -- 📝 Offer accepted (optional)
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- 2. CANDIDATE DECISION ENUM
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE candidate_decision AS ENUM (
    'pending',     -- No decision yet
    'hired',       -- ✅ Approved for hire
    'on_hold',     -- ⏸️ Keep for later
    'not_hired',   -- ❌ Rejected
    'withdrawn'    -- Candidate withdrew
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- 3. CANDIDATES TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Personal Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  
  -- Application Details
  role_applied TEXT NOT NULL, -- "Teacher", "Intern", "Assistant"
  language TEXT NOT NULL,     -- "EN", "NL", "Bilingual"
  position_applied TEXT,      -- More specific than role_applied
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Document URLs (stored in Supabase Storage)
  docs_diploma_url TEXT,
  docs_id_url TEXT,
  docs_cv_url TEXT,
  docs_other_urls JSONB, -- Array of additional docs
  
  -- Status & Flow
  status candidate_status NOT NULL DEFAULT 'application_received',
  decision candidate_decision DEFAULT 'pending',
  decision_reason TEXT,
  decision_date DATE,
  
  -- Trial Information
  trial_date DATE,
  trial_location TEXT,
  trial_group TEXT, -- "Babies (0-1)", "1-2 years", "3+ years"
  trial_scheduled_at TIMESTAMPTZ,
  
  -- DISC Profile (stored as JSONB)
  disc_profile JSONB,
  /*
    Expected structure:
    {
      "primary_color": "Red",
      "secondary_color": "Green",
      "color_distribution": {
        "red": 13,
        "blue": 8,
        "green": 12,
        "yellow": 7
      },
      "redflag_count": 2,
      "redflag_question_ids": [21, 25],
      "redflag_details": [
        {
          "question_id": 21,
          "question_text": "How do you handle stress?",
          "answer_given": "I get very angry",
          "why_flagged": "Indicates poor emotional regulation"
        }
      ],
      "group_fit": "1-2 years",
      "group_fit_confidence": 85,
      "personality_traits": ["Direct", "Task-oriented", "Results-driven"],
      "strengths": ["Leadership", "Decision-making"],
      "potential_challenges": ["May be too direct", "Impatient"]
    }
  */
  
  -- Quick access fields (denormalized for queries)
  redflag_count INTEGER DEFAULT 0,
  group_fit TEXT,
  primary_disc_color TEXT,
  secondary_disc_color TEXT,
  
  -- Assessment Scores
  assessment_answers JSONB, -- All 40 Q&A pairs
  overall_score DECIMAL(5,2), -- 0-100
  ai_match_score DECIMAL(5,2), -- 0-100 (if AI insights used)
  passed BOOLEAN,
  
  -- Internal Notes
  internal_notes JSONB, -- Array of { date, author, note, private }
  hr_tags TEXT[], -- ["urgent", "excellent", "reapply_later"]
  
  -- Conversion Tracking
  converted_to_staff BOOLEAN DEFAULT FALSE,
  staff_id UUID, -- Links to staff table after employes sync
  employes_id TEXT, -- Employee ID in employes.nl
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  last_updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for candidates
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_decision ON candidates(decision);
CREATE INDEX IF NOT EXISTS idx_candidates_trial_date ON candidates(trial_date);
CREATE INDEX IF NOT EXISTS idx_candidates_redflag_count ON candidates(redflag_count) WHERE redflag_count > 0;
CREATE INDEX IF NOT EXISTS idx_candidates_application_date ON candidates(application_date DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_staff_id ON candidates(staff_id) WHERE staff_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_employes_id ON candidates(employes_id) WHERE employes_id IS NOT NULL;

-- NO RLS! (Development-first approach)
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
COMMENT ON TABLE candidates IS 'Candidate applications for hiring. RLS disabled for development. Enable before production.';

-- Update trigger for candidates
CREATE OR REPLACE FUNCTION update_candidates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_candidates_timestamp
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_candidates_timestamp();

-- -----------------------------------------------------------------------------
-- 4. CANDIDATE TRIAL REVIEWS TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS candidate_trial_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  -- Trial Details
  trial_date DATE NOT NULL,
  trial_location TEXT NOT NULL,
  trial_group TEXT NOT NULL, -- "Babies", "1-2 years", "3+ years"
  trial_duration_hours DECIMAL(3,1), -- e.g., 3.5 hours
  trial_style TEXT, -- "observation", "active_participation", "mixed"
  
  -- Supervisor Information
  supervisor_id UUID, -- Could reference staff table if available
  supervisor_name TEXT NOT NULL,
  supervisor_email TEXT,
  
  -- Pre-Trial Assessment (Optional)
  pre_trial_rating INTEGER CHECK (pre_trial_rating BETWEEN 1 AND 5),
  pre_trial_notes TEXT,
  pre_trial_expectations TEXT,
  
  -- Trial Evaluation Checklist (1-5 scale for each)
  checklist_interaction_with_children INTEGER NOT NULL CHECK (checklist_interaction_with_children BETWEEN 1 AND 5),
  checklist_communication_skills INTEGER NOT NULL CHECK (checklist_communication_skills BETWEEN 1 AND 5),
  checklist_follows_instructions INTEGER NOT NULL CHECK (checklist_follows_instructions BETWEEN 1 AND 5),
  checklist_initiative INTEGER NOT NULL CHECK (checklist_initiative BETWEEN 1 AND 5),
  checklist_safety_awareness INTEGER NOT NULL CHECK (checklist_safety_awareness BETWEEN 1 AND 5),
  checklist_punctuality INTEGER NOT NULL CHECK (checklist_punctuality BETWEEN 1 AND 5),
  checklist_teamwork INTEGER NOT NULL CHECK (checklist_teamwork BETWEEN 1 AND 5),
  checklist_adaptability INTEGER NOT NULL CHECK (checklist_adaptability BETWEEN 1 AND 5),
  
  -- Post-Trial Assessment (Required)
  post_trial_rating INTEGER NOT NULL CHECK (post_trial_rating BETWEEN 1 AND 5),
  post_trial_notes TEXT NOT NULL,
  
  -- Overall Assessment
  overall_performance DECIMAL(3,1), -- Calculated average of checklist scores
  would_hire BOOLEAN,
  hire_confidence INTEGER CHECK (hire_confidence BETWEEN 1 AND 5), -- How sure are they?
  
  -- Qualitative Feedback
  strengths TEXT, -- What they did well
  concerns TEXT, -- What needs improvement
  specific_incidents TEXT, -- Notable behaviors (good or bad)
  
  -- Additional Fields
  children_response TEXT, -- How did children respond to candidate?
  team_fit TEXT, -- How did they fit with existing team?
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  is_final BOOLEAN DEFAULT TRUE -- If false, this is a draft
);

-- Indexes for trial reviews
CREATE INDEX IF NOT EXISTS idx_candidate_trial_reviews_candidate_id 
  ON candidate_trial_reviews(candidate_id);

CREATE INDEX IF NOT EXISTS idx_candidate_trial_reviews_trial_date 
  ON candidate_trial_reviews(trial_date DESC);

CREATE INDEX IF NOT EXISTS idx_candidate_trial_reviews_would_hire 
  ON candidate_trial_reviews(would_hire) WHERE would_hire = true;

-- NO RLS! (Development-first approach)
ALTER TABLE candidate_trial_reviews DISABLE ROW LEVEL SECURITY;
COMMENT ON TABLE candidate_trial_reviews IS 'Trial evaluations for candidates. Separate from staff_reviews. RLS disabled for development.';

-- Update trigger for trial reviews
CREATE OR REPLACE FUNCTION update_candidate_trial_reviews_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_candidate_trial_reviews_timestamp
  BEFORE UPDATE ON candidate_trial_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_trial_reviews_timestamp();

-- Auto-calculate overall_performance
CREATE OR REPLACE FUNCTION calculate_trial_overall_performance()
RETURNS TRIGGER AS $$
BEGIN
  NEW.overall_performance = (
    NEW.checklist_interaction_with_children +
    NEW.checklist_communication_skills +
    NEW.checklist_follows_instructions +
    NEW.checklist_initiative +
    NEW.checklist_safety_awareness +
    NEW.checklist_punctuality +
    NEW.checklist_teamwork +
    NEW.checklist_adaptability
  ) / 8.0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_trial_overall_performance
  BEFORE INSERT OR UPDATE ON candidate_trial_reviews
  FOR EACH ROW
  EXECUTE FUNCTION calculate_trial_overall_performance();

-- -----------------------------------------------------------------------------
-- 5. CANDIDATE EMPLOYES EXPORT TABLE
-- -----------------------------------------------------------------------------

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
  contract_type TEXT NOT NULL, -- "permanent", "temporary", "internship"
  hours_per_week INTEGER NOT NULL,
  salary_amount DECIMAL(10,2),
  hourly_wage DECIMAL(10,2),
  employee_number TEXT,
  
  -- Export tracking
  exported_at TIMESTAMPTZ DEFAULT NOW(),
  exported_by UUID REFERENCES auth.users(id),
  export_package_url TEXT, -- URL to downloaded ZIP file
  
  -- Employes.nl integration
  employes_id TEXT, -- Will be filled after manual entry
  employes_synced_at TIMESTAMPTZ,
  sync_status TEXT, -- "pending", "synced", "error"
  
  -- Additional data
  notes TEXT,
  disc_profile JSONB, -- Copy of candidate's DISC
  trial_summary JSONB, -- Copy of trial review
  ai_insights JSONB, -- Copy of AI recommendations
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for employes export
CREATE INDEX IF NOT EXISTS idx_candidate_employes_export_candidate_id 
  ON candidate_employes_export(candidate_id);

CREATE INDEX IF NOT EXISTS idx_candidate_employes_export_employes_id 
  ON candidate_employes_export(employes_id) 
  WHERE employes_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_candidate_employes_export_sync_status 
  ON candidate_employes_export(sync_status);

-- NO RLS! (Development-first approach)
ALTER TABLE candidate_employes_export DISABLE ROW LEVEL SECURITY;
COMMENT ON TABLE candidate_employes_export IS 'Export data for employes.nl manual entry. RLS disabled for development.';

-- Update trigger for employes export
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

-- -----------------------------------------------------------------------------
-- 6. HELPER VIEWS
-- -----------------------------------------------------------------------------

-- View: Candidates with trial summaries
CREATE OR REPLACE VIEW candidates_with_trials AS
SELECT 
  c.*,
  t.trial_date AS latest_trial_date,
  t.post_trial_rating AS latest_trial_rating,
  t.overall_performance AS latest_trial_performance,
  t.would_hire AS latest_would_hire,
  t.supervisor_name AS latest_supervisor
FROM candidates c
LEFT JOIN LATERAL (
  SELECT *
  FROM candidate_trial_reviews
  WHERE candidate_id = c.id
  ORDER BY trial_date DESC
  LIMIT 1
) t ON true;

-- View: Candidates ready for export
CREATE OR REPLACE VIEW candidates_ready_for_export AS
SELECT 
  c.*,
  t.would_hire,
  t.overall_performance
FROM candidates c
LEFT JOIN candidate_trial_reviews t ON t.candidate_id = c.id
WHERE c.decision = 'hired'
  AND c.converted_to_staff = false
  AND c.employes_id IS NULL
ORDER BY c.decision_date DESC;

-- View: Dashboard metrics
CREATE OR REPLACE VIEW candidate_dashboard_metrics AS
SELECT 
  COUNT(*) AS total_candidates,
  COUNT(*) FILTER (WHERE status = 'application_received') AS new_applications,
  COUNT(*) FILTER (WHERE status = 'verified') AS verified,
  COUNT(*) FILTER (WHERE status = 'trial_invited') AS awaiting_trial,
  COUNT(*) FILTER (WHERE status = 'trial_completed') AS trial_completed,
  COUNT(*) FILTER (WHERE decision = 'hired') AS hired,
  COUNT(*) FILTER (WHERE decision = 'not_hired') AS not_hired,
  COUNT(*) FILTER (WHERE decision = 'on_hold') AS on_hold,
  COUNT(*) FILTER (WHERE redflag_count >= 2) AS with_redflags,
  AVG(overall_score) AS avg_overall_score,
  COUNT(*) FILTER (WHERE converted_to_staff = true) AS converted_to_staff
FROM candidates
WHERE created_at >= NOW() - INTERVAL '90 days';

-- -----------------------------------------------------------------------------
-- 7. CANDIDATE EVENTS (AUDIT TRAIL) - LUNA ADDITION
-- -----------------------------------------------------------------------------

-- Audit trail for all candidate status changes and important events
CREATE TABLE IF NOT EXISTS candidate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL, -- 'status_change', 'decision_made', 'trial_scheduled', 'note_added', 'document_uploaded', etc
  event_description TEXT NOT NULL,
  
  -- Old vs New values (for changes)
  old_value TEXT,
  new_value TEXT,
  
  -- Context
  triggered_by UUID REFERENCES auth.users(id),
  triggered_by_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Additional data
  metadata JSONB, -- Any extra context
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for candidate_events
CREATE INDEX IF NOT EXISTS idx_candidate_events_candidate_id 
  ON candidate_events(candidate_id);

CREATE INDEX IF NOT EXISTS idx_candidate_events_event_type 
  ON candidate_events(event_type);

CREATE INDEX IF NOT EXISTS idx_candidate_events_created_at 
  ON candidate_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_candidate_events_triggered_by 
  ON candidate_events(triggered_by) 
  WHERE triggered_by IS NOT NULL;

-- NO RLS! (Development-first approach)
ALTER TABLE candidate_events DISABLE ROW LEVEL SECURITY;
COMMENT ON TABLE candidate_events IS 'Audit trail for candidate events. Tracks all status changes and important actions. RLS disabled for development.';

-- Function to automatically log status changes
CREATE OR REPLACE FUNCTION log_candidate_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO candidate_events (
      candidate_id,
      event_type,
      event_description,
      old_value,
      new_value,
      triggered_by,
      metadata
    ) VALUES (
      NEW.id,
      'status_change',
      'Candidate status changed from ' || OLD.status || ' to ' || NEW.status,
      OLD.status,
      NEW.status,
      NEW.last_updated_by,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'changed_at', NOW()
      )
    );
  END IF;
  
  IF (TG_OP = 'UPDATE' AND OLD.decision IS DISTINCT FROM NEW.decision) THEN
    INSERT INTO candidate_events (
      candidate_id,
      event_type,
      event_description,
      old_value,
      new_value,
      triggered_by,
      metadata
    ) VALUES (
      NEW.id,
      'decision_made',
      'Hiring decision changed from ' || OLD.decision || ' to ' || NEW.decision,
      OLD.decision,
      NEW.decision,
      NEW.last_updated_by,
      jsonb_build_object(
        'old_decision', OLD.decision,
        'new_decision', NEW.decision,
        'decision_reason', NEW.decision_reason,
        'decided_at', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_candidate_status_change
  AFTER UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION log_candidate_status_change();

-- View: Candidate timeline (recent events)
CREATE OR REPLACE VIEW candidate_timeline AS
SELECT 
  ce.*,
  c.full_name AS candidate_name,
  c.email AS candidate_email
FROM candidate_events ce
JOIN candidates c ON c.id = ce.candidate_id
ORDER BY ce.created_at DESC;

-- -----------------------------------------------------------------------------
-- 8. GAMIFIED BADGES (LUNA ADDITION)
-- -----------------------------------------------------------------------------

-- Add badge_title field to candidates table
ALTER TABLE candidates 
  ADD COLUMN IF NOT EXISTS badge_title TEXT,
  ADD COLUMN IF NOT EXISTS badge_emoji TEXT,
  ADD COLUMN IF NOT EXISTS badge_description TEXT;

COMMENT ON COLUMN candidates.badge_title IS 'Gamified personality badge based on DISC/group-fit (e.g., "Chaos Navigator", "Warm Heart")';
COMMENT ON COLUMN candidates.badge_emoji IS 'Emoji for the badge (e.g., "🧭", "💝")';
COMMENT ON COLUMN candidates.badge_description IS 'Description of what this badge means';

-- Function to auto-assign badges based on DISC profile
CREATE OR REPLACE FUNCTION assign_candidate_badge()
RETURNS TRIGGER AS $$
DECLARE
  primary_color TEXT;
  secondary_color TEXT;
  group_fit_val TEXT;
BEGIN
  IF NEW.disc_profile IS NOT NULL THEN
    primary_color := NEW.disc_profile->>'primary_color';
    secondary_color := NEW.disc_profile->>'secondary_color';
    group_fit_val := NEW.disc_profile->>'group_fit';
    
    -- Assign badges based on DISC combinations
    -- Red/Blue = "Strategic Leader"
    IF primary_color = 'Red' AND secondary_color = 'Blue' THEN
      NEW.badge_title := 'Strategic Leader';
      NEW.badge_emoji := '🎯';
      NEW.badge_description := 'Results-driven with high attention to detail';
    
    -- Red/Yellow = "Chaos Navigator"
    ELSIF primary_color = 'Red' AND secondary_color = 'Yellow' THEN
      NEW.badge_title := 'Chaos Navigator';
      NEW.badge_emoji := '🧭';
      NEW.badge_description := 'Thrives in dynamic, fast-paced environments';
    
    -- Blue/Green = "Steady Anchor"
    ELSIF primary_color = 'Blue' AND secondary_color = 'Green' THEN
      NEW.badge_title := 'Steady Anchor';
      NEW.badge_emoji := '⚓';
      NEW.badge_description := 'Reliable, methodical, and patient';
    
    -- Green/Yellow = "Warm Heart"
    ELSIF primary_color = 'Green' AND secondary_color = 'Yellow' THEN
      NEW.badge_title := 'Warm Heart';
      NEW.badge_emoji := '💝';
      NEW.badge_description := 'Empathetic team player who brings joy';
    
    -- Yellow/Red = "Energetic Catalyst"
    ELSIF primary_color = 'Yellow' AND secondary_color = 'Red' THEN
      NEW.badge_title := 'Energetic Catalyst';
      NEW.badge_emoji := '⚡';
      NEW.badge_description := 'High energy and infectious enthusiasm';
    
    -- Yellow/Blue = "Creative Organizer"
    ELSIF primary_color = 'Yellow' AND secondary_color = 'Blue' THEN
      NEW.badge_title := 'Creative Organizer';
      NEW.badge_emoji := '🎨';
      NEW.badge_description := 'Innovative yet structured approach';
    
    -- Green/Red = "Gentle Guardian"
    ELSIF primary_color = 'Green' AND secondary_color = 'Red' THEN
      NEW.badge_title := 'Gentle Guardian';
      NEW.badge_emoji := '🛡️';
      NEW.badge_description := 'Protective and caring with quiet strength';
    
    -- Blue/Red = "Precision Powerhouse"
    ELSIF primary_color = 'Blue' AND secondary_color = 'Red' THEN
      NEW.badge_title := 'Precision Powerhouse';
      NEW.badge_emoji := '🎖️';
      NEW.badge_description := 'Exacting standards with drive to execute';
    
    -- Default badges by primary color only
    ELSIF primary_color = 'Red' THEN
      NEW.badge_title := 'Bold Pioneer';
      NEW.badge_emoji := '🚀';
      NEW.badge_description := 'Direct and results-focused';
    
    ELSIF primary_color = 'Blue' THEN
      NEW.badge_title := 'Thoughtful Analyst';
      NEW.badge_emoji := '🔬';
      NEW.badge_description := 'Analytical and detail-oriented';
    
    ELSIF primary_color = 'Green' THEN
      NEW.badge_title := 'Peaceful Supporter';
      NEW.badge_emoji := '🌿';
      NEW.badge_description := 'Patient and supportive team member';
    
    ELSIF primary_color = 'Yellow' THEN
      NEW.badge_title := 'Sunshine Spreader';
      NEW.badge_emoji := '☀️';
      NEW.badge_description := 'Optimistic and people-focused';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assign_candidate_badge
  BEFORE INSERT OR UPDATE OF disc_profile ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION assign_candidate_badge();

-- -----------------------------------------------------------------------------
-- 9. SEED DATA (Optional - for testing)
-- -----------------------------------------------------------------------------

-- Insert test candidate (only if in development)
-- DO $$
-- BEGIN
--   IF current_database() LIKE '%dev%' OR current_database() LIKE '%test%' THEN
--     INSERT INTO candidates (
--       full_name, email, phone, role_applied, language, position_applied,
--       status, disc_profile, redflag_count, group_fit
--     ) VALUES (
--       'Test Candidate', 'test@example.com', '+31612345678',
--       'Teacher', 'EN', 'Junior Teacher',
--       'application_received',
--       '{"primary_color": "Red", "secondary_color": "Green", "color_distribution": {"red": 13, "blue": 8, "green": 12, "yellow": 7}, "redflag_count": 0, "group_fit": "1-2 years"}',
--       0,
--       '1-2 years'
--     ) ON CONFLICT (email) DO NOTHING;
--   END IF;
-- END $$;

-- -----------------------------------------------------------------------------
-- MIGRATION COMPLETE
-- -----------------------------------------------------------------------------

COMMENT ON SCHEMA public IS 'Talent Acquisition schema updated with Luna-approved candidate flow, trial reviews, and employes.nl export system. All RLS disabled for development.';

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 001_talent_acquisition_luna_approved.sql completed successfully!';
  RAISE NOTICE 'Tables created: candidates, candidate_trial_reviews, candidate_employes_export';
  RAISE NOTICE 'Views created: candidates_with_trials, candidates_ready_for_export, candidate_dashboard_metrics';
  RAISE NOTICE 'RLS Status: DISABLED (remember to enable before production)';
END $$;

