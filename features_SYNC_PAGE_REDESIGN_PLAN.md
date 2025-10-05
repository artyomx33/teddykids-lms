# 🔄 Employes Sync Page - Complete Redesign Plan

**Date**: October 5, 2025  
**Current Page**: `http://localhost:8080/employes-sync`  
**Goal**: Clean, simple, powerful sync interface for the new temporal architecture

---

## 🎯 DESIGN PHILOSOPHY

**Old System**: Multiple buttons, complex comparisons, staging areas, manual syncs  
**New System**: ONE button, automatic everything, clear progress, simple logs

### Core Principles:
1. **Simplicity**: One sync button does everything
2. **Transparency**: Clear progress and detailed logs
3. **Confidence**: Visual confirmation of what's happening
4. **Minimal Interaction**: System handles complexity automatically

---

## 🗑️ WHAT TO REMOVE

### Components to Delete:
1. ❌ **`EmployesSyncDashboard`** - Too complex, manual comparisons
2. ❌ **`EmployesDataFetcher`** - Replaced by microservices
3. ❌ **`ComplianceAlertsPanel`** - Move to staff profiles (not sync page)
4. ❌ **`UnifiedDataTester`** - Dev tool, not production UI
5. ❌ **`UnifiedSyncPanel`** - Old sync logic, replace entirely

### Old Concepts to Remove:
- ❌ "Staging" data
- ❌ Manual employee-by-employee sync
- ❌ Separate "Compare Staff" button
- ❌ "Sync Contracts" / "Sync Wages" separate buttons
- ❌ Connection testing UI (auto-detect in background)

---

## 🎨 NEW PAGE DESIGN

### Layout Structure:
```
┌─────────────────────────────────────────────────────┐
│  📊 Employes.nl Data Sync                           │
│  Keep your employee data fresh and accurate         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📈 SYNC STATUS                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Last Sync: 2 hours ago                     │   │
│  │  Status: ✅ All data current                │   │
│  │  Employees: 110 synced                      │   │
│  │  Changes Detected: 3 salary updates         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [🔄 Sync Now]  [📋 View Full Log]                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  🔄 SYNC PROGRESS (when running)                    │
│  ┌─────────────────────────────────────────────┐   │
│  │  ████████████████░░░░░░░░░░  60%            │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ✅ Snapshot collected (110 employees)             │
│  ✅ History collected (99 employees)               │
│  🔄 Detecting changes...                           │
│  ⏳ Updating database...                           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📋 RECENT CHANGES (last 24 hours)                  │
│  ┌─────────────────────────────────────────────┐   │
│  │  🔸 Alena Masselink                         │   │
│  │     Salary: €2,777 → €2,846/mo              │   │
│  │     2 hours ago                             │   │
│  ├─────────────────────────────────────────────┤   │
│  │  🔸 Jan de Vries                            │   │
│  │     Hours: 32 → 36 hrs/week                 │   │
│  │     5 hours ago                             │   │
│  ├─────────────────────────────────────────────┤   │
│  │  🔸 Maria Gonzalez                          │   │
│  │     Contract: Fixed-term → Permanent        │   │
│  │     1 day ago                               │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [View All Changes →]                              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📊 SYNC STATISTICS                                 │
│  ┌──────────────┬──────────────┬──────────────┐    │
│  │  Employees   │  Changes     │  Errors      │    │
│  │  110         │  247         │  0           │    │
│  └──────────────┴──────────────┴──────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 NEW SYNC LOGIC (WHAT HAPPENS WHEN YOU CLICK "SYNC NOW")

### Phase 1: Snapshot Collection (Step 1 of 4)
**Microservice**: `employes-snapshot-collector`  
**What it does**:
1. Calls `GET /v4/{companyId}/employees` (list all)
2. For each employee, calls `GET /v4/{companyId}/employees/{id}` (current state)
3. Stores in `employes_raw_data` with `endpoint='/employee'`
4. Marks `is_latest=true`, sets `collected_at=NOW()`

**Data Captured**:
- Current name, email, phone, address
- Current employment status
- Current position/department
- Personal info (BSN, IBAN, birthdate)

**Progress**: "Collecting current employee data... (110/110)"

---

### Phase 2: History Collection (Step 2 of 4)
**Microservice**: `employes-history-collector`  
**What it does**:
1. For each employee, calls `GET /v4/{companyId}/employees/{id}/employments`
2. Stores COMPLETE history in `employes_raw_data` with `endpoint='/employments'`
3. Marks `is_latest=true`, sets `collected_at=NOW()`

**Data Captured** (nested arrays):
- **Salary history**: All salary periods with start dates, hourly/monthly/yearly wages
- **Hours history**: All working hours changes with start dates
- **Contract history**: All contracts with start/end dates, type (permanent/fixed-term)
- **Tax details**: Tax reduction periods

**Progress**: "Collecting employment history... (99/110)"  
**Note**: Some employees may have no history (inactive/terminated)

---

### Phase 3: Change Detection (Step 3 of 4)
**Microservice**: `employes-change-detector`  
**What it does**:
1. Compares new data with previous `is_latest=true` records
2. Detects changes in:
   - Salary (hourly/monthly/yearly)
   - Working hours (hours per week, days per week)
   - Contract type (permanent/fixed-term)
   - Employment status (active/inactive/terminated)
   - Personal info (address, phone, email)
3. Creates records in `employes_changes` table with:
   - `change_type`: "salary_increase", "hours_change", "contract_renewal", etc.
   - `field_name`: "monthly_wage", "hours_per_week", etc.
   - `old_value` and `new_value`
   - `business_impact`: Human-readable description
   - `metadata`: Additional context (JSON)

**Progress**: "Analyzing changes... (247 changes detected)"

---

### Phase 4: Database Update (Step 4 of 4)
**What happens**:
1. Old records marked `is_latest=false`
2. New records marked `is_latest=true`
3. `employes_timeline` materialized view refreshed
4. Sync session logged in `employes_sync_sessions`
5. Individual operations logged in `employes_sync_logs`

**Progress**: "Updating database... Done!"

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────────┐
│  Employes.nl    │
│  API            │
└────────┬────────┘
         │
         ├─── GET /employees ──────────────┐
         │                                  │
         ├─── GET /employees/{id} ─────────┤
         │    (for each employee)          │
         │                                  ▼
         │                          ┌──────────────────┐
         │                          │  Snapshot        │
         │                          │  Collector       │
         │                          └────────┬─────────┘
         │                                   │
         ├─── GET /employees/{id}/          │
         │    employments ───────────────────┤
         │    (for each employee)           │
         │                                  ▼
         │                          ┌──────────────────┐
         │                          │  History         │
         │                          │  Collector       │
         │                          └────────┬─────────┘
         │                                   │
         │                                   ▼
         │                          ┌──────────────────┐
         │                          │  employes_       │
         │                          │  raw_data        │
         │                          │  (ALL versions)  │
         │                          └────────┬─────────┘
         │                                   │
         │                                   ▼
         │                          ┌──────────────────┐
         │                          │  Change          │
         │                          │  Detector        │
         │                          └────────┬─────────┘
         │                                   │
         │                                   ├───► employes_changes
         │                                   │     (detected changes)
         │                                   │
         │                                   └───► employes_timeline
         │                                         (materialized view)
         │
         ▼
┌─────────────────────────────────────────┐
│  Frontend UI                            │
│  - Shows progress                       │
│  - Displays recent changes              │
│  - Shows statistics                     │
└─────────────────────────────────────────┘
```

---

## 🎨 COMPONENT STRUCTURE

### New Components to Create:

#### 1. `EmployesSyncControl.tsx` (Main Component)
**Purpose**: The ONE sync button and status display  
**Features**:
- Big "Sync Now" button
- Last sync timestamp
- Current status badge (✅ Current / ⚠️ Outdated / 🔄 Syncing)
- Employee count
- Recent changes count

#### 2. `SyncProgressPanel.tsx`
**Purpose**: Real-time progress during sync  
**Features**:
- Progress bar (0-100%)
- Current step indicator (1/4, 2/4, 3/4, 4/4)
- Step-by-step status (✅ Done, 🔄 In Progress, ⏳ Waiting)
- Live count updates (e.g., "99/110 employees")
- Estimated time remaining

#### 3. `RecentChangesPanel.tsx`
**Purpose**: Show last 24 hours of detected changes  
**Features**:
- List of changes from `employes_changes` table
- Grouped by employee
- Icons for change type (💰 salary, ⏰ hours, 📄 contract)
- Human-readable descriptions from `business_impact`
- Timestamp ("2 hours ago")
- Link to staff profile

#### 4. `SyncStatisticsPanel.tsx`
**Purpose**: High-level metrics  
**Features**:
- Total employees synced
- Total changes detected (all time)
- Error count (should be 0!)
- Last sync timestamp
- Success rate

#### 5. `SyncLogViewer.tsx` (Modal/Drawer)
**Purpose**: Detailed technical log for debugging  
**Features**:
- Full `employes_sync_logs` table
- Filterable by date, operation, status
- Expandable rows for error details
- Export to CSV/JSON

---

## 🔧 TECHNICAL IMPLEMENTATION

### API Endpoints to Call:

#### 1. Trigger Sync
```typescript
POST /functions/v1/employes-snapshot-collector
→ Returns: { session_id, status: "started" }

POST /functions/v1/employes-history-collector  
→ Returns: { session_id, status: "started" }

POST /functions/v1/employes-change-detector
→ Returns: { changes_detected, status: "completed" }
```

#### 2. Get Sync Status
```typescript
// Query employes_sync_sessions table
SELECT * FROM employes_sync_sessions 
ORDER BY started_at DESC 
LIMIT 1;

// Returns:
{
  id: "uuid",
  started_at: "2025-10-05T14:30:00Z",
  completed_at: "2025-10-05T14:32:15Z",
  status: "completed",
  employees_processed: 110,
  changes_detected: 3,
  errors_count: 0
}
```

#### 3. Get Recent Changes
```typescript
// Query employes_changes table
SELECT * FROM employes_changes 
WHERE detected_at > NOW() - INTERVAL '24 hours'
ORDER BY detected_at DESC
LIMIT 20;

// Returns array of changes with business_impact
```

#### 4. Get Statistics
```typescript
// Aggregate queries
SELECT 
  COUNT(DISTINCT employee_id) as total_employees,
  COUNT(*) as total_changes,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as errors
FROM employes_raw_data
WHERE is_latest = true;
```

---

## 🎯 USER EXPERIENCE FLOW

### Scenario 1: First Time User
1. User lands on `/employes-sync`
2. Sees: "No sync yet. Click 'Sync Now' to get started."
3. Clicks "Sync Now"
4. Progress panel appears with 4 steps
5. Watches progress bars fill (satisfying!)
6. After ~2 minutes: "✅ Sync completed! 110 employees, 0 changes (first sync)"
7. Statistics panel shows totals

### Scenario 2: Regular Sync (Daily)
1. User lands on `/employes-sync`
2. Sees: "Last sync: 23 hours ago. Status: ⚠️ Outdated"
3. Sees: "Recent Changes: 3" (preview of what's new)
4. Clicks "Sync Now"
5. Progress shows: Snapshot (fast), History (slower), Changes (fast), Update (fast)
6. After ~1 minute: "✅ Sync completed! 110 employees, 3 changes detected"
7. Recent Changes panel shows:
   - Alena: Salary increase
   - Jan: Hours change
   - Maria: Contract renewal

### Scenario 3: Sync Already Running
1. User lands on `/employes-sync`
2. Sees: "🔄 Sync in progress... (Step 2/4)"
3. Progress bar at 45%
4. "Sync Now" button is disabled
5. Can watch progress in real-time
6. Can navigate away and come back (sync continues in background)

---

## 📋 ACCEPTANCE CRITERIA

### Must Have:
- ✅ One "Sync Now" button that triggers everything
- ✅ Real-time progress indicator (4 steps)
- ✅ Last sync timestamp display
- ✅ Recent changes list (last 24 hours)
- ✅ Basic statistics (employees, changes, errors)
- ✅ Error handling (show errors if sync fails)

### Nice to Have:
- 🎯 Auto-sync schedule (e.g., every 6 hours)
- 🎯 Email notifications on sync completion
- 🎯 Detailed log viewer (modal)
- 🎯 Export sync reports
- 🎯 Sync history timeline

### Not Needed:
- ❌ Manual employee selection
- ❌ Staging/preview mode
- ❌ Connection testing UI
- ❌ Separate sync buttons for contracts/wages
- ❌ Comparison tables

---

## 🚀 IMPLEMENTATION STEPS

### Step 1: Create New Components ✅ NEXT
1. Create `EmployesSyncControl.tsx`
2. Create `SyncProgressPanel.tsx`
3. Create `RecentChangesPanel.tsx`
4. Create `SyncStatisticsPanel.tsx`

### Step 2: Update Page
1. Replace `EmployesSync.tsx` with new simple layout
2. Remove all old components
3. Add new components

### Step 3: Add Real-Time Updates
1. Use Supabase Realtime to watch `employes_sync_sessions`
2. Update progress bar as sync runs
3. Refresh changes list when sync completes

### Step 4: Polish & Test
1. Add loading states
2. Add error states
3. Add empty states
4. Test with real sync

---

## 🎨 VISUAL MOCKUP (ASCII)

```
╔═══════════════════════════════════════════════════════════╗
║  📊 Employes.nl Data Sync                                 ║
║  Keep your employee data fresh and accurate               ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║  📈 SYNC STATUS                                           ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │  Last Sync: 2 hours ago                             │ ║
║  │  Status: ✅ All data current                        │ ║
║  │  Employees: 110 synced                              │ ║
║  │  Changes Detected: 3 salary updates                 │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  ┌──────────────────┐  ┌──────────────────┐             ║
║  │  🔄 Sync Now     │  │  📋 View Log     │             ║
║  └──────────────────┘  └──────────────────┘             ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║  📋 RECENT CHANGES (last 24 hours)                        ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │  💰 Alena Masselink                                 │ ║
║  │     Salary: €2,777 → €2,846/mo (+2.5%)              │ ║
║  │     2 hours ago                                     │ ║
║  ├─────────────────────────────────────────────────────┤ ║
║  │  ⏰ Jan de Vries                                    │ ║
║  │     Hours: 32 → 36 hrs/week (+12.5%)                │ ║
║  │     5 hours ago                                     │ ║
║  ├─────────────────────────────────────────────────────┤ ║
║  │  📄 Maria Gonzalez                                  │ ║
║  │     Contract: Fixed-term → Permanent                │ ║
║  │     1 day ago                                       │ ║
║  └─────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🎓 KEY INSIGHTS

### Why This Design Works:
1. **One Button**: Users don't need to understand microservices - just click sync
2. **Automatic**: System handles all complexity (snapshot → history → changes → update)
3. **Transparent**: Progress shows exactly what's happening
4. **Informative**: Recent changes show business value (not technical details)
5. **Trustworthy**: Statistics prove system is working

### What We Learned:
- Old system was too complex (staging, manual comparisons, multiple buttons)
- Users want **results** not **controls**
- Progress indicators build confidence
- Change detection is the **real value** - show it prominently!

---

**Ready to implement?** Let's start with Step 1! 🚀
