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

### ⚠️ Important Pre-Migration Checks

**Before running migrations, verify:**
1. Database is awake (not paused on free tier)
2. Check latest applied migration:
```sql
SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 1;
```
3. Ensure your migration timestamps come AFTER the latest migration

### Run Migration
```bash
cd /Users/artyomx/projects/teddykids-lms-main
supabase db push
```

**If you get "connection refused"**: Database is likely paused. Go to Supabase Dashboard → Settings → Database → Resume.

**If you get "found local migration files to be inserted before"**: You have old migrations blocking. Options:
1. Move old migrations to `_old_migrations/` folder
2. Use `--include-all` flag (risky if old migrations have errors)
3. Rename your migrations to have newer timestamps

### Our Solution (TeddyKids Specific)
We renamed migrations from `20251007*` to `20251006240*` to come after the last applied migration (`20251006230000`).

### Verify Migration Success
```sql
-- Check new column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'staff_documents' 
  AND column_name = 'last_reminder_sent_at';

-- Expected: 1 row

-- Check unique index for duplicate prevention
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'staff_documents' 
  AND indexname = 'idx_unique_current_document';

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

-- Verify storage bucket
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'staff-documents';

-- Expected: 1 row, public=false, file_size_limit=10485760
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

### Issue: "Connection refused" to database
**Cause**: Database is paused (common on free tier after inactivity)  
**Solution**: 
1. Go to Supabase Dashboard
2. Check if database shows as "Paused"
3. Click "Resume" or "Restart"
4. Wait 30 seconds, then retry `supabase db push`

---

### Issue: "Referenced relation 'staff' is not a table"
**Cause**: `staff` is a VIEW in TeddyKids raw data architecture, can't use foreign keys  
**Solution**: Remove foreign key constraint, use application-level integrity checking
```sql
-- Instead of:
staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,

-- Use:
staff_id uuid NOT NULL, -- FK handled at application level
```

---

### Issue: "Syntax error at or near FILTER"
**Cause**: PostgreSQL requires cast AFTER FILTER clause, not before  
**Solution**: 
```sql
-- Wrong:
COUNT(*)::integer FILTER (WHERE condition)

-- Correct:
COUNT(*) FILTER (WHERE condition)::integer
```

---

### Issue: "Column 'user_id' does not exist"
**Cause**: `staff` view doesn't expose `user_id` column  
**Solution**: Simplify RLS policies to authenticated-only, handle staff ownership in application
```sql
-- Instead of checking staff.user_id:
USING (true)  -- Authenticated users can access
```

---

### Issue: "Must be owner of relation objects"
**Cause**: Can't add comments to storage.objects without superuser privileges  
**Solution**: Remove COMMENT ON POLICY statements for storage.objects

---

### Issue: "Found local migration files to be inserted before"
**Cause**: Old unmigrated files exist with timestamps between last applied migration and your new migrations  
**Solution**: 
1. Check last applied migration:
   ```sql
   SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 1;
   ```
2. Option A: Rename your migrations to come AFTER the last applied one
3. Option B: Move old migrations to `_old_migrations/` folder
4. Option C: Use `--include-all` flag (risky if old migrations have errors)

---

### Issue: "Function does not exist: initialize_staff_required_documents"
**Solution**: Migration didn't run. Re-run `supabase db push`

---

### Issue: "Storage object not found" or 403 errors
**Solution**: 
1. Check bucket is named `staff-documents`
2. Verify RLS policies exist on `storage.objects`
3. Confirm signed URLs are being used (not public URLs)
4. Verify service in `documentService.ts` uses `createSignedUrl()` not `getPublicUrl()`

---

### Issue: Expired docs still hidden
**Solution**: 
1. Check `check_document_expiry()` function was updated (should NOT set `is_current=false`)
2. Verify query uses `.or('is_current.eq.true,status.eq.expired,status.eq.missing')`
3. Clear React Query cache: localStorage.clear() or hard refresh

---

### Issue: Duplicate document placeholders
**Cause**: ON CONFLICT clause included `id` which is always unique  
**Solution**: 
1. Verify unique partial index exists:
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename = 'staff_documents' 
   AND indexname = 'idx_unique_current_document';
   ```
2. If duplicates already exist, clean up:
   ```sql
   -- Find duplicates
   SELECT staff_id, document_type_id, COUNT(*) 
   FROM staff_documents 
   WHERE status = 'missing' AND is_current = true
   GROUP BY staff_id, document_type_id 
   HAVING COUNT(*) > 1;
   
   -- Delete duplicates (keeps oldest)
   DELETE FROM staff_documents 
   WHERE id IN (
     SELECT id 
     FROM (
       SELECT id, ROW_NUMBER() OVER (
         PARTITION BY staff_id, document_type_id 
         ORDER BY created_at ASC
       ) as rn
       FROM staff_documents 
       WHERE status = 'missing' AND is_current = true
     ) sub
     WHERE rn > 1
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

