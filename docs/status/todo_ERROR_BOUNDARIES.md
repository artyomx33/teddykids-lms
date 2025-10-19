# 🛡️ TODO: ERROR BOUNDARIES IMPLEMENTATION

**Priority:** Medium  
**Estimated Time:** 1-2 hours  
**Status:** 📋 Planned

---

## 🎯 GOAL

Make each component work independently so that if data is missing/corrupt/incorrect, it doesn't crash the whole page. Instead, show a clear error message for that specific component while others continue working.

---

## 📋 IMPLEMENTATION PLAN

### **Level 1: Component-Level Error Boundaries**

Wrap each major component in an Error Boundary so they fail gracefully without crashing the entire page.

---

## 🔧 COMPONENTS TO WRAP

### **Priority 1: Staff Profile Components**

1. ✅ **PersonalInfoPanel**
   - Wrap in `<ErrorBoundary fallback={<PersonalInfoError />}>`
   - If birthDate/age calculation fails → show error card
   - Other components keep working

2. ✅ **EmploymentOverviewEnhanced**
   - Wrap in `<ErrorBoundary fallback={<EmploymentDataError />}>`
   - If employes_changes data is corrupt → show error
   - Salary/Tax cards still work

3. ✅ **EmploymentStatusBar**
   - Wrap in `<ErrorBoundary fallback={<StatusBarError />}>`
   - If salary/contract calculations fail → show error banner
   - Rest of profile still loads

4. ✅ **CompactSalaryCard** (inline in StaffProfile)
   - Wrap in `<ErrorBoundary fallback={<SalaryCardError />}>`
   - If salary data is corrupt → show error card
   - Other cards still show

5. ✅ **CompactTaxCard**
   - Wrap in `<ErrorBoundary fallback={<TaxCardError />}>`
   - If tax data is corrupt → show error card
   - Other cards still show

---

## 📦 WHAT TO CREATE

### **1. Generic Error Boundary Component**

**File:** `src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.componentName || 'component'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">
            ⚠️ Unable to load {this.props.componentName || 'this component'}
          </p>
          {this.state.error && (
            <p className="text-xs text-red-600 mt-1">
              Error: {this.state.error.message}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### **2. Specific Error Fallback Components**

**File:** `src/components/staff/ErrorFallbacks.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function PersonalInfoError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          ⚠️ Unable to load personal information
          <p className="text-xs mt-1">Please contact support if this persists</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmploymentDataError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          ⚠️ Unable to load employment data
          <p className="text-xs mt-1">Data may be temporarily unavailable</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusBarError() {
  return (
    <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
      <p className="text-sm text-amber-700">
        ⚠️ Unable to load employment status alerts
      </p>
    </div>
  );
}

export function SalaryCardError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Salary Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          ⚠️ Salary data unavailable
        </p>
      </CardContent>
    </Card>
  );
}

export function TaxCardError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Tax Information</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          ⚠️ Tax data unavailable
        </p>
      </CardContent>
    </Card>
  );
}
```

---

### **3. Update StaffProfile.tsx**

Wrap each component:

```typescript
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { 
  PersonalInfoError, 
  EmploymentDataError, 
  StatusBarError,
  SalaryCardError,
  TaxCardError
} from "@/components/staff/ErrorFallbacks";

// In render:

<ErrorBoundary fallback={<StatusBarError />} componentName="EmploymentStatusBar">
  {realEmploymentJourney && (
    <EmploymentStatusBar journey={realEmploymentJourney} />
  )}
</ErrorBoundary>

<ErrorBoundary fallback={<PersonalInfoError />} componentName="PersonalInfoPanel">
  <PersonalInfoPanel personalData={employesProfile?.personal || null} />
</ErrorBoundary>

<ErrorBoundary fallback={<EmploymentDataError />} componentName="EmploymentOverview">
  {employmentChanges && employmentChanges.length > 0 && (
    <EmploymentOverviewEnhanced 
      staffName={data.staff.full_name}
      detectedChanges={employmentChanges}
    />
  )}
</ErrorBoundary>

<ErrorBoundary fallback={<SalaryCardError />} componentName="CompactSalaryCard">
  {/* Compact Salary Card code */}
</ErrorBoundary>

<ErrorBoundary fallback={<TaxCardError />} componentName="CompactTaxCard">
  <CompactTaxCard taxInfo={employesProfile?.taxInfo || null} />
</ErrorBoundary>
```

---

## ✅ BENEFITS

1. ✅ **No more full page crashes** - One broken component doesn't break everything
2. ✅ **Clear error messages** - User knows what's broken and why
3. ✅ **Better debugging** - Console logs show exactly which component failed
4. ✅ **Graceful degradation** - User can still use working parts of the page
5. ✅ **Professional UX** - Shows errors elegantly, not white screen of death

---

## 📊 BEFORE vs AFTER

### **Before (No Error Boundaries):**
```
PersonalInfoPanel crashes due to invalid birthDate
    ↓
Entire StaffProfile page crashes
    ↓
User sees: White screen or "Something went wrong"
    ↓
ALL data is inaccessible
```

### **After (With Error Boundaries):**
```
PersonalInfoPanel crashes due to invalid birthDate
    ↓
ErrorBoundary catches it
    ↓
Shows: "⚠️ Unable to load personal information"
    ↓
Employment Overview, Salary Card, Tax Card still work perfectly
    ↓
User can still see 90% of the data
```

---

## 🚀 IMPLEMENTATION STEPS

1. ✅ Create `ErrorBoundary.tsx` component
2. ✅ Create `ErrorFallbacks.tsx` with specific error UIs
3. ✅ Wrap `PersonalInfoPanel` in ErrorBoundary
4. ✅ Wrap `EmploymentOverviewEnhanced` in ErrorBoundary
5. ✅ Wrap `EmploymentStatusBar` in ErrorBoundary
6. ✅ Wrap `CompactSalaryCard` in ErrorBoundary
7. ✅ Wrap `CompactTaxCard` in ErrorBoundary
8. ✅ Test with corrupt data to verify error handling
9. ✅ Add console logging for debugging

---

## 🧪 TESTING PLAN

### **Test Scenarios:**

1. **Invalid birthDate** → PersonalInfoPanel shows error, rest works
2. **Corrupt employes_changes data** → Employment Overview shows error, rest works
3. **Missing salary data** → Salary Card shows error, rest works
4. **Invalid tax data** → Tax Card shows error, rest works
5. **Network timeout** → Affected component shows error, rest works

---

## 📝 NOTES

- Error Boundaries only catch **rendering errors**
- For async errors (API calls), use try-catch in the query functions
- Consider adding a "Retry" button in error fallbacks
- Log errors to monitoring service (Sentry, LogRocket, etc.) in production

---

**Status:** 📋 Ready to implement when needed  
**Estimated Time:** 1-2 hours  
**Dependencies:** None (uses existing components)

---

**When ready to implement, just say "implement error boundaries" and I'll do it!** 🛡️
