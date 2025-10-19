# 🔧 Sync Page CORS Fix - Comprehensive Plan

**Date**: October 5, 2025  
**Issue**: CORS error when calling Edge Functions from frontend  
**Status**: Analysis Complete - Ready to Fix

---

## 🐛 PROBLEM BREAKDOWN

### Error 1: CORS Policy Violation
```
Access to fetch at 'https://gjlgaufihseaagzmidhc.supabase.co/functions/v1/hyper-endpoint' 
from origin 'http://localhost:8080' has been blocked by CORS policy
```

**Root Cause:**
- Edge Functions don't have CORS headers configured
- Browser blocks the request during preflight (OPTIONS)

---

### Error 2: Wrong Function Names
```typescript
// ❌ WRONG (using Supabase slugs)
await supabase.functions.invoke('hyper-endpoint')
await supabase.functions.invoke('rapid-responder')
await supabase.functions.invoke('dynamic-function')

// ✅ CORRECT (using actual function names)
await supabase.functions.invoke('employes-snapshot-collector')
await supabase.functions.invoke('employes-history-collector')
await supabase.functions.invoke('employes-change-detector')
```

---

### Error 3: Functions Not Designed for Manual Triggering
**Current Design:**
- Functions are designed to run on a schedule
- No explicit trigger endpoint
- No request body handling for manual invocation

**What We Need:**
- Functions that can be called from frontend
- Proper request/response handling
- CORS headers for browser access

---

## 🎯 SOLUTION OPTIONS

### **Option A: Fix Edge Functions (RECOMMENDED)**
**Pros:**
- Proper architecture
- Functions can be called from anywhere
- Reusable for future features

**Cons:**
- Need to update 3 function files
- Need to redeploy functions

**Effort:** Medium (30 minutes)

---

### **Option B: Create a Single "Trigger Sync" Function**
**Pros:**
- One function to rule them all
- Simpler frontend code
- Easier to maintain

**Cons:**
- Need to create new function
- Functions call other functions (more complex)

**Effort:** Medium (30 minutes)

---

### **Option C: Use Database Triggers (Backend-Only)**
**Pros:**
- No CORS issues
- Frontend just inserts a record
- Functions run automatically

**Cons:**
- Less real-time feedback
- Harder to show progress
- More complex architecture

**Effort:** High (1 hour)

---

## ✅ RECOMMENDED SOLUTION: Option A + B Hybrid

### **Step 1: Create Master Trigger Function** ⭐
Create ONE new function that orchestrates everything:

**File**: `supabase/functions/employes-sync-trigger/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create sync session
    const { data: session } = await supabase
      .from('employes_sync_sessions')
      .insert({
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    // Step 1: Snapshot
    const snapshotResult = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/employes-snapshot-collector`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: session.id })
      }
    )

    // Step 2: History
    const historyResult = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/employes-history-collector`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: session.id })
      }
    )

    // Step 3: Changes
    const changesResult = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/employes-change-detector`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: session.id })
      }
    )

    // Update session
    await supabase
      .from('employes_sync_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', session.id)

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
        message: 'Sync completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

---

### **Step 2: Update Frontend to Call New Function**

**File**: `src/components/employes/EmployesSyncControl.tsx`

```typescript
const handleSyncNow = async () => {
  setIsSyncing(true);
  setSyncStatus(prev => ({ ...prev, status: 'syncing' }));

  try {
    toast({
      title: "🔄 Sync Started",
      description: "Collecting employee data from Employes.nl...",
    });

    // Call the master trigger function
    const { data, error } = await supabase.functions.invoke('employes-sync-trigger', {
      body: { action: 'sync_all' }
    });

    if (error) {
      throw new Error(`Sync failed: ${error.message}`);
    }

    // Success!
    toast({
      title: "✅ Sync Completed",
      description: `Successfully synced employees. Check Recent Changes for updates.`,
    });

    // Reload status
    await loadSyncStatus();
  } catch (error: any) {
    console.error('Sync failed:', error);
    toast({
      title: "❌ Sync Failed",
      description: error.message || "An error occurred during sync",
      variant: "destructive",
    });
    setSyncStatus(prev => ({ ...prev, status: 'error' }));
  } finally {
    setIsSyncing(false);
  }
};
```

---

### **Step 3: Add CORS to Existing Functions** (Optional but Recommended)

Update all 3 existing functions to handle CORS:

**Pattern to add to each function:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // ... existing code ...

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Create Master Trigger Function ✅ NEXT
- [ ] Create `supabase/functions/employes-sync-trigger/index.ts`
- [ ] Create `supabase/functions/employes-sync-trigger/deno.json`
- [ ] Add CORS headers
- [ ] Add session tracking
- [ ] Call 3 microservices in sequence
- [ ] Handle errors gracefully
- [ ] Deploy function

### Phase 2: Update Frontend
- [ ] Fix `EmployesSyncControl.tsx` to call new function
- [ ] Remove old function invocations
- [ ] Test sync button

### Phase 3: Add CORS to Existing Functions (Optional)
- [ ] Update `employes-snapshot-collector/index.ts`
- [ ] Update `employes-history-collector/index.ts`
- [ ] Update `employes-change-detector/index.ts`
- [ ] Redeploy all 3 functions

### Phase 4: Testing
- [ ] Test sync from frontend
- [ ] Verify CORS works
- [ ] Check data flows correctly
- [ ] Verify changes are detected
- [ ] Test error handling

---

## 🚀 ALTERNATIVE: Quick Fix (Frontend Only)

If we can't deploy new functions right now, we can use a **workaround**:

### **Option: Call Functions via HTTP (No Supabase SDK)**

```typescript
const handleSyncNow = async () => {
  setIsSyncing(true);

  try {
    // Get anon key from env
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Call snapshot collector directly
    const snapshotResponse = await fetch(
      `${supabaseUrl}/functions/v1/employes-snapshot-collector`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'collect' })
      }
    );

    // ... repeat for other functions ...

  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    setIsSyncing(false);
  }
};
```

**But this still requires CORS headers in the functions!**

---

## 🎯 RECOMMENDED APPROACH

**Best Solution: Create Master Trigger Function**

### Why?
1. ✅ Clean architecture (one entry point)
2. ✅ Easy to add CORS headers
3. ✅ Orchestrates all 3 functions
4. ✅ Tracks sync sessions properly
5. ✅ Easy to extend later
6. ✅ Frontend code stays simple

### Effort:
- Create function: 15 minutes
- Deploy function: 5 minutes
- Update frontend: 5 minutes
- Test: 5 minutes

**Total: 30 minutes**

---

## 📝 NEXT STEPS

1. **Create `employes-sync-trigger` function** ⭐ START HERE
2. **Deploy to Supabase**
3. **Update frontend to call new function**
4. **Test sync flow**
5. **Celebrate!** 🎉

---

**Ready to implement?** Let's start with the master trigger function! 🚀
