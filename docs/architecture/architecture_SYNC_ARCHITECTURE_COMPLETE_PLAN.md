# 🏗️ Complete Sync Architecture - Manual + Scheduled

**Date**: October 5, 2025  
**Goal**: Support BOTH manual sync (UI button) AND automatic scheduled sync  
**Status**: Planning Phase

---

## 🎯 THE BIG PICTURE

### Two Sync Triggers:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  1️⃣ MANUAL SYNC (User clicks button)              │
│     Frontend → employes-sync-trigger → 3 functions │
│                                                     │
│  2️⃣ SCHEDULED SYNC (Automatic, e.g., every 6h)    │
│     Supabase Cron → employes-sync-trigger → 3 fns  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Key Insight:** SAME orchestrator function, TWO different triggers!

---

## 🔄 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│  TRIGGER LAYER                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  A) Manual Trigger (NOW)                                   │
│     Frontend UI Button                                     │
│     └─> POST /functions/v1/employes-sync-trigger          │
│                                                             │
│  B) Scheduled Trigger (LATER)                              │
│     Supabase pg_cron                                       │
│     └─> SELECT net.http_post(                              │
│           url := 'https://.../employes-sync-trigger',      │
│           body := '{"source":"scheduler"}'                 │
│         )                                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR LAYER                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  employes-sync-trigger                                     │
│  ├─ Creates sync session                                   │
│  ├─ Calls snapshot collector                               │
│  ├─ Calls history collector                                │
│  ├─ Calls change detector                                  │
│  └─ Updates sync session (completed/error)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  WORKER LAYER                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. employes-snapshot-collector                            │
│     └─> Fetches current employee data                      │
│                                                             │
│  2. employes-history-collector                             │
│     └─> Fetches employment history                         │
│                                                             │
│  3. employes-change-detector                               │
│     └─> Detects and records changes                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  DATA LAYER                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • employes_raw_data (all versions)                        │
│  • employes_changes (detected changes)                     │
│  • employes_timeline (materialized view)                   │
│  • employes_sync_sessions (tracking)                       │
│  • employes_sync_logs (detailed logs)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 IMPLEMENTATION PLAN

### **PHASE 1: Fix Manual Sync (NOW)** ⭐

#### Step 1.1: Create Master Orchestrator Function
**File**: `supabase/functions/employes-sync-trigger/index.ts`

**Purpose**: 
- Single entry point for ALL sync operations
- Can be called from frontend OR scheduler
- Orchestrates the 3 worker functions
- Tracks sync sessions

**Features**:
- ✅ CORS headers (for frontend)
- ✅ Session tracking
- ✅ Sequential function calls
- ✅ Error handling
- ✅ Source tracking (manual vs scheduled)

---

#### Step 1.2: Update Frontend
**File**: `src/components/employes/EmployesSyncControl.tsx`

**Change**:
```typescript
// Call the orchestrator
const { data, error } = await supabase.functions.invoke('employes-sync-trigger', {
  body: { source: 'manual', triggered_by: user.email }
});
```

---

#### Step 1.3: Test Manual Sync
- Click "Sync Now" button
- Verify all 3 functions run
- Check data is collected
- Verify changes are detected

---

### **PHASE 2: Add Scheduled Sync (LATER)** 🕐

#### Step 2.1: Create Database Cron Job
**File**: `supabase/migrations/20251006000010_add_sync_scheduler.sql`

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule sync every 6 hours
SELECT cron.schedule(
  'employes-sync-every-6h',           -- Job name
  '0 */6 * * *',                       -- Cron expression (every 6 hours)
  $$
  SELECT net.http_post(
    url := 'https://gjlgaufihseaagzmidhc.supabase.co/functions/v1/employes-sync-trigger',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'source', 'scheduler',
      'triggered_by', 'system'
    )
  );
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;
```

**Cron Schedule Options**:
- `0 */6 * * *` - Every 6 hours
- `0 */4 * * *` - Every 4 hours
- `0 9,15,21 * * *` - 3 times daily (9am, 3pm, 9pm)
- `0 2 * * *` - Daily at 2am

---

#### Step 2.2: Add Scheduler Status to Frontend
**File**: `src/components/employes/EmployesSyncControl.tsx`

Add indicator showing:
- ✅ "Auto-sync enabled (every 6 hours)"
- ⏰ "Next scheduled sync: in 3 hours"

---

#### Step 2.3: Add Scheduler Management UI (Optional)
**File**: `src/components/employes/SyncSchedulerSettings.tsx`

Features:
- Enable/disable auto-sync
- Change frequency (4h, 6h, 12h, daily)
- View next scheduled run
- View scheduler history

---

## 🔑 KEY DESIGN DECISIONS

### Decision 1: One Orchestrator, Multiple Triggers ✅
**Why?**
- DRY principle (Don't Repeat Yourself)
- Same logic for manual and scheduled
- Easier to maintain
- Consistent behavior

**Alternative (Rejected):**
- Separate functions for manual vs scheduled
- ❌ Code duplication
- ❌ Harder to keep in sync

---

### Decision 2: Track Sync Source ✅
**Why?**
- Know if sync was manual or automatic
- Better debugging
- Analytics (how often users manually sync?)

**Implementation:**
```typescript
// In employes_sync_sessions table
{
  id: "uuid",
  source: "manual" | "scheduler",
  triggered_by: "user@example.com" | "system",
  started_at: "timestamp",
  completed_at: "timestamp",
  status: "running" | "completed" | "error"
}
```

---

### Decision 3: Frontend Calls Orchestrator, Not Workers ✅
**Why?**
- Frontend doesn't need to know about 3 functions
- Orchestrator handles complexity
- Easier to add more steps later

**Alternative (Rejected):**
- Frontend calls 3 functions directly
- ❌ More complex frontend code
- ❌ Harder to add steps
- ❌ No central tracking

---

## 🛠️ IMPLEMENTATION STEPS (DETAILED)

### **NOW: Phase 1 - Manual Sync**

#### Step 1: Create Orchestrator Function
```bash
# Create function directory
mkdir -p supabase/functions/employes-sync-trigger

# Create index.ts (see full code below)
# Create deno.json
```

#### Step 2: Deploy Function
```bash
npx supabase functions deploy employes-sync-trigger
```

#### Step 3: Update Frontend
- Change function name from slugs to `employes-sync-trigger`
- Add source tracking
- Test sync button

#### Step 4: Test & Verify
- Click "Sync Now"
- Check console for errors
- Verify data in database
- Check Recent Changes panel

---

### **LATER: Phase 2 - Scheduled Sync**

#### Step 1: Create Migration for Cron Job
```bash
# Create migration file
npx supabase migration new add_sync_scheduler

# Add cron job SQL (see above)
```

#### Step 2: Deploy Migration
```bash
npx supabase db push
```

#### Step 3: Verify Scheduler
```sql
-- Check scheduled jobs
SELECT * FROM cron.job;

-- Check job runs
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

#### Step 4: Add UI Indicator
- Show "Auto-sync enabled"
- Show next scheduled run
- Optional: Add settings panel

---

## 📊 COMPARISON: Manual vs Scheduled

| Feature | Manual Sync | Scheduled Sync |
|---------|-------------|----------------|
| **Trigger** | User clicks button | Cron job |
| **Frequency** | On-demand | Every 6 hours |
| **Source** | `manual` | `scheduler` |
| **Triggered By** | User email | `system` |
| **CORS Required** | ✅ Yes | ❌ No |
| **User Feedback** | Immediate | Background |
| **Use Case** | Check for updates now | Keep data fresh automatically |

---

## 🎯 CURRENT PRIORITY: PHASE 1 ONLY

### What We're Building NOW:
1. ✅ Master orchestrator function (`employes-sync-trigger`)
2. ✅ Frontend calls orchestrator
3. ✅ Manual sync works from UI button
4. ✅ CORS headers for browser access

### What We're Building LATER:
1. ⏳ Cron job scheduler
2. ⏳ Auto-sync every 6 hours
3. ⏳ Scheduler status UI
4. ⏳ Scheduler settings panel

---

## 📝 IMMEDIATE ACTION ITEMS

### To Fix CORS Error and Enable Manual Sync:

1. **Create `employes-sync-trigger` function** ⭐ START HERE
   - Add CORS headers
   - Orchestrate 3 worker functions
   - Track sync sessions
   - Handle errors

2. **Update `EmployesSyncControl.tsx`**
   - Call `employes-sync-trigger` instead of individual functions
   - Add source tracking
   - Test sync button

3. **Test Manual Sync**
   - Click "Sync Now"
   - Verify data flows
   - Check Recent Changes

4. **Document for Future**
   - Save scheduler SQL for Phase 2
   - Document cron setup steps
   - Plan scheduler UI

---

## 🎓 KEY INSIGHTS

### Why This Architecture?
1. **Separation of Concerns**: Triggers vs Orchestration vs Workers
2. **Flexibility**: Same orchestrator, multiple triggers
3. **Maintainability**: One place to change sync logic
4. **Scalability**: Easy to add more triggers (webhooks, API, etc.)

### Future Possibilities:
- 🔔 Webhook trigger (external system calls sync)
- 🔌 API endpoint (public API for partners)
- 📱 Mobile app trigger
- 🤖 Slack command trigger

**All use the SAME orchestrator!**

---

## ✅ SUCCESS CRITERIA

### Phase 1 (NOW):
- ✅ User clicks "Sync Now" button
- ✅ All 3 functions run successfully
- ✅ Data is collected and stored
- ✅ Changes are detected
- ✅ Recent Changes panel updates
- ✅ No CORS errors

### Phase 2 (LATER):
- ✅ Cron job runs every 6 hours
- ✅ Sync happens automatically
- ✅ No manual intervention needed
- ✅ UI shows scheduler status
- ✅ Logs track scheduled runs

---

**Ready to implement Phase 1?** Let's create the orchestrator function! 🚀
