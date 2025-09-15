import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText, AlertTriangle } from "lucide-react";

interface DocumentStatusPanelProps {
  staffId: string;
  documentsStatus?: {
    missing_count: number;
    id_card_missing?: boolean;
    bank_card_missing?: boolean;
    vog_missing?: boolean;
    pok_missing?: boolean;
    prk_missing?: boolean;
    employees_missing?: boolean;
    portobase_missing?: boolean;
  } | null;
}

export function DocumentStatusPanel({ staffId, documentsStatus }: DocumentStatusPanelProps) {
  if (!documentsStatus) {
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

  const totalDocs = 7; // Based on the fields we track
  const completedDocs = totalDocs - documentsStatus.missing_count;
  const progressPercentage = (completedDocs / totalDocs) * 100;

  const documents = [
    { key: 'id_card', label: 'ID Card', missing: documentsStatus.id_card_missing },
    { key: 'bank_card', label: 'Bank Card', missing: documentsStatus.bank_card_missing },
    { key: 'vog', label: 'VOG', missing: documentsStatus.vog_missing },
    { key: 'pok', label: 'POK', missing: documentsStatus.pok_missing },
    { key: 'prk', label: 'PRK', missing: documentsStatus.prk_missing },
    { key: 'employees', label: 'Employee Record', missing: documentsStatus.employees_missing },
    { key: 'portobase', label: 'Portobase', missing: documentsStatus.portobase_missing },
  ];

  const getStatusIcon = (missing?: boolean) => {
    if (missing) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getStatusBadge = () => {
    if (documentsStatus.missing_count === 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          ✅ Complete
        </Badge>
      );
    }
    
    if (documentsStatus.missing_count <= 2) {
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {documentsStatus.missing_count} missing
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        {documentsStatus.missing_count} missing
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
            {documents.map((doc) => (
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
        {documentsStatus.missing_count > 0 && (
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