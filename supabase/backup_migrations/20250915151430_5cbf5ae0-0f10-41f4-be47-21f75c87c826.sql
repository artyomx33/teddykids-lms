-- Insert Module 4: Working in BSO at Lorentzkade
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
);