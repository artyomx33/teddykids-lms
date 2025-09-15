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
END $$;