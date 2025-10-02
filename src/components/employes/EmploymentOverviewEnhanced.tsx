import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Clock, Briefcase, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EmploymentChange {
  date: string;
  type: 'contract_start' | 'contract_end' | 'salary_change' | 'hours_change' | 'contract_renewal';
  description: string;
  details: {
    previous?: any;
    current?: any;
    changePercent?: number;
    hoursPerWeek?: number;
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

  const calculateAdjustedSalary = (brutoMonthly: number, hoursPerWeek: number) => {
    // Bruto is based on 36 hours, adjust for actual working hours
    return (brutoMonthly * hoursPerWeek) / 36;
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
      
      // Get current hours for salary calculations
      const currentHoursEntry = hours.find((h: any) => h.is_active === true) || hours[hours.length - 1];
      const hoursPerWeek = currentHoursEntry ? parseFloat(currentHoursEntry.hours_per_week) || 36 : 36;
      
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
            changePercent: Math.round(changePercent * 100) / 100,
            hoursPerWeek: hoursPerWeek
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
          <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 shadow-lg">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">Current Employment</h3>
                <Badge variant="default" className="bg-green-600 shadow-sm">Active</Badge>
              </div>
              
              {/* HERO: Actual Monthly Salary */}
              {currentSalary && currentHours && (
                <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Monthly Salary (Actual)</div>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {formatCurrency(calculateAdjustedSalary(currentSalary.details.current?.monthWage || 0, currentHours.details.current?.hoursPerWeek || 36))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Based on {currentHours.details.current?.hoursPerWeek || 0}h/week ({currentHours.details.current?.daysPerWeek || 0} days)
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground/70 text-xs mb-1">Contract Type</div>
                  <div className="font-semibold">
                    {currentContract.details.current?.type || 'Not specified'}
                  </div>
                </div>
                
                <div>
                  <div className="text-muted-foreground/70 text-xs mb-1">Start Date</div>
                  <div className="font-semibold">
                    {formatDate(currentContract.date)}
                  </div>
                </div>
              </div>

              {/* Technical Details - Collapsible */}
              {currentSalary && currentHours && (
                <Collapsible className="mt-4">
                  <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
                    <ChevronDown className="h-3 w-3" />
                    <span>Technical Details</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 pt-3 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-3 text-xs opacity-60">
                      <div>
                        <div className="text-muted-foreground mb-0.5">Hourly Wage</div>
                        <div className="font-medium">
                          {formatCurrency(currentSalary.details.current?.hourWage || 0)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-muted-foreground mb-0.5">Monthly Bruto (36h base)</div>
                        <div className="font-medium">
                          {formatCurrency(currentSalary.details.current?.monthWage || 0)}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        )}

        {/* Change History */}
        <div>
          <h3 className="font-bold text-lg mb-4">Change History</h3>
          <div className="space-y-4">
            {changes.map((change, index) => (
              <div key={`${change.date}-${change.type}-${index}`} className="relative pl-8 pb-4 group">
                {/* Timeline dot */}
                <div className={`absolute left-0 top-1 h-4 w-4 rounded-full ${
                  change.isCurrent ? 'bg-primary shadow-lg shadow-primary/50' : 'bg-muted'
                } border-2 border-background ring-4 ring-background transition-all group-hover:scale-110`} />
                
                {/* Connecting line */}
                {index < changes.length - 1 && (
                  <div className="absolute left-[7px] top-5 w-0.5 h-full bg-gradient-to-b from-muted to-muted/30" />
                )}
                
                {/* Change details */}
                <div className="space-y-3 rounded-lg p-3 -ml-3 transition-all group-hover:bg-muted/20">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`flex items-center gap-1.5 font-semibold ${getChangeColor(change.type, change.details.changePercent)}`}>
                      {getChangeIcon(change.type)}
                      <span>{change.description}</span>
                    </span>
                    <span className="text-xs text-muted-foreground/70">
                      {formatDate(change.date)}
                    </span>
                    {change.isCurrent && (
                      <Badge variant="outline" className="text-xs border-primary/30">Current</Badge>
                    )}
                  </div>
                  
                   {/* Salary change details */}
                  {change.type === 'salary_change' && (
                    <div className="space-y-3">
                      {change.details.previous ? (
                        <>
                          {/* HERO: Actual Salary Change */}
                          {change.details.hoursPerWeek && (
                            <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                              <div className="flex items-center gap-3 flex-wrap">
                                <div>
                                  <div className="text-xs text-muted-foreground/70 mb-0.5">Previous (actual)</div>
                                  <div className="text-lg font-semibold">
                                    {formatCurrency(calculateAdjustedSalary(change.details.previous.monthWage, change.details.hoursPerWeek))}
                                  </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-primary" />
                                <div>
                                  <div className="text-xs text-muted-foreground/70 mb-0.5">New (actual)</div>
                                  <div className="text-lg font-bold text-primary">
                                    {formatCurrency(calculateAdjustedSalary(change.details.current?.monthWage || 0, change.details.hoursPerWeek))}
                                  </div>
                                </div>
                                {change.details.changePercent !== 0 && (
                                  <Badge 
                                    className={change.details.changePercent! > 0 
                                      ? 'bg-green-600 text-white shadow-lg' 
                                      : 'bg-orange-600 text-white shadow-lg'
                                    }
                                  >
                                    {formatPercentage(change.details.changePercent!)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Technical Details - Lower opacity */}
                          <Collapsible>
                            <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <ChevronDown className="h-3 w-3" />
                              <span>Show technical details</span>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 space-y-2 opacity-60">
                              <div className="text-xs flex items-center gap-2 flex-wrap">
                                <span className="text-muted-foreground">Hourly: {formatCurrency(change.details.previous.hourWage)}</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                                <span>{formatCurrency(change.details.current?.hourWage || 0)}</span>
                              </div>
                              <div className="text-xs flex items-center gap-2 flex-wrap">
                                <span className="text-muted-foreground">Bruto (36h base): {formatCurrency(change.details.previous.monthWage)}</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                                <span>{formatCurrency(change.details.current?.monthWage || 0)}</span>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </>
                      ) : (
                        <>
                          {/* Initial Salary */}
                          {change.details.hoursPerWeek && (
                            <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                              <div className="text-xs text-muted-foreground/70 mb-1">Initial Salary (actual)</div>
                              <div className="text-xl font-bold text-primary">
                                {formatCurrency(calculateAdjustedSalary(change.details.current?.monthWage || 0, change.details.hoursPerWeek))}
                              </div>
                            </div>
                          )}
                          
                          <Collapsible>
                            <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <ChevronDown className="h-3 w-3" />
                              <span>Show technical details</span>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 space-y-1 text-xs opacity-60">
                              <div>Hourly: {formatCurrency(change.details.current?.hourWage || 0)}</div>
                              <div>Bruto (36h base): {formatCurrency(change.details.current?.monthWage || 0)}</div>
                            </CollapsibleContent>
                          </Collapsible>
                        </>
                      )}
                      {change.details.current?.reason && change.details.current.reason !== 'Not specified' && (
                        <div className="text-xs text-muted-foreground/70 italic mt-2">
                          Reason: {change.details.current.reason}
                        </div>
                      )}
                    </div>
                  )}
                  
                   {/* Hours change details */}
                  {change.type === 'hours_change' && (
                    <div className="space-y-2">
                      {change.details.previous ? (
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div>
                              <div className="text-xs text-muted-foreground/70 mb-0.5">Previous</div>
                              <div className="font-semibold">
                                {change.details.previous.hoursPerWeek}h/week
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ({change.details.previous.daysPerWeek} days)
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-primary" />
                            <div>
                              <div className="text-xs text-muted-foreground/70 mb-0.5">New</div>
                              <div className="font-bold text-primary">
                                {change.details.current?.hoursPerWeek}h/week
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ({change.details.current?.daysPerWeek} days)
                              </div>
                            </div>
                            {change.details.changePercent !== 0 && (
                              <Badge 
                                className={change.details.changePercent! > 0 
                                  ? 'bg-green-600 text-white shadow-lg' 
                                  : 'bg-orange-600 text-white shadow-lg'
                                }
                              >
                                {formatPercentage(change.details.changePercent!)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <div className="text-xs text-muted-foreground/70 mb-1">Initial Working Hours</div>
                          <div className="font-bold text-primary">
                            {change.details.current?.hoursPerWeek}h/week ({change.details.current?.daysPerWeek} days)
                          </div>
                        </div>
                      )}
                      {change.details.current?.employeeType && (
                        <div className="text-xs text-muted-foreground/70">
                          Employee Type: {change.details.current.employeeType}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Contract start details */}
                  {change.type === 'contract_start' && (
                    <div className="text-sm text-muted-foreground/80 pl-3 border-l-2 border-primary/30">
                      {change.details.current?.endDate ? (
                        <>
                          Contract period: {formatDate(change.details.current.startDate)} → {formatDate(change.details.current.endDate)}
                        </>
                      ) : (
                        <>
                          Permanent contract (no end date)
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Contract end details */}
                  {change.type === 'contract_end' && (
                    <div className="text-sm text-muted-foreground/80 pl-3 border-l-2 border-orange-500/30">
                      Contract ended on {formatDate(change.details.current?.endDate)}
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
