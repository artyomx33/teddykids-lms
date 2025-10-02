import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { SalaryChange, EmploymentJourney } from "@/lib/employesContracts";
import { TrendingUp, TrendingDown, AlertTriangle, Euro, Calendar, Award } from "lucide-react";
import { differenceInMonths, parseISO } from "date-fns";

interface SalaryProgressionAnalyticsProps {
  journey: EmploymentJourney;
}

export function SalaryProgressionAnalytics({ journey }: SalaryProgressionAnalyticsProps) {
  const { salaryProgression } = journey;

  if (!salaryProgression || salaryProgression.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            <Euro className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Loading salary progression...</p>
            <p className="text-sm">Complete employment data with historical salary progression is now available!</p>
            <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-xs text-accent font-medium">Ready for: Real Employes.nl Data</p>
              <p className="text-xs text-muted-foreground mt-1">
                • Historical salary progression from €16.28 → €18.24/hour<br/>
                • Complete contract timeline with dates<br/>
                • Working hours evolution (4 → 5 days/week)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate analytics
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

  const getSalaryTrendIcon = (change: SalaryChange) => {
    if (change.increasePercent > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (change.increasePercent < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return null;
  };

  const getReasonLabel = (reason: SalaryChange['reason']) => {
    const labels = {
      'contract_start': 'Initial Contract',
      'contract_renewal': 'Contract Renewal',
      'raise': 'Salary Increase',
      'review': 'Performance Review'
    };
    return labels[reason] || reason;
  };

  return (
    <div className="space-y-4">
      {/* Stagnation Alert */}
      {isStagnant && (
        <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <strong>Salary Stagnation Detected:</strong> No salary increase in {monthsSinceLastRaise} months. 
            Consider scheduling a compensation review.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Total Growth</span>
            </div>
            <div className="text-2xl font-bold text-success">+{percentageIncrease}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(totalIncrease)} increase
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Number of Raises</span>
            </div>
            <div className="text-2xl font-bold">{numberOfRaises}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Avg +{averageRaisePercent}% per raise
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">Raise Frequency</span>
            </div>
            <div className="text-2xl font-bold">{avgMonthsBetweenRaises > 0 ? `${avgMonthsBetweenRaises}mo` : 'N/A'}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {avgMonthsBetweenRaises > 0 ? 'Average time between raises' : 'Insufficient data'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Euro className="h-4 w-4 text-secondary" />
              <span className="text-xs text-muted-foreground">Current Salary</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(latestSalary.yearlyWage)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(latestSalary.monthlyWage)}/mo · €{latestSalary.hourlyWage.toFixed(2)}/hr
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Salary Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salaryProgression.map((change, index) => {
              const isLatest = index === salaryProgression.length - 1;
              const isFirst = index === 0;

              return (
                <div 
                  key={index} 
                  className={`flex items-start gap-4 pb-4 ${!isLatest ? 'border-b' : ''}`}
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      isLatest ? 'bg-primary ring-4 ring-primary/20' : 'bg-muted'
                    }`} />
                    {!isLatest && <div className="w-px h-full bg-border mt-2" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatCurrency(change.yearlyWage)}/yr
                        </span>
                        {getSalaryTrendIcon(change)}
                        {isLatest && (
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        )}
                        {isFirst && (
                          <Badge variant="outline" className="text-xs">Starting</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(change.date).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(change.monthlyWage)}/mo · €{change.hourlyWage.toFixed(2)}/hr
                    </div>

                    {change.increasePercent !== 0 && (
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <span className={change.increasePercent > 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>
                          {change.increasePercent > 0 ? '+' : ''}{change.increasePercent.toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground">
                          · {getReasonLabel(change.reason)}
                        </span>
                      </div>
                    )}

                    {isFirst && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Initial employment salary
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Review Prediction */}
          {!isStagnant && avgMonthsBetweenRaises > 0 && (
            <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Next Salary Review Prediction</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on historical patterns (avg {avgMonthsBetweenRaises} months between raises), 
                    the next salary review could be around{' '}
                    <strong>
                      {new Date(
                        new Date(latestSalary.date).setMonth(
                          new Date(latestSalary.date).getMonth() + avgMonthsBetweenRaises
                        )
                      ).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Salary vs Performance Note */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Salary & Performance Correlation</p>
              <p className="text-muted-foreground mt-1">
                Review the Performance tab to see if salary increases align with review scores. 
                Strong performance reviews should be reflected in compensation growth.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
