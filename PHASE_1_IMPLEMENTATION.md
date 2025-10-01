# Phase 1: Background Data Collection System - Implementation Complete ✅

## Overview
Phase 1 implements a comprehensive data collection system that captures ALL data from Employes.nl API for all 117 employees and stores it with complete change tracking and historical snapshots.

## What Was Implemented

### 1. Database Tables ✅
Created 4 new tables to support the data collection system:

#### `employes_raw_data`
- Stores raw API responses from all endpoints
- Includes `data_hash` for change detection
- `is_latest` flag to mark current data
- Full JSONB storage of API responses

#### `employes_data_snapshots`
- Tracks each data collection run
- Records progress (employees_processed / total_employees)
- Stores endpoints collected and errors encountered
- Status tracking (running/completed/failed)

#### `employes_change_detection`
- Identifies what data changed between snapshots
- Stores both previous and new data for comparison
- Marks changes as processed/unprocessed for merge queue
- Links to snapshot for historical tracking

#### `employes_background_jobs`
- Manages asynchronous data collection tasks
- Priority-based queue system
- Progress tracking with metadata
- Scheduled execution support

### 2. Enhanced Edge Function ✅
Extended `supabase/functions/employes-integration/index.ts` with:

#### New Action: `collect_comprehensive_data`
Orchestrates complete data collection for all employees from ALL endpoints:

**Endpoints Collected Per Employee:**
- `/employee` - Basic employee information
- `/employments` - Employment history and contracts
- `/payslips` - Salary and payslip data
- `/contracts` - Contract details
- `/absences` - Absence records
- `/hours` - Hour tracking
- `/documents` - Document information

**Company-Wide Data:**
- `/payruns` - Company payrun information

#### Key Functions:
- `calculateDataHash()` - SHA-256 hashing for change detection
- `storeRawData()` - Stores API responses with deduplication
- `detectChanges()` - Logs changes to change_detection table
- `collectEmployeeData()` - Collects all endpoints for one employee
- `runComprehensiveDataCollection()` - Main orchestrator

### 3. UI Component ✅
Created `ComprehensiveDataCollector.tsx`:
- One-click data collection trigger
- Real-time progress tracking
- Snapshot status display
- Error reporting
- Live polling during collection

### 4. Integration ✅
Added to Employes Sync page (`/employes-sync`):
- Positioned at top as Phase 1 priority
- Connected to edge function
- Real-time updates via React Query

---

## How It Works

### Data Collection Flow

```
1. User clicks "Start Comprehensive Data Collection"
   ↓
2. Creates snapshot record (status: running)
   ↓
3. Fetches all 117 employees from Employes.nl
   ↓
4. For EACH employee:
   - Fetch all 7 endpoints
   - Calculate hash of response
   - Compare with previous hash (if exists)
   - If changed:
     * Store new raw_data
     * Log change to change_detection
   - Update progress every 10 employees
   ↓
5. Collect company-wide payruns data
   ↓
6. Mark snapshot as completed
   ↓
7. Return summary with stats
```

### Change Detection Algorithm

```typescript
1. Fetch new data from API
2. Calculate SHA-256 hash of JSON response
3. Query latest data for same employee/endpoint
4. Compare hashes:
   - If no previous data → Mark as "new"
   - If hash different → Mark as "updated"
   - If hash same → Skip (no change)
5. Store change in change_detection table
```

---

## How to Use

### Via UI (Recommended)
1. Navigate to `/employes-sync`
2. Find "Phase 1: Comprehensive Data Collection" card at top
3. Click "Start Comprehensive Data Collection"
4. Monitor progress in real-time
5. Review results when complete

### Via Edge Function (Direct)
```typescript
const { data, error } = await supabase.functions.invoke('employes-integration', {
  body: { action: 'collect_comprehensive_data' }
});

console.log('Employees processed:', data.employees_processed);
console.log('Snapshot ID:', data.snapshot_id);
```

---

## Database Queries

### View Latest Snapshot
```sql
SELECT * FROM employes_data_snapshots
ORDER BY created_at DESC
LIMIT 1;
```

### View All Changes Detected
```sql
SELECT 
  employee_id,
  endpoint,
  change_type,
  detected_at
FROM employes_change_detection
WHERE processed = false
ORDER BY detected_at DESC;
```

### View Raw Data for Specific Employee
```sql
SELECT 
  endpoint,
  collected_at,
  is_latest
FROM employes_raw_data
WHERE employee_id = 'EMPLOYEE_ID_HERE'
  AND is_latest = true;
```

### Count Total Data Points Collected
```sql
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT employee_id) as unique_employees,
  COUNT(DISTINCT endpoint) as unique_endpoints
FROM employes_raw_data
WHERE is_latest = true;
```

---

## Expected Results

### First Run (Cold Start)
- **Duration:** ~5-10 minutes
- **Employees:** 117
- **Endpoints per employee:** 7
- **Total API calls:** ~819 (117 × 7 + company data)
- **Changes detected:** ~819 (all new)
- **Raw data records:** ~819

### Subsequent Runs (Incremental)
- **Duration:** ~5-10 minutes (same, all endpoints checked)
- **Changes detected:** Only modified data
- **Storage:** Only changed data creates new records
- **Old data:** Marked as `is_latest = false`

---

## Benefits

### ✅ Complete Data Capture
- No data loss - everything from Employes.nl is stored
- Full audit trail of all API responses
- Historical snapshots for time-travel queries

### ✅ Efficient Change Detection
- Hash-based comparison (fast!)
- Only stores changed data
- Automatic deduplication

### ✅ Independent from LMS Tables
- Raw data separate from processed data
- Can rebuild LMS tables at any time from raw data
- Safe to truncate staff/contracts tables

### ✅ Background Processing Ready
- Designed for scheduled runs (nightly)
- Non-blocking for UI
- Progress tracking built-in

### ✅ Merge Preparation
- Change detection feeds into merge process
- Unprocessed changes queue for Phase 2
- Complete before/after comparison available

---

## Next Steps: Phase 2

With Phase 1 complete, we can now:

1. **Implement Merge Logic**
   - Read from `employes_change_detection`
   - Compare with LMS `staff`/`contracts` tables
   - Apply changes with conflict resolution

2. **Scheduled Background Jobs**
   - Set up nightly collection runs
   - Use `employes_background_jobs` table
   - Automatic change detection

3. **Consolidate Staff Profile**
   - Unified view of all employee data
   - Timeline visualization
   - Data source attribution

---

## Troubleshooting

### Collection Stuck at "Running"
```sql
-- Check snapshot status
SELECT * FROM employes_data_snapshots 
WHERE status = 'running' 
ORDER BY created_at DESC LIMIT 1;

-- Manually mark as failed if needed
UPDATE employes_data_snapshots 
SET status = 'failed', 
    completed_at = NOW()
WHERE id = 'SNAPSHOT_ID';
```

### Check Edge Function Logs
1. Go to Supabase Dashboard
2. Navigate to Edge Functions → employes-integration → Logs
3. Look for errors during collection
4. Check "Comprehensive collection failed" messages

### Verify API Key
```sql
-- Test connection first
SELECT * FROM employes_sync_logs
WHERE action LIKE '%connection%'
ORDER BY created_at DESC LIMIT 5;
```

---

## Performance Metrics

### Storage Requirements
- **Per employee raw data:** ~50-200 KB (JSON)
- **Total storage per snapshot:** ~6-23 MB (117 employees)
- **Historical snapshots:** Add ~6-23 MB per snapshot

### Recommended Retention
- Keep latest 30 snapshots (1 month daily)
- Archive older snapshots to cold storage
- Prune `is_latest = false` data after 90 days

---

## Security Notes

✅ **RLS Policies Applied:**
- Only admins can read/write raw data
- Only admins can manage snapshots
- Only admins can view change detection

✅ **API Key Protection:**
- Stored in Supabase secrets
- Never exposed to client
- Used only in edge function

✅ **Data Encryption:**
- At rest in Supabase
- In transit via HTTPS
- Proper CORS configuration

---

## Summary

**Phase 1 Status:** ✅ **COMPLETE**

**What's Working:**
- ✅ Comprehensive data collection from all endpoints
- ✅ Change detection with SHA-256 hashing
- ✅ Snapshot tracking with progress updates
- ✅ UI trigger with real-time monitoring
- ✅ Raw data storage with deduplication
- ✅ Ready for Phase 2 merge implementation

**Next:** Phase 2 - Staff Profile Consolidation & Change Merging

---

## Quick Reference

### Action Name
`collect_comprehensive_data`

### Database Tables
- `employes_raw_data`
- `employes_data_snapshots`
- `employes_change_detection`
- `employes_background_jobs`

### UI Location
`/employes-sync` → Top card

### Edge Function
`supabase/functions/employes-integration/index.ts`

### Component
`src/components/employes/ComprehensiveDataCollector.tsx`
