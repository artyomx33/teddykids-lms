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
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewDueBanner } from "@/components/staff/ReviewDueBanner";
import { StaffProfileHeader } from "@/components/staff/StaffProfileHeader";
import { StaffTimeline } from "@/components/staff/StaffTimeline";
import { DocumentStatusPanel } from "@/components/staff/DocumentStatusPanel";
import { InternMetaPanel } from "@/components/staff/InternMetaPanel";
import { KnowledgeProgressPanel } from "@/components/staff/KnowledgeProgressPanel";
import { MilestonesPanel } from "@/components/staff/MilestonesPanel";
import { StaffContractsPanel } from "@/components/staff/StaffContractsPanel";
import { LocationEditor } from "@/components/staff/LocationEditor";
import { createTimelineFromStaffData } from "@/lib/staff-timeline";
import { UserRole } from "@/lib/staff-contracts";
import { MapPin, Edit, Star, BarChart3, Calendar, Clock, TrendingUp, FileText, Map } from "lucide-react";

// Phase 2 Review Components
import { useReviews, useStaffReviewSummary, usePerformanceTrends } from "@/lib/hooks/useReviews";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { PerformanceAnalytics } from "@/components/reviews/PerformanceAnalytics";
import { ReviewCalendar } from "@/components/reviews/ReviewCalendar";

// Dutch Labor Law Components
import { ContractTimelineVisualization } from "@/components/employes/ContractTimelineVisualization";
import { SalaryProgressionAnalytics } from "@/components/employes/SalaryProgressionAnalytics";
import { buildEmploymentJourney } from "@/lib/employesContracts";

export default function StaffProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<StaffDetail>({
    queryKey: ["staffDetail", id],
    queryFn: () => fetchStaffDetail(id!),
    enabled: !!id,
  });

  // Phase 2 Review Data (with error handling for missing tables)
  const { data: staffReviews = [], isLoading: reviewsLoading, error: reviewsError } = useReviews({ staffId: id });
  const { data: staffSummary, error: summaryError } = useStaffReviewSummary(id);
  const { data: performanceTrends = [], error: trendsError } = usePerformanceTrends(id || '');

  // Check if review system is available
  const isReviewSystemAvailable = !reviewsError && !summaryError && !trendsError;

  // Employment Journey Data (Dutch Labor Law)
  const { data: employmentJourney, isLoading: journeyLoading } = useQuery({
    queryKey: ['employment-journey', id],
    queryFn: () => buildEmploymentJourney(id!),
    enabled: !!id,
  });
  // Modals state
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewFormMode, setReviewFormMode] = useState<'create' | 'edit' | 'complete'>('create');
  const [selectedReviewId, setSelectedReviewId] = useState<string | undefined>();
  const [noteOpen, setNoteOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [locationEditorOpen, setLocationEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'performance' | 'contracts'>('overview');

  // TODO: Get current user role from authentication/context
  // For now, defaulting to 'admin' - this should be replaced with actual user role
  const currentUserRole: UserRole = 'admin';
  const isUserManager = data?.staff.role === 'manager'; // Simplified logic

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
    <div className="space-y-6">
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
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Employment Journey
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
        <TabsContent value="overview">
          <div className="flex gap-6">
            {/* Left Column - Flexible width */}
            <div className="flex-1 space-y-6">
          {/* Enhanced Profile Header */}
          <StaffProfileHeader
            staff={data.staff}
            enrichedData={data.enrichedContract}
            firstContractDate={data.firstContractDate}
            documentStatus={data.documentStatus ? {
              missing_count: data.documentStatus.missing_count,
              total_docs: 7
            } : null}
          />

          {/* Employment Journey Button */}
          {employmentJourney && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Employment Journey Map</h3>
                    <p className="text-sm text-muted-foreground">
                      View complete timeline, contracts, and compliance status
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate(`/employment-journey/${id}`)}
                    className="gap-2"
                  >
                    <Map className="h-4 w-4" />
                    View Journey
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Contracts Panel */}
          <StaffContractsPanel
            staffId={data.staff.id}
            staffName={data.staff.full_name}
            contracts={data.contracts}
            currentUserRole={currentUserRole}
            isUserManager={isUserManager}
            onRefresh={() => qc.invalidateQueries({ queryKey: ["staffDetail", id] })}
          />

              {/* Activity Timeline */}
              <StaffTimeline items={timelineItems} />
            </div>

            {/* Right Column - Fixed width same as Document Status */}
            <div className="w-80 space-y-4">
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
                documentsStatus={data.documentStatus}
              />

              {/* Intern Meta Panel (only for interns) */}
              <InternMetaPanel
                staff={data.staff}
                enrichedData={data.enrichedContract}
              />
            </div>
          </div>
        </TabsContent>

        {/* Employment Journey Tab - Dutch Labor Law Compliance */}
        <TabsContent value="contracts">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Employment Journey & Contract Timeline</h2>
              <p className="text-sm text-muted-foreground">
                Complete contract history with Dutch labor law compliance tracking (Chain Rule & Termination Notices)
              </p>
            </div>

            {journeyLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : employmentJourney ? (
              <div className="space-y-6">
                <ContractTimelineVisualization journey={employmentJourney} />
                <SalaryProgressionAnalytics journey={employmentJourney} />
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No employment data available</p>
                    <p className="text-sm">Contract history will appear here once data is synced from Employes.nl</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        {/* Reviews Tab */}
        {isReviewSystemAvailable && (
          <TabsContent value="reviews">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Review Management</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage {data.staff.full_name}'s performance reviews and schedule new ones
                  </p>
                </div>
                <Button onClick={handleCreateReview}>
                  Schedule New Review
                </Button>
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
                    <p>No reviews yet</p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={handleCreateReview}
                    >
                      Schedule First Review
                    </Button>
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
        </TabsContent>
        )}

        {/* Performance Analytics Tab */}
        {isReviewSystemAvailable && (
          <TabsContent value="performance">
            <PerformanceAnalytics staffId={id} />
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
    </div>
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
