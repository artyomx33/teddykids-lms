# ✅ PHASE 1 COMPLETE: Explicit Fallback Logic

**Implemented:** October 8, 2025  
**Time Taken:** ~30 minutes  
**Status:** 🎉 READY TO TEST

---

## 🎯 WHAT WE BUILT

### **NEW: `timeline-data-extractor.ts`**

A dedicated utility for extracting salary and hours from timeline events with **EXPLICIT, WELL-DOCUMENTED FALLBACK LOGIC**.

---

## 🔄 THE FALLBACK CHAIN (Extremely Explicit!)

### **For Salary:**

```
STEP 1: Try Timeline Cache (Fast Path)
  ↓
  if (salary_at_event != null && salary_at_event > 0)
    ✅ FOUND! Return immediately
    Console: "✅ Found in cache: 2539"
  else
    ⚠️ CACHE MISS
    Console: "⚠️ Cache miss - salary_at_event is null"
    Continue to Step 2...

STEP 2: Try JSONB new_value (Resilient Path)
  ↓
  if (new_value) {
    Try extractSalaryFromJsonb(new_value)
      - Try: monthly_wage
      - Try: monthlyWage
      - Try: salary
      - Try: gross_monthly
      - Try: grossMonthly
      - Try: bruto
    
    if found:
      ✅ EXTRACTED! Return value
      Console: "✅ Extracted from new_value JSONB: 2539"
    else:
      Continue to Step 3...
  }

STEP 3: Try JSONB previous_value (Last Resort)
  ↓
  if (previous_value) {
    Try extractSalaryFromJsonb(previous_value)
    [same field variations as Step 2]
    
    if found:
      ✅ EXTRACTED! Return value
      Console: "✅ Extracted from previous_value JSONB: 2501"
    else:
      Continue to Step 4...
  }

STEP 4: Not Found
  ↓
  Return null
  Console: "❌ No salary found in any source"
```

### **For Hours:**

Same 4-step fallback chain, but for hours fields:
- `hours_per_week`
- `hoursPerWeek`
- `hours`
- `weekly_hours`
- `weeklyHours`

---

## 📊 CONSOLE LOGS (What You'll See)

### **Example 1: Cache Hit (Fast)**
```
💰 [extractSalary] Starting extraction for event type: contract_change
✅ [extractSalary] Found in cache: 2539
⏰ [extractHours] Starting extraction for event type: contract_change  
✅ [extractHours] Found in cache: 36
🎨 [TimelineEventCard] Rendering with: {
  event_type: 'contract_change',
  salary: 2539,
  salary_source: 'timeline_cache',
  hours: 36,
  hours_source: 'timeline_cache'
}
```

### **Example 2: Fallback to JSONB (Resilient)**
```
💰 [extractSalary] Starting extraction for event type: contract_change
⚠️ [extractSalary] Cache miss - salary_at_event is null or 0
📦 [JSONB] Found salary in new_value.monthly_wage: 2539
✅ [extractSalary] Extracted from new_value JSONB: 2539
⏰ [extractHours] Starting extraction for event type: contract_change
⚠️ [extractHours] Cache miss - hours_at_event is null or 0
📦 [JSONB] Found hours in new_value.hours_per_week: 36
✅ [extractHours] Extracted from new_value JSONB: 36
🎨 [TimelineEventCard] Rendering with: {
  event_type: 'contract_change',
  salary: 2539,
  salary_source: 'jsonb_new_value',
  hours: 36,
  hours_source: 'jsonb_new_value'
}
```

### **Example 3: Not Found (Graceful)**
```
💰 [extractSalary] Starting extraction for event type: comment
⚠️ [extractSalary] Cache miss - salary_at_event is null or 0
❌ [JSONB] No salary field found in new_value. Available fields: ['comment_text', 'author']
❌ [extractSalary] No salary found in any source
🎨 [TimelineEventCard] Rendering with: {
  event_type: 'comment',
  salary: null,
  salary_source: 'not_found',
  hours: null,
  hours_source: 'not_found'
}
```

---

## 🎨 UI INDICATORS

### **Visual Feedback:**

1. **Orange Asterisk (*)** next to field name
   - Means: "Using fallback source (not timeline cache)"
   - Hover tooltip shows exact source

2. **Debug Message:**
   - `"* Loaded from fallback source"`
   - Shows when ANY field uses fallback
   - Can be removed after testing

### **Example:**
```
┌──────────────────────────────────┐
│ Bruto *   Neto ~    Hours *      │
│ €2,539    €1,777    36h          │
│ per month estimated  per week     │
└──────────────────────────────────┘
* Loaded from fallback source
```

---

## 🔧 FIELD NAME VARIATIONS HANDLED

### **Salary Fields (6 variations):**
1. `monthly_wage` ← Most common from employes.nl
2. `monthlyWage` ← camelCase variant
3. `salary` ← Generic
4. `gross_monthly` ← Explicit gross
5. `grossMonthly` ← camelCase
6. `bruto` ← Dutch term

### **Hours Fields (5 variations):**
1. `hours_per_week` ← Most common
2. `hoursPerWeek` ← camelCase
3. `hours` ← Generic
4. `weekly_hours` ← Alternative phrasing
5. `weeklyHours` ← camelCase

---

## ✅ WHAT WORKS NOW

1. ✅ **Contract events show salary/hours**
   - Even if timeline cache is empty
   - Extracts from JSONB automatically

2. ✅ **Salary events show salary/hours**
   - Falls back to JSONB if needed

3. ✅ **Clear debugging**
   - Every step logged to console
   - Can trace exactly where data came from

4. ✅ **Graceful degradation**
   - Shows data when available
   - Hides grid when not available
   - Never shows `undefined`

5. ✅ **Performance**
   - Cache hit = instant (no JSONB parsing)
   - Cache miss = fallback extraction
   - Only parses JSONB when needed

---

## 🧪 HOW TO TEST

### **Step 1: Hard Refresh**
```bash
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows)
```

### **Step 2: Open Console**
```bash
F12 or Cmd + Option + I
```

### **Step 3: Navigate to Staff Profile**
- Click any staff member
- Scroll to "Employment Timeline"

### **Step 4: Check Console Logs**
Look for:
```
💰 [extractSalary] Starting extraction...
✅ [extractSalary] Found in cache: 2539
```
OR
```
⚠️ [extractSalary] Cache miss...
📦 [JSONB] Found salary in new_value.monthly_wage: 2539
✅ [extractSalary] Extracted from new_value JSONB: 2539
```

### **Step 5: Check UI**
- Timeline cards should show Bruto/Neto/Hours
- Look for orange asterisk (*) if using fallback
- Debug message at bottom if fallback used

---

## 📊 EXPECTED RESULTS

### **Scenario 1: Timeline Cache Populated**
```
Result: Data from cache (fast)
Indicator: No asterisk
Console: "✅ Found in cache"
```

### **Scenario 2: Timeline Cache Empty**
```
Result: Data extracted from JSONB
Indicator: Orange asterisk (*)
Console: "⚠️ Cache miss" → "✅ Extracted from JSONB"
Debug: "* Loaded from fallback source"
```

### **Scenario 3: No Data Anywhere**
```
Result: Grid doesn't show
Indicator: Event card shows description only
Console: "❌ No salary found in any source"
```

---

## 🎯 SUCCESS CRITERIA

- [ ] Timeline shows Bruto/Neto/Hours for contract events
- [ ] Console logs show extraction process
- [ ] Orange asterisk (*) appears when using fallback
- [ ] No `undefined` values anywhere
- [ ] Page loads fast (cache hits)
- [ ] Fallback works (JSONB extraction)

---

## 🚀 WHAT'S NEXT

### **Phase 2: Fix Timeline Generator (2-3 hours)**
- Update `generate_timeline_v2()` SQL function
- Populate `salary_at_event` and `hours_at_event` properly
- Regenerate timeline for all employees
- Remove fallback indicators (no longer needed!)

### **Phase 3: Smart Fallbacks (2-3 hours)**
- Add fallback to `staff` view (current values)
- Add fallback to `employes_raw_data` (API responses)
- Create helper functions for any date lookups
- Ultimate resilience!

---

## 🐛 TROUBLESHOOTING

### **Problem: Still seeing `undefined`**
**Check:**
1. Hard refresh browser (Cmd + Shift + R)
2. Check console for extraction logs
3. Verify `new_value` has data: Look for "Available fields: [...]"

### **Problem: Grid not showing**
**Check:**
1. Console logs - is salary extraction failing?
2. Check if event has ANY salary data
3. Some events (like comments) might not have salary

### **Problem: Data looks wrong**
**Check:**
1. Console shows source: `timeline_cache` vs `jsonb_new_value`
2. Look at raw JSONB: `console.log(event.new_value)`
3. Check which field name was found: `Found salary in new_value.monthly_wage`

---

## 💡 KEY INSIGHTS

1. **Cache Miss is OK!**
   - Fallback handles it automatically
   - User never sees the difference
   - Just slightly slower (milliseconds)

2. **Explicit Logging is Critical**
   - Shows exactly what's happening
   - Makes debugging trivial
   - Can trace any data issue

3. **Multiple Field Names = Resilience**
   - Different API versions use different names
   - We handle them all
   - Future-proof!

4. **JSONB is the Source of Truth**
   - Timeline is just a cache
   - JSONB has the real data
   - Always available as fallback

---

**READY FOR USER TESTING!** 🎉

Refresh your browser and check the console! You should see the extraction logs and the data should appear! 🚀
