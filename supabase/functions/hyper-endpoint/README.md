# 📸 Employes Snapshot Collector

**Purpose:** Fetches current state of all employees from Employes.nl API and stores them in the temporal architecture.

## 🎯 What It Does

1. Creates a sync session
2. Fetches employee list from `/employees`
3. For each employee, fetches detailed data from `/employee/{id}`
4. Stores snapshots in `employes_raw_data` with temporal tracking
5. Marks previous snapshots as superseded

## 🔧 Usage

### Full Sync (All Employees)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/employes-snapshot-collector \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "full"
  }'
```

### Test Mode (Single Employee)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/employes-snapshot-collector \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "test"
  }'
```

### Specific Employees

```bash
curl -X POST https://your-project.supabase.co/functions/v1/employes-snapshot-collector \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "specific",
    "employeeIds": ["12345", "67890"]
  }'
```

## 📊 Response

```json
{
  "success": true,
  "sync_session_id": "uuid-here",
  "result": {
    "total": 110,
    "successful": 110,
    "failed": 0,
    "errors": []
  },
  "duration_ms": 45000
}
```

## 🔄 What Happens to Data

1. **New Employee**: Creates first snapshot with `is_latest=true`, `effective_from=now`
2. **Existing Employee**: 
   - Marks old snapshot as `is_latest=false`, sets `effective_to=now`
   - Creates new snapshot with `is_latest=true`, `effective_from=now`
3. **All snapshots** are linked to a sync session for traceability

## 🔗 Database Impact

- Inserts into: `employes_raw_data`
- Updates: `employes_sync_sessions`
- Logs to: `employes_sync_logs`

## 🚀 Performance

- ~110 employees = ~45 seconds (API rate limits apply)
- Uses string concatenation (no template literals)
- Handles errors gracefully per-employee

## 📝 Notes

- Always creates a new snapshot (never updates in place)
- Preserves complete history
- Safe to run multiple times
- Idempotent operation


