import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { EmployesTaxData } from "@/lib/employesProfile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmployesTaxInfoPanelProps {
  taxInfo: EmployesTaxData | null;
}

export function EmployesTaxInfoPanel({ taxInfo }: EmployesTaxInfoPanelProps) {
  if (!taxInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tax & Insurance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No tax information available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const InfoRow = ({ 
    label, 
    value, 
    hasValue, 
    tooltip 
  }: { 
    label: string; 
    value?: string | null; 
    hasValue?: boolean;
    tooltip?: string;
  }) => (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-muted-foreground">{value}</span>}
        {hasValue !== undefined && (
          hasValue ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-gray-400" />
          )
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Tax & Insurance Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <InfoRow 
          label="IKV Code" 
          value={taxInfo.ikvCode}
          tooltip="Income-related contribution Health Insurance Act (Inkomensafhankelijke bijdrage Zorgverzekeringswet)"
        />
        <InfoRow 
          label="ZVW Code" 
          value={taxInfo.zvwCode}
          tooltip="Health Insurance Act code (Zorgverzekeringswet)"
        />
        
        <div className="pt-4 pb-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Social Insurance Coverage</h4>
        </div>
        
        <InfoRow 
          label="WAO/WIA" 
          hasValue={taxInfo.hasWAO}
          tooltip="Disability Insurance Act (Wet werk en inkomen naar arbeidsvermogen)"
        />
        <InfoRow 
          label="ZW" 
          hasValue={taxInfo.hasZW}
          tooltip="Sickness Benefits Act (Ziektewet) - Sickness leave coverage"
        />
        <InfoRow 
          label="WW" 
          hasValue={taxInfo.hasWW}
          tooltip="Unemployment Insurance Act (Werkloosheidswet)"
        />
        
        <div className="pt-4">
          <InfoRow 
            label="Tax Reduction Applied" 
            hasValue={taxInfo.taxReduction}
            tooltip="Whether tax reduction (loonheffingskorting) is applied"
          />
        </div>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t">
          {taxInfo.hasWAO && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
              WAO/WIA ✓
            </Badge>
          )}
          {taxInfo.hasZW && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
              ZW ✓
            </Badge>
          )}
          {taxInfo.hasWW && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
              WW ✓
            </Badge>
          )}
          {taxInfo.taxReduction && (
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
              Tax Reduction ✓
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
