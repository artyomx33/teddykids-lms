# 🔐 TODO: Fix user_roles RLS Policy

**Priority:** 🟡 Low (non-critical, already handled gracefully)  
**Estimated Time:** 5 minutes  
**Status:** ⏳ Pending

---

## 📋 **Issue:**

The `user_roles` table is queried to check if a user is an admin, but it returns a 500 error due to missing Row Level Security (RLS) policy.

**Current State:**
- ✅ Error is caught and handled gracefully
- ✅ Falls back to 'staff' role by default
- ✅ Console error suppressed
- ⚠️ RLS policy needs to be added for proper security

---

## 🎯 **Goal:**

Add proper RLS policy so users can read their own roles from the `user_roles` table.

---

## 🔧 **Solution:**

### **Step 1: Check if table exists**

```sql
-- In Supabase SQL Editor
SELECT * FROM user_roles LIMIT 1;
```

### **Step 2: Add RLS Policy**

```sql
-- Enable RLS (if not already enabled)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own roles
CREATE POLICY "Users can read their own roles" 
ON user_roles 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Optional: Allow service role full access (for admin operations)
CREATE POLICY "Service role full access" 
ON user_roles 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
```

### **Step 3: Test**

```typescript
// Should work without error now:
const { data: userRoles, error } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id);

console.log('User roles:', userRoles); // Should return data, not error
```

### **Step 4: Remove suppression**

In `src/pages/StaffProfile.tsx`, you can remove the error handling once RLS is working:

```typescript
// BEFORE (current):
try {
  const { data: userRoles, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  if (!error) {
    isAdmin = userRoles?.some(r => r.role === 'admin') || false;
  }
} catch (error) {
  // Silently handled - RLS not configured yet
}

// AFTER (once RLS is fixed):
const { data: userRoles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id);

isAdmin = userRoles?.some(r => r.role === 'admin') || false;
```

---

## 📊 **Impact:**

### **Without Fix:**
- ✅ Page works (error handled)
- ⚠️ 500 error in network tab (hidden from user)
- ⚠️ All users default to 'staff' role
- ⚠️ Admin features might not work

### **With Fix:**
- ✅ No errors
- ✅ Proper role detection
- ✅ Admin features work correctly
- ✅ Secure access control

---

## 🔍 **Related Files:**

- `src/pages/StaffProfile.tsx` (lines 236-246)
- `src/integrations/supabase/types.ts` (user_roles type definition)

---

## ⚠️ **Important Notes:**

1. **Don't skip this!** While the error is handled, proper RLS is important for security
2. **Test carefully** - Make sure admins can still access admin features after fix
3. **Document roles** - Create a list of valid roles (admin, manager, staff, etc.)

---

## 🎯 **When to Fix:**

- ✅ **Now:** If you need admin features to work
- ✅ **Soon:** For proper security and clean architecture
- ⏳ **Later:** If admin features aren't used yet

---

## 📝 **Checklist:**

- [ ] Verify `user_roles` table exists
- [ ] Check current RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'user_roles';`
- [ ] Add "Users can read own roles" policy
- [ ] Test with authenticated user
- [ ] Verify admin features work
- [ ] Remove error suppression from code
- [ ] Update this TODO with results

---

**Created:** October 6, 2025  
**Last Updated:** October 6, 2025  
**Assigned To:** Future You 😊

---

**Remember:** This is a nice-to-have improvement, not a critical bug! The app works perfectly without it. ✅
