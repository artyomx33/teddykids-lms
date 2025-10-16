-- =====================================================
-- REVIEWS SYSTEM v1.1 - DISC MINI QUESTIONS
-- =====================================================
-- Date: 2025-10-16
-- Phase 1: Seed rotating DISC personality mini-questions
-- 20+ diverse scenarios covering all 4 DISC colors

BEGIN;

-- =====================================================
-- SEED DISC MINI-QUESTIONS
-- =====================================================

-- Question 1: Problem-Solving Style
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When something breaks during the day, I usually...', 'scenario', 
'[
  {"text": "Fix it immediately without asking", "disc_color": "red", "points": 3},
  {"text": "Find a fun way to adapt the activity", "disc_color": "yellow", "points": 3},
  {"text": "Check the routine and make a structured plan", "disc_color": "blue", "points": 3},
  {"text": "Ask a colleague and stay calm", "disc_color": "green", "points": 3}
]'::jsonb);

-- Question 2: Conflict Response
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When there''s conflict in the team, I tend to...', 'reaction', 
'[
  {"text": "Step in and take control", "disc_color": "red", "points": 3},
  {"text": "Avoid it and hope it passes", "disc_color": "green", "points": 3},
  {"text": "Try to explain with facts", "disc_color": "blue", "points": 3},
  {"text": "Make a joke or break the tension", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 3: Child Upset Response
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When a child is upset, my first instinct is to...', 'scenario', 
'[
  {"text": "Take charge and solve the problem quickly", "disc_color": "red", "points": 3},
  {"text": "Give them space and be patient", "disc_color": "green", "points": 3},
  {"text": "Follow the calming routine systematically", "disc_color": "blue", "points": 3},
  {"text": "Distract them with something fun", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 4: Work Style Preference
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('I work best when I can...', 'preference', 
'[
  {"text": "Make quick decisions and see immediate results", "disc_color": "red", "points": 3},
  {"text": "Follow a clear plan with specific steps", "disc_color": "blue", "points": 3},
  {"text": "Work collaboratively in a supportive team", "disc_color": "green", "points": 3},
  {"text": "Be creative and try new approaches", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 5: Communication Style
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When communicating with parents, I prefer to...', 'style', 
'[
  {"text": "Be direct and get to the point quickly", "disc_color": "red", "points": 3},
  {"text": "Build rapport with friendly conversation", "disc_color": "yellow", "points": 3},
  {"text": "Provide detailed information and documentation", "disc_color": "blue", "points": 3},
  {"text": "Listen carefully and respond thoughtfully", "disc_color": "green", "points": 3}
]'::jsonb);

-- Question 6: Schedule Disruption
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When the daily schedule gets disrupted, I...', 'reaction', 
'[
  {"text": "Quickly adapt and create a new plan", "disc_color": "red", "points": 3},
  {"text": "Get stressed but try to stick to routine", "disc_color": "blue", "points": 3},
  {"text": "Go with the flow and stay calm", "disc_color": "green", "points": 3},
  {"text": "See it as a chance for something fun", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 7: Team Project Approach
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('In a team project, I naturally tend to...', 'style', 
'[
  {"text": "Take the lead and assign tasks", "disc_color": "red", "points": 3},
  {"text": "Create detailed plans and timelines", "disc_color": "blue", "points": 3},
  {"text": "Support others and maintain harmony", "disc_color": "green", "points": 3},
  {"text": "Brainstorm creative ideas", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 8: New Task Learning
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When learning a new task, I prefer to...', 'preference', 
'[
  {"text": "Jump in and figure it out by doing", "disc_color": "red", "points": 3},
  {"text": "Read instructions carefully first", "disc_color": "blue", "points": 3},
  {"text": "Watch someone else do it first", "disc_color": "green", "points": 3},
  {"text": "Try different creative approaches", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 9: Time Pressure Response
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('Under time pressure, I typically...', 'reaction', 
'[
  {"text": "Thrive and get energized", "disc_color": "red", "points": 3},
  {"text": "Get anxious and want more time", "disc_color": "blue", "points": 3},
  {"text": "Stay calm but feel stressed", "disc_color": "green", "points": 3},
  {"text": "Find a quick creative solution", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 10: Group Activity Leading
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When leading a group activity with children, I focus on...', 'style', 
'[
  {"text": "Keeping everyone engaged and on task", "disc_color": "red", "points": 3},
  {"text": "Following the planned steps precisely", "disc_color": "blue", "points": 3},
  {"text": "Making sure everyone feels included", "disc_color": "green", "points": 3},
  {"text": "Making it fun and entertaining", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 11: Mistake Handling
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When I make a mistake, I usually...', 'reaction', 
'[
  {"text": "Fix it quickly and move on", "disc_color": "red", "points": 3},
  {"text": "Analyze what went wrong in detail", "disc_color": "blue", "points": 3},
  {"text": "Feel bad but learn from it slowly", "disc_color": "green", "points": 3},
  {"text": "Laugh it off and try something new", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 12: Feedback Preference
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('I prefer feedback that is...', 'preference', 
'[
  {"text": "Direct and to the point", "disc_color": "red", "points": 3},
  {"text": "Detailed with specific examples", "disc_color": "blue", "points": 3},
  {"text": "Gentle and supportive", "disc_color": "green", "points": 3},
  {"text": "Positive and encouraging", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 13: Room Organization
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When organizing the classroom, I...', 'style', 
'[
  {"text": "Set it up quickly and efficiently", "disc_color": "red", "points": 3},
  {"text": "Follow a specific system precisely", "disc_color": "blue", "points": 3},
  {"text": "Make it cozy and comfortable", "disc_color": "green", "points": 3},
  {"text": "Make it colorful and inspiring", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 14: Child Misbehavior
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When a child misbehaves, I...', 'scenario', 
'[
  {"text": "Set clear boundaries immediately", "disc_color": "red", "points": 3},
  {"text": "Refer to the rules we established", "disc_color": "blue", "points": 3},
  {"text": "Talk to them calmly about feelings", "disc_color": "green", "points": 3},
  {"text": "Redirect with a fun distraction", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 15: Colleague Disagreement
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When I disagree with a colleague, I...', 'reaction', 
'[
  {"text": "State my opinion clearly and firmly", "disc_color": "red", "points": 3},
  {"text": "Present facts and logical arguments", "disc_color": "blue", "points": 3},
  {"text": "Try to find middle ground", "disc_color": "green", "points": 3},
  {"text": "Use humor to ease tension", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 16: Morning Arrival
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When children arrive in the morning, I...', 'style', 
'[
  {"text": "Get them settled and start activities", "disc_color": "red", "points": 3},
  {"text": "Follow the morning routine checklist", "disc_color": "blue", "points": 3},
  {"text": "Greet each child warmly and personally", "disc_color": "green", "points": 3},
  {"text": "Welcome them with energy and excitement", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 17: Documentation Approach
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When documenting children''s progress, I...', 'style', 
'[
  {"text": "Keep it brief and focus on key points", "disc_color": "red", "points": 3},
  {"text": "Be thorough and detailed", "disc_color": "blue", "points": 3},
  {"text": "Focus on emotional and social aspects", "disc_color": "green", "points": 3},
  {"text": "Make it engaging with stories", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 18: Meeting Participation
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('In team meetings, I typically...', 'style', 
'[
  {"text": "Speak up and share ideas quickly", "disc_color": "red", "points": 3},
  {"text": "Prepare notes and share when ready", "disc_color": "blue", "points": 3},
  {"text": "Listen more than talk", "disc_color": "green", "points": 3},
  {"text": "Share stories and examples", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 19: Activity Planning
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When planning activities for children, I prioritize...', 'preference', 
'[
  {"text": "Achieving clear learning objectives", "disc_color": "red", "points": 3},
  {"text": "Following developmental guidelines", "disc_color": "blue", "points": 3},
  {"text": "Building relationships and trust", "disc_color": "green", "points": 3},
  {"text": "Making it fun and memorable", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 20: End of Day
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('At the end of the day, I feel satisfied when...', 'preference', 
'[
  {"text": "I accomplished all my goals", "disc_color": "red", "points": 3},
  {"text": "Everything was done correctly", "disc_color": "blue", "points": 3},
  {"text": "Everyone felt happy and supported", "disc_color": "green", "points": 3},
  {"text": "We had fun and creative moments", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 21: Challenge Approach
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When facing a challenge, I...', 'reaction', 
'[
  {"text": "Attack it head-on immediately", "disc_color": "red", "points": 3},
  {"text": "Research and plan carefully", "disc_color": "blue", "points": 3},
  {"text": "Seek support from others", "disc_color": "green", "points": 3},
  {"text": "Try creative unconventional solutions", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 22: Energy Source
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('I get energy from...', 'preference', 
'[
  {"text": "Taking action and getting results", "disc_color": "red", "points": 3},
  {"text": "Completing tasks thoroughly", "disc_color": "blue", "points": 3},
  {"text": "Connecting with others deeply", "disc_color": "green", "points": 3},
  {"text": "Social interaction and fun", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 23: Parent Concern Response
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When a parent expresses concern, I...', 'reaction', 
'[
  {"text": "Address it directly with solutions", "disc_color": "red", "points": 3},
  {"text": "Gather information and facts first", "disc_color": "blue", "points": 3},
  {"text": "Listen empathetically to their feelings", "disc_color": "green", "points": 3},
  {"text": "Reassure them with positive stories", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 24: Change Response
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When there''s a change in procedures, I...', 'reaction', 
'[
  {"text": "Adapt quickly and implement it", "disc_color": "red", "points": 3},
  {"text": "Need time to understand all details", "disc_color": "blue", "points": 3},
  {"text": "Feel unsure but go along with it", "disc_color": "green", "points": 3},
  {"text": "See it as an exciting opportunity", "disc_color": "yellow", "points": 3}
]'::jsonb);

-- Question 25: Success Definition
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('For me, success at work means...', 'preference', 
'[
  {"text": "Achieving targets and making impact", "disc_color": "red", "points": 3},
  {"text": "Doing everything correctly and safely", "disc_color": "blue", "points": 3},
  {"text": "Building strong relationships", "disc_color": "green", "points": 3},
  {"text": "Creating joy and inspiration", "disc_color": "yellow", "points": 3}
]'::jsonb);

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Seeded 25 DISC mini-questions covering:
-- - Problem-solving scenarios
-- - Conflict handling
-- - Communication styles
-- - Work preferences
-- - Reactions to change/stress
-- - Team dynamics
-- - Child interaction approaches
--
-- Questions rotate based on usage_count (least shown first)
-- Each question has 4 options representing Red, Blue, Green, Yellow
--
-- ALL MIGRATIONS COMPLETE! Ready for Phase 2: Testing

