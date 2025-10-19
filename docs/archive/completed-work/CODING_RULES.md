# 🔧 TeddyKids LMS Coding Rules

## Mock Data Rules

### ⚠️ CRITICAL: Mock Data Visibility
- **NEVER use mock data without clear indicators**
- **ALWAYS append `*** MOCK DATA ***` to any mock content**
- Mock data must be immediately identifiable to prevent confusion during debugging
- Use distinctive formatting that stands out in the UI

### 🚫 NO FALLBACKS RULE
- **NEVER create fallbacks or mock data without explicit approval**
- When encountering missing data, **ASK FIRST** before implementing fallbacks
- Propose alternative solutions to the problem instead of hiding it with fallbacks
- Examples of better approaches:
  - Show "No data available" states
  - Display loading skeletons
  - Redirect to data setup pages
  - Show clear error messages with next steps

### Examples:
```typescript
// ❌ BAD - Hidden fallback/mock data
const mockContracts = contracts.length === 0 ? [
  {
    startDate: '2023-01-15',
    endDate: '2024-12-31',
    isActive: true,
    contractType: 'full_time'
  }
] : contracts;

// ❌ STILL BAD - Even with indicators, don't create fallbacks without approval
const mockContracts = contracts.length === 0 ? [
  {
    startDate: '2023-01-15',
    endDate: '2024-12-31 *** MOCK DATA ***',
    isActive: true,
    contractType: 'full_time *** MOCK DATA ***'
  }
] : contracts;

// ✅ GOOD - Show the real state, ask for guidance
if (contracts.length === 0) {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
        <p className="font-medium">No Contract Data Available</p>
        <p className="text-sm text-muted-foreground">Unable to load contract information from Employes.nl</p>
      </CardContent>
    </Card>
  );
}

// ✅ BETTER - Propose solution approach
// TODO: Ask user - should we:
// 1. Show sync status/retry button?
// 2. Redirect to data setup page?
// 3. Show integration health check?
```

### UI Display Rules:
- Mock data should append `*** MOCK DATA ***` to text fields
- Use warning colors or styling when possible
- Add visual indicators like badges or borders
- Include console warnings when mock data is used

## Error Handling Rules

### Database Errors
- Handle missing tables/views gracefully
- Log once with clear context, don't spam console
- Return empty arrays/null for missing data
- Use fallbacks only when necessary and clearly marked

### Decision Process for Missing Data
1. **Identify the root cause** - Why is data missing?
2. **Propose 3 alternative solutions** instead of fallbacks:
   - Empty state with actionable next steps
   - Integration status/health check
   - Data sync retry mechanism
   - Redirect to setup/configuration
3. **Ask for approval** before implementing any solution
4. **Document the decision** and reasoning

### Development vs Production
- Mock data should only be used with explicit approval
- Add environment checks where appropriate
- Clear documentation of what's real vs mock
- **Temporary mock data must have removal timeline**

## Code Quality

### File Organization
- Avoid fallback mechanisms unless approved
- Document all data assumptions
- Use TypeScript for all data structures
- Include data source comments

### Debugging
- Log missing data scenarios clearly
- Include component name and data source in logs
- Make it easy to trace data flow
- **Never hide problems with fallbacks**