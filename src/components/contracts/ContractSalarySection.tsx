import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Euro, Info, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ContractSalarySectionProps {
  contract: any;
}

export function ContractSalarySection({ contract }: ContractSalarySectionProps) {
  const queryParams = contract.query_params || {};
  
  // Extract salary data
  const grossMonthly = queryParams.grossMonthly || contract.salary_info?.grossMonthly;
  const scale = queryParams.scale || contract.salary_info?.scale;
  const trede = queryParams.trede || contract.salary_info?.trede;
  const hoursPerWeek = queryParams.hoursPerWeek || 36;
  const baseGross36h = queryParams.baseGross36h;
  
  if (!grossMonthly) {
    return null;
  }
  
  // Calculate additional values
  const yearlyGross = grossMonthly * 12;
  const hourlyWage = calculateHourlyWage(grossMonthly, hoursPerWeek);
  const netEstimate = estimateNetSalary(grossMonthly);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Salary Details
          </span>
          {scale && trede && (
            <Badge variant="outline" className="bg-blue-50 border-blue-200">
              CAO {scale}/{trede}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Salary Display */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="space-y-3">
            {/* Gross Monthly */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Bruto (gross):</span>
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(grossMonthly)}
              </span>
            </div>
            
            <Separator />
            
            {/* Net Monthly */}
            <div className="flex justify-between items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Neto (net est.):</span>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Estimated based on 2024 Dutch tax tables. 
                      Actual net salary may vary based on personal situation 
                      and tax credits (heffingskorting).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-xl font-semibold text-green-600">
                {formatCurrency(netEstimate)}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hourly rate:</span>
            <span className="font-medium">{formatCurrency(hourlyWage)}/uur</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Yearly gross:</span>
            <span className="font-medium">{formatCurrency(yearlyGross)}/jaar</span>
          </div>
          
          {hoursPerWeek !== 36 && baseGross36h && (
            <>
              <Separator className="my-2" />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Base (36h):</span>
                <span>{formatCurrency(baseGross36h)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Hours:</span>
                <span>{hoursPerWeek}/36 ({Math.round((hoursPerWeek / 36) * 100)}%)</span>
              </div>
            </>
          )}
        </div>

        {/* CAO Info */}
        {scale && trede && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-medium">CAO Kinderopvang 2024</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Schaal:</span> {scale}
              </div>
              <div>
                <span className="font-medium">Trede:</span> {trede}
              </div>
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {queryParams.notes && (
          <div className="mt-4 p-3 border rounded-lg">
            <p className="text-xs text-muted-foreground font-medium mb-1">Notes:</p>
            <p className="text-sm">{queryParams.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
function calculateHourlyWage(grossMonthly: number, hoursPerWeek: number): number {
  const hoursPerMonth = hoursPerWeek * 4.33; // Average weeks per month
  return Math.round((grossMonthly / hoursPerMonth) * 100) / 100;
}

function estimateNetSalary(grossMonthly: number): number {
  const yearlyGross = grossMonthly * 12;
  
  // Simplified Dutch tax calculation for 2024
  let taxAmount = 0;
  
  if (yearlyGross <= 75518) {
    // 36.93% up to €75,518
    taxAmount = yearlyGross * 0.3693;
  } else {
    // 36.93% up to €75,518, then 49.5% above
    taxAmount = (75518 * 0.3693) + ((yearlyGross - 75518) * 0.495);
  }
  
  // Apply general tax credit (heffingskorting) - 2024 amount
  const taxCredit = 3362;
  taxAmount = Math.max(0, taxAmount - taxCredit);
  
  const netYearly = yearlyGross - taxAmount;
  return Math.round(netYearly / 12);
}

