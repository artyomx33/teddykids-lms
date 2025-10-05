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

interface DetectedChange {
  id: string;
  employee_id: string;
  change_type: 'salary_change' | 'hours_change' | 'contract_change';
  effective_date: string;
  field_name: string;
  old_value: number | string;
  new_value: number | string;
  change_amount: number | null;
  change_percent: number | null;
  business_impact: string;
  metadata: any;
  confidence_score: number;
  created_at: string;
}

interface EmploymentOverviewEnhancedProps {
  staffName: string;
  detectedChanges?: DetectedChange[];
}

export function EmploymentOverviewEnhanced({ staffName, detectedChanges = [] }: EmploymentOverviewEnhancedProps) {
  console.log('🎨 EmploymentOverviewEnhanced rendering with:', {
    staffName,
    detectedChangesCount: detectedChanges?.length || 0,
    detectedChanges: detectedChanges
  });

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

  // ONLY USE NEW DATA - NO FALLBACKS!
  // Old parseEmploymentChanges() function removed - we now use employes_changes table
  console.log('📊 Using NEW detected changes only:', detectedChanges?.length || 0);
  
  // Extract current state from detected changes
  const salaryChanges = detectedChanges?.filter(c => c.change_type === 'salary_change') || [];
  const hoursChanges = detectedChanges?.filter(c => c.change_type === 'hours_change') || [];
  const contractChanges = detectedChanges?.filter(c => c.change_type === 'contract_change') || [];
  
  const latestSalary = salaryChanges.length > 0 ? salaryChanges[salaryChanges.length - 1] : null;
  const latestHours = hoursChanges.length > 0 ? hoursChanges[hoursChanges.length - 1] : null;
  const latestContract = contractChanges.length > 0 ? contractChanges[contractChanges.length - 1] : null;

  // If no detected changes, show message to run sync
  if (!detectedChanges || detectedChanges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No employment change history detected yet.</p>
            <p className="text-sm text-muted-foreground">
              Run the change detector to analyze employment data and detect salary, hours, and contract changes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment Overview - AI-Detected Changes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current State Summary from Latest Changes */}
        {(latestSalary || latestHours || latestContract) && (
          <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 shadow-lg">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">Current Employment</h3>
                <Badge variant="default" className="bg-green-600 shadow-sm">Active</Badge>
              </div>
              
              {/* HERO: Current Monthly Salary from NEW DATA */}
              {latestSalary && (
                <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Current Monthly Salary</div>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {formatCurrency(typeof latestSalary.new_value === 'number' ? latestSalary.new_value : 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {latestHours && `Based on ${latestHours.new_value}h/week`}
                    {latestContract && ` • ${latestContract.new_value === 'permanent' ? 'Permanent' : 'Fixed-term'} contract`}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {latestContract && (
                  <div>
                    <div className="text-muted-foreground/70 text-xs mb-1">Contract Type</div>
                    <div className="font-semibold">
                      {latestContract.new_value === 'permanent' ? 'Permanent' : 'Fixed-term'}
                    </div>
                  </div>
                )}
                
                {latestHours && (
                  <div>
                    <div className="text-muted-foreground/70 text-xs mb-1">Working Hours</div>
                    <div className="font-semibold">
                      {latestHours.new_value}h/week
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Complete Change History - AI-Detected */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold text-lg">Complete Change History</h3>
            <Badge variant="outline">{detectedChanges.length} changes detected</Badge>
          </div>
          <div className="space-y-4">
            {detectedChanges.map((change, index) => {
              const isLatest = index === detectedChanges.length - 1;
              return (
              <div key={change.id} className="relative pl-8 pb-4 group">
                {/* Timeline dot */}
                <div className={`absolute left-0 top-1 h-4 w-4 rounded-full ${
                  isLatest ? 'bg-primary shadow-lg shadow-primary/50' : 'bg-muted'
                } border-2 border-background ring-4 ring-background transition-all group-hover:scale-110`} />
                
                {/* Connecting line */}
                {index < detectedChanges.length - 1 && (
                  <div className="absolute left-[7px] top-5 w-0.5 h-full bg-gradient-to-b from-muted to-muted/30" />
                )}
                
                {/* Change details */}
                <div className="space-y-3 rounded-lg p-3 -ml-3 transition-all group-hover:bg-muted/20">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={
                      change.change_type === 'salary_change' ? 'default' :
                      change.change_type === 'hours_change' ? 'secondary' :
                      'outline'
                    }>
                      {change.change_type.replace('_', ' ')}
                    </Badge>
                    <span className="font-semibold">
                      {change.business_impact.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground/70">
                      {formatDate(change.effective_date)}
                    </span>
                    {isLatest && (
                      <Badge variant="outline" className="text-xs border-primary/30">Current</Badge>
                    )}
                  </div>
                  
                  {/* Change value details */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Previous:</span>
                      <span className="font-mono font-semibold">
                        {typeof change.old_value === 'number' ? formatCurrency(change.old_value) : change.old_value}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">New:</span>
                      <span className="font-mono font-bold text-primary">
                        {typeof change.new_value === 'number' ? formatCurrency(change.new_value) : change.new_value}
                      </span>
                    </div>
                    {change.change_percent !== null && change.change_percent !== 0 && (
                      <Badge className={change.change_percent > 0 ? 'bg-green-600' : 'bg-orange-600'}>
                        {formatPercentage(change.change_percent)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
