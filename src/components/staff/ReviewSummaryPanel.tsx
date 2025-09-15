import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, TrendingUp, AlertCircle } from "lucide-react";

interface ReviewSummaryPanelProps {
  reviews: Array<{
    id: string;
    review_date: string;
    review_type: string | null;
    score: number | null;
    raise: boolean;
  }>;
  enrichedData?: {
    needs_six_month_review?: boolean | null;
    needs_yearly_review?: boolean | null;
    next_review_due?: string | null;
    avg_review_score?: number | null;
  } | null;
  onCreateReview?: () => void;
}

export function ReviewSummaryPanel({ 
  reviews, 
  enrichedData, 
  onCreateReview 
}: ReviewSummaryPanelProps) {
  const latestReview = reviews[0];
  const avgScore = enrichedData?.avg_review_score;
  const reviewsWithRaise = reviews.filter(r => r.raise).length;
  
  const getScoreBadge = (score?: number) => {
    if (!score) return null;
    
    if (score >= 4.5) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          ⭐ Excellent ({score})
        </Badge>
      );
    }
    
    if (score >= 3.5) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-300">
          👍 Good ({score})
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline">
        📈 Improving ({score})
      </Badge>
    );
  };

  const getReviewStatusBadge = () => {
    if (enrichedData?.needs_yearly_review) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Yearly Due
        </Badge>
      );
    }
    
    if (enrichedData?.needs_six_month_review) {
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Calendar className="h-3 w-3 mr-1" />
          6-Month Due
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline">
        ✅ Up to Date
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Review Summary
          </div>
          {getReviewStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{reviews.length}</div>
            <div className="text-xs text-muted-foreground">Total Reviews</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              {avgScore?.toFixed(1) || '—'}
              {avgScore && <Star className="h-4 w-4 text-yellow-500" />}
            </div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </div>
        </div>

        {/* Latest Review */}
        {latestReview && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Latest Review</h4>
            <div className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {latestReview.review_type || 'Review'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(latestReview.review_date).toLocaleDateString('nl-NL')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {latestReview.score && getScoreBadge(latestReview.score)}
                {latestReview.raise && (
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                    💰 Raise
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Review Types Completed */}
        {reviews.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Review History</h4>
            <div className="flex flex-wrap gap-1">
              {[...new Set(reviews.map(r => r.review_type).filter(Boolean))].map(type => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Next Review Due */}
        {enrichedData?.next_review_due && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <span className="font-medium">Next Review Due:</span>
              <span>{new Date(enrichedData.next_review_due).toLocaleDateString('nl-NL')}</span>
            </div>
          </div>
        )}

        {/* Performance Insights */}
        {reviewsWithRaise > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <TrendingUp className="h-4 w-4" />
              <span>{reviewsWithRaise} review{reviewsWithRaise > 1 ? 's' : ''} recommended a raise</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button 
            variant="default" 
            size="sm" 
            className="w-full"
            onClick={onCreateReview}
          >
            Start New Review
          </Button>
          
          {enrichedData?.next_review_due && (
            <Button variant="outline" size="sm" className="w-full">
              Schedule Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}