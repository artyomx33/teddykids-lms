import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Briefcase,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface EmploymentHistoryTimelineProps {
  rawEmploymentData: any;
  staffName: string;
}

interface EmploymentChange {
  date: string;
  type: 'contract_start' | 'contract_end' | 'salary_change' | 'hours_change';
  description: string;
  details: any;
  isCurrent?: boolean;
}

export function EmploymentHistoryTimeline({ rawEmploymentData, staffName }: EmploymentHistoryTimelineProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nl-NL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatPercentage = (percent: number) => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
  };

  const calculateAdjustedSalary = (hourlyWage: number, hoursPerWeek: number) => {
    return (hourlyWage * hoursPerWeek * 52) / 12;
  };

  // Parse employment changes from raw data
  const parseEmploymentChanges = (data: any[]): EmploymentChange[] => {
    const changes: EmploymentChange[] = [];
    
    if (!data || data.length === 0) return changes;

    // Sort by start date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    sortedData.forEach((item, index) => {
      const prevItem = index > 0 ? sortedData[index - 1] : null;
      const isCurrent = !item.endDate;

      // Contract start
      changes.push({
        date: item.startDate,
        type: 'contract_start',
        description: isCurrent ? 'Current Contract Started' : 'Contract Started',
        details: {
          contractType: item.contractType,
          hourlyWage: item.hourlyWage,
          hoursPerWeek: item.hoursPerWeek,
          actualMonthly: calculateAdjustedSalary(item.hourlyWage, item.hoursPerWeek)
        },
        isCurrent
      });

      // Check for salary changes (if previous item exists)
      if (prevItem && item.hourlyWage !== prevItem.hourlyWage) {
        const prevActual = calculateAdjustedSalary(prevItem.hourlyWage, prevItem.hoursPerWeek);
        const newActual = calculateAdjustedSalary(item.hourlyWage, item.hoursPerWeek);
        const changePercent = ((newActual - prevActual) / prevActual) * 100;

        changes.push({
          date: item.startDate,
          type: 'salary_change',
          description: 'Salary Adjustment',
          details: {
            previousHourly: prevItem.hourlyWage,
            newHourly: item.hourlyWage,
            previousActual: prevActual,
            newActual: newActual,
            changePercent: changePercent,
            hoursPerWeek: item.hoursPerWeek
          },
          isCurrent
        });
      }

      // Check for hours changes
      if (prevItem && item.hoursPerWeek !== prevItem.hoursPerWeek) {
        const prevActual = calculateAdjustedSalary(item.hourlyWage, prevItem.hoursPerWeek);
        const newActual = calculateAdjustedSalary(item.hourlyWage, item.hoursPerWeek);
        const changePercent = ((newActual - prevActual) / prevActual) * 100;

        changes.push({
          date: item.startDate,
          type: 'hours_change',
          description: 'Working Hours Adjusted',
          details: {
            previousHours: prevItem.hoursPerWeek,
            newHours: item.hoursPerWeek,
            hourlyWage: item.hourlyWage,
            previousActual: prevActual,
            newActual: newActual,
            changePercent: changePercent
          },
          isCurrent
        });
      }

      // Contract end (if exists)
      if (item.endDate) {
        changes.push({
          date: item.endDate,
          type: 'contract_end',
          description: 'Contract Ended',
          details: {
            contractType: item.contractType
          },
          isCurrent: false
        });
      }
    });

    // Sort by date, newest first
    return changes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const changes = parseEmploymentChanges(rawEmploymentData);

  const getChangeIcon = (type: string, percent?: number) => {
    switch (type) {
      case 'salary_change':
        return percent && percent > 0 ? TrendingUp : TrendingDown;
      case 'hours_change':
        return Clock;
      case 'contract_start':
      case 'contract_end':
        return Briefcase;
      default:
        return Briefcase;
    }
  };

  const getChangeColor = (type: string, percent?: number) => {
    if (type === 'salary_change' || type === 'hours_change') {
      if (percent !== undefined) {
        return percent > 0 ? 'text-green-600' : percent < 0 ? 'text-red-600' : 'text-muted-foreground';
      }
    }
    if (type === 'contract_start') return 'text-primary';
    if (type === 'contract_end') return 'text-orange-600';
    return 'text-muted-foreground';
  };

  if (!rawEmploymentData || changes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No employment history available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {changes.map((change, index) => {
            const Icon = getChangeIcon(change.type, change.details?.changePercent);
            const colorClass = getChangeColor(change.type, change.details?.changePercent);

            return (
              <div key={`${change.date}-${change.type}-${index}`} className="relative group">
                {/* Timeline connector */}
                {index < changes.length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-muted to-muted/30" />
                )}

                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className={`relative flex-shrink-0 w-8 h-8 rounded-full border-4 border-background ${
                    change.isCurrent 
                      ? 'bg-primary shadow-lg ring-4 ring-primary/20' 
                      : 'bg-muted shadow-lg ring-4 ring-background'
                  } flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <Icon className={`h-3 w-3 ${change.isCurrent ? 'text-primary-foreground' : colorClass}`} />
                  </div>

                  {/* Change details */}
                  <div className="flex-1 space-y-3 rounded-lg p-3 -ml-3 transition-all group-hover:bg-muted/20">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm flex items-center gap-2">
                          {change.description}
                          {change.isCurrent && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                              Current
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(change.date)}
                        </p>
                      </div>
                    </div>

                    {/* Salary change details */}
                    {change.type === 'salary_change' && (
                      <div className="space-y-2">
                        {/* HERO: Actual Salary Change */}
                        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Actual Monthly Salary Change</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Previous</p>
                              <p className="text-lg font-semibold">{formatCurrency(change.details.previousActual)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">New</p>
                              <p className="text-lg font-bold text-primary">{formatCurrency(change.details.newActual)}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge className={`${
                              change.details.changePercent > 0 
                                ? 'bg-green-600 text-white shadow-lg' 
                                : 'bg-red-600 text-white shadow-lg'
                            }`}>
                              {formatPercentage(change.details.changePercent)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Based on {change.details.hoursPerWeek}h/week
                            </span>
                          </div>
                        </div>

                        {/* Technical details - collapsible */}
                        <TechnicalDetailsCollapsible>
                          <div className="grid grid-cols-2 gap-2 text-xs opacity-60">
                            <div>
                              <p className="text-muted-foreground">Previous Hourly</p>
                              <p className="font-mono">{formatCurrency(change.details.previousHourly)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">New Hourly</p>
                              <p className="font-mono">{formatCurrency(change.details.newHourly)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Previous (bruto 36h)</p>
                              <p className="font-mono">
                                {formatCurrency((change.details.previousHourly * 36 * 52) / 12)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">New (bruto 36h)</p>
                              <p className="font-mono">
                                {formatCurrency((change.details.newHourly * 36 * 52) / 12)}
                              </p>
                            </div>
                          </div>
                        </TechnicalDetailsCollapsible>
                      </div>
                    )}

                    {/* Hours change details */}
                    {change.type === 'hours_change' && (
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <div className="grid grid-cols-2 gap-3 mb-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Previous Hours</p>
                              <p className="font-semibold">{change.details.previousHours}h/week</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">New Hours</p>
                              <p className="font-bold text-primary">{change.details.newHours}h/week</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-1">Actual Monthly Impact</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{formatCurrency(change.details.previousActual)} → {formatCurrency(change.details.newActual)}</span>
                              <Badge className={`${
                                change.details.changePercent > 0 
                                  ? 'bg-green-600 text-white shadow-lg' 
                                  : 'bg-red-600 text-white shadow-lg'
                              }`}>
                                {formatPercentage(change.details.changePercent)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contract start details */}
                    {change.type === 'contract_start' && (
                      <div className="space-y-2">
                        {change.isCurrent ? (
                          // HERO display for current contract
                          <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                            <p className="text-xs text-muted-foreground mb-2 font-medium">Initial Actual Monthly Salary</p>
                            <p className="text-2xl font-bold text-primary mb-2">
                              {formatCurrency(change.details.actualMonthly)}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="outline" className="bg-background/50">
                                {change.details.contractType}
                              </Badge>
                              <span className="text-muted-foreground">
                                {change.details.hoursPerWeek}h/week
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="pl-3 border-l-2 border-primary/30 space-y-1 text-sm">
                            <p><span className="text-muted-foreground">Type:</span> {change.details.contractType}</p>
                            <p><span className="text-muted-foreground">Actual Monthly:</span> {formatCurrency(change.details.actualMonthly)}</p>
                            <p><span className="text-muted-foreground">Hours:</span> {change.details.hoursPerWeek}h/week</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Contract end details */}
                    {change.type === 'contract_end' && (
                      <div className="pl-3 border-l-2 border-orange-500/30 text-sm">
                        <p className="text-muted-foreground">Contract Type: {change.details.contractType}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TechnicalDetailsCollapsible({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        <span>Technical Details</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
