/**
 * 🧪 ASSESSMENT ANALYTICS ENGINE - LABS 2.0
 * Comprehensive analytics and scoring insights for the assessment system
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Clock,
  Award,
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Calendar,
  Zap,
  Star,
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
  Timer,
  Percent,
  Trophy,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AssessmentAnalytics as AnalyticsData,
  AssessmentRoleCategory,
  AssessmentPipelineMetrics,
  RoleCategoryMetrics,
  ROLE_CATEGORY_LABELS,
  CATEGORY_LABELS
} from "@/types/assessmentEngine";

interface AssessmentAnalyticsProps {
  candidates?: any[]; // Real candidate data from useCandidates hook
  analytics?: any;    // Real analytics data from useAnalytics hook
  loading?: boolean;  // Loading state
  dateRange?: 'week' | 'month' | 'quarter' | 'year';
  roleCategory?: AssessmentRoleCategory;
  onDateRangeChange?: (range: string) => void;
  onRoleCategoryChange?: (category: AssessmentRoleCategory | 'all') => void;
  className?: string;
}

// Mock data for demonstration
const MOCK_ANALYTICS: AnalyticsData[] = [
  {
    id: '1',
    date: '2025-10-01',
    template_id: 'temp_1',
    role_category: 'childcare_staff',
    total_started: 25,
    total_completed: 20,
    total_passed: 15,
    total_failed: 5,
    average_score: 78.5,
    average_completion_time: 42,
    abandonment_rate: 20.0,
    pass_rate: 75.0,
    average_time_per_question: 2.8,
    questions_requiring_review: 12,
    ai_accuracy_rate: 87.5,
    created_at: '2025-10-01T00:00:00Z'
  },
  {
    id: '2',
    date: '2025-10-02',
    template_id: 'temp_2',
    role_category: 'educational_staff',
    total_started: 15,
    total_completed: 13,
    total_passed: 11,
    total_failed: 2,
    average_score: 84.2,
    average_completion_time: 58,
    abandonment_rate: 13.3,
    pass_rate: 84.6,
    average_time_per_question: 2.9,
    questions_requiring_review: 8,
    ai_accuracy_rate: 91.2,
    created_at: '2025-10-02T00:00:00Z'
  },
  {
    id: '3',
    date: '2025-10-03',
    template_id: 'temp_3',
    role_category: 'support_staff',
    total_started: 18,
    total_completed: 16,
    total_passed: 10,
    total_failed: 6,
    average_score: 72.1,
    average_completion_time: 28,
    abandonment_rate: 11.1,
    pass_rate: 62.5,
    average_time_per_question: 2.8,
    questions_requiring_review: 14,
    ai_accuracy_rate: 83.3,
    created_at: '2025-10-03T00:00:00Z'
  }
];

const MOCK_PIPELINE_METRICS: AssessmentPipelineMetrics = {
  total_applications: 156,
  pending_start: 23,
  in_progress: 12,
  completed: 89,
  passed: 67,
  failed: 22,
  approved_for_hire: 45,
  rejected: 33,
  start_rate: 85.3,
  completion_rate: 74.2,
  pass_rate: 75.3,
  hire_rate: 67.2
};

const MOCK_ROLE_METRICS: RoleCategoryMetrics[] = [
  {
    role_category: 'childcare_staff',
    metrics: {
      total_applications: 68,
      pending_start: 8,
      in_progress: 5,
      completed: 45,
      passed: 34,
      failed: 11,
      approved_for_hire: 25,
      rejected: 20,
      start_rate: 88.2,
      completion_rate: 76.3,
      pass_rate: 75.6,
      hire_rate: 73.5
    },
    average_score: 78.5,
    average_completion_time: 42,
    top_strengths: ['Communication Skills', 'Emotional Intelligence', 'Cultural Fit'],
    common_weaknesses: ['Emergency Response', 'Technical Competency']
  },
  {
    role_category: 'educational_staff',
    metrics: {
      total_applications: 42,
      pending_start: 6,
      in_progress: 3,
      completed: 28,
      passed: 24,
      failed: 4,
      approved_for_hire: 18,
      rejected: 10,
      start_rate: 85.7,
      completion_rate: 75.7,
      pass_rate: 85.7,
      hire_rate: 75.0
    },
    average_score: 84.2,
    average_completion_time: 58,
    top_strengths: ['Leadership', 'Communication Skills', 'Problem Solving'],
    common_weaknesses: ['Time Management', 'Technical Competency']
  },
  {
    role_category: 'support_staff',
    metrics: {
      total_applications: 36,
      pending_start: 7,
      in_progress: 3,
      completed: 22,
      passed: 14,
      failed: 8,
      approved_for_hire: 8,
      rejected: 14,
      start_rate: 80.6,
      completion_rate: 68.8,
      pass_rate: 63.6,
      hire_rate: 57.1
    },
    average_score: 72.1,
    average_completion_time: 28,
    top_strengths: ['Teamwork', 'Cultural Fit', 'Communication Skills'],
    common_weaknesses: ['Technical Competency', 'Problem Solving', 'Leadership']
  },
  {
    role_category: 'management',
    metrics: {
      total_applications: 10,
      pending_start: 2,
      in_progress: 1,
      completed: 6,
      passed: 5,
      failed: 1,
      approved_for_hire: 4,
      rejected: 2,
      start_rate: 80.0,
      completion_rate: 75.0,
      pass_rate: 83.3,
      hire_rate: 80.0
    },
    average_score: 87.3,
    average_completion_time: 85,
    top_strengths: ['Leadership', 'Problem Solving', 'Emotional Intelligence'],
    common_weaknesses: ['Technical Competency']
  }
];

const CHART_COLORS = {
  primary: '#8b5cf6',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

export default function AssessmentAnalytics({
  candidates = [],
  analytics: analyticsData,
  loading = false,
  dateRange = 'month',
  roleCategory,
  onDateRangeChange,
  onRoleCategoryChange,
  className
}: AssessmentAnalyticsProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  console.log('📊 [AssessmentAnalytics] Rendering with REAL data:', {
    candidatesCount: candidates.length,
    analytics: analyticsData,
    loading
  });
  
  // Use REAL analytics data from props, fallback to calculating from candidates
  const pipelineMetrics: AssessmentPipelineMetrics = analyticsData ? {
    total_applications: analyticsData.totalApplications || candidates.length,
    pending_start: analyticsData.activeApplications || 0,
    started: candidates.filter((c: any) => c.assessment_status !== 'not_started').length,
    completed: candidates.filter((c: any) => c.assessment_status === 'completed').length,
    passed: analyticsData.passed || candidates.filter((c: any) => c.passed).length,
    failed: candidates.length - (analyticsData.passed || 0),
    hired: analyticsData.hiredThisMonth || candidates.filter((c: any) => c.overall_status === 'hired').length,
    average_completion_time: analyticsData.avgTimeToHire || 0,
    pass_rate: analyticsData.passRate || 0,
    completion_rate: analyticsData.interviewRate || 0
  } : MOCK_PIPELINE_METRICS;
  
  // Calculate role metrics from real candidates
  const roleMetrics: RoleCategoryMetrics[] = MOCK_ROLE_METRICS; // TODO: Calculate from real data

  // Calculate trend data
  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        applications: Math.floor(Math.random() * 20) + 10,
        completed: Math.floor(Math.random() * 15) + 8,
        passed: Math.floor(Math.random() * 12) + 6,
        avgScore: Math.floor(Math.random() * 20) + 70
      };
    });
    return last7Days;
  }, []);

  // Category performance data
  const categoryPerformanceData = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    category: label,
    avgScore: Math.floor(Math.random() * 30) + 60,
    passRate: Math.floor(Math.random() * 40) + 60,
    questions: Math.floor(Math.random() * 10) + 5
  }));

  // Pipeline conversion data - with safe defaults
  const conversionData = [
    { stage: 'Applied', count: pipelineMetrics.total_applications || 0, rate: 100 },
    { stage: 'Started', count: (pipelineMetrics.started || 0), rate: pipelineMetrics.start_rate || 0 },
    { stage: 'Completed', count: pipelineMetrics.completed || 0, rate: pipelineMetrics.completion_rate || 0 },
    { stage: 'Passed', count: pipelineMetrics.passed || 0, rate: pipelineMetrics.pass_rate || 0 },
    { stage: 'Hired', count: pipelineMetrics.hired || 0, rate: pipelineMetrics.hire_rate || 0 }
  ];

  // Score distribution data
  const scoreDistributionData = [
    { range: '90-100%', count: 12, color: CHART_COLORS.success },
    { range: '80-89%', count: 25, color: CHART_COLORS.info },
    { range: '70-79%', count: 30, color: CHART_COLORS.warning },
    { range: '60-69%', count: 18, color: CHART_COLORS.error },
    { range: '0-59%', count: 8, color: '#6b7280' }
  ];

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: any,
    color: string,
    change?: number
  ) => {
    const Icon = icon;
    const isPositive = change !== undefined && change > 0;
    const isNegative = change !== undefined && change < 0;

    return (
      <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-300">{title}</p>
              <p className={cn("text-3xl font-bold", color)}>
                {typeof value === 'number' ? Math.round(value * 10) / 10 : value}
              </p>
              {change !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 mt-2 text-sm",
                  isPositive ? "text-green-400" : isNegative ? "text-red-400" : "text-gray-400"
                )}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : isNegative ? <TrendingDown className="h-4 w-4" /> : null}
                  {Math.abs(change)}% vs last period
                </div>
              )}
            </div>
            <Icon className={cn("h-8 w-8", color)} />
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
          <h1 className="text-3xl font-bold text-white">Assessment Analytics</h1>
          <p className="text-purple-300">
            Comprehensive insights into candidate performance and system efficiency
          </p>
        </div>

        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-32 bg-black/30 border-purple-500/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleCategory || 'all'} onValueChange={onRoleCategoryChange}>
            <SelectTrigger className="w-48 bg-black/30 border-purple-500/30">
              <SelectValue placeholder="All Categories" />
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

          <Button
            variant="outline"
            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {renderMetricCard(
          "Total Applications",
          pipelineMetrics.total_applications,
          Users,
          "text-blue-400",
          12.5
        )}
        {renderMetricCard(
          "Completion Rate",
          `${pipelineMetrics.completion_rate}%`,
          CheckCircle,
          "text-green-400",
          3.2
        )}
        {renderMetricCard(
          "Pass Rate",
          `${pipelineMetrics.pass_rate}%`,
          Target,
          "text-purple-400",
          -1.8
        )}
        {renderMetricCard(
          "Hire Rate",
          `${pipelineMetrics.hire_rate}%`,
          Trophy,
          "text-yellow-400",
          5.7
        )}
        {renderMetricCard(
          "Avg. Score",
          "78.5",
          Star,
          "text-orange-400",
          2.1
        )}
        {renderMetricCard(
          "Pending Review",
          23,
          Clock,
          "text-red-400",
          -4.3
        )}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-black/30 border-purple-500/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/30">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-purple-500/30">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-purple-500/30">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-purple-500/30">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-purple-500/30">
            <Brain className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline Conversion Funnel */}
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionData.map((stage, index) => {
                    const width = (stage.rate / 100) * 100;
                    const prevCount = index > 0 ? conversionData[index - 1].count : stage.count;
                    const dropOff = prevCount - stage.count;
                    const dropOffRate = prevCount > 0 ? ((dropOff / prevCount) * 100) : 0;

                    return (
                      <div key={stage.stage} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{stage.stage}</span>
                          <div className="text-right">
                            <div className="text-white">{stage.count} candidates</div>
                            <div className={cn(
                              "text-sm",
                              stage.rate >= 80 ? "text-green-400" :
                              stage.rate >= 60 ? "text-yellow-400" : "text-red-400"
                            )}>
                              {stage.rate.toFixed(1)}% conversion
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-purple-900/30 rounded-full h-4">
                            <div
                              className={cn(
                                "h-4 rounded-full transition-all",
                                stage.rate >= 80 ? "bg-green-500" :
                                stage.rate >= 60 ? "bg-yellow-500" : "bg-red-500"
                              )}
                              style={{ width: `${width}%` }}
                            />
                          </div>
                          {index > 0 && dropOff > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              -{dropOff} lost ({(dropOffRate || 0).toFixed(1)}% drop-off)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-purple-400" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scoreDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ range, count }) => `${range}: ${count}`}
                      >
                        {scoreDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role Category Performance */}
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                Performance by Role Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {roleMetrics.map((role) => (
                  <Card key={role.role_category} className="bg-purple-500/10 border-purple-500/20">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white mb-3">
                        {ROLE_CATEGORY_LABELS[role.role_category]}
                      </h3>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-300">Applications:</span>
                          <span className="text-white">{role.metrics.total_applications}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-purple-300">Pass Rate:</span>
                          <span className={cn(
                            "font-medium",
                            role.metrics.pass_rate >= 80 ? "text-green-400" :
                            role.metrics.pass_rate >= 60 ? "text-yellow-400" : "text-red-400"
                          )}>
                            {role.metrics.pass_rate.toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-purple-300">Avg Score:</span>
                          <span className={cn(
                            "font-medium",
                            getScoreColor(role.average_score)
                          )}>
                            {role.average_score.toFixed(1)}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-purple-300">Avg Time:</span>
                          <span className="text-white">{role.average_completion_time}m</span>
                        </div>

                        <div className="pt-2 border-t border-purple-500/20">
                          <div className="text-xs text-purple-400 mb-1">Top Strengths:</div>
                          <div className="flex flex-wrap gap-1">
                            {role.top_strengths.slice(0, 2).map((strength) => (
                              <Badge
                                key={strength}
                                variant="outline"
                                className="bg-green-500/20 text-green-300 border-green-500/30 text-xs"
                              >
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-purple-400 mb-1">Needs Improvement:</div>
                          <div className="flex flex-wrap gap-1">
                            {role.common_weaknesses.slice(0, 2).map((weakness) => (
                              <Badge
                                key={weakness}
                                variant="outline"
                                className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs"
                              >
                                {weakness}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessment Performance Chart */}
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  Daily Assessment Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                      <XAxis dataKey="day" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Bar dataKey="applications" fill={CHART_COLORS.primary} name="Applications" />
                      <Bar dataKey="completed" fill={CHART_COLORS.secondary} name="Completed" />
                      <Bar dataKey="passed" fill={CHART_COLORS.success} name="Passed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Average Scores Trend */}
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-purple-400" />
                  Average Score Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                      <XAxis dataKey="day" stroke="#9ca3af" />
                      <YAxis domain={[60, 100]} stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="avgScore"
                        stroke={CHART_COLORS.warning}
                        fill={CHART_COLORS.warning}
                        fillOpacity={0.3}
                        name="Average Score"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics Table */}
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-400" />
                Detailed Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-purple-500/20">
                      <th className="text-left text-purple-300 py-2">Template</th>
                      <th className="text-left text-purple-300 py-2">Started</th>
                      <th className="text-left text-purple-300 py-2">Completed</th>
                      <th className="text-left text-purple-300 py-2">Pass Rate</th>
                      <th className="text-left text-purple-300 py-2">Avg Score</th>
                      <th className="text-left text-purple-300 py-2">Avg Time</th>
                      <th className="text-left text-purple-300 py-2">AI Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.map((item, index) => (
                      <tr key={item.id} className="border-b border-purple-500/10">
                        <td className="py-3 text-white">
                          {ROLE_CATEGORY_LABELS[item.role_category || 'childcare_staff']} Assessment
                        </td>
                        <td className="py-3 text-white">{item.total_started}</td>
                        <td className="py-3 text-white">{item.total_completed}</td>
                        <td className="py-3">
                          <span className={cn(
                            "font-medium",
                            (item.pass_rate || 0) >= 80 ? "text-green-400" :
                            (item.pass_rate || 0) >= 60 ? "text-yellow-400" : "text-red-400"
                          )}>
                            {item.pass_rate?.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={cn("font-medium", getScoreColor(item.average_score))}>
                            {item.average_score?.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 text-white">{item.average_completion_time}m</td>
                        <td className="py-3">
                          <span className={cn(
                            "font-medium",
                            (item.ai_accuracy_rate || 0) >= 90 ? "text-green-400" :
                            (item.ai_accuracy_rate || 0) >= 80 ? "text-yellow-400" : "text-red-400"
                          )}>
                            {item.ai_accuracy_rate?.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-purple-400" />
                Category Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPerformanceData.map((category) => (
                  <Card key={category.category} className="bg-purple-500/10 border-purple-500/20">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white mb-3">{category.category}</h3>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-purple-300">Average Score</span>
                            <span className={cn("font-medium", getScoreColor(category.avgScore))}>
                              {category.avgScore}%
                            </span>
                          </div>
                          <Progress value={category.avgScore} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-purple-300">Pass Rate</span>
                            <span className={cn(
                              "font-medium",
                              category.passRate >= 80 ? "text-green-400" :
                              category.passRate >= 60 ? "text-yellow-400" : "text-red-400"
                            )}>
                              {category.passRate}%
                            </span>
                          </div>
                          <Progress value={category.passRate} className="h-2" />
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-purple-300">Questions</span>
                          <span className="text-white">{category.questions}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-purple-400" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2}
                      name="Applications"
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke={CHART_COLORS.secondary}
                      strokeWidth={2}
                      name="Completed"
                    />
                    <Line
                      type="monotone"
                      dataKey="passed"
                      stroke={CHART_COLORS.success}
                      strokeWidth={2}
                      name="Passed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  AI Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <div>
                      <div className="text-green-300 text-sm font-medium">Strong Performance</div>
                      <div className="text-xs text-green-400 mt-1">
                        Childcare staff assessments show 94% AI accuracy with excellent cultural fit scoring
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                    <div>
                      <div className="text-yellow-300 text-sm font-medium">Optimization Opportunity</div>
                      <div className="text-xs text-yellow-400 mt-1">
                        Support staff technical competency questions need manual review 40% more often
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div>
                      <div className="text-blue-300 text-sm font-medium">Trending Pattern</div>
                      <div className="text-xs text-blue-400 mt-1">
                        Scenario-based questions show 15% higher completion rates than traditional multiple choice
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      1
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">Reduce Assessment Length</div>
                      <div className="text-purple-300 text-xs">
                        Consider shortening support staff assessments by 20% to reduce abandonment rate
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      2
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">Enhance AI Training</div>
                      <div className="text-purple-300 text-xs">
                        Add more training data for technical competency scoring to improve accuracy
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      3
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">Expand Scenario Questions</div>
                      <div className="text-purple-300 text-xs">
                        Increase scenario-based questions for better candidate engagement
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      4
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">Review Thresholds</div>
                      <div className="text-purple-300 text-xs">
                        Adjust passing thresholds for management roles based on recent performance data
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getScoreColor(score?: number) {
  if (!score) return 'text-gray-400';
  if (score >= 90) return 'text-emerald-400';
  if (score >= 80) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 60) return 'text-orange-400';
  return 'text-red-400';
}