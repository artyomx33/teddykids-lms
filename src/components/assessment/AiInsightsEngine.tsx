/**
 * 🧪 AI INSIGHTS ENGINE - LABS 2.0
 * Advanced AI-powered candidate analysis and hiring recommendations
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  TrendingDown,
  Heart,
  Users,
  Zap,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Clock,
  Award,
  Lightbulb,
  Shield,
  Activity,
  PieChart,
  BarChart3,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Send,
  RefreshCw,
  Download,
  Filter,
  Settings,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CandidateAiInsights,
  PersonalityProfile,
  CompetencyAnalysis,
  CandidateDashboardView,
  HiringRecommendation,
  AssessmentRoleCategory,
  ROLE_CATEGORY_LABELS
} from "@/types/assessmentEngine";
import { useCandidate } from '@/hooks/talent/useCandidates';
import { useAiInsights } from '@/hooks/talent/useAiInsights';
import { logger } from '@/lib/logger';

interface AiInsightsEngineProps {
  candidateId?: string | null;
  candidate?: CandidateDashboardView;
  insights?: CandidateAiInsights;
  onGenerateInsights?: (candidateId: string) => Promise<CandidateAiInsights>;
  onUpdateRecommendation?: (candidateId: string, recommendation: HiringRecommendation, reasoning: string) => Promise<void>;
  onBack?: () => void; // Navigation back to candidates
  className?: string;
}

// NO MORE MOCKS - Real data only! 🎯

export default function AiInsightsEngine({
  candidateId,
  candidate: candidateProp,
  insights: insightsProp,
  onGenerateInsights,
  onUpdateRecommendation,
  onBack,
  className
}: AiInsightsEngineProps) {
  // USE REAL DATA FROM HOOKS - NO MOCK FALLBACK! 🎯
  const { candidate: realCandidate, loading: candidateLoading } = useCandidate(candidateId);
  const { insights: realInsights, loading: insightsLoading, generateInsights } = useAiInsights(candidateId);
  
  // Use real data from hooks, fallback to props only
  const candidate = realCandidate || candidateProp;
  const insights = realInsights || insightsProp;
  const loading = candidateLoading || insightsLoading;
  
  logger.dev('🧠 [AiInsightsEngine] Rendering with REAL data:', {
    candidateId,
    hasRealCandidate: !!realCandidate,
    hasRealInsights: !!realInsights,
    loading,
    hasCandidate: !!candidate,
    hasInsights: !!insights
  });
  
  // Show empty state if no candidate
  if (!candidate && !loading) {
    return (
      <Card className={cn("bg-black/20 border-purple-500/30", className)}>
        <CardContent className="p-12 text-center">
          <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Candidate Selected
          </h3>
          <p className="text-purple-300 mb-4">
            Select a candidate from the dashboard to view AI-powered insights.
          </p>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              Back to Candidates
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customReasoning, setCustomReasoning] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerateInsights = async () => {
    if (!candidateId || !onGenerateInsights) return;

    setIsGenerating(true);
    try {
      await onGenerateInsights(candidateId);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateRecommendation = async (recommendation: HiringRecommendation) => {
    if (!candidateId || !onUpdateRecommendation) return;

    const reasoning = customReasoning || insights.recommendation_reasoning || '';
    await onUpdateRecommendation(candidateId, recommendation, reasoning);
    setCustomReasoning('');
  };

  const getRecommendationColor = (recommendation: HiringRecommendation) => {
    switch (recommendation) {
      case 'hire': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'interview': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'reassess': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'reject': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getRecommendationIcon = (recommendation: HiringRecommendation) => {
    switch (recommendation) {
      case 'hire': return ThumbsUp;
      case 'interview': return MessageSquare;
      case 'reassess': return RefreshCw;
      case 'reject': return ThumbsDown;
      default: return AlertTriangle;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const personalityTraits = [
    { key: 'openness', label: 'Openness to Experience', value: insights.personality_profile?.openness || 0 },
    { key: 'conscientiousness', label: 'Conscientiousness', value: insights.personality_profile?.conscientiousness || 0 },
    { key: 'extraversion', label: 'Extraversion', value: insights.personality_profile?.extraversion || 0 },
    { key: 'agreeableness', label: 'Agreeableness', value: insights.personality_profile?.agreeableness || 0 },
    { key: 'emotional_stability', label: 'Emotional Stability', value: insights.personality_profile?.emotional_stability || 0 }
  ];

  const competencyScores = [
    { key: 'childcare_expertise', label: 'Childcare Expertise', value: insights.competency_analysis?.childcare_expertise || 0 },
    { key: 'educational_skills', label: 'Educational Skills', value: insights.competency_analysis?.educational_skills || 0 },
    { key: 'communication', label: 'Communication', value: insights.competency_analysis?.communication || 0 },
    { key: 'problem_solving', label: 'Problem Solving', value: insights.competency_analysis?.problem_solving || 0 },
    { key: 'emotional_intelligence', label: 'Emotional Intelligence', value: insights.competency_analysis?.emotional_intelligence || 0 },
    { key: 'adaptability', label: 'Adaptability', value: insights.competency_analysis?.adaptability || 0 },
    { key: 'cultural_alignment', label: 'Cultural Alignment', value: insights.competency_analysis?.cultural_alignment || 0 }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl">
                {candidate.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              <Badge className={cn("text-xs", getRecommendationColor(insights.hiring_recommendation))}>
                <Brain className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{candidate.full_name}</h1>
            <p className="text-purple-300">{candidate.position_applied}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {ROLE_CATEGORY_LABELS[candidate.role_category]}
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Score: {candidate.overall_score}%
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Simple View' : 'Advanced'}
          </Button>
          <Button
            variant="outline"
            onClick={handleGenerateInsights}
            disabled={isGenerating}
            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300 mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerate AI Analysis
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="border-green-500/30 text-green-300 hover:bg-green-500/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* AI Recommendation Summary */}
      <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <Brain className="h-8 w-8 text-purple-400" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">AI Hiring Recommendation</h2>
                  <p className="text-sm text-purple-300">
                    Generated {new Date(insights.generated_at).toLocaleDateString()} •
                    Confidence: {Math.round((insights.recommendation_confidence || 0) * 100)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-purple-300 mb-2">Recommendation</h3>
                    <Badge className={cn("text-lg px-4 py-2", getRecommendationColor(insights.hiring_recommendation))}>
                      {React.createElement(getRecommendationIcon(insights.hiring_recommendation), { className: "h-4 w-4 mr-2" })}
                      {insights.hiring_recommendation.charAt(0).toUpperCase() + insights.hiring_recommendation.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                      <div className={cn("text-2xl font-bold", getScoreColor(insights.cultural_fit_score || 0))}>
                        {insights.cultural_fit_score}%
                      </div>
                      <div className="text-xs text-purple-300">Cultural Fit</div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                      <div className={cn("text-2xl font-bold", getScoreColor(insights.role_suitability_score || 0))}>
                        {insights.role_suitability_score}%
                      </div>
                      <div className="text-xs text-purple-300">Role Suitability</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-purple-300">Key Strengths</h3>
                  <div className="space-y-2">
                    {insights.key_strengths?.slice(0, 3).map((strength, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-white">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-purple-300">Areas for Development</h3>
                  <div className="space-y-2">
                    {insights.potential_concerns?.slice(0, 3).map((concern, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-white">{concern}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h3 className="text-sm font-medium text-purple-300 mb-2">AI Reasoning</h3>
                <p className="text-sm text-white leading-relaxed">
                  {insights.recommendation_reasoning}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-black/30 border-purple-500/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/30">
            <Eye className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="personality" className="data-[state=active]:bg-purple-500/30">
            <Heart className="h-4 w-4 mr-2" />
            Personality
          </TabsTrigger>
          <TabsTrigger value="competencies" className="data-[state=active]:bg-purple-500/30">
            <Target className="h-4 w-4 mr-2" />
            Competencies
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-purple-500/30">
            <Lightbulb className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="interview" className="data-[state=active]:bg-purple-500/30">
            <MessageSquare className="h-4 w-4 mr-2" />
            Interview Guide
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personality Radar */}
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="h-5 w-5 text-purple-400" />
                  Personality Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {personalityTraits.map((trait) => (
                    <div key={trait.key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-300">{trait.label}</span>
                        <span className={cn("font-medium", getScoreColor(trait.value))}>
                          {trait.value}%
                        </span>
                      </div>
                      <Progress value={trait.value} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-purple-500/10 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-300 mb-2">Profile Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-purple-400">Communication:</span>
                      <div className="text-white font-medium">
                        {insights.personality_profile?.communication_style || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-purple-400">Work Style:</span>
                      <div className="text-white font-medium">
                        {insights.personality_profile?.work_preferences || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-purple-400">Stress Tolerance:</span>
                      <div className="text-white font-medium">
                        {insights.personality_profile?.stress_tolerance || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competency Scores */}
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Competency Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competencyScores.map((competency) => (
                    <div key={competency.key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-300">{competency.label}</span>
                        <span className={cn("font-medium", getScoreColor(competency.value))}>
                          {competency.value}%
                        </span>
                      </div>
                      <Progress value={competency.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => handleUpdateRecommendation('hire')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve Hire
                </Button>
                <Button
                  onClick={() => handleUpdateRecommendation('interview')}
                  variant="outline"
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button
                  onClick={() => handleUpdateRecommendation('reassess')}
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Request Reassessment
                </Button>
                <Button
                  onClick={() => handleUpdateRecommendation('reject')}
                  variant="outline"
                  className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject Candidate
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personality Tab */}
        <TabsContent value="personality" className="space-y-6">
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-400" />
                Detailed Personality Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Big Five Personality Traits</h3>
                    <div className="space-y-4">
                      {personalityTraits.map((trait) => (
                        <div key={trait.key} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-purple-300">{trait.label}</span>
                            <span className={cn("font-medium", getScoreColor(trait.value))}>
                              {trait.value}%
                            </span>
                          </div>
                          <Progress value={trait.value} className="h-3" />
                          <div className="text-xs text-purple-400">
                            {trait.value >= 80 ? 'Very High' :
                             trait.value >= 60 ? 'High' :
                             trait.value >= 40 ? 'Moderate' :
                             trait.value >= 20 ? 'Low' : 'Very Low'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Work Style Profile</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <h4 className="text-purple-300 text-sm font-medium mb-2">Communication Style</h4>
                        <div className="text-white">
                          {insights.personality_profile?.communication_style === 'collaborative' &&
                            "Prefers collaborative and team-oriented communication. Values input from others and builds consensus."}
                          {insights.personality_profile?.communication_style === 'direct' &&
                            "Direct and straightforward communication style. Gets to the point quickly and efficiently."}
                          {insights.personality_profile?.communication_style === 'supportive' &&
                            "Supportive and encouraging communication. Focuses on helping others feel comfortable."}
                          {insights.personality_profile?.communication_style === 'analytical' &&
                            "Analytical and data-driven communication. Prefers facts and detailed explanations."}
                        </div>
                      </div>

                      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <h4 className="text-blue-300 text-sm font-medium mb-2">Work Preferences</h4>
                        <div className="text-white">
                          {insights.personality_profile?.work_preferences === 'team' &&
                            "Thrives in team environments. Enjoys collaboration and shared responsibility."}
                          {insights.personality_profile?.work_preferences === 'individual' &&
                            "Performs best with individual tasks and autonomy. Values independent work."}
                          {insights.personality_profile?.work_preferences === 'mixed' &&
                            "Flexible between team and individual work. Adapts well to different work structures."}
                        </div>
                      </div>

                      <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <h4 className="text-green-300 text-sm font-medium mb-2">Stress Management</h4>
                        <div className="text-white">
                          {insights.personality_profile?.stress_tolerance === 'high' &&
                            "High stress tolerance. Maintains composure and performance under pressure."}
                          {insights.personality_profile?.stress_tolerance === 'medium' &&
                            "Moderate stress tolerance. Manages typical workplace pressures well."}
                          {insights.personality_profile?.stress_tolerance === 'low' &&
                            "Lower stress tolerance. Performs best in stable, predictable environments."}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competencies Tab */}
        <TabsContent value="competencies" className="space-y-6">
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                Role-Specific Competency Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Core Competencies</h3>
                  {competencyScores.slice(0, 4).map((competency) => (
                    <div key={competency.key} className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-300 font-medium">{competency.label}</span>
                        <span className={cn("text-lg font-bold", getScoreColor(competency.value))}>
                          {competency.value}%
                        </span>
                      </div>
                      <Progress value={competency.value} className="h-3 mb-2" />
                      <div className="text-xs text-purple-400">
                        {competency.value >= 90 ? 'Exceptional - Industry leading capability' :
                         competency.value >= 80 ? 'Strong - Above average performance' :
                         competency.value >= 70 ? 'Competent - Meets role requirements' :
                         competency.value >= 60 ? 'Developing - Some growth needed' :
                         'Requires Development - Significant improvement needed'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Soft Skills & Cultural Fit</h3>
                  {competencyScores.slice(4).map((competency) => (
                    <div key={competency.key} className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-300 font-medium">{competency.label}</span>
                        <span className={cn("text-lg font-bold", getScoreColor(competency.value))}>
                          {competency.value}%
                        </span>
                      </div>
                      <Progress value={competency.value} className="h-3 mb-2" />
                      <div className="text-xs text-blue-400">
                        {competency.value >= 90 ? 'Outstanding cultural alignment' :
                         competency.value >= 80 ? 'Strong cultural fit' :
                         competency.value >= 70 ? 'Good cultural alignment' :
                         competency.value >= 60 ? 'Moderate cultural fit' :
                         'Cultural alignment concerns'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-purple-400" />
                  Development Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.development_suggestions?.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white text-sm">{suggestion}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  Risk Assessment & Mitigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.potential_concerns?.map((concern, index) => (
                    <div key={index} className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <div className="text-white text-sm font-medium">{concern}</div>
                      </div>
                      <div className="text-xs text-orange-300 ml-6">
                        {index === 0 && "Recommend leadership training program within first 6 months"}
                        {index === 1 && "Provide structured technical onboarding and mentorship"}
                        {index === 2 && "Pair with experienced educator for methodology guidance"}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <h3 className="text-green-300 text-sm font-medium mb-2">Overall Risk Level: Low</h3>
                  <p className="text-xs text-green-400">
                    Identified concerns are typical for role level and can be addressed through standard onboarding and development programs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interview Guide Tab */}
        <TabsContent value="interview" className="space-y-6">
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                AI-Generated Interview Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Recommended Focus Areas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.interview_focus_areas?.map((area, index) => (
                      <div key={index} className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium mb-1">{area}</div>
                            <div className="text-blue-300 text-xs">
                              {index === 0 && "Probe for specific examples and problem-solving approaches"}
                              {index === 1 && "Assess adaptability and inclusive teaching methods"}
                              {index === 2 && "Understand motivation and cultural alignment"}
                              {index === 3 && "Evaluate learning agility and digital readiness"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Suggested Interview Questions</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <h4 className="text-purple-300 text-sm font-medium mb-2">Scenario-Based Questions</h4>
                      <div className="space-y-2 text-sm text-white">
                        <p>"Describe a time when you had to handle a difficult situation with a child who was having an emotional outburst. How did you approach it?"</p>
                        <p>"How would you adapt your communication style when working with a child who has different learning needs?"</p>
                      </div>
                    </div>

                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <h4 className="text-green-300 text-sm font-medium mb-2">Cultural Fit Questions</h4>
                      <div className="space-y-2 text-sm text-white">
                        <p>"What aspects of working in childcare are most meaningful to you?"</p>
                        <p>"How do you see yourself contributing to a positive team environment?"</p>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <h4 className="text-yellow-300 text-sm font-medium mb-2">Development & Growth</h4>
                      <div className="space-y-2 text-sm text-white">
                        <p>"Where do you see yourself professionally in the next 2-3 years?"</p>
                        <p>"What areas of childcare or education would you most like to develop expertise in?"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom Recommendation Input */}
      {showAdvanced && (
        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              Custom Recommendation Override
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-purple-300">Custom Reasoning</Label>
                <Textarea
                  value={customReasoning}
                  onChange={(e) => setCustomReasoning(e.target.value)}
                  placeholder="Provide your reasoning for overriding the AI recommendation..."
                  className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-400 min-h-[100px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdateRecommendation('hire')}
                  disabled={!customReasoning.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Override to Hire
                </Button>
                <Button
                  onClick={() => handleUpdateRecommendation('reject')}
                  disabled={!customReasoning.trim()}
                  variant="outline"
                  className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Override to Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}