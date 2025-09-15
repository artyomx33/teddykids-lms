import { Brain, AlertCircle, TrendingUp, Clock, Users, Award, Lightbulb, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProblemDetectionEngine } from "@/components/insights/ProblemDetectionEngine";

export default function Insights() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🧸 Appies Insights</h1>
          <p className="text-muted-foreground mt-1">
            Your intelligent assistant surfaces hidden patterns and opportunities
          </p>
        </div>
        <div className="bg-gradient-primary/10 p-4 rounded-lg border border-primary/20">
          <p className="text-sm font-medium text-primary">
            💡 "Pssst... I found 5 actionable insights for you today!"
          </p>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Issues
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Opportunities
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8</div>
            <p className="text-xs text-muted-foreground">
              Growth opportunities found
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trends Spotted
            </CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">5</div>
            <p className="text-xs text-muted-foreground">
              Pattern analysis
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Predictions
            </CardTitle>
            <Target className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12</div>
            <p className="text-xs text-muted-foreground">
              Forecasts generated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              🚨 Critical Issues Detected
            </CardTitle>
            <CardDescription>
              Problems that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-destructive" />
                      <p className="font-medium text-destructive">Overdue Reviews Alert</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Sofia Martinez</strong> hasn't had a review in <strong>7 months</strong> (due 2 months ago)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Manager: Mike Chen • This could affect employee satisfaction and legal compliance
                    </p>
                  </div>
                  <Button size="sm" className="shrink-0">
                    Schedule Now
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-warning" />
                      <p className="font-medium text-warning">Missing Documents</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>3 staff members</strong> are missing critical VOG certificates
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Alex Rodriguez, Emma Thompson, James Wilson • Required for compliance
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Send Reminders
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <p className="font-medium text-blue-600">Contract Renewal Risk</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>5 contracts</strong> expire in the next 30 days with no renewal activity
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lisa Chen, Tom Anderson, Sarah Johnson, David Park, Nina Rodriguez
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Review Contracts
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              🎯 Growth Opportunities
            </CardTitle>
            <CardDescription>
              Ways to improve and celebrate success
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-3 h-3 text-success" />
                  <p className="text-sm font-medium text-success">Promotion Ready</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>2 interns</strong> have completed all requirements and are ready for full contracts
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3 h-3 text-blue-600" />
                  <p className="text-sm font-medium text-blue-600">Team Stars</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>4 staff members</strong> consistently score 5★ reviews - consider recognition
                </p>
              </div>

              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-3 h-3 text-purple-600" />
                  <p className="text-sm font-medium text-purple-600">Process Optimization</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Documents are processed <strong>40% faster</strong> with Lisa Wang as manager
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              📊 Trend Analysis
            </CardTitle>
            <CardDescription>
              Patterns Appies discovered in your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Review Completion Rate</p>
                  <p className="text-xs text-muted-foreground">Trending upward by 15% this quarter</p>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  ↗️ +15%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Document Processing Speed</p>
                  <p className="text-xs text-muted-foreground">Average time decreased by 2.3 days</p>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  ⚡ Faster
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Staff Satisfaction Scores</p>
                  <p className="text-xs text-muted-foreground">Highest recorded levels this year</p>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  🌟 Peak
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Predictions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-warning" />
              🔮 Appies Predictions
            </CardTitle>
            <CardDescription>
              Forecasts based on historical patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm font-medium text-warning">Staffing Forecast</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on current trends, you'll need <strong>3 additional staff</strong> by Q2 to maintain service levels
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm font-medium text-blue-600">Review Backlog</p>
                <p className="text-xs text-muted-foreground mt-1">
                  At current rate, review backlog will be cleared by <strong>March 25th</strong>
                </p>
              </div>

              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm font-medium text-green-600">Document Compliance</p>
                <p className="text-xs text-muted-foreground mt-1">
                  On track to achieve <strong>100% compliance</strong> by month-end with current momentum
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appies Tips */}
      <Card className="shadow-card bg-gradient-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🧸</span>
            Appies Daily Wisdom
          </CardTitle>
          <CardDescription>
            Your friendly AI assistant's tip of the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white/50 rounded-lg p-4">
            <p className="text-sm font-medium text-primary mb-2">
              💡 "Hey there, superstar admin!"
            </p>
            <p className="text-sm text-muted-foreground">
              I noticed that staff managed by Lisa Wang complete their documents 40% faster than average. 
              Maybe she has some secret sauce worth sharing with other managers? A quick coffee chat could 
              unlock efficiency gains across the whole team! ☕✨
            </p>
            <Button size="sm" className="mt-3" variant="outline">
              Tell me more, Appies!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}