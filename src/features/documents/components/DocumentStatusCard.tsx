/**
 * DocumentStatusCard Component
 * 
 * Compact card showing document status overview
 * Displays progress, missing count, and quick checklist
 * Matches the design from the screenshot
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, FileText, Upload, Bell } from "lucide-react";
import { useRequiredDocumentsChecklist, useDocumentSummary } from '../hooks';
import { getExpiryInfo } from '../types';

interface DocumentStatusCardProps {
  staffId: string;
  onUploadClick?: (documentTypeId?: string) => void; // ✅ Now accepts optional documentTypeId
  onReminderClick?: () => void;
  compact?: boolean;
}

export function DocumentStatusCard({
  staffId,
  onUploadClick,
  onReminderClick,
  compact = false,
}: DocumentStatusCardProps) {
  const { documents, loading } = useRequiredDocumentsChecklist(staffId);
  const { summary } = useDocumentSummary(staffId);

  if (loading) {
    return <DocumentStatusCardSkeleton />;
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No document data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = summary.total_required > 0
    ? Math.round((summary.uploaded_count / summary.total_required) * 100)
    : 0;

  const getMissingBadge = () => {
    if (summary.missing_count === 0) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-100">
          Complete
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        {summary.missing_count} missing
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Document Status</span>
          </div>
          {getMissingBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {summary.uploaded_count}/{summary.total_required} documents
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
        </div>

        {/* Required Documents Checklist */}
        {!compact && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              Required Documents
            </h4>
            <div className="space-y-1">
              {documents.map((doc) => {
                const expiryInfo = getExpiryInfo({
                  status: doc.status,
                  expires_at: doc.expires_at,
                } as any);
                
                const isExpiringSoon = expiryInfo.is_expiring_soon && doc.status === 'uploaded';
                const isMissing = doc.status === 'missing';
                const isExpired = doc.status === 'expired';

                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {doc.status === 'uploaded' && !isExpired ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          isMissing || isExpired
                            ? 'text-muted-foreground'
                            : 'text-foreground'
                        }`}
                      >
                        {doc.display_name}
                      </span>
                    </div>
                    
                    {isMissing && (
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-xs">
                          Missing
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUploadClick?.(doc.document_type_id);
                          }}
                          title={`Upload ${doc.display_name}`}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    {isExpired && (
                      <div className="flex items-center gap-1.5">
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUploadClick?.(doc.document_type_id);
                          }}
                          title={`Re-upload ${doc.display_name}`}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    {isExpiringSoon && (
                      <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                        {expiryInfo.days_until_expiry}d left
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {summary.missing_count > 0 && (
          <div className="pt-2 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onReminderClick}
            >
              <Bell className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onUploadClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        )}
        
        {/* All complete - just show upload option */}
        {summary.missing_count === 0 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onUploadClick}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for the card
 */
function DocumentStatusCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

