-- Insert Module 3: Intern Working Hours & Substitute Contracts
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
);