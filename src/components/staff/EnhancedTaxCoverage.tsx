import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";
import { EmployesTaxData } from "@/lib/employesProfile";

interface EnhancedTaxCoverageProps {
  taxInfo: EmployesTaxData | null;
}

export function EnhancedTaxCoverage({ taxInfo }: EnhancedTaxCoverageProps) {
  const calculateCoverage = () => {
    if (!taxInfo) return { covered: 0, total: 3, items: [] };

    const coverageItems = [
      {
        name: 'WAO Insurance',
        covered: taxInfo.hasWAO || false,
        description: 'Disability benefits (WAO)'
      },
      {
        name: 'ZW Insurance',
        covered: taxInfo.hasZW || false,
        description: 'Sickness benefits (ZW)'
      },
      {
        name: 'WW Insurance',
        covered: taxInfo.hasWW || false,
        description: 'Unemployment benefits (WW)'
      }
    ];

    const coveredCount = coverageItems.filter(item => item.covered).length;

    return {
      covered: coveredCount,
      total: 3,
      items: coverageItems
    };
  };

  const coverage = calculateCoverage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Tax & Insurance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coverage Summary */}
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold">
            {coverage.covered}/{coverage.total}
          </div>
          <div className="text-sm text-muted-foreground">Coverage</div>
          <Badge
            variant={coverage.covered === coverage.total ? "default" : "secondary"}
            className={coverage.covered === coverage.total
              ? "bg-green-100 text-green-800 border-green-300"
              : "bg-yellow-100 text-yellow-800 border-yellow-300"
            }
          >
            {coverage.covered === coverage.total ? "Full Coverage" : "Partial Coverage"}
          </Badge>
        </div>

        {/* Coverage Details */}
        <div className="space-y-2">
          {coverage.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                {item.covered ? (
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <ShieldX className="h-4 w-4 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <Badge
                variant={item.covered ? "default" : "secondary"}
                className={item.covered
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-red-100 text-red-800 border-red-300"
                }
              >
                {item.covered ? "Covered" : "Not Covered"}
              </Badge>
            </div>
          ))}
        </div>

        {/* Tax Codes */}
        {taxInfo && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Tax Information</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {taxInfo.ikvCode && (
                <div>
                  <span className="font-medium">IKV:</span> {taxInfo.ikvCode}
                </div>
              )}
              {taxInfo.zvwCode && (
                <div>
                  <span className="font-medium">ZVW:</span> {taxInfo.zvwCode}
                </div>
              )}
              {taxInfo.taxReduction && (
                <div className="col-span-2">
                  <Badge variant="outline" className="text-xs">
                    Tax Reduction Applied
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Source */}
        <div className="text-xs text-muted-foreground text-right">
          Source: Employes.nl tax data
        </div>
      </CardContent>
    </Card>
  );
}