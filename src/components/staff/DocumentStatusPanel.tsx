import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText, AlertTriangle } from "lucide-react";
import { useStaffDocuments } from "@/features/documents/hooks/useStaffDocuments";

interface DocumentStatusPanelProps {
  staffId: string;
}

export function DocumentStatusPanel({ staffId }: DocumentStatusPanelProps) {
  // Use real document data instead of prop
  const { summary, documents: staffDocuments, loading } = useStaffDocuments(staffId);
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50 animate-pulse" />
            <p>Loading document status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No document status available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalDocs = summary.totalRequired;
  const completedDocs = summary.uploadedRequired;
  const missingDocs = summary.missingRequired;
  const progressPercentage = totalDocs > 0 ? (completedDocs / totalDocs) * 100 : 0;

  // Create a lookup map from real document data
  const documentStatusMap = new Map();
  staffDocuments.forEach(doc => {
    documentStatusMap.set(doc.code, doc.status);
  });

  // Map document codes to display structure with real status
  const documentList = [
    { key: 'ID', label: 'ID Card', missing: documentStatusMap.get('ID') !== 'uploaded' },
    { key: 'BANK_ACCOUNT', label: 'Bank Card', missing: documentStatusMap.get('BANK_ACCOUNT') !== 'uploaded' },
    { key: 'VOG', label: 'VOG', missing: documentStatusMap.get('VOG') !== 'uploaded' },
    { key: 'POK', label: 'POK', missing: documentStatusMap.get('POK') !== 'uploaded' },
    { key: 'PRK', label: 'PRK', missing: documentStatusMap.get('PRK') !== 'uploaded' },
    { key: 'EMPLOYEES', label: 'Employee Record', missing: documentStatusMap.get('EMPLOYEES') !== 'uploaded' },
    { key: 'PORTOBASE', label: 'Portobase', missing: documentStatusMap.get('PORTOBASE') !== 'uploaded' },
  ];

  const getStatusIcon = (missing?: boolean) => {
    if (missing) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getStatusBadge = () => {
    if (missingDocs === 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          ✅ Complete
        </Badge>
      );
    }

    if (missingDocs <= 2) {
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {missingDocs} missing
        </Badge>
      );
    }

    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        {missingDocs} missing
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Status
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{completedDocs}/{totalDocs} documents</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Document Checklist */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Required Documents</h4>
          <div className="space-y-1">
            {documentList.map((doc) => (
              <div key={doc.key} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(doc.missing)}
                  <span className={`text-sm ${doc.missing ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {doc.label}
                  </span>
                </div>
                {doc.missing && (
                  <Badge variant="outline" className="text-xs">
                    Missing
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {missingDocs > 0 && (
          <div className="pt-2 space-y-2">
            <Button variant="outline" size="sm" className="w-full">
              Send Reminder
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Upload Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}