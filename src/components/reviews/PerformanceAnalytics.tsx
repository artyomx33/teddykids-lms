import { TrendingUp, Users, BarChart3, Award, Clock, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AnalyticsData {
  managerPerformance: Array<{
    name: string;
    avgScore: number;
    reviewsCompleted: number;
    onTimeRate: number;
  }>;
  departmentStats: Array<{
    department: string;
    avgScore: number;
    totalReviews: number;
    fiveStarCount: number;
  }>;
  trends: Array<{
    period: string;
    avgScore: number;
    completionRate: number;
  }>;
}

// Mock analytics data
const mockAnalytics: AnalyticsData = {
  managerPerformance: [
    { name: "Lisa Wang", avgScore: 4.6, reviewsCompleted: 12, onTimeRate: 95 },
    { name: "Mike Chen", avgScore: 4.2, reviewsCompleted: 8, onTimeRate: 87 },
    { name: "David Kim", avgScore: 4.4, reviewsCompleted: 10, onTimeRate: 92 },
    { name: "Sofia Martinez", avgScore: 4.3, reviewsCompleted: 9, onTimeRate: 89 },
  ],
  departmentStats: [
    { department: "Operations", avgScore: 4.3, totalReviews: 24, fiveStarCount: 8 },
    { department: "Administration", avgScore: 4.1, totalReviews: 18, fiveStarCount: 5 },
    { department: "Care Services", avgScore: 4.5, totalReviews: 32, fiveStarCount: 12 },
    { department: "Support", avgScore: 4.2, totalReviews: 15, fiveStarCount: 4 },
  ],
  trends: [
    { period: "Q1 2024", avgScore: 3.9, completionRate: 82 },
    { period: "Q2 2024", avgScore: 4.1, completionRate: 87 },
    { period: "Q3 2024", avgScore: 4.3, completionRate: 91 },
    { period: "Q4 2024", avgScore: 4.4, completionRate: 89 },
  ]
};

export function PerformanceAnalytics() {
  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-success";
    if (score >= 4.0) return "text-primary";
    if (score >= 3.5) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return { variant: "secondary", label: "Excellent", color: "bg-success/10 text-success border-success/20" };
    if (score >= 4.0) return { variant: "secondary", label: "Good", color: "bg-primary/10 text-primary border-primary/20" };
    if (score >= 3.5) return { variant: "secondary", label: "Average", color: "bg-warning/10 text-warning border-warning/20" };
    return { variant: "secondary", label: "Needs Attention", color: "bg-destructive/10 text-destructive border-destructive/20" };
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Avg Score
            </CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">4.3</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">↗ +0.2</span> from last quarter
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reviews This Quarter
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+12</span> more than last quarter
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On-Time Rate
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">91%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+4%</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              5★ Reviews
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">29</div>
            <p className="text-xs text-muted-foreground">
              33% of all reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Manager Performance */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Manager Performance Comparison
          </CardTitle>
          <CardDescription>
            How different managers are performing in review quality and timeliness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalytics.managerPerformance.map((manager, index) => {
              const scoreBadge = getScoreBadge(manager.avgScore);
              return (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{manager.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {manager.reviewsCompleted} reviews completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(manager.avgScore)}`}>
                        {manager.avgScore.toFixed(1)}
                      </span>
                      <Badge className={scoreBadge.color}>
                        {scoreBadge.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">On-time:</span>
                      <span className="text-xs font-medium">{manager.onTimeRate}%</span>
                      <Progress value={manager.onTimeRate} className="w-16 h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Department Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Department Performance
            </CardTitle>
            <CardDescription>
              Average review scores by department
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAnalytics.departmentStats.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{dept.department}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getScoreColor(dept.avgScore)}`}>
                      {dept.avgScore.toFixed(1)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {dept.fiveStarCount} 5★
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{dept.totalReviews} total reviews</span>
                  <span>{Math.round((dept.fiveStarCount / dept.totalReviews) * 100)}% excellence rate</span>
                </div>
                <Progress value={(dept.avgScore / 5) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quarterly Trends */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Quarterly Trends
            </CardTitle>
            <CardDescription>
              Performance trends over time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAnalytics.trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{trend.period}</p>
                  <p className="text-sm text-muted-foreground">
                    {trend.completionRate}% completion rate
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(trend.avgScore)}`}>
                    {trend.avgScore.toFixed(1)}
                  </div>
                  {index > 0 && (
                    <div className="text-xs">
                      {trend.avgScore > mockAnalytics.trends[index - 1].avgScore ? (
                        <span className="text-success">↗ +{(trend.avgScore - mockAnalytics.trends[index - 1].avgScore).toFixed(1)}</span>
                      ) : (
                        <span className="text-destructive">↘ {(trend.avgScore - mockAnalytics.trends[index - 1].avgScore).toFixed(1)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}