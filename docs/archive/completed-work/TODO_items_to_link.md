# 🔗 **Items Requiring Data Connection**

**Generated:** October 5, 2025
**Purpose:** Complete audit of mock data, unlinked components, and TODO items found during error boundary implementation

---

## 📊 **Priority 1: Critical Missing Data**

### **Staff Reviews System** ⚠️
- **Location**: `src/pages/StaffProfile.tsx`, `src/lib/hooks/useReviews.ts`
- **Issue**: Complete review system using mock data
- **Status**: Tables empty, all stats hardcoded
- **Impact**: Performance management completely simulated
- **Mock Data**:
  ```typescript
  // All hardcoded in Reviews page
  Due This Month: 12 (hardcoded)
  Avg Score: 4.2 (hardcoded)
  5★ Staff: 23 (hardcoded)
  Completion Rate: 87% (hardcoded)
  ```

### **Intern Management System** 🎓
- **Location**: `src/pages/Interns.tsx`
- **Issue**: Entire intern system uses mock data array
- **Status**: All data fabricated
- **Impact**: Cannot manage real interns
- **Mock Data**:
  ```typescript
  const mockInterns = [
    {
      id: "intern-1",
      name: "Emma Thompson",
      year: 1,
      department: "Care Services",
      progress: 78, // Hardcoded
      completedDocuments: 7, // Hardcoded
      totalDocuments: 9 // Hardcoded
    }
    // ... 3 total mock interns
  ];
  ```

### **Dashboard Metrics** 📈
- **Location**: `src/pages/Dashboard.tsx`
- **Issue**: Core metrics disconnected from real data
- **Status**: Placeholder values only
- **Impact**: Business intelligence compromised
- **Mock Data**:
  ```typescript
  // TODO: CONNECT - contracts_enriched table not available yet
  const { data: dueReviews = [] } = useQuery({
    queryFn: async () => {
      console.log('Dashboard: Using mock data - contracts_enriched needs connection');
      return []; // Always empty!
    }
  });
  ```

---

## 📋 **Priority 2: Important Connections**

### **Contract System Gaps**
- **Location**: `src/pages/Staff.tsx`
- **Issue**: `contracts_enriched_v2` table referenced but empty
- **Status**: Staff contract data not enriched
- **Impact**: Contract management limited
- **Details**:
  ```typescript
  // 2.0 architecture query returns empty data
  enriched: [], // Empty - contracts_enriched_v2 is empty
  ```

### **Activity Feed Limited Data**
- **Location**: `src/components/dashboard/ActivityFeed.tsx`
- **Issue**: Limited real-time activity events
- **Status**: Minimal data sources connected
- **Impact**: Poor visibility into system activity

### **Birthday Data Inconsistency**
- **Location**: `src/components/staff/CompactProfileCard.tsx`, `src/components/dashboard/BirthdayWidget.tsx`
- **Issue**: Some staff missing `birth_date` field
- **Status**: Partial data availability
- **Impact**: Birthday tracking incomplete
- **Evidence**: Fallback logic for missing birth dates

---

## 🔧 **Priority 3: Nice to Have**

### **Performance Analytics**
- **Location**: `src/components/reviews/PerformanceAnalytics.tsx`
- **Issue**: No historical performance data
- **Status**: Views/functions may not exist
- **Impact**: Limited performance insights

### **Milestone Celebrations**
- **Location**: `src/components/celebrations/`
- **Issue**: Mock milestone triggers
- **Status**: No real milestone detection
- **Impact**: Celebration system artificial

### **Predictive Insights**
- **Location**: `src/components/analytics/PredictiveInsights.tsx`
- **Issue**: No ML model integration
- **Status**: Placeholder analytics
- **Impact**: No business forecasting

---

## ✅ **Systems Working Correctly**

### **Document Compliance System**
- **Location**: `src/components/staff/DocumentStatusPanel.tsx`
- **Status**: ✅ **CONNECTED** to `staff_document_compliance` table
- **Data**: Real compliance tracking with 7 document types
- **Functionality**: Shows actual missing counts and progress

### **Employes.nl Integration**
- **Location**: `src/lib/employesProfile.ts`, temporal tables
- **Status**: ✅ **CONNECTED** via temporal architecture
- **Data**: Real-time employment data sync
- **Functionality**: Live salary, contract, and change detection

### **Staff Management Core**
- **Location**: `src/lib/staff.ts`, `staff` VIEW
- **Status**: ✅ **CONNECTED** to Supabase
- **Data**: Basic staff information complete
- **Functionality**: CRUD operations working

---

## 🎯 **Implementation Priority**

### **Phase 1: Critical Business Impact**
1. **Staff Reviews System** - Performance management essential
2. **Intern Management** - Student tracking required
3. **Dashboard Metrics** - Business intelligence needed

### **Phase 2: Enhanced Functionality**
1. **Contract Enrichment** - Complete contract lifecycle
2. **Activity Feed** - Better system visibility
3. **Birthday Tracking** - Employee engagement

### **Phase 3: Advanced Features**
1. **Performance Analytics** - Historical insights
2. **Predictive Analytics** - Business forecasting
3. **Milestone System** - Automated celebrations

---

## 📝 **Technical Notes**

- **Error Boundaries**: Now implemented to prevent mock data failures from crashing pages
- **Graceful Degradation**: Missing data shows appropriate fallbacks
- **Development Safety**: All TODO items documented for systematic resolution
- **Architecture**: 2.0 temporal system connected, 1.0 legacy systems identified

---

## 🚀 **Next Steps**

1. **Prioritize** by business impact
2. **Design** database schemas for missing systems
3. **Implement** real data connections systematically
4. **Test** each connection thoroughly
5. **Remove** mock data progressively

**Status**: 📋 Documentation complete - ready for systematic implementation