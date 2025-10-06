# 🚀 Document System - Quick Deployment Guide

**Target**: Production Deployment  
**Complexity**: Low (1 migration + verification)  
**Estimated Time**: 15 minutes  
**Risk Level**: Low (backwards compatible)

---

## Pre-Flight Checklist

- [ ] Supabase CLI installed and authenticated
- [ ] Database backup completed
- [ ] Staging environment tested
- [ ] Deployment window scheduled (low traffic period)

---

## Step 1: Database Migration (5 min)

### Run Migration
```bash
cd /Users/artyomx/projects/teddykids-lms-main
supabase db push
```

Or manually:
```bash
supabase migration new document_system_fixes
# Copy content from 20251007000002_document_system_fixes.sql
supabase db push
```

### Verify Migration Success
```sql
-- Check new column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'staff_documents' 
  AND column_name = 'last_reminder_sent_at';

-- Expected: 1 row

-- Check RPC function exists
SELECT proname 
FROM pg_proc 
WHERE proname = 'initialize_staff_required_documents';

-- Expected: 1 row

-- Check expiry function updated
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'check_document_expiry';

-- Expected: Should NOT contain "is_current = false" in the UPDATE
```

---

## Step 2: Deploy Frontend (3 min)

### Build & Deploy
```bash
# Install dependencies (if needed)
npm install

# Build
npm run build

# Deploy (Vercel example)
vercel --prod

# Or push to main branch for auto-deploy
git add .
git commit -m "fix: Document system critical fixes - signed URLs, expired doc visibility, deletion logic"
git push origin main
```

---

## Step 3: Smoke Tests (5 min)

### Test 1: Upload Document
1. Navigate to any staff profile
2. Click "Upload Document"
3. Select "VOG" and upload a PDF
4. **✅ Expected**: Success toast, document appears in card

### Test 2: Expired Document Visibility
```sql
-- Manually expire a document
UPDATE staff_documents 
SET status = 'expired', expires_at = CURRENT_DATE - INTERVAL '1 day'
WHERE id = 'test-doc-id';
```
1. Refresh staff profile
2. **✅ Expected**: Document shows with red "Expired" badge (not hidden)

### Test 3: Delete Document
1. Open browser console (F12)
2. In staff profile, find a document and click delete
3. **✅ Expected**: 
   - No errors in console
   - If it was the only doc of that type → "Missing" placeholder appears
   - If other versions exist → Next newest becomes active

### Test 4: File Size Validation
1. Try to upload a 15MB file
2. **✅ Expected**: Error toast, input clears, can re-select files

### Test 5: Download Document
1. Click download on any uploaded document
2. **✅ Expected**: File downloads successfully (no 403 error)

---

## Step 4: Monitoring (Ongoing)

### Metrics to Watch

**Supabase Dashboard**:
- Storage API errors (should be near zero)
- Database query errors (check staff_documents operations)
- RLS policy denials (should not increase)

**Application Logs**:
```javascript
// Look for these errors:
"Storage upload error"
"Database insert error"  
"Get download URL error"
"Initialize staff documents error"
```

### Scheduled Jobs
Verify cron job is running:
```sql
-- Check if cron extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Check scheduled jobs
SELECT * FROM cron.job WHERE jobname = 'check-document-expiry';

-- If not scheduled, add it:
SELECT cron.schedule(
  'check-document-expiry',
  '0 1 * * *',  -- Daily at 1 AM UTC
  $$SELECT check_document_expiry()$$
);
```

---

## Rollback Plan (If Needed)

### Option 1: Quick Rollback (Frontend Only)
```bash
# Revert to previous deployment
vercel rollback

# Or revert git commit
git revert HEAD
git push origin main
```

### Option 2: Full Rollback (Database + Frontend)
```sql
-- Remove new column
ALTER TABLE staff_documents DROP COLUMN IF EXISTS last_reminder_sent_at;

-- Revert expiry function
CREATE OR REPLACE FUNCTION check_document_expiry()
RETURNS void AS $$
BEGIN
  UPDATE staff_documents
  SET 
    status = 'expired',
    is_current = false,  -- OLD BEHAVIOR
    updated_at = now()
  WHERE 
    status = 'uploaded' 
    AND is_current = true
    AND expires_at IS NOT NULL 
    AND expires_at <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop new RPC function
DROP FUNCTION IF EXISTS initialize_staff_required_documents(uuid);
```

Then rollback frontend as above.

---

## Common Issues & Solutions

### Issue: "Function does not exist: initialize_staff_required_documents"
**Solution**: Migration didn't run. Re-run `supabase db push`

### Issue: "Storage object not found" or 403 errors
**Solution**: 
1. Check bucket is named `staff-documents`
2. Verify RLS policies exist on `storage.objects`
3. Confirm signed URLs are being used (not public URLs)

### Issue: Expired docs still hidden
**Solution**: 
1. Check `check_document_expiry()` function was updated
2. Verify query uses `.or('is_current.eq.true,status.eq.expired,status.eq.missing')`
3. Clear React Query cache: localStorage.clear() or hard refresh

### Issue: Duplicate document placeholders
**Solution**: 
1. Find duplicates:
   ```sql
   SELECT staff_id, document_type_id, COUNT(*) 
   FROM staff_documents 
   WHERE status = 'missing' AND is_current = true
   GROUP BY staff_id, document_type_id 
   HAVING COUNT(*) > 1;
   ```
2. Clean up:
   ```sql
   DELETE FROM staff_documents 
   WHERE id IN (
     SELECT id FROM staff_documents 
     WHERE status = 'missing' 
     ORDER BY created_at DESC 
     OFFSET 1
   );
   ```

---

## Success Criteria

- ✅ All 10 test cases pass
- ✅ No increase in error rates
- ✅ Storage download links work
- ✅ Expired documents visible with red badge
- ✅ Document deletion creates placeholders or promotes old versions
- ✅ No duplicate "missing" placeholders
- ✅ File upload audit trail (uploaded_by) populates

---

## Support Contacts

**Technical Issues**: [Your DevOps Team]  
**Database Issues**: [Your DBA Team]  
**Supabase Support**: support@supabase.io  

---

## Post-Deployment

### Week 1
- [ ] Monitor error rates daily
- [ ] Check cron job runs successfully
- [ ] Verify no RLS policy violations
- [ ] Confirm signed URLs working in production

### Week 2
- [ ] Review uploaded_by audit trail for completeness
- [ ] Check for any duplicate document entries
- [ ] Analyze user feedback on file upload experience

### Month 1
- [ ] Plan phase 2 enhancements (historical view, bulk upload, etc.)
- [ ] Consider compliance dashboard implementation
- [ ] Evaluate reminder automation integration

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Sign-off**: _____________  

✅ APPROVED FOR PRODUCTION

