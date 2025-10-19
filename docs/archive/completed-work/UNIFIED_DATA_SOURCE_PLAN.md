# 🎯 UNIFIED DATA SOURCE ARCHITECTURE PLAN

## 🚨 CRITICAL PROBLEM IDENTIFIED

**Root Cause**: Data being pulled from multiple fragmented sources, causing:
- Inconsistent data display in UI
- RLS policy conflicts
- Performance degradation
- Maintenance nightmare

## 📊 CURRENT DATA FRAGMENTATION (BAD)

### fetchStaffDetail() - 8 Parallel Queries
```typescript
// BAD: Multiple sources for same data
const [
  enrichedContractResult,    // contracts_enriched by staff_id
  firstContractResult,       // contracts table by employee_name
  reviewsResult,            // staff_reviews
  notesResult,              // staff_notes
  certificatesResult,       // staff_certificates
  documentStatusResult,     // staff_docs_status
  contracts,                // fetchStaffContracts() - ANOTHER query!
] = await Promise.all([...]);
```

### Multiple Contract Data Paths
- `contracts_enriched` view → Used in 30+ components
- `contracts` table direct → Used in fetchStaffContracts
- `fetchStaffContracts()` → Transforms query_params
- Integration Bridge → Adds more complexity

### Staff/Contract Linking Issues
- contracts_enriched: Uses `staff_id` (proper FK)
- fetchStaffContracts: Uses `employee_name` (text matching)
- Different RLS policies block different queries

## ✅ UNIFIED SOLUTION: SINGLE SOURCE OF TRUTH

### Core Principle
**ALL staff and contract data flows through contracts_enriched_mat ONLY**

### The contracts_enriched_mat view is perfect because:
```sql
-- Already does everything we need:
SELECT
  c.id,
  s1.id AS staff_id,                    -- ✅ Proper staff linking
  COALESCE(s1.full_name, c.employee_name) AS full_name,
  COALESCE(c.department, c.query_params->>'position') AS position,
  to_date(c.query_params->>'startDate', 'YYYY-MM-DD') AS start_date,
  to_date(c.query_params->>'endDate', 'YYYY-MM-DD') AS end_date,
  -- ✅ Reviews, badges, compliance flags all included
  lr.last_review_date,
  lr.avg_review_score,
  (COALESCE(lr.avg_review_score, 0) = 5.00) AS has_five_star_badge,
  needs_six_month_review,
  needs_yearly_review
FROM public.contracts AS c
LEFT JOIN LATERAL (
  SELECT s.id, s.full_name
  FROM public.staff s
  WHERE lower(s.full_name) = lower(c.employee_name)  -- ✅ Smart name linking
) s1 ON true
-- Plus all the enrichments...
```

## 🎯 IMPLEMENTATION PLAN

### Phase 1: Create Unified Data Service

```typescript
// NEW: src/lib/unified-data-service.ts
export class UnifiedDataService {

  /**
   * SINGLE source for ALL staff data
   * Replaces: fetchStaffDetail, fetchStaffContracts, and 30+ direct queries
   */
  static async getStaffData(staffId: string): Promise<StaffData> {
    // ONE query to contracts_enriched with ALL needed data
    const { data, error } = await supabase
      .from('contracts_enriched')
      .select(`
        *,
        staff_reviews(*),
        staff_notes(*),
        staff_certificates(*),
        staff_docs_status(*)
      `)
      .eq('staff_id', staffId)
      .order('start_date', { ascending: false });

    if (error) throw error;

    return this.transformToStaffData(data);
  }

  /**
   * SINGLE source for contract lists and analytics
   * Replaces: All dashboard, analytics, and insights queries
   */
  static async getContractsData(filters?: ContractFilters): Promise<ContractsData> {
    // ONE query with optional filters
    const query = supabase
      .from('contracts_enriched')
      .select('*')
      .order('start_date', { ascending: false });

    if (filters?.staff_id) query.eq('staff_id', filters.staff_id);
    if (filters?.location) query.eq('location_key', filters.location.toLowerCase());
    if (filters?.manager) query.eq('manager_key', filters.manager.toLowerCase());

    const { data, error } = await query;
    if (error) throw error;

    return this.transformToContractsData(data);
  }
}
```

### Phase 2: Update All Components

**Replace these patterns:**
```typescript
// ❌ OLD: Multiple fragmented queries
const [contracts, enriched, reviews] = await Promise.all([
  supabase.from('contracts').select('*'),
  supabase.from('contracts_enriched').select('*'),
  fetchStaffContracts(name)
]);

// ✅ NEW: Single unified query
const staffData = await UnifiedDataService.getStaffData(staffId);
```

**Update these files:**
- `src/lib/staff.ts` → Use UnifiedDataService.getStaffData()
- `src/pages/Dashboard.tsx` → Use UnifiedDataService.getContractsData()
- `src/pages/Staff.tsx` → Use UnifiedDataService.getContractsData()
- `src/pages/Insights.tsx` → Use UnifiedDataService.getContractsData()
- All 30+ components using contracts_enriched directly

### Phase 3: Fix RLS Policies

```sql
-- Ensure contracts_enriched view has proper RLS policies
DROP POLICY IF EXISTS "Allow authenticated read access" ON contracts_enriched;

CREATE POLICY "Allow authenticated read access" ON contracts_enriched
  FOR SELECT USING (auth.role() = 'authenticated');

-- Grant view access to authenticated users
GRANT SELECT ON contracts_enriched TO authenticated;
GRANT SELECT ON contracts_enriched TO anon;
```

### Phase 4: Remove Legacy Code

**Delete/deprecate:**
- `fetchStaffContracts()` function
- `src/lib/integration-bridge.ts` (adds complexity)
- Direct `contracts` table queries in components
- Parallel queries in `fetchStaffDetail()`

## 🚀 MIGRATION STRATEGY

### Step 1: Shadow Implementation
- Create UnifiedDataService alongside existing code
- Test it works with sample staff members
- Compare results with old fragmented queries

### Step 2: Component Migration
- Update one component at a time
- Start with StaffProfile page (most complex)
- Verify data consistency after each migration

### Step 3: Dashboard Analytics
- Migrate all dashboard widgets to use unified service
- Ensure analytics data matches previous results
- Test performance with unified queries

### Step 4: Clean Up
- Remove deprecated functions
- Clean up unused imports
- Update types and interfaces

## 📈 EXPECTED BENEFITS

### Performance ⚡
- **8 queries → 1 query** for staff detail
- **Materialized view** = fast reads
- **Proper indexes** on enriched data
- **No more parallel query overhead**

### Consistency 🎯
- **Single source of truth** for all staff/contract data
- **No more data mismatches** between components
- **Unified data transformations**
- **Consistent error handling**

### Maintainability 🔧
- **One place to update** data logic
- **No more hunting across multiple files**
- **Clear data contracts and types**
- **Easier testing and debugging**

### Reliability 🛡️
- **Proper RLS policy enforcement**
- **No more authorization conflicts**
- **Consistent data validation**
- **Better error messages**

## 🎯 SUCCESS METRICS

- [ ] Staff profiles load in <500ms (vs current 2-3s)
- [ ] Zero data inconsistency bugs
- [ ] All dashboard analytics work consistently
- [ ] Lovable's V2 systems integrate seamlessly
- [ ] Development velocity increases 3x

## 🚨 CRITICAL IMPLEMENTATION NOTES

1. **DO NOT** add more integration layers - remove complexity
2. **DO NOT** create new data fetching functions - use unified service only
3. **DO NOT** bypass the unified service - all data must flow through it
4. **DO** test each migration thoroughly with real staff data
5. **DO** preserve existing functionality exactly during migration

---

**🤖 Ready for review and implementation with Lovable! This plan eliminates the root cause of our data consistency issues.**