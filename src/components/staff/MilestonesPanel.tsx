import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format, addMonths, addYears, isPast, isFuture, differenceInDays } from "date-fns";

interface Milestone {
  id: string;
  title: string;
  targetDate: Date;
  completed: boolean;
  completedDate?: Date;
  type: 'month' | 'sixMonth' | 'year';
}

interface MilestonesPanelProps {
  staffId: string;
  contractStartDate?: string | null;
  onScheduleReview?: (milestone: Milestone) => void;
}

export function MilestonesPanel({ staffId, contractStartDate, onScheduleReview }: MilestonesPanelProps) {
  const generateMilestones = (startDate: string): Milestone[] => {
    const start = new Date(startDate);
    const now = new Date();
    
    return [
      {
        id: 'first-month',
        title: 'First Month Review',
        targetDate: addMonths(start, 1),
        completed: isPast(addMonths(start, 1)),
        type: 'month'
      },
      {
        id: 'six-month',
        title: '6-Month Review',
        targetDate: addMonths(start, 6),
        completed: isPast(addMonths(start, 6)),
        type: 'sixMonth'
      },
      {
        id: 'one-year',
        title: 'Annual Review',
        targetDate: addYears(start, 1),
        completed: isPast(addYears(start, 1)),
        type: 'year'
      }
    ];
  };

  const milestones = contractStartDate ? generateMilestones(contractStartDate) : [];
  const hasData = contractStartDate !== null && contractStartDate !== undefined;

  const getMilestoneStatus = (milestone: Milestone) => {
    const today = new Date();
    const daysUntil = differenceInDays(milestone.targetDate, today);
    
    if (milestone.completed) {
      return { status: 'completed', badge: <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge> };
    } else if (daysUntil < 0) {
      return { status: 'overdue', badge: <Badge variant="destructive">Overdue</Badge> };
    } else if (daysUntil <= 30) {
      return { status: 'due-soon', badge: <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Due Soon</Badge> };
    } else {
      return { status: 'upcoming', badge: <Badge variant="outline">Upcoming</Badge> };
    }
  };

  const getMilestoneIcon = (milestone: Milestone) => {
    const { status } = getMilestoneStatus(milestone);
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'due-soon':
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contract Milestones
          </CardTitle>
          {!hasData && <Badge variant="secondary">Missing Data</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasData ? (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3 text-center">
            No contract start date available
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-3">
              Contract started: {format(new Date(contractStartDate), 'MMM dd, yyyy')}
            </div>
            
            <div className="space-y-3">
              {milestones.map((milestone) => {
                const { badge } = getMilestoneStatus(milestone);
                
                return (
                  <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      {getMilestoneIcon(milestone)}
                      <div>
                        <div className="font-medium text-sm">{milestone.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Due: {format(milestone.targetDate, 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {badge}
                      {!milestone.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onScheduleReview?.(milestone)}
                        >
                          Schedule
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}