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
  const [pdfError, setPdfError] = useState(false);

  const { data: contract, isLoading, error } = useQuery({
    queryKey: ["contract", id],
    queryFn: () => getContractById(supabase, id as string),
    enabled: !!id,
  });

  useEffect(() => {
    const loadPdf = async () => {
      if (contract?.pdf_path) {
        try {
          const url = await getSignedPdfUrl(supabase, contract.pdf_path);
          setPdfUrl(url);
        } catch (error) {
          console.error("Error loading PDF:", error);
          setPdfError(true);
        }
      }
    };

    loadPdf();
  }, [contract]);

  const handleDownload = async () => {
    if (!contract?.pdf_path) {
      toast({
        title: "Error",
        description: "No PDF available for this contract",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = await getSignedPdfUrl(supabase, contract.pdf_path);
      
      // Create a temporary anchor element to trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `Contract_${contract.employee_name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your contract PDF is downloading",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was a problem downloading the PDF",
        variant: "destructive",
      });
    }
  };

  const handleIframeError = () => {
    setPdfError(true);
  };

  const handleBack = () => {
    navigate("/contracts");
  };

  // Safely extract query_params fields with optional chaining
  const queryParams = contract?.query_params || {};
  const firstName = queryParams?.firstName || "";
  const lastName = queryParams?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || contract?.employee_name || "";
  
  // Mask BSN to show only last 4 digits
  const bsn = queryParams?.bsn || "";
  const maskedBsn = bsn ? `••••${bsn.slice(-4)}` : "—";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Contract</h2>
        <p className="text-muted-foreground mb-4">
          The contract could not be found or there was an error loading it.
        </p>
        <Button onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Contracts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contracts
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Contract: {fullName}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            {getStatusBadge(contract.status)}
            <span className="text-muted-foreground">
              Created {new Date(contract.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Contract Details */}
      {contract && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Birth Date:</span>
                  <span className="font-medium">{queryParams?.birthDate || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BSN:</span>
                  <span className="font-medium">{maskedBsn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-medium">{queryParams?.address || "—"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <span className="font-medium">{queryParams?.position || contract.department || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scale/Trede:</span>
                  <span className="font-medium">
                    {queryParams?.scale && queryParams?.trede 
                      ? `${queryParams.scale}/${queryParams.trede}` 
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{queryParams?.cityOfEmployment || "Leiden"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Manager:</span>
                  <span className="font-medium capitalize">
                    {queryParams?.manager 
                      ? queryParams.manager.replace(/-/g, " ") 
                      : contract.manager?.replace(/-/g, " ") || "—"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Schedule & Duration */}
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle>Schedule & Duration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-medium">{queryParams?.startDate || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date:</span>
                  <span className="font-medium">{queryParams?.endDate || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{queryParams?.duration || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hours/Week:</span>
                  <span className="font-medium">{queryParams?.hoursPerWeek || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract Type:</span>
                  <span className="font-medium capitalize">
                    {contract.contract_type?.replace(/_/g, " ") || "—"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle>Compensation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bruto (36h):</span>
                  <span className="font-medium">
                    {queryParams?.bruto36h 
                      ? `€ ${Number(queryParams.bruto36h).toFixed(2)}` 
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Gross:</span>
                  <span className="font-medium">
                    {queryParams?.grossMonthly 
                      ? `€ ${Number(queryParams.grossMonthly).toFixed(2)}` 
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Travel Distance:</span>
                  <span className="font-medium">
                    {queryParams?.reiskostenKm 
                      ? `${queryParams.reiskostenKm} km` 
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Travel Allowance:</span>
                  <span className="font-medium">
                    {queryParams?.reiskostenPerMonth 
                      ? `€ ${Number(queryParams.reiskostenPerMonth).toFixed(2)}/month` 
                      : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            {queryParams?.notes && (
              <Card className="md:col-span-2 bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{queryParams.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* PDF Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Contract PDF</CardTitle>
              <CardDescription>
                Preview or download the contract document
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!pdfUrl ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-muted-foreground/20 rounded-lg">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                  <h3 className="text-lg font-medium mb-2">Loading PDF...</h3>
                  <p className="text-muted-foreground text-center">
                    Please wait while we retrieve the contract document
                  </p>
                </div>
              ) : pdfError ? (
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
      )}
    </div>
  );
}
