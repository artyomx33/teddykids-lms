# 🔧 Fix Review Templates - Missing Questions

## 🎯 Problem
When creating a new review, you're not seeing:
- ❌ DISC mini-questions (3 rotating questions)
- ❌ Self-assessment section (reflect & respond)
- ❌ Full performance rating questions

**BUT** when editing an existing review (one added via DB), you DO see all these sections.

## 🔍 Root Cause
The **templates in the database** don't have the full v1.1 questions yet. The v1.1 seed migration might not have been run, or the UPDATE statements didn't match existing templates.

## ✅ Solution
Run the **`FIX_REVIEW_TEMPLATES_FULL.sql`** script to recreate all templates with full questions.

---

## 📋 Steps to Fix

### 1. Check Current Templates (Optional)
```sql
-- Run this first to see what you have now
SELECT 
  name,
  jsonb_array_length(questions) as question_count,
  disc_injection_enabled,
  self_assessment_required
FROM review_templates;
```

Expected: You'll probably see few questions and `false` for DISC/self-assessment flags.

---

### 2. Run the Fix Script

**Go to Supabase Dashboard → SQL Editor**

Copy and paste the **entire contents** of:
```
FIX_REVIEW_TEMPLATES_FULL.sql
```

Click **"Run"**

---

### 3. Verify It Worked
You should see:
```
✅ Review templates fixed! All 6 templates now have full v1.1 questions.
```

And a table showing:
| name | review_type | question_count | disc_injection | self_assessment |
|------|-------------|----------------|----------------|-----------------|
| Custom Review Template | custom | 5 | true | true |
| Exit Review | exit | 8 | false | true |
| First-Month Review | probation | 10 | true | true |
| Performance Improvement Review | performance | 10 | false | true |
| Six Month Review | six_month | 14 | true | true |
| Yearly Review | yearly | 13 | true | true |

---

## 📊 What Each Template Now Has

### 1. First-Month Review (Probation)
- **Questions:** 10
- **DISC:** ✅ Enabled (3 mini-questions)
- **Self-Assessment:** ✅ Enabled
- **XP Reward:** 250
- **Ratings:**
  - Adaptability speed
  - Initiative taken
  - Communication & teamwork
  - Work quality
- **Text Questions:**
  - How well has team received this person?
  - Key strengths
  - Areas needing training
  - Employment decision (confirm/extend/terminate)

---

### 2. Six Month Review
- **Questions:** 14
- **DISC:** ✅ Enabled (3 mini-questions)
- **Self-Assessment:** ✅ Enabled
- **XP Reward:** 500
- **Ratings:**
  - Overall job performance
  - Teamwork & collaboration
  - Communication skills
  - Reliability & consistency
  - Initiative & proactivity
  - Flexibility
  - Professional behavior
  - Energy & positivity
  - Routines
  - Safety awareness
  - Conflict handling
- **Text Questions:**
  - Key achievements
  - Areas for improvement
  - Goals for next period

---

### 3. Yearly Review (Annual)
- **Questions:** 13
- **DISC:** ✅ Enabled (3 mini-questions)
- **Self-Assessment:** ✅ Enabled
- **XP Reward:** 1000
- **Ratings:**
  - Overall performance this year
  - Teamwork & collaboration
  - Communication
  - Reliability
  - Initiative
  - Professional development & growth
  - Leadership & mentoring (optional)
- **Text Questions:**
  - Major achievements this year
  - Goals completed (completion rate)
  - Challenges overcome
  - Areas needing improvement
  - **"What would you like to become within Teddy Kids?"** 🎯
  - Goals for next year

---

### 4. Performance Improvement Review
- **Questions:** 10
- **DISC:** ❌ Disabled (focus on performance)
- **Self-Assessment:** ✅ Enabled
- **XP Reward:** 0 (serious review)
- **Focus:**
  - Reason for review
  - Improvement status
  - Current performance level
  - Attendance & punctuality
  - Specific areas needing improvement
  - Support needed
  - Measurable 30/60/90 day goals
  - Consequences if not met

---

### 5. Exit Review
- **Questions:** 8
- **DISC:** ❌ Disabled
- **Self-Assessment:** ✅ Enabled
- **XP Reward:** 0
- **Focus:**
  - Reason for leaving
  - Overall satisfaction
  - Relationship ratings
  - Work-life balance
  - What they enjoyed
  - Improvement suggestions
  - Would they recommend Teddy Kids?

---

### 6. Custom Review Template
- **Questions:** 5
- **DISC:** ✅ Enabled
- **Self-Assessment:** ✅ Enabled
- **XP Reward:** 300
- **Flexibility:**
  - Basic ratings (performance, teamwork, communication)
  - Key discussion points
  - Action items / next steps

---

## 🎯 After Running the Fix

### What You'll See When Creating a Review:

1. **Select Template**
   - Choose from 6 templates
   - Each has different questions

2. **Basic Fields**
   - Review date, due date
   - Period start/end

3. **Template Questions**
   - 5-14 rating questions (stars)
   - Multiple text questions
   - All tailored to review type

4. **Self-Assessment Section** ✨
   - "How would you rate yourself?"
   - Rate yourself on same metrics
   - "One thing you're proud of"
   - "One thing you want to work on"
   - "How supported do you feel?" (1-5 stars)

5. **DISC Mini-Questions** ✨
   - Shows current DISC profile (if exists)
   - 3 rotating personality questions
   - "When something breaks, I usually..."
   - "When there's conflict, I tend to..."
   - Etc.

6. **Specialized Cards** (if applicable)
   - Probation: First-month metrics
   - Warning: Red flag levels
   - Promotion: Readiness criteria
   - Salary: Raise recommendations

7. **XP Preview**
   - Shows how much XP will be awarded
   - Gamification preview

---

## 🧪 Testing After Fix

### Test 1: Create New Six-Month Review
1. Go to Antonella's profile
2. Click "Complete Review Now"
3. Select "Six Month Review"
4. **You should now see:**
   - ✅ 14 rating questions
   - ✅ 3 text questions
   - ✅ Self-assessment section (5 fields)
   - ✅ DISC mini-questions (3 questions)
   - ✅ "500 XP" badge

### Test 2: Create Yearly Review
1. Same profile
2. Select "Yearly Review"
3. **You should see:**
   - ✅ 13 questions
   - ✅ "What would you like to become within Teddy Kids?" question
   - ✅ Self-assessment
   - ✅ DISC questions
   - ✅ "1000 XP" badge

---

## 📝 Summary of Changes

| Aspect | Before Fix | After Fix |
|--------|-----------|-----------|
| Question Count | Few (3-5) | Many (5-14 per template) |
| DISC Injection | ❌ Disabled | ✅ Enabled (most templates) |
| Self-Assessment | ❌ Disabled | ✅ Enabled (all templates) |
| XP Rewards | Not set | Set (250-1000 per template) |
| Emotional Metrics | Missing | Included |
| Rating Questions | Minimal | Comprehensive (11 core metrics) |

---

## ⚠️ Important Notes

1. **This script DELETES old templates and recreates them**
   - Existing reviews are NOT affected
   - Only the template definitions change

2. **Active reviews will still work**
   - Reviews already created keep their data
   - New reviews use new template structure

3. **Scheduled reviews**
   - Will use the NEW template questions when completed
   - Planning data remains intact

---

## 🚀 Next Steps After Fix

1. ✅ Run `FIX_REVIEW_TEMPLATES_FULL.sql`
2. ✅ Verify 6 templates created
3. ✅ Refresh browser
4. ✅ Create test review
5. ✅ Verify all sections appear:
   - Template questions
   - Self-assessment
   - DISC mini-questions
   - XP preview

---

**Ready to fix it? Run the SQL script now!** 🎯

