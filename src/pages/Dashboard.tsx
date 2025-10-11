import { FileText, Mail, Shield, Users, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PerformanceComparison } from "@/components/analytics/PerformanceComparison";
import { PredictiveInsights } from "@/components/analytics/PredictiveInsights";
import { DashboardHighlights } from "@/components/dashboard/DashboardHighlights";

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

  const { data: dueReviews = [] } = useQuery({
    queryKey: ["due-reviews", next30],
    retry: false,
    queryFn: async () => {
      // TODO: CONNECT - contracts_enriched table not available yet
      // Returning mock data until database table is created
      console.log('Dashboard: Using mock data - contracts_enriched needs connection');
      return [];
    },
  });

  const highlights = useMemo(() => [
    {
      id: 'reviews',
      label: 'Reviews due',
      value: dueReviews.length,
      hint: 'Within the next 30 days',
      icon: Users,
    },
    {
      id: 'documents',
      label: 'Compliance alerts',
      value: '0',
      hint: 'Outstanding document reminders',
      icon: Shield,
    },
    {
      id: 'contracts',
      label: 'Contracts awaiting review',
      value: '—',
      hint: 'Connect contracts data to see more',
      icon: FileText,
    },
    {
      id: 'inbox',
      label: 'Unread emails',
      value: '—',
      hint: 'Gmail sync keeps this updated',
      icon: Mail,
    },
  ], [dueReviews.length]);

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

      <DashboardHighlights highlights={highlights} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ErrorBoundary componentName="ActivityFeed">
            <ActivityFeed />
          </ErrorBoundary>

          <Card className="bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Compliance snapshot
              </CardTitle>
              <CardDescription>
                Quick overview of outstanding tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>No missing documents reported.</p>
              <p>Employes sync is active and monitored.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card-labs shadow-card-labs transition-theme">
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
                  key={r.employes_employee_id}
                  className="flex items-center justify-between bg-muted/50 hover:bg-muted p-2 rounded-md transition-theme"
                >
                  <div className="flex items-center gap-2">
                    {r.has_five_star_badge && (
                      <Star className="w-3 h-3 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium text-foreground-labs">
                      {r.full_name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground-labs">
                    {label} • {r.next_review_due}
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
