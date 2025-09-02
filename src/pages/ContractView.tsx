import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Download, ArrowLeft, Loader2, FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import ContractTemplate from "@/components/ContractTemplate";
import { mapQueryToParams } from "@/lib/renderContractToHtml";

export default function ContractView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch contract data from Supabase
  const { data: contract, isLoading, error } = useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Get PDF URL if available
  const pdfUrl = contract?.pdf_path 
    ? supabase.storage.from('contracts').getPublicUrl(contract.pdf_path).data.publicUrl
    : null;

  // Map Supabase-stored query_params to typed props for ContractTemplate
  const params = contract?.query_params ? mapQueryToParams(contract.query_params) : null;
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      console.error("PDF not available");
    }
  };

  const handleBack = () => {
    navigate('/contracts');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading contract...</span>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-2">Contract not found</h2>
        <p className="text-muted-foreground mb-4">The contract you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={handleBack}>Back to Contracts</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header - Hidden in print */}
      <div className="bg-background border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contracts
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Employment Contract</h1>
              <p className="text-sm text-muted-foreground">Contract ID: {id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" title="View as HTML">
              <FileCode className="w-4 h-4 mr-2" />
              View as HTML
            </Button>
            <Button 
              onClick={handleDownload} 
              disabled={!pdfUrl}
              title={!pdfUrl ? "PDF not available" : "Download PDF"}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Contract Document */}
      <div className="max-w-4xl mx-auto p-8 print:p-0 print:max-w-none">
        <Card className="bg-card shadow-lg print:shadow-none print:border-none min-h-[297mm] print:min-h-0">
          <CardContent className="p-12 print:p-16 relative">
            {/* QR Code - Top Right */}
            <div className="absolute top-8 right-8 print:top-12 print:right-12">
              <div className="w-20 h-20 bg-muted border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                <div className="text-xs text-muted-foreground text-center">
                  QR<br />Code
                </div>
              </div>
            </div>

            {/* Contract Content - Using template */}
            {params && <ContractTemplate {...params} />}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
              <p>Teddy Kids • Leiden, Netherlands • www.teddykids.nl</p>
              <p className="mt-1">Generated on {new Date().toLocaleDateString('nl-NL')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
