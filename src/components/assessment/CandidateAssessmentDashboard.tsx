/**
 * 🧪 CANDIDATE ASSESSMENT DASHBOARD - LABS 2.0
 * Comprehensive dashboard for managing candidate assessments and reviews
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Calendar,
  Clock,
  Target,
  Brain,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Award,
  FileText,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Timer,
  Zap,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Send,
  UserCheck,
  UserX,
  Building
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CandidateDashboardView,
  AssessmentFilters,
  AssessmentSortOptions,
  CandidateAssessmentStatus,
  AssessmentRoleCategory,
  HiringRecommendation,
  ReviewStatus,
  FinalDecision,
  ROLE_CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS
} from "@/types/assessmentEngine";

interface CandidateAssessmentDashboardProps {
  candidates?: CandidateDashboardView[];
  loading?: boolean;
  onCandidateSelect?: (candidateId: string) => void;
  onStatusChange?: (candidateId: string, newStatus: CandidateAssessmentStatus) => void;
  onReviewAssign?: (candidateId: string, reviewerId?: string) => void;
  onBulkAction?: (candidateIds: string[], action: string) => void;
  className?: string;
}


// NO MORE MOCKS - Real data only! 🎯

export default function CandidateAssessmentDashboard({
  candidates = [], // NO MOCK FALLBACK!
  loading = false,
  onCandidateSelect,
  onStatusChange,
  onReviewAssign,
  onBulkAction,
  className
}: CandidateAssessmentDashboardProps) {
  console.log('📋 [CandidateAssessmentDashboard] Rendering with data:', {
    candidatesCount: candidates.length,
    isUsingMockFallback: candidates === MOCK_CANDIDATES,
    loading
  });
  
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [filters, setFilters] = useState<AssessmentFilters>({});
  const [sortOptions, setSortOptions] = useState<AssessmentSortOptions>({
    field: 'application_date',
    direction: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort candidates
  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!candidate.full_name.toLowerCase().includes(searchLower) &&
            !candidate.email.toLowerCase().includes(searchLower) &&
            !candidate.position_applied.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(candidate.overall_status)) {
          return false;
        }
      }

      // Role category filter
      if (filters.role_categories && filters.role_categories.length > 0) {
        if (!filters.role_categories.includes(candidate.role_category)) {
          return false;
        }
      }

      // Score range filter
      if (filters.score_range && candidate.overall_score !== undefined) {
        if (candidate.overall_score < filters.score_range.min ||
            candidate.overall_score > filters.score_range.max) {
          return false;
        }
      }

      // Application source filter
      if (filters.application_source && filters.application_source.length > 0) {
        if (!filters.application_source.includes(candidate.application_source)) {
          return false;
        }
      }

      // Has review filter
      if (filters.has_review !== undefined) {
        const hasReview = candidate.review_status !== undefined;
        if (hasReview !== filters.has_review) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortOptions.field) {
        case 'full_name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'application_date':
          aValue = new Date(a.application_date);
          bValue = new Date(b.application_date);
          break;
        case 'overall_score':
          aValue = a.overall_score || 0;
          bValue = b.overall_score || 0;
          break;
        case 'ai_match_score':
          aValue = a.ai_match_score || 0;
          bValue = b.ai_match_score || 0;
          break;
        case 'assessment_completed_at':
          aValue = a.assessment_completed_at ? new Date(a.assessment_completed_at) : new Date(0);
          bValue = b.assessment_completed_at ? new Date(b.assessment_completed_at) : new Date(0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [candidates, filters, sortOptions, searchTerm]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = candidates.length;
    const byStatus = candidates.reduce((acc, candidate) => {
      acc[candidate.overall_status] = (acc[candidate.overall_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completed = candidates.filter(c => c.overall_status === 'completed').length;
    const passed = candidates.filter(c => c.passed === true).length;
    const avgScore = candidates
      .filter(c => c.overall_score !== undefined)
      .reduce((sum, c) => sum + (c.overall_score || 0), 0) /
      candidates.filter(c => c.overall_score !== undefined).length || 0;

    return {
      total,
      byStatus,
      completed,
      passed,
      avgScore: Math.round(avgScore * 10) / 10,
      passRate: completed > 0 ? Math.round((passed / completed) * 100) : 0,
      pendingReview: candidates.filter(c => c.review_status === 'pending').length
    };
  }, [candidates]);

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredAndSortedCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredAndSortedCandidates.map(c => c.id));
    }
  };

  const getStatusIcon = (status: CandidateAssessmentStatus) => {
    switch (status) {
      case 'pending_start': return Clock;
      case 'in_progress': return Timer;
      case 'completed': return CheckCircle;
      case 'approved_for_hire': return UserCheck;
      case 'rejected': return UserX;
      case 'failed': return XCircle;
      case 'expired': return AlertTriangle;
      default: return Clock;
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return '-';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    return `${minutes}m`;
  };

  const renderCandidateCard = (candidate: CandidateDashboardView) => {
    const StatusIcon = getStatusIcon(candidate.overall_status);
    const isSelected = selectedCandidates.includes(candidate.id);

    return (
      <Card
        key={candidate.id}
        className={cn(
          "bg-black/30 border-purple-500/30 backdrop-blur-lg transition-all cursor-pointer",
          isSelected && "border-purple-500/60 bg-purple-500/20"
        )}
        onClick={() => onCandidateSelect?.(candidate.id)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleSelectCandidate(candidate.id)}
                onClick={(e) => e.stopPropagation()}
                className="rounded border-purple-500/30 bg-black/30"
              />
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-lg">
                  {candidate.full_name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{candidate.full_name}</h3>
                <p className="text-sm text-purple-300">{candidate.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={cn("text-xs", STATUS_COLORS[candidate.overall_status])}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {STATUS_LABELS[candidate.overall_status]}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle more actions
                }}
                className="text-purple-300 hover:bg-purple-500/20"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-xs text-purple-400">Position</div>
              <div className="text-sm text-white truncate">{candidate.position_applied}</div>
            </div>
            <div>
              <div className="text-xs text-purple-400">Category</div>
              <div className="text-sm text-white">
                {ROLE_CATEGORY_LABELS[candidate.role_category]}
              </div>
            </div>
            <div>
              <div className="text-xs text-purple-400">Assessment Score</div>
              <div className={cn("text-sm font-medium", getScoreColor(candidate.overall_score))}>
                {candidate.overall_score ? `${candidate.overall_score}%` : 'Pending'}
              </div>
            </div>
            <div>
              <div className="text-xs text-purple-400">AI Match</div>
              <div className={cn("text-sm font-medium", getScoreColor(candidate.ai_match_score))}>
                {candidate.ai_match_score}%
              </div>
            </div>
          </div>

          {/* Progress Bar for In Progress Assessments */}
          {candidate.overall_status === 'in_progress' && candidate.progress_percentage !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-purple-400 mb-1">
                <span>Assessment Progress</span>
                <span>{candidate.current_question_index}/{candidate.total_questions} questions</span>
              </div>
              <Progress
                value={candidate.progress_percentage}
                className="h-2 bg-purple-900/30"
              />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-purple-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(candidate.application_date).toLocaleDateString()}
              </span>
              {candidate.assessment_started_at && candidate.assessment_completed_at && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(candidate.assessment_started_at, candidate.assessment_completed_at)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {candidate.application_source}
              </span>
            </div>

            <div className="flex gap-1">
              {candidate.review_status === 'pending' && (
                <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  Review Pending
                </Badge>
              )}
              {candidate.final_decision === 'approved_for_hire' && (
                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                  Approved
                </Badge>
              )}
              {candidate.final_decision === 'rejected' && (
                <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                  Rejected
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCandidateSelect?.(candidate.id);
              }}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>

            {candidate.review_status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onReviewAssign?.(candidate.id);
                }}
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Assign Review
              </Button>
            )}

            {candidate.overall_status === 'completed' && !candidate.final_decision && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange?.(candidate.id, 'approved_for_hire');
                  }}
                  className="border-green-500/30 text-green-300 hover:bg-green-500/20"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange?.(candidate.id, 'rejected');
                  }}
                  className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Handle contact
              }}
              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
            >
              <Mail className="h-4 w-4 mr-1" />
              Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Assessment Dashboard</h1>
          <p className="text-purple-300">
            Manage candidate assessments and hiring pipeline
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          {selectedCandidates.length > 0 && (
            <Button
              variant="outline"
              onClick={() => onBulkAction?.(selectedCandidates, 'bulk_review')}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              <Users className="h-4 w-4 mr-2" />
              Bulk Actions ({selectedCandidates.length})
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">{summaryMetrics.total}</div>
            <div className="text-xs text-purple-300">Total Candidates</div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-4 text-center">
            <Timer className="h-6 w-6 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-400">{summaryMetrics.byStatus['in_progress'] || 0}</div>
            <div className="text-xs text-purple-300">In Progress</div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">{summaryMetrics.completed}</div>
            <div className="text-xs text-purple-300">Completed</div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">{summaryMetrics.passRate}%</div>
            <div className="text-xs text-purple-300">Pass Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">{summaryMetrics.avgScore}</div>
            <div className="text-xs text-purple-300">Avg Score</div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-400">{summaryMetrics.pendingReview}</div>
            <div className="text-xs text-purple-300">Pending Review</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-purple-300">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search candidates..."
                  className="pl-10 bg-black/30 border-purple-500/30 text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-purple-300">Status</Label>
              <Select
                value={filters.statuses?.[0] || 'all'}
                onValueChange={(value) =>
                  setFilters(prev => ({
                    ...prev,
                    statuses: value === 'all' ? undefined : [value as CandidateAssessmentStatus]
                  }))
                }
              >
                <SelectTrigger className="bg-black/30 border-purple-500/30">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Category Filter */}
            <div className="space-y-2">
              <Label className="text-purple-300">Role Category</Label>
              <Select
                value={filters.role_categories?.[0] || 'all'}
                onValueChange={(value) =>
                  setFilters(prev => ({
                    ...prev,
                    role_categories: value === 'all' ? undefined : [value as AssessmentRoleCategory]
                  }))
                }
              >
                <SelectTrigger className="bg-black/30 border-purple-500/30">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(ROLE_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label className="text-purple-300">Sort By</Label>
              <Select
                value={`${sortOptions.field}_${sortOptions.direction}`}
                onValueChange={(value) => {
                  const [field, direction] = value.split('_');
                  setSortOptions({
                    field: field as AssessmentSortOptions['field'],
                    direction: direction as 'asc' | 'desc'
                  });
                }}
              >
                <SelectTrigger className="bg-black/30 border-purple-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application_date_desc">Newest First</SelectItem>
                  <SelectItem value="application_date_asc">Oldest First</SelectItem>
                  <SelectItem value="full_name_asc">Name A-Z</SelectItem>
                  <SelectItem value="full_name_desc">Name Z-A</SelectItem>
                  <SelectItem value="overall_score_desc">Highest Score</SelectItem>
                  <SelectItem value="overall_score_asc">Lowest Score</SelectItem>
                  <SelectItem value="ai_match_score_desc">Best AI Match</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            <div className="space-y-2">
              <Label className="text-purple-300">Bulk Actions</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                >
                  {selectedCandidates.length === filteredAndSortedCandidates.length ? 'Deselect All' : 'Select All'}
                </Button>
                {selectedCandidates.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCandidates([])}
                    className="border-gray-500/30 text-gray-300 hover:bg-gray-500/20"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Candidates ({filteredAndSortedCandidates.length})
          </h2>
          <div className="flex items-center gap-2 text-sm text-purple-300">
            <ArrowUpDown className="h-4 w-4" />
            Sorted by {sortOptions.field.replace('_', ' ')} ({sortOptions.direction})
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500/30 rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 bg-purple-500/30 rounded w-32" />
                        <div className="h-3 bg-purple-500/20 rounded w-48" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="h-3 bg-purple-500/20 rounded w-16" />
                        <div className="h-4 bg-purple-500/30 rounded w-24" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-purple-500/20 rounded w-16" />
                        <div className="h-4 bg-purple-500/30 rounded w-20" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedCandidates.length === 0 ? (
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No candidates found</h3>
              <p className="text-purple-300">
                {searchTerm || Object.keys(filters).length > 0
                  ? 'Try adjusting your filters or search terms'
                  : 'No candidates have applied yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAndSortedCandidates.map(renderCandidateCard)}
          </div>
        )}
      </div>
    </div>
  );
}