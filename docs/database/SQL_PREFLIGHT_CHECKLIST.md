# ✈️ SQL SCRIPT PRE-FLIGHT CHECKLIST

**RUN THIS CHECKLIST BEFORE EXECUTING ANY SQL SCRIPT!**

---

## 🔍 **BEFORE YOU CLICK "RUN":**

### ✅ Check #1: All RAISE Statements in DO Blocks?

**Search for:** `RAISE` in your script

**For each RAISE found, verify:**
- [ ] Is it inside `DO $$ BEGIN ... END $$;`?
- [ ] OR is it inside a function definition?

**If NO to both → WRAP IT IN DO BLOCK FIRST!**

---

### ✅ Check #2: No Printf Formatting?

**Search for:** `%.1f`, `%.2f`, `%d`, `%s`

**Found any?** ❌ **STOP! These don't work in PostgreSQL!**

**Fix:** Use `ROUND()` in SQL instead:
```sql
❌ RAISE NOTICE 'Rate: %.1f', value;
✅ value := ROUND(value, 1);
   RAISE NOTICE 'Rate: %', value;
```

---

### ✅ Check #3: Correct %% Usage?

**Search for:** `%%` followed by a comma `,`

**Example:** `RAISE NOTICE 'Value: %%', something`

**If found:** ❌ **WRONG!**
- `%%` means "literal %" with NO parameter
- If you're passing a parameter, use single `%` instead

**Fix:**
```sql
❌ RAISE NOTICE 'Rate: %%', value || '%';
✅ RAISE NOTICE 'Rate: %', value || '%';
```

---

### ✅ Check #4: Placeholder Count = Parameter Count?

**For each RAISE statement:**
1. Count single `%` symbols (not `%%`)
2. Count parameters after the comma
3. Numbers must match!

**Example:**
```sql
✅ RAISE NOTICE 'Processed % items in % seconds', count, time;
   2 placeholders (%) = 2 parameters ✅

❌ RAISE NOTICE 'Processed % items', count, time;
   1 placeholder (%) ≠ 2 parameters ❌
```

---

## 🎯 **QUICK VALIDATION SCRIPT**

Run this in your head:

```
1. Search file for "RAISE"
2. For each RAISE:
   - In DO block? ✓
   - No %.1f? ✓
   - No %% with parameters? ✓
   - Placeholders match parameters? ✓
3. All checks pass? → SAFE TO RUN!
```

---

## 🚫 **COMMON MISTAKES (WE MADE THESE TODAY!)**

### Mistake #1: RAISE Outside DO Block (3x today!)
```sql
❌ SELECT * FROM table;
   RAISE NOTICE 'Hello';
   SELECT * FROM table;

✅ SELECT * FROM table;
   DO $$ BEGIN RAISE NOTICE 'Hello'; END $$;
   SELECT * FROM table;
```

### Mistake #2: Printf Formatting (6x today!)
```sql
❌ RAISE NOTICE 'Rate: %.1f%%', value;
✅ value := ROUND(value, 1);
   RAISE NOTICE 'Rate: %', value || '%';
```

### Mistake #3: %% With Parameters (8x today!)
```sql
❌ RAISE NOTICE 'Coverage: %%', pct || '%';
✅ RAISE NOTICE 'Coverage: %', pct || '%';
```

---

## 💡 **REMEMBER:**

PostgreSQL RAISE is **SIMPLE but STRICT**:
- Must be in DO block
- No fancy formatting
- Single `%` per parameter
- `%%` = literal % (no parameter)

**When in doubt, wrap it in DO block!** 🛡️

---

## 🎯 **READY TO RUN?**

- [ ] All RAISE in DO blocks ✓
- [ ] No printf formatting ✓
- [ ] Correct %% usage ✓
- [ ] Placeholders = parameters ✓

**ALL CHECKS PASSED?** → **SAFE TO EXECUTE!** ✅

---

**Last Updated:** October 10, 2025 (After 3 DO block errors in one day!)  
**Purpose:** Prevent repeating the same mistakes  
**Status:** Use this EVERY TIME before running SQL!

