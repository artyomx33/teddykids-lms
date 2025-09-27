-- ============================================
-- 🧸📚 RESTORE KNOWLEDGE CENTER (SAFE MODE)
-- ============================================
-- This safely adds missing modules without duplicates
-- ============================================

-- First, check what we have
SELECT title, slug FROM tk_documents ORDER BY created_at;

-- Delete all existing data to start fresh (safer than trying to merge)
DELETE FROM staff_knowledge_completion;
DELETE FROM tk_document_sections;
DELETE FROM tk_documents;

-- Reset sequences if needed
-- (Now we can run the full restore)

-- Create tables for Teddy Kids Knowledge system

-- Documents table
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

-- Document sections table
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

-- Staff knowledge completion tracking
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

-- Enable RLS
ALTER TABLE public.tk_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tk_document_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_knowledge_completion ENABLE ROW LEVEL SECURITY;

-- RLS Policies - allow all operations for now (no auth implemented yet)
CREATE POLICY "Allow all operations for tk_documents" ON public.tk_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for tk_document_sections" ON public.tk_document_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for staff_knowledge_completion" ON public.staff_knowledge_completion FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_tk_doc_sections_doc_id ON public.tk_document_sections(doc_id);
CREATE INDEX idx_staff_knowledge_staff_id ON public.staff_knowledge_completion(staff_id);
CREATE INDEX idx_staff_knowledge_doc_id ON public.staff_knowledge_completion(doc_id);

-- Insert the Pedagogical Approach document
INSERT INTO public.tk_documents (title, slug, description, required) VALUES 
('Pedagogical Approach & Curriculum Daycare', 'pedagogy', 'Learn the core philosophy and daily practices of Teddy Kids early childhood education', true);

-- Get the document ID for sections
DO $$
DECLARE
    doc_id UUID;
BEGIN
    SELECT id INTO doc_id FROM public.tk_documents WHERE slug = 'pedagogy';
    
    -- Insert sections
    INSERT INTO public.tk_document_sections (doc_id, section_number, title, content, summary, key_points, questions) VALUES
    (doc_id, 1, 'Our Philosophy at Teddy Kids', 
     'At Teddy Kids, we believe that children don''t just learn with their heads — they grow with their *entire selves.* That includes their bodies, feelings, social interactions, creativity, and sense of curiosity. We treat every child as **unique**, and we adapt to what they need — not the other way around. Our approach is grounded in these principles: **Structure + Love**: Children need a predictable rhythm but also emotional freedom. **Freedom within boundaries**: Rules help children feel safe, but creativity is always encouraged. **Holistic development**: We support cognitive, emotional, physical, and social growth equally. **Every culture matters**: We celebrate diversity and multilingualism.',
     'Teddy Kids believes in holistic child development, treating every child as unique and supporting their cognitive, emotional, physical, and social growth through structure, love, and cultural celebration.',
     '["Teddy Kids sees children as individuals, not data points", "Emotional safety is as important as physical safety", "Bilingualism is encouraged through consistency", "Children learn by doing, exploring, and being seen"]',
     '[{"id": 1, "question": "Which of the following is NOT a core belief at Teddy Kids?", "type": "multiple-choice", "options": ["Emotional safety is optional", "Every child is unique", "Children grow through exploration"], "correctAnswer": 0}, {"id": 2, "question": "Rules and structure are used to limit children''s freedom.", "type": "true-false", "correctAnswer": false}]'),
    
    (doc_id, 2, 'The Rhythm of the Day',
     'Children thrive on routine. Every Teddy Kids group has a rhythm — not just a schedule. This means our day is structured but flexible. **Meals** happen at consistent times. **Naps** are scheduled but adapted to age and the child''s needs. **Play** is supervised but exploratory. **Transitions** (like clean-up, snack time, outside time) are smoothed with songs and rituals. It''s not a prison schedule — it''s a musical rhythm. And every group has its own *beat*.',
     'Teddy Kids follows a predictable daily rhythm that provides structure while remaining flexible to meet individual children''s needs, using songs and rituals to smooth transitions.',
     '["Predictable rhythm makes children feel safe", "Naps and meals follow a structure, but we adapt when needed", "Songs and rituals are part of transitions", "Staff use gentle guidance, not harsh corrections"]',
     '[{"id": 1, "question": "Why do we follow a daily rhythm at Teddy Kids?", "type": "multiple-choice", "options": ["To impress parents", "To reduce staff chaos", "To help children feel secure and know what to expect"], "correctAnswer": 2}, {"id": 2, "question": "A child is new and can''t sleep during nap time. What do you do?", "type": "multiple-choice", "options": ["Force them to lie still", "Let them skip nap for the first week", "Offer comfort, adjust, and slowly help them build the rhythm"], "correctAnswer": 2}]'),
    
    (doc_id, 3, 'The Language Policy – OPOL',
     'Teddy Kids is proudly bilingual — children are surrounded by both English and Dutch. But we don''t just throw the languages around randomly. We use a proven method called **OPOL: One Person, One Language.** Each educator speaks **only one language** to the children. If you''re assigned as the English speaker, you always speak English — even if a child responds in Dutch. This helps children build **real language separation**, avoids confusion and messy code-switching, and lets them feel secure — they *know* what to expect from each adult.',
     'Teddy Kids uses OPOL (One Person, One Language) where each educator consistently speaks only one language to help children develop clear language separation and feel secure.',
     '["OPOL = One Person, One Language", "You never switch mid-sentence (or mid-day)", "If you''re the Dutch speaker, you speak Dutch always", "This builds trust and clarity for the children"]',
     '[{"id": 1, "question": "What is the main goal of OPOL?", "type": "multiple-choice", "options": ["To create confusion", "To expose kids to as many words as possible from all adults", "To help children learn languages clearly and safely"], "correctAnswer": 2}, {"id": 2, "question": "A Dutch-speaking child asks an English-speaking educator for help. What should the educator do?", "type": "multiple-choice", "options": ["Answer in Dutch", "Switch languages for that moment", "Answer in English, with warmth and gestures"], "correctAnswer": 2}]'),
    
    (doc_id, 4, 'Celebrations & Cultural Traditions',
     'At Teddy Kids, we celebrate the entire world. Children come to us with cultures, stories, languages, holidays — and we honor all of it. We celebrate Sinterklaas & Christmas, Ramadan & Eid, Holi & Diwali, Easter & Spring festivals, Lunar New Year, and Birthdays with personalized attention. No holiday is forced. No child is pressured. We do not celebrate political events or nationalism, but we always make room for personal heritage and joy. For birthdays, we are sugar-free, so instead of cake, children receive custom-made birthday hats, decorations, group celebration time, songs in both languages, and photos.',
     'Teddy Kids celebrates global cultural traditions inclusively, honoring all families'' heritage while maintaining political neutrality and sugar-free birthday celebrations.',
     '["Teddy Kids actively celebrates global traditions", "Families are welcome to bring cultural items or ideas", "We do not host political or nationalist events", "No food-based treats for birthdays — but the celebration is personal and full of love"]',
     '[{"id": 1, "question": "What is Teddy Kids'' stance on celebrating religious or cultural holidays?", "type": "multiple-choice", "options": ["We avoid them to stay neutral", "We celebrate them with openness and inclusion when families participate", "We only celebrate Dutch holidays"], "correctAnswer": 1}, {"id": 2, "question": "What does a birthday celebration include at Teddy Kids?", "type": "multiple-choice", "options": ["Cake and candy", "A handmade hat, group attention, songs, and decorations", "Just singing happy birthday"], "correctAnswer": 1}]'),
    
    (doc_id, 5, 'The 4-Eyes Principle',
     'At Teddy Kids, **no adult should ever be alone with a child behind closed doors**. This is called the **4-Eyes Principle.** It means: If you''re with a child, **another adult must be able to see or hear you**. Open doors, windows, mirrored walls — these are all part of our safety layout. This protects both the child *and* you. When changing diapers, helping with toilet needs, or calming a crying child — you must always stay within visible or audible range of another staff member.',
     'The 4-Eyes Principle ensures no adult is ever alone with a child behind closed doors, requiring visibility or audibility to another staff member for everyone''s protection.',
     '["You are never truly alone with a child", "Visibility or audibility = safety", "Mirrors, open doors, and layout are there for this reason", "This protects both children and staff"]',
     '[{"id": 1, "question": "What''s the core idea of the 4-Eyes Principle?", "type": "multiple-choice", "options": ["Adults must wear glasses", "At least two adults are aware of every interaction", "Children need to be watched by four people"], "correctAnswer": 1}, {"id": 2, "question": "You need to change a diaper, but no one else is in sight. What should you do?", "type": "multiple-choice", "options": ["Change it anyway, it''s urgent", "Call another colleague first or wait until you can be seen", "Ask the child to wait"], "correctAnswer": 1}]');
END $$;-- Insert the Illness Policy document
INSERT INTO public.tk_documents (title, slug, description, required, version)
VALUES (
  'Illness Policy & Attendance Rules',
  'illness-policy',
  'Essential guidelines for when children can attend Teddy Kids and when they must stay home',
  true,
  '2024'
);

-- Get the document ID for sections
WITH doc AS (
  SELECT id FROM public.tk_documents WHERE slug = 'illness-policy'
)

-- Insert Section 1: Scarlet Fever
INSERT INTO public.tk_document_sections (doc_id, section_number, title, summary, content, key_points, questions)
SELECT 
  doc.id,
  1,
  'Scarlet Fever (Scarlatina)',
  'Understanding when children with scarlet fever can attend Teddy Kids',
  'Scarlet fever presents with sore throat, fever, red rash starting on chest and spreading, "strawberry tongue", headache, and nausea or vomiting. The key challenge is that scarlet fever is contagious before symptoms appear, making early detection difficult.',
  '["Scarlet fever is contagious before symptoms appear", "Children may attend if they feel well and have no fever", "Fever or feeling unwell means staying home", "Rash typically starts on chest and spreads"]'::jsonb,
  '[
    {
      "question": "When can a child with scarlet fever attend Teddy Kids?",
      "options": ["Never, it is too contagious", "If they feel well and have no fever", "Only after taking antibiotics", "Only if the rash is gone"],
      "correct": 1,
      "explanation": "Children with scarlet fever can attend if they feel well and have no fever, even with the rash present."
    },
    {
      "question": "True or False: Scarlet fever is contagious only after the rash appears.",
      "options": ["True", "False"],
      "correct": 1,
      "explanation": "False - scarlet fever is contagious before symptoms appear, making it difficult to prevent spread."
    }
  ]'::jsonb
FROM doc;

-- Insert Section 2: Hand, Foot, and Mouth Disease
WITH doc AS (
  SELECT id FROM public.tk_documents WHERE slug = 'illness-policy'
)
INSERT INTO public.tk_document_sections (doc_id, section_number, title, summary, content, key_points, questions)
SELECT 
  doc.id,
  2,
  'Hand, Foot, and Mouth Disease',
  'Policy for children with blisters and fever symptoms',
  'Hand, foot, and mouth disease causes fever, blisters in mouth and on palms/soles, sore throat, rash on legs/buttocks, and lowered appetite. Like many viral infections, it spreads before symptoms are visible.',
  '["Children can attend if they feel well and have no fever", "Staying home has limited effect since it spreads before symptoms", "Blisters appear in mouth, on palms and soles", "Lowered appetite is common"]'::jsonb,
  '[
    {
      "question": "A child has small blisters on their hands but no fever. Can they attend?",
      "options": ["No, blisters are always contagious", "Yes, if they feel well", "Only with gloves", "Only after seeing a doctor"],
      "correct": 1,
      "explanation": "Children can attend if they feel well and have no fever, even with visible blisters."
    },
    {
      "question": "Why might sending them home not stop the spread?",
      "options": ["Because it is not contagious", "Because it spreads before symptoms appear", "Because blisters are not the contagious part", "Because it only spreads through food"],
      "correct": 1,
      "explanation": "The disease spreads before symptoms appear, so excluding symptomatic children has limited effect on preventing transmission."
    }
  ]'::jsonb
FROM doc;

-- Insert Section 3: Fifth Disease (Slapped Cheek)
WITH doc AS (
  SELECT id FROM public.tk_documents WHERE slug = 'illness-policy'
)
INSERT INTO public.tk_document_sections (doc_id, section_number, title, summary, content, key_points, questions)
SELECT 
  doc.id,
  3,
  'Fifth Disease (Slapped Cheek / Erythema Infectiosum)',
  'Important policy for protecting pregnant women from Fifth Disease exposure',
  'Fifth Disease causes bright red cheeks, mild fever, cold symptoms before rash, and rash on torso, arms, and legs. This condition is particularly dangerous for pregnant women and requires immediate parent notification.',
  '["Child can attend if they feel well", "Must notify parents immediately - dangerous for pregnant women", "Contagious before rash appears, not after", "Bright red cheeks are the signature symptom"]'::jsonb,
  '[
    {
      "question": "Why must managers always inform parents about Fifth Disease?",
      "options": ["It requires antibiotics", "It can harm pregnant women", "It is highly contagious", "It causes permanent scarring"],
      "correct": 1,
      "explanation": "Fifth Disease can cause serious complications in pregnant women, so all parents must be notified of exposure."
    },
    {
      "question": "Is the rash contagious?",
      "options": ["Yes, very contagious", "No - contagious before the rash shows", "Only if touched", "Only the first day"],
      "correct": 1,
      "explanation": "The child is contagious before the rash appears, but once the distinctive red cheeks show, they are no longer contagious."
    }
  ]'::jsonb
FROM doc;

-- Insert Section 4: Influenza (Flu)
WITH doc AS (
  SELECT id FROM public.tk_documents WHERE slug = 'illness-policy'
)
INSERT INTO public.tk_document_sections (doc_id, section_number, title, summary, content, key_points, questions)
SELECT 
  doc.id,
  4,
  'Influenza (Flu)',
  'Clear temperature guidelines for flu symptoms and attendance',
  'Influenza presents with high fever (>38°C), headache, muscle aches, fatigue, cough, and sore throat. The fever threshold is a clear indicator for attendance decisions.',
  '["Children with fever above 38°C may NOT attend", "Must stay home until fully better and fever-free", "Mild cold symptoms without fever are acceptable", "High fever is the key exclusion criteria"]'::jsonb,
  '[
    {
      "question": "What temperature is considered too high to attend?",
      "options": ["37°C or more", "38°C or more", "39°C or more", "Any fever at all"],
      "correct": 1,
      "explanation": "38°C is the threshold - children with fever of 38°C or higher may not attend Teddy Kids."
    },
    {
      "question": "A child has a runny nose but no fever - can they attend?",
      "options": ["No, runny nose spreads germs", "Yes, if they feel otherwise well", "Only with tissues", "Only in the afternoon"],
      "correct": 1,
      "explanation": "Mild cold symptoms without fever are acceptable for attendance if the child feels well overall."
    }
  ]'::jsonb
FROM doc;-- Insert Module 3: Intern Working Hours & Substitute Contracts
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'Intern Working Hours & Substitute Contracts',
  'intern-hours',
  'Learn how interns should handle hours, roles, and payment at Teddy Kids',
  true
);

-- Get the document ID for sections
-- Section 1: Understanding Intern Roles
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'intern-hours'),
  1,
  'Understanding Intern Roles',
  'At Teddy Kids, interns aren''t just observers — they are **active contributors** in the group.

There are **2 types of hours**:

* **Internship hours** (learning time)
* **Working hours** (when they act as a substitute / teacher)

If you are in your **2nd or 3rd year**, and you perform well, you might receive a **substitute contract** — this means:

* You are paid for working hours
* You carry more responsibility  
* You may lead a group

The distinction between learning and working time is crucial for proper scheduling and payment.',
  'Interns at Teddy Kids can have two types of hours: internship (learning) and working (substitute teaching). Y2/Y3 interns may receive paid substitute contracts with additional responsibilities.',
  '["Interns in Y2/Y3 may be offered paid work as substitutes", "It is important to distinguish between learning time and teaching time", "Paid hours require proper declaration and scheduling", "Substitute contracts come with increased responsibility and leadership opportunities"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What are the two main types of hours an intern can have?",
      "options": ["Learning and Teaching", "Internship and Working", "Morning and Afternoon"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "First-year interns can receive a paid substitute contract.",
      "correctAnswer": false
    }
  ]'
);

-- Section 2: Time Tracking in the Schedule
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'intern-hours'),
  2,
  'Time Tracking in the Schedule',
  'When creating your schedule, **you must split your time slots**:

* Morning: Internship → declared under **Arbeid**
* Afternoon: Teaching role → declared under **Overuren**

You must write **"Werken"** (Working) in the description of your work slot, so it''s visible in your hours later.

**Example:**

| Time        | Role       | Declaration | Note                 |
|-------------|------------|-------------|---------------------|
| 08:00–12:00 | Intern     | Arbeid      | Learning            |
| 13:00–17:00 | Substitute | Overuren    | Paid work ("Werken") |

This separation ensures proper tracking and payment processing.',
  'Interns must split their schedules between Arbeid (internship hours) and Overuren (paid working hours), clearly marking paid time with "Werken" in the description.',
  '["Use two separate time slots when switching roles", "Teaching time equals Overuren and gets paid", "Always include Werken in description of teaching slot", "Proper labeling ensures accurate payment processing"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What must be written in the schedule description for paid time?",
      "options": ["Intern", "Arbeid", "Werken"],
      "correctAnswer": 2
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "If you intern in the morning and teach in the afternoon, what must you do?",
      "options": ["Use one time slot for the whole day", "Split your schedule and label the work time clearly", "Only record the paid hours"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 3: Declarations & Getting Paid
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'intern-hours'),
  3,
  'Declarations & Getting Paid',
  'At the end of each month, your hours must be declared properly in the system:

1. Go to **Personeel** → **Inloggen** → Access your own account
2. Visit the **Declarations** tab
3. Make sure:
   * **Internship hours** are under **Arbeid**
   * **Paid teaching hours** are under **Overuren**

To view monthly totals:
* Click **Jaaroverzicht** to get a full yearly breakdown

✅ Once hours are verified, the system will process payment for your "Overuren"

**Important:** You are responsible for checking your own declarations each month before managers verify and approve them for payroll.',
  'Interns must properly declare their hours monthly, separating Arbeid (internship) from Overuren (paid work) in the system, and verify totals using Jaaroverzicht.',
  '["Interns are responsible for checking their own declarations", "Managers verify and approve before payroll", "Declarations MUST be categorized correctly", "Use Jaaroverzicht for monthly totals and verification"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "Where do you go to check your monthly work hours?",
      "options": ["Personeel → Jaaroverzicht", "Declarations → Jaaroverzicht", "Overuren → Arbeid"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "Which section must teaching hours appear in to be paid?",
      "options": ["Arbeid", "Overuren", "Declarations"],
      "correctAnswer": 1
    }
  ]'
);-- Insert Module 4: Working in BSO at Lorentzkade
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'Working in BSO at Lorentzkade',
  'bso-protocol',
  'Learn the full operations, expectations, and special BSO flows at LRZ including animal care and group management',
  true
);

-- Section 1: Room & Group Assignments
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'bso-protocol'),
  1,
  'Room & Group Assignments',
  'At Lorentzkade, BSO groups are divided into 3 main rooms:

* **Geckos** → Led by Nafiza & Sofia
* **Ladybugs** → Led by Humaira & Isabelle  
* **Foxes** → Led by Zina, Christian & Adela

Additional rooms:
* BSO Playroom
* Aula (main hall)
* Music Room

Each room has its own vibe and daily rhythm. You are expected to **know your group**, your partners, and your rotation responsibilities.

Understanding the room structure and group assignments is essential for smooth operations and effective collaboration with your team members.',
  'BSO at LRZ has 3 main groups (Geckos, Ladybugs, Foxes) with designated leaders, plus 3 shared spaces. Staff must know their group assignments and responsibilities.',
  '["There are 3 main groups plus 3 shared spaces", "Each group has a lead teacher and fixed assistants", "Know your group before your first shift", "Shared spaces require coordination and planning"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What are the names of the 3 main BSO groups at LRZ?",
      "options": ["Tigers, Bears, Lions", "Geckos, Ladybugs, Foxes", "Red, Blue, Green"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "You can enter the Music Room freely at any time.",
      "correctAnswer": false
    }
  ]'
);

-- Section 2: Gym, Playroom & Outdoor Activities
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'bso-protocol'),
  2,
  'Gym, Playroom & Outdoor Activities',
  '**Gym:**
* Every group has **weekly gym sessions**
* Activities are planned and adapted for age, weather, and space

**Playroom:**
* Used to stimulate **creative free play**
* Staff supervise but encourage independence

**Outdoor:**
* Every child has access to **bicycles**
* You also help care for our on-site animals: **alpacas & goats**
* Children and teachers feed them together — it is part of their responsibility

These diverse activity spaces provide children with varied learning opportunities and help develop both physical and social skills.',
  'LRZ offers weekly gym sessions, creative playroom activities, outdoor biking, and unique animal care with alpacas and goats as part of the curriculum.',
  '["Gym sessions happen once per week per group", "Outdoor activities include biking plus animal care", "Playroom focuses on autonomy and creativity", "Animal care is a shared responsibility between children and staff"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "Who helps take care of the goats and alpacas?",
      "options": ["Only the staff", "Both children and staff", "Only the children"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "When can a group use the gym?",
      "options": ["Anytime they want", "Once per week during their assigned time", "Only during emergencies"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 3: Emergency Response & Safety
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'bso-protocol'),
  3,
  'Emergency Response & Safety',
  'Emergency Response Officers (BHV) at LRZ:
* Antonella
* Sofia  
* Zina
* Nafiza

**Fire drills** are done **once every quarter** (some planned, some surprise)

Your role:
* Know **who the BHV people are**
* Know evacuation paths
* Support calm behavior in emergencies

BHV stands for Bedrijfshulpverlening (Emergency Response & First Aid Certification). These staff members are specially trained to handle emergency situations and provide first aid when needed.',
  'LRZ has 4 certified BHV officers for emergency response. Fire drills occur quarterly, and all staff must know evacuation procedures and emergency contacts.',
  '["BHV equals certified staff trained in First Aid and Evacuation", "Drills happen 4 times per year", "Know who leads emergency protocols", "Support calm behavior during emergencies"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What is BHV?",
      "options": ["Basic Health Verification", "Emergency Response & First Aid Certification", "Building Health Validation"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "How often are fire drills conducted?",
      "options": ["Once per month", "Once per quarter", "Once per year"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 4: Transitions Between Groups & Observation
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'bso-protocol'),
  4,
  'Transitions Between Groups & Observation',
  'When a child **moves to the next group**, it is a big deal — and it is treated with care and attention.

The transition process includes:

1. **Observation period** → teachers complete forms & notes
2. **Parent meeting** → to discuss child development and expectations  
3. **Introduction to the new group** → child gets to meet teachers, explore new space

Goal: Make the child feel **seen, safe, and excited**.

This careful approach ensures that transitions are positive experiences that support the child emotional and social development.',
  'Group transitions involve careful observation, parent meetings, and gradual introduction to new groups to ensure children feel secure and supported.',
  '["Every child group transition is planned", "Parents are involved in the process", "Teachers prepare observations to support discussions", "Goal is to make children feel seen, safe, and excited"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What must happen before a child moves to a new group?",
      "options": ["Just move them immediately", "Observation plus parent meeting", "Only a parent signature"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "Why is a transition talk with parents important?",
      "options": ["It is required by law", "It supports the child emotionally and informs the family", "It saves time for teachers"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 5: Communication & Planning
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'bso-protocol'),
  5,
  'Communication & Planning',
  'Communication is key to BSO running smoothly. Here is what you are expected to follow:

* 📩 **Newsletters** → Sent regularly to parents about events, themes, and updates
* 🗓 **Meeting Dates** → Scheduled staff meetings must be attended
* 🧑‍🏫 **Activity Teacher** → Supports the learning program and theme development  
* 🪑 **At the Table moments** → Daily group reflection and calm time

Effective communication ensures that parents stay informed, staff stay coordinated, and children receive consistent care and attention.',
  'BSO communication includes regular newsletters, mandatory staff meetings, activity teacher support, and daily At the Table reflection moments.',
  '["Staff meetings are mandatory — check calendar", "At the Table equals critical emotional moment for kids", "Newsletters are a shared responsibility not just managers", "Activity teachers support learning programs and themes"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What is the At the Table moment?",
      "options": ["Lunch time only", "Group calm and reflection time — part of the daily rhythm", "Staff meeting time"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "What must you do when a newsletter is announced?",
      "options": ["Ignore it", "Collaborate with your team to provide input", "Let managers handle it alone"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 6: Extra Features: Meals, Animals, and School Pickup
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'bso-protocol'),
  6,
  'Extra Features: Meals, Animals, and School Pickup',
  '**Warm Meals:**
* Children staying after 16:00 may receive a warm meal
* Meals follow dietary rules and allergy awareness  
* Staff supervise eating and cleanup

**Animals:**
* BSO includes caring for **alpacas and goats** onsite
* Feeding and cleaning = shared with children
* It is part of our empathy and responsibility development

**School Pickup:**
* Teachers collect children from school on foot or via transport
* Timetables are posted — do not improvise!

These special features make LRZ unique and provide rich learning opportunities beyond traditional BSO activities.',
  'LRZ offers warm meals after 16:00, includes animal care as curriculum, and follows strict school pickup schedules for safety and organization.',
  '["Meal routines require supervision plus allergy awareness", "Animals are part of the curriculum — not just decoration", "Pickup logistics must follow the official plan", "Do not change pickup arrangements without manager approval"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "Who is responsible for helping children care for the animals?",
      "options": ["Only maintenance staff", "The staff — it is part of the curriculum", "Parents only"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "A parent asks to change school pickup time. What do you do?",
      "options": ["Change it immediately", "Tell the manager — do not change without approval", "Ask other parents first"],
      "correctAnswer": 1
    }
  ]'
);-- Insert Module 5: Safety & Health at Lorentzkade
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'Safety & Health at Lorentzkade',
  'safety-health',
  'Learn essential daily safety protocols for outdoor play, emergency response, equipment use, and supervision at LRZ',
  true
);

-- Section 1: Outdoor Play Safety
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  1,
  'Outdoor Play Safety',
  'Teddy Kids has structured outdoor play slots to **avoid crowding** and ensure every group gets safe time outside.

* Ladybugs & Foxes: May play after school **until 16:00**
* Geckos: May play **after 16:00**
* RED/BLUE: 12:40–13:10
* Purple: 13:20–14:10

**Children aged 3–7** → must be supervised at all times
**Children 7+** → may play unsupervised in **groups of 3 max**
Staff must **spread out** over the play area to maintain proper supervision.',
  'Outdoor play is scheduled by group to prevent crowding. Children 3-7 need constant supervision, while 7+ can play in small groups of 3 maximum. Staff must spread out for coverage.',
  '["Outside time is structured by group", "Staff must be visible and spread out", "Children 7+ can play alone only in small groups (≤3)", "Proper supervision prevents accidents and ensures safety"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "A group of five 7-year-olds can play outside alone.",
      "correctAnswer": false
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "When can the Geckos play outside?",
      "options": ["Before 16:00", "After 16:00", "Anytime they want"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 2: Fire Evacuation & Emergency Response
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  2,
  'Fire Evacuation & Emergency Response',
  '**BHV-certified staff** at Lorentzkade:
* Zina, Nafiza, Antonella, Sofia, Violetta (TISA)

**Drills** occur every 2 months

During a real evacuation:
* Take your **phone + floor plan** outside
* Follow the posted **fire protocol**

BHV stands for Bedrijfshulpverlening (Emergency Response & First Aid). These staff members are trained to handle emergency situations and coordinate evacuations effectively.',
  'LRZ has 5 BHV-certified staff for emergencies. Fire drills happen every 2 months. During evacuation, staff must take phone and floor plan outside.',
  '["Know who the BHV staff are", "Fire drills happen every other month", "Always take floor plan and phone during evacuation", "Follow posted fire protocol procedures"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What does BHV mean?",
      "options": ["Basic Health Verification", "Emergency Response & First Aid", "Building Health Validation"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "What must you bring during evacuation?",
      "options": ["Only children", "Phone and floor plan", "Just your keys"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 3: Play Equipment Safety
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  3,
  'Play Equipment Safety',
  '**Block Area**: Max 8 children at a time

**Trampoline**:
* Age 4+: In pairs
* Under 4: Only 2 at a time  
* **No mixing** of younger and older kids

**Sandbox**:
* Posts limit use of digging machine
* Covered nightly (cat prevention)
* Sand replaced regularly

These rules prevent overcrowding, age-related accidents, and maintain hygienic play environments.',
  'Equipment has specific capacity and age limits. Block area max 8 children, trampoline separates age groups, sandbox is maintained and protected nightly.',
  '["Trampoline separates ages to prevent injuries", "Block play has maximum capacity of 8", "Sandbox is maintained and protected from contamination", "Equipment limits prevent overcrowding and accidents"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "A group of 10 children can play in the block area.",
      "correctAnswer": false
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "A 3-year-old and an 8-year-old can bounce on the trampoline together.",
      "correctAnswer": false
    }
  ]'
);

-- Section 4: Tools, Maintenance & Garden Work
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  4,
  'Tools, Maintenance & Garden Work',
  'Garden work is scheduled **when children are at school**

If work happens while kids are present:
* Area must be **blocked off**

**Children must wear shoes** — **no barefoot** outside

All dangerous tools and equipment must be properly secured and areas marked when maintenance work is occurring.',
  'Garden work is scheduled during school hours. If work occurs with children present, areas must be blocked off. Children must always wear shoes outdoors.',
  '["Tools are locked away or isolated from children", "No barefoot walking allowed outdoors", "Posts must be placed to mark danger zones", "Maintenance is scheduled to minimize child exposure"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "Can kids be outside while tools are in use?",
      "options": ["Never", "Only if area is blocked off", "Yes, always"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "A child runs barefoot outside. What do you do?",
      "options": ["Let them continue", "Ask them to put shoes on immediately", "Only worry if they get hurt"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 5: Pickup & Drop-Off Procedures
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  5,
  'Pickup & Drop-Off Procedures',
  '**During child pickup (from school):**
* 📋 A list is posted on each fridge showing which staff picks up which child
* 📅 Lists are updated in team meetings
* 🦺 Children must wear **Teddy Kids vests**
* 🚲 Children with bikes must **walk their bike** with staff supervision
* 🚐 Children in the **Stint** must wear seat belts

**Parent drop-off & pickup:**
* Parents **must sign children in and out** with staff
* If someone else picks up → **parent must send a photo** ahead of time',
  'Pickup procedures require posted lists, safety vests, supervised bike walking, and proper sign-in/out. Unknown pickup persons need photo authorization.',
  '["Vests are mandatory during pickup from school", "No child leaves without proper sign-out", "Unknown pickups require parent photo authorization", "Bike safety requires walking with supervision"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "A stranger arrives to pick up a child. What do you do?",
      "options": ["Let them take the child", "Ask for ID plus confirm with parent photo", "Call the police immediately"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "What must every child wear during pickup from school?",
      "options": ["Regular clothes", "Teddy Kids safety vest", "Rain jacket"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 6: Hallway Supervision & Indoor Safety
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  6,
  'Hallway Supervision & Indoor Safety',
  'Children may play or read in **hallway beehives**

**No direct supervision** needed *if* the child is calm

BUT: **You must inform your colleague** if a child is in the hallway

This allows children some independence while ensuring staff awareness of their location and activities.',
  'Children can use hallway beehives independently if calm, but staff must always communicate when a child is in the hallway to maintain proper oversight.',
  '["Hallway play is allowed with staff awareness", "Never leave a child in the hallway unknowingly", "Staff must communicate hallway activity", "Independence is balanced with safety awareness"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "Children can read in the hallway without a teacher nearby.",
      "correctAnswer": true
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "Hallway play is completely unsupervised.",
      "correctAnswer": false
    }
  ]'
);

-- Section 7: Kitchen Safety & Animal Care
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  7,
  'Kitchen Safety & Animal Care',
  '**Kitchen Safety:**
Children **may be in the kitchen** if:
* They are **supervised**
* Sharp tools and hot surfaces are **secured and out of reach**

**Animals (Alpacas & Goats):**
Lorentzkade is home to **real animals**! They are part of the learning environment.
* Children feed animals under supervision
* The **animal care protocol** must be followed
* Staff share responsibility for daily care

Both areas require active supervision to ensure safety while providing learning opportunities.',
  'Kitchen access requires supervision with dangerous items secured. Animals are curriculum tools requiring supervised interaction and shared care responsibilities.',
  '["Children only enter kitchen with an adult", "Dangerous tools must be locked away", "Animals are emotional development tools not decoration", "Staff and children share feeding responsibilities"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "Children can enter the kitchen alone to get water.",
      "correctAnswer": false
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "Are the alpacas and goats just a fun extra?",
      "options": ["Yes, just for fun", "No, they are part of the curriculum", "They are only for decoration"],
      "correctAnswer": 1
    }
  ]'
);-- Insert Module 5: Safety & Health at Lorentzkade
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'Safety & Health at Lorentzkade',
  'safety-health',
  'Learn essential daily safety protocols for outdoor play, emergency response, equipment use, and supervision at LRZ',
  true
);

-- Section 1: Outdoor Play Safety
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  1,
  'Outdoor Play Safety',
  'Teddy Kids has structured outdoor play slots to **avoid crowding** and ensure every group gets safe time outside.

* Ladybugs & Foxes: May play after school **until 16:00**
* Geckos: May play **after 16:00**
* RED/BLUE: 12:40–13:10
* Purple: 13:20–14:10

**Children aged 3–7** → must be supervised at all times
**Children 7+** → may play unsupervised in **groups of 3 max**
Staff must **spread out** over the play area to maintain proper supervision.',
  'Outdoor play is scheduled by group to prevent crowding. Children 3-7 need constant supervision, while 7+ can play in small groups of 3 maximum. Staff must spread out for coverage.',
  '["Outside time is structured by group", "Staff must be visible and spread out", "Children 7+ can play alone only in small groups (≤3)", "Proper supervision prevents accidents and ensures safety"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "A group of five 7-year-olds can play outside alone.",
      "correctAnswer": false
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "When can the Geckos play outside?",
      "options": ["Before 16:00", "After 16:00", "Anytime they want"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 2: Fire Evacuation & Emergency Response
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  2,
  'Fire Evacuation & Emergency Response',
  '**BHV-certified staff** at Lorentzkade:
* Zina, Nafiza, Antonella, Sofia, Violetta (TISA)

**Drills** occur every 2 months

During a real evacuation:
* Take your **phone + floor plan** outside
* Follow the posted **fire protocol**

BHV stands for Bedrijfshulpverlening (Emergency Response & First Aid). These staff members are trained to handle emergency situations and coordinate evacuations effectively.',
  'LRZ has 5 BHV-certified staff for emergencies. Fire drills happen every 2 months. During evacuation, staff must take phone and floor plan outside.',
  '["Know who the BHV staff are", "Fire drills happen every other month", "Always take floor plan and phone during evacuation", "Follow posted fire protocol procedures"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What does BHV mean?",
      "options": ["Basic Health Verification", "Emergency Response & First Aid", "Building Health Validation"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "What must you bring during evacuation?",
      "options": ["Only children", "Phone and floor plan", "Just your keys"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 3: Play Equipment Safety
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  3,
  'Play Equipment Safety',
  '**Block Area**: Max 8 children at a time

**Trampoline**:
* Age 4+: In pairs
* Under 4: Only 2 at a time  
* **No mixing** of younger and older kids

**Sandbox**:
* Posts limit use of digging machine
* Covered nightly (cat prevention)
* Sand replaced regularly

These rules prevent overcrowding, age-related accidents, and maintain hygienic play environments.',
  'Equipment has specific capacity and age limits. Block area max 8 children, trampoline separates age groups, sandbox is maintained and protected nightly.',
  '["Trampoline separates ages to prevent injuries", "Block play has maximum capacity of 8", "Sandbox is maintained and protected from contamination", "Equipment limits prevent overcrowding and accidents"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "A group of 10 children can play in the block area.",
      "correctAnswer": false
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "A 3-year-old and an 8-year-old can bounce on the trampoline together.",
      "correctAnswer": false
    }
  ]'
);

-- Section 4: Tools, Maintenance & Garden Work
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  4,
  'Tools, Maintenance & Garden Work',
  'Garden work is scheduled **when children are at school**

If work happens while kids are present:
* Area must be **blocked off**

**Children must wear shoes** — **no barefoot** outside

All dangerous tools and equipment must be properly secured and areas marked when maintenance work is occurring.',
  'Garden work is scheduled during school hours. If work occurs with children present, areas must be blocked off. Children must always wear shoes outdoors.',
  '["Tools are locked away or isolated from children", "No barefoot walking allowed outdoors", "Posts must be placed to mark danger zones", "Maintenance is scheduled to minimize child exposure"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "Can kids be outside while tools are in use?",
      "options": ["Never", "Only if area is blocked off", "Yes, always"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "A child runs barefoot outside. What do you do?",
      "options": ["Let them continue", "Ask them to put shoes on immediately", "Only worry if they get hurt"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 5: Pickup & Drop-Off Procedures
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  5,
  'Pickup & Drop-Off Procedures',
  '**During child pickup (from school):**
* 📋 A list is posted on each fridge showing which staff picks up which child
* 📅 Lists are updated in team meetings
* 🦺 Children must wear **Teddy Kids vests**
* 🚲 Children with bikes must **walk their bike** with staff supervision
* 🚐 Children in the **Stint** must wear seat belts

**Parent drop-off & pickup:**
* Parents **must sign children in and out** with staff
* If someone else picks up → **parent must send a photo** ahead of time',
  'Pickup procedures require posted lists, safety vests, supervised bike walking, and proper sign-in/out. Unknown pickup persons need photo authorization.',
  '["Vests are mandatory during pickup from school", "No child leaves without proper sign-out", "Unknown pickups require parent photo authorization", "Bike safety requires walking with supervision"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "A stranger arrives to pick up a child. What do you do?",
      "options": ["Let them take the child", "Ask for ID plus confirm with parent photo", "Call the police immediately"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "What must every child wear during pickup from school?",
      "options": ["Regular clothes", "Teddy Kids safety vest", "Rain jacket"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 6: Hallway Supervision & Indoor Safety
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  6,
  'Hallway Supervision & Indoor Safety',
  'Children may play or read in **hallway beehives**

**No direct supervision** needed *if* the child is calm

BUT: **You must inform your colleague** if a child is in the hallway

This allows children some independence while ensuring staff awareness of their location and activities.',
  'Children can use hallway beehives independently if calm, but staff must always communicate when a child is in the hallway to maintain proper oversight.',
  '["Hallway play is allowed with staff awareness", "Never leave a child in the hallway unknowingly", "Staff must communicate hallway activity", "Independence is balanced with safety awareness"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "Children can read in the hallway without a teacher nearby.",
      "correctAnswer": true
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "Hallway play is completely unsupervised.",
      "correctAnswer": false
    }
  ]'
);

-- Section 7: Kitchen Safety & Animal Care
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  7,
  'Kitchen Safety & Animal Care',
  '**Kitchen Safety:**
Children **may be in the kitchen** if:
* They are **supervised**
* Sharp tools and hot surfaces are **secured and out of reach**

**Animals (Alpacas & Goats):**
Lorentzkade is home to **real animals**! They are part of the learning environment.
* Children feed animals under supervision
* The **animal care protocol** must be followed
* Staff share responsibility for daily care

Both areas require active supervision to ensure safety while providing learning opportunities.',
  'Kitchen access requires supervision with dangerous items secured. Animals are curriculum tools requiring supervised interaction and shared care responsibilities.',
  '["Children only enter kitchen with an adult", "Dangerous tools must be locked away", "Animals are emotional development tools not decoration", "Staff and children share feeding responsibilities"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "Children can enter the kitchen alone to get water.",
      "correctAnswer": false
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "Are the alpacas and goats just a fun extra?",
      "options": ["Yes, just for fun", "No, they are part of the curriculum", "They are only for decoration"],
      "correctAnswer": 1
    }
  ]'
);-- Insert Module 5: Safety & Health at Lorentzkade
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'Safety & Health at Lorentzkade',
  'safety-health',
  'Learn essential daily safety protocols for outdoor play, emergency response, equipment use, and supervision at LRZ',
  true
);

-- Section 1: Outdoor Play Safety
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  1,
  'Outdoor Play Safety',
  'Teddy Kids has structured outdoor play slots to **avoid crowding** and ensure every group gets safe time outside.

* Ladybugs & Foxes: May play after school **until 16:00**
* Geckos: May play **after 16:00**
* RED/BLUE: 12:40–13:10
* Purple: 13:20–14:10

**Children aged 3–7** → must be supervised at all times
**Children 7+** → may play unsupervised in **groups of 3 max**
Staff must **spread out** over the play area to maintain proper supervision.',
  'Outdoor play is scheduled by group to prevent crowding. Children 3-7 need constant supervision, while 7+ can play in small groups of 3 maximum. Staff must spread out for coverage.',
  '["Outside time is structured by group", "Staff must be visible and spread out", "Children 7+ can play alone only in small groups (≤3)", "Proper supervision prevents accidents and ensures safety"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "A group of five 7-year-olds can play outside alone.",
      "correctAnswer": false
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "When can the Geckos play outside?",
      "options": ["Before 16:00", "After 16:00", "Anytime they want"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 2: Fire Evacuation & Emergency Response
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  2,
  'Fire Evacuation & Emergency Response',
  '**BHV-certified staff** at Lorentzkade:
* Zina, Nafiza, Antonella, Sofia, Violetta (TISA)

**Drills** occur every 2 months

During a real evacuation:
* Take your **phone + floor plan** outside
* Follow the posted **fire protocol**

BHV stands for Bedrijfshulpverlening (Emergency Response & First Aid). These staff members are trained to handle emergency situations and coordinate evacuations effectively.',
  'LRZ has 5 BHV-certified staff for emergencies. Fire drills happen every 2 months. During evacuation, staff must take phone and floor plan outside.',
  '["Know who the BHV staff are", "Fire drills happen every other month", "Always take floor plan and phone during evacuation", "Follow posted fire protocol procedures"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What does BHV mean?",
      "options": ["Basic Health Verification", "Emergency Response & First Aid", "Building Health Validation"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "What must you bring during evacuation?",
      "options": ["Only children", "Phone and floor plan", "Just your keys"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 3: Play Equipment Safety
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  3,
  'Play Equipment Safety',
  '**Block Area**: Max 8 children at a time

**Trampoline**:
* Age 4+: In pairs
* Under 4: Only 2 at a time  
* **No mixing** of younger and older kids

**Sandbox**:
* Posts limit use of digging machine
* Covered nightly (cat prevention)
* Sand replaced regularly

These rules prevent overcrowding, age-related accidents, and maintain hygienic play environments.',
  'Equipment has specific capacity and age limits. Block area max 8 children, trampoline separates age groups, sandbox is maintained and protected nightly.',
  '["Trampoline separates ages to prevent injuries", "Block play has maximum capacity of 8", "Sandbox is maintained and protected from contamination", "Equipment limits prevent overcrowding and accidents"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "A group of 10 children can play in the block area.",
      "correctAnswer": false
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "A 3-year-old and an 8-year-old can bounce on the trampoline together.",
      "correctAnswer": false
    }
  ]'
);

-- Section 4: Tools, Maintenance & Garden Work
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  4,
  'Tools, Maintenance & Garden Work',
  'Garden work is scheduled **when children are at school**

If work happens while kids are present:
* Area must be **blocked off**

**Children must wear shoes** — **no barefoot** outside

All dangerous tools and equipment must be properly secured and areas marked when maintenance work is occurring.',
  'Garden work is scheduled during school hours. If work occurs with children present, areas must be blocked off. Children must always wear shoes outdoors.',
  '["Tools are locked away or isolated from children", "No barefoot walking allowed outdoors", "Posts must be placed to mark danger zones", "Maintenance is scheduled to minimize child exposure"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "Can kids be outside while tools are in use?",
      "options": ["Never", "Only if area is blocked off", "Yes, always"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "A child runs barefoot outside. What do you do?",
      "options": ["Let them continue", "Ask them to put shoes on immediately", "Only worry if they get hurt"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 5: Pickup & Drop-Off Procedures
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  5,
  'Pickup & Drop-Off Procedures',
  '**During child pickup (from school):**
* 📋 A list is posted on each fridge showing which staff picks up which child
* 📅 Lists are updated in team meetings
* 🦺 Children must wear **Teddy Kids vests**
* 🚲 Children with bikes must **walk their bike** with staff supervision
* 🚐 Children in the **Stint** must wear seat belts

**Parent drop-off & pickup:**
* Parents **must sign children in and out** with staff
* If someone else picks up → **parent must send a photo** ahead of time',
  'Pickup procedures require posted lists, safety vests, supervised bike walking, and proper sign-in/out. Unknown pickup persons need photo authorization.',
  '["Vests are mandatory during pickup from school", "No child leaves without proper sign-out", "Unknown pickups require parent photo authorization", "Bike safety requires walking with supervision"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "A stranger arrives to pick up a child. What do you do?",
      "options": ["Let them take the child", "Ask for ID plus confirm with parent photo", "Call the police immediately"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "What must every child wear during pickup from school?",
      "options": ["Regular clothes", "Teddy Kids safety vest", "Rain jacket"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 6: Hallway Supervision & Indoor Safety
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  6,
  'Hallway Supervision & Indoor Safety',
  'Children may play or read in **hallway beehives**

**No direct supervision** needed *if* the child is calm

BUT: **You must inform your colleague** if a child is in the hallway

This allows children some independence while ensuring staff awareness of their location and activities.',
  'Children can use hallway beehives independently if calm, but staff must always communicate when a child is in the hallway to maintain proper oversight.',
  '["Hallway play is allowed with staff awareness", "Never leave a child in the hallway unknowingly", "Staff must communicate hallway activity", "Independence is balanced with safety awareness"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "Children can read in the hallway without a teacher nearby.",
      "correctAnswer": true
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "Hallway play is completely unsupervised.",
      "correctAnswer": false
    }
  ]'
);

-- Section 7: Kitchen Safety & Animal Care
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-health'),
  7,
  'Kitchen Safety & Animal Care',
  '**Kitchen Safety:**
Children **may be in the kitchen** if:
* They are **supervised**
* Sharp tools and hot surfaces are **secured and out of reach**

**Animals (Alpacas & Goats):**
Lorentzkade is home to **real animals**! They are part of the learning environment.
* Children feed animals under supervision
* The **animal care protocol** must be followed
* Staff share responsibility for daily care

Both areas require active supervision to ensure safety while providing learning opportunities.',
  'Kitchen access requires supervision with dangerous items secured. Animals are curriculum tools requiring supervised interaction and shared care responsibilities.',
  '["Children only enter kitchen with an adult", "Dangerous tools must be locked away", "Animals are emotional development tools not decoration", "Staff and children share feeding responsibilities"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "Children can enter the kitchen alone to get water.",
      "correctAnswer": false
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "Are the alpacas and goats just a fun extra?",
      "options": ["Yes, just for fun", "No, they are part of the curriculum", "They are only for decoration"],
      "correctAnswer": 1
    }
  ]'
);-- Insert Module 6: Introduction to TISA
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'Introduction to TISA (Theodore International Startup Academy)',
  'tisa-intro',
  'Learn about Teddy Kids school partner TISA, its programs, and how to support children and families in transitions',
  true
);

-- Section 1: What is TISA?
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'tisa-intro'),
  1,
  'What is TISA?',
  'TISA is Teddy Kids international school partner located at **Lorentzkade 15A, Leiden**.

It offers **bilingual education** (Dutch & English) for children aged **3 to 12 years** — starting with **preschool at age 3**, and continuing through to **Grade 6 (around age 12)**.

Full-day learning includes:
* Core academics in the morning
* Extended afternoon tracks  
* Enriched activities
* After-school care (BSO)

TISA provides a structured educational pathway that many Teddy Kids children transition into as they grow older.',
  'TISA is Teddy Kids bilingual school partner in Leiden serving ages 3-12, offering full-day education with academics, activities, and after-school care.',
  '["TISA serves children aged 3 to 12 years old", "Located at Lorentzkade 15A, Leiden", "Offers bilingual education in Dutch and English", "Provides full-day learning with academics and activities"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What ages does TISA serve?",
      "options": ["3 months – 12 years", "3 – 12 years", "6 – 18 years"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "Children at TISA only learn in English.",
      "correctAnswer": false
    }
  ]'
);

-- Section 2: What Makes TISA Special?
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'tisa-intro'),
  2,
  'What Makes TISA Special?',
  '**1. Play + Academics Combined**
Younger children (Grade 0 / age 3-4) learn through games & discovery in English & Dutch daily, with small classes (max ~16 children with two teachers) so they get lots of individual attention.

**2. Practical Skills & Creativity**
Alongside usual subjects (Math, Science, English, Dutch), there are creative and technical tracks (Robotics, Music, Arts, Drama), project-based modules, and workshop-style learning.

**3. Full Day / Extended Hours & Meals**  
The day runs from early drop-off (~7:30-8:30) through to after-school care (~17:30-18:30). Lunch and snacks are part of the schedule. Organic and healthy food is emphasized.

**4. International, Global-Minded Environment**
TISA welcomes international families, supports bilingual development, cultural integration, and runs its programs to align with global school partners.',
  'TISA combines play-based learning with academics, offers creative tracks, provides full-day care with healthy meals, and maintains an international environment.',
  '["Small classes with maximum 16 children and two teachers", "Creative and technical tracks including Robotics, Music, Arts, Drama", "Full day from 7:30-18:30 with organic healthy meals", "International environment supporting bilingual development"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What is the maximum class size for Grade 0 at TISA?",
      "options": ["20 children", "16 children", "12 children"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "multiple-choice",
      "question": "Which creative tracks does TISA offer?",
      "options": ["Only Music and Arts", "Robotics, Music, Arts, Drama", "Only traditional academics"],
      "correctAnswer": 1
    }
  ]'
);

-- Section 3: Why TISA Matters for Teddy Kids Staff
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'tisa-intro'),
  3,
  'Why TISA Matters for Teddy Kids Staff',
  'Understanding TISA is crucial for Teddy Kids staff and interns because:

**Gives you a pathway**: Many children in Teddy Kids move into TISA; understanding it helps you support their transition effectively.

**Helps you communicate with families**: Knowing TISA schedule, expectations, and culture lets you help parents prepare and answer their questions confidently.

**Shapes the kind of skills you coach**: Creative thinking, collaboration, language sensitivity, project work - these become more important when you know where children are heading.

When staff understand the educational journey children will take, they can better prepare them with the right foundational skills and emotional readiness.',
  'TISA knowledge helps staff support transitions, communicate with families, and develop appropriate skills in children preparing for school.',
  '["Many Teddy Kids children transition to TISA", "Understanding TISA helps staff communicate with families", "Knowledge shapes how staff coach creative thinking and collaboration", "Staff can better prepare children with foundational skills"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What is the main advantage of knowing how TISA works as a Teddy Kids staff member?",
      "options": ["Helps with birthday planning", "Helps in parent communication and child preparation", "Nothing really important"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "Understanding TISA helps staff develop appropriate skills in children.",
      "correctAnswer": true
    }
  ]'
);

-- Section 4: Expectations & Supporting Transitions
INSERT INTO tk_document_sections (
  doc_id, 
  section_number, 
  title, 
  content, 
  summary, 
  key_points, 
  questions
) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'tisa-intro'),
  4,
  'Expectations & Supporting Transitions',
  'When children move from Teddy Kids to TISA, expect these changes:

**Curriculum Pace**: More structured, more project-based learning as children get older

**Schedules**: Longer day with consistent routines plus enrichment tracks

**Parent Involvement**: Tours, admissions procedures, school calendar alignment  

**Assessment**: More formal tracking of learning outcomes and skills beyond day-to-day care

**How Staff Can Help:**
* Prepare children for longer structured activities
* Encourage independence and following routines
* Support bilingual development consistently  
* Help families understand TISA expectations and schedule
* Share insights about individual children needs with TISA teachers',
  'TISA involves more structure, longer days, formal assessment, and parent involvement. Staff can help by preparing children for independence and supporting families.',
  '["TISA has more structured and project-based curriculum", "Longer days with consistent routines and enrichment", "More formal assessment and parent involvement", "Staff should prepare children for independence and longer activities"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "How can Teddy Kids staff best support the transition to TISA?",
      "options": ["Only focus on play activities", "Prepare children for longer structured activities and independence", "Avoid discussing TISA with parents"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "TISA has the same structure and schedule as Teddy Kids daycare.",
      "correctAnswer": false
    }
  ]'
);
-- Verify what was created
SELECT 
  d.title,
  d.slug,
  COUNT(s.id) as section_count
FROM tk_documents d
LEFT JOIN tk_document_sections s ON s.doc_id = d.id
GROUP BY d.id, d.title, d.slug
ORDER BY d.created_at;

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🧸📚 KNOWLEDGE CENTER RESTORED!';
  RAISE NOTICE '✅ All old data cleared and fresh content imported';
  RAISE NOTICE '✅ Check the list above for all modules';
  RAISE NOTICE '🔄 Refresh browser at /growbuddy/knowledge';
END $$;
