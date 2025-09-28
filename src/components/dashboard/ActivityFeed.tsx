import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, ArrowRight, Activity, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useActivityRealtime } from "@/lib/hooks/useActivityRealtime";
import { useActivityData } from "@/lib/hooks/useActivityData";
import { useActivityItems, getInitials } from "@/lib/hooks/useActivityItems";

export function ActivityFeed() {
  // Real-time subscription hook
  const { lastUpdate, isConnected, connectionCount } = useActivityRealtime();

  // Optimized data fetching with real-time invalidation
  const { data: activityData, isLoading, error, isStale } = useActivityData(lastUpdate);

  // Process activities with proper timestamp sorting
  const activities = useActivityItems(activityData);

  // Loading state
  if (isLoading) {
    return (
      <Card className="lg:col-span-2 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            Loading Activity Feed...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="lg:col-span-2 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-destructive" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load activity feed: {error.message}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Live Activity Feed
          <div className="ml-auto flex items-center gap-2">
            {/* Real-time connection indicator */}
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-3 w-3 text-success" />
              ) : (
                <WifiOff className="h-3 w-3 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            <Badge variant="secondary">
              {activities.length}
            </Badge>
          </div>
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Real-time updates across your organization
          </p>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="font-medium text-foreground">No Recent Activity</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Activity will appear here as your team works
                </p>
              </div>
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

        {/* Debug info (only shown in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="pt-2 border-t text-xs text-muted-foreground">
            Debug: {connectionCount} updates received, Connected: {isConnected ? 'Yes' : 'No'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}