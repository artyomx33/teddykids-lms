# 🗺️ REFACTOR CONNECTION MAP - OLD vs NEW

**Date:** October 5, 2025  
**Status:** In Progress - Need to reconnect frontend to new microservices

---

## 📍 WHERE WE ARE NOW

### ✅ COMPLETED:
1. **Database Schema** - Temporal architecture deployed
2. **Microservices** - 3 new functions deployed and working
3. **Data Collection** - 102 employees with full history + 234 changes detected
4. **Change Detection** - Working perfectly (salary, hours, contracts)

### 🔄 NEEDS RECONNECTION:
- Frontend still calls OLD monolithic `employes-integration` function
- Need to update UI to call NEW microservices

---

## 🔌 OLD ARCHITECTURE (What Frontend Currently Uses)

### Old Edge Function: `employes-integration`
**Endpoint:** `supabase.functions.invoke('employes-integration', { body: { action: 'xxx' }})`

**Actions Used by Frontend:**
1. ✅ `test_connection` - Test API connectivity
2. ✅ `fetch_companies` - Get company list
3. ✅ `fetch_employees` - Get all employees (current snapshot)
4. ✅ `sync_employees` - Sync employees to database
5. ✅ `sync_wage_data` - Sync wage data
6. ✅ `sync_from_employes` - Full sync
7. ✅ `sync_contracts` - Sync contract data
8. ✅ `compare_staff_data` - Compare LMS vs Employes data
9. ✅ `get_sync_logs` - Get sync history
10. ✅ `get_sync_statistics` - Get sync stats
11. ✅ `discover_endpoints` - API endpoint discovery
12. ✅ `debug_connection` - Debug API connection
13. ✅ `test_individual_employees` - Test specific employees
14. ✅ `analyze_employment_data` - Analyze employment data

### Frontend Components Using Old Function:
1. **`src/components/employes/EmployesDataFetcher.tsx`**
   - Line 81: `supabase.functions.invoke('employes-integration', { body: { action: 'fetch_employees' }})`

2. **`src/hooks/useEmployesIntegration.ts`**
   - Line 35: `testConnection()`
   - Line 61: `fetchCompanies()`
   - Line 79: `fetchEmployees()`
   - Line 123: `compareStaffData()`
   - Line 176: `syncEmployees()`
   - Line 199: `syncWageData()`
   - Line 222: `syncFromEmployes()`
   - Line 245: `syncContracts()`
   - And more...

3. **`src/components/employes/UnifiedSyncPanel.tsx`**
   - Line 37: `analyze_employment_data`
   - Line 47: `fetch_employees`

4. **`src/components/employes/EmployesSyncDashboard.tsx`**
   - Uses all hooks from `useEmployesIntegration`

5. **`src/pages/EmployesSync.tsx`**
   - Main page that orchestrates all components

---

## 🆕 NEW ARCHITECTURE (What We Built)

### New Microservices:

#### 1. **Snapshot Collector** (Current State)
**Slug:** `hyper-endpoint`  
**Function:** `employes-snapshot-collector`  
**Purpose:** Fetch current employee snapshots  
**Endpoint:** `supabase.functions.invoke('hyper-endpoint', { body: { mode: 'full' }})`  
**Returns:** Current employee list with basic info

#### 2. **History Collector** (Complete History)
**Slug:** `rapid-responder`  
**Function:** `employes-history-collector`  
**Purpose:** Fetch complete employment history (salary, hours, contracts)  
**Endpoint:** `supabase.functions.invoke('rapid-responder', { body: { mode: 'full' }})`  
**Returns:** Full employment history for all employees

#### 3. **Change Detector** (Temporal Analysis)
**Slug:** `dynamic-function`  
**Function:** `employes-change-detector`  
**Purpose:** Detect and record changes between snapshots  
**Endpoint:** `supabase.functions.invoke('dynamic-function', { body: { mode: 'full' }})`  
**Returns:** Detected changes (salary increases, contract changes, hours changes)

### New Database Tables:

#### 1. **`employes_raw_data`**
- Stores ALL raw API responses (snapshots + history)
- Columns: `employee_id`, `endpoint`, `raw_payload`, `api_response`, `effective_from`, `effective_to`, `is_latest`, `sync_session_id`
- **Query:** `SELECT * FROM employes_raw_data WHERE is_latest = true`

#### 2. **`employes_changes`**
- Stores detected changes (salary, hours, contracts)
- Columns: `employee_id`, `change_type`, `effective_date`, `old_value`, `new_value`, `change_amount`, `change_percent`, `business_impact`, `metadata`
- **Query:** `SELECT * FROM employes_changes WHERE employee_id = 'xxx' ORDER BY effective_date`

#### 3. **`employes_timeline`** (Materialized View)
- Pre-aggregated timeline view
- **Query:** `SELECT * FROM employes_timeline WHERE employee_id = 'xxx'`

#### 4. **`employes_sync_sessions`**
- Tracks sync runs
- **Query:** `SELECT * FROM employes_sync_sessions ORDER BY started_at DESC LIMIT 10`

#### 5. **`employes_sync_logs`**
- Detailed sync logs
- **Query:** `SELECT * FROM employes_sync_logs WHERE session_id = 'xxx'`

---

## 🔄 MIGRATION STRATEGY

### Option A: Gradual Migration (RECOMMENDED)
Keep old `employes-integration` function, add new endpoints alongside:

1. **Phase 1: Add New Data Sources** ✅ DONE
   - New microservices deployed
   - New tables populated
   - Change detection working

2. **Phase 2: Update Read Operations** 🔄 NEXT
   - Update components to READ from new tables
   - Keep old function for writes/syncs
   - Test in parallel

3. **Phase 3: Update Write Operations**
   - Replace sync operations with new microservices
   - Deprecate old function

4. **Phase 4: Remove Old Function**
   - Once all components migrated
   - Archive old function

### Option B: Big Bang (Risky)
Replace all at once - NOT RECOMMENDED for production

---

## 🎯 IMMEDIATE ACTION PLAN

### Step 1: Create Unified Data Hook ✅ NEXT
**File:** `src/hooks/useEmployesData.ts`

```typescript
// New hook that reads from new tables
export const useEmployesData = () => {
  // Read from employes_raw_data (latest snapshots)
  const getEmployeeSnapshot = async (employeeId: string) => {
    const { data } = await supabase
      .from('employes_raw_data')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('endpoint', '/employee')
      .eq('is_latest', true)
      .single();
    return data?.api_response;
  };

  // Read from employes_changes (history)
  const getEmployeeHistory = async (employeeId: string) => {
    const { data } = await supabase
      .from('employes_changes')
      .select('*')
      .eq('employee_id', employeeId)
      .order('effective_date', { ascending: true });
    return data;
  };

  // Read from employes_raw_data (full employments)
  const getEmployeeEmployments = async (employeeId: string) => {
    const { data } = await supabase
      .from('employes_raw_data')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('endpoint', '/employments')
      .eq('is_latest', true)
      .single();
    return data?.api_response?.employments || [];
  };

  return {
    getEmployeeSnapshot,
    getEmployeeHistory,
    getEmployeeEmployments,
  };
};
```

### Step 2: Update EmployesDataFetcher
**File:** `src/components/employes/EmployesDataFetcher.tsx`

**Change:**
```typescript
// OLD (line 81)
const { data, error } = await supabase.functions.invoke('employes-integration', {
  body: { action: 'fetch_employees' }
});

// NEW
const { data, error } = await supabase
  .from('employes_raw_data')
  .select('employee_id, api_response')
  .eq('endpoint', '/employee')
  .eq('is_latest', true);

const employees = data?.map(row => row.api_response) || [];
```

### Step 3: Create Sync Orchestrator Component
**File:** `src/components/employes/SyncOrchestrator.tsx`

```typescript
// New component that calls microservices in sequence
export function SyncOrchestrator() {
  const runFullSync = async () => {
    // 1. Collect snapshots
    await supabase.functions.invoke('hyper-endpoint', { body: { mode: 'full' }});
    
    // 2. Collect history
    await supabase.functions.invoke('rapid-responder', { body: { mode: 'full' }});
    
    // 3. Detect changes
    await supabase.functions.invoke('dynamic-function', { body: { mode: 'full' }});
  };

  return (
    <Button onClick={runFullSync}>
      Run Full Sync
    </Button>
  );
}
```

### Step 4: Test Localhost
**Command:** `npm run dev` (port 8080)

**Test Checklist:**
- [ ] Can view employee list (from `employes_raw_data`)
- [ ] Can view employee history (from `employes_changes`)
- [ ] Can trigger sync (calls microservices)
- [ ] Can view sync logs (from `employes_sync_sessions`)

---

## 📊 CURRENT STATUS

### Working ✅:
- Database schema deployed
- Microservices deployed
- Data collection working (102 employees, 234 changes)
- Change detection working

### Needs Work 🔄:
- Frontend still calls old function
- No UI for timeline visualization
- No UI for change history
- Sync orchestration not connected

### Blocked ❌:
- None! Ready to proceed

---

## 🚀 NEXT STEPS

1. **Start localhost** - Verify current state
2. **Create new data hook** - `useEmployesData.ts`
3. **Update one component** - Start with `EmployesDataFetcher`
4. **Test in browser** - Verify data loads
5. **Gradually migrate** - One component at a time

---

**Ready to start?** Let's fire up localhost and see what we have! 🎯
