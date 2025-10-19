# 📋 Document System Fixes - Phase 2 Plan

## 🔴 PROBLEMS IDENTIFIED

### Problem 1: Documents Don't Show After Upload ❌
**Root Cause**: `document_types` table is **EMPTY** - no seed data!
- Migration creates the tables but doesn't add IDW, VOG, EHBO, etc.
- Without document types, the system has nothing to track
- Uploads might fail or not be associated with any type

### Problem 2: Required Docs Don't Show as "Missing" ❌
**Root Cause**: `initializeStaffDocuments()` is never called
- The function exists but isn't triggered when viewing a staff profile
- Without initialization, no "missing" placeholders are created
- Card shows "No document data available" or 0/0 progress

### Problem 3: No "Documents" Tab ❌
**Current State**: Only "Overview" and "Employment Journey" tabs exist
**Needed**: Dedicated "Documents" tab with comprehensive table view

---

## ✅ SOLUTION PLAN

### Phase 2.1: Seed Document Types (BLOCKING)
**Priority**: 🔴 CRITICAL - Must do first!

Create migration: `20251007000000_seed_document_types.sql`

```sql
-- Seed all required document types for Dutch childcare
INSERT INTO document_types (code, display_name, description, category, is_required, requires_expiry) VALUES
  -- Identity & Background
  ('IDW', 'ID/Passport', 'Valid identification document', 'identity', true, true),
  ('VOG', 'VOG (Certificate of Conduct)', 'Verklaring Omtrent Gedrag', 'background_check', true, true),
  
  -- Health & Safety
  ('EHBO', 'EHBO Certificate', 'First Aid certification', 'health_safety', true, true),
  ('3F', 'Child First Aid (3F)', 'Pediatric first aid certification', 'health_safety', true, true),
  ('PRK', 'Basic Pedagogical Certificate', 'Pedagogisch Reken Kernpunten', 'qualification', true, false),
  
  -- Qualifications
  ('DIPLOMA_MBO', 'MBO Diploma', 'MBO level childcare qualification', 'qualification', true, false),
  ('DIPLOMA_HBO', 'HBO Diploma', 'HBO level childcare qualification', 'qualification', false, false),
  ('SPW3', 'SPW Level 3', 'Gespecialiseerd Pedagogisch Werk level 3', 'qualification', false, false),
  
  -- Work Authorization
  ('WORK_PERMIT', 'Work Permit', 'Non-EU work authorization', 'work_auth', false, true),
  ('BSN', 'BSN Registration', 'Burgerservicenummer proof', 'identity', true, false),
  
  -- Health
  ('HEALTH_DECL', 'Health Declaration', 'Health fitness declaration', 'health_safety', true, true),
  ('VACCINATION', 'Vaccination Record', 'Immunization records', 'health_safety', false, true),
  
  -- Training
  ('CODE_RED', 'Code Red Training', 'Emergency response training', 'training', true, true),
  ('ORIENTATION', 'Orientation Completion', 'Onboarding completion certificate', 'training', true, false),
  
  -- Other
  ('OTHER', 'Other Document', 'Custom document type', 'other', false, false)
ON CONFLICT (code) DO NOTHING;
```

**Impact**: 
- ✅ Creates 15 document types
- ✅ Marks 9 as required (IDW, VOG, EHBO, 3F, PRK, MBO Diploma, BSN, Health Declaration, Code Red, Orientation)
- ✅ Configures expiry tracking where needed

---

### Phase 2.2: Auto-Initialize Documents on Profile Load
**Priority**: 🟡 HIGH

**File**: `src/pages/StaffProfile.tsx`

Add `useEffect` to initialize documents when profile loads:

```tsx
// Import at top
import { initializeStaffDocuments } from "@/features/documents";

// Add after staff data loads (around line 100)
useEffect(() => {
  if (data?.staff?.id) {
    // Initialize required document placeholders
    initializeStaffDocuments(data.staff.id).catch(err => {
      console.error('Failed to initialize documents:', err);
    });
  }
}, [data?.staff?.id]);
```

**Impact**:
- ✅ Creates "missing" placeholders automatically
- ✅ DocumentStatusCard will show "7 missing" badge
- ✅ Required docs appear in checklist with red X icons
- ✅ No manual initialization needed

---

### Phase 2.3: Add "Documents" Tab
**Priority**: 🟡 HIGH

**File**: `src/pages/StaffProfile.tsx`

#### A. Add Tab Trigger (around line 538)
```tsx
<TabsList className="grid w-full grid-cols-3">
  <TabsTrigger value="overview">
    <Star className="mr-2 h-4 w-4" />
    Overview
  </TabsTrigger>
  <TabsTrigger value="documents">  {/* NEW */}
    <FileText className="mr-2 h-4 w-4" />
    Documents
  </TabsTrigger>
  <TabsTrigger value="contracts">
    <FileText className="mr-2 h-4 w-4" />
    Employment Journey
  </TabsTrigger>
</TabsList>
```

#### B. Add Tab Content
Create new component: `src/components/staff/StaffDocumentsTab.tsx`

```tsx
/**
 * StaffDocumentsTab Component
 * 
 * Comprehensive document management view:
 * - Table view of all documents (required + optional)
 * - Status badges (uploaded, missing, expired, expiring soon)
 * - Expiry date column
 * - Download/upload actions per row
 * - Filter by status (all, missing, expiring)
 * - Sort by type, status, expiry
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Download, 
  Upload, 
  Trash2, 
  MoreVertical,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useStaffDocuments, useDocumentUpload } from "@/features/documents";
import { DocumentUploadDialog } from "@/features/documents";
import { getExpiryInfo, formatFileSize } from "@/features/documents/types";
import { format } from "date-fns";

interface StaffDocumentsTabProps {
  staffId: string;
}

export function StaffDocumentsTab({ staffId }: StaffDocumentsTabProps) {
  const { documents, loading, refetch } = useStaffDocuments(staffId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  const handleUploadClick = (docTypeId?: string) => {
    setSelectedDocType(docTypeId || null);
    setUploadOpen(true);
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    // TODO: Implement download with signed URL
    console.log('Download:', filePath);
  };

  const getStatusBadge = (status: string, expiresAt?: string) => {
    if (status === 'missing') {
      return (
        <Badge variant="outline" className="gap-1">
          <XCircle className="h-3 w-3" />
          Missing
        </Badge>
      );
    }

    if (status === 'expired') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }

    const expiryInfo = getExpiryInfo({ status, expires_at: expiresAt } as any);
    
    if (expiryInfo.is_expiring_soon) {
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700">
          <Clock className="h-3 w-3" />
          Expires in {expiryInfo.days_until_expiry}d
        </Badge>
      );
    }

    return (
      <Badge className="gap-1 bg-emerald-100 text-emerald-800 border-emerald-300">
        <CheckCircle className="h-3 w-3" />
        Valid
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>All Documents ({documents.length})</span>
            </div>
            <Button onClick={() => handleUploadClick()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => {
                const isRequired = doc.is_required;
                const hasFile = doc.status === 'uploaded';
                
                return (
                  <TableRow key={doc.id}>
                    {/* Document Type */}
                    <TableCell className="font-medium">
                      {doc.display_name}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      {getStatusBadge(doc.status, doc.expires_at)}
                    </TableCell>

                    {/* Required Badge */}
                    <TableCell>
                      {isRequired ? (
                        <Badge variant="secondary">Required</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Optional</span>
                      )}
                    </TableCell>

                    {/* Expiry Date */}
                    <TableCell>
                      {doc.expires_at ? (
                        <span className="text-sm">
                          {format(new Date(doc.expires_at), 'MMM dd, yyyy')}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">No expiry</span>
                      )}
                    </TableCell>

                    {/* Upload Date */}
                    <TableCell>
                      {hasFile && doc.uploaded_at ? (
                        <span className="text-sm">
                          {format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* File Name */}
                    <TableCell>
                      {hasFile && doc.file_name ? (
                        <span className="text-sm text-muted-foreground">
                          {doc.file_name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {hasFile && doc.file_path && (
                            <DropdownMenuItem 
                              onClick={() => handleDownload(doc.file_path!, doc.file_name!)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleUploadClick(doc.document_type_id)}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {hasFile ? 'Replace' : 'Upload'}
                          </DropdownMenuItem>
                          {hasFile && (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                // TODO: Implement delete
                                console.log('Delete:', doc.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DocumentUploadDialog
        staffId={staffId}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        preSelectedDocTypeId={selectedDocType || undefined}
        onSuccess={() => {
          refetch();
          setUploadOpen(false);
        }}
      />
    </>
  );
}
```

#### C. Wire into StaffProfile
```tsx
import { StaffDocumentsTab } from "@/components/staff/StaffDocumentsTab";

// Add new TabsContent (after overview, before contracts)
<TabsContent value="documents">
  <StaffDocumentsTab staffId={data.staff.id} />
</TabsContent>
```

**Impact**:
- ✅ Dedicated tab for document management
- ✅ Table view with all document types
- ✅ Shows status, expiry, file info
- ✅ Download/upload/delete actions per row
- ✅ Visual hierarchy: required vs optional
- ✅ Replaces need to scroll through Overview tab

---

### Phase 2.4: Fix Upload Dialog Pre-Selection
**Priority**: 🟢 MEDIUM

**File**: `src/features/documents/components/DocumentUploadDialog.tsx`

Add prop to pre-select document type when uploading from table:

```tsx
interface DocumentUploadDialogProps {
  // ... existing props
  preSelectedDocTypeId?: string;  // NEW
}

// In component
useEffect(() => {
  if (preSelectedDocTypeId) {
    setSelectedDocType(preSelectedDocTypeId);
  }
}, [preSelectedDocTypeId, open]);
```

**Impact**:
- ✅ Click "Upload" on VOG row → dialog opens with VOG pre-selected
- ✅ Better UX for targeted uploads

---

## 📊 IMPLEMENTATION ORDER

### Step 1: Seed Document Types ⏱️ 5 min
1. Create migration file
2. Run `supabase db push`
3. Verify in Supabase dashboard: `document_types` has 15 rows

### Step 2: Auto-Initialize ⏱️ 10 min
1. Add `useEffect` to StaffProfile
2. Test: Load Antonella's profile
3. Check database: `staff_documents` should have 9 "missing" rows for her

### Step 3: Documents Tab ⏱️ 30 min
1. Create `StaffDocumentsTab` component
2. Add tab trigger and content to StaffProfile
3. Test: Click "Documents" tab → see table with all 15 doc types

### Step 4: Upload Dialog Enhancement ⏱️ 10 min
1. Add `preSelectedDocTypeId` prop
2. Wire from table actions
3. Test: Upload flow from table

**Total Time**: ~55 minutes

---

## 🎯 SUCCESS CRITERIA

### Before (Current State) ❌
- [ ] Upload document → nothing shows
- [ ] DocumentStatusCard shows "No document data available"
- [ ] No way to see all document types
- [ ] Only "Overview" and "Employment Journey" tabs

### After (Expected) ✅
- [x] Upload document → appears in table
- [x] DocumentStatusCard shows "7 missing" badge
- [x] Required docs show with red X and "Missing" badge
- [x] "Documents" tab shows comprehensive table view
- [x] Can upload/download/delete from table
- [x] Expiry dates visible
- [x] Status badges for all states (missing, valid, expiring, expired)

---

## 🚀 READY TO PROCEED?

This plan will:
1. ✅ Fix why Antonella's docs don't show (seed + initialize)
2. ✅ Show required docs as "missing" (auto-initialize)
3. ✅ Add Documents tab with full table view (new component)
4. ✅ Make system production-ready for 30+ staff members

**Approve this plan and I'll implement immediately!** 🔥


