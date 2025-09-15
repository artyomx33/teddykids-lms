import { useState } from "react";
import { GraduationCap, Users, Clock, CheckCircle, AlertTriangle, TrendingUp, Calendar, Star, FileText, Plus, UserPlus, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MentorAssignmentModal } from "@/components/interns/MentorAssignmentModal";
import { InternProgressPage } from "@/components/interns/InternProgressPage";
import { MilestoneTimeline } from "@/components/celebrations/MilestoneTimeline";
import { ConfettiCelebration, useCelebration } from "@/components/celebrations/ConfettiCelebration";

// Mock intern data since database is empty
const mockInterns = [
  {
    id: "intern-1",
    name: "Emma Thompson",
    year: 1,
    department: "Care Services", 
    startDate: "2024-01-15",
    mentor: "Lisa Wang",
    email: "emma.thompson@teddykids.com",
    progress: 78,
    completedDocuments: 7,
    totalDocuments: 9
  },
  {
    id: "intern-2", 
    name: "James Wilson",
    year: 2,
    department: "Operations",
    startDate: "2023-09-01", 
    mentor: "Mike Chen",
    email: "james.wilson@teddykids.com",
    progress: 92,
    completedDocuments: 8,
    totalDocuments: 8
  },
  {
    id: "intern-3",
    name: "Sofia Martinez",
    year: 1,
    department: "Administration",
    startDate: "2024-02-01",
    mentor: undefined,
    email: "sofia.martinez@teddykids.com", 
    progress: 45,
    completedDocuments: 4,
    totalDocuments: 9
  }
];

export default function Interns() {
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<typeof mockInterns[0] | undefined>();
  const [selectedInternForProgress, setSelectedInternForProgress] = useState<typeof mockInterns[0] | undefined>();
  const [selectedInternForTimeline, setSelectedInternForTimeline] = useState<typeof mockInterns[0] | undefined>();
  const { isActive, title, message, type, celebrate, closeCelebration } = useCelebration();

  const handleAssignMentor = (intern: typeof mockInterns[0]) => {
    setSelectedIntern(intern);
    setIsMentorModalOpen(true);
  };

  const handleViewProgress = (intern: typeof mockInterns[0]) => {
    setSelectedInternForProgress(intern);
  };

  const handleViewTimeline = (intern: typeof mockInterns[0]) => {
    setSelectedInternForTimeline(intern);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interns</h1>
          <p className="text-muted-foreground mt-1">
            Manage intern progress, documents, and milestones
          </p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Add Intern
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Interns
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">42</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+3 </span>
              since last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Docs Complete
            </CardTitle>
            <FileCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">73%</div>
            <p className="text-xs text-muted-foreground">
              31 of 42 interns
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ready for Contracts
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8</div>
            <p className="text-xs text-muted-foreground">
              Eligible for promotion
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Completion Time
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">4.2w</div>
            <p className="text-xs text-muted-foreground">
              Document processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Intern Progress by Year */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Intern Progress by Year
            </CardTitle>
            <CardDescription>
              Track progress across Y1, Y2, and Y3 interns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for intern year breakdown */}
            <div className="space-y-4">
              {[
                { year: "Y1", count: 18, complete: 12, color: "bg-blue-500" },
                { year: "Y2", count: 15, complete: 13, color: "bg-green-500" },
                { year: "Y3", count: 9, complete: 6, color: "bg-purple-500" }
              ].map((yearData) => (
                <div key={yearData.year} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${yearData.color} text-white border-0`}>
                        {yearData.year}
                      </Badge>
                      <span className="text-sm font-medium">{yearData.count} interns</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {yearData.complete}/{yearData.count} documents complete
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${yearData.color}`}
                      style={{ width: `${(yearData.complete / yearData.count) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Status Alert */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Action Required
            </CardTitle>
            <CardDescription>
              Interns needing immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Placeholder for urgent items */}
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm font-medium text-warning">
                  📄 5 interns missing VOG certificates
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Required for program completion
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm font-medium text-blue-600">
                  🎓 3 interns ready for contract review
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  All requirements met
                </p>
              </div>

              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-sm font-medium text-orange-600">
                  ⏰ 2 interns approaching deadline
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Documents due within 7 days
                </p>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4">
              View All Issues
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder sections for future development */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>🏗️ Coming Soon: Milestone Tracker</CardTitle>
            <CardDescription>
              Track first month, 6-month, and yearly milestones for each intern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Visual timeline showing intern progress through key milestones and achievements.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>🏗️ Coming Soon: Mentor Assignment</CardTitle>
            <CardDescription>
              Link interns to mentors and track mentoring relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Assign mentors to interns and monitor mentoring progress and outcomes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}