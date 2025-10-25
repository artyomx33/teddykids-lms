import { FileText, Clock, TrendingUp, Users, Plus, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { log, logger } from "@/lib/logger";
import { useReviewCalculations } from "@/hooks/useReviewCalculations";
import { AppiesInsight } from "@/components/dashboard/AppiesInsight";
import { BirthdayWidget } from "@/components/dashboard/BirthdayWidget";
import { TeddyStarsWidget } from "@/components/dashboard/TeddyStarsWidget";
import { InternWatchWidget } from "@/components/dashboard/InternWatchWidget";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickWinMetrics } from "@/components/dashboard/QuickWinMetrics";
import { ContractComplianceWidget } from "@/components/dashboard/ContractComplianceWidget";
import { PerformanceComparison } from "@/components/analytics/PerformanceComparison";
import { PredictiveInsights } from "@/components/analytics/PredictiveInsights";

// Error Boundaries
import { ErrorBoundary, PageErrorBoundary } from "@/components/error-boundaries/ErrorBoundary";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
}

function MetricCard({ title, value, description, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card className="bg-card-labs-glass shadow-card-labs hover:shadow-card-labs-intense transition-theme hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground-labs">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground-labs">{value}</div>
        <p className="text-xs text-muted-foreground-labs flex items-center gap-1">
          {trend && (
            <span className="text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full text-xs">
              {trend}
            </span>
          )}
          <span>{description}</span>
        </p>
      </CardContent>
    </Card>
  );
}


export default function Dashboard() {
  /* ------------------------------------------------------------------ */
  /* Reviews due in the next 30 days                                    */
  /* ------------------------------------------------------------------ */
  const next30 = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }, []);

  // Get active staff for review calculations
  const { data: staffData = [] } = useQuery({
    queryKey: ["staff-for-reviews"],
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employes_current_state')
        .select('employee_id, employee_name, contract_start_date, employment_status')
        .eq('employment_status', 'active');
      
      if (error) {
        console.error('Dashboard: Error fetching staff:', error);
        return [];
      }
      return data || [];
    },
  });

  // Get latest review dates
  const { data: reviewDates = [] } = useQuery({
    queryKey: ["latest-review-dates"],
    enabled: staffData.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_reviews')
        .select('staff_id, review_date')
        .order('review_date', { ascending: false });
      
      if (error) {
        console.error('Dashboard: Error fetching reviews:', error);
        return [];
      }
      return data || [];
    },
  });

  // Merge staff with their latest review dates
  const staffWithReviews = useMemo(() => {
    const reviewMap = new Map();
    reviewDates.forEach(r => {
      if (!reviewMap.has(r.staff_id)) {
        reviewMap.set(r.staff_id, r.review_date);
      }
    });
    
    return staffData.map(s => ({
      ...s,
      last_review_date: reviewMap.get(s.employee_id) || null
    }));
  }, [staffData, reviewDates]);

  // Calculate review needs on frontend
  const { needingReview } = useReviewCalculations(staffWithReviews);
  
  // Filter for reviews due in next 30 days
  const dueReviews = useMemo(() => {
    return needingReview.filter(s => {
      if (!s.next_review_due) return false;
      const daysUntil = s.days_until_review || 0;
      return daysUntil >= 0 && daysUntil <= 30;
    });
  }, [needingReview]);

  return (
    <PageErrorBoundary>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground-labs">
              Dashboard 2.0
            </h1>
            <p className="text-muted-foreground-labs mt-1">
              Intelligent Admin Portal • Labs Enhanced
            </p>
          </div>
          <Button className="bg-gradient-primary-labs hover:shadow-glow transition-theme">
            <Plus className="w-4 h-4 mr-2" />
            Quick Actions
          </Button>
        </div>

      {/* Appies Insight - Smart AI-free tips */}
      <ErrorBoundary componentName="AppiesInsight">
        <AppiesInsight />
      </ErrorBoundary>

      {/* Metrics removed - waiting for real data after Phase 1 sync */}

      {/* Enhanced Content Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Live Activity Feed - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ErrorBoundary componentName="ActivityFeed">
            <ActivityFeed />
          </ErrorBoundary>
        </div>

        {/* Contract Compliance Widget - High Priority */}
        <ErrorBoundary componentName="ContractComplianceWidget">
          <ContractComplianceWidget />
        </ErrorBoundary>

        {/* Birthday Widget */}
        <ErrorBoundary componentName="BirthdayWidget">
          <BirthdayWidget />
        </ErrorBoundary>

        {/* Teddy Stars Widget */}
        <ErrorBoundary componentName="TeddyStarsWidget">
          <TeddyStarsWidget />
        </ErrorBoundary>

        {/* Reviews Due This Month */}
        <Card className="bg-card-labs shadow-card-labs transition-theme lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground-labs">
              <Users className="w-5 h-5 text-primary" />
              Reviews due this month
            </CardTitle>
            <CardDescription className="text-muted-foreground-labs">
              {dueReviews.length === 0
                ? "No upcoming reviews in the next 30 days"
                : `${dueReviews.length} staff member${
                    dueReviews.length > 1 ? "s" : ""
                  }`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dueReviews.slice(0, 6).map((r) => {
              const label = r.needs_six_month_review
                ? "6-mo review"
                : "Yearly review";
              return (
                <div
                  key={r.employee_id}
                  className="flex items-center justify-between bg-muted/50 hover:bg-muted p-2 rounded-md transition-theme"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground-labs">
                      {r.employee_name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground-labs">
                    {label} • {r.next_review_due?.toLocaleDateString()}
                  </div>
                </div>
              );
            })}
            {dueReviews.length > 6 && (
              <Button variant="outline" className="w-full transition-theme">
                View all
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Intern Watch Widget */}
        <ErrorBoundary componentName="InternWatchWidget">
          <InternWatchWidget />
        </ErrorBoundary>

        {/* Quick Win Metrics */}
        <ErrorBoundary componentName="QuickWinMetrics">
          <QuickWinMetrics />
        </ErrorBoundary>
      </div>

        {/* Advanced Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <ErrorBoundary componentName="PerformanceComparison">
            <PerformanceComparison />
          </ErrorBoundary>
          <ErrorBoundary componentName="PredictiveInsights">
            <PredictiveInsights />
          </ErrorBoundary>
        </div>
      </div>
    </PageErrorBoundary>
  );
}
