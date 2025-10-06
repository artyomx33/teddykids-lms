# 🏗️ Component Architecture Standards
**Updated**: October 6, 2025

---

## 🎯 **Quick Reference: The 7 Pillars of Resilient Components**

1. **🔒 Isolate** - Build independently, test independently
2. **🛡️ Protect** - Wrap with error boundaries
3. **📝 Contract** - Define clear TypeScript interfaces
4. **💉 Inject** - Pass dependencies as props
5. **🧩 Compose** - Build complex from simple
6. **🧪 Test** - Ensure isolated testability
7. **❤️ Handle** - Graceful errors & loading states

---

## ✅ **Component Creation Checklist**

Copy this checklist for every new component:

```markdown
## New Component: [ComponentName]

### Design Phase:
- [ ] Clear single responsibility defined
- [ ] Props interface designed
- [ ] Dependencies identified
- [ ] Error scenarios considered
- [ ] Loading states planned

### Implementation Phase:
- [ ] TypeScript interface for props created
- [ ] Component wrapped in appropriate error boundary
- [ ] Dependencies passed as props (not imported)
- [ ] Loading state implemented
- [ ] Error state implemented
- [ ] Empty state implemented (if applicable)

### Quality Phase:
- [ ] No tight coupling to specific APIs
- [ ] No prop drilling (use Context if needed)
- [ ] Component is < 300 lines (split if larger)
- [ ] All props have TypeScript types
- [ ] Component can be rendered in isolation

### Documentation Phase:
- [ ] Props interface documented
- [ ] Usage example provided
- [ ] Error scenarios documented
```

---

## 📋 **Page Creation Template**

Use this template for every new page:

```typescript
import { PageErrorBoundary, SectionErrorBoundary } from "@/components/error-boundaries/ErrorBoundary";

// Define page data interfaces
interface PageData {
  // ... types
}

// Main page component
export default function MyPage() {
  // Data fetching
  const { data, isLoading, error } = useQuery({ ... });
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (error) {
    return <ErrorMessage error={error} />;
  }
  
  // Success state with error boundaries
  return (
    <PageErrorBoundary>
      <div className="space-y-6">
        {/* Page header - simple, unlikely to crash */}
        <PageHeader title="..." />
        
        {/* Critical section 1 - protected */}
        <SectionErrorBoundary sectionName="MainContent">
          <MainContentSection data={data} />
        </SectionErrorBoundary>
        
        {/* Critical section 2 - protected */}
        <SectionErrorBoundary sectionName="DataVisualization">
          <ComplexChart data={data} />
        </SectionErrorBoundary>
        
        {/* Tabs with protected content */}
        <Tabs>
          <TabsContent value="details">
            <SectionErrorBoundary sectionName="DetailsTab">
              <DetailsContent data={data} />
            </SectionErrorBoundary>
          </TabsContent>
          
          <TabsContent value="analytics">
            <SectionErrorBoundary sectionName="AnalyticsTab">
              <AnalyticsContent data={data} />
            </SectionErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </PageErrorBoundary>
  );
}
```

---

## 🧩 **Component Template (With Boundaries)**

Use this template for complex components:

```typescript
// Define props interface
interface MyComponentProps {
  data: DataType;
  onAction?: (item: DataType) => void;
  loading?: boolean;
  className?: string;
}

export function MyComponent({ 
  data, 
  onAction,
  loading = false,
  className 
}: MyComponentProps) {
  // Loading state
  if (loading) {
    return <Skeleton className={className} />;
  }
  
  // Empty state
  if (!data || data.length === 0) {
    return (
      <EmptyState 
        message="No data available"
        className={className}
      />
    );
  }
  
  // Success state
  return (
    <div className={className}>
      {/* Render data */}
      {data.map(item => (
        <SectionErrorBoundary key={item.id} sectionName={`Item-${item.id}`}>
          <ItemCard 
            item={item}
            onAction={onAction}
          />
        </SectionErrorBoundary>
      ))}
    </div>
  );
}
```

---

## 🎯 **Error Boundary Decision Tree**

```
Is this a route/page component?
├── YES → Wrap with <PageErrorBoundary>
└── NO → Continue...

Is this section critical to page function?
├── YES → Wrap with <SectionErrorBoundary>
└── NO → Continue...

Does this component fetch external data?
├── YES → Wrap with <SectionErrorBoundary>
└── NO → Continue...

Is this component complex (>100 lines)?
├── YES → Consider <SectionErrorBoundary>
└── NO → No boundary needed (parent will catch)
```

---

## 🚨 **Common Mistakes & Fixes**

### ❌ Mistake 1: No Error Boundaries
```typescript
// BAD
export default function MyPage() {
  return (
    <div>
      <ComplexComponent />  // Crashes entire page
    </div>
  );
}
```

**✅ Fix:**
```typescript
// GOOD
export default function MyPage() {
  return (
    <PageErrorBoundary>
      <div>
        <SectionErrorBoundary sectionName="Complex">
          <ComplexComponent />  // Crashes only this section
        </SectionErrorBoundary>
      </div>
    </PageErrorBoundary>
  );
}
```

---

### ❌ Mistake 2: Tight Coupling
```typescript
// BAD
function UserCard({ userId }: { userId: string }) {
  const data = await fetch(`https://api.example.com/users/${userId}`);
  // Tightly coupled to specific API
}
```

**✅ Fix:**
```typescript
// GOOD
interface UserCardProps {
  user: User;  // Depends on interface, not implementation
}

function UserCard({ user }: UserCardProps) {
  // Works with any User data source
}

// Usage
const user = await fetchUser(userId);  // Data fetching separated
<UserCard user={user} />
```

---

### ❌ Mistake 3: Mixed Concerns
```typescript
// BAD
function DashboardWidget() {
  const data = fetchData();           // Data layer
  const processed = calculateStats(); // Business logic
  const formatted = formatForUI();    // Presentation logic
  return <div>{formatted}</div>;      // UI
}
```

**✅ Fix:**
```typescript
// GOOD

// Data layer (hook)
function useDashboardData() {
  return useQuery({ ... });
}

// Business logic (util)
function calculateStats(data: Data) {
  return { ... };
}

// Presentation layer (component)
function DashboardWidget() {
  const { data } = useDashboardData();
  const stats = calculateStats(data);
  return <DashboardUI stats={stats} />;
}
```

---

### ❌ Mistake 4: God Component
```typescript
// BAD
function MassiveDashboard() {
  // 800 lines of code
  // Does everything
  // Impossible to test
  // Impossible to maintain
}
```

**✅ Fix:**
```typescript
// GOOD
function Dashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardStats />
      <DashboardCharts />
      <DashboardActivity />
    </div>
  );
}

// Each component is focused, testable, maintainable
```

---

## 💡 **Best Practices Summary**

### **Component Size Guidelines:**
- **Page components**: < 500 lines
- **Feature components**: < 300 lines  
- **UI components**: < 150 lines
- **Utility components**: < 100 lines

**If larger:** Break into smaller components!

### **Dependency Guidelines:**
- ✅ Props injection
- ✅ Context for shared state
- ✅ Custom hooks for reusable logic
- ❌ Direct API imports in components
- ❌ Global state mutations
- ❌ Hardcoded service calls

### **Error Boundary Guidelines:**
- ✅ One per page (PageErrorBoundary)
- ✅ One per major section (SectionErrorBoundary)
- ✅ One per complex/data-heavy component
- ❌ Don't over-wrap (every tiny component)
- ❌ Don't under-wrap (no boundaries at all)

---

## 📖 **Real-World Examples**

### **Example 1: Simple Component (No Boundary Needed)**
```typescript
// Small, pure UI component - parent's boundary will catch errors
function Badge({ label, variant }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {label}
    </span>
  );
}
```

### **Example 2: Complex Component (Needs Boundary)**
```typescript
// Complex data visualization - wrap in boundary
<SectionErrorBoundary sectionName="SalaryChart">
  <SalaryProgressionChart 
    data={salaryData}
    onPointClick={handleClick}
  />
</SectionErrorBoundary>
```

### **Example 3: Page Component (Needs Full Protection)**
```typescript
// Full page - needs PageErrorBoundary + section boundaries
export default function StaffProfile() {
  return (
    <PageErrorBoundary>
      <div>
        <StaffHeader />
        
        <SectionErrorBoundary sectionName="Timeline">
          <Timeline />
        </SectionErrorBoundary>
        
        <SectionErrorBoundary sectionName="Reviews">
          <Reviews />
        </SectionErrorBoundary>
      </div>
    </PageErrorBoundary>
  );
}
```

---

## 🎓 **Learning Resources**

### **Key Concepts:**
- **SOLID Principles** - Single responsibility, Open/closed, etc.
- **Composition over Inheritance** - Build from small pieces
- **Dependency Injection** - Pass dependencies, don't import them
- **Error Boundaries** - Catch errors without crashing
- **Contract-based Design** - Depend on interfaces, not implementations

### **Further Reading:**
- React Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- Component Composition: https://react.dev/learn/passing-props-to-a-component
- TypeScript Best Practices: https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html

---

## 🚀 **Quick Start Command**

When creating a new component, run:
```bash
# Create component with template
npm run create:component MyComponent

# Or manually:
# 1. Create file: src/components/MyComponent.tsx
# 2. Copy component template from this doc
# 3. Update interfaces and implementation
# 4. Add error boundaries where needed
# 5. Test in isolation
```

---

## ✅ **Success Metrics**

Your component architecture is healthy when:

- ✅ Pages load fast (< 2s)
- ✅ Sections can fail without breaking page
- ✅ Components can be tested in isolation
- ✅ New features can be added without refactoring
- ✅ Code is easy to understand and maintain
- ✅ TypeScript has zero `any` types
- ✅ All components < 300 lines

---

**Remember: Good architecture prevents problems. Great architecture makes problems recoverable!**

---

Built with ❤️ for TeddyKids LMS  
Last updated: October 6, 2025
