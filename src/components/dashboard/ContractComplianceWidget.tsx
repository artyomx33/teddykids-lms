import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Scale, DollarSign, Clock, Calendar, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

type ComplianceContract = {
  employee_id: string;
  full_name: string;
  contract_end_date: string;
  contract_start_date: string;
  contract_type_at_event: string;
  month_wage_at_event: number;
  daysUntilExpiry: number;
  terminationNoticeDeadline: number;
  needsTerminationNotice: boolean;
  missedTerminationNotice: boolean;
  needsSalaryReview: boolean;
  contractDurationMonths: number;
  warningLevel: 'critical' | 'urgent' | 'upcoming';
  complianceType: 'legal_risk' | 'termination_notice' | 'salary_review' | 'renewal';
  // Calendar integration fields
  terminationNoticeDate?: string; // Date when termination notice must be sent
  salaryReviewDate?: string; // Date when salary review should be scheduled
  actionDeadline?: string; // Next action deadline date
  calendarEvent?: 'overdue' | 'due_today' | 'due_this_week' | 'upcoming';
};

export function ContractComplianceWidget() {
  const { data: complianceData = [], isLoading } = useQuery<ComplianceContract[]>({
    queryKey: ["contract-compliance-warnings"],
    retry: false,
    queryFn: async () => {
      console.log('ContractCompliance: Fetching contract compliance data');

      const today = new Date();
      const lookAhead90Days = new Date();
      lookAhead90Days.setDate(today.getDate() + 90);

      const { data, error } = await supabase
        .from('employes_timeline_v2')
        .select(`
          employee_id,
          full_name,
          contract_end_date,
          contract_start_date,
          contract_type_at_event,
          month_wage_at_event
        `)
        .eq('contract_type_at_event', 'fixed')
        .not('contract_end_date', 'is', null)
        .lte('contract_end_date', lookAhead90Days.toISOString().split('T')[0])
        .gte('contract_end_date', today.toISOString().split('T')[0])
        .order('contract_end_date', { ascending: true });

      if (error) {
        console.error('ContractCompliance: Error fetching contracts:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log('ContractCompliance: No contracts found requiring compliance monitoring');
        return [];
      }

      console.log(`ContractCompliance: Processing ${data.length} contracts for compliance`);

      return data.map(contract => {
        const endDate = new Date(contract.contract_end_date);
        const startDate = new Date(contract.contract_start_date);
        const daysUntilExpiry = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Dutch Law: Must notify employee 30 days before contract ends
        // We need to send notice by: contract_end_date - 30 days
        // Warning: Alert 14+ days before that deadline (44+ days before contract end)
        const terminationNoticeDeadline = daysUntilExpiry - 30;
        const needsTerminationNotice = terminationNoticeDeadline <= 14 && terminationNoticeDeadline > 0;
        const missedTerminationNotice = terminationNoticeDeadline <= 0 && daysUntilExpiry > 0;

        // Salary review: 1+ year contracts need salary review
        const contractDurationMonths = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
        const needsSalaryReview = contractDurationMonths >= 12 && daysUntilExpiry <= 60 && daysUntilExpiry > 30;

        // Determine compliance type and warning level
        let complianceType: ComplianceContract['complianceType'];
        let warningLevel: ComplianceContract['warningLevel'];

        if (missedTerminationNotice) {
          complianceType = 'legal_risk';
          warningLevel = 'critical';
        } else if (needsTerminationNotice) {
          complianceType = 'termination_notice';
          warningLevel = 'urgent';
        } else if (needsSalaryReview) {
          complianceType = 'salary_review';
          warningLevel = 'upcoming';
        } else {
          complianceType = 'renewal';
          warningLevel = daysUntilExpiry <= 7 ? 'critical' :
                        daysUntilExpiry <= 30 ? 'urgent' : 'upcoming';
        }

        // Calculate calendar integration dates
        let terminationNoticeDate: string | undefined;
        let salaryReviewDate: string | undefined;
        let actionDeadline: string | undefined;
        let calendarEvent: ComplianceContract['calendarEvent'] = 'upcoming';

        if (complianceType === 'termination_notice' || complianceType === 'legal_risk') {
          // Termination notice must be sent 30 days before contract end
          const noticeDate = new Date(endDate);
          noticeDate.setDate(noticeDate.getDate() - 30);
          terminationNoticeDate = noticeDate.toISOString().split('T')[0];
          actionDeadline = terminationNoticeDate;
        }

        if (complianceType === 'salary_review') {
          // Salary review should be scheduled 60 days before contract end
          const reviewDate = new Date(endDate);
          reviewDate.setDate(reviewDate.getDate() - 60);
          salaryReviewDate = reviewDate.toISOString().split('T')[0];
          actionDeadline = salaryReviewDate;
        }

        if (complianceType === 'renewal') {
          // Renewal decision should be made by contract end date
          actionDeadline = contract.contract_end_date;
        }

        // Determine calendar event urgency
        if (actionDeadline) {
          const deadlineDate = new Date(actionDeadline);
          const diffDays = Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            calendarEvent = 'overdue';
          } else if (diffDays === 0) {
            calendarEvent = 'due_today';
          } else if (diffDays <= 7) {
            calendarEvent = 'due_this_week';
          } else {
            calendarEvent = 'upcoming';
          }
        }

        return {
          employee_id: contract.employee_id,
          full_name: contract.full_name,
          contract_end_date: contract.contract_end_date,
          contract_start_date: contract.contract_start_date,
          contract_type_at_event: contract.contract_type_at_event,
          month_wage_at_event: contract.month_wage_at_event || 0,
          daysUntilExpiry,
          terminationNoticeDeadline,
          needsTerminationNotice,
          missedTerminationNotice,
          needsSalaryReview,
          contractDurationMonths,
          warningLevel,
          complianceType,
          terminationNoticeDate,
          salaryReviewDate,
          actionDeadline,
          calendarEvent
        };
      });
    },
  });

  // Group contracts by compliance type for priority display
  const complianceGroups = useMemo(() => {
    const groups = [
      {
        title: "🚨 LEGAL RISKS",
        subtitle: "Missed 30-day termination notice deadline",
        contracts: complianceData.filter(c => c.complianceType === 'legal_risk'),
        bgColor: "bg-red-100 dark:bg-red-950",
        borderColor: "border-red-200 dark:border-red-800",
        textColor: "text-red-800 dark:text-red-200",
        urgent: true,
        action: "Contact Legal",
        icon: AlertTriangle
      },
      {
        title: "⚖️ TERMINATION NOTICES DUE",
        subtitle: "Dutch law requires 30-day notice",
        contracts: complianceData.filter(c => c.complianceType === 'termination_notice'),
        bgColor: "bg-orange-100 dark:bg-orange-950",
        borderColor: "border-orange-200 dark:border-orange-800",
        textColor: "text-orange-800 dark:text-orange-200",
        urgent: true,
        action: "Send Notices",
        icon: Scale
      },
      {
        title: "💰 SALARY REVIEWS NEEDED",
        subtitle: "1+ year contracts require review",
        contracts: complianceData.filter(c => c.complianceType === 'salary_review'),
        bgColor: "bg-blue-100 dark:bg-blue-950",
        borderColor: "border-blue-200 dark:border-blue-800",
        textColor: "text-blue-800 dark:text-blue-200",
        urgent: false,
        action: "Schedule Reviews",
        icon: DollarSign
      },
      {
        title: "⏰ CONTRACT RENEWALS",
        subtitle: "Expiring within 30 days",
        contracts: complianceData.filter(c => c.complianceType === 'renewal'),
        bgColor: "bg-yellow-100 dark:bg-yellow-950",
        borderColor: "border-yellow-200 dark:border-yellow-800",
        textColor: "text-yellow-800 dark:text-yellow-200",
        urgent: false,
        action: "Renew Contracts",
        icon: Clock
      }
    ].filter(group => group.contracts.length > 0);

    return groups;
  }, [complianceData]);

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4 text-purple-500" />
            Contract Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-pulse text-muted-foreground">
              Checking compliance status...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // if (complianceGroups.length === 0) {
  //   return (
  //     <Card className="shadow-card">
  //       <CardHeader>
  //         <CardTitle className="flex items-center gap-2 text-base">
  //           <Scale className="h-4 w-4 text-green-500" />
  //           Contract Compliance
  //         </CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="text-center py-4 text-muted-foreground">
  //           <Scale className="h-8 w-8 mx-auto mb-2 opacity-50 text-green-500" />
  //           <p className="text-sm font-medium text-green-700 dark:text-green-300">All contracts compliant!</p>
  //           <p className="text-xs">No urgent compliance actions needed 🎉</p>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  if (complianceGroups.length === 0) {
    return null; // Don't show widget when no compliance issues
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4 text-purple-500" />
            Contract Compliance
          </div>
          <Badge variant="secondary" className="text-xs">
            🇳🇱 Dutch Law
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {complianceGroups.map((group, groupIndex) => {
          const Icon = group.icon;
          return (
            <div key={groupIndex} className={`p-3 rounded-lg border ${group.bgColor} ${group.borderColor}`}>
              {/* Group Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${group.textColor}`} />
                  <div>
                    <h4 className={`font-semibold text-sm ${group.textColor}`}>
                      {group.title}
                    </h4>
                    <p className={`text-xs opacity-80 ${group.textColor}`}>
                      {group.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${group.textColor} border-current`}>
                    {group.contracts.length} contract{group.contracts.length !== 1 ? 's' : ''}
                  </Badge>
                  {group.urgent && (
                    <Badge variant="destructive" className="text-xs">
                      URGENT
                    </Badge>
                  )}
                </div>
              </div>

              {/* Contract List */}
              <div className="space-y-2">
                {group.contracts.slice(0, 3).map((contract, index) => {
                  // Calendar event indicator
                  const getCalendarIcon = () => {
                    switch (contract.calendarEvent) {
                      case 'overdue': return '🚨';
                      case 'due_today': return '⏰';
                      case 'due_this_week': return '📅';
                      default: return '📋';
                    }
                  };

                  const getCalendarBadge = () => {
                    if (!contract.actionDeadline) return null;

                    const today = new Date();
                    const deadline = new Date(contract.actionDeadline);
                    const diffDays = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    let badgeText = '';
                    let badgeClass = '';

                    if (diffDays < 0) {
                      badgeText = `${Math.abs(diffDays)}d overdue`;
                      badgeClass = 'bg-red-100 text-red-800 border-red-200';
                    } else if (diffDays === 0) {
                      badgeText = 'Due today!';
                      badgeClass = 'bg-orange-100 text-orange-800 border-orange-200';
                    } else if (diffDays <= 7) {
                      badgeText = `${diffDays}d left`;
                      badgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                    } else {
                      badgeText = `${diffDays}d left`;
                      badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
                    }

                    return (
                      <Badge variant="outline" className={`text-xs ${badgeClass}`}>
                        {getCalendarIcon()} {badgeText}
                      </Badge>
                    );
                  };

                  return (
                    <div key={index} className="flex items-center justify-between bg-white/50 dark:bg-black/20 p-2 rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{contract.full_name}</p>
                          {getCalendarBadge()}
                        </div>
                        <p className="text-xs opacity-80 mt-1">
                          {contract.complianceType === 'legal_risk' &&
                            `⚠️ Notice deadline passed ${Math.abs(contract.terminationNoticeDeadline)} days ago`}
                          {contract.complianceType === 'termination_notice' &&
                            `📋 Notice due in ${contract.terminationNoticeDeadline} days`}
                          {contract.complianceType === 'salary_review' &&
                            `💰 ${contract.contractDurationMonths} month contract • Review needed`}
                          {contract.complianceType === 'renewal' &&
                            `⏰ Expires in ${contract.daysUntilExpiry} days`}
                        </p>
                        {contract.actionDeadline && (
                          <div className="flex items-center gap-1 mt-1">
                            <CalendarDays className="h-3 w-3 opacity-60" />
                            <p className="text-xs opacity-60">
                              Action by: {new Date(contract.actionDeadline).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: new Date(contract.actionDeadline).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-right ml-2">
                        <p className="font-medium">
                          {new Date(contract.contract_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        {contract.month_wage_at_event > 0 && (
                          <p className="opacity-80">
                            €{contract.month_wage_at_event.toLocaleString()}/mo
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {group.contracts.length > 3 && (
                  <p className="text-xs opacity-80 text-center py-1">
                    +{group.contracts.length - 3} more contracts
                  </p>
                )}
              </div>

              {/* Action Button */}
              <Button
                size="sm"
                variant={group.urgent ? "destructive" : "outline"}
                className="w-full mt-3 text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                {group.action}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}