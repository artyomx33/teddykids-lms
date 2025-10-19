import { useState } from "react";
import { GraduationCap, Users, Clock, CheckCircle, AlertTriangle, TrendingUp, Calendar, Star, FileText, Plus, UserPlus, Eye, FileCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MentorAssignmentModal } from "@/components/interns/MentorAssignmentModal";
import { AddInternModal } from "@/components/interns/AddInternModal";
import { InternProgressPage } from "@/components/interns/InternProgressPage";
import { MilestoneTimeline } from "@/components/celebrations/MilestoneTimeline";
import { ConfettiCelebration, useCelebration } from "@/components/celebrations/ConfettiCelebration";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Error Boundaries
import { ErrorBoundary, PageErrorBoundary } from "@/components/error-boundaries/ErrorBoundary";

export default function Interns() {
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [isAddInternOpen, setIsAddInternOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<any>();
  const [selectedInternForProgress, setSelectedInternForProgress] = useState<any>();
  const [selectedInternForTimeline, setSelectedInternForTimeline] = useState<any>();
  const { isActive, title, message, type, celebrate, closeCelebration } = useCelebration();

  // Fetch real intern data from database
  const {
    data: interns = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['interns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_with_lms_data')
        .select(`
          id,
          full_name,
          employes_id,
          is_intern,
          intern_year,
          lms_location,
          employment_start_date,
          email
        `)
        .eq('is_intern', true)
        .order('full_name');

      if (error) throw error;

      // Transform to match component structure
      return data?.map(staff => ({
        id: staff.id,
        name: staff.full_name,
        year: staff.intern_year || 1,
        department: staff.lms_location || 'Unassigned',
        startDate: staff.employment_start_date || '',
        mentor: undefined, // TODO: Add mentor relationship
        email: staff.email,
        progress: 0, // TODO: Calculate from documents
        completedDocuments: 0,
        totalDocuments: 0
      })) || [];
    }
  });

  const totalInterns = interns.length;
  const internsByYearMap = interns.reduce((acc, intern) => {
    const year = Number(intern.year) || 1;
    const current = acc.get(year) ?? { count: 0, progressTotal: 0 };
    current.count += 1;
    current.progressTotal += intern.progress ?? 0;
    acc.set(year, current);
    return acc;
  }, new Map<number, { count: number; progressTotal: number }>());

  const internsByYear = Array.from(internsByYearMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, info]) => ({
      year,
      count: info.count,
      averageProgress: info.count > 0 ? Math.round(info.progressTotal / info.count) : 0,
    }));

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString();
  };

  // Handle loading state
  if (isLoading) {
    return (
      <PageErrorBoundary>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg">Loading interns...</div>
          </div>
        </div>
      </PageErrorBoundary>
    );
  }

  // Handle error state
  if (error) {
    return (
      <PageErrorBoundary>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <div className="text-lg">Error loading interns</div>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      </PageErrorBoundary>
    );
  }

  // Handle empty state
  if (interns.length === 0) {
    return (
      <PageErrorBoundary>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Interns</h1>
              <p className="text-muted-foreground mt-1">
                Manage intern progress, documents, and milestones
              </p>
            </div>
            <Button
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              onClick={() => setIsAddInternOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Intern
            </Button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Interns Found</h3>
              <p className="text-muted-foreground mb-1">No staff members are currently marked as interns.</p>
              <p className="text-sm text-muted-foreground">To add interns, update staff records in the Staff section.</p>
            </div>
          </div>
        </div>

        <AddInternModal
          isOpen={isAddInternOpen}
          onClose={() => setIsAddInternOpen(false)}
          onSuccess={() => {
            refetch();
            setIsAddInternOpen(false);
            celebrate('Intern Added!', 'New intern has been added to the program.', 'milestone');
          }}
        />
      </PageErrorBoundary>
    );
  }

  const handleAssignMentor = (intern: any) => {
    setSelectedIntern(intern);
    setIsMentorModalOpen(true);
  };

  const handleViewProgress = (intern: any) => {
    setSelectedInternForProgress(intern);
  };

  const handleViewTimeline = (intern: any) => {
    setSelectedInternForTimeline(intern);
  };
  
  return (
    <PageErrorBoundary>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interns</h1>
          <p className="text-muted-foreground mt-1">
            Manage intern progress, documents, and milestones
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          onClick={() => setIsAddInternOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Intern
        </Button>
      </div>

      {/* Quick Stats */}
      <ErrorBoundary  componentName="InternStatsCards">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Interns
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalInterns}</div>
            <p className="text-xs text-muted-foreground">
              {totalInterns === 1 ? "Currently 1 active intern" : `Currently ${totalInterns} active interns`}
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
            <div className="text-2xl font-bold text-foreground">—</div>
            <p className="text-xs text-muted-foreground">Document tracking coming soon</p>
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
            <div className="text-2xl font-bold text-foreground">—</div>
            <p className="text-xs text-muted-foreground">Insights coming soon</p>
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
            <div className="text-2xl font-bold text-foreground">—</div>
            <p className="text-xs text-muted-foreground">Automation coming soon</p>
          </CardContent>
        </Card>
        </div>
      </ErrorBoundary>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Intern Progress by Year */}
        <ErrorBoundary  componentName="InternProgressByYear">
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
            <div className="space-y-4">
              {internsByYear.length === 0 ? (
                <p className="text-sm text-muted-foreground">No interns yet. Add your first intern to see progress.</p>
              ) : (
                internsByYear.map((yearData) => {
                  const color = yearData.year === 1 ? "bg-blue-500" : yearData.year === 2 ? "bg-green-500" : "bg-purple-500";
                  return (
                    <div key={yearData.year} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${color} text-white border-0`}>
                            Y{yearData.year}
                          </Badge>
                          <span className="text-sm font-medium">{yearData.count} {yearData.count === 1 ? "intern" : "interns"}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Avg. progress {yearData.averageProgress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${color}`}
                          style={{ width: `${Math.min(Math.max(yearData.averageProgress, 0), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
          </Card>
        </ErrorBoundary>

        {/* Document Status Alert */}
        <ErrorBoundary  componentName="ActionRequired">
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
              <div className="p-3 rounded-lg bg-muted/60 border border-dashed">
                <p className="text-sm font-medium text-muted-foreground">
                  Automated alerts are on the roadmap.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Track VOG expiry, contract milestones, and onboarding tasks from this panel soon.
                </p>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4">
              View All Issues
            </Button>
          </CardContent>
          </Card>
        </ErrorBoundary>
      </div>

      <ErrorBoundary componentName="ActiveInterns">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Active Interns
            </CardTitle>
            <CardDescription>
              View and manage intern assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {interns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No interns yet. Add your first intern to get started.</p>
            ) : (
              <div className="space-y-3">
                {interns.map((intern) => (
                  <div
                    key={intern.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{intern.name}</p>
                        <Badge variant="secondary">Y{intern.year}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {intern.email || "No email"}
                        {intern.department ? ` • ${intern.department}` : ""}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Start date: {formatDate(intern.startDate)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
      {/* Modals and Overlays */}
      <ErrorBoundary  componentName="InternModals">
        <MentorAssignmentModal
        isOpen={isMentorModalOpen}
        onClose={() => {
          setIsMentorModalOpen(false);
          celebrate('Mentor Assigned!', `${selectedIntern?.name} now has a mentor`, 'milestone');
        }}
        intern={selectedIntern}
      />

      <AddInternModal
        isOpen={isAddInternOpen}
        onClose={() => setIsAddInternOpen(false)}
        onSuccess={() => {
          refetch();
          celebrate('Intern Added!', 'New intern has been added to the program.', 'milestone');
        }}
      />

      {selectedInternForProgress && (
        <div className="fixed inset-0 bg-background/95 z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Intern Progress Details</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedInternForProgress(undefined)}
              >
                Close
              </Button>
            </div>
            <InternProgressPage intern={selectedInternForProgress} />
          </div>
        </div>
      )}

      {selectedInternForTimeline && (
        <div className="fixed inset-0 bg-background/95 z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Milestone Timeline</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedInternForTimeline(undefined)}
              >
                Close
              </Button>
            </div>
            <MilestoneTimeline
              internName={selectedInternForTimeline.name}
              internYear={selectedInternForTimeline.year}
              startDate={selectedInternForTimeline.startDate}
            />
          </div>
        </div>
      )}

      <ConfettiCelebration
        isActive={isActive}
        title={title}
        message={message}
        type={type}
        onClose={closeCelebration}
      />
      </ErrorBoundary>
      </div>
    </PageErrorBoundary>
  );
}