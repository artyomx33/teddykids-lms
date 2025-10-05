# Mock Data Audit Report

## Overview
This document identifies all mock/hardcoded data found in the application that needs to be replaced with real database queries.

## Critical Mock Data Found

### 1. Dashboard Metrics (src/pages/Dashboard.tsx)
**Lines 93-119**
- ❌ "Contracts Signed This Month": **24** (hardcoded)
- ❌ "Pending Signatures": **8** (hardcoded)
- ❌ "Active Employees": **156** (hardcoded)
- ❌ "Completion Rate": **94.2%** (hardcoded)
- ❌ Trends: "+20.1%", "+4", "+2.1%" (all hardcoded)

**Fix Required**: Replace with actual queries from:
- `contracts` table (signed_at, status)
- `staff` table (count active employees)
- Calculate real percentages from data

---

### 2. QuickWinMetrics Component (src/components/dashboard/QuickWinMetrics.tsx)
**Lines 95, 106, 117, 128**
- ❌ `trend: +15` (mock)
- ❌ `trend: +23` (mock)
- ❌ `trend: +40` (mock)
- ❌ `trend: +12` (mock)

**Fix Required**: Calculate real week-over-week trends by comparing:
- Current week data vs previous week data
- Store historical snapshots for trend calculation

---

### 3. TeddyStarsWidget Component (src/components/dashboard/TeddyStarsWidget.tsx)
**Lines 23-27**
```typescript
const trendingData = {
  change: Math.floor(Math.random() * 3) - 1, // Random mock data
  period: "vs last month"
};
```
- ❌ Random trending data (-1, 0, or 1)

**Fix Required**: Track 5-star badge changes month-over-month

---

## Status After Cleanup
- ✅ AppiesInsight: Uses real queries (fallback messages are intentional)
- ✅ ActivityFeed: Uses real-time data
- ✅ BirthdayWidget: Uses real data (assumed)
- ✅ InternWatchWidget: Uses real data (assumed)
- ❌ **Dashboard metrics**: NEEDS FIX
- ❌ **QuickWinMetrics trends**: NEEDS FIX  
- ❌ **TeddyStarsWidget trends**: NEEDS FIX

---

## Action Items
1. ✅ Remove all hardcoded metrics from Dashboard.tsx
2. ✅ Remove mock trends from QuickWinMetrics.tsx
3. ✅ Remove random trending from TeddyStarsWidget.tsx
4. Create historical tracking for trend calculations
5. Add proper loading states for empty data
