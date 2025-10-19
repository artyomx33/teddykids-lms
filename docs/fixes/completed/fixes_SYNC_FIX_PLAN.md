# 🔧 SYNC FIX PLAN - Empty Raw Data Issue

## 🐛 THE PROBLEM

When you clicked "Sync Now":
1. ✅ Orchestrator ran successfully
2. ✅ Called all 3 functions (snapshot, history, changes)
3. ❌ BUT no data was stored in `employes_raw_data`
4. ❌ Therefore, 0 changes detected
5. ❌ Timeline has old events but no new ones

## 🔍 ROOT CAUSE ANALYSIS

### **Issue 1: Function Communication**
The orchestrator calls functions but they might not be processing correctly:
- Orchestrator sends: `{ session_id: "xxx" }`
- But collectors expect: `{ mode: "full", employeeIds: null }`

### **Issue 2: No Error Reporting**
Functions are failing silently:
- No raw data stored
- But sync reports "success"
- No errors bubbled up

## 💡 THE FIX

### **Option A: Quick Fix - Direct API Test**
Test the snapshot collector directly to see what's happening:

```bash
curl -L -X POST 'https://gjlgaufihseaagzmidhc.supabase.co/functions/v1/hyper-endpoint' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  --data '{"mode":"test"}'
```

### **Option B: Fix Orchestrator Communication**
Update the orchestrator to pass correct parameters:

```typescript
// Instead of:
await supabase.functions.invoke('hyper-endpoint', {
  body: { session_id: session.id }
})

// Should be:
await supabase.functions.invoke('hyper-endpoint', {
  body: { 
    mode: 'full',
    session_id: session.id 
  }
})
```

### **Option C: Fix Collectors to Accept session_id**
Update collectors to handle both parameter formats:

```typescript
const { 
  mode = 'full', 
  employeeIds = null,
  session_id  // Accept this too!
} = await req.json().catch(() => ({}));
```

## 🎯 IMMEDIATE ACTION

Let's do **Option B** - Fix the orchestrator to pass the right parameters!

This is the cleanest solution because:
1. Orchestrator should know what each function needs
2. Keeps functions independent
3. Easy to test

## 📝 CHANGES NEEDED

1. **Update `employes-sync-trigger/index.ts`**:
   - Pass `mode: 'full'` to snapshot collector
   - Pass `mode: 'full'` to history collector
   - Pass correct params to change detector

2. **Test the fix**:
   - Deploy updated orchestrator
   - Run sync again
   - Verify raw_data gets populated

Want me to implement this fix now?
