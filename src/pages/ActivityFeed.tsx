import { Activity, Filter, Calendar, User, FileText, Star, Award, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ActivityFeed() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activity Feed</h1>
          <p className="text-muted-foreground mt-1">
            Real-time timeline of all organizational activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter Activities
          </Button>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">47</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+12 </span>
              from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Active
            </CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground">Lisa Wang</div>
            <p className="text-xs text-muted-foreground">
              15 activities today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Peak Time
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground">2:00 PM</div>
            <p className="text-xs text-muted-foreground">
              Busiest hour today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">284</div>
            <p className="text-xs text-muted-foreground">
              Total activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Live Activity Stream
            </CardTitle>
            <CardDescription>
              Real-time updates across all system activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activity Timeline */}
              {[
                {
                  type: "review",
                  icon: Star,
                  title: "Review completed",
                  description: "Sarah Johnson • 6-month performance review",
                  manager: "Mike Chen",
                  time: "2 minutes ago",
                  status: "success"
                },
                {
                  type: "document",
                  icon: FileText,
                  title: "Document uploaded",
                  description: "Alex Rodriguez • VOG certificate",
                  manager: "Lisa Wang", 
                  time: "5 minutes ago",
                  status: "info"
                },
                {
                  type: "contract",
                  icon: FileText,
                  title: "Contract signed",
                  description: "Emma Thompson • Full-time employment contract",
                  manager: "David Kim",
                  time: "12 minutes ago", 
                  status: "success"
                },
                {
                  type: "achievement",
                  icon: Award,
                  title: "Achievement unlocked",
                  description: "James Wilson • 5★ performance rating achieved",
                  manager: "Anna Brown",
                  time: "18 minutes ago",
                  status: "warning"
                },
                {
                  type: "note",
                  icon: User,
                  title: "Note added",
                  description: "Sofia Martinez • Performance improvement note",
                  manager: "Mike Chen",
                  time: "25 minutes ago",
                  status: "default"
                }
              ].map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'success' ? 'bg-success/10 text-success' :
                      activity.status === 'warning' ? 'bg-warning/10 text-warning' :
                      activity.status === 'info' ? 'bg-blue-500/10 text-blue-600' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <IconComponent className="w-3 h-3" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Manager: {activity.manager}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                );
              })}
            </div>

            <Button variant="outline" className="w-full mt-4">
              Load More Activities
            </Button>
          </CardContent>
        </Card>

        {/* Activity Filters */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Filter Options
            </CardTitle>
            <CardDescription>
              Customize your activity view
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activity Type Filters */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Activity Types</p>
                <div className="space-y-2">
                  {[
                    { type: "All Activities", count: 47, active: true },
                    { type: "Reviews", count: 12, active: false },
                    { type: "Documents", count: 18, active: false },
                    { type: "Contracts", count: 8, active: false },
                    { type: "Notes", count: 9, active: false }
                  ].map((filter) => (
                    <div key={filter.type} className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      filter.active ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                    }`}>
                      <span className="text-sm">{filter.type}</span>
                      <Badge variant="outline" className="text-xs">
                        {filter.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Time Range</p>
                <div className="space-y-1">
                  {["Today", "This Week", "This Month", "Custom Range"].map((range, index) => (
                    <div key={range} className={`p-2 rounded cursor-pointer transition-colors ${
                      index === 0 ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                    }`}>
                      <span className="text-sm">{range}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future features */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>🏗️ Coming Soon: Activity Analytics</CardTitle>
          <CardDescription>
            Insights into organizational activity patterns and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Comprehensive analytics showing peak activity times, most active departments, and productivity patterns to help optimize workflows.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}