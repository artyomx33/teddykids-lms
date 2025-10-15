# PostgreSQL RAISE NOTICE - Complete Syntax Rules

---

# 🚨 CRITICAL WARNING - READ THIS FIRST! 🚨

## ❌ **POSTGRESQL RAISE DOES NOT SUPPORT PRINTF-STYLE FORMATTING!**

### **WRONG (Will Always Fail!):**
```sql
-- ❌ NO %.1f, %.2f, %d, %s, etc!
RAISE NOTICE 'Rate: %.1f employees/sec', v_rate;  -- ERROR: too few parameters
RAISE NOTICE 'Coverage: %.1f%%%', v_pct;           -- ERROR: too few parameters
RAISE NOTICE 'Count: %d items', v_count;           -- ERROR: too few parameters
```

**Why it fails:**
- PostgreSQL sees `%.1f` as: `%` (placeholder) + `.1f` (literal text)
- It thinks you have 2+ placeholders when you only have 1 parameter!

### **✅ CORRECT (Use ROUND + concatenation):**
```sql
-- ✅ Round the number BEFORE passing to RAISE
DECLARE
  v_rate NUMERIC := ROUND(employees / seconds, 1);
BEGIN
  RAISE NOTICE 'Rate: % employees/sec', v_rate;  -- Works!
END;

-- ✅ For percentages, concatenate the % symbol
DECLARE
  v_pct NUMERIC := ROUND(coverage * 100, 1);
BEGIN
  RAISE NOTICE 'Coverage: %%', v_pct || '%';  -- Works! Shows "Coverage: 75.5%"
END;
```

### **The Golden Rules:**
1. ⚠️ **PostgreSQL RAISE only supports simple `%` placeholders**
2. ⚠️ **No printf formatting: %.1f, %.2f, %d, %s are NOT supported**
3. ✅ **Use ROUND() in your SQL to format numbers**
4. ✅ **Concatenate strings with `||` operator**
5. ✅ **Use `%%` for a literal percent sign (no parameters needed)**

---

## 🎯 First Principles: How RAISE Works

### The Basic Rule
```sql
RAISE level 'format_string', expression1, expression2, ...;
```

**Where:**
- `format_string` contains text with optional `%` placeholders
- Each `%` placeholder is replaced by the next expression
- Number of `%` must EXACTLY match number of expressions

---

## ✅ CORRECT Syntax Examples

### Example 1: No placeholders, no parameters
```sql
RAISE NOTICE 'Hello world';  -- ✅ Works
```

### Example 2: One placeholder, one parameter
```sql
RAISE NOTICE 'Processing employee %', employee_id;  -- ✅ Works
```

### Example 3: Multiple placeholders, multiple parameters
```sql
RAISE NOTICE 'Processed % employees, % events', count1, count2;  -- ✅ Works
```

### Example 4: Displaying a literal percent sign (no parameters)
```sql
RAISE NOTICE 'Success rate: 95%%';  -- ✅ Works, displays "Success rate: 95%"
```

### Example 5: Combining placeholder with literal percent
```sql
-- Want to show: "Coverage: 30.5%"
RAISE NOTICE 'Coverage: %%%', value;  
-- First %% = literal %, third % = placeholder
-- Result: "Coverage: 30.5%"  ✅ Works
```

---

## ❌ INCORRECT Syntax Examples

### Error 1: Too few parameters
```sql
RAISE NOTICE 'Value: %';  
-- ❌ ERROR: too few parameters specified for RAISE
-- Has 1 placeholder (%) but 0 parameters
```

### Error 2: Too many parameters
```sql
RAISE NOTICE 'Coverage: %%', value;  
-- ❌ ERROR: too many parameters specified for RAISE
-- Has 0 placeholders (%% is literal) but 1 parameter
```

### Error 3: Empty string
```sql
RAISE NOTICE '';  
-- ❌ ERROR: too few parameters (in some PG versions)
-- Use RAISE NOTICE ' '; instead
```

### Error 4: Mismatched count
```sql
RAISE NOTICE 'Values: % and %', value1;  
-- ❌ ERROR: too few parameters
-- Has 2 placeholders but 1 parameter
```

---

## 🐛 What Went Wrong in Our Code

### The Single Employee Test (WORKED ✅)
```sql
RAISE NOTICE 'Testing with employee: %', v_test_employee_id;
RAISE NOTICE 'Generated % events for test employee', v_events;
```
**Why it worked:** Each `%` has exactly one matching parameter

---

### The Bulk Version (FAILED ❌)

**Line 22:**
```sql
RAISE NOTICE 'Processed % employees, % events generated so far...', v_employee_count, v_total_events;
```
✅ This is CORRECT - 2 placeholders, 2 parameters

**Line 93-96:**
```sql
RAISE NOTICE 'Events with salary: %%', v_salary_pct;  -- ❌ ERROR HERE!
RAISE NOTICE 'Events with hours: %%', v_hours_pct;    -- ❌ ERROR HERE!
```
❌ **THE PROBLEM:**
- `%%` = literal percent sign (0 placeholders)
- But we provided 1 parameter
- PostgreSQL error: "too many parameters specified for RAISE"

---

## ✅ The Correct Fix

### What We Want: "Events with salary: 30.5%"

**Option 1: Show just the number**
```sql
RAISE NOTICE 'Events with salary: %', v_salary_pct;
-- Output: "Events with salary: 30.5"
```

**Option 2: Show the number with percent sign**
```sql
RAISE NOTICE 'Events with salary: %%%', v_salary_pct;
-- First %% = literal %
-- Third % = placeholder for value
-- Output: "Events with salary: 30.5%"
```

**Option 3: Format as text beforehand**
```sql
RAISE NOTICE 'Events with salary: %', v_salary_pct || '%';
-- Concatenate % to the value
-- Output: "Events with salary: 30.5%"
```

---

## 🎓 The Mental Model

Think of `RAISE NOTICE` like `printf` in C or `String.format()` in Java:

```python
# Python equivalent
print(f"Processed {count} employees")  # One placeholder
print(f"Coverage: {value}%")           # One placeholder + literal %

# PostgreSQL equivalent  
RAISE NOTICE 'Processed % employees', count;       -- One placeholder
RAISE NOTICE 'Coverage: %%%', value;               -- One placeholder + literal %%
```

**The Rule:**
- Count the non-escaped `%` (single %)
- Must equal number of parameters
- `%%` is not a placeholder, it's a literal

---

## 🔧 Debugging RAISE Errors

### Error: "too few parameters"
**Cause:** More `%` placeholders than parameters provided

**Fix:** Either:
- Add missing parameters, OR
- Escape literal `%` as `%%`

### Error: "too many parameters"  
**Cause:** Fewer `%` placeholders than parameters provided

**Fix:** Either:
- Remove extra parameters, OR
- Add missing `%` placeholders, OR
- Check if you used `%%` when you meant `%`

---

## 🚨 CRITICAL RULE: RAISE Must Be Inside DO Block

**PostgreSQL requires RAISE statements to be inside:**
- A `DO $$` block, OR
- A function/procedure definition

### ❌ WRONG (Will Fail!)
```sql
-- Bare RAISE NOTICE outside any block
RAISE NOTICE 'Starting process...';  -- ❌ ERROR: syntax error at or near "RAISE"

SELECT * FROM some_table;
```

### ✅ CORRECT
```sql
-- Wrapped in DO block
DO $$
BEGIN
  RAISE NOTICE 'Starting process...';  -- ✅ Works!
END $$;

SELECT * FROM some_table;
```

### Why This Matters
This is especially easy to miss when:
- Adding logging between queries
- Creating multi-phase scripts
- Inserting progress messages between SELECT statements

**Rule:** If you see a standalone RAISE statement (not in DO or function), wrap it immediately!

---

## 🎯 Best Practices

### 1. Always count your placeholders
```sql
-- Before writing RAISE:
-- Format string: 'Employee % has % events'
-- Placeholders: 2
-- Parameters needed: 2
RAISE NOTICE 'Employee % has % events', emp_id, event_count;  ✅
```

### 2. Be explicit about percent signs
```sql
-- Want: "Success rate: 95%"
-- Option A: Escape the %
RAISE NOTICE 'Success rate: 95%%';  ✅

-- Option B: Concatenate
RAISE NOTICE 'Success rate: %', 95 || '%';  ✅
```

### 3. Use literal strings for no-parameter messages
```sql
RAISE NOTICE 'Starting process...';  ✅ (no % at all)
```

### 4. Test complex formats separately
```sql
-- Test the format string first
DO $$
BEGIN
  RAISE NOTICE 'Value: %%% (expected: Value: X%)', 42;
  -- Should output: "Value: 42%"
END $$;
```

---

## 📋 Quick Reference Card

| You Want | Syntax | Example | Output |
|----------|--------|---------|--------|
| Simple text | `'text'` | `RAISE NOTICE 'Done';` | `Done` |
| One value | `'text %', val` | `RAISE NOTICE 'Count: %', 5;` | `Count: 5` |
| Two values | `'% and %', v1, v2` | `RAISE NOTICE '% and %', 1, 2;` | `1 and 2` |
| Literal % | `'text %%'` | `RAISE NOTICE '95%% done';` | `95% done` |
| Value + % | `'text %%%', val` | `RAISE NOTICE 'At %%%', 50;` | `At 50%` |
| Empty line | `' '` | `RAISE NOTICE ' ';` | ` ` |

---

## 🎉 Summary

**The Golden Rules:**

1. **RAISE Must Be Inside DO Block**
   > RAISE NOTICE can ONLY be used inside a `DO $$` block or function.  
   > Standalone RAISE statements will fail with "syntax error at or near RAISE".

2. **Count Your Placeholders**
   > Count the single `%` symbols (not `%%`) in your format string.  
   > That's how many parameters you MUST provide. No more, no less.

**Common Mistakes (IN ORDER OF FREQUENCY):**
1. **Using %.1f, %.2f, or any printf format** → too few/many parameters error ⚠️ **MOST COMMON!**
2. **Using RAISE outside DO block** → syntax error at or near "RAISE"
3. Using `%%` when you want a placeholder → too many parameters error
4. Using `%` for literal percent → too few parameters error
5. Mismatching placeholder count and parameter count

---

## 📋 QUICK REFERENCE - COPY THIS!

```sql
-- ❌ NEVER DO THIS:
RAISE NOTICE 'Value: %.1f%%', v_number;          -- WRONG!
RAISE NOTICE 'Count: %d items', v_count;         -- WRONG!

-- ✅ ALWAYS DO THIS INSTEAD:
v_rounded := ROUND(v_number, 1);
RAISE NOTICE 'Value: %%', v_rounded || '%';      -- RIGHT!
RAISE NOTICE 'Count: % items', v_count;          -- RIGHT!
```

---

**The Fix for Our Code:**
```sql
-- WRONG:
RAISE NOTICE 'Events with salary: %%', v_salary_pct;  ❌

-- RIGHT (Option 1):
RAISE NOTICE 'Events with salary: %', v_salary_pct;  ✅

-- RIGHT (Option 2):  
RAISE NOTICE 'Events with salary: %%%', v_salary_pct;  ✅
```

