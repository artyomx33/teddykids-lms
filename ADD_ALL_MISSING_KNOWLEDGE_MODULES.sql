-- ============================================
-- 🧸📚 ADD ALL MISSING KNOWLEDGE MODULES
-- ============================================
-- Includes: Illness Policy + Onboarding Content as Knowledge Modules
-- ============================================

-- Module 4: Illness Policy (from migrations)
-- Insert the Illness Policy document
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
FROM doc;
-- Module 5: The Teddy Code (Values & Philosophy)
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'The Teddy Code: Our Values & Philosophy',
  'teddy-values',
  'Deep dive into Teddy Kids core values, philosophy, and approach to childcare',
  true
);

INSERT INTO tk_document_sections (doc_id, section_number, title, content, summary, key_points, questions) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'teddy-values'),
  1,
  'Children Come First — Always',
  '🧒 Every decision we make puts the child at the center

At Teddy Kids, children are the heart of everything we do. Their safety, happiness, and development guide every choice we make. This means listening to them, respecting their needs, and creating environments where they can thrive.

**How to Apply This:**
- Always ask "What is best for the child?" in any situation
- Listen actively to children and validate their feelings
- Create physical and emotional environments where children feel safe
- Prioritize child needs over administrative convenience',
  'Children are at the center of every decision, requiring active listening and safe environments.',
  '["Put child safety and happiness first", "Listen actively to children", "Create safe physical and emotional environments", "Prioritize child needs over convenience"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice", 
      "question": "When making decisions at Teddy Kids, what should guide your choice?",
      "options": ["What is easiest", "What is best for the child", "What management prefers"],
      "correctAnswer": 1
    }
  ]'
);

INSERT INTO tk_document_sections (doc_id, section_number, title, content, summary, key_points, questions) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'teddy-values'),
  2,
  'Love Is Our Foundation',
  '💖 We approach every interaction with genuine care and warmth

Love creates the foundation for trust, learning, and growth. We show love through patience, understanding, kindness, and by celebrating each child's unique personality and achievements.

**Daily Expressions of Love:**
- Patience during difficult moments
- Celebrating small victories and milestones
- Showing genuine interest in each child as an individual
- Offering comfort during sad or challenging times
- Using encouraging and affirming language',
  'Love through patience, understanding, and celebrating each child individually.',
  '["Show patience during difficult moments", "Celebrate small victories", "Show genuine interest in each child", "Offer comfort when needed", "Use encouraging language"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "Love at Teddy Kids means being permissive and letting children do whatever they want.",
      "correctAnswer": false
    }
  ]'
);

-- Module 6: Daily Life at Teddy Kids  
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'Daily Life at Teddy Kids',
  'daily-life',
  'Understand the rhythms, routines, and special moments that make up a typical day',
  true
);

INSERT INTO tk_document_sections (doc_id, section_number, title, content, summary, key_points, questions) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'daily-life'),
  1,
  'Daily Rhythms & Routines',
  'Understanding how days flow at Teddy Kids helps you support children better.

**Morning Arrival (7:30-9:00):**
- Gentle transitions from home to daycare
- Welcome each child individually
- Help children settle into activities
- Connect with parents about important information

**Active Learning Time (9:00-12:00):**
- Structured activities and free play
- Outdoor time weather permitting
- Creative arts and exploration
- Individual attention and small group activities

**Lunch & Rest (12:00-14:00):**
- Family-style meals
- Quiet time or nap for younger children
- Calm activities for those who don''t nap

**Afternoon Activities (14:00-18:00):**
- More outdoor play
- Pickup preparations
- Individual projects and interests',
  'Daily routines from arrival through pickup with focus on transitions and individual needs.',
  '["Gentle morning transitions", "Active learning with outdoor time", "Family-style meals and rest", "Afternoon outdoor play and projects"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "What is most important during morning arrival?",
      "options": ["Starting activities immediately", "Welcoming each child individually", "Getting parents to leave quickly"],
      "correctAnswer": 1
    }
  ]'
);

-- Final verification
SELECT 
  '🎉 ALL KNOWLEDGE MODULES INSTALLED!' as status,
  COUNT(*) as total_modules
FROM tk_documents;

SELECT 
  d.title,
  d.slug,
  COUNT(s.id) as sections
FROM tk_documents d
LEFT JOIN tk_document_sections s ON s.doc_id = d.id  
GROUP BY d.id, d.title, d.slug
ORDER BY d.created_at;

