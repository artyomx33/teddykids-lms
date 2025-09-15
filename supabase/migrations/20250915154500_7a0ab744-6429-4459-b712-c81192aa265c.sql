-- Insert Module 6: Introduction to TISA
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