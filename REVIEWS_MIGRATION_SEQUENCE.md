# 🎯 REVIEWS MIGRATION SEQUENCE - CORRECT ORDER

**IMPORTANT:** Run these in EXACT order!

---

## 📋 MIGRATION SEQUENCE

### ✅ Step 1: Apply Reviews v1.0

**File:** `RUN_IN_SUPABASE_REVIEWS_MIGRATIONS.sql`

**What it does:**
- Creates staff_reviews table (44 columns)
- Creates review_templates table
- Creates staff_review_summary view
- Creates performance_trends view
- Creates review_calendar view
- Seeds 6 basic review templates

**How to run:**
1. Open Supabase Dashboard: https://supabase.com/dashboard/project/gjlgaufihseaagzmidhc
2. Go to **SQL Editor**
3. Open file: `RUN_IN_SUPABASE_REVIEWS_MIGRATIONS.sql`
4. Copy entire contents
5. Paste into SQL Editor
6. Click **"Run"**
7. **Wait for success messages**

**Expected output:**
```
✅ Reviews v1.0 schema created
✅ 6 templates seeded
✅ Views created
```

---

### ✅ Step 2: Apply Reviews v1.1

**File:** `RUN_IN_SUPABASE_REVIEWS_V11.sql`

**What it does:**
- Adds 17 new columns to staff_reviews (DISC, gamification, EI)
- Adds 5 new columns to review_templates
- Creates staff_goals table
- Creates disc_mini_questions table
- Seeds 25 DISC questions
- Updates templates with XP rewards

**How to run:**
1. **After Step 1 succeeds**, open file: `RUN_IN_SUPABASE_REVIEWS_V11.sql`
2. Copy entire contents
3. Paste into SQL Editor
4. Click **"Run"**
5. **Watch for progress messages**

**Expected output:**
```
✅ Reviews v1.0 detected. Proceeding with v1.1 upgrade...
✅ Integration schema installed
✅ Templates updated with v1.1 features
✅ DISC questions seeded
✅ New columns added: 5
✅ staff_goals table: Created
✅ disc_mini_questions table: Created
✅ DISC questions seeded: 3
```

---

## 🚫 COMMON ERRORS

### Error: "Reviews v1.0 not found"
**Cause:** You tried to run v1.1 before v1.0  
**Fix:** Run Step 1 first, then Step 2

### Error: "table staff_reviews already exists"
**Cause:** You tried to run v1.0 twice  
**Fix:** Skip to Step 2 (v1.1)

### Error: "column already exists"
**Cause:** You tried to run v1.1 twice  
**Fix:** It's safe to re-run, migrations use IF NOT EXISTS

---

## ✅ VERIFICATION AFTER BOTH STEPS

After running BOTH migrations, verify with these queries:

### Check v1.0 columns exist:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'staff_reviews' 
  AND column_name IN ('star_rating', 'overall_rating', 'status')
ORDER BY column_name;
```
**Expected:** 3 rows

### Check v1.1 columns exist:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'staff_reviews' 
  AND column_name IN ('xp_earned', 'disc_snapshot', 'self_assessment', 'emotional_scores', 'goal_completion_rate')
ORDER BY column_name;
```
**Expected:** 5 rows

### Check new tables:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('staff_goals', 'disc_mini_questions')
ORDER BY table_name;
```
**Expected:** 2 rows

### Check DISC questions:
```sql
SELECT COUNT(*) as disc_questions FROM disc_mini_questions WHERE is_active = true;
```
**Expected:** 3+ questions

### Check templates with XP:
```sql
SELECT type, name, xp_base_reward, disc_injection_enabled
FROM review_templates
WHERE is_active = true
ORDER BY xp_base_reward DESC;
```
**Expected:** 6 rows with XP values (1000, 500, 500, 250, 0, 0)

---

## 🎯 QUICK STATUS CHECK

Run this after both migrations to get a full report:

```sql
DO $$
DECLARE
  v_v10_cols INTEGER;
  v_v11_cols INTEGER;
  v_templates INTEGER;
  v_goals_table BOOLEAN;
  v_disc_table BOOLEAN;
  v_disc_questions INTEGER;
BEGIN
  -- Check v1.0 columns
  SELECT COUNT(*) INTO v_v10_cols
  FROM information_schema.columns
  WHERE table_name = 'staff_reviews'
    AND column_name IN ('star_rating', 'overall_rating');
  
  -- Check v1.1 columns
  SELECT COUNT(*) INTO v_v11_cols
  FROM information_schema.columns
  WHERE table_name = 'staff_reviews'
    AND column_name IN ('xp_earned', 'disc_snapshot', 'self_assessment');
  
  -- Check templates
  SELECT COUNT(*) INTO v_templates
  FROM review_templates
  WHERE is_active = true;
  
  -- Check new tables
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_goals'
  ) INTO v_goals_table;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'disc_mini_questions'
  ) INTO v_disc_table;
  
  -- Check DISC questions
  SELECT COUNT(*) INTO v_disc_questions FROM disc_mini_questions WHERE is_active = true;
  
  -- Report
  RAISE NOTICE '';
  RAISE NOTICE '=== REVIEWS MIGRATION STATUS ===';
  RAISE NOTICE '';
  RAISE NOTICE 'v1.0 Status: %', CASE WHEN v_v10_cols >= 2 THEN '✅ Installed' ELSE '❌ Missing' END;
  RAISE NOTICE 'v1.1 Status: %', CASE WHEN v_v11_cols >= 3 THEN '✅ Installed' ELSE '❌ Missing' END;
  RAISE NOTICE '';
  RAISE NOTICE 'Templates: % active', v_templates;
  RAISE NOTICE 'staff_goals table: %', CASE WHEN v_goals_table THEN '✅ Created' ELSE '❌ Missing' END;
  RAISE NOTICE 'disc_mini_questions table: %', CASE WHEN v_disc_table THEN '✅ Created' ELSE '❌ Missing' END;
  RAISE NOTICE 'DISC questions: %', v_disc_questions;
  RAISE NOTICE '';
  
  IF v_v10_cols >= 2 AND v_v11_cols >= 3 THEN
    RAISE NOTICE '🎉 ALL MIGRATIONS COMPLETE! Ready for Phase 2!';
  ELSIF v_v10_cols >= 2 THEN
    RAISE NOTICE '⚠️ v1.0 installed, but v1.1 missing. Run RUN_IN_SUPABASE_REVIEWS_V11.sql';
  ELSE
    RAISE NOTICE '⚠️ v1.0 missing. Run RUN_IN_SUPABASE_REVIEWS_MIGRATIONS.sql first';
  END IF;
  
  RAISE NOTICE '';
END $$;
```

---

## 📝 CHECKLIST

Use this checklist to track your progress:

- [ ] Step 1: Run `RUN_IN_SUPABASE_REVIEWS_MIGRATIONS.sql` (v1.0)
  - [ ] Success messages appeared
  - [ ] No errors
  - [ ] 6 templates visible

- [ ] Step 2: Run `RUN_IN_SUPABASE_REVIEWS_V11.sql` (v1.1)
  - [ ] "v1.0 detected" message appeared
  - [ ] Integration schema installed
  - [ ] DISC questions seeded
  - [ ] No errors

- [ ] Verification: Run status check query
  - [ ] v1.0 Status: ✅ Installed
  - [ ] v1.1 Status: ✅ Installed
  - [ ] Templates: 6 active
  - [ ] staff_goals: ✅ Created
  - [ ] disc_mini_questions: ✅ Created
  - [ ] DISC questions: 3+

- [ ] Final: Celebrate! 🎉
  - [ ] All checks passed
  - [ ] Ready for Phase 2 (frontend development)

---

## 🚀 NEXT STEPS AFTER MIGRATIONS

Once both migrations are complete:

1. **Phase 2:** Create library functions (`reviewMetrics.ts`, `goalTracking.ts`, etc.)
2. **Phase 3:** Build UI components (`SelfAssessmentSection.tsx`, `DISCMiniQuestions.tsx`, etc.)
3. **Phase 4:** Integrate into ReviewForm
4. **Phase 5:** Test end-to-end review creation

---

**Last Updated:** October 16, 2025  
**Purpose:** Prevent "v1.0 not found" errors  
**Status:** Follow this sequence exactly!

