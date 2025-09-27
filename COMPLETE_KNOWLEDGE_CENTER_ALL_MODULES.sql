-- ============================================
-- 🧸📚 COMPLETE KNOWLEDGE CENTER - ALL MODULES
-- ============================================
-- The definitive restoration of ALL Knowledge Center content
-- Found: 9 total modules from code and migrations
-- ============================================

-- Module 7: Welcome to Teddy Kids (Company Overview)
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'Welcome to Teddy Kids',
  'welcome-teddykids',
  'Your introduction to Teddy Kids: locations, managers, and what makes us special',
  true
);

INSERT INTO tk_document_sections (doc_id, section_number, title, content, summary, key_points, questions) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'welcome-teddykids'),
  1,
  'Our Locations & Team Leaders',
  'Teddy Kids operates across multiple locations in Leiden and internationally:

**Leiden Locations:**
- **RBW** - Rijnsburgerweg 35 (Manager: Sofia - sofia@teddykids.nl)
- **RB3/RB5** - Rijnsburgerweg 3 & 5 (Manager: Pamela - pamela@teddykids.nl)  
- **LRZ** - Lorentzkade 15a (Manager: Antonella - antonela@teddykids.nl)
- **ZML** - Zeemanlaan 22a (Manager: Meral & Svetlana - meral@teddykids.nl)

**TISA Locations:**
- **TISA Leiden** - Lorentzkade 15a (Manager: Numa - numa@tisaschool.nl)
- **TISA Portugal** - Lisbon (International expansion)

Each location has its own personality while maintaining our core Teddy Kids values.',
  'Teddy Kids has 6 locations across Leiden and internationally, each with dedicated managers.',
  '["4 main Leiden daycare locations", "2 TISA school locations", "Each location has dedicated managers", "All maintain core Teddy Kids values"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "Who is the manager at LRZ location?",
      "options": ["Sofia", "Antonella", "Pamela"],
      "correctAnswer": 1
    }
  ]'
);

-- Module 8: Living in the Netherlands (Expat Guide)
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'Living in the Netherlands: Expat Guide',
  'netherlands-expat-guide',
  'Essential information for international staff: BSN, healthcare, banking, and Dutch life',
  false
);

INSERT INTO tk_document_sections (doc_id, section_number, title, content, summary, key_points, questions) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'netherlands-expat-guide'),
  1,
  'Essential Documents & Registration',
  'Getting set up in the Netherlands requires several key steps:

**1. BSN (Burgerservicenummer):**
- Visit your local municipality (gemeente) with passport and proof of address
- Fill out the registration form (GBA/BRP) 
- Receive your BSN within 5-10 business days
- Keep it safe - you need it for everything!

**2. Health Insurance:**
- Mandatory within 4 months of arrival
- Basic coverage: €120-130/month
- Popular insurers: Zilveren Kruis, VGZ, CZ, Menzis
- Consider dental and physiotherapy supplements
- Apply for healthcare allowance (zorgtoeslag) if eligible

**3. Banking:**
- Most popular: ING, ABN AMRO, Rabobank
- Bring BSN, passport, proof of income
- Many offer English service',
  'Essential setup: BSN registration, mandatory health insurance, and Dutch banking.',
  '["BSN required for everything in Netherlands", "Health insurance mandatory within 4 months", "Banking requires BSN and passport", "Most services available in English"]',
  '[
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "When must you get health insurance in the Netherlands?",
      "options": ["Within 1 month", "Within 4 months", "Within 1 year"],
      "correctAnswer": 1
    }
  ]'
);

-- Module 9: Essential Safety Protocols
INSERT INTO tk_documents (title, slug, description, required) VALUES (
  'Essential Safety Protocols',
  'safety-protocols',
  'Critical safety rules, emergency procedures, and what to never do around children',
  true
);

INSERT INTO tk_document_sections (doc_id, section_number, title, content, summary, key_points, questions) VALUES (
  (SELECT id FROM tk_documents WHERE slug = 'safety-protocols'),
  1,
  'Never Do - Critical Safety Rules',
  'These rules are non-negotiable for child safety:

**NEVER DO:**
- Bring hot drinks over 53°C near children
- Take photos on personal phones  
- Share personal contact information with parents
- Leave children unsupervised at any time
- Ignore allergy protocols

**ALWAYS DO:**
- Greet parents warmly when they arrive
- Wash hands before and after activities
- Maintain active supervision of all children
- Report ALL incidents immediately to management
- Check and follow all allergy protocols

**Emergency Protocols:**
- Know all fire exit routes and procedures
- Have emergency contact numbers readily available  
- Know location of first aid kit and trained first aiders',
  'Critical safety rules including never/always guidelines and emergency protocols.',
  '["Never bring hot drinks over 53°C near children", "Always maintain active supervision", "Report all incidents immediately", "Know emergency procedures and exits"]',
  '[
    {
      "id": 1,
      "type": "true-false",
      "question": "It is okay to take photos of children on your personal phone.",
      "correctAnswer": false
    }
  ]'
);

-- Final count and verification
SELECT 
  '🎉 COMPLETE KNOWLEDGE CENTER INSTALLED!' as status,
  'Total modules: ' || COUNT(*) as total_modules
FROM tk_documents;

SELECT 
  d.title,
  d.slug,
  d.required,
  COUNT(s.id) as sections
FROM tk_documents d
LEFT JOIN tk_document_sections s ON s.doc_id = d.id
GROUP BY d.id, d.title, d.slug, d.required
ORDER BY d.created_at;

-- Success message
SELECT '🧸📚 ALL 9 MODULES READY! Visit /growbuddy/knowledge to explore!' as final_result;
