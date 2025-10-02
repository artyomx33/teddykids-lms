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

      {/* Enhanced Employment Overview - will be injected separately */}

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
