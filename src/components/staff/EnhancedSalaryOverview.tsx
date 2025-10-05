import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Euro, BarChart3, Calendar } from "lucide-react";
import { EmployesSalaryData } from "@/lib/employesProfile";

interface EnhancedSalaryOverviewProps {
  salaryHistory: EmployesSalaryData[];
}

export function EnhancedSalaryOverview({ salaryHistory }: EnhancedSalaryOverviewProps) {
  if (salaryHistory.length === 0) {
    return null;
  }

  const calculateSalaryMetrics = () => {
    if (salaryHistory.length === 0) return null;

    const currentSalary = salaryHistory[0];
    const firstSalary = salaryHistory[salaryHistory.length - 1];

    const totalGrowth = salaryHistory.length > 1
      ? ((currentSalary.hourlyWage - firstSalary.hourlyWage) / firstSalary.hourlyWage) * 100
      : 0;

    const numberOfRaises = salaryHistory.length - 1;

    // Calculate average raise frequency in months
    let avgRaiseFrequency = null;
    if (numberOfRaises > 0) {
      const firstDate = new Date(firstSalary.startDate);
      const lastDate = new Date(currentSalary.startDate);
      const totalMonths = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      avgRaiseFrequency = Math.floor(totalMonths / numberOfRaises);
    }

    return {
      currentHourlyWage: currentSalary.hourlyWage,
      currentMonthlyWage: currentSalary.monthlyWage || currentSalary.grossMonthly,
      totalGrowth,
      numberOfRaises,
      avgRaiseFrequency
    };
  };

  const metrics = calculateSalaryMetrics();

  if (!metrics) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="h-5 w-5" />
          Salary Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Salary */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold">€{metrics.currentHourlyWage.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">
            €{metrics.currentMonthlyWage?.toFixed(0) || '---'}/month
          </div>
          <div className="text-xs text-muted-foreground">Current hourly wage</div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Growth */}
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-lg font-semibold">
              <TrendingUp className="h-4 w-4" />
              {metrics.totalGrowth > 0 ? '+' : ''}{metrics.totalGrowth.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Total Growth</div>
          </div>

          {/* Number of Raises */}
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-lg font-semibold">
              <BarChart3 className="h-4 w-4" />
              {metrics.numberOfRaises}
            </div>
            <div className="text-xs text-muted-foreground">Number of Raises</div>
          </div>
        </div>

        {/* Raise Frequency */}
        {metrics.avgRaiseFrequency && (
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Every {metrics.avgRaiseFrequency} months
            </div>
            <div className="text-xs text-muted-foreground">Average raise frequency</div>
          </div>
        )}

        {/* Performance Badge */}
        {metrics.totalGrowth > 10 && (
          <div className="flex justify-center">
            <Badge className="bg-green-100 text-green-800 border-green-300">
              Strong Growth
            </Badge>
          </div>
        )}

        {/* Source */}
        <div className="text-xs text-muted-foreground text-right">
          Source: Employes.nl salary history
        </div>
      </CardContent>
    </Card>
  );
}