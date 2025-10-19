# 🔍 DUPLICATE ANALYSIS - Current State

## 📊 Current Data Flow

### **When Sync Runs:**

1. **Snapshot Collector** (`hyper-endpoint`)
   - Fetches from `/employees` endpoint
   - Stores in `employes_raw_data`
   - **PROBLEM**: Always INSERTs new records, never checks if data changed

2. **History Collector** (`rapid-responder`)  
   - Fetches from `/employments` endpoint
   - Also stores in `employes_raw_data`
   - **PROBLEM**: Same issue - always INSERTs

3. **Change Detector** (`dynamic-function`)
   - Reads from `employes_raw_data` 
   - Compares latest vs previous for SAME endpoint
   - Inserts into `employes_changes`
   - **WORKING**: Has duplicate prevention logic

4. **Timeline Generator** (trigger)
   - Auto-runs when `employes_changes` gets new records
   - Creates `employes_timeline_v2` entries
   - **WORKING**: Only processes non-duplicate changes

---

## 🐛 THE ISSUE

### **Root Cause:**
Every sync creates NEW `employes_raw_data` records, even if the API data hasn't changed!

### **What's Happening:**
1. Sync runs → New raw_data records created
2. Change detector compares Record N vs Record N-1
3. If data is identical → 0 changes detected ✅
4. BUT we're accumulating duplicate raw_data records! ❌

### **Impact:**
- `employes_raw_data` table grows unnecessarily
- Storage waste
- Slower queries over time
- But NO duplicate changes or timeline events (good!)

---

## 💡 SOLUTIONS

### **Option A: Smart Raw Data Storage** (Recommended)
Modify snapshot/history collectors to:
1. Calculate hash of API response
2. Check if identical hash exists for same employee/endpoint
3. Only INSERT if data actually changed
4. Otherwise, update `last_verified_at` on existing record

**Pros:**
- Minimal storage growth
- Efficient
- Still tracks "we checked and nothing changed"

**Cons:**
- Need to modify Edge Functions

### **Option B: Periodic Cleanup**
Keep current behavior but add cleanup:
1. Scheduled function to remove duplicate raw_data
2. Keep only unique data_hash per employee/endpoint
3. Preserve first and latest occurrence

**Pros:**
- No changes to sync logic
- Can implement separately

**Cons:**
- Temporary storage waste
- Need another scheduled job

### **Option C: Add Deduplication at DB Level**
Use PostgreSQL UPSERT with ON CONFLICT:
1. Add unique index on (employee_id, endpoint, data_hash)
2. Use INSERT ... ON CONFLICT DO UPDATE
3. Just update timestamps if duplicate

**Pros:**
- Database enforces uniqueness
- No duplicate data possible

**Cons:**
- Index on large JSON hash column
- Might hit index size limits

---

## 🎯 IMMEDIATE FIX

Let's check current state first:

```sql
-- Check raw data duplicates
WITH duplicate_check AS (
  SELECT 
    employee_id,
    endpoint,
    data_hash,
    COUNT(*) as occurrences,
    MIN(collected_at) as first_seen,
    MAX(collected_at) as last_seen
  FROM employes_raw_data
  GROUP BY employee_id, endpoint, data_hash
  HAVING COUNT(*) > 1
)
SELECT 
  COUNT(*) as duplicate_groups,
  SUM(occurrences - 1) as redundant_records
FROM duplicate_check;
```

---

## 📋 RECOMMENDATION

**Go with Option A** - Modify the collectors to be smarter:

1. Before INSERT, check if same data_hash exists
2. If yes, just update `last_verified_at`
3. If no, INSERT new record
4. This way we track "checks" without storing duplicates

Want me to implement this fix?
