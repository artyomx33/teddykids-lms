import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  FileText,
  Star,
  Upload,
  UserPlus,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { Link } from "react-router-dom";

interface ActivityItem {
  id: string;
  type: 'contract' | 'review' | 'document' | 'hire' | 'certificate' | 'birthday';
  action: string;
  employee: string;
  manager?: string;
  time: string;
  status: 'completed' | 'pending' | 'urgent';
  icon: React.ElementType;
  color: string;
  details?: string;
}

export function ActivityFeed() {
  // Get recent contract activity
  const { data: contractActivity = [] } = useQuery({
    queryKey: ["recent-contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("id, employee_name, manager, status, signed_at, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Get recent reviews
  const { data: reviewActivity = [] } = useQuery({
    queryKey: ["recent-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_reviews")
        .select("id, staff_id, score, review_date, review_type")
        .order("review_date", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Get recent document uploads
  const { data: documentActivity = [] } = useQuery({
    queryKey: ["recent-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_certificates")
        .select("id, staff_id, certificate_type, uploaded_at")
        .order("uploaded_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Get staff info for cross-referencing
  const { data: staffInfo = [] } = useQuery({
    queryKey: ["staff-info-feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("id, full_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Combine and format all activities
  const activities = useMemo(() => {
    const items: ActivityItem[] = [];
    const staffMap = new Map(staffInfo.map(s => [s.id, s.full_name]));

    // Contract activities
    contractActivity.forEach(contract => {
      const timeAgo = getTimeAgo(contract.signed_at || contract.created_at);
      items.push({
        id: `contract-${contract.id}`,
        type: 'contract',
        action: contract.signed_at ? "Contract signed" : "Contract generated",
        employee: contract.employee_name,
        manager: contract.manager,
        time: timeAgo,
        status: contract.signed_at ? 'completed' : 'pending',
        icon: FileText,
        color: contract.signed_at ? 'text-success' : 'text-warning',
        details: contract.status
      });
    });

    // Review activities
    reviewActivity.forEach(review => {
      const timeAgo = getTimeAgo(review.review_date);
      const staffName = staffMap.get(review.staff_id) || "Unknown Staff";
      items.push({
        id: `review-${review.id}`,
        type: 'review',
        action: review.score === 5 ? "🌟 5-star review completed" : "Review completed",
        employee: staffName,
        time: timeAgo,
        status: review.score >= 4 ? 'completed' : 'pending',
        icon: Star,
        color: review.score === 5 ? 'text-yellow-500' : 'text-primary',
        details: `${review.score}/5 ${review.review_type || 'review'}`
      });
    });

    // Document activities
    documentActivity.forEach(doc => {
      const timeAgo = getTimeAgo(doc.uploaded_at);
      const staffName = staffMap.get(doc.staff_id) || "Unknown Staff";
      items.push({
        id: `doc-${doc.id}`,
        type: 'document',
        action: "Document uploaded",
        employee: staffName,
        time: timeAgo,
        status: 'completed',
        icon: Upload,
        color: 'text-blue-500',
        details: doc.certificate_type || 'Certificate'
      });
    });

    // Sort by most recent (mock timestamps for now)
    return items.sort((a, b) => {
      const timeValues = {
        "just now": 0,
        "2 minutes ago": 2,
        "1 hour ago": 60,
        "2 hours ago": 120,
        "4 hours ago": 240,
        "1 day ago": 1440,
        "2 days ago": 2880
      };
      return (timeValues[a.time as keyof typeof timeValues] || 999) -
             (timeValues[b.time as keyof typeof timeValues] || 999);
    }).slice(0, 8);
  }, [contractActivity, reviewActivity, documentActivity, staffInfo]);

  function getTimeAgo(dateString: string | null): string {
    if (!dateString) return "unknown";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <Card className="lg:col-span-2 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Live Activity Feed
          <Badge variant="secondary" className="ml-auto">
            {activities.length}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time updates across your organization
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <div className="text-2xl opacity-50">📈</div>
              <p className="text-sm text-muted-foreground">
                No recent activity to display
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-200 group"
              >
                {/* Avatar with Icon */}
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(activity.employee)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 rounded-full p-1 bg-background ${activity.color}`}>
                    <activity.icon className="h-2.5 w-2.5" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
                    </p>
                    <Badge
                      variant={
                        activity.status === 'completed' ? 'default' :
                        activity.status === 'urgent' ? 'destructive' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{activity.employee}</span>
                    {activity.manager && (
                      <>
                        <span>•</span>
                        <span>Manager: {activity.manager}</span>
                      </>
                    )}
                    {activity.details && (
                      <>
                        <span>•</span>
                        <span>{activity.details}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Time & Action */}
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View All Button */}
        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link to="/activity">
              View Full Activity Timeline
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}