import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { EmployesWorkingHoursData } from "@/lib/employesProfile";

interface EmployesWorkingHoursPanelProps {
  workingHours: EmployesWorkingHoursData[];
}

export function EmployesWorkingHoursPanel({ workingHours }: EmployesWorkingHoursPanelProps) {
  if (!workingHours || workingHours.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No working hours information available</p>
        </CardContent>
      </Card>
    );
  }

  const currentHours = workingHours[0];
  const previousHours = workingHours.slice(1);

  const getTrendIcon = () => {
    if (previousHours.length === 0) return null;
    const prevHours = previousHours[0].hoursPerWeek;
    const currHours = currentHours.hoursPerWeek;
    
    if (currHours > prevHours) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (currHours < prevHours) return <TrendingDown className="h-4 w-4 text-orange-600" />;
    return null;
  };

  const HoursCard = ({ hours, isCurrent = false }: { hours: EmployesWorkingHoursData; isCurrent?: boolean }) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{hours.hoursPerWeek}h</span>
            <span className="text-muted-foreground">/ week</span>
            {isCurrent && <Badge variant="default">Current</Badge>}
            {isCurrent && getTrendIcon()}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Since {hours.startDate}
            {hours.endDate && ` → ${hours.endDate}`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Days per week:</span>
          <span className="ml-2 font-medium">{hours.daysPerWeek}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Part-time factor:</span>
          <span className="ml-2 font-medium">{(hours.partTimeFactor * 100).toFixed(0)}%</span>
        </div>
      </div>

      {hours.workingDays && (
        <div className="flex flex-wrap gap-1">
          {hours.workingDays.map((day, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {day}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Working Hours
          <Badge variant="outline">{workingHours.length} period{workingHours.length !== 1 ? 's' : ''}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-3">Current Schedule</h4>
          <HoursCard hours={currentHours} isCurrent />
        </div>

        {previousHours.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Previous Schedules</h4>
            <div className="space-y-2">
              {previousHours.map((hours, idx) => (
                <HoursCard key={idx} hours={hours} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
