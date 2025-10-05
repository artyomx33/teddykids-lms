# 📦 Employes-Shared Utilities

Centralized utility library for all temporal microservices.

## 🎯 Purpose

This shared library provides:
- **Type definitions** - Complete TypeScript interfaces
- **Authentication** - API key management and request helpers
- **Logging** - Structured logging with performance tracking
- **Temporal helpers** - Date handling, change detection, data comparison

## 📚 Modules

### `types.ts`
Complete type system including:
- `EmployesEmployee` - Employee data from API
- `RawDataRecord` - Temporal storage format
- `ChangeRecord` - Detected changes
- `EmployeeTimeline` - Timeline view
- All response/result types

### `auth.ts`
Authentication and API helpers:
- `getEmployesAPIKey()` - Get API key from environment
- `makeEmployesRequest()` - Make authenticated API calls
- `buildEmployeesEndpoint()` - URL builders for all endpoints
- `corsHeaders` - CORS configuration

### `logger.ts`
Structured logging:
- `logInfo()`, `logWarn()`, `logError()`, `logDebug()` - Log functions
- `PerformanceTimer` - Track operation duration
- `BatchLogger` - Batch multiple log entries
- `logSyncToDB()` - Log to database

### `temporal.ts`
Temporal data helpers:
- `hashData()` - Generate data hashes
- `parseDate()`, `formatDate()` - Date handling
- `detectChanges()` - Find differences between data
- `extractEffectiveDate()` - Get effective dates from API data
- `calculateConfidenceScore()` - Score change detection confidence

## 🚀 Usage

In any edge function:

```typescript
import {
  // Types
  EmployesEmployee,
  SyncResult,
  ChangeType,
  
  // Auth
  makeEmployesRequest,
  buildEmployeesEndpoint,
  corsHeaders,
  
  // Logging
  logInfo,
  logError,
  PerformanceTimer,
  
  // Temporal
  detectChanges,
  hashData,
  parseDate
} from '../employes-shared/index.ts';

// Use in your function
const timer = new PerformanceTimer();
logInfo('Starting sync', 'my-service');

const endpoint = buildEmployeesEndpoint(1, 100);
const { data, error } = await makeEmployesRequest<EmployesEmployee[]>(endpoint);

if (error) {
  logError('Fetch failed', 'my-service', new Error(error));
  return;
}

timer.logSummary('my-service', 'fetch_employees');
```

## ⚠️ Important Notes

1. **NO TEMPLATE LITERALS** - Use string concatenation only (`'a' + b + 'c'`)
   - Supabase Edge Functions parser fails on template literals
   
2. **All functions are side-effect free** - Safe to import anywhere

3. **Consistent error handling** - All functions return results, never throw

## 🔧 Constants

```typescript
EMPLOYES_BASE_URL = 'https://connect.employes.nl/v4'
TEDDY_KIDS_COMPANY_ID = 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6'
MIN_CONFIDENCE_SCORE = 0.7
MAX_SALARY_INCREASE_PERCENT = 50
DEFAULT_HOURS_PER_WEEK = 36
```

## 📝 Version

Current version: **1.0.0**
Build date: **2025-10-05**


