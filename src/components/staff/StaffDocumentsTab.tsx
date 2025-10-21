import { MouseEvent, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload, Trash2, FileText, AlertCircle, CheckCircle, Clock, XCircle, MoreVertical } from "lucide-react";
import { useStaffDocuments } from "@/features/documents/hooks/useStaffDocuments";
import { DocumentUploadDialog } from "@/features/documents";
import { getExpiryInfo } from "@/features/documents/types";
import { format } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteDocument, getDocumentDownloadUrl } from "@/features/documents/services/documentService";
import { useToast } from "@/hooks/use-toast";
import { StaffDocumentsErrorBoundary } from "@/components/error-boundaries/StaffDocumentsErrorBoundary";

interface StaffDocumentsTabProps {
  staffId: string;
}

function StaffDocumentsTabContent({ staffId }: StaffDocumentsTabProps) {
  const { documents, summary, loading, refetch } = useStaffDocuments(staffId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string | undefined>();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [dragOverRow, setDragOverRow] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const { toast } = useToast();
  const handleUpload = useCallback((documentTypeId?: string) => {
    setSelectedDocumentType(documentTypeId);
    setUploadOpen(true);
  }, []);

  const handleRowClick = useCallback((doc: any) => {
    const docTypeId = doc.type_id ?? doc.document_type_id;
    const hasFile = doc.status === 'uploaded' && doc.file_path;

    if (hasFile) {
      window.open(doc.file_path, '_blank');
    } else {
      handleUpload(docTypeId);
    }
  }, [handleUpload]);

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const url = await getDocumentDownloadUrl(filePath);
      if (url) {
        window.open(url, '_blank');
      } else {
        toast({
          title: "Download Failed",
          description: "Could not generate download link",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (documentId: string, displayName: string) => {
    if (!confirm(`Are you sure you want to delete "${displayName}"?`)) {
      return;
    }

    try {
      const result = await deleteDocument(documentId);
      if (result.success) {
        toast({
          title: "Document Deleted",
          description: `"${displayName}" has been deleted successfully`,
        });
        refetch();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent, docTypeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverRow(docTypeId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverRow(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, docTypeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverRow(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      setPendingFile(file);
      setSelectedDocumentType(docTypeId);
      setUploadOpen(true);
    }
  }, []);

  const getStatusBadge = (status: string, expiresAt?: string) => {
    if (status === 'missing') {
      return (
        <Badge variant="outline" className="gap-1 border-red-500 text-red-700">
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

    if (status === 'uploaded') {
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
        <Badge className="gap-1 bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-100">
          <CheckCircle className="h-3 w-3" />
          Valid
        </Badge>
      );
    }

    return <Badge variant="secondary">{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploaded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const documentList = documents || [];

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Document Management</h2>
          <p className="text-sm text-muted-foreground">
            {summary?.uploaded_count || 0}/{summary?.total_required || 0} required documents uploaded
            {summary?.missing_count > 0 && (
              <span className="text-red-600 ml-2">
                • {summary.missing_count} missing
              </span>
            )}
            {summary?.expired_count > 0 && (
              <span className="text-red-600 ml-2">
                • {summary.expired_count} expired
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => handleUpload()}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Document Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Documents ({documentList.length})
            </CardTitle>
            <Badge variant="outline" className="gap-2">
              <Upload className="h-3 w-3" />
              Drag & Drop Files Here
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No documents found. Click "Upload Document" to add documents.
                  </TableCell>
                </TableRow>
              ) : (
                documentList.map((doc: any) => {
                  const isRequired = doc.is_required || false;
                  const hasFile = doc.status === 'uploaded' && doc.file_path;
                  const displayName = doc.display_name || doc.name || 'Unknown';
                  const docTypeId = doc.type_id ?? doc.document_type_id ?? null;
                  const isDragTarget = dragOverRow === docTypeId;

                  return (
                    <TableRow 
                    key={doc.id}
                    onMouseEnter={() => setHoveredRow(docTypeId)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={(event: MouseEvent<HTMLTableRowElement>) => {
                      event.preventDefault();
                      handleRowClick(doc);
                    }}
                    onDragOver={(e) => handleDragOver(e, docTypeId)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, docTypeId)}
                    className={`transition-all cursor-pointer ${
                      isDragTarget
                        ? 'bg-blue-100 border-l-4 border-l-blue-500 scale-[1.02]'
                        : hoveredRow === docTypeId
                        ? 'bg-primary/10 border-l-4 border-l-primary scale-[1.01]'
                        : 'hover:bg-muted/50'
                    }`}
                    >
                      {/* Document Type */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(doc.status)}
                          <span className="font-medium">{displayName}</span>
                        </div>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        {getStatusBadge(doc.status, doc.expires_at)}
                      </TableCell>

                      {/* Required Badge */}
                      <TableCell>
                        {isRequired ? (
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Optional</span>
                        )}
                      </TableCell>

                      {/* Upload Date */}
                      <TableCell>
                        {doc.uploaded_at ? (
                          <span className="text-sm">
                            {format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
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

                      {/* File Name */}
                      <TableCell>
                        {doc.file_name ? (
                          <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
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
                            {hasFile && (
                              <DropdownMenuItem 
                                onClick={() => handleDownload(doc.file_path, doc.file_name)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleUpload(docTypeId || undefined)}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {hasFile ? 'Replace' : 'Upload'}
                            </DropdownMenuItem>
                            {hasFile && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDelete(doc.id, displayName)}
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
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        staffId={staffId}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        preSelectedDocTypeId={selectedDocumentType}
        initialFile={pendingFile}
        onSuccess={() => {
          setUploadOpen(false);
          setSelectedDocumentType(undefined);
          setPendingFile(null);
          refetch();
        }}
        onCancel={() => {
          setPendingFile(null);
        }}
      />
    </div>
  );
}

export function StaffDocumentsTab({ staffId }: StaffDocumentsTabProps) {
  return (
    <StaffDocumentsErrorBoundary>
      <StaffDocumentsTabContent staffId={staffId} />
    </StaffDocumentsErrorBoundary>
  );
}

