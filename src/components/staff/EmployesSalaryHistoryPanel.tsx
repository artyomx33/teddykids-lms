import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { EmployesSalaryData } from "@/lib/employesProfile";

interface EmployesSalaryHistoryPanelProps {
  salaries: EmployesSalaryData[];
  isIntern?: boolean;
}

export function EmployesSalaryHistoryPanel({ salaries, isIntern }: EmployesSalaryHistoryPanelProps) {
  if (!salaries || salaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No salary information available</p>
        </CardContent>
      </Card>
    );
  }

  const currentSalary = salaries[0];
  const previousSalaries = salaries.slice(1);

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      isIncrease: change > 0,
      isSignificant: Math.abs(change) > 5
    };
  };

  const getTrendBadge = (current: EmployesSalaryData, previous?: EmployesSalaryData) => {
    if (!previous) return null;
    
    const change = calculateChange(current.hourlyWage, previous.hourlyWage);
    
    if (change.isIncrease) {
      return (
        <Badge variant={change.isSignificant ? "default" : "outline"} className="gap-1">
          <TrendingUp className="h-3 w-3" />
          +{change.percentage}%
        </Badge>
      );
    } else if (change.percentage !== "0.0") {
      return (
        <Badge variant="destructive" className="gap-1">
          <TrendingDown className="h-3 w-3" />
          -{change.percentage}%
        </Badge>
      );
    }
    return null;
  };

  const SalaryCard = ({ salary, isCurrent = false, previousSalary }: { 
    salary: EmployesSalaryData; 
    isCurrent?: boolean;
    previousSalary?: EmployesSalaryData;
  }) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-bold">€{salary.hourlyWage.toFixed(2)}</span>
            <span className="text-muted-foreground">/hour</span>
            {isCurrent && <Badge variant="default">Current</Badge>}
            {isIntern && salary.hourlyWage < 3 && (
              <Badge variant="secondary" className="gap-1">
                🎓 Intern Rate
              </Badge>
            )}
            {isCurrent && getTrendBadge(salary, previousSalary)}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Since {salary.startDate}
            {salary.endDate && ` → ${salary.endDate}`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {salary.grossMonthly && (
          <div>
            <span className="text-muted-foreground">Monthly:</span>
            <span className="ml-2 font-medium">€{salary.grossMonthly.toFixed(2)}</span>
          </div>
        )}
        {salary.yearlyWage && (
          <div>
            <span className="text-muted-foreground">Yearly:</span>
            <span className="ml-2 font-medium">€{salary.yearlyWage.toFixed(2)}</span>
          </div>
        )}
      </div>

      {(salary.scale || salary.trede) && (
        <div className="flex gap-2">
          {salary.scale && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline">Scale: {salary.scale}</Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>CAO salary scale</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {salary.trede && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline">Step: {salary.trede}</Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Step within salary scale</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {salary.wageTableCode && (
        <div className="text-xs text-muted-foreground">
          Wage Table: {salary.wageTableCode}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Salary History
          <Badge variant="outline">{salaries.length} period{salaries.length !== 1 ? 's' : ''}</Badge>
          {isIntern && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Intern rate detected (hourly wage &lt; €3)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-3">Current Salary</h4>
          <SalaryCard 
            salary={currentSalary} 
            isCurrent 
            previousSalary={previousSalaries[0]}
          />
        </div>

        {previousSalaries.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Previous Salaries</h4>
            <div className="space-y-2">
              {previousSalaries.map((salary, idx) => (
                <SalaryCard 
                  key={idx} 
                  salary={salary}
                  previousSalary={previousSalaries[idx + 1]}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
