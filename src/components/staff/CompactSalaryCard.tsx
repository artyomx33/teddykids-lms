import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TrendingUp, Euro, Calendar, ChevronRight, Award, AlertTriangle } from "lucide-react";
import { EmploymentJourney } from "@/lib/employesContracts";
import { differenceInMonths, parseISO } from "date-fns";

interface CompactSalaryCardProps {
  journey: EmploymentJourney;
  onViewDetails: () => void;
}

export function CompactSalaryCard({ journey, onViewDetails }: CompactSalaryCardProps) {
  const { salaryProgression } = journey;
  
  if (!salaryProgression || salaryProgression.length === 0) return null;

  // Calculate analytics - same logic as SalaryProgressionAnalytics
  const firstSalary = salaryProgression[0];
  const latestSalary = salaryProgression[salaryProgression.length - 1];
  const totalIncrease = latestSalary.yearlyWage - firstSalary.yearlyWage;
  const percentageIncrease = ((totalIncrease / firstSalary.yearlyWage) * 100).toFixed(1);
  const numberOfRaises = salaryProgression.filter(s => s.increasePercent > 0).length;
  
  // Calculate average raise (only counting actual raises, not first contract)
  const raises = salaryProgression.filter(s => s.increasePercent > 0);
  const averageRaisePercent = raises.length > 0 
    ? (raises.reduce((sum, s) => sum + s.increasePercent, 0) / raises.length).toFixed(1)
    : "0";

  // Calculate time since last raise
  const monthsSinceLastRaise = differenceInMonths(new Date(), parseISO(latestSalary.date));
  const isStagnant = monthsSinceLastRaise > 12; // No raise in over a year

  // Calculate average time between raises
  let totalMonthsBetweenRaises = 0;
  const raiseDates = salaryProgression.filter(s => s.increasePercent > 0);
  for (let i = 1; i < raiseDates.length; i++) {
    const months = differenceInMonths(
      parseISO(raiseDates[i].date),
      parseISO(raiseDates[i - 1].date)
    );
    totalMonthsBetweenRaises += months;
  }
  const avgMonthsBetweenRaises = raiseDates.length > 1 
    ? Math.round(totalMonthsBetweenRaises / (raiseDates.length - 1)) 
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="space-y-3">
      {/* Stagnation Alert */}
      {isStagnant && (
        <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs">
            <strong>Salary Stagnation Detected:</strong> No salary increase in {monthsSinceLastRaise} months. 
            Consider scheduling a compensation review.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Salary Overview
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Metrics - 4 Column Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Growth */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs text-muted-foreground">Total Growth</span>
              </div>
              <div className="text-xl font-bold text-success">+{percentageIncrease}%</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(totalIncrease)} increase
              </div>
            </div>

            {/* Number of Raises */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Award className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">Number of Raises</span>
              </div>
              <div className="text-xl font-bold">{numberOfRaises}</div>
              <div className="text-xs text-muted-foreground">
                Avg +{averageRaisePercent}% per raise
              </div>
            </div>

            {/* Raise Frequency */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-accent" />
                <span className="text-xs text-muted-foreground">Raise Frequency</span>
              </div>
              <div className="text-xl font-bold">{avgMonthsBetweenRaises > 0 ? `${avgMonthsBetweenRaises}mo` : 'N/A'}</div>
              <div className="text-xs text-muted-foreground">
                {avgMonthsBetweenRaises > 0 ? 'Average time between raises' : 'Insufficient data'}
              </div>
            </div>

            {/* Current Salary */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Euro className="h-3 w-3 text-secondary" />
                <span className="text-xs text-muted-foreground">Current Salary</span>
              </div>
              <div className="text-xl font-bold">{formatCurrency(latestSalary.yearlyWage)}</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(latestSalary.monthlyWage)}/mo · €{latestSalary.hourlyWage.toFixed(2)}/hr
              </div>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between"
            onClick={onViewDetails}
          >
            <span className="text-xs">View Full Analytics</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
