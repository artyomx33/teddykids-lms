import { useState } from "react";
import { GraduationCap, CheckCircle, Clock, FileText, User, Calendar, Award, TrendingUp, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface InternProgressPageProps {
  intern: {
    id: string;
    name: string;
    year: number;
    department: string;
    startDate: string;
    mentor?: string;
    email: string;
  };
}

// Mock progress data
const mockProgress = {
  overallCompletion: 72,
  documents: {
    completed: 6,
    total: 9,
    items: [
      { name: "VOG Certificate", completed: true, dueDate: "2024-01-15", uploadDate: "2024-01-10" },
      { name: "POK Certificate", completed: true, dueDate: "2024-01-20", uploadDate: "2024-01-18" },
      { name: "ID Card Copy", completed: true, dueDate: "2024-01-10", uploadDate: "2024-01-08" },
      { name: "Bank Details", completed: true, dueDate: "2024-01-25", uploadDate: "2024-01-22" },
      { name: "Emergency Contacts", completed: true, dueDate: "2024-01-30", uploadDate: "2024-01-28" },
      { name: "Health Declaration", completed: true, dueDate: "2024-02-05", uploadDate: "2024-02-03" },
      { name: "Training Certificate", completed: false, dueDate: "2024-03-15", uploadDate: null },
      { name: "Performance Review", completed: false, dueDate: "2024-03-30", uploadDate: null },
      { name: "Final Assessment", completed: false, dueDate: "2024-04-15", uploadDate: null }
    ]
  },
  milestones: [
    { name: "First Week Orientation", completed: true, date: "2024-01-08", description: "Introduction to team and basic procedures" },
    { name: "Safety Training", completed: true, date: "2024-01-15", description: "Emergency procedures and safety protocols" },
    { name: "First Month Review", completed: true, date: "2024-02-01", description: "Initial performance evaluation" },
    { name: "Mid-term Assessment", completed: false, date: "2024-03-15", description: "Comprehensive skills evaluation" },
    { name: "Project Completion", completed: false, date: "2024-04-01", description: "Complete assigned project work" },
    { name: "Final Evaluation", completed: false, date: "2024-04-15", description: "Final assessment for contract eligibility" }
  ],
  recentActivity: [
    { type: "document", action: "Uploaded Health Declaration", date: "2024-02-03", icon: FileText },
    { type: "milestone", action: "Completed First Month Review", date: "2024-02-01", icon: CheckCircle },
    { type: "note", action: "Mentor added progress note", date: "2024-01-30", icon: MessageSquare },
    { type: "document", action: "Uploaded Emergency Contacts", date: "2024-01-28", icon: FileText }
  ]
};

export function InternProgressPage({ intern }: InternProgressPageProps) {
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const { toast } = useToast();

  const completedDocuments = mockProgress.documents.items.filter(d => d.completed).length;
  const completedMilestones = mockProgress.milestones.filter(m => m.completed).length;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setIsAddingNote(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Note Added",
        description: "Progress note has been saved successfully.",
      });
      setNewNote("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            {intern.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Year {intern.year} Intern • {intern.department} • Started {new Date(intern.startDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {mockProgress.overallCompletion}% Complete
          </Badge>
          <Button className="bg-gradient-primary">
            Print Progress Report
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockProgress.overallCompletion}%</div>
            <Progress value={mockProgress.overallCompletion} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completedDocuments}/{mockProgress.documents.total}</div>
            <p className="text-xs text-muted-foreground">
              {mockProgress.documents.total - completedDocuments} remaining
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Milestones
            </CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completedMilestones}/{mockProgress.milestones.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockProgress.milestones.length - completedMilestones} upcoming
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mentor
            </CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground">{intern.mentor || "Not Assigned"}</div>
            <p className="text-xs text-muted-foreground">
              {intern.mentor ? "Active mentorship" : "Needs assignment"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Document Checklist
              </CardTitle>
              <CardDescription>
                Track required documents and upload progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockProgress.documents.items.map((doc, index) => {
                  const daysRemaining = doc.dueDate ? getDaysRemaining(doc.dueDate) : null;
                  
                  return (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                      doc.completed 
                        ? 'bg-success/10 border-success/20' 
                        : daysRemaining && daysRemaining < 0 
                          ? 'bg-destructive/10 border-destructive/20'
                          : daysRemaining && daysRemaining <= 7
                            ? 'bg-warning/10 border-warning/20'
                            : 'bg-muted/50'
                    }`}>
                      <div className="flex items-center gap-3">
                        {doc.completed ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.completed && doc.uploadDate
                              ? `Uploaded: ${new Date(doc.uploadDate).toLocaleDateString()}`
                              : doc.dueDate 
                                ? `Due: ${new Date(doc.dueDate).toLocaleDateString()}`
                                : "No due date set"
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {doc.completed ? (
                          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                            ✅ Complete
                          </Badge>
                        ) : daysRemaining !== null ? (
                          daysRemaining < 0 ? (
                            <Badge variant="destructive">
                              {Math.abs(daysRemaining)} days overdue
                            </Badge>
                          ) : daysRemaining <= 7 ? (
                            <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                              {daysRemaining} days left
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              {daysRemaining} days left
                            </Badge>
                          )
                        ) : (
                          <Button size="sm" variant="outline">
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Milestone Timeline
              </CardTitle>
              <CardDescription>
                Track progression through internship milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProgress.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-4 h-4 rounded-full border-2 mt-2 ${
                      milestone.completed 
                        ? 'bg-success border-success' 
                        : 'border-muted-foreground bg-background'
                    }`} />
                    <div className="flex-1">
                      <div className={`p-4 rounded-lg border ${
                        milestone.completed 
                          ? 'bg-success/10 border-success/20' 
                          : 'bg-muted/50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{milestone.name}</h4>
                          <div className="flex items-center gap-2">
                            {milestone.completed && (
                              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                                ✅ Completed
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {new Date(milestone.date).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates and progress entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockProgress.recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Icon className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Progress Notes
              </CardTitle>
              <CardDescription>
                Add notes about intern's progress and development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a progress note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isAddingNote}
                  className="bg-gradient-primary"
                >
                  {isAddingNote ? "Adding..." : "Add Note"}
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Lisa Wang (Mentor)</span>
                    <span className="text-xs text-muted-foreground">2024-01-30</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Excellent progress on document completion. Shows strong attention to detail and follows procedures well. 
                    Ready to move on to more complex tasks.
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">System</span>
                    <span className="text-xs text-muted-foreground">2024-02-01</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    First Month Review completed with score of 4.2/5. All initial milestones achieved on schedule.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}