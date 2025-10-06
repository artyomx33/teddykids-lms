import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type ReviewNeed = {
  staff_id: string;
  full_name: string;
  review_due_date?: string | null;
};

type DocumentCounts = {
  any_missing: number;
  missing_count: number;
  total_staff: number;
  vog_missing?: number;
};

type FiveStarEntry = {
  staff_id: string;
  full_name: string;
  has_five_star_badge: boolean;
};

type ActivityInsights = {
  recentAchievements: number;
  busyPeriod: boolean;
  documentsUpload: number;
};

export function AppiesInsight() {
  // Get staff needing reviews
  const { data: reviewData = [] } = useQuery<ReviewNeed[]>({
    queryKey: ["appies-review-needs"],
    retry: false,
    queryFn: async () => {
      // TODO: CONNECT - contracts_enriched table not available yet
      // Returning mock data until database table is created
      console.log('AppiesInsight: Using mock data - contracts_enriched needs connection');
      return [];
    },
  });

  // Get document missing counts
  const { data: docCounts } = useQuery<DocumentCounts>({
    queryKey: ["appies-doc-counts"],
    retry: false,
    queryFn: async () => {
      // TODO: CONNECT - staff_document_compliance table not available yet
      // Returning mock data until database table is created
      console.log('AppiesInsight: Using mock data - staff_document_compliance needs connection');
      return { any_missing: 0, missing_count: 0, total_staff: 80 };
    },
  });

  // Get 5-star achievers
  const { data: fiveStarData = [] } = useQuery<FiveStarEntry[]>({
    queryKey: ["appies-five-star"],
    retry: false,
    queryFn: async () => {
      // TODO: CONNECT - contracts_enriched table not available yet
      // Returning mock data until database table is created
      console.log('AppiesInsight: Using mock data - contracts_enriched needs connection');
      return [
        { staff_id: '1', full_name: 'Sample Star Performer', has_five_star_badge: true },
        { staff_id: '2', full_name: 'Another Top Performer', has_five_star_badge: true }
      ];
    },
  });

  // Get recent activity insights
  const { data: activityInsights } = useQuery<ActivityInsights>({
    queryKey: ["appies-activity-insights"],
    queryFn: async () => {
      // Using raw data only - return mock insights until proper implementation
      console.log('Using raw data only - returning mock activity insights');

      const insights = {
        recentAchievements: 2, // Mock: 2 recent achievements
        busyPeriod: false,
        documentsUpload: 3 // Mock: 3 recent uploads
      };

      return insights;
    },
  });

  // Generate smart insights with enhanced intelligence
  const insight = useMemo(() => {
    const insights = [];
    
    // Critical: Reviews needed
    if (reviewData.length > 0) {
      insights.push({
        message: `Urgent! ${reviewData.length} staff ${reviewData.length === 1 ? 'needs' : 'need'} reviews scheduled soon 📅`,
        action: "Schedule Reviews",
        link: "/reviews",
        urgent: reviewData.length > 5,
        priority: 10
      });
    }

    // Critical: Missing documents
    if ((docCounts?.missing_count || 0) > 0) {
      insights.push({
        message: `${docCounts?.missing_count} staff missing required documents - compliance risk! 📄⚠️`,
        action: "Send Reminders",
        link: "/staff?filter=missing-docs",
        urgent: (docCounts?.missing_count || 0) > 3,
        priority: 9
      });
    }

    // High: Recent achievements to celebrate
    if (activityInsights?.recentAchievements > 0) {
      insights.push({
        message: `🎉 ${activityInsights.recentAchievements} staff achieved 5★ reviews this week - time to celebrate!`,
        action: "View Achievements",
        link: "/activity-feed",
        urgent: false,
        priority: 6
      });
    }

    // Medium: Recognition opportunities
    if (fiveStarData.length > 0) {
      insights.push({
        message: `${fiveStarData.length} team stars are consistently excellent - consider promotions or bonuses! 🌟`,
        action: "View Top Performers",
        link: "/staff",
        urgent: false,
        priority: 5
      });
    }

    // Medium: Document activity spike
    if (activityInsights?.documentsUpload >= 3) {
      insights.push({
        message: `Great momentum! ${activityInsights.documentsUpload} documents uploaded today - team is getting organized! 📈`,
        action: "View Activity",
        link: "/activity-feed",
        urgent: false,
        priority: 4
      });
    }

    // Low: Seasonal reminders
    const currentMonth = new Date().getMonth();
    if (currentMonth === 11) { // December
      insights.push({
        message: `🎄 December is here! Perfect time for year-end reviews and holiday recognition programs`,
        action: "Plan Reviews",
        link: "/reviews",
        urgent: false,
        priority: 2
      });
    }

    // Fallback: All good message
    if (insights.length === 0) {
      const encouragingMessages = [
        "Everything's running smoothly! 🧸 Your team management is on point today!",
        "Stellar work! 🌟 All staff are up to date with reviews and documents.",
        "You're crushing it! 💪 No urgent issues detected - team is well-managed!",
        "Perfect harmony! 🎵 All systems green, team happy, documents complete!",
        "Management excellence! 🏆 No fires to fight today - enjoy the smooth sailing!"
      ];
      insights.push({
        message: encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)],
        action: "View Insights",
        link: "/insights",
        urgent: false,
        priority: 1
      });
    }

    // Sort by priority and return the most important one, but add some randomness for same priority
    const sortedInsights = insights.sort((a, b) => {
      if (a.priority === b.priority) {
        return Math.random() - 0.5; // Random for same priority
      }
      return b.priority - a.priority;
    });
    
    return sortedInsights[0];
  }, [reviewData.length, docCounts?.missing_count, fiveStarData.length, activityInsights?.documentsUpload, activityInsights?.recentAchievements]);

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-glow ${
      insight.urgent ? 'border-warning bg-warning/5' : 'border-primary/20 bg-primary/5'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${
            insight.urgent ? 'bg-warning/20' : 'bg-primary/20'
          }`}>
            <MessageCircle className={`h-4 w-4 ${
              insight.urgent ? 'text-warning' : 'text-primary'
            }`} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">APPIES SAYS:</span>
              {insight.urgent && (
                <span className="text-xs px-2 py-0.5 bg-warning/20 text-warning rounded-full font-medium">
                  URGENT
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground">
              {insight.message}
            </p>
            <Button
              size="sm"
              variant={insight.urgent ? "destructive" : "default"}
              className="text-xs h-7"
              asChild
            >
              <a href={insight.link} className="flex items-center gap-1">
                {insight.action}
                <ArrowRight className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
        
        {/* Cute Appies character */}
        <div className="absolute top-2 right-2 text-lg opacity-50">
          🧸
        </div>
      </CardContent>
    </Card>
  );
}
