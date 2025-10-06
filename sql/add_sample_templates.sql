-- Add sample review templates for Phase 2

INSERT INTO public.review_templates (name, type, description, questions, criteria) VALUES
('Six Month Review', 'six_month', 'Standard 6-month performance review',
 '[
   {"question": "How would you rate your overall performance this period?", "type": "rating", "required": true},
   {"question": "What were your key achievements?", "type": "text", "required": true},
   {"question": "What areas would you like to develop?", "type": "text", "required": false},
   {"question": "Do you feel supported by your manager?", "type": "boolean", "required": true},
   {"question": "Rate your job satisfaction", "type": "rating", "required": true}
 ]',
 '{"attendance": 20, "quality": 30, "communication": 20, "teamwork": 15, "initiative": 15}'
),
('Yearly Review', 'yearly', 'Comprehensive annual performance review',
 '[
   {"question": "Overall performance rating", "type": "rating", "required": true},
   {"question": "Major accomplishments this year", "type": "text", "required": true},
   {"question": "Areas for improvement", "type": "text", "required": true},
   {"question": "Career development goals", "type": "text", "required": true},
   {"question": "Training needs", "type": "text", "required": false}
 ]',
 '{"performance": 40, "goals_achievement": 25, "professional_development": 20, "leadership": 15}'
),
('Performance Review', 'performance', 'General performance evaluation',
 '[
   {"question": "Rate overall job performance", "type": "rating", "required": true},
   {"question": "Strengths demonstrated", "type": "text", "required": true},
   {"question": "Areas for improvement", "type": "text", "required": true},
   {"question": "Goals for next period", "type": "text", "required": false}
 ]',
 '{"quality": 30, "efficiency": 25, "communication": 25, "teamwork": 20}'
);