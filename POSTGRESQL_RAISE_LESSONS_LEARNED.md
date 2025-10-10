# 🎓 PostgreSQL RAISE - Lessons Learned the Hard Way

## 💔 The Painful Journey

**Timeline of Errors (October 10, 2025):**
1. ❌ Error: "syntax error at or near RAISE" → Fixed DO blocks
2. ❌ Error: "too few parameters" (%.1f) → Fixed printf formatting
3. ❌ Error: "too many parameters" (%% with concatenated param) → Fixed THIS!

**Total iterations:** 3 major fixes  
**Total instances corrected:** 14+  
**Lesson:** PostgreSQL RAISE is SIMPLE but STRICT!

---

## 🎯 THE GOLDEN RULES (FINAL!)

### Rule #1: RAISE Must Be Inside DO Block
```sql
❌ RAISE NOTICE 'Hello';  -- ERROR: syntax error
✅ DO $$ BEGIN RAISE NOTICE 'Hello'; END $$;  -- Works!
```

### Rule #2: No Printf Formatting
```sql
❌ RAISE NOTICE 'Rate: %.1f', value;  -- ERROR: too few parameters
✅ RAISE NOTICE 'Rate: %', ROUND(value, 1);  -- Works!
```

### Rule #3: %% vs % with Concatenation
```sql
❌ RAISE NOTICE 'Coverage: %%', value || '%';  -- ERROR: too many parameters
✅ RAISE NOTICE 'Coverage: %', value || '%';   -- Works!
```

**Why?**
- `%%` = literal % sign (ZERO placeholders)
- `%` = ONE placeholder
- When you concatenate `value || '%'`, you're passing ONE parameter
- So you need ONE `%`, not `%%`!

---

## 🧠 THE MENTAL MODEL

### Think of % counting like this:

```sql
'Coverage: %%'        → Count: 0 placeholders (%% = literal)
                      → Parameters needed: 0
                      → ❌ If you pass 1 param → ERROR: too many

'Coverage: %'         → Count: 1 placeholder
                      → Parameters needed: 1
                      → ✅ Pass: value || '%' → Works!

'% of data (≥20%%)'   → Count: 1 placeholder (first %)
                      → %% is literal (not counted)
                      → Parameters needed: 1
                      → ✅ Pass: value || '%' → Works!
```

---

## ✅ THE CORRECT PATTERNS

### Pattern 1: Simple Value
```sql
RAISE NOTICE 'Count: %', v_count;
```

### Pattern 2: Concatenated Percentage
```sql
v_pct := ROUND(v_pct, 1);
RAISE NOTICE 'Coverage: %', v_pct || '%';  -- ONE % for ONE param
```

### Pattern 3: Value + Literal Percentage
```sql
RAISE NOTICE '% of events (target ≥20%%)', v_pct || '%';
-- First %: placeholder for concatenated value
-- Second %%: literal "20%"
```

### Pattern 4: Multiple Values
```sql
RAISE NOTICE 'Processed % items in % seconds', v_count, v_time;
```

---

## 🚫 BANNED PATTERNS (Never Use!)

```sql
❌ RAISE NOTICE 'Value: %.1f', v_num;           -- Printf formatting
❌ RAISE NOTICE 'Coverage: %%', v_num || '%';   -- %% with concat param
❌ RAISE NOTICE 'Count: %d', v_count;           -- %d not supported
❌ RAISE NOTICE 'Name: %s', v_string;           -- %s not supported
❌ RAISE NOTICE 'Outside block';                -- Outside DO/function
```

---

## 📊 Error Messages Decoded

### "too few parameters specified for RAISE"
**Cause:** PostgreSQL counted MORE placeholders than you provided parameters

**Common reasons:**
1. You used `%.1f` → PostgreSQL sees `%` + `.1f` = thinks you want 2+ placeholders
2. You used `%` for literal percent → Should use `%%` instead

**Fix:** Either add parameters OR escape the % as %%

### "too many parameters specified for RAISE"
**Cause:** PostgreSQL counted FEWER placeholders than you provided parameters

**Common reasons:**
1. You used `%%` (literal) but also provided a parameter
2. You used `%%` with concatenated value (like `value || '%'`)

**Fix:** Change `%%` to `%` when passing concatenated percentage

### "syntax error at or near RAISE"
**Cause:** RAISE statement is not inside a DO block or function

**Fix:** Wrap in `DO $$ BEGIN ... END $$;`

---

## 💡 Pro Tips

### Tip #1: Round in SQL, Not in RAISE
```sql
✅ v_rate := ROUND(value, 1);
   RAISE NOTICE 'Rate: %', v_rate;

❌ RAISE NOTICE 'Rate: %.1f', value;  -- Won't work!
```

### Tip #2: Concatenate Before RAISE
```sql
✅ v_msg := v_value || ' items';
   RAISE NOTICE 'Result: %', v_msg;

✅ RAISE NOTICE 'Result: %', v_value || ' items';  -- Also works
```

### Tip #3: Use %% Only for Literals
```sql
✅ RAISE NOTICE 'Target: 20%%';  -- Shows "Target: 20%"
   -- No parameter needed!

❌ RAISE NOTICE 'Result: %%', value;  -- ERROR if passing param
```

### Tip #4: Count Your Placeholders
Before writing RAISE, literally count the single `%` symbols (not `%%`):
- 1 single `%` → Need 1 parameter
- 2 single `%` → Need 2 parameters
- 0 single `%` (only `%%`) → Need 0 parameters

---

## 🎯 Quick Decision Tree

```
Are you displaying a percentage value?
├─ YES → Is the value already calculated?
│        ├─ YES → Round it, then: RAISE NOTICE '%', value || '%'
│        └─ NO → Calculate & round, then: RAISE NOTICE '%', value || '%'
│
└─ NO → Do you need a literal % sign?
         ├─ YES → Use %% (no parameter)
         └─ NO → Use % for each value
```

---

## 📝 Real Examples From Our Fixes

### Example 1: Success Rate
```sql
-- ❌ ATTEMPT 1:
RAISE NOTICE 'Success rate: %.1f%%', v_rate;  -- ERROR: too few parameters

-- ❌ ATTEMPT 2:
v_rate := ROUND(v_rate, 1);
RAISE NOTICE 'Success rate: %%', v_rate || '%';  -- ERROR: too many parameters

-- ✅ FINAL (CORRECT):
v_rate := ROUND(v_rate, 1);
RAISE NOTICE 'Success rate: %', v_rate || '%';  -- Works!
```

### Example 2: Coverage with Target
```sql
-- ❌ WRONG:
RAISE NOTICE '%.1f%%% of events (≥20%%%)', v_pct;  -- Multiple errors!

-- ✅ RIGHT:
v_pct := ROUND(v_pct, 1);
RAISE NOTICE '% of events (≥20%%)', v_pct || '%';  -- Perfect!
-- First %: placeholder for v_pct || '%'
-- Second %%: literal "≥20%"
```

### Example 3: Progress Report
```sql
-- ❌ WRONG:
RAISE NOTICE 'Processed % items (%.1f items/sec)', v_count, v_rate;

-- ✅ RIGHT:
v_rate := ROUND(v_count::NUMERIC / v_seconds, 1);
RAISE NOTICE 'Processed % items (% items/sec)', v_count, v_rate;
```

---

## 🎓 What We Should Have Done

### BEFORE writing ANY SQL with RAISE:

1. **Read** `POSTGRESQL_RAISE_CHECKLIST.md`
2. **Remember** these 3 rules:
   - RAISE must be in DO block
   - No printf formatting (%.1f, %d, %s)
   - Single % for concatenated values, %% only for literals
3. **Test** with one simple RAISE first
4. **Count** placeholders before writing complex RAISE

---

## 🚀 Going Forward

### New Workflow:
1. Write RAISE statement
2. Count single `%` symbols (not `%%`)
3. Verify parameter count matches
4. If showing percentages:
   - Concatenate: `value || '%'`
   - Use single `%` in format string
5. If showing literal %:
   - Use `%%` with NO parameter

### File to Reference:
**`POSTGRESQL_RAISE_CHECKLIST.md`** ← Your new best friend!

---

## 🏆 Victory Statement

**We learned:**
- PostgreSQL RAISE is simple but strict
- No printf formatting ever
- %% means literal (zero params)
- % means placeholder (one param)
- When concatenating %, use single %

**Mistakes made:** 14+  
**Lessons learned:** Priceless  
**Future errors:** ZERO! 🎯

---

**Last Updated:** October 10, 2025  
**Status:** ✅ Fully understood and documented  
**Confidence:** 100% for future SQL scripts!

