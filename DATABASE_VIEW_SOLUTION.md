# Alternative Solution: Create contracts_enriched_v2 as Database View

## Context
After the frontend refactor approach had issues with the Staff page (empty table due to join failures), we're considering creating `contracts_enriched_v2` as a database view to bridge the gap without touching the codebase.

## Rationale for This Approach
- **No code changes needed** - All 16 components querying `contracts_enriched_v2` would just work
- **Single source of truth** - Database handles the joins and aggregations
- **Better performance** - Database is optimized for these operations
- **Simpler debugging** - Can query the view directly to verify data
- **Immediate fix** - Solves the problem in ~30 minutes vs days of refactoring

## Implementation Plan

### Step 1: Analyze Required Fields (5-10 min)
- Search codebase for all `contracts_enriched_v2` references
- Extract exact field names being queried
- Map to available columns in `employes_current_state` and `staff_reviews`
- Identify any computed fields needed (e.g., review aggregates)

### Step 2: Create View Definition (10-15 min)
```sql
CREATE VIEW contracts_enriched_v2 AS
SELECT 
  -- Core employee data from employes_current_state
  e.employee_id,
  e.full_name,
  e.first_name,
  e.last_name,
  e.email,
  e.phone,
  e.mobile,
  e.date_of_birth,
  e.nationality,
  
  -- Employment data
  e.employment_status,
  e.start_date,
  e.end_date,
  e.department,
  e.location,
  e.manager_name,
  e.manager_id,
  e.role,
  e.position,
  
  -- Contract data
  e.contract_type,
  e.contract_start_date,
  e.contract_end_date,
  
  -- Salary data
  e.current_salary,
  e.current_hourly_rate,
  e.current_hours_per_week,
  e.salary_effective_date,
  
  -- Address data
  e.street_address,
  e.city,
  e.postal_code,
  e.country,
  
  -- Other fields
  e.bsn,
  e.iban,
  e.is_active,
  e.months_employed,
  e.age,
  
  -- Review aggregates from staff_reviews
  COALESCE(r.avg_score, 0) as avg_review_score,
  r.last_review_date,
  r.review_count,
  r.total_reviews,
  COALESCE(r.has_five_star_badge, false) as has_five_star_badge,
  
  -- Computed review fields
  CASE 
    WHEN e.start_date IS NOT NULL 
      AND (r.last_review_date IS NULL 
           OR r.last_review_date < e.start_date + INTERVAL '6 months')
      AND CURRENT_DATE >= e.start_date + INTERVAL '6 months'
    THEN true 
    ELSE false 
  END as needs_six_month_review,
  
  CASE 
    WHEN e.start_date IS NOT NULL
      AND (r.last_review_date IS NULL 
           OR r.last_review_date < CURRENT_DATE - INTERVAL '1 year')
      AND CURRENT_DATE >= e.start_date + INTERVAL '1 year'
    THEN true 
    ELSE false 
  END as needs_yearly_review,
  
  -- Metadata
  e.last_sync_at,
  e.data_completeness_score,
  e.created_at,
  e.updated_at

FROM employes_current_state e

LEFT JOIN (
  SELECT 
    employes_employee_id,
    AVG(score) as avg_score,
    MAX(review_date) as last_review_date,
    COUNT(*) as review_count,
    COUNT(*) as total_reviews,
    MAX(CASE WHEN score >= 5 THEN true ELSE false END) as has_five_star_badge
  FROM staff_reviews
  GROUP BY employes_employee_id
) r ON e.employee_id = r.employes_employee_id;
```

### Step 3: Create Migration File (5 min)
Create `supabase/migrations/20251025_create_contracts_enriched_v2_view.sql`:
```sql
-- Create contracts_enriched_v2 view to bridge the gap
-- This view combines employes_current_state with review aggregates

DROP VIEW IF EXISTS contracts_enriched_v2;

CREATE VIEW contracts_enriched_v2 AS
[View definition from Step 2]

-- Grant appropriate permissions
GRANT SELECT ON contracts_enriched_v2 TO authenticated;
GRANT SELECT ON contracts_enriched_v2 TO anon;

COMMENT ON VIEW contracts_enriched_v2 IS 'Enriched employee contract data combining current state with review metrics';
```

### Step 4: Test and Validate (10 min)
1. Apply migration locally: `supabase db push`
2. Query the view: `SELECT COUNT(*) FROM contracts_enriched_v2;` (should return ~79 rows)
3. Sample data: `SELECT employee_id, full_name, avg_review_score, needs_six_month_review FROM contracts_enriched_v2 LIMIT 5;`
4. Restart local dev server
5. Load `/staff` page - should now display data
6. Test filtering, sorting, and navigation to profile pages
7. Verify review metrics are calculated correctly

### Step 5: Production Deployment
1. Commit migration file
2. Deploy to staging first if available
3. Run migration in production
4. Monitor for any performance issues

## Pros vs Cons

### Pros ✅
- **Zero code changes required** - Immediate fix for all 16 components
- **Database optimized** - Joins and aggregations are fast at DB level
- **Single query** - Frontend makes one request instead of multiple
- **Maintainable** - View logic is centralized in one place
- **Reversible** - Can drop the view anytime without data loss

### Cons ⚠️
- **Another database object** - One more thing to maintain
- **Less flexible** - Business logic in SQL is harder to test/modify than TypeScript
- **View performance** - Depends on underlying table indexes
- **Migration required** - Needs database deployment

## Decision Matrix

| Criteria | Frontend Refactor | Database View |
|----------|------------------|---------------|
| Time to implement | 2-3 days | 30-45 minutes |
| Code changes | 16 files | 0 files |
| Risk level | Medium | Low |
| Performance | Good (with caching) | Excellent |
| Maintainability | Better long-term | Good enough |
| Testability | Excellent | Limited |

## Recommendation

**For immediate fix:** Create the database view. It's a pragmatic solution that:
1. Gets the Staff page working TODAY
2. Requires no code changes
3. Can be done in under an hour
4. Is easily reversible if needed

**For long-term:** Consider refactoring to frontend approach later when there's more time, keeping the view as a fallback.

## Next Steps

If approved:
1. Run codebase search to get exact field list
2. Create and test view locally
3. Apply migration
4. Verify Staff page works
5. Close the ticket and move on

Total time: ~30-45 minutes to fully operational Staff page.
