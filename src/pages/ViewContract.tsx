import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getContractById, getSignedPdfUrl } from "@/lib/contracts";
import { toast } from "@/components/ui/sonner";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "signed":
      return <Badge className="bg-success/10 text-success hover:bg-success/20">Signed</Badge>;
    case "pending":
      return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Pending</Badge>;
    case "draft":
      return <Badge className="bg-muted text-muted-foreground">Draft</Badge>;
    case "generated":
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Generated</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function ViewContract() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState(false);

  // Fetch contract data
  const { data: contract, isLoading, isError, error } = useQuery({
    queryKey: ["contract", id],
    queryFn: () => getContractById(supabase, id as string),
    enabled: !!id,
  });

  // Get signed URL for PDF when contract data is available
  useEffect(() => {
    const fetchPdfUrl = async () => {
      if (contract?.pdf_path) {
        try {
          const url = await getSignedPdfUrl(supabase, contract.pdf_path);
          setPdfUrl(url);
        } catch (err: any) {
          console.error("Failed to get PDF URL:", err);
          toast.error(`Failed to load PDF: ${err.message}`);
          setIframeError(true);
        }
      }
    };

    fetchPdfUrl();
  }, [contract]);

  // Handle direct download
  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    } else {
      toast.error("PDF URL not available");
    }
  };

  // Handle iframe load error
  const handleIframeError = () => {
    setIframeError(true);
    toast.error("Unable to display PDF in browser. Please use the download button.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">View Contract</h1>
          <p className="text-muted-foreground mt-1">
            Review contract details and document
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/contracts")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Contracts
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className="shadow-card">
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-3 text-lg">Loading contract...</span>
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="shadow-card border-destructive/50">
          <CardContent className="flex items-center justify-center p-12 text-destructive">
            <AlertCircle className="w-8 h-8 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Error Loading Contract</h3>
              <p>{(error as Error)?.message || "Failed to load contract details"}</p>
            </div>
          </CardContent>
        </Card>
      ) : contract ? (
        <>
          {/* Contract Details */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Contract Details
              </CardTitle>
              <CardDescription>
                Information about this contract
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="font-medium">{contract.employee_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Manager</p>
                  <p className="font-medium">{contract.manager}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div>{getStatusBadge(contract.status)}</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium capitalize">{contract.department?.replace("-", " ")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Contract Type</p>
                  <p className="font-medium capitalize">{contract.contract_type?.replace("-", " ")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {contract.created_at ? new Date(contract.created_at).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleDownload}
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PDF Viewer */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Contract Document</CardTitle>
            </CardHeader>
            <CardContent>
              {!pdfUrl ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <span className="ml-2">Loading PDF document...</span>
                </div>
              ) : iframeError ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-muted-foreground/20 rounded-lg">
                  <AlertCircle className="w-10 h-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">PDF Preview Unavailable</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    The PDF cannot be displayed in the browser. Please use the download button to view the document.
                  </p>
                  <Button 
                    onClick={handleDownload}
                    className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              ) : (
                <div className="w-full">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[70vh] border-0 rounded-lg"
                    onError={handleIframeError}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
