# 🚨 PostgreSQL RAISE Statement - Pre-Flight Checklist

**READ THIS BEFORE WRITING ANY RAISE STATEMENT!**

---

# ⚠️ **RULE #1: RAISE MUST BE IN DO BLOCK** ⚠️

```sql
❌ NEVER:
SELECT * FROM table;
RAISE NOTICE 'Hello';  ← ERROR! Outside DO block!
SELECT * FROM table;

✅ ALWAYS:
SELECT * FROM table;
DO $$ BEGIN
  RAISE NOTICE 'Hello';  ← Works! Inside DO block!
END $$;
SELECT * FROM table;
```

**WE'VE MADE THIS MISTAKE 3 TIMES IN ONE DAY!**  
**DON'T MAKE IT A 4TH TIME!** 🛑

---

## ❌ #1 MISTAKE (Happens Every Time!)

### **NEVER use printf-style formatting in PostgreSQL RAISE!**

```sql
-- ❌ THESE WILL FAIL:
RAISE NOTICE 'Rate: %.1f items/sec', v_rate;
RAISE NOTICE 'Coverage: %.2f%%', v_percent;
RAISE NOTICE 'Count: %d items', v_count;
RAISE NOTICE 'Name: %s', v_string;
RAISE NOTICE 'State is %.% complete!', value;  ← %.% looks like 2 placeholders!
```

**Why:** PostgreSQL RAISE doesn't support `%.1f`, `%d`, `%s`, etc.  
**Error:** "too few parameters specified for RAISE" or "too many parameters"

---

## ✅ THE CORRECT WAY

### **Step 1: Round numbers in SQL, not in RAISE**
```sql
-- ✅ RIGHT:
DECLARE
  v_rate NUMERIC := ROUND(items / seconds, 1);
BEGIN
  RAISE NOTICE 'Rate: % items/sec', v_rate;
END;
```

### **Step 2: Concatenate strings with ||**
```sql
-- ✅ RIGHT:
DECLARE
  v_pct NUMERIC := ROUND(coverage, 1);
BEGIN
  -- Use SINGLE % because we concatenated the % sign!
  RAISE NOTICE 'Coverage: %', v_pct || '%';  -- Shows "Coverage: 85.5%"
  
  -- Use %% ONLY for literals (no parameter)
  RAISE NOTICE 'Target: ≥20%%';  -- Shows "Target: ≥20%" (no parameter!)
  
  -- Combining both:
  RAISE NOTICE '% of events (target ≥20%%)', v_pct || '%';  -- First % = parameter, second %% = literal
END;
```

**CRITICAL RULE:**
- `%` + concatenated string (`value || '%'`) = Use `%` (ONE placeholder)
- Literal percent sign only = Use `%%` (ZERO placeholders)  
- **NEVER use `%%` with a concatenated parameter!**

---

## 📋 CHECKLIST BEFORE WRITING RAISE

Before you write `RAISE NOTICE ...`, check:

- [ ] **Is it inside a `DO $$` block or function?**  
      ❌ If NO → Wrap it in `DO $$ BEGIN ... END $$;`

- [ ] **Does it use %.1f, %.2f, %d, or %s?**  
      ❌ If YES → Use ROUND() in SQL and simple `%` placeholder

- [ ] **Does it show a percentage with % sign?**  
      ❌ If YES → Use `%%` and concatenate: `v_num || '%'`

- [ ] **Count the `%` symbols (single %, not %%)**  
      ✅ Must equal number of parameters provided

- [ ] **Are you displaying decimal numbers?**  
      ✅ Use `ROUND(value, decimals)` in the DECLARE section

---

## 🎯 PATTERN TO COPY

```sql
-- This pattern ALWAYS works:
DO $$
DECLARE
  v_value NUMERIC := ROUND(calculated_value, 1);  -- Round here!
BEGIN
  -- Simple % for placeholder
  RAISE NOTICE 'Result: %', v_value;
  
  -- For percentage display
  RAISE NOTICE 'Coverage: %%', v_value || '%';
  
  -- For multiple values
  RAISE NOTICE 'Processed % items in % seconds', v_count, v_time;
END $$;
```

---

## 🚫 BANNED PATTERNS

**NEVER write these:**

```sql
❌ RAISE NOTICE 'Value: %.1f', v_num;
❌ RAISE NOTICE 'Count: %d', v_count;
❌ RAISE NOTICE 'Name: %s', v_string;
❌ RAISE NOTICE 'Percent: %.2f%%', v_pct;
❌ RAISE NOTICE 'Outside DO block';  -- (if it's outside DO/function)
```

**Replace with:**

```sql
✅ v_num := ROUND(v_num, 1);
   RAISE NOTICE 'Value: %', v_num;
   
✅ RAISE NOTICE 'Count: %', v_count;

✅ RAISE NOTICE 'Name: %', v_string;

✅ v_pct := ROUND(v_pct, 2);
   RAISE NOTICE 'Percent: %%', v_pct || '%';
   
✅ DO $$ BEGIN
     RAISE NOTICE 'Inside DO block';
   END $$;
```

---

## 💡 QUICK FIXES

### Problem: "too few parameters specified for RAISE"
**Cause:** You used `.1f` or similar formatting  
**Fix:** Remove the format specifier, use ROUND() instead

### Problem: "too many parameters specified for RAISE"
**Cause:** You used `%%` (literal %) but also provided a parameter  
**Fix:** Use concatenation: `value || '%'`

### Problem: "syntax error at or near RAISE"
**Cause:** RAISE is outside a DO block  
**Fix:** Wrap in `DO $$ BEGIN ... END $$;`

---

## 📝 EXAMPLES FROM OUR FIXES

### Before (❌ WRONG):
```sql
RAISE NOTICE 'Progress: % items (%.1f items/sec)', v_count, v_rate;
RAISE NOTICE 'Coverage: %.1f%%%', v_percent;
RAISE NOTICE 'Result: %%', v_value || '%';  -- ❌ WRONG! %% with parameter!
```

### After (✅ RIGHT):
```sql
v_rate := ROUND(v_count::NUMERIC / v_seconds, 1);
RAISE NOTICE 'Progress: % items (% items/sec)', v_count, v_rate;

v_percent := ROUND(v_percent, 1);
RAISE NOTICE 'Coverage: %', v_percent || '%';  -- ✅ Single % for concatenated value!

-- If you need a literal % AND a parameter:
RAISE NOTICE '% of events (≥20%%)', v_percent || '%';  -- ✅ First % = param, second %% = literal
```

---

## 🚨 LATEST TIMELINE FIX MISTAKES (Oct 10, 2025)

### **THE DISASTER:** Spent 2+ hours on basic RAISE syntax! 😤

**Error:** "too few parameters specified for RAISE"
**Root Cause:** Mixing `%%` (literal percent) with parameters

### **SPECIFIC MISTAKES WE MADE:**

#### ❌ Mistake #1: Using %% with parameters
```sql
-- ❌ WRONG:
RAISE NOTICE '📊 Success rate: %%', v_success_rate || '%';
-- WHY WRONG: %% expects 0 parameters, but we provided 1

-- ✅ RIGHT:
RAISE NOTICE '📊 Success rate: %', v_success_rate || '%';
```

#### ❌ Mistake #2: Mixing % and %% with wrong parameter count
```sql
-- ❌ WRONG:
RAISE NOTICE 'Events with salary: % (%%)', v_salary_events, v_salary_pct || '%';
-- WHY WRONG: First % needs 1 param, %% needs 0, but we gave 2 params total

-- ✅ RIGHT:
RAISE NOTICE 'Events with salary: % (%)', v_salary_events, v_salary_pct || '%';
-- WHY RIGHT: Both % placeholders get parameters, no literal %% needed
```

#### ❌ Mistake #3: Inconsistent %% usage
```sql
-- ❌ WRONG:
RAISE NOTICE '✅ PASS: %% of events have salary data (≥20%%)', v_salary_pct || '%';
-- WHY WRONG: First %% with parameter, second %% without - INCONSISTENT!

-- ✅ RIGHT:
RAISE NOTICE '✅ PASS: % of events have salary data (≥20%%)', v_salary_pct || '%';
-- WHY RIGHT: First % takes parameter, second %% is literal
```

### **THE GOLDEN RULE (WRITE THIS DOWN!):**

```
COUNT YOUR % SYMBOLS AND MATCH PARAMETERS EXACTLY:

'Text %'                    → 1 parameter  ✅
'Text % and %'             → 2 parameters ✅
'Text %%'                  → 0 parameters ✅ (literal %)
'Text %% and %'            → 1 parameter  ✅ (literal %% + 1 param)
'Text %%', parameter       → FAIL! ❌ (0 expected, 1 given)
'Text % (%%)', param       → FAIL! ❌ (1 expected, 1 given, but %% confuses parser)
```

### **EMERGENCY CHECKLIST (USE EVERY TIME!):**
1. **Count single % signs** (not %%) = number of parameters needed
2. **Each %%** = literal percent, needs NO parameter
3. **Test the math:** `single_%_count = parameter_count` ✅
4. **When showing percentages:** Always use `% `, never `%%` with a parameter

---

## 🎯 REMEMBER

**PostgreSQL RAISE is SIMPLE:**
- Only supports basic `%` placeholders
- No format specifiers (unlike printf/sprintf)
- Do your formatting in SQL with ROUND(), CAST(), etc.
- Concatenate strings with `||`

**When in doubt:**
1. Round the number first
2. Use simple `%`
3. Concatenate if needed
4. **COUNT YOUR % SIGNS!**

---

**Last Updated:** October 10, 2025 - After TIMELINE FIX DISASTER
**Mistakes Prevented:** 8+ instances of %% parameter mismatches
**Time Wasted Today:** 2+ hours on basic syntax 😤
**Future Goal:** ZERO RAISE formatting errors! 🎯
**New Rule:** Always count % signs before writing RAISE! 📏

