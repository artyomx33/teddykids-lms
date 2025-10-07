/**
 * DocumentUploadDialog Component
 * 
 * Modal for uploading new documents
 * Supports document type selection, "Other" with custom label,
 * expiry date for applicable documents, and file upload
 */

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, Calendar as CalendarIcon, X } from "lucide-react";
import { useDocumentTypes } from '../hooks/useDocumentTypes';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from 'sonner';

interface DocumentUploadDialogProps {
  staffId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedDocTypeId?: string; // ✅ NEW: Pre-select document type
  onSuccess?: () => void;
}

export function DocumentUploadDialog({
  staffId,
  open,
  onOpenChange,
  preSelectedDocTypeId,
  onSuccess,
}: DocumentUploadDialogProps) {
  const { documentTypes, loading: typesLoading } = useDocumentTypes();
  const { upload, uploadState, reset } = useDocumentUpload(staffId);

  // Form state
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [hasExpiryDate, setHasExpiryDate] = useState<boolean>(false); // ✅ NEW: Optional expiry checkbox
  const [notes, setNotes] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // File input ref for clearing
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get selected document type
  const selectedType = documentTypes.find((t) => t.id === selectedTypeId);
  const isOtherType = selectedType?.code === 'OTHER';
  const requiresExpiry = selectedType?.requires_expiry || false;

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedTypeId('');
      setCustomLabel('');
      setExpiryDate(undefined);
      setHasExpiryDate(false); // ✅ Reset checkbox
      setNotes('');
      setSelectedFile(null);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      reset();
    }
  }, [open, reset]);

  // ✅ NEW: Auto-select document type when preSelectedDocTypeId is provided
  useEffect(() => {
    if (preSelectedDocTypeId && open && documentTypes.length > 0) {
      setSelectedTypeId(preSelectedDocTypeId);
    }
  }, [preSelectedDocTypeId, open, documentTypes]);

  // ✅ NEW: Auto-enable expiry checkbox if document type requires it
  useEffect(() => {
    if (requiresExpiry) {
      setHasExpiryDate(true);
    }
  }, [requiresExpiry]);

  // Auto-set expiry date based on document type default
  useEffect(() => {
    if (selectedType?.requires_expiry && selectedType?.default_expiry_months) {
      const defaultExpiry = new Date();
      defaultExpiry.setMonth(defaultExpiry.getMonth() + selectedType.default_expiry_months);
      setExpiryDate(defaultExpiry);
    } else if (!selectedType?.requires_expiry) {
      setExpiryDate(undefined);
    }
  }, [selectedType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        // Clear the input so user can re-select
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedTypeId) {
      toast.error('Please select a document type');
      return;
    }

    if (isOtherType && !customLabel.trim()) {
      toast.error('Please provide a label for the document');
      return;
    }

    // ✅ Check if expiry date is required (by type OR by user checkbox)
    if ((requiresExpiry || hasExpiryDate) && !expiryDate) {
      toast.error('Please select an expiry date');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      await upload({
        staff_id: staffId,
        document_type_id: selectedTypeId,
        file: selectedFile,
        custom_label: isOtherType ? customLabel : undefined,
        expires_at: hasExpiryDate ? expiryDate : undefined, // ✅ Only include if checkbox enabled
        notes: notes.trim() || undefined,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      // Error toast handled by hook
    }
  };

  const canSubmit = selectedTypeId && selectedFile && 
    (!isOtherType || customLabel.trim()) &&
    (!requiresExpiry || expiryDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </DialogTitle>
          <DialogDescription>
            Upload a new document for this staff member
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type *</Label>
            <Select
              value={selectedTypeId}
              onValueChange={setSelectedTypeId}
              disabled={typesLoading || uploadState.uploading}
            >
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type..." />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <span>{type.name}</span>
                      {type.is_required && (
                        <span className="text-xs text-muted-foreground">(Required)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Label (for "Other" type) */}
          {isOtherType && (
            <div className="space-y-2">
              <Label htmlFor="custom-label">Document Label *</Label>
              <Input
                id="custom-label"
                placeholder="e.g., Work Permit, Portfolio..."
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                disabled={uploadState.uploading}
              />
            </div>
          )}

          {/* ✅ NEW: Expiry Date Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-expiry"
              checked={hasExpiryDate}
              onCheckedChange={(checked) => {
                setHasExpiryDate(checked === true);
                if (!checked) {
                  setExpiryDate(undefined); // Clear date if unchecked
                }
              }}
              disabled={uploadState.uploading || requiresExpiry} // Disable if document type requires it
            />
            <Label
              htmlFor="has-expiry"
              className="text-sm font-normal cursor-pointer"
            >
              This document has an expiry date
              {requiresExpiry && (
                <span className="text-xs text-muted-foreground ml-2">(Required for this type)</span>
              )}
            </Label>
          </div>

          {/* Expiry Date (if checkbox enabled) */}
          {hasExpiryDate && (
            <div className="space-y-2">
              <Label>Expiry Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground"
                    )}
                    disabled={uploadState.uploading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {selectedType?.default_expiry_months && (
                <p className="text-xs text-muted-foreground">
                  Default: {selectedType.default_expiry_months} months from now
                </p>
              )}
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">File *</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={uploadState.uploading}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                className="cursor-pointer"
              />
              {selectedFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedFile(null);
                    // Clear the input
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={uploadState.uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="truncate">{selectedFile.name}</span>
                <span>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Accepted: PDF, Word, Images (Max 10MB)
            </p>
          </div>

          {/* Notes (optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={uploadState.uploading}
              rows={3}
            />
          </div>

          {/* Upload Progress */}
          {uploadState.uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadState.progress}%</span>
              </div>
              <Progress value={uploadState.progress} className="h-2" />
            </div>
          )}

          {/* Error Message */}
          {uploadState.error && (
            <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md">
              {uploadState.error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploadState.uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || uploadState.uploading}
            >
              {uploadState.uploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

