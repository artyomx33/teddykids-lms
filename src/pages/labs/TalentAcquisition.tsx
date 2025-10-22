/**
 * 🧪 TALENT ACQUISITION LABS 2.0
 * Advanced hiring pipeline with AI-powered candidate matching
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  UserPlus,
  Brain,
  BarChart3,
  Settings,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Zap,
  Eye,
  ChevronRight,
  FileText,
  MessageSquare,
  Calendar,
  Award,
  Workflow,
  PlusCircle,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import new assessment components
import CandidateAssessmentDashboard from "@/components/assessment/CandidateAssessmentDashboard";
import AssessmentAnalytics from "@/components/assessment/AssessmentAnalytics";
import AiInsightsEngine from "@/components/assessment/AiInsightsEngine";
import ApprovalWorkflowSystem from "@/components/assessment/ApprovalWorkflowSystem";
import DiscAssessmentWidget from "@/modules/talent-acquisition/components/DiscAssessmentWidget";
import type { CandidateAiInsights, CandidateDashboardView } from "@/types/assessmentEngine";

// Mock data - in real implementation, this would come from APIs
const mockInsights: CandidateAiInsights = {
  id: "mock",
  candidate_id: "",
  personality_profile: {
    openness: 80,
    conscientiousness: 85,
    extraversion: 70,
    agreeableness: 88,
    neuroticism: 25,
    emotional_stability: 78,
    communication_style: "collaborative",
    work_preferences: "team",
    stress_tolerance: "high"
  },
  competency_analysis: {
    childcare_expertise: 82,
    educational_skills: 76,
    communication: 90,
    problem_solving: 84,
    leadership_potential: 68,
    adaptability: 86,
    emotional_intelligence: 92,
    technical_skills: 65,
    cultural_alignment: 95
  },
  cultural_fit_score: 92,
  role_suitability_score: 88,
  hiring_recommendation: "hire",
  recommendation_confidence: 0.82,
  recommendation_reasoning: "Strong cultural alignment and excellent communication skills with high emotional intelligence.",
  key_strengths: [
    "Collaborative team player",
    "High emotional intelligence",
    "Strong childcare expertise"
  ],
  potential_concerns: [
    "Needs additional technical tooling training"
  ],
  development_suggestions: [
    "Mentorship with senior educator",
    "Enroll in digital tools workshop"
  ],
  interview_focus_areas: [
    "Handling high-stress childcare scenarios",
    "Experience with diverse learning needs"
  ],
  ai_model_version: "labs-2.0",
  generated_at: new Date().toISOString(),
  created_at: new Date().toISOString()
};

const mockCandidates: Array<CandidateDashboardView & { aiInsights?: CandidateAiInsights }> = [
  {
    id: '1',
    full_name: 'Emma van der Berg',
    email: 'emma.vandenberg@email.com',
    position_applied: 'Childcare Professional',
    overall_status: 'completed',
    overall_score: 87,
    application_date: '2025-10-01',
    assessment_status: 'completed',
    percentage_score: 87,
    passed: true,
    ai_match_score: 94,
    role_category: 'childcare_staff',
    application_source: 'widget',
    aiInsights: mockInsights
  },
  {
    id: '2',
    full_name: 'Lucas Müller',
    email: 'lucas.muller@email.com',
    position_applied: 'Lead Educator',
    overall_status: 'in_progress',
    overall_score: 92,
    application_date: '2025-09-28',
    assessment_status: 'in_progress',
    percentage_score: 92,
    passed: true,
    ai_match_score: 98,
    role_category: 'childcare_staff',
    application_source: 'widget'
  },
  {
    id: '3',
    full_name: 'Sophie Chen',
    email: 'sophie.chen@email.com',
    position_applied: 'Assistant Childcare Worker',
    overall_status: 'in_progress',
    overall_score: null,
    application_date: '2025-10-02',
    assessment_status: 'in_progress',
    percentage_score: 65,
    passed: false,
    ai_match_score: 76,
    role_category: 'childcare_staff',
    application_source: 'widget'
  }
];

const mockAnalytics = {
  totalApplications: 156,
  activeApplications: 23,
  hiredThisMonth: 8,
  averageTimeToHire: 18,
  conversionRate: 32,
  topPerformingSource: 'Widget'
};

const mockPipeline = [
  { stage: 'Applied', count: 45, color: 'blue' },
  { stage: 'Screening', count: 23, color: 'yellow' },
  { stage: 'Assessment', count: 18, color: 'orange' },
  { stage: 'Interview', count: 12, color: 'purple' },
  { stage: 'Offer', count: 6, color: 'green' },
  { stage: 'Hired', count: 8, color: 'emerald' }
];

export default function TalentAcquisition() {
  const [selectedTab, setSelectedTab] = useState("candidates");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [showAddApplicant, setShowAddApplicant] = useState(false);
  const [showWidgetPreview, setShowWidgetPreview] = useState(false);
  const [candidates, setCandidates] = useState(mockCandidates);
  const [loading, setLoading] = useState(false);

  // 🔥 FETCH REAL CANDIDATES FROM DATABASE (Luna-approved schema)
  const fetchCandidates = async () => {
    console.log('🔍 Fetching candidates from database...');
    setLoading(true);
    try {
      const { data: realCandidates, error } = await supabase
        .from('candidates')
        .select('*')
        .order('application_date', { ascending: false });

      console.log('📊 Supabase response:', { 
        candidateCount: realCandidates?.length || 0, 
        error: error ? error.message : 'none',
        errorDetails: error 
      });

      if (error) {
        console.error('❌ Error fetching candidates:', error);
        console.error('Error code:', error.code, 'Error hint:', error.hint);
        // Keep using mock data on error
        setLoading(false);
        return;
      }

      if (realCandidates && realCandidates.length > 0) {
        // Transform DB candidates to match dashboard format
        const transformedCandidates = realCandidates.map(candidate => ({
          id: candidate.id,
          full_name: candidate.full_name,
          email: candidate.email,
          phone: candidate.phone || '',
          position: candidate.role_applied || candidate.position_applied || 'Unknown',
          status: mapStatusToDashboard(candidate.status),
          disc_profile: candidate.disc_profile,
          assessment_score: candidate.overall_score || 0,
          cultural_fit_score: 85, // Would be calculated from disc_profile
          interview_date: candidate.trial_date || undefined,
          applied_date: candidate.application_date || new Date().toISOString().split('T')[0],
          aiInsights: mockInsights, // For now, use mock AI insights
          // Additional fields from Luna's schema
          redflag_count: candidate.redflag_count || 0,
          group_fit: candidate.group_fit || 'Unknown',
          badge_title: candidate.badge_title,
          badge_emoji: candidate.badge_emoji,
          primary_disc_color: candidate.primary_disc_color,
          secondary_disc_color: candidate.secondary_disc_color,
        }));

        console.log('✅ Fetched real candidates from DB:', transformedCandidates.length);
        console.log('First candidate:', transformedCandidates[0]);
        setCandidates(transformedCandidates as any);
      } else {
        console.log('📦 No candidates in DB yet, using mock data');
      }
    } catch (err) {
      console.error('💥 Failed to fetch candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch candidates on mount
  useEffect(() => {
    fetchCandidates();
  }, []); // Run once on mount

  // Helper: Map Luna's 6-stage status to dashboard status
  function mapStatusToDashboard(status: string): string {
    const statusMap: Record<string, string> = {
      'application_received': 'assessment_pending',
      'verified': 'assessment_completed',
      'trial_invited': 'interview_scheduled',
      'trial_completed': 'assessment_completed',
      'decision_finalized': 'assessment_completed',
      'offer_signed': 'hired',
    };
    return statusMap[status] || 'assessment_pending';
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assessment_completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'interview_scheduled': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'assessment_pending': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'hired': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <UserPlus className="h-12 w-12 text-purple-400" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            Talent Acquisition Engine
          </h1>
          <Brain className="h-8 w-8 text-yellow-400 animate-pulse" />
        </div>
        <p className="text-xl text-purple-300 max-w-3xl mx-auto">
          AI-powered hiring pipeline with intelligent candidate matching,
          automated assessments, and predictive analytics for optimal talent acquisition.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">{mockAnalytics.totalApplications}</div>
            <div className="text-xs text-purple-300">Total Applications</div>
          </CardContent>
        </Card>
        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-400">{mockAnalytics.activeApplications}</div>
            <div className="text-xs text-purple-300">Active Applications</div>
          </CardContent>
        </Card>
        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">{mockAnalytics.hiredThisMonth}</div>
            <div className="text-xs text-purple-300">Hired This Month</div>
          </CardContent>
        </Card>
        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">{mockAnalytics.averageTimeToHire}</div>
            <div className="text-xs text-purple-300">Avg. Days to Hire</div>
          </CardContent>
        </Card>
        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-400">{mockAnalytics.conversionRate}%</div>
            <div className="text-xs text-purple-300">Conversion Rate</div>
          </CardContent>
        </Card>
        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">Widget</div>
            <div className="text-xs text-purple-300">Top Source</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-black/30 border-purple-500/30">
          <TabsTrigger value="candidates" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Candidates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white">
            <Brain className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="approval" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white">
            <Workflow className="h-4 w-4 mr-2" />
            Approval
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white">
            <Target className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
        </TabsList>

        {/* Candidates Tab - Full Assessment Dashboard */}
        <TabsContent value="candidates" className="space-y-6">
          {/* Add New Applicant Button */}
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Candidate Management</h3>
                  <p className="text-purple-300">Add new candidates or manage existing applications</p>
                </div>
                <Button
                  onClick={() => setShowWidgetPreview(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Applicant
                </Button>
              </div>
            </CardContent>
          </Card>

          <CandidateAssessmentDashboard
            candidates={candidates}
            onCandidateSelect={(candidateId) => {
              setSelectedCandidateId(candidateId);
              setSelectedTab('ai-insights');
            }}
            onStatusChange={(candidateId, newStatus) => {
              console.log('Status change:', candidateId, newStatus);
              // Handle status updates
              fetchCandidates(); // Refetch after status change
            }}
            onReviewAssign={(candidateId, reviewerId) => {
              console.log('Review assign:', candidateId, reviewerId);
              // Handle review assignment
            }}
            onBulkAction={(candidateIds, action) => {
              console.log('Bulk action:', candidateIds, action);
              // Handle bulk actions
            }}
          />
        </TabsContent>

        {/* Analytics Tab - Comprehensive Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <AssessmentAnalytics
            dateRange="month"
            onDateRangeChange={(range) => console.log('Date range change:', range)}
            onRoleCategoryChange={(category) => console.log('Role category change:', category)}
          />
        </TabsContent>

        {/* AI Insights Tab - Individual Candidate Analysis */}
        <TabsContent value="ai-insights" className="space-y-6">
          {selectedCandidateId ? (
            <AiInsightsEngine
              candidate={undefined}
              candidateId={selectedCandidateId}
              onGenerateInsights={async (candidateId) => {
                console.log('Generate insights for:', candidateId);
                // Implement AI insights generation
                const candidate = candidates.find(c => c.id === candidateId);
                return candidate?.aiInsights ?? undefined;
              }}
              onUpdateRecommendation={async (candidateId, recommendation, reasoning) => {
                console.log('Update recommendation:', candidateId, recommendation, reasoning);
                // Handle recommendation updates
              }}
            />
          ) : (
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardContent className="p-12 text-center">
                <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a Candidate</h3>
                <p className="text-purple-300 mb-4">
                  Choose a candidate from the Candidates tab to view AI-powered insights and recommendations
                </p>
                <Button
                  onClick={() => setSelectedTab('candidates')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Candidates
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Approval Tab - Workflow Management */}
        <TabsContent value="approval" className="space-y-6">
          {selectedCandidateId ? (
            <ApprovalWorkflowSystem
              candidate={candidates.find(c => c.id === selectedCandidateId) as any}
              onApprove={async (candidateId, staffData) => {
                console.log('Approve candidate:', candidateId, staffData);
                // Handle approval and staff creation
              }}
              onReject={async (candidateId, reason) => {
                console.log('Reject candidate:', candidateId, reason);
                // Handle rejection
              }}
              onRequestChanges={async (candidateId, changes) => {
                console.log('Request changes:', candidateId, changes);
                // Handle change requests
              }}
              onScheduleInterview={async (candidateId, interviewData) => {
                console.log('Schedule interview:', candidateId, interviewData);
                // Handle interview scheduling
              }}
            />
          ) : (
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardContent className="p-12 text-center">
                <Workflow className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a Candidate for Approval</h3>
                <p className="text-purple-300 mb-4">
                  Choose a candidate to manage their approval workflow and staff integration
                </p>
                <Button
                  onClick={() => setSelectedTab('candidates')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Candidates
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dashboard Tab - Overview */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Pipeline Overview */}
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                Hiring Pipeline Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {mockPipeline.map((stage) => (
                  <div key={stage.stage} className="text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 border-2",
                      stage.color === 'blue' && "bg-blue-500/20 border-blue-500/50",
                      stage.color === 'yellow' && "bg-yellow-500/20 border-yellow-500/50",
                      stage.color === 'orange' && "bg-orange-500/20 border-orange-500/50",
                      stage.color === 'purple' && "bg-purple-500/20 border-purple-500/50",
                      stage.color === 'green' && "bg-green-500/20 border-green-500/50",
                      stage.color === 'emerald' && "bg-emerald-500/20 border-emerald-500/50"
                    )}>
                      <span className="text-xl font-bold text-white">{stage.count}</span>
                    </div>
                    <div className="text-sm text-purple-300">{stage.stage}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => setSelectedTab('templates')}
                    className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <PlusCircle className="h-4 w-4 mr-3" />
                    Create New Assessment Template
                  </Button>
                  <Button
                    onClick={() => setSelectedTab('candidates')}
                    variant="outline"
                    className="w-full justify-start border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Review Pending Candidates
                  </Button>
                  <Button
                    onClick={() => setSelectedTab('analytics')}
                    variant="outline"
                    className="w-full justify-start border-green-500/30 text-green-300 hover:bg-green-500/20"
                  >
                    <BarChart3 className="h-4 w-4 mr-3" />
                    View Analytics Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-yellow-400" />
                  AI System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300">Assessment AI</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300">Scoring Engine</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Running
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300">Analytics Pipeline</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300">Model Version</span>
                    <span className="text-white text-sm">v2.1.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Widget Preview */}
      <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Live Widget Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-medium mb-2">Widget Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Status:</span>
                  <span className="text-green-400">Live & Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Embedded on:</span>
                  <span className="text-white">www.teddykids.nl</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Daily Applications:</span>
                  <span className="text-blue-400">12 avg</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Widget Embed Code
                </Button>
                <Button
                  onClick={() => setShowWidgetPreview(true)}
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Widget
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DISC Assessment Widget */}
      {showWidgetPreview && (
        <DiscAssessmentWidget
          isPreview={true}
          onComplete={(result) => {
            console.log('Assessment completed:', result);
            setShowWidgetPreview(false);
            // 🔥 REFETCH candidates to show the newly submitted one!
            setTimeout(() => fetchCandidates(), 500); // Small delay to ensure DB write completes
          }}
          onClose={() => setShowWidgetPreview(false)}
        />
      )}
    </div>
  );
}