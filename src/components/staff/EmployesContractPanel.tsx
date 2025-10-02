import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, XCircle, Calendar } from "lucide-react";
import { EmployesContractData } from "@/lib/employesProfile";

interface EmployesContractPanelProps {
  contracts: EmployesContractData[];
}

export function EmployesContractPanel({ contracts }: EmployesContractPanelProps) {
  if (!contracts || contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contracts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No contract information available</p>
        </CardContent>
      </Card>
    );
  }

  const currentContract = contracts[0];
  const previousContracts = contracts.slice(1);

  const getContractTypeColor = (type: string | null) => {
    if (!type) return "secondary";
    if (type.toLowerCase().includes("onbepaalde")) return "default";
    if (type.toLowerCase().includes("bepaalde")) return "outline";
    return "secondary";
  };

  const ContractCard = ({ contract, isCurrent = false }: { contract: EmployesContractData; isCurrent?: boolean }) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant={getContractTypeColor(contract.contractType)}>
              {contract.contractType || "Unknown Type"}
            </Badge>
            {isCurrent && <Badge variant="default">Current</Badge>}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {contract.startDate} 
            {contract.endDate ? ` → ${contract.endDate}` : " → Present"}
          </div>
        </div>
        <div>
          {contract.isSigned ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Status:</span>
          <span className="ml-2 font-medium">
            {contract.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Signed:</span>
          <span className="ml-2 font-medium">
            {contract.isSigned ? "Yes" : "No"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contracts
          <Badge variant="outline">{contracts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-3">Current Contract</h4>
          <ContractCard contract={currentContract} isCurrent />
        </div>

        {previousContracts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Previous Contracts</h4>
            <div className="space-y-2">
              {previousContracts.map((contract, idx) => (
                <ContractCard key={idx} contract={contract} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
