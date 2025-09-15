import { Activity, Filter, Calendar, User, FileText, Star, Award, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed() {
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Get real activity data
  const { data: activities = [], refetch } = useQuery({
    queryKey: ["activity-feed", activeFilter],
    queryFn: async () => {
      const allActivities = [];

      // Get recent reviews
      const { data: reviews } = await supabase
        .from("staff_reviews")
        .select(`
          id, review_date, score, review_type, created_at,
          staff:staff_id (full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (reviews) {
        reviews.forEach((review: any) => {
          if (review.staff && review.staff.full_name) {
            allActivities.push({
              type: "review",
              icon: Star,
              title: `${review.review_type || 'Performance'} review completed`,
              description: `${review.staff.full_name} • ${review.score || 0}/5 stars`,
              time: review.created_at,
              status: (review.score || 0) >= 5 ? "success" : (review.score || 0) >= 4 ? "info" : "warning",
              category: "reviews"
            });
          }
        });
      }

      // Get recent notes
      const { data: notes } = await supabase
        .from("staff_notes")
        .select(`
          id, created_at, note_type,
          staff:staff_id (full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(15);

      if (notes) {
        notes.forEach((note: any) => {
          if (note.staff && note.staff.full_name) {
            allActivities.push({
              type: "note",
              icon: User,
              title: "Note added",
              description: `${note.staff.full_name} • ${note.note_type || 'General note'}`,
              time: note.created_at,
              status: "default",
              category: "notes"
            });
          }
        });
      }

      // Get recent certificate uploads
      const { data: certificates } = await supabase
        .from("staff_certificates")
        .select(`
          id, uploaded_at, title,
          staff:staff_id (full_name)
        `)
        .order("uploaded_at", { ascending: false })
        .limit(10);

      if (certificates) {
        certificates.forEach((cert: any) => {
          if (cert.staff && cert.staff.full_name) {
            allActivities.push({
              type: "document",
              icon: FileText,
              title: "Certificate uploaded",
              description: `${cert.staff.full_name} • ${cert.title || 'Certificate'}`,
              time: cert.uploaded_at,
              status: "info",
              category: "documents"
            });
          }
        });
      }

      // Get recent contracts
      const { data: contracts } = await supabase
        .from("contracts")
        .select("id, created_at, signed_at, employee_name, status")
        .order("created_at", { ascending: false })
        .limit(10);

      if (contracts) {
        contracts.forEach(contract => {
          allActivities.push({
            type: contract.signed_at ? "contract-signed" : "contract-created",
            icon: FileText,
            title: contract.signed_at ? "Contract signed" : "Contract created",
            description: `${contract.employee_name} • ${contract.status}`,
            time: contract.signed_at || contract.created_at,
            status: contract.signed_at ? "success" : "info",
            category: "contracts"
          });
        });
      }

      // Sort by time and filter
      const sortedActivities = allActivities
        .filter(activity => activeFilter === "all" || activity.category === activeFilter)
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 50);

      return sortedActivities;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate stats
  const stats = {
    today: activities.filter(a => {
      const activityDate = new Date(a.time);
      const today = new Date();
      return activityDate.toDateString() === today.toDateString();
    }).length,
    thisWeek: activities.filter(a => {
      const activityDate = new Date(a.time);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return activityDate > weekAgo;
    }).length,
    mostActiveToday: activities
      .filter(a => {
        const activityDate = new Date(a.time);
        const today = new Date();
        return activityDate.toDateString() === today.toDateString();
      })
      .reduce((acc, activity) => {
        const name = activity.description.split(' •')[0];
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
  };

  const topPerformer = Object.entries(stats.mostActiveToday)
    .sort(([,a], [,b]) => (Number(b) - Number(a)))[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">📊 Activity Feed</h1>
          <p className="text-muted-foreground mt-1">
            Real-time timeline of all organizational activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => refetch()}
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh
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
            <div className="text-2xl font-bold text-foreground">{stats.today}</div>
            <p className="text-xs text-muted-foreground">
              Real activities today
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
            <div className="text-lg font-semibold text-foreground">
              {topPerformer ? topPerformer[0] : 'No activity'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topPerformer ? `${topPerformer[1]} activities today` : 'today'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Live Updates
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground animate-pulse">●</div>
            <p className="text-xs text-muted-foreground">
              Auto-refresh every 30s
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
            <div className="text-2xl font-bold text-foreground">{stats.thisWeek}</div>
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
              {activities.length > 0 ? activities.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in">
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
                        <span>{formatDistanceToNow(new Date(activity.time), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activities found</p>
                  <p className="text-xs mt-1">Activities will appear here as they happen</p>
                </div>
              )}
            </div>

            {activities.length >= 50 && (
              <Button variant="outline" className="w-full mt-4">
                Load More Activities
              </Button>
            )}
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
                    { key: "all", type: "All Activities", count: activities.length },
                    { key: "reviews", type: "Reviews", count: activities.filter(a => a.category === "reviews").length },
                    { key: "documents", type: "Documents", count: activities.filter(a => a.category === "documents").length },
                    { key: "contracts", type: "Contracts", count: activities.filter(a => a.category === "contracts").length },
                    { key: "notes", type: "Notes", count: activities.filter(a => a.category === "notes").length }
                  ].map((filter) => (
                    <div 
                      key={filter.key} 
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        activeFilter === filter.key ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setActiveFilter(filter.key)}
                    >
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