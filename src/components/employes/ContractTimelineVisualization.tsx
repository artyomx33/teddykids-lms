import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { EmploymentJourney } from '@/lib/employesContracts';
import { format, differenceInMonths } from 'date-fns';

interface ContractTimelineVisualizationProps {
  journey: EmploymentJourney;
}

export function ContractTimelineVisualization({ journey }: ContractTimelineVisualizationProps) {
  const { 
    contracts, 
    chainRuleStatus, 
    terminationNotice, 
    salaryProgression,
    totalDurationMonths 
  } = journey;

  const getChainRuleColor = () => {
    switch (chainRuleStatus.warningLevel) {
      case 'permanent_required': return 'bg-destructive text-destructive-foreground';
      case 'critical': return 'bg-orange-500 text-white';
      case 'warning': return 'bg-yellow-500 text-black';
      default: return 'bg-green-500 text-white';
    }
  };

  const getTerminationColor = () => {
    if (!terminationNotice) return '';
    switch (terminationNotice.notificationStatus) {
      case 'overdue': return 'border-destructive';
      case 'critical': return 'border-destructive';
      case 'urgent': return 'border-orange-500';
      case 'ideal': return 'border-yellow-500';
      default: return 'border-muted';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Chain Rule Status */}
      <Alert className={getChainRuleColor()}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="font-semibold">
          {chainRuleStatus.message}
        </AlertDescription>
      </Alert>

      {/* Termination Notice Alert */}
      {terminationNotice?.shouldNotify && (
        <Alert className={getTerminationColor()}>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">
              {terminationNotice.notificationStatus === 'overdue' && (
                <>
                  ⚠️ Termination deadline passed {terminationNotice.penaltyDays} days ago
                  <br />
                  <span className="text-sm">
                    Penalty: {formatCurrency(terminationNotice.penaltyAmount)} 
                    ({formatCurrency(terminationNotice.penaltyAmount / terminationNotice.penaltyDays)}/day)
                  </span>
                </>
              )}
              {terminationNotice.notificationStatus === 'critical' && (
                <>🚨 Legal deadline TODAY - must notify employee</>
              )}
              {terminationNotice.notificationStatus === 'urgent' && (
                <>⏰ {terminationNotice.daysUntilDeadline} days until legal deadline</>
              )}
              {terminationNotice.notificationStatus === 'ideal' && (
                <>📅 {terminationNotice.daysUntilDeadline} days until termination deadline</>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Contract Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Employment Overview
          </CardTitle>
          <CardDescription>
            {totalDurationMonths} months of employment • {contracts.length} contract(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline Visualization */}
          <div className="space-y-3">
            {contracts.map((contract, index) => {
              const startDate = new Date(contract.startDate);
              const endDate = contract.endDate ? new Date(contract.endDate) : null;
              const durationMonths = endDate 
                ? differenceInMonths(endDate, startDate)
                : differenceInMonths(new Date(), startDate);
              
              const isPermanent = contract.employmentType === 'permanent';
              const isActive = contract.isActive;
              
              return (
                <div key={contract.id} className="relative pl-8 pb-4">
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-1 h-4 w-4 rounded-full ${
                    isActive ? 'bg-primary' : 'bg-muted'
                  } border-2 border-background`} />
                  
                  {/* Connecting line */}
                  {index < contracts.length - 1 && (
                    <div className="absolute left-[7px] top-5 w-0.5 h-full bg-muted" />
                  )}
                  
                  {/* Contract details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={isActive ? 'default' : 'secondary'}>
                        Contract {contract.contractNumber}
                      </Badge>
                      <Badge variant={isPermanent ? 'default' : 'outline'}>
                        {isPermanent ? '✓ Permanent' : 'Fixed-term'}
                      </Badge>
                      <Badge variant="outline">
                        {contract.hoursPerWeek}h/week
                      </Badge>
                      {isActive && (
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(startDate, 'MMM d, yyyy')} 
                          {endDate && ` → ${format(endDate, 'MMM d, yyyy')}`}
                          {!endDate && ' → Present'}
                          <span className="ml-2 text-xs">
                            ({durationMonths} months)
                          </span>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                          {formatCurrency(contract.hourlyWage)}/hour
                        </span>
                        <span className="text-muted-foreground text-xs">
                          ({formatCurrency(contract.monthlyWage)}/month)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Salary Progression */}
          {salaryProgression.length > 1 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Salary Progression
              </h4>
              <div className="space-y-2">
                {salaryProgression.map((change, index) => (
                  <div key={change.date} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {format(new Date(change.date), 'MMM yyyy')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatCurrency(change.hourlyWage)}/h
                      </span>
                      {change.increasePercent > 0 && (
                        <Badge variant="outline" className="bg-green-50">
                          +{change.increasePercent}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chain Rule Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Dutch Chain Rule (Ketenregeling)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Contracts</span>
                <span className="font-semibold">
                  {chainRuleStatus.totalContracts} / 3
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    chainRuleStatus.totalContracts >= 3 ? 'bg-destructive' :
                    chainRuleStatus.totalContracts >= 2 ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(chainRuleStatus.totalContracts / 3) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Employment Duration</span>
                <span className="font-semibold">
                  {Math.floor(chainRuleStatus.totalEmploymentMonths / 12)} years {chainRuleStatus.totalEmploymentMonths % 12} months
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    chainRuleStatus.totalEmploymentMonths >= 36 ? 'bg-destructive' :
                    chainRuleStatus.totalEmploymentMonths >= 30 ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(chainRuleStatus.totalEmploymentMonths / 36) * 100}%` }}
                />
              </div>
            </div>

            {chainRuleStatus.requiresPermanent && (
              <Alert className="bg-destructive/10 border-destructive">
                <CheckCircle2 className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-sm font-semibold text-destructive">
                  Next contract MUST be permanent (vast contract)
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
