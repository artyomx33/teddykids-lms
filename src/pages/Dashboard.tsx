import { FileText, Clock, TrendingUp, Users, Plus, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

const recentActivities = [
  {
    id: 1,
    action: "Contract signed",
    employee: "Sarah Johnson",
    manager: "Mike Chen",
    time: "2 hours ago",
    status: "completed",
  },
  {
    id: 2,
    action: "Contract generated",
    employee: "Alex Rodriguez",
    manager: "Lisa Wang",
    time: "4 hours ago",
    status: "pending",
  },
  {
    id: 3,
    action: "Contract duplicated",
    employee: "Emma Thompson",
    manager: "David Kim",
    time: "1 day ago",
    status: "completed",
  },
  {
    id: 4,
    action: "Contract exported",
    employee: "James Wilson",
    manager: "Anna Brown",
    time: "2 days ago",
    status: "completed",
  },
];

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
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts_enriched")
        .select(
          "staff_id, full_name, next_review_due, needs_six_month_review, needs_yearly_review, has_five_star_badge"
        )
        .or("needs_six_month_review.eq.true,needs_yearly_review.eq.true")
        .not("next_review_due", "is", null)
        .lte("next_review_due", next30)
        .order("next_review_due", { ascending: true });
      if (error) throw error;
      return data ?? [];
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

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Contracts Signed This Month"
          value="24"
          description="from last month"
          trend="+20.1% "
          icon={FileText}
        />
        <MetricCard
          title="Pending Signatures"
          value="8"
          description="awaiting completion"
          icon={Clock}
        />
        <MetricCard
          title="Active Employees"
          value="156"
          description="total staff members"
          trend="+4 "
          icon={Users}
        />
        <MetricCard
          title="Completion Rate"
          value="94.2%"
          description="this quarter"
          trend="+2.1% "
          icon={TrendingUp}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest contract activities across your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.employee} • Manager: {activity.manager}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'completed' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {activity.status}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                  key={r.staff_id}
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

        {/* Quick Stats */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Full-time Contracts</span>
                <span className="text-sm font-medium">89</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Part-time Contracts</span>
                <span className="text-sm font-medium">43</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Temporary Contracts</span>
                <span className="text-sm font-medium">24</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4">
              View All Contracts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
