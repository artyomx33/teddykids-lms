import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Download, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock contract data - in a real app, this would come from an API
const mockContract = {
  id: "1",
  employeeName: "Sarah Johnson",
  position: "Childcare Educator",
  department: "Toddler Care",
  contractType: "Full-time",
  salary: "€38,000",
  startDate: "2024-03-15",
  manager: "Lisa Wang",
  duration: "Indefinite",
  workingHours: "40 hours/week",
  signedDate: "2024-02-28",
  status: "signed"
};

export default function ContractView() {
  const { id } = useParams();
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would trigger PDF generation/download
    console.log("Downloading contract PDF...");
  };

  const handleBack = () => {
    window.history.back();
  };

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
            <Button onClick={handleDownload}>
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

            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">TK</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Teddy Kids</h1>
                  <p className="text-muted-foreground">Childcare Services</p>
                </div>
              </div>
              
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold text-foreground mb-2">Employment Contract</h2>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    {mockContract.status.charAt(0).toUpperCase() + mockContract.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Contract ID: {id}
                  </span>
                </div>
              </div>
            </div>

            {/* Contract Content */}
            <div className="space-y-8 text-sm leading-relaxed">
              {/* Employee Information */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                  Employee Information
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <span className="font-medium text-muted-foreground">Employee Name:</span>
                    <span className="ml-2 text-foreground">{mockContract.employeeName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Position:</span>
                    <span className="ml-2 text-foreground">{mockContract.position}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Department:</span>
                    <span className="ml-2 text-foreground">{mockContract.department}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Contract Type:</span>
                    <span className="ml-2 text-foreground">{mockContract.contractType}</span>
                  </div>
                </div>
              </section>

              {/* Employment Terms */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                  Employment Terms
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <span className="font-medium text-muted-foreground">Start Date:</span>
                    <span className="ml-2 text-foreground">{mockContract.startDate}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Contract Duration:</span>
                    <span className="ml-2 text-foreground">{mockContract.duration}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Working Hours:</span>
                    <span className="ml-2 text-foreground">{mockContract.workingHours}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Reporting Manager:</span>
                    <span className="ml-2 text-foreground">{mockContract.manager}</span>
                  </div>
                </div>
              </section>

              {/* Compensation */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                  Compensation
                </h3>
                <div>
                  <span className="font-medium text-muted-foreground">Annual Salary:</span>
                  <span className="ml-2 text-foreground text-lg font-semibold">{mockContract.salary}</span>
                </div>
              </section>

              {/* Contract Terms */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                  Terms and Conditions
                </h3>
                <div className="space-y-3 text-foreground">
                  <p>
                    This employment agreement is entered into between Teddy Kids and {mockContract.employeeName} 
                    for the position of {mockContract.position} in the {mockContract.department} department.
                  </p>
                  <p>
                    The employee agrees to perform the duties and responsibilities associated with their position 
                    to the best of their abilities and in accordance with company policies and procedures.
                  </p>
                  <p>
                    This contract is governed by Dutch employment law and any disputes will be resolved 
                    in accordance with applicable legislation.
                  </p>
                </div>
              </section>
            </div>

            {/* Signature Block */}
            <div className="mt-16 pt-8 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground mb-6">Signatures</h3>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-muted-foreground mb-2">Employee</p>
                    <div className="border-b border-border w-48 h-12 flex items-end pb-1">
                      {mockContract.status === 'signed' && (
                        <span className="text-sm text-muted-foreground italic">
                          Digitally signed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {mockContract.employeeName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Date: {mockContract.signedDate}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-muted-foreground mb-2">Employer</p>
                    <div className="border-b border-border w-48 h-12 flex items-end pb-1">
                      {mockContract.status === 'signed' && (
                        <span className="text-sm text-muted-foreground italic">
                          Digitally signed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Teddy Kids Management
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Date: {mockContract.signedDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
              <p>Teddy Kids • Amsterdam, Netherlands • www.teddykids.nl</p>
              <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}