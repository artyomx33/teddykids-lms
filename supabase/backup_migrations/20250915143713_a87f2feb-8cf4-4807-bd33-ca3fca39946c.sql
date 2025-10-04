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