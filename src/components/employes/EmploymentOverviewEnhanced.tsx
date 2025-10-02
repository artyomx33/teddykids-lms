import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Clock, Briefcase, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface EmploymentChange {
  date: string;
  type: 'contract_start' | 'contract_end' | 'salary_change' | 'hours_change' | 'contract_renewal';
  description: string;
  details: {
    previous?: any;
    current?: any;
    changePercent?: number;
  };
  isCurrent: boolean;
}

interface EmploymentOverviewEnhancedProps {
  rawEmploymentData: any;
  staffName: string;
}

export function EmploymentOverviewEnhanced({ rawEmploymentData, staffName }: EmploymentOverviewEnhancedProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const formatPercentage = (change: number) => {
    const formatted = change.toFixed(1);
    return change > 0 ? `+${formatted}%` : `${formatted}%`;
  };

  const parseEmploymentChanges = (): EmploymentChange[] => {
    if (!rawEmploymentData?.api_response?.data) return [];
    
    const employmentsData = rawEmploymentData.api_response.data;
    if (!Array.isArray(employmentsData)) return [];

    const changes: EmploymentChange[] = [];
    const today = new Date();

    employmentsData.forEach((employment: any) => {
      const salaries = Array.isArray(employment.salary) ? employment.salary : [];
      const hours = Array.isArray(employment.hours) ? employment.hours : [];
      const startDate = employment.start_date;
      const endDate = employment.end_date && employment.end_date !== '0001-01-01T00:00:00' ? employment.end_date : null;
      const isActive = employment.is_active || !endDate || new Date(endDate) > today;

      // Contract start
      changes.push({
        date: startDate,
        type: 'contract_start',
        description: endDate ? 'Fixed-term contract started' : 'Permanent contract started',
        details: {
          current: {
            startDate,
            endDate,
            type: endDate ? 'Fixed-term' : 'Permanent'
          }
        },
        isCurrent: isActive && !endDate
      });

      // Contract end
      if (endDate) {
        changes.push({
          date: endDate,
          type: 'contract_end',
          description: 'Contract ended',
          details: {
            current: { endDate }
          },
          isCurrent: false
        });
      }

      // Salary changes
      const sortedSalaries = [...salaries].sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
      
      sortedSalaries.forEach((salary: any, index: number) => {
        const prevSalary = index > 0 ? sortedSalaries[index - 1] : null;
        const hourWage = parseFloat(salary.hour_wage) || 0;
        const monthWage = parseFloat(salary.month_wage) || 0;
        
        let changePercent = 0;
        if (prevSalary) {
          const prevHourWage = parseFloat(prevSalary.hour_wage) || 0;
          if (prevHourWage > 0) {
            changePercent = ((hourWage - prevHourWage) / prevHourWage) * 100;
          }
        }

        changes.push({
          date: salary.start_date,
          type: 'salary_change',
          description: prevSalary ? 'Salary adjustment' : 'Initial salary',
          details: {
            previous: prevSalary ? {
              hourWage: parseFloat(prevSalary.hour_wage),
              monthWage: parseFloat(prevSalary.month_wage)
            } : null,
            current: {
              hourWage,
              monthWage,
              yearWage: parseFloat(salary.yearly_wage) || 0,
              reason: salary.wage_reason || 'Not specified'
            },
            changePercent: Math.round(changePercent * 100) / 100
          },
          isCurrent: salary.is_active === true
        });
      });

      // Hours changes
      const sortedHours = [...hours].sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
      
      sortedHours.forEach((hoursEntry: any, index: number) => {
        const prevHours = index > 0 ? sortedHours[index - 1] : null;
        const hoursPerWeek = parseFloat(hoursEntry.hours_per_week) || 0;
        
        let changePercent = 0;
        if (prevHours) {
          const prevHoursPerWeek = parseFloat(prevHours.hours_per_week) || 0;
          if (prevHoursPerWeek > 0) {
            changePercent = ((hoursPerWeek - prevHoursPerWeek) / prevHoursPerWeek) * 100;
          }
        }

        changes.push({
          date: hoursEntry.start_date,
          type: 'hours_change',
          description: prevHours ? 'Working hours adjusted' : 'Initial working hours',
          details: {
            previous: prevHours ? {
              hoursPerWeek: parseFloat(prevHours.hours_per_week),
              daysPerWeek: parseFloat(prevHours.days_per_week)
            } : null,
            current: {
              hoursPerWeek,
              daysPerWeek: parseFloat(hoursEntry.days_per_week) || 0,
              partTimeFactor: parseFloat(hoursEntry.parttime_factor) || 1,
              employeeType: hoursEntry.employee_type
            },
            changePercent: Math.round(changePercent * 100) / 100
          },
          isCurrent: hoursEntry.is_active === true
        });
      });
    });

    // Sort by date (most recent first)
    return changes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const changes = parseEmploymentChanges();
  const currentContract = changes.find(c => c.isCurrent && c.type === 'contract_start');
  const currentSalary = changes.find(c => c.isCurrent && c.type === 'salary_change');
  const currentHours = changes.find(c => c.isCurrent && c.type === 'hours_change');

  const getChangeIcon = (type: EmploymentChange['type']) => {
    switch (type) {
      case 'contract_start':
      case 'contract_renewal':
        return <Briefcase className="h-4 w-4" />;
      case 'contract_end':
        return <Clock className="h-4 w-4" />;
      case 'salary_change':
        return <TrendingUp className="h-4 w-4" />;
      case 'hours_change':
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getChangeColor = (type: EmploymentChange['type'], changePercent?: number) => {
    if (type === 'contract_end') return 'text-orange-600';
    if (type === 'salary_change' || type === 'hours_change') {
      if (changePercent && changePercent > 0) return 'text-green-600';
      if (changePercent && changePercent < 0) return 'text-orange-600';
    }
    return 'text-primary';
  };

  if (changes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No employment data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Contract Summary */}
        {currentContract && (
          <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Current Employment</h3>
              <Badge variant="default" className="bg-green-600">Active</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Contract Type</div>
                <div className="font-medium">
                  {currentContract.details.current?.type || 'Not specified'}
                </div>
              </div>
              
              <div>
                <div className="text-muted-foreground mb-1">Start Date</div>
                <div className="font-medium">
                  {formatDate(currentContract.date)}
                </div>
              </div>

              {currentSalary && (
                <>
                  <div>
                    <div className="text-muted-foreground mb-1">Hourly Wage</div>
                    <div className="font-medium">
                      {formatCurrency(currentSalary.details.current?.hourWage || 0)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground mb-1">Monthly Gross</div>
                    <div className="font-medium">
                      {formatCurrency(currentSalary.details.current?.monthWage || 0)}
                    </div>
                  </div>
                </>
              )}

              {currentHours && (
                <>
                  <div>
                    <div className="text-muted-foreground mb-1">Hours/Week</div>
                    <div className="font-medium">
                      {currentHours.details.current?.hoursPerWeek || 0}h
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground mb-1">Days/Week</div>
                    <div className="font-medium">
                      {currentHours.details.current?.daysPerWeek || 0} days
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Change History */}
        <div>
          <h3 className="font-semibold mb-4">Change History</h3>
          <div className="space-y-3">
            {changes.map((change, index) => (
              <div key={`${change.date}-${change.type}-${index}`} className="relative pl-8 pb-4">
                {/* Timeline dot */}
                <div className={`absolute left-0 top-1 h-4 w-4 rounded-full ${
                  change.isCurrent ? 'bg-primary' : 'bg-muted'
                } border-2 border-background`} />
                
                {/* Connecting line */}
                {index < changes.length - 1 && (
                  <div className="absolute left-[7px] top-5 w-0.5 h-full bg-muted" />
                )}
                
                {/* Change details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`flex items-center gap-1 ${getChangeColor(change.type, change.details.changePercent)}`}>
                      {getChangeIcon(change.type)}
                      <span className="font-medium">{change.description}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(change.date)}
                    </span>
                    {change.isCurrent && (
                      <Badge variant="outline" className="text-xs">Current</Badge>
                    )}
                  </div>
                  
                   {/* Salary change details */}
                  {change.type === 'salary_change' && (
                    <div className="text-sm space-y-2">
                      {change.details.previous ? (
                        <>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-muted-foreground">Previous: {formatCurrency(change.details.previous.hourWage)}/h</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-foreground font-medium">
                              New: {formatCurrency(change.details.current?.hourWage || 0)}/h
                            </span>
                            {change.details.changePercent !== 0 && (
                              <Badge 
                                variant="secondary"
                                className={change.details.changePercent! > 0 
                                  ? 'bg-green-500/10 text-green-700 border-green-500/20' 
                                  : 'bg-orange-500/10 text-orange-700 border-orange-500/20'
                                }
                              >
                                {formatPercentage(change.details.changePercent!)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-muted-foreground">
                              Previous (bruto): {formatCurrency(change.details.previous.monthWage)}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-foreground font-medium">
                              New (bruto): {formatCurrency(change.details.current?.monthWage || 0)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-muted-foreground">
                            Salary: {formatCurrency(change.details.current?.hourWage || 0)}/h
                          </div>
                          <div className="text-muted-foreground">
                            Salary (bruto): {formatCurrency(change.details.current?.monthWage || 0)}
                          </div>
                        </>
                      )}
                      {change.details.current?.reason && change.details.current.reason !== 'Not specified' && (
                        <div className="text-xs text-muted-foreground italic">
                          Reason: {change.details.current.reason}
                        </div>
                      )}
                    </div>
                  )}
                  
                   {/* Hours change details */}
                  {change.type === 'hours_change' && (
                    <div className="text-sm space-y-2">
                      {change.details.previous ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-muted-foreground">
                            Previous: {change.details.previous.hoursPerWeek}h/week ({change.details.previous.daysPerWeek} days)
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground font-medium">
                            New: {change.details.current?.hoursPerWeek}h/week ({change.details.current?.daysPerWeek} days)
                          </span>
                          {change.details.changePercent !== 0 && (
                            <Badge 
                              variant="secondary"
                              className={change.details.changePercent! > 0 
                                ? 'bg-green-500/10 text-green-700 border-green-500/20' 
                                : 'bg-orange-500/10 text-orange-700 border-orange-500/20'
                              }
                            >
                              {formatPercentage(change.details.changePercent!)}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          Working hours: {change.details.current?.hoursPerWeek}h/week ({change.details.current?.daysPerWeek} days)
                        </div>
                      )}
                      {change.details.current?.employeeType && (
                        <div className="text-xs text-muted-foreground">
                          Type: {change.details.current.employeeType}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Contract start/end details */}
                  {(change.type === 'contract_start' || change.type === 'contract_end') && (
                    <div className="text-sm text-muted-foreground">
                      {change.type === 'contract_start' && change.details.current?.endDate && (
                        <span>Until: {formatDate(change.details.current.endDate)}</span>
                      )}
                      {change.type === 'contract_start' && !change.details.current?.endDate && (
                        <span>No end date (Permanent)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
