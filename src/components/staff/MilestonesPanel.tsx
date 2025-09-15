import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, CheckCircle, AlertCircle, Trophy, Target } from "lucide-react";
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
  
  // Calculate overall progress
  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

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
            <Target className="h-5 w-5" />
            Career Milestones
          </CardTitle>
          {!hasData && <Badge variant="secondary">Missing Data</Badge>}
        </div>
        {hasData && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Achievement Progress</span>
              <span className="font-medium">{completedMilestones}/{totalMilestones} Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasData ? (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3 text-center">
            No contract start date available
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Contract started: {format(new Date(contractStartDate), 'MMM dd, yyyy')}
            </div>
            
            <div className="space-y-3">
              {milestones.map((milestone, index) => {
                const { badge } = getMilestoneStatus(milestone);
                const isLast = index === milestones.length - 1;
                
                return (
                  <div key={milestone.id} className="relative">
                    <div className="flex items-center justify-between p-3 border rounded-md bg-card/50">
                      <div className="flex items-center gap-3">
                        {getMilestoneIcon(milestone)}
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {milestone.title}
                            {milestone.completed && <Trophy className="h-3 w-3 text-yellow-500" />}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {milestone.completed ? 
                              `Completed: ${format(milestone.targetDate, 'MMM dd, yyyy')}` :
                              `Target: ${format(milestone.targetDate, 'MMM dd, yyyy')}`
                            }
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
                    
                    {/* Progress connector line */}
                    {!isLast && (
                      <div className="absolute left-8 top-[60px] w-0.5 h-4 bg-border" />
                    )}
                  </div>
                );
              })}
            </div>
            
            {completedMilestones > 0 && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Trophy className="h-4 w-4" />
                  <span className="font-medium">Great progress!</span>
                  <span className="text-primary/80">
                    {Math.round(progressPercentage)}% milestone completion
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}