import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, FileX, Users, TrendingDown, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Problem {
  id: string;
  type: "overdue_review" | "missing_documents" | "contract_expiring" | "performance_decline" | "compliance_risk";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  staffAffected: string[];
  actionRequired: string;
  daysOverdue?: number;
  manager?: string;
}

async function detectProblems(): Promise<Problem[]> {
  const problems: Problem[] = [];

  try {
    // Detect overdue reviews
    const { data: overdueReviews, error: reviewError } = await supabase
      .from('contracts_enriched')
      .select('full_name, manager_key, needs_six_month_review, needs_yearly_review, next_review_due')
      .or('needs_six_month_review.eq.true,needs_yearly_review.eq.true');

    let overdueReviewsData = overdueReviews;
    if (reviewError && reviewError.code === 'PGRST205') {
      console.log('ProblemDetectionEngine: contracts_enriched table not found for overdue reviews, using mock data');
      overdueReviewsData = [];
    }

    if (overdueReviewsData) {
      overdueReviewsData.forEach(staff => {
        if (staff.needs_six_month_review || staff.needs_yearly_review) {
          const reviewType = staff.needs_yearly_review ? "yearly" : "6-month";
          problems.push({
            id: `overdue_${staff.full_name}`,
            type: "overdue_review",
            severity: "critical",
            title: `${reviewType} Review Overdue`,
            description: `${staff.full_name} hasn't had a review and it's now overdue`,
            staffAffected: [staff.full_name || "Unknown"],
            actionRequired: "Schedule review immediately",
            manager: staff.manager_key || "Unknown"
          });
        }
      });
    }

    // Detect missing documents
    const { data: missingDocs } = await supabase
      .from('staff_docs_status')
      .select('full_name, missing_count, vog_missing, pok_missing, prk_missing')
      .gt('missing_count', 0);

    if (missingDocs && missingDocs.length > 0) {
      const staffWithMissingDocs = missingDocs.map(s => s.full_name || "Unknown");
      problems.push({
        id: "missing_documents",
        type: "missing_documents",
        severity: "high",
        title: "Staff Missing Critical Documents",
        description: `${missingDocs.length} staff members are missing required documents`,
        staffAffected: staffWithMissingDocs,
        actionRequired: "Send document upload reminders"
      });
    }

    // Detect expiring contracts
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const { data: expiringContracts, error: contractError } = await supabase
      .from('contracts_enriched')
      .select('full_name, end_date, manager_key')
      .not('end_date', 'is', null)
      .lte('end_date', thirtyDaysFromNow.toISOString().split('T')[0]);

    let expiringContractsData = expiringContracts;
    if (contractError && contractError.code === 'PGRST205') {
      console.log('ProblemDetectionEngine: contracts_enriched table not found for expiring contracts, using mock data');
      expiringContractsData = [];
    }

    if (expiringContractsData && expiringContractsData.length > 0) {
      const staffWithExpiringContracts = expiringContractsData.map(s => s.full_name || "Unknown");
      problems.push({
        id: "contracts_expiring",
        type: "contract_expiring",
        severity: "medium",
        title: "Contracts Expiring Soon",
        description: `${expiringContractsData.length} contracts expire in the next 30 days`,
        staffAffected: staffWithExpiringContracts,
        actionRequired: "Review renewal plans"
      });
    }

    // Detect staff without recent activity (no reviews in 6+ months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data: inactiveStaff, error: inactiveError } = await supabase
      .from('contracts_enriched')
      .select('full_name, last_review_date, manager_key')
      .or(`last_review_date.is.null,last_review_date.lt.${sixMonthsAgo.toISOString().split('T')[0]}`);

    let inactiveStaffData = inactiveStaff;
    if (inactiveError && inactiveError.code === 'PGRST205') {
      console.log('ProblemDetectionEngine: contracts_enriched table not found for inactive staff, using mock data');
      inactiveStaffData = [];
    }

    if (inactiveStaffData && inactiveStaffData.length > 0) {
      const staffWithoutReviews = inactiveStaffData.map(s => s.full_name || "Unknown");
      problems.push({
        id: "no_recent_reviews",
        type: "compliance_risk",
        severity: "medium",
        title: "Staff Without Recent Reviews",
        description: `${inactiveStaffData.length} staff members haven't had reviews in 6+ months`,
        staffAffected: staffWithoutReviews,
        actionRequired: "Schedule catch-up reviews"
      });
    }

  } catch (error) {
    console.error('Error detecting problems:', error);
  }

  return problems;
}

export function ProblemDetectionEngine() {
  const { data: problems = [], isLoading } = useQuery({
    queryKey: ['problems-detection'],
    queryFn: detectProblems,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const getIcon = (type: Problem['type']) => {
    switch (type) {
      case 'overdue_review': return Clock;
      case 'missing_documents': return FileX;
      case 'contract_expiring': return Calendar;
      case 'performance_decline': return TrendingDown;
      case 'compliance_risk': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: Problem['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getSeverityBg = (severity: Problem['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 border-destructive/20';
      case 'high': return 'bg-warning/10 border-warning/20';
      case 'medium': return 'bg-blue-500/10 border-blue-500/20';
      case 'low': return 'bg-muted/50 border-muted';
      default: return 'bg-muted/50 border-muted';
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary animate-pulse" />
            🔍 Scanning for Problems...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalProblems = problems.filter(p => p.severity === 'critical');
  const highProblems = problems.filter(p => p.severity === 'high');
  const otherProblems = problems.filter(p => !['critical', 'high'].includes(p.severity));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            🚨 Problem Detection Summary
          </CardTitle>
          <CardDescription>
            Real-time analysis of issues requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="text-2xl font-bold text-destructive">{criticalProblems.length}</div>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="text-2xl font-bold text-warning">{highProblems.length}</div>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-600">{otherProblems.length}</div>
              <p className="text-sm text-muted-foreground">Medium/Low Priority</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Problems */}
      {criticalProblems.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              🚨 CRITICAL: Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalProblems.map(problem => {
                const Icon = getIcon(problem.type);
                return (
                  <div key={problem.id} className={`p-4 rounded-lg border ${getSeverityBg(problem.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <p className="font-medium">{problem.title}</p>
                          <Badge variant={getSeverityColor(problem.severity) as any}>
                            {problem.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{problem.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {problem.staffAffected.slice(0, 3).map(staff => (
                            <Badge key={staff} variant="outline" className="text-xs">
                              {staff}
                            </Badge>
                          ))}
                          {problem.staffAffected.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{problem.staffAffected.length - 3} more
                            </Badge>
                          )}
                        </div>
                        {problem.manager && (
                          <p className="text-xs text-muted-foreground">Manager: {problem.manager}</p>
                        )}
                      </div>
                      <Button size="sm" className="shrink-0">
                        {problem.actionRequired}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Problems */}
      {(highProblems.length > 0 || otherProblems.length > 0) && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              📋 Other Issues to Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...highProblems, ...otherProblems].map(problem => {
                const Icon = getIcon(problem.type);
                return (
                  <div key={problem.id} className={`p-3 rounded-lg border ${getSeverityBg(problem.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <p className="font-medium text-sm">{problem.title}</p>
                          <Badge variant={getSeverityColor(problem.severity) as any} className="text-xs">
                            {problem.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{problem.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {problem.staffAffected.slice(0, 2).map(staff => (
                            <Badge key={staff} variant="outline" className="text-xs">
                              {staff}
                            </Badge>
                          ))}
                          {problem.staffAffected.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{problem.staffAffected.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs shrink-0">
                        {problem.actionRequired}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {problems.length === 0 && !isLoading && (
        <Card className="shadow-card">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-success">🎉 All Clear!</h3>
                <p className="text-muted-foreground">
                  No critical issues detected. Your team management is running smoothly!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
