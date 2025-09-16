import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, CheckCircle, AlertCircle, Trophy, Target, Sparkles, Star } from "lucide-react";
import { format, addMonths, addYears, isPast, isFuture, differenceInDays } from "date-fns";

interface Milestone {
  id: string;
  title: string;
  targetDate: Date;
  completed: boolean;
  completedDate?: Date;
  type: 'month' | 'sixMonth' | 'year';
  description: string;
  points: number;
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
        description: 'Initial evaluation and feedback session',
        targetDate: addMonths(start, 1),
        completed: isPast(addMonths(start, 1)),
        type: 'month',
        points: 100
      },
      {
        id: 'six-month',
        title: '6-Month Review',
        description: 'Mid-year performance assessment',
        targetDate: addMonths(start, 6),
        completed: isPast(addMonths(start, 6)),
        type: 'sixMonth',
        points: 250
      },
      {
        id: 'one-year',
        title: 'Annual Review',
        description: 'Comprehensive yearly evaluation',
        targetDate: addYears(start, 1),
        completed: isPast(addYears(start, 1)),
        type: 'year',
        points: 500
      }
    ];
  };

  const milestones = contractStartDate ? generateMilestones(contractStartDate) : [];
  const hasData = contractStartDate !== null && contractStartDate !== undefined;
  
  // Calculate overall progress
  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const totalPoints = milestones.filter(m => m.completed).reduce((sum, m) => sum + m.points, 0);
  const maxPoints = milestones.reduce((sum, m) => sum + m.points, 0);

  const getMilestoneStatus = (milestone: Milestone) => {
    const today = new Date();
    const daysUntil = differenceInDays(milestone.targetDate, today);
    
    if (milestone.completed) {
      return { status: 'completed', badge: <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white"><Trophy className="h-3 w-3 mr-1" />Complete</Badge> };
    } else if (daysUntil < 0) {
      return { status: 'overdue', badge: <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge> };
    } else if (daysUntil <= 30) {
      return { status: 'due-soon', badge: <Badge className="bg-orange-500 hover:bg-orange-600 text-white"><Clock className="h-3 w-3 mr-1" />Due Soon</Badge> };
    } else {
      return { status: 'upcoming', badge: <Badge variant="outline"><Target className="h-3 w-3 mr-1" />Upcoming</Badge> };
    }
  };

  const getMilestoneIcon = (milestone: Milestone) => {
    const { status } = getMilestoneStatus(milestone);
    
    if (milestone.completed) {
      return (
        <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
          <CheckCircle className="h-5 w-5 text-white" />
        </div>
      );
    }
    
    switch (status) {
      case 'overdue':
        return (
          <div className="h-10 w-10 rounded-full bg-destructive flex items-center justify-center shadow-md">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
        );
      case 'due-soon':
        return (
          <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
            <Clock className="h-5 w-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-full bg-muted border-2 border-dashed border-muted-foreground flex items-center justify-center">
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Career Milestones
          </CardTitle>
          {hasData && <Badge variant="outline" className="font-semibold">{completedMilestones}/{totalMilestones} Complete</Badge>}
        </div>
        
        {hasData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Achievement Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{totalPoints} / {maxPoints} points earned</span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {totalMilestones - completedMilestones} milestones remaining
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasData ? (
          <div className="space-y-4">
            {/* Encouraging header */}
            <div className="text-center py-2">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-primary/60" />
              <h3 className="font-medium text-sm mb-1">Your Career Journey Awaits!</h3>
              <p className="text-xs text-muted-foreground">Here's what milestones you'll unlock</p>
            </div>
            
            {/* Preview of upcoming milestones */}
            <div className="space-y-4">
              {[
                { title: 'First Month Review', description: 'Initial evaluation and feedback session', points: 100, icon: Target },
                { title: '6-Month Review', description: 'Mid-year performance assessment', points: 250, icon: Star },
                { title: 'Annual Review', description: 'Comprehensive yearly evaluation', points: 500, icon: Trophy }
              ].map((preview, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                  <div className="h-8 w-8 rounded-full bg-muted border border-dashed border-muted-foreground/50 flex items-center justify-center flex-shrink-0">
                    <preview.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm text-muted-foreground">{preview.title}</h4>
                      <Badge variant="outline" className="text-xs">+{preview.points} pts</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{preview.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Call to action */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-3 text-center">
              <Sparkles className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground mb-2">
                Complete your onboarding to unlock these milestones!
              </p>
              <Button variant="outline" size="sm" className="text-xs">
                <Target className="h-3 w-3 mr-1" />
                Get Started
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2 px-1">
              <Calendar className="h-4 w-4" />
              Contract started: {format(new Date(contractStartDate), 'MMM dd, yyyy')}
            </div>
            
            {/* Visual Progress Path */}
            <div className="space-y-6">
              {milestones.map((milestone, index) => {
                const { status, badge } = getMilestoneStatus(milestone);
                const isLast = index === milestones.length - 1;
                
                return (
                  <div key={milestone.id} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        {getMilestoneIcon(milestone)}
                        {!isLast && (
                          <div className={`absolute top-10 left-5 w-0.5 h-10 ${
                            milestone.completed ? 'bg-emerald-500' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 pb-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{milestone.title}</h4>
                            {milestone.completed && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          </div>
                          {badge}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-3">{milestone.description}</p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {milestone.completed ? 
                              `Completed: ${format(milestone.targetDate, 'MMM dd, yyyy')}` :
                              `Target: ${format(milestone.targetDate, 'MMM dd, yyyy')}`
                            }
                          </span>
                          <span className="font-medium text-primary">+{milestone.points} points</span>
                        </div>
                        
                        {milestone.completed && (
                          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Milestone achieved!
                          </div>
                        )}
                        
                        {!milestone.completed && status !== 'upcoming' && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onScheduleReview?.(milestone)}
                              className="w-full"
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Schedule Review
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Achievement Summary */}
            {completedMilestones > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-primary">Excellent Progress!</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(progressPercentage)}% milestone completion • {totalPoints} points earned
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}