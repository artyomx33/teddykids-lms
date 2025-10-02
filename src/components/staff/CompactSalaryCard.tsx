import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Euro, Calendar, ChevronRight } from "lucide-react";
import { EmploymentJourney } from "@/lib/employesContracts";

interface CompactSalaryCardProps {
  journey: EmploymentJourney;
  onViewDetails: () => void;
}

export function CompactSalaryCard({ journey, onViewDetails }: CompactSalaryCardProps) {
  const { salaryProgression } = journey;
  
  if (!salaryProgression.length) return null;

  const current = salaryProgression[0];
  const previous = salaryProgression[1];
  
  const totalIncrease = previous 
    ? ((current.monthlyWage - previous.monthlyWage) / previous.monthlyWage) * 100 
    : 0;

  const numberOfRaises = salaryProgression.filter(s => s.increasePercent > 0).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Salary Overview
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Current Salary</span>
            <Badge variant="outline" className="font-mono">
              €{current.monthlyWage.toLocaleString()}
            </Badge>
          </div>
          
          {previous && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Growth</span>
              <Badge 
                variant={totalIncrease > 0 ? "default" : "secondary"}
                className="font-mono"
              >
                {totalIncrease > 0 ? '+' : ''}{totalIncrease.toFixed(1)}%
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Raises</span>
            <Badge variant="outline">
              {numberOfRaises}x
            </Badge>
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
  );
}
