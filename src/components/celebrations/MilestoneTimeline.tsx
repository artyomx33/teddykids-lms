import { useState } from "react";
import { Calendar, CheckCircle, Clock, Star, Trophy, Award, Target, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ConfettiCelebration, useCelebration } from "./ConfettiCelebration";

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  type: "orientation" | "training" | "review" | "project" | "assessment" | "celebration";
  points: number;
  isCompleted: boolean;
  requirements?: string[];
}

interface MilestoneTimelineProps {
  internName: string;
  internYear: number;
  startDate: string;
}

const milestoneTemplates = {
  1: [ // Year 1 milestones
    { id: "m1", title: "Welcome Orientation", description: "Complete first day orientation and team introductions", type: "orientation", points: 100, days: 1 },
    { id: "m2", title: "Safety Training", description: "Complete all required safety protocols and certifications", type: "training", points: 150, days: 7 },
    { id: "m3", title: "First Week Check-in", description: "Initial progress review with mentor", type: "review", points: 100, days: 7 },
    { id: "m4", title: "Basic Skills Mastery", description: "Demonstrate proficiency in core tasks", type: "training", points: 200, days: 30 },
    { id: "m5", title: "First Month Review", description: "Comprehensive evaluation of initial progress", type: "review", points: 250, days: 30 },
    { id: "m6", title: "Independence Milestone", description: "Work independently on assigned tasks", type: "project", points: 300, days: 60 },
    { id: "m7", title: "Mid-term Assessment", description: "Formal skills evaluation and feedback session", type: "assessment", points: 350, days: 180 },
    { id: "m8", title: "Leadership Project", description: "Lead a small team project or initiative", type: "project", points: 400, days: 270 },
    { id: "m9", title: "Year-End Evaluation", description: "Final assessment for Year 2 advancement", type: "assessment", points: 500, days: 365 },
    { id: "m10", title: "🎉 Year 1 Champion!", description: "Celebrate completing your first year!", type: "celebration", points: 1000, days: 365 }
  ],
  2: [ // Year 2 milestones
    { id: "m11", title: "Advanced Training", description: "Complete specialized skill development", type: "training", points: 200, days: 30 },
    { id: "m12", title: "Mentorship Role", description: "Begin mentoring new Year 1 interns", type: "project", points: 300, days: 90 },
    { id: "m13", title: "Quality Certification", description: "Achieve quality standards certification", type: "assessment", points: 400, days: 180 },
    { id: "m14", title: "Innovation Project", description: "Propose and implement process improvement", type: "project", points: 500, days: 270 },
    { id: "m15", title: "🏆 Year 2 Expert!", description: "Master level achievement unlocked!", type: "celebration", points: 1000, days: 365 }
  ],
  3: [ // Year 3 milestones  
    { id: "m16", title: "Leadership Development", description: "Complete management training program", type: "training", points: 300, days: 60 },
    { id: "m17", title: "Department Integration", description: "Full integration into department operations", type: "project", points: 400, days: 120 },
    { id: "m18", title: "Contract Preparation", description: "Prepare for full employment transition", type: "assessment", points: 500, days: 300 },
    { id: "m19", title: "👑 Ready for Success!", description: "Graduate to full team member!", type: "celebration", points: 1500, days: 365 }
  ]
};

export function MilestoneTimeline({ internName, internYear, startDate }: MilestoneTimelineProps) {
  const { isActive, title, message, type, celebrate, closeCelebration } = useCelebration();
  
  // Generate milestones based on intern year and start date
  const generateMilestones = (): Milestone[] => {
    const templates = milestoneTemplates[internYear as keyof typeof milestoneTemplates] || milestoneTemplates[1];
    const start = new Date(startDate);
    
    return templates.map(template => {
      const targetDate = new Date(start);
      targetDate.setDate(targetDate.getDate() + template.days);
      
      // Simulate some completed milestones based on current date
      const now = new Date();
      const isCompleted = targetDate < now && Math.random() > 0.3; // 70% chance of completion for past milestones
      
      return {
        id: template.id,
        title: template.title,
        description: template.description,
        targetDate: targetDate.toISOString().split('T')[0],
        completedDate: isCompleted ? targetDate.toISOString().split('T')[0] : undefined,
        type: template.type as any,
        points: template.points,
        isCompleted,
        requirements: template.type === "training" ? ["Complete online modules", "Pass assessment", "Obtain certificate"] : 
                     template.type === "review" ? ["Schedule meeting", "Submit self-evaluation", "Receive feedback"] :
                     template.type === "project" ? ["Define objectives", "Execute plan", "Present results"] : []
      };
    });
  };

  const [milestones] = useState<Milestone[]>(generateMilestones());
  
  const completedMilestones = milestones.filter(m => m.isCompleted);
  const totalPoints = completedMilestones.reduce((sum, m) => sum + m.points, 0);
  const maxPoints = milestones.reduce((sum, m) => sum + m.points, 0);
  const progressPercentage = Math.round((totalPoints / maxPoints) * 100);

  const handleCelebrateMilestone = (milestone: Milestone) => {
    if (milestone.type === "celebration") {
      celebrate(
        milestone.title,
        `🎉 ${internName} has ${milestone.title.toLowerCase()}! What an amazing achievement!`,
        "milestone"
      );
    } else {
      celebrate(
        "Milestone Achieved!",
        `${internName} completed: ${milestone.title}`,
        "milestone"
      );
    }
  };

  const getMilestoneIcon = (type: string, isCompleted: boolean) => {
    const iconClass = `w-6 h-6 ${isCompleted ? 'text-success' : 'text-muted-foreground'}`;
    
    switch (type) {
      case "orientation": return <Target className={iconClass} />;
      case "training": return <Award className={iconClass} />;
      case "review": return <Star className={iconClass} />;
      case "project": return <Trophy className={iconClass} />;
      case "assessment": return <CheckCircle className={iconClass} />;
      case "celebration": return <Sparkles className={iconClass} />;
      default: return <Clock className={iconClass} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "orientation": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "training": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "review": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "project": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "assessment": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "celebration": return "bg-pink-500/10 text-pink-600 border-pink-500/20";
      default: return "bg-muted/50 text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="shadow-card bg-gradient-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            🎯 {internName}'s Journey - Year {internYear}
          </CardTitle>
          <CardDescription>
            Track progress through internship milestones and celebrate achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{progressPercentage}%</div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">{completedMilestones.length}</div>
              <p className="text-sm text-muted-foreground">Milestones Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">{totalPoints.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Points Earned</p>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Milestone Timeline
          </CardTitle>
          <CardDescription>
            Visual timeline of internship progression and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {milestones.map((milestone, index) => {
              const isLast = index === milestones.length - 1;
              
              return (
                <div key={milestone.id} className="relative">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className={`absolute left-6 top-16 w-0.5 h-12 ${
                      milestone.isCompleted ? 'bg-success' : 'bg-muted'
                    }`} />
                  )}
                  
                  <div className="flex items-start gap-4">
                    {/* Timeline dot and icon */}
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                      milestone.isCompleted 
                        ? 'bg-success/10 border-success' 
                        : 'bg-background border-muted'
                    }`}>
                      {getMilestoneIcon(milestone.type, milestone.isCompleted)}
                    </div>
                    
                    {/* Milestone content */}
                    <div className="flex-1">
                      <div className={`p-4 rounded-lg border transition-all duration-200 ${
                        milestone.isCompleted 
                          ? 'bg-success/5 border-success/20 shadow-sm' 
                          : 'bg-muted/30 hover:bg-muted/50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{milestone.title}</h3>
                            <Badge className={getTypeColor(milestone.type)}>
                              {milestone.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {milestone.isCompleted && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCelebrateMilestone(milestone)}
                                className="text-success border-success/20 hover:bg-success/10"
                              >
                                🎉 Celebrate!
                              </Button>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {milestone.points} pts
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{milestone.description}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                              Target: {new Date(milestone.targetDate).toLocaleDateString()}
                            </span>
                            {milestone.completedDate && (
                              <span className="text-success font-medium">
                                ✅ Completed: {new Date(milestone.completedDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          {milestone.isCompleted && milestone.type === "celebration" && (
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Trophy className="w-4 h-4" />
                              <span className="font-medium">Achievement Unlocked!</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Requirements checklist */}
                        {milestone.requirements && milestone.requirements.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-muted/50">
                            <p className="text-xs text-muted-foreground mb-2">Requirements:</p>
                            <div className="flex flex-wrap gap-1">
                              {milestone.requirements.map((req, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {milestone.isCompleted ? "✅" : "⏳"} {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Celebration Component */}
      <ConfettiCelebration
        isActive={isActive}
        title={title}
        message={message}
        type={type}
        onClose={closeCelebration}
      />
    </div>
  );
}