import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, FileText } from "lucide-react";

interface EmploymentCurrentStatusProps {
  rawEmploymentData: any;
  staffName: string;
}

export function EmploymentCurrentStatus({ rawEmploymentData, staffName }: EmploymentCurrentStatusProps) {
  if (!rawEmploymentData) {
    return null;
  }

  // Extract current contract info
  const currentContract = rawEmploymentData.find((item: any) => 
    item.contractType && !item.endDate
  );

  if (!currentContract) {
    return null;
  }

  // Calculate actual monthly salary
  const hoursPerWeek = currentContract.hoursPerWeek || 36;
  const hourlyWage = currentContract.hourlyWage || 0;
  const actualMonthly = (hourlyWage * hoursPerWeek * 52) / 12;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('nl-NL', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] pointer-events-none" />
      
      <CardContent className="relative pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              Active
            </Badge>
            {currentContract.contractType && (
              <span className="text-sm text-muted-foreground">
                {currentContract.contractType}
              </span>
            )}
          </div>
        </div>

        {/* Hero: Actual Monthly Salary */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 mb-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Actual Monthly Salary</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(actualMonthly)}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-primary opacity-50" />
          </div>
        </div>

        {/* Supporting info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Working Hours</p>
              <p className="font-semibold">{hoursPerWeek}h/week</p>
            </div>
          </div>
          
          {currentContract.startDate && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Started</p>
                <p className="font-semibold">{formatDate(currentContract.startDate)}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
