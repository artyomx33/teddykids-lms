import { BarChart3, Download, FileText, Users, Calendar, TrendingUp, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Error Boundaries
import { ErrorBoundary, PageErrorBoundary } from "@/components/error-boundaries/ErrorBoundary";

export default function Reports() {
  return (
    <PageErrorBoundary>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Generate insights and export data across your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Custom Report
          </Button>
          <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Quick Export Actions */}
      <ErrorBoundary  componentName="QuickExportCards">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-0 shadow-card hover:shadow-soft transition-all cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Staff Report
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground">156 records</div>
            <p className="text-xs text-muted-foreground">
              Complete staff directory
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card hover:shadow-soft transition-all cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contract Report
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground">243 contracts</div>
            <p className="text-xs text-muted-foreground">
              All contract data
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card hover:shadow-soft transition-all cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Review Report
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground">89 reviews</div>
            <p className="text-xs text-muted-foreground">
              Performance data
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card hover:shadow-soft transition-all cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Compliance Report
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground">92% complete</div>
            <p className="text-xs text-muted-foreground">
              Document status
            </p>
          </CardContent>
        </Card>
        </div>
      </ErrorBoundary>

      {/* Available Reports */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Staff Analytics */}
        <ErrorBoundary  componentName="StaffAnalytics">
          <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Staff Analytics
            </CardTitle>
            <CardDescription>
              Comprehensive staff performance and status reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <div>
                  <p className="text-sm font-medium">Staff Performance Summary</p>
                  <p className="text-xs text-muted-foreground">Review scores, ratings, and trends</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">PDF</Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <div>
                  <p className="text-sm font-medium">Document Compliance Status</p>
                  <p className="text-xs text-muted-foreground">Missing documents and completion rates</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">CSV</Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <div>
                  <p className="text-sm font-medium">Tenure & Retention Analysis</p>
                  <p className="text-xs text-muted-foreground">Employee longevity and turnover insights</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Excel</Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Generate Staff Report
            </Button>
          </CardContent>
          </Card>
        </ErrorBoundary>

        {/* Contract Analytics */}
        <ErrorBoundary  componentName="ContractAnalytics">
          <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Contract Analytics
            </CardTitle>
            <CardDescription>
              Contract lifecycle and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <div>
                  <p className="text-sm font-medium">Contract Lifecycle Report</p>
                  <p className="text-xs text-muted-foreground">From creation to completion timeline</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">PDF</Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <div>
                  <p className="text-sm font-medium">Expiring Contracts (30/60/90 days)</p>
                  <p className="text-xs text-muted-foreground">Contracts needing renewal attention</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">CSV</Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <div>
                  <p className="text-sm font-medium">Manager Performance</p>
                  <p className="text-xs text-muted-foreground">Contract signing velocity by manager</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Excel</Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Generate Contract Report
            </Button>
          </CardContent>
          </Card>
        </ErrorBoundary>
      </div>

      {/* Advanced Analytics Placeholders */}
      <ErrorBoundary  componentName="AdvancedAnalytics">
        <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>🏗️ Coming Soon: Custom Dashboards</CardTitle>
            <CardDescription>
              Build your own KPI views and metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create personalized dashboards with drag-and-drop widgets for the metrics that matter most to you.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>🏗️ Coming Soon: Automated Reports</CardTitle>
            <CardDescription>
              Schedule regular report generation and delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Set up automated weekly, monthly, or quarterly reports delivered directly to stakeholder inboxes.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>🏗️ Coming Soon: Predictive Analytics</CardTitle>
            <CardDescription>
              Forecast trends and identify potential issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Use historical data to predict staff turnover, contract renewal rates, and performance trends.
            </p>
          </CardContent>
        </Card>
        </div>
      </ErrorBoundary>
      </div>
    </PageErrorBoundary>
  );
}