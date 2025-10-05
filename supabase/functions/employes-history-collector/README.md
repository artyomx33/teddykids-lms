# 📜 Employes History Collector

**Purpose:** Fetches ALL historical data from Employes.nl API (employments, salary history, contracts, etc.) and stores them with proper temporal tracking.

## 🎯 What It Does

1. Creates a sync session
2. Fetches employee list from `/employees`
3. For each employee, fetches historical data from multiple endpoints:
   - `/employments`
   - `/employment-history`
   - `/salary-history`
   - `/contracts`
   - `/contract-history`
   - `/wage-scales`
   - `/hourly-wage-history`
   - `/hours-history`
   - `/position-history`
4. Stores each historical record in `employes_raw_data` with:
   - `effective_from` extracted from the data's date fields
   - `is_latest=true` (historical records don't expire)
   - Proper sync session tracking

## 🔧 Usage

### Full Sync (All Employees, All Endpoints)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/employes-history-collector \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "full"
  }'
```

### Test Mode (Single Employee, Single Endpoint)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/employes-history-collector \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "test"
  }'
```

### Specific Employees

```bash
curl -X POST https://your-project.supabase.co/functions/v1/employes-history-collector \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "specific",
    "employeeIds": ["12345", "67890"]
  }'
```

### Specific Endpoints Only

```bash
curl -X POST https://your-project.supabase.co/functions/v1/employes-history-collector \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "full",
    "endpoints": ["/salary-history", "/contract-history"]
  }'
```

## 📊 Response

```json
{
  "success": true,
  "sync_session_id": "uuid-here",
  "result": {
    "total": 990,
    "successful": 987,
    "failed": 3,
    "errors": [
      {
        "employee_id": "12345 - /salary-history",
        "error": "API call failed: 404 Not Found"
      }
    ]
  },
  "duration_ms": 180000
}
```

## 🔄 What Happens to Data

1. **Historical Arrays**: If API returns an array (e.g., salary history), each item is stored as a separate record
2. **Date Extraction**: Tries to find `effective_date`, `start_date`, `created_at`, etc. from the data
3. **No Superseding**: Historical records don't supersede each other - they coexist
4. **404 Handling**: If an endpoint returns 404, it's logged but not considered an error (some employees may not have all history types)

## 🔗 Database Impact

- Inserts into: `employes_raw_data` (multiple records per employee)
- Updates: `employes_sync_sessions`
- Logs to: `employes_sync_logs`

## 🚀 Performance

- ~110 employees x 9 endpoints = ~990 API calls
- Estimated time: ~3-5 minutes (with API rate limits)
- Handles errors gracefully per-endpoint
- Skips empty responses

## 📝 Notes

- Safe to run multiple times
- New historical data will be added
- Existing historical data is preserved
- Each historical item gets its own record
- Date extraction is smart but may fall back to current time if no date found

## 🎯 After This Runs

You'll have:
- Complete salary history with dates
- Complete contract history with dates
- Complete employment history with dates
- All stored in temporal format ready for change detection!
