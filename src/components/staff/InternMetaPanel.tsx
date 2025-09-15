import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, User, MapPin, TrendingUp } from "lucide-react";

interface InternMetaPanelProps {
  staff: {
    is_intern: boolean;
    intern_year: number | null;
    intern_meta?: any;
  };
  enrichedData?: {
    manager_key?: string | null;
    position?: string | null;
  } | null;
}

export function InternMetaPanel({ staff, enrichedData }: InternMetaPanelProps) {
  // Only show for interns
  if (!staff.is_intern) {
    return null;
  }

  const internYear = staff.intern_year || 1;
  const internMeta = staff.intern_meta || {};
  const mentor = internMeta.mentor || enrichedData?.manager_key;
  const pathway = internMeta.pathway || 'BBL'; // Default to BBL
  const contractReady = internMeta.contract_ready || false;

  const getYearBadge = (year: number) => {
    const colors = {
      1: "bg-blue-100 text-blue-800 border-blue-300",
      2: "bg-purple-100 text-purple-800 border-purple-300",
      3: "bg-green-100 text-green-800 border-green-300"
    };
    
    return (
      <Badge variant="outline" className={colors[year as keyof typeof colors] || colors[1]}>
        Year {year}
      </Badge>
    );
  };

  const getPathwayBadge = (pathway: string) => {
    const colors = {
      BBL: "bg-orange-100 text-orange-800 border-orange-300",
      BOL: "bg-teal-100 text-teal-800 border-teal-300"
    };
    
    return (
      <Badge variant="outline" className={colors[pathway as keyof typeof colors] || colors.BBL}>
        {pathway} Track
      </Badge>
    );
  };

  const getReadinessStatus = () => {
    if (internYear >= 3 && contractReady) {
      return {
        badge: (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            ✅ Ready for Staff
          </Badge>
        ),
        canPromote: true
      };
    }
    
    if (internYear >= 3) {
      return {
        badge: (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            📋 Evaluation Needed
          </Badge>
        ),
        canPromote: false
      };
    }
    
    return {
      badge: (
        <Badge variant="outline">
          📚 In Training
        </Badge>
      ),
      canPromote: false
    };
  };

  const readinessStatus = getReadinessStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Intern Progress
          </div>
          {getYearBadge(internYear)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">Y{internYear}</div>
            <div className="text-xs text-muted-foreground">Current Year</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold">{pathway}</div>
            <div className="text-xs text-muted-foreground">Pathway</div>
          </div>
        </div>

        {/* Mentor Information */}
        {mentor && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Mentor</h4>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{mentor}</span>
            </div>
          </div>
        )}

        {/* Training Path */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Training Details</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Learning Path</span>
              {getPathwayBadge(pathway)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Contract Status</span>
              {readinessStatus.badge}
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Development Progress</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Year 1 Completed</span>
              <span className="text-green-600">✓</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Year 2 Completed</span>
              <span className={internYear >= 2 ? "text-green-600" : "text-muted-foreground"}>
                {internYear >= 2 ? "✓" : "○"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Year 3 Completed</span>
              <span className={internYear >= 3 ? "text-green-600" : "text-muted-foreground"}>
                {internYear >= 3 ? "✓" : "○"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {readinessStatus.canPromote && (
            <Button variant="default" size="sm" className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              Promote to Staff
            </Button>
          )}
          
          <Button variant="outline" size="sm" className="w-full">
            View Training Plan
          </Button>
          
          {mentor && (
            <Button variant="outline" size="sm" className="w-full">
              Contact Mentor
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}