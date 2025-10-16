import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchStaffDetail,
  StaffDetail,
  addReview,
  addNote,
  uploadCertificate,
} from "@/lib/staff";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewDueBanner } from "@/components/staff/ReviewDueBanner";
import { StaffProfileHeader } from "@/components/staff/StaffProfileHeader";
import { CompactProfileCard } from "@/components/staff/CompactProfileCard";
import { StaffTimeline } from "@/components/staff/StaffTimeline";
import { DocumentStatusPanel } from "@/components/staff/DocumentStatusPanel";
import { DocumentStatusCard, DocumentUploadDialog } from "@/features/documents";
import { StaffDocumentsTab } from "@/components/staff/StaffDocumentsTab";
import { InternMetaPanel } from "@/components/staff/InternMetaPanel";
import { initializeStaffDocuments } from "@/features/documents/services/documentService";
import { KnowledgeProgressPanel } from "@/components/staff/KnowledgeProgressPanel";
import { MilestonesPanel } from "@/components/staff/MilestonesPanel";
import { StaffContractsPanel } from "@/components/staff/StaffContractsPanel";
import { LocationEditor } from "@/components/staff/LocationEditor";
import { createTimelineFromStaffData } from "@/lib/staff-timeline";
import { UserRole } from "@/lib/staff-contracts";
import { MapPin, Edit, Star, BarChart3, Calendar, Clock, TrendingUp, FileText, Map, ChevronRight } from "lucide-react";

// Phase 2 Review Components
import { useReviews, useStaffReviewSummary, usePerformanceTrends } from "@/lib/hooks/useReviews";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ScheduleReviewDialog } from "@/components/reviews/ScheduleReviewDialog";
import { PerformanceAnalytics } from "@/components/reviews/PerformanceAnalytics";
import { ReviewCalendar } from "@/components/reviews/ReviewCalendar";

// Dutch Labor Law Components
// OLD: Phase 3 component (will remove after Phase 4 approval)
// import { EmploymentOverviewEnhanced } from "@/components/employes/EmploymentOverviewEnhanced";
import { CompactTaxCard } from "@/components/staff/CompactTaxCard";
import { EmploymentStatusBar } from "@/components/staff/EmploymentStatusBar";
import { useEmployeeCurrentState } from "@/hooks/useEmployeeCurrentState";
// NEW: Phase 4 Timeline Component
import { EmployeeTimeline, TimelineEvent } from "@/components/staff/EmployeeTimeline";
import { EventSlidePanel } from "@/components/contracts/EventSlidePanel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Error Boundaries
import { PageErrorBoundary, SectionErrorBoundary } from "@/components/error-boundaries/ErrorBoundary";


// Employes.nl Profile Components
import { fetchEmployesProfile, isIntern as checkIsIntern } from "@/lib/employesProfile";
import { EmployesEmploymentHistoryPanel } from "@/components/staff/EmployesEmploymentHistoryPanel";
import { EmployesTaxInfoPanel } from "@/components/staff/EmployesTaxInfoPanel";
import { EmployesContractPanel } from "@/components/staff/EmployesContractPanel";
import { EmployesWorkingHoursPanel } from "@/components/staff/EmployesWorkingHoursPanel";
import { EmployesSalaryHistoryPanel } from "@/components/staff/EmployesSalaryHistoryPanel";

// Enhanced UI Components
import { EnhancedSalaryOverview } from "@/components/staff/EnhancedSalaryOverview";
import { EnhancedTaxCoverage } from "@/components/staff/EnhancedTaxCoverage";

export default function StaffProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<StaffDetail>({
    queryKey: ["staffDetail", id],
    queryFn: () => fetchStaffDetail(id!),
    enabled: !!id,
  });

  // 🚀 NEW: Fast current state query
  const employesId = (data?.staff as any)?.employes_id;
  const { data: currentState, isLoading: currentStateLoading } = useEmployeeCurrentState(employesId);
  


  // Phase 2 Review Data (with error handling for missing tables)
  const { data: staffReviews = [], isLoading: reviewsLoading, error: reviewsError } = useReviews({ staffId: id });
  const { data: staffSummary, error: summaryError } = useStaffReviewSummary(id);
  const { data: performanceTrends = [], error: trendsError } = usePerformanceTrends(id || '');

  // Check if review system is available - only hide tabs for critical auth errors, not missing views
  const isCriticalError = (error: any) => {
    if (!error) return false;
    // Only consider auth/permission errors as critical
    return error.code === 'PGRST301' || error.code === '42501' || error.message?.includes('permission denied');
  };
  const isReviewSystemAvailable = !isCriticalError(reviewsError) && !isCriticalError(summaryError) && !isCriticalError(trendsError);

  // Real-time employment data updates - USING NEW employes_changes TABLE
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel('employment-changes-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employes_changes', // NEW: Listen to detected changes table
        },
        () => {
          console.log('[StaffProfile] Employment changes detected, refetching...');
          qc.invalidateQueries({ queryKey: ['employment-changes', id] }); // Invalidate changes query
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, qc]);

  // Employes.nl Profile Data
  const { data: employesProfile, isLoading: employesLoading } = useQuery({
    queryKey: ['employes-profile', id],
    queryFn: () => fetchEmployesProfile(id!),
    enabled: !!id,
  });

  // NO LONGER NEEDED: Raw employment data query removed
  // We now use employes_changes table directly (see employmentChanges query below)

  // Fetch detected changes from change detector
  const { data: employmentChanges } = useQuery({
    queryKey: ['employment-changes', id, (data?.staff as any)?.employes_id],
    queryFn: async () => {
      const employesId = (data?.staff as any)?.employes_id;
      if (!employesId) {
        return [];
      }
      
      const { data: changes, error } = await supabase
        .from('employes_changes')
        .select('*')
        .eq('employee_id', employesId)
        .eq('is_duplicate', false)  // 🎯 FILTER OUT DUPLICATES
        .order('detected_at', { ascending: true });
      
      
      return changes || [];
    },
    enabled: !!id && !!data && !!(data.staff as any)?.employes_id,
  });

  // 🔥 BUILD REAL EMPLOYMENT JOURNEY FROM employes_changes DATA
  const realEmploymentJourney = employmentChanges && employmentChanges.length > 0 ? (() => {
    // Extract salary changes
    const salaryChanges = employmentChanges
      .filter(c => c.change_type === 'salary_change')
      .map(c => ({
        date: c.detected_at,
        hourlyWage: 0, // TODO: Calculate from monthly
        monthlyWage: typeof c.new_value === 'number' ? c.new_value : 0,
        yearlyWage: typeof c.new_value === 'number' ? c.new_value * 12 : 0,
        increasePercent: c.change_percent || 0,
        reason: 'raise' as const
      }));

    // Extract contract changes
    const contractChanges = employmentChanges.filter(c => c.change_type === 'contract_change');
    const latestContract = contractChanges[contractChanges.length - 1];

    // Get first employment date
    const firstChange = employmentChanges[0];
    const firstDate = firstChange?.detected_at || new Date().toISOString();

    // Build termination notice from contract data
    // TODO: Extract real contract end date from metadata
    const terminationNotice = latestContract?.new_value === 'fixed_term' ? {
      shouldNotify: true,
      daysUntilDeadline: 6,
      notificationStatus: 'critical' as const,
      contractEndDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      notificationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      deadlineDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      penaltyDays: 0,
      penaltyAmount: 0
    } : null;

    return {
      employeeId: data?.staff.id || '',
      employeeName: data?.staff.full_name || '',
      email: data?.staff.email || '',
      employesId: (data?.staff as any)?.employes_id || null,
      totalContracts: contractChanges.length || 1,
      totalDurationMonths: Math.floor((new Date().getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24 * 30)),
      firstStartDate: firstDate,
      currentContract: null, // TODO: Build from contract changes
      contracts: [], // TODO: Build from contract changes
      chainRuleStatus: {
        warningLevel: 'safe' as const,
        message: '',
        contractsCount: contractChanges.length || 1,
        totalMonths: Math.floor((new Date().getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24 * 30)),
        requiresAction: false,
        totalContracts: contractChanges.length || 1,
        totalEmploymentMonths: Math.floor((new Date().getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24 * 30)),
        requiresPermanent: false
      },
      terminationNotice,
      salaryProgression: salaryChanges
    };
  })() : null;

  // Detect if intern based on Employes.nl salary data
  const isEmployeeIntern = employesProfile?.salaryHistory 
    ? checkIsIntern(employesProfile.salaryHistory) 
    : data?.staff.is_intern || false;

  // Modals state
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [reviewFormMode, setReviewFormMode] = useState<'create' | 'edit' | 'complete'>('create');
  const [selectedReviewId, setSelectedReviewId] = useState<string | undefined>();
  const [noteOpen, setNoteOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [locationEditorOpen, setLocationEditorOpen] = useState(false);
  const [showDetailedSalary, setShowDetailedSalary] = useState(false);
  const [showDetailedTax, setShowDetailedTax] = useState(false);
  const [showDetailedHistory, setShowDetailedHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'performance' | 'contracts'>('overview');
  
  // State for timeline event slide panel
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<TimelineEvent | null>(null);

  // Get current user role from authentication
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('staff');
  const [isUserManager, setIsUserManager] = useState(false);

  // Check user authentication and role on mount
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user is admin (with error handling for missing table)
        let isAdmin = false;
        try {
          const { data: userRoles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

          if (!error) {
            isAdmin = userRoles?.some(r => r.role === 'admin') || false;
          }
        } catch (error) {
          // Silently handled - user_roles table RLS needs configuration (see TODO_USER_ROLES_RLS.md)
        }
        
        if (isAdmin) {
          setCurrentUserRole('admin');
        } else {
          // Check if user is a manager of this staff member
          const { data: managerRecord } = await supabase
            .from('managers')
            .select('*')
            .eq('user_id', user.id)
            .eq('staff_id', id)
            .maybeSingle();
          
          if (managerRecord) {
            setCurrentUserRole('manager');
            setIsUserManager(true);
          }
        }
      }
    };
    
    checkUserRole();
  }, [id]);

  // Initialize staff documents on load
  useEffect(() => {
    if (id) {
      initializeStaffDocuments(id).catch(err => {
        console.error('[StaffProfile] Failed to initialize documents:', err);
      });
    }
  }, [id]);

  const handleCreateReview = () => {
    setReviewFormMode('create');
    setSelectedReviewId(undefined);
    setReviewFormOpen(true);
  };

  const handleEditReview = (reviewId: string) => {
    setReviewFormMode('edit');
    setSelectedReviewId(reviewId);
    setReviewFormOpen(true);
  };

  const handleCompleteReview = (reviewId: string) => {
    setReviewFormMode('complete');
    setSelectedReviewId(reviewId);
    setReviewFormOpen(true);
  };

  const handleReviewSaved = () => {
    qc.invalidateQueries({ queryKey: ["staffDetail", id] });
    qc.invalidateQueries({ queryKey: ["reviews"] });
    qc.invalidateQueries({ queryKey: ["staff-review-summary"] });
    setReviewFormOpen(false);
  };

  // Handle timeline event click - opens slide panel with event details
  const handleTimelineEventClick = (event: TimelineEvent) => {
    console.log('🎯 Timeline event clicked:', event);
    setSelectedTimelineEvent(event);
  };

  if (isLoading || !data) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  // Create timeline data
  const timelineItems = createTimelineFromStaffData(
    data.reviews,
    data.notes,
    data.certificates
  );

  return (
    <PageErrorBoundary>
      <div className="space-y-6">
        {/* 🎯 BIG NAME HEADER */}
        <div className="mb-2">
          <h1 className="text-4xl font-bold">{data.staff.full_name}</h1>
        </div>

      {/* Review due banner */}
      <ReviewDueBanner
        nextReviewDue={data.enrichedContract?.next_review_due}
        needsSix={data.enrichedContract?.needs_six_month_review}
        needsYearly={data.enrichedContract?.needs_yearly_review}
        onCreateReview={handleCreateReview}
      />

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className={`grid w-full ${isReviewSystemAvailable ? 'grid-cols-4' : 'grid-cols-2'}`}>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          {isReviewSystemAvailable && (
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reviews
              {staffReviews.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {staffReviews.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
          {isReviewSystemAvailable && (
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">

          {/* 🔥 REAL Employment Status Bar - Built from employes_changes */}
          {realEmploymentJourney && (
            <EmploymentStatusBar journey={realEmploymentJourney} />
          )}

          {/* Main content - 2 column layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Main information */}
            <div className="flex-1 space-y-6">
              {/* Action Panels - Knowledge & Milestones */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <KnowledgeProgressPanel 
                  staffId={data.staff.id}
                  onViewProgress={() => console.log('View knowledge progress')}
                />

                <MilestonesPanel 
                  staffId={data.staff.id}
                  contractStartDate={data.enrichedContract?.first_start}
                  onScheduleReview={(milestone) => console.log('Schedule milestone review:', milestone)}
                />
              </div>

              {/* Location Editor */}
              {locationEditorOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
                  <LocationEditor
                    staffId={data.staff.id}
                    staffName={data.staff.full_name}
                    currentLocation={data.staff.location}
                    onSuccess={() => {
                      setLocationEditorOpen(false);
                      qc.invalidateQueries({ queryKey: ["staffDetail", id] });
                    }}
                    onCancel={() => setLocationEditorOpen(false)}
                  />
                </div>
              )}

              {/* OLD: Phase 3 Employment Overview (commented out for Phase 4) */}
              {/* {employmentChanges && employmentChanges.length > 0 && (
                <EmploymentOverviewEnhanced 
                  staffName={data.staff.full_name}
                  detectedChanges={employmentChanges}
                />
              )} */}
              
              {/* NEW: Phase 4 Beautiful Timeline */}
              {employesId && (
                <SectionErrorBoundary sectionName="EmployeeTimeline">
                  <EmployeeTimeline 
                    employeeId={employesId} 
                    onEventClick={handleTimelineEventClick}
                  />
                </SectionErrorBoundary>
              )}

              {/* Collapsible: Detailed Employment History */}
              {employesProfile?.employments && employesProfile.employments.length > 0 && (
                <Collapsible open={showDetailedHistory} onOpenChange={setShowDetailedHistory}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between mb-2">
                      <span>Employment History Details</span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${showDetailedHistory ? 'rotate-90' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <EmployesEmploymentHistoryPanel employments={employesProfile.employments} />
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Collapsible: Detailed Tax Information */}
              <Collapsible open={showDetailedTax} onOpenChange={setShowDetailedTax}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between mb-2">
                    <span>Tax & Insurance Details</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${showDetailedTax ? 'rotate-90' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <EmployesTaxInfoPanel taxInfo={employesProfile?.taxInfo || null} />
                </CollapsibleContent>
              </Collapsible>

              {/* Collapsible: Detailed Salary Progression */}
              {/* Salary Progression Analytics - REMOVED: Using new employes_changes data */}

              {/* Activity Timeline */}
              <StaffTimeline items={timelineItems} />
            </div>

            {/* Right Column - Quick actions & summary */}
            <div className="w-full lg:w-80 space-y-6">
              {/* 🎯 COMPACT PROFILE CARD - Top of right column */}
              <SectionErrorBoundary sectionName="CompactProfileCard">
                <CompactProfileCard
                  staffName={data.staff.full_name}
                  personalData={employesProfile?.personal || null}
                />
              </SectionErrorBoundary>

              {/* Compact Salary Card - NEW: Using employes_changes data */}
              {employmentChanges && employmentChanges.length > 0 && (() => {
                const salaryChanges = employmentChanges.filter(c => c.change_type === 'salary_change');
                if (salaryChanges.length === 0) return null;

                const firstSalary = salaryChanges[0];
                const latestSalary = salaryChanges[salaryChanges.length - 1];
                const totalIncrease = (latestSalary.new_value as number) - (firstSalary.old_value as number);
                const percentageIncrease = ((totalIncrease / (firstSalary.old_value as number)) * 100).toFixed(1);
                const numberOfRaises = salaryChanges.filter(s => (s.change_amount || 0) > 0).length;

                return (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Salary Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-muted-foreground">Total Growth</span>
                          </div>
                          <div className="text-xl font-bold text-green-600">+{percentageIncrease}%</div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Raises</span>
                          </div>
                          <div className="text-xl font-bold">{numberOfRaises}</div>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="text-sm font-medium mb-1">Current Salary</div>
                        <div className="text-2xl font-bold">
                          {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(latestSalary.new_value as number)}
                        </div>
                        <div className="text-xs text-muted-foreground">per month</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Compact Tax Card */}
              {employesProfile?.taxInfo && (
                <CompactTaxCard
                  taxInfo={employesProfile.taxInfo}
                  onViewDetails={() => setShowDetailedTax(true)}
                />
              )}

              {/* Location Panel */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocationEditorOpen(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.staff.location ? (
                      (() => {
                        const locations: Record<string, { name: string; address: string }> = {
                          'rbw': { name: 'Rijnsburgerweg 35', address: 'Rijnsburgerweg 35' },
                          'zml': { name: 'Zeemanlaan 22a', address: 'Zeemanlaan 22a' },
                          'lrz': { name: 'Lorentzkade 15a', address: 'Lorentzkade 15a' },
                          'rb3&5': { name: 'Rijnsburgerweg 3&5', address: 'Rijnsburgerweg 3&5' }
                        };
                        const location = locations[data.staff.location];
                        return location ? location.name : data.staff.location;
                      })()
                    ) : (
                      "No location assigned"
                    )}
                  </p>
                </CardContent>
              </Card>

              {/* Enhanced Review Summary Panel */}
              {isReviewSystemAvailable ? (
                <EnhancedReviewSummaryPanel
                  staffId={data.staff.id}
                  staffSummary={staffSummary}
                  latestReview={staffReviews[0]}
                  onCreateReview={handleCreateReview}
                  onViewAnalytics={() => setActiveTab('performance')}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Performance Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">Review System Loading</p>
                      <p className="text-sm">Performance review functionality will be available shortly.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Document Status Panel */}
              <DocumentStatusPanel
                staffId={data.staff.id}
              />

              {/* Intern Meta Panel (only for interns) */}
              <InternMetaPanel
                staff={data.staff}
                enrichedData={data.enrichedContract}
              />
            </div>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6, 7].map(i => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : data?.staff?.id ? (
            <StaffDocumentsTab staffId={data.staff.id} />
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Staff data not available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reviews Tab */}
        {isReviewSystemAvailable && (
          <TabsContent value="reviews">
            <SectionErrorBoundary sectionName="ReviewsTab">
              <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Review Management</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage {data.staff.full_name}'s performance reviews and schedule new ones
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setScheduleDialogOpen(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule for Later
                  </Button>
                  <Button 
                    onClick={handleCreateReview}
                    className="bg-gradient-primary"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Complete Review Now
                  </Button>
                </div>
              </div>

              {/* Reviews Calendar */}
              <ReviewCalendar className="mb-6" />

            {/* Review History */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Review History</h3>
                {reviewsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : staffReviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-3">No reviews yet</p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScheduleDialogOpen(true)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Review
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCreateReview}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Complete Now
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {staffReviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  review.star_rating && i < review.star_rating
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div>
                            <div className="font-medium">{review.review_type} Review</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(review.review_date).toLocaleDateString()} • Status: {review.status}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={review.status === 'completed' ? 'default' : 'secondary'}>
                            {review.status}
                          </Badge>
                          {review.status !== 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteReview(review.id)}
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditReview(review.id)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
              </div>
            </SectionErrorBoundary>
          </TabsContent>
        )}

        {isReviewSystemAvailable && (
          <TabsContent value="performance">
            <SectionErrorBoundary sectionName="PerformanceAnalytics">
              <PerformanceAnalytics staffId={id} />
            </SectionErrorBoundary>
          </TabsContent>
        )}
      </Tabs>

      {/* Phase 2 Review Form Modal */}
      {reviewFormOpen && isReviewSystemAvailable && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ReviewForm
              reviewId={selectedReviewId}
              staffId={data.staff.id}
              mode={reviewFormMode}
              onSave={handleReviewSaved}
              onCancel={() => setReviewFormOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Schedule Review Dialog */}
      {isReviewSystemAvailable && (
        <ScheduleReviewDialog
          isOpen={scheduleDialogOpen}
          onClose={() => setScheduleDialogOpen(false)}
          staffId={data.staff.id}
          staffName={data.staff.full_name}
        />
      )}

      {/* Note Modal */}
      {noteOpen && (
        <NoteModal
          staffId={data.staff.id}
          onClose={() => setNoteOpen(false)}
          onSaved={async () => {
            await qc.invalidateQueries({ queryKey: ["staffDetail", id] });
            setNoteOpen(false);
          }}
        />
      )}

      {/* Certificate Modal */}
      {certOpen && (
        <CertificateModal
          staffId={data.staff.id}
          onClose={() => setCertOpen(false)}
          onSaved={async () => {
            await qc.invalidateQueries({ queryKey: ["staffDetail", id] });
            setCertOpen(false);
          }}
        />
      )}

      {/* Event Slide Panel - Shows contract details/addendums when timeline event is clicked */}
      <EventSlidePanel
        event={selectedTimelineEvent}
        staffId={id}
        staffName={data?.staff?.full_name}
        onClose={() => setSelectedTimelineEvent(null)}
      />
      </div>
    </PageErrorBoundary>
  );
}

// Enhanced Review Summary Panel Component
function EnhancedReviewSummaryPanel({
  staffId,
  staffSummary,
  latestReview,
  onCreateReview,
  onViewAnalytics
}: {
  staffId: string;
  staffSummary: any;
  latestReview: any;
  onCreateReview: () => void;
  onViewAnalytics: () => void;
}) {
  const renderStarRating = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            rating >= star ? 'text-yellow-500 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating?.toFixed(1) || '—'}</span>
    </div>
  );

  const getPerformanceLevel = (rating: number) => {
    if (rating >= 4.5) return { label: 'Exceptional', color: 'bg-green-100 text-green-800 border-green-300' };
    if (rating >= 3.5) return { label: 'Exceeds', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (rating >= 2.5) return { label: 'Meets', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    if (rating >= 1.5) return { label: 'Below', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    return { label: 'Unsatisfactory', color: 'bg-red-100 text-red-800 border-red-300' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Performance Summary
          </div>
          <Button variant="outline" size="sm" onClick={onViewAnalytics}>
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{staffSummary?.total_reviews || 0}</div>
            <div className="text-xs text-muted-foreground">Total Reviews</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              {staffSummary?.avg_star_rating ? renderStarRating(staffSummary.avg_star_rating) : '—'}
            </div>
            <div className="text-xs text-muted-foreground">Avg Rating</div>
          </div>
        </div>

        {/* Performance Level Badge */}
        {staffSummary?.avg_star_rating && (
          <div className="flex justify-center">
            <Badge className={getPerformanceLevel(staffSummary.avg_star_rating).color}>
              {getPerformanceLevel(staffSummary.avg_star_rating).label}
            </Badge>
          </div>
        )}

        {/* Latest Review */}
        {latestReview && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Latest Review</h4>
            <div className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {latestReview.review_type?.replace('_', ' ')} Review
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(latestReview.review_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {latestReview.star_rating && renderStarRating(latestReview.star_rating)}
                <Badge variant={latestReview.status === 'completed' ? 'default' : 'secondary'}>
                  {latestReview.status}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* 5-Star Performance */}
        {staffSummary?.five_star_count > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-yellow-800">
              <Star className="h-4 w-4 fill-current" />
              <span>{staffSummary.five_star_count} five-star review{staffSummary.five_star_count > 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Overdue Alert */}
        {staffSummary?.overdue_count > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-red-800">
              <Clock className="h-4 w-4" />
              <span>{staffSummary.overdue_count} overdue review{staffSummary.overdue_count > 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button variant="default" size="sm" className="w-full" onClick={onCreateReview}>
            Schedule New Review
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={onViewAnalytics}>
            <TrendingUp className="h-4 w-4 mr-1" />
            View Performance Trends
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NoteModal({
  staffId, onClose, onSaved,
}: { staffId: string; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<string>("note");
  const [note, setNote] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    try {
      setSaving(true);
      await addNote({ staff_id: staffId, note_type: type, note });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-md p-4 w-full max-w-md space-y-3">
        <div className="text-lg font-semibold">Add Note</div>
        <div className="grid gap-2">
          <label className="text-sm">
            Type
            <select
              className="w-full border rounded px-2 py-1 mt-1 bg-background"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="positive">positive</option>
              <option value="concern">concern</option>
              <option value="warning">warning</option>
              <option value="note">note</option>
            </select>
          </label>
          <label className="text-sm">
            Note
            <textarea
              className="w-full border rounded px-2 py-1 mt-1 bg-background"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CertificateModal({
  staffId, onClose, onSaved,
}: { staffId: string; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (!file) return;
    try {
      setSaving(true);
      await uploadCertificate({ staff_id: staffId, title: title || "Certificate", file });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-md p-4 w-full max-w-md space-y-3">
        <div className="text-lg font-semibold">Upload Certificate</div>
        <div className="grid gap-2">
          <label className="text-sm">
            Title
            <input
              className="w-full border rounded px-2 py-1 mt-1 bg-background"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="First Aid, VOG, Diploma, …"
            />
          </label>
          <label className="text-sm">
            File
            <input
              className="w-full border rounded px-2 py-1 mt-1 bg-background"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={onSubmit} disabled={!file || saving}>
            {saving ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}
