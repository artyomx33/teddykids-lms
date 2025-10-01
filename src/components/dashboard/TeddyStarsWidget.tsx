import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Crown, Award, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export function TeddyStarsWidget() {
  const { data: teddyStars = [] } = useQuery({
    queryKey: ["teddy-stars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts_enriched")
        .select("staff_id, full_name, position, avg_review_score, first_start")
        .eq("has_five_star_badge", true)
        .order("avg_review_score", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Trending removed - will calculate from historical data after Phase 1
  const trendingData = {
    change: 0,
    period: "vs last month"
  };

  const calculateTenure = (startDate: string | null) => {
    if (!startDate) return "New";
    const start = new Date(startDate);
    const now = new Date();
    const months = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (months < 12) return `${months}mo`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}y ${remainingMonths}mo` : `${years}y`;
  };

  if (teddyStars.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4 text-yellow-500" />
            Teddy Stars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 space-y-2">
            <div className="text-2xl opacity-50">🧸</div>
            <p className="text-sm text-muted-foreground">
              No 5-star staff yet. Time to crown some Teddy Stars!
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              <Crown className="h-3 w-3 mr-1" />
              Crown a Star
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-4 w-4 text-yellow-500" />
          Teddy Stars
          <div className="ml-auto flex items-center gap-2">
            {trendingData.change !== 0 && (
              <div className="flex items-center gap-1">
                {trendingData.change > 0 ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span className={`text-xs ${trendingData.change > 0 ? 'text-success' : 'text-destructive'}`}>
                  {Math.abs(trendingData.change)}
                </span>
              </div>
            )}
            <Badge variant="secondary">
              {teddyStars.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {teddyStars.slice(0, 4).map((star, index) => (
          <div
            key={star.staff_id}
            className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-md border border-yellow-200"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                {index === 0 && (
                  <Crown className="h-2 w-2 text-yellow-600 absolute -top-1 -right-1" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {star.full_name}
                  </span>
                  {index === 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      TOP
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {star.position || "Staff"}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {calculateTenure(star.first_start)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-700">
                {star.avg_review_score?.toFixed(1) || "5.0"}
              </span>
            </div>
          </div>
        ))}

        {teddyStars.length > 4 && (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/staff?filter=stars">
              View all {teddyStars.length} stars
            </Link>
          </Button>
        )}

        <Button size="sm" className="w-full bg-gradient-primary hover:shadow-glow">
          <Crown className="h-3 w-3 mr-1" />
          Crown a New Star
        </Button>
      </CardContent>
    </Card>
  );
}