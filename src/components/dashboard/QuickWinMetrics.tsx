import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Upload,
  Star,
  FileText,
  Clock,
  TrendingUp,
  Target,
  Award,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

interface QuickWin {
  title: string;
  current: number;
  target: number;
  period: string;
  trend: number;
  icon: React.ElementType;
  color: string;
  description: string;
  isGood: boolean;
}

export function QuickWinMetrics() {
  // Get weekly review completions
  const { data: weeklyReviews = [] } = useQuery({
    queryKey: ["weekly-reviews"],
    queryFn: async () => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const { data, error } = await supabase
        .from("staff_reviews")
        .select("id, score, review_date")
        .gte("review_date", weekStart.toISOString().split('T')[0]);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Get weekly document uploads
  const { data: weeklyDocs = [] } = useQuery({
    queryKey: ["weekly-documents"],
    queryFn: async () => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const { data, error } = await supabase
        .from("staff_certificates")
        .select("id, uploaded_at")
        .gte("uploaded_at", weekStart.toISOString());
      if (error) throw error;
      return data ?? [];
    },
  });

  // Get weekly contract completions
  const { data: weeklyContracts = [] } = useQuery({
    queryKey: ["weekly-contracts"],
    queryFn: async () => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const { data, error } = await supabase
        .from("contracts")
        .select("id, signed_at, status")
        .gte("signed_at", weekStart.toISOString())
        .eq("status", "signed");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Get 5-star achievements this week
  const fiveStarReviews = useMemo(() => {
    return weeklyReviews.filter(review => review.score === 5);
  }, [weeklyReviews]);

  // Calculate quick win metrics
  const metrics: QuickWin[] = useMemo(() => {
    return [
      {
        title: "Reviews Completed",
        current: weeklyReviews.length,
        target: 10,
        period: "This Week",
        trend: 0, // Will calculate from historical data
        icon: CheckCircle,
        color: "text-success",
        description: "Performance reviews finished",
        isGood: weeklyReviews.length >= 8
      },
      {
        title: "Documents Uploaded",
        current: weeklyDocs.length,
        target: 15,
        period: "This Week",
        trend: 0,
        icon: Upload,
        color: "text-blue-500",
        description: "Certificates and files added",
        isGood: weeklyDocs.length >= 12
      },
      {
        title: "5★ Achievements",
        current: fiveStarReviews.length,
        target: 5,
        period: "This Week",
        trend: 0,
        icon: Star,
        color: "text-yellow-500",
        description: "Perfect review scores earned",
        isGood: fiveStarReviews.length >= 3
      },
      {
        title: "Contracts Signed",
        current: weeklyContracts.length,
        target: 8,
        period: "This Week",
        trend: 0,
        icon: FileText,
        color: "text-primary",
        description: "New agreements completed",
        isGood: weeklyContracts.length >= 6
      }
    ];
  }, [weeklyReviews, weeklyDocs, fiveStarReviews, weeklyContracts]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalCurrent = metrics.reduce((sum, metric) => sum + metric.current, 0);
    const totalTarget = metrics.reduce((sum, metric) => sum + metric.target, 0);
    return Math.round((totalCurrent / totalTarget) * 100);
  }, [metrics]);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-primary" />
          Quick Wins
          <Badge
            variant={overallProgress >= 80 ? "default" : "secondary"}
            className="ml-auto"
          >
            {overallProgress}%
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Weekly achievements across all teams
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Weekly Target Progress
            </span>
            <span className="text-xs font-bold text-foreground">
              {overallProgress}%
            </span>
          </div>
          <Progress
            value={overallProgress}
            className={`h-2 ${overallProgress >= 80 ? 'bg-success/20' : ''}`}
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {metrics.reduce((sum, m) => sum + m.current, 0)} completed
            </span>
            <span className="text-muted-foreground">
              {metrics.reduce((sum, m) => sum + m.target, 0)} target
            </span>
          </div>
        </div>

        {/* Individual Metrics */}
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`p-3 rounded-md border transition-all duration-200 ${
                metric.isGood
                  ? 'bg-success/5 border-success/20'
                  : 'bg-muted/50 border-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <metric.icon className={`h-3 w-3 ${metric.color}`} />
                  <span className="text-sm font-medium text-foreground">
                    {metric.title}
                  </span>
                  {metric.isGood && (
                    <Badge variant="default" className="text-xs">
                      ✨ CRUSHING IT
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-xs font-medium text-success">
                    +{metric.trend}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-1">
                <span className="text-lg font-bold text-foreground">
                  {metric.current}
                </span>
                <span className="text-xs text-muted-foreground">
                  / {metric.target} {metric.period.toLowerCase()}
                </span>
              </div>

              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    metric.isGood ? 'bg-success' : metric.color.replace('text-', 'bg-')
                  }`}
                  style={{
                    width: `${Math.min((metric.current / metric.target) * 100, 100)}%`
                  }}
                />
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t">
          {overallProgress >= 80 ? (
            <Button size="sm" className="w-full bg-gradient-to-r from-success to-success/80">
              <Award className="h-3 w-3 mr-1" />
              🎉 Team is CRUSHING this week!
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="w-full">
              <Calendar className="h-3 w-3 mr-1" />
              Plan Weekly Goals
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}