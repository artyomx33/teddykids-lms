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

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
}

function MetricCard({ title, value, description, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card className="bg-gradient-card border-0 shadow-card hover:shadow-soft transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground">
          {trend && <span className="text-success font-medium">{trend}</span>}
          {description}
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to your Teddy Kids admin portal
          </p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Quick Actions
        </Button>
      </div>

      {/* Appies Insight - Smart AI-free tips */}
      <AppiesInsight />

      {/* Metrics removed - waiting for real data after Phase 1 sync */}

      {/* Enhanced Content Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Live Activity Feed - Takes 2 columns */}
        <ActivityFeed />

        {/* Birthday Widget */}
        <BirthdayWidget />

        {/* Teddy Stars Widget */}
        <TeddyStarsWidget />

        {/* Reviews Due This Month */}
        <Card className="shadow-card">
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
        <InternWatchWidget />

        {/* Quick Win Metrics */}
        <QuickWinMetrics />
      </div>

      {/* Advanced Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <PerformanceComparison />
        <PredictiveInsights />
      </div>
    </div>
  );
}
