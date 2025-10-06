import { FileText, Clock, TrendingUp, Users, Plus, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppiesInsight } from "@/components/dashboard/AppiesInsight";
import { BirthdayWidget } from "@/components/dashboard/BirthdayWidget";
import { TeddyStarsWidget } from "@/components/dashboard/TeddyStarsWidget";
import { InternWatchWidget } from "@/components/dashboard/InternWatchWidget";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickWinMetrics } from "@/components/dashboard/QuickWinMetrics";
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
    <Card className="relative overflow-hidden bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 group">
      {/* Gradient Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wide">
          {title}
        </CardTitle>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
          <Icon className="h-5 w-5 text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text relative z-10 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-500">
          {value}
        </div>
        <p className="text-sm text-muted-foreground/70 flex items-center gap-1">
          {trend && (
            <span className="text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full text-xs">
              {trend}
            </span>
          )}
          <span className="group-hover:text-muted-foreground transition-colors duration-300">
            {description}
          </span>
        </p>
      </CardContent>

      {/* Bottom Glow Line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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

  return (
    <PageErrorBoundary>
      {/* Gradient Background */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -m-6 p-6">
        <div className="space-y-8">
          {/* Welcome Header with Labs 2.0 Styling */}
          <div className="relative overflow-hidden">
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-pink-600/10 rounded-3xl blur-3xl" />

            <div className="relative z-10 flex items-center justify-between p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/40 shadow-2xl">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Dashboard 2.0
                    </h1>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-gray-600 font-medium">
                        Intelligent Admin Portal • Labs Enhanced
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Plus className="w-5 h-5 mr-2" />
                Quick Actions
              </Button>
            </div>
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

        {/* Birthday Widget */}
        <ErrorBoundary componentName="BirthdayWidget">
          <BirthdayWidget />
        </ErrorBoundary>

        {/* Teddy Stars Widget */}
        <ErrorBoundary componentName="TeddyStarsWidget">
          <TeddyStarsWidget />
        </ErrorBoundary>

        {/* Reviews Due This Month */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Reviews due this month
            </CardTitle>
            <CardDescription>
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
                  className="flex items-center justify-between bg-muted/50 hover:bg-muted p-2 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    {r.has_five_star_badge && (
                      <Star className="w-3 h-3 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium">
                      {r.full_name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {label} • {r.next_review_due}
                  </div>
                </div>
              );
            })}
            {dueReviews.length > 6 && (
              <Button variant="outline" className="w-full">
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
      </div>
    </PageErrorBoundary>
  );
}
