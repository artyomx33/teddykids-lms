import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmploymentJourney } from '@/lib/employesContracts';
import { 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Award,
  FileText,
  Users
} from 'lucide-react';
import { formatDistanceToNow, addMonths, addYears, format } from 'date-fns';

interface EmploymentJourneyMapProps {
  journey: EmploymentJourney;
  staffName: string;
}

interface PredictedMilestone {
  id: string;
  title: string;
  date: Date;
  type: 'contract_end' | 'review_due' | 'chain_limit' | 'permanent_eligible';
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export function EmploymentJourneyMap({ journey, staffName }: EmploymentJourneyMapProps) {
  const { contracts, chainRuleStatus, terminationNotice, totalDurationMonths, salaryProgression } = journey;

  // Calculate predicted milestones
  const predictedMilestones: PredictedMilestone[] = [];

  // Current contract end date
  const currentContract = contracts[0];
  if (currentContract?.endDate) {
    predictedMilestones.push({
      id: 'contract-end',
      title: 'Current Contract Ends',
      date: new Date(currentContract.endDate),
      type: 'contract_end',
      priority: 'high',
      description: `${currentContract.contractType} contract expires`
    });
  }

  // Chain rule approaching limit
  if (chainRuleStatus.totalContracts >= 2 && chainRuleStatus.totalContracts < 3) {
    predictedMilestones.push({
      id: 'chain-limit',
      title: 'Chain Rule Limit Approaching',
      date: addMonths(new Date(journey.firstStartDate), 36),
      type: 'chain_limit',
      priority: 'high',
      description: `Next contract must be permanent (Chain Rule: ${chainRuleStatus.totalContracts}/3 contracts)`
    });
  }

  // Eligible for permanent contract
  if (chainRuleStatus.totalContracts === 3 || totalDurationMonths >= 36) {
    predictedMilestones.push({
      id: 'permanent-eligible',
      title: 'Eligible for Permanent Contract',
      date: new Date(),
      type: 'permanent_eligible',
      priority: 'medium',
      description: 'Employee has met criteria for permanent employment'
    });
  }

  // Sort milestones by date
  predictedMilestones.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Create timeline events
  const timelineEvents = [
    ...contracts.map(contract => ({
      date: new Date(contract.startDate),
      title: `Contract Started: ${contract.employmentType === 'permanent' ? 'Permanent' : 'Fixed-term'} (${contract.contractType})`,
      type: 'contract_start' as const,
      description: `€${contract.hourlyWage.toFixed(2)}/hour • €${contract.monthlyWage.toLocaleString()}/month • ${contract.hoursPerWeek}h/week (${contract.daysPerWeek} days)`,
      icon: FileText
    })),
    ...salaryProgression.filter(s => s.reason !== 'contract_start').map(salary => ({
      date: new Date(salary.date),
      title: `Salary ${salary.increasePercent > 0 ? 'Increase' : 'Change'}: ${salary.reason}`,
      type: 'salary_change' as const,
      description: `€${salary.hourlyWage.toFixed(2)}/hour (${salary.increasePercent > 0 ? '+' : ''}${salary.increasePercent.toFixed(1)}%)`,
      icon: TrendingUp
    })),
    ...contracts
      .filter(c => c.endDate)
      .map(contract => {
        const durationMonths = contract.endDate 
          ? Math.floor((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
          : 0;
        return {
          date: new Date(contract.endDate!),
          title: `Contract Ended: ${contract.contractType}`,
          type: 'contract_end' as const,
          description: `Duration: ${durationMonths} months`,
          icon: Clock
        };
      }),
    ...predictedMilestones.map(milestone => ({
      date: milestone.date,
      title: milestone.title,
      type: 'milestone' as const,
      description: milestone.description,
      icon: Award,
      priority: milestone.priority
    }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'contract_start': return 'bg-primary/10 border-primary';
      case 'contract_end': return 'bg-secondary/10 border-secondary';
      case 'salary_change': return 'bg-green-500/10 border-green-500';
      case 'milestone': return 'bg-accent/10 border-accent';
      default: return 'bg-muted border-border';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Employment Journey Map: {staffName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline">Journey Timeline</TabsTrigger>
            <TabsTrigger value="predictions">Milestone Predictions</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            <div className="space-y-4">
              {timelineEvents.map((event, index) => {
                const Icon = event.icon;
                const isUpcoming = event.date > new Date();
                
                return (
                  <div key={index} className="relative pl-8 pb-8 border-l-2 border-border last:border-l-0 last:pb-0">
                    <div className="absolute -left-3 top-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getEventColor(event.type)}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                    </div>
                    
                    <div className={`${getEventColor(event.type)} rounded-lg p-4 border`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{event.title}</h4>
                            {isUpcoming && (
                              <Badge variant="outline" className="text-xs">
                                Upcoming
                              </Badge>
                            )}
                            {event.type === 'milestone' && 'priority' in event && (
                              <Badge variant={getPriorityColor(event.priority as string) as any}>
                                {event.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{format(event.date, 'PPP')}</span>
                            <span>•</span>
                            <span>
                              {isUpcoming 
                                ? `In ${formatDistanceToNow(event.date)}`
                                : `${formatDistanceToNow(event.date)} ago`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <div className="space-y-4">
              {predictedMilestones.length > 0 ? (
                predictedMilestones.map(milestone => (
                  <Card key={milestone.id} className="border-l-4" style={{
                    borderLeftColor: milestone.priority === 'high' ? 'hsl(var(--destructive))' : 
                                    milestone.priority === 'medium' ? 'hsl(var(--primary))' : 
                                    'hsl(var(--muted))'
                  }}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{milestone.title}</h4>
                            <Badge variant={getPriorityColor(milestone.priority) as any}>
                              {milestone.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {milestone.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{format(milestone.date, 'PPP')}</span>
                            <span className="text-muted-foreground">
                              ({milestone.date > new Date() ? 'In' : ''} {formatDistanceToNow(milestone.date)})
                            </span>
                          </div>
                        </div>
                        {milestone.type === 'contract_end' && (
                          <Button size="sm" variant="outline">
                            Prepare Renewal
                          </Button>
                        )}
                        {milestone.type === 'permanent_eligible' && (
                          <Button size="sm">
                            Generate Permanent Contract
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No upcoming milestones predicted</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Employment</p>
                      <p className="text-2xl font-bold">{totalDurationMonths} months</p>
                    </div>
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Contracts</p>
                      <p className="text-2xl font-bold">{chainRuleStatus.totalContracts}</p>
                    </div>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Chain Rule Status</p>
                      <p className="text-2xl font-bold">
                        {chainRuleStatus.totalContracts}/3
                      </p>
                    </div>
                    {!chainRuleStatus.requiresPermanent ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Wage</p>
                      <p className="text-2xl font-bold">
                        €{currentContract?.monthlyWage.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {chainRuleStatus.message && (
              <Card className={!chainRuleStatus.requiresPermanent ? 'border-green-500' : 'border-destructive'}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    {!chainRuleStatus.requiresPermanent ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-semibold mb-1">Chain Rule Status</h4>
                      <p className="text-sm text-muted-foreground">{chainRuleStatus.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {terminationNotice && (
              <Card className="border-amber-500">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Termination Notice Required</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Days until deadline: {terminationNotice.daysUntilDeadline} days
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Status: <span className="font-medium">{terminationNotice.notificationStatus}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Must notify by: {format(new Date(terminationNotice.deadlineDate), 'PPP')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
