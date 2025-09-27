-- ============================================
-- 🧸📚 INSTALL KNOWLEDGE CENTER FROM SCRATCH
-- ============================================
-- Clean installation - no existing tables to conflict with
-- ============================================

-- Step 1: Create all tables
CREATE TABLE public.tk_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  version TEXT,
  pdf_path TEXT,
  required BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.tk_document_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doc_id UUID NOT NULL REFERENCES public.tk_documents(id) ON DELETE CASCADE,
  section_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.staff_knowledge_completion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL,
  doc_id UUID NOT NULL REFERENCES public.tk_documents(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.tk_document_sections(id) ON DELETE CASCADE,
  score INTEGER,
  passed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attempts INTEGER NOT NULL DEFAULT 1,
  UNIQUE(staff_id, doc_id, section_id)
);

-- Step 2: Enable RLS
ALTER TABLE public.tk_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tk_document_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_knowledge_completion ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS Policies
CREATE POLICY "Allow all operations for tk_documents" 
  ON public.tk_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for tk_document_sections" 
  ON public.tk_document_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for staff_knowledge_completion" 
  ON public.staff_knowledge_completion FOR ALL USING (true) WITH CHECK (true);

-- Step 4: Grant permissions
GRANT ALL ON public.tk_documents TO authenticated, anon;
GRANT ALL ON public.tk_document_sections TO authenticated, anon;
GRANT ALL ON public.staff_knowledge_completion TO authenticated, anon;

-- Step 5: Install Module 1 - Intern Working Hours
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'Intern Working Hours & Substitute Contracts',
  'intern-hours',
  'Essential information about working hours, substitute contracts, and scheduling policies for interns at Teddy Kids.',
  true
);

INSERT INTO tk_document_sections (doc_id, section_number, title, content, summary, key_points, questions) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'intern-hours'),
  1,
  'Working Hours Overview',
  'As an intern at Teddy Kids, you will work flexible hours based on our needs and your availability. Typical shifts include:

**Morning Shifts:** 7:30 AM - 1:00 PM (5.5 hours)
**Afternoon Shifts:** 1:00 PM - 6:30 PM (5.5 hours)  
**Full Days:** 7:30 AM - 6:30 PM (with breaks)

You will receive your schedule weekly, typically on Friday for the following week. Please check your email and respond promptly to confirm your availability.',
  'Interns work flexible morning, afternoon, or full-day shifts with weekly scheduling provided on Fridays.',
  '["Morning shifts: 7:30 AM - 1:00 PM", "Afternoon shifts: 1:00 PM - 6:30 PM", "Schedules provided weekly on Fridays", "Must confirm availability promptly"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "When do interns typically receive their weekly schedule?",
      "options": ["Monday", "Friday", "Sunday"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "Morning shifts at Teddy Kids start at 8:00 AM.",
      "correctAnswer": false
    }
  ]'
);

-- Step 6: Install Module 2 - BSO Protocol
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'Working in BSO at Lorentzkade',
  'bso-protocol',
  'Specific protocols and procedures for working in the BSO (after-school care) at our Lorentzkade location.',
  true
);

INSERT INTO tk_document_sections (doc_id, section_number, title, content, summary, key_points, questions) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'bso-protocol'),
  1,
  'BSO Environment & Setup',
  'The BSO at Lorentzkade serves children ages 4-12 after school hours. Key responsibilities include:

**Arrival Preparation (2:30-3:00 PM):**
- Set up activity stations
- Prepare healthy snacks
- Review attendance lists

**Active Hours (3:00-6:30 PM):**
- Supervise homework time
- Lead recreational activities
- Manage pickup procedures

**Safety Priorities:**
- Maintain child-to-staff ratios
- Monitor outdoor play areas
- Follow emergency procedures',
  'BSO at Lorentzkade serves ages 4-12 with structured arrival prep, active supervision, and safety protocols.',
  '["Serves children ages 4-12 after school", "Arrival prep from 2:30-3:00 PM", "Active hours 3:00-6:30 PM", "Maintain safety ratios and emergency procedures"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What age range does BSO at Lorentzkade serve?",
      "options": ["2-8 years", "4-12 years", "6-14 years"],
      "correctAnswer": 1
    }
  ]'
);

-- Step 7: Install Module 3 - Safety & Health
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'Safety & Health at Lorentzkade',
  'safety-health-lorentzkade',
  'Comprehensive safety protocols, health procedures, and emergency guidelines for the Lorentzkade location.',
  true
);

INSERT INTO tk_document_sections (doc_id, section_number, title, content, summary, key_points, questions) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health-lorentzkade'),
  1,
  'Emergency Procedures',
  'All staff must know emergency procedures:

**Fire Emergency:**
1. Sound alarm immediately
2. Evacuate via nearest exit
3. Gather at designated meeting point
4. Take attendance
5. Call emergency services (112)

**Medical Emergency:**
1. Assess situation safely
2. Provide immediate first aid if trained
3. Call 112 for serious injuries
4. Contact parents/guardians
5. Document incident thoroughly

**Missing Child:**
1. Search immediate area (2 minutes)
2. Alert all staff
3. Lock down facility
4. Call parents and police
5. Continue search while waiting for help',
  'Emergency procedures cover fire evacuation, medical response, and missing child protocols with specific steps.',
  '["Fire: alarm, evacuate, gather, attendance, call 112", "Medical: assess, first aid, call 112, contact parents, document", "Missing child: search, alert staff, lock down, call police"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What is the emergency number in the Netherlands?",
      "options": ["911", "999", "112"],
      "correctAnswer": 2
    }
  ]'
);

-- Verify installation
SELECT 
  'SUCCESS: Knowledge Center Installed!' as status,
  d.title,
  d.slug,
  COUNT(s.id) as sections
FROM tk_documents d
LEFT JOIN tk_document_sections s ON s.doc_id = d.id
GROUP BY d.id, d.title, d.slug
ORDER BY d.created_at;

-- Final success message
SELECT '✅ Knowledge Center ready! Visit /growbuddy/knowledge' as result;
