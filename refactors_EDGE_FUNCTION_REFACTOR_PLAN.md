# 🏗️ EDGE FUNCTION REFACTORING PLAN - From Monolith to Microservices

## 📊 **CURRENT STATE ANALYSIS**

### **The Problem:**
- **1 Monolithic Function:** `employes-integration/index.ts`
- **Size:** 2,040 lines, 72KB
- **Operations:** 18+ different actions in ONE file
- **Issues:** Deployment timeouts, unmaintainable, untestable, poor performance

### **Current Operations Inventory:**
```typescript
// Data Fetching (400 lines)
- fetchCompanies()
- fetchEmployesEmployees()
- fetchEmploymentHistory()
- testIndividualEmployees()

// Synchronization (600 lines)
- syncEmployeesToLMS()
- syncWageDataToEmployes()
- syncContractsFromEmployes()
- fetchAndStoreEmployeeData()

// Validation & Transform (300 lines)
- validateEmploymentData()
- transformEmployesDataForLMS()
- calculateNameSimilarity()

// Comparison & Analysis (400 lines)
- compareStaffData()
- analyzeEmploymentData()

// Testing & Discovery (200 lines)
- testConnection()
- debugConnection()
- discoverEndpoints()

// Utilities & Monitoring (140 lines)
- getSyncStatistics()
- getSyncLogs()
- logSync()
```

---

## 🎯 **NEW MICROSERVICES ARCHITECTURE**

### **7 Focused Edge Functions:**

```
supabase/functions/
├── employes-shared/              # 150 lines - Shared utilities
│   ├── index.ts
│   ├── types.ts
│   ├── auth.ts
│   └── logger.ts
│
├── employes-connection/          # 200 lines - Connection management
│   ├── index.ts
│   ├── test.ts
│   └── debug.ts
│
├── employes-discovery/           # 250 lines - API discovery
│   ├── index.ts
│   ├── endpoints.ts
│   └── analyzer.ts
│
├── employes-fetch/               # 300 lines - Data fetching
│   ├── index.ts
│   ├── companies.ts
│   ├── employees.ts
│   └── contracts.ts
│
├── employes-sync-employees/      # 400 lines - Employee sync
│   ├── index.ts
│   ├── validator.ts
│   ├── transformer.ts
│   └── storage.ts
│
├── employes-sync-contracts/      # 350 lines - Contract sync
│   ├── index.ts
│   ├── mapper.ts
│   └── history.ts
│
├── employes-sync-wages/          # 300 lines - Wage sync
│   ├── index.ts
│   ├── calculator.ts
│   └── encryptor.ts
│
└── employes-monitor/             # 200 lines - Monitoring
    ├── index.ts
    ├── statistics.ts
    └── logs.ts
```

---

## 📋 **FUNCTION BREAKDOWN**

### **1. employes-shared** (Shared Library)
**Purpose:** Common utilities used by all functions
```typescript
// types.ts
export interface EmployesEmployee { ... }
export interface SyncResult { ... }
export interface EmployesResponse<T> { ... }

// auth.ts
export function getAPIKey(): string
export function validateJWT(token: string): boolean

// logger.ts
export async function logSync(action, status, message)
export function logError(context, error)
```

### **2. employes-connection**
**Purpose:** Test & debug connections
```typescript
// Endpoints:
POST /connection/test
POST /connection/debug
GET /connection/status

// Operations:
- testConnection()
- debugConnection()
- validateCredentials()
```

### **3. employes-discovery**
**Purpose:** Discover API endpoints & capabilities
```typescript
// Endpoints:
POST /discovery/endpoints
POST /discovery/analyze
GET /discovery/schema

// Operations:
- discoverEndpoints()
- analyzeEmploymentData()
- mapAPIStructure()
```

### **4. employes-fetch**
**Purpose:** Fetch data from Employes.nl
```typescript
// Endpoints:
GET /fetch/companies
GET /fetch/employees
GET /fetch/employee/:id
GET /fetch/contracts

// Operations:
- fetchCompanies()
- fetchEmployesEmployees()
- fetchEmploymentHistory()
- testIndividualEmployees()
```

### **5. employes-sync-employees**
**Purpose:** Sync employee data to LMS
```typescript
// Endpoints:
POST /sync/employees
POST /sync/employee/:id
GET /sync/employees/status

// Operations:
- syncEmployeesToLMS()
- fetchAndStoreEmployeeData()
- validateEmploymentData()
- transformEmployesDataForLMS()
- storeRawEmployeeData()
```

### **6. employes-sync-contracts**
**Purpose:** Sync contract data
```typescript
// Endpoints:
POST /sync/contracts
POST /sync/contract/:id
GET /sync/contracts/status

// Operations:
- syncContractsFromEmployes()
- mapContractHistory()
- validateContractChain()
```

### **7. employes-sync-wages**
**Purpose:** Sync wage/financial data
```typescript
// Endpoints:
POST /sync/wages
POST /sync/wage/:employeeId
GET /sync/wages/status

// Operations:
- syncWageDataToEmployes()
- encryptFinancialData()
- calculateWageProgression()
```

### **8. employes-monitor**
**Purpose:** Monitoring & statistics
```typescript
// Endpoints:
GET /monitor/statistics
GET /monitor/logs
GET /monitor/health

// Operations:
- getSyncStatistics()
- getSyncLogs()
- generateMetrics()
```

---

## 🔄 **INTER-FUNCTION COMMUNICATION**

### **Option 1: Event-Driven (Recommended)**
```typescript
// Database table: function_events
CREATE TABLE function_events (
  id UUID PRIMARY KEY,
  source_function TEXT,
  target_function TEXT,
  event_type TEXT,
  payload JSONB,
  status TEXT,
  created_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ
);

// Usage example:
// employes-fetch publishes event → employes-sync-employees consumes
await supabase.from('function_events').insert({
  source_function: 'employes-fetch',
  target_function: 'employes-sync-employees',
  event_type: 'employees_fetched',
  payload: { employee_ids: [...], count: 110 }
});
```

### **Option 2: Direct HTTP Calls**
```typescript
// Inter-function calls
const response = await fetch(
  'https://project.supabase.co/functions/v1/employes-fetch',
  { headers: { 'Authorization': `Bearer ${serviceKey}` } }
);
```

---

## 📊 **DATABASE CHANGES**

### **New Tables:**
```sql
-- Function orchestration
CREATE TABLE edge_function_registry (
  function_name TEXT PRIMARY KEY,
  version TEXT,
  status TEXT,
  last_heartbeat TIMESTAMPTZ,
  config JSONB
);

-- Function communication
CREATE TABLE function_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_function TEXT,
  target_function TEXT,
  event_type TEXT,
  payload JSONB,
  status TEXT DEFAULT 'pending',
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Function metrics
CREATE TABLE function_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT,
  execution_time_ms INT,
  success BOOLEAN,
  error_message TEXT,
  input_size_bytes INT,
  output_size_bytes INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 **MIGRATION STRATEGY**

### **Phase 1: Foundation (Week 1)**
```bash
# 1. Create shared utilities
mkdir -p supabase/functions/employes-shared
# Copy common types, interfaces, utilities

# 2. Deploy connection function
npx supabase functions new employes-connection
# Migrate test/debug operations

# 3. Test basic connectivity
curl -X POST .../employes-connection -d '{"action":"test"}'
```

### **Phase 2: Data Functions (Week 2)**
```bash
# 1. Deploy fetch function
npx supabase functions new employes-fetch
# Migrate all fetch operations

# 2. Deploy discovery function
npx supabase functions new employes-discovery
# Migrate discovery/analyze operations

# 3. Test data fetching
curl -X GET .../employes-fetch/employees
```

### **Phase 3: Sync Functions (Week 3)**
```bash
# 1. Deploy employee sync
npx supabase functions new employes-sync-employees
# Migrate employee sync logic

# 2. Deploy contract sync
npx supabase functions new employes-sync-contracts
# Migrate contract operations

# 3. Deploy wage sync
npx supabase functions new employes-sync-wages
# Migrate financial operations
```

### **Phase 4: Monitoring & Cutover (Week 4)**
```bash
# 1. Deploy monitoring
npx supabase functions new employes-monitor
# Migrate statistics/logs

# 2. Update frontend to use new endpoints
# 3. Add feature flag for gradual rollout
# 4. Deprecate monolith function
```

---

## ✅ **TESTING STRATEGY**

### **Unit Tests (Per Function):**
```typescript
// Example: employes-fetch/test.ts
describe('employes-fetch', () => {
  test('fetches companies successfully', async () => {
    const result = await fetchCompanies();
    expect(result.data).toHaveLength(1);
  });

  test('handles API errors gracefully', async () => {
    // Mock API failure
    const result = await fetchCompanies();
    expect(result.error).toBeDefined();
  });
});
```

### **Integration Tests:**
```typescript
// Test inter-function communication
test('fetch triggers sync', async () => {
  // 1. Call fetch function
  await fetch('/employes-fetch/employees');

  // 2. Verify event created
  const events = await supabase
    .from('function_events')
    .select('*')
    .eq('event_type', 'employees_fetched');

  expect(events.data).toHaveLength(1);
});
```

---

## 📈 **PERFORMANCE TARGETS**

### **Before (Monolith):**
- Cold start: 8-12 seconds
- Deployment: 60-120 seconds (timeouts!)
- Memory: 512MB
- Bundle size: 72KB

### **After (Microservices):**
- Cold start: 1-3 seconds per function
- Deployment: 5-10 seconds per function
- Memory: 128-256MB per function
- Bundle size: 10-15KB per function

---

## 🔒 **SECURITY CONSIDERATIONS**

### **Per-Function Security:**
```typescript
// Each function has specific permissions
[functions.employes-fetch]
verify_jwt = false  # Internal only

[functions.employes-sync-employees]
verify_jwt = true   # Requires auth

[functions.employes-monitor]
verify_jwt = true   # Admin only
allowed_roles = ["admin", "manager"]
```

---

## 📊 **MONITORING & OBSERVABILITY**

### **Metrics Per Function:**
```typescript
// Track in function_metrics table
- Execution time
- Success/failure rate
- Input/output size
- Error types
- API rate limits

// Dashboards needed:
- Function health overview
- Sync pipeline status
- Error rate trends
- Performance metrics
```

---

## 🚨 **ROLLBACK PLAN**

```bash
# If issues arise:
1. Feature flag to disable new functions
2. Route traffic back to monolith
3. Investigate issues with monitoring
4. Fix and redeploy affected function only
5. Re-enable gradually

# Database rollback:
-- Kept in migrations folder
-- Can revert function_events table
-- Can restore monolith configuration
```

---

## 📝 **DOCUMENTATION UPDATES NEEDED**

1. **API Documentation:** Update all endpoint references
2. **Developer Guide:** New function architecture
3. **Deployment Guide:** Individual function deployment
4. **Troubleshooting:** Function-specific issues
5. **Architecture Diagrams:** New microservices flow

---

## ✅ **SUCCESS CRITERIA**

- [ ] All 7 functions deployed successfully
- [ ] Zero deployment timeouts
- [ ] All tests passing (>80% coverage)
- [ ] Frontend migrated to new endpoints
- [ ] Monitoring dashboards operational
- [ ] Performance targets met
- [ ] Zero data loss during migration
- [ ] Monolith function deprecated

---

## 🎯 **IMMEDIATE NEXT STEPS**

1. **Create shared utilities function** (employes-shared)
2. **Extract connection testing** (employes-connection)
3. **Test deployment of smaller function** (<500 lines)
4. **Verify inter-function communication**
5. **Begin gradual migration**

This refactoring will transform your unmaintainable 2,040-line monolith into 7 focused, deployable, testable microservices!