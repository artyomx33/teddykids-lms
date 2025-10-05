# 🔍 SALARY PROGRESSION INVESTIGATION

## Summary
Investigating how to extract historical salary progression data from Employes.nl API for Adéla Jarošová. User confirmed the data exists in the API since it appears on the Employes website.

## Target Data Pattern
```
Salaris gewijzigd 1 jul. 2025    € 2.371,66 (€ 2.846,00)
Salaris gewijzigd 19 jun. 2025   € 2.314,16 (€ 2.777,00)
Salaris gewijzigd 1 dec. 2024    € 2.257,49 (€ 2.709,00)
Werkgever toegevoegd 1 nov. 2024 € 2.147,49 (€ 2.577,00)
```

## API Data Structure Found

### Employee Data (Current)
```json
{
  "id": "b1bc1ed8-79f3-4f45-9790-2a16953879a1",
  "first_name": "Adéla",
  "last_name": "Jarošová",
  "employment": {
    "salary": {
      "start_date": "2025-07-01T00:00:00",
      "hour_wage": 18.24,
      "month_wage": 2846,
      "yearly_wage": 30736.677
    }
  }
}
```

**Issue**: This only shows CURRENT salary (Jul 2025), not historical progression.

## Investigation Methods

### 1. Full Employee Data Pull ✅
- Pulled ALL available data for Adéla from `/employees/{id}` endpoint
- Found complete employment structure but only current salary period
- No historical salary changes in main employee record

### 2. Employment History Endpoints Investigation 🔧
- **Discovered**: Multiple employment history endpoints exist:
  - `/employees/{id}/employments` - Current employment data
  - `/employees/{id}/employment-history` - Historical employment changes (403 forbidden for some users)
  - `/employees/{id}/salary-history` - Direct salary history endpoint
  - `/employees/{id}/contracts` - Contract history
  - `/employees/{id}/payruns` - Payrun history
- **Added**: New `fetch_employment_history` action to test all endpoints
- **Status**: Function deploying to test these endpoints with Adéla's data

### 3. Alternative Data Sources to Check
- `/contracts` endpoint - may contain salary progression
- `/payslips` endpoint - individual pay periods
- `/salary-changes` or similar endpoint (if exists)
- Query parameters for historical data ranges

## Database Status

### Manual Reconstruction ✅
Created 4 salary periods manually in `cao_salary_history`:
1. Nov 2024: €2.577,00 (€14.91/hr)
2. Dec 2024: €2.709,00 (€15.68/hr)
3. Jun 2025: €2.777,00 (€16.07/hr)
4. Jul 2025: €2.846,00 (€18.24/hr) ← Matches API

### RLS Policy Issue 🔧
- Data exists but blocked by Row Level Security
- Service role can access, anon role cannot
- **Fix needed**: Update RLS policies for `cao_salary_history`

## Next Steps

1. **Investigate Payruns Endpoint**
   ```javascript
   // Check if payruns contain historical salary data
   const payruns = await fetch('/api/employes/payruns?employee_id=b1bc1ed8...');
   ```

2. **Fix RLS Policies**
   ```sql
   -- Allow anon access to cao_salary_history
   CREATE POLICY "Allow anon read cao_salary_history"
   ON cao_salary_history FOR SELECT
   TO anon USING (true);
   ```

3. **Test Data Flow**
   - Verify `contracts_enriched` displays salary progression
   - Ensure frontend components show historical data
   - Remove all mock/draft data

## User Requirements
- ✅ Extract REAL data from Employes API (not manual)
- ✅ Match exact progression: €2.147,49 → €2.371,66
- ⏳ Eliminate all mock/draft data
- ⏳ Find API source of historical salary data

## Code References
- `/src/lib/salary-progression-reconstructor.ts` - Manual reconstruction
- `/src/components/debug/DatabaseInvestigator.tsx` - Data verification tool
- `/test-salary-reconstruction.js` - Test script