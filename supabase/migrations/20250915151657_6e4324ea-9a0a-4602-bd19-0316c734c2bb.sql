-- Insert Module 5: Safety & Health at Lorentzkade
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
);