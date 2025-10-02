import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ChevronRight, CheckCircle } from "lucide-react";
import { EmployesTaxData } from "@/lib/employesProfile";

interface CompactTaxCardProps {
  taxInfo: EmployesTaxData | null;
  onViewDetails: () => void;
}

export function CompactTaxCard({ taxInfo, onViewDetails }: CompactTaxCardProps) {
  if (!taxInfo) return null;

  const coverageCount = [
    taxInfo.hasWAO,
    taxInfo.hasZW,
    taxInfo.hasWW
  ].filter(Boolean).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Tax & Insurance
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Coverage</span>
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              {coverageCount}/3
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {taxInfo.hasWAO && (
              <Badge variant="secondary" className="text-xs">
                WAO/WIA
              </Badge>
            )}
            {taxInfo.hasZW && (
              <Badge variant="secondary" className="text-xs">
                ZW
              </Badge>
            )}
            {taxInfo.hasWW && (
              <Badge variant="secondary" className="text-xs">
                WW
              </Badge>
            )}
            {taxInfo.taxReduction && (
              <Badge variant="secondary" className="text-xs">
                Tax Reduction
              </Badge>
            )}
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between"
          onClick={onViewDetails}
        >
          <span className="text-xs">View Full Details</span>
          <ChevronRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
