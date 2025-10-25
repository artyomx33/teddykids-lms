/**
 * 🧪 APPROVAL WORKFLOW SYSTEM - LABS 2.0
 * Manages the transition from candidate assessment to staff system integration
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  FileText,
  Calendar,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Download,
  Upload,
  ArrowRight,
  ArrowLeft,
  User,
  Building,
  CreditCard,
  Shield,
  Zap,
  Target,
  Award,
  Heart,
  MessageSquare,
  Eye,
  Settings,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Info,
  Workflow,
  Users,
  CheckSquare,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CandidateDashboardView,
  AssessmentReview,
  FinalDecision,
  ReviewStatus,
  HiringRecommendation,
  AssessmentRoleCategory,
  ROLE_CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS
} from "@/types/assessmentEngine";
interface ApprovalWorkflowSystemProps {
  candidates?: CandidateDashboardView[]; // Accept array of real candidates
  candidate?: CandidateDashboardView;
  review?: AssessmentReview;
  onApprove?: (candidateId: string, staffData?: StaffCreationData) => Promise<void>;
  onReject?: (candidateId: string, reason: string) => Promise<void>;
  onRequestChanges?: (candidateId: string, changes: string[]) => Promise<void>;
  onScheduleInterview?: (candidateId: string, interviewData: InterviewData) => Promise<void>;
  className?: string;
}

interface StaffCreationData {
  full_name: string;
  email: string;
  phone?: string;
  start_date: string;
  position: string;
  department: string;
  location: string;
  manager: string;
  contract_type: 'permanent' | 'temporary' | 'internship';
  hours_per_week: number;
  salary_amount?: number;
  hourly_wage?: number;
  employee_number?: string;
  notes?: string;
}

interface InterviewData {
  interviewer: string;
  interview_date: string;
  interview_time: string;
  interview_type: 'in_person' | 'video' | 'phone';
  location_or_link?: string;
  duration_minutes: number;
  preparation_notes?: string;
}

// NO MORE MOCKS - Real data only! 🎯

const TEDDYKIDS_LOCATIONS = [
  'Amsterdam Central',
  'Amsterdam Noord',
  'Utrecht Centrum',
  'Den Haag',
  'Rotterdam',
  'Eindhoven',
  'Groningen'
];

const TEDDYKIDS_DEPARTMENTS = [
  'Nursery (0-2 years)',
  'Toddler Care (2-4 years)',
  'BSO (4-12 years)',
  'Special Needs',
  'Administration',
  'Kitchen',
  'Maintenance',
  'Management'
];

const MANAGERS = [
  'Sarah de Vries - Lead Supervisor',
  'Mark Jansen - Department Head',
  'Lisa van Meer - Site Manager',
  'Tom Bakker - Regional Manager'
];

export default function ApprovalWorkflowSystem({
  candidates = [],
  candidate: candidateProp,
  review, // NO MOCK FALLBACK!
  onApprove,
  onReject,
  onRequestChanges,
  onScheduleInterview,
  className
}: ApprovalWorkflowSystemProps) {
  // Use REAL candidates data passed from parent
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const selectedCandidate = selectedCandidateId 
    ? candidates.find(c => c.id === selectedCandidateId)
    : candidates[0]; // Default to first candidate
  
  // Use real candidate - NO MOCK FALLBACK!
  const candidate = selectedCandidate || candidateProp;
  
  // If no candidate, show empty state
  if (!candidate) {
    return (
      <Card className={cn("bg-black/20 border-purple-500/30", className)}>
        <CardContent className="p-12 text-center">
          <Users className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Candidates for Approval
          </h3>
          <p className="text-purple-300">
            Select a candidate from the dashboard to review and approve.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const [selectedTab, setSelectedTab] = useState('review');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestedChanges, setRequestedChanges] = useState<string[]>([]);
  const [newChange, setNewChange] = useState('');

  // Staff creation form data
  const [staffData, setStaffData] = useState<StaffCreationData>({
    full_name: candidate.full_name,
    email: candidate.email,
    start_date: '',
    position: candidate.position_applied,
    department: '',
    location: '',
    manager: '',
    contract_type: 'permanent',
    hours_per_week: 32,
    employee_number: '',
    notes: ''
  });

  // Interview scheduling data
  const [interviewData, setInterviewData] = useState<InterviewData>({
    interviewer: '',
    interview_date: '',
    interview_time: '',
    interview_type: 'in_person',
    duration_minutes: 60,
    preparation_notes: ''
  });

  const handleApproval = async () => {
    if (!onApprove) return;

    setIsProcessing(true);
    try {
      await onApprove(candidate.id, staffData);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejection = async () => {
    if (!onReject || !rejectionReason.trim()) return;

    setIsProcessing(true);
    try {
      await onReject(candidate.id, rejectionReason);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!onRequestChanges || requestedChanges.length === 0) return;

    setIsProcessing(true);
    try {
      await onRequestChanges(candidate.id, requestedChanges);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!onScheduleInterview) return;

    setIsProcessing(true);
    try {
      await onScheduleInterview(candidate.id, interviewData);
    } finally {
      setIsProcessing(false);
    }
  };

  const addChange = () => {
    if (newChange.trim() && !requestedChanges.includes(newChange.trim())) {
      setRequestedChanges([...requestedChanges, newChange.trim()]);
      setNewChange('');
    }
  };

  const removeChange = (index: number) => {
    setRequestedChanges(requestedChanges.filter((_, i) => i !== index));
  };

  const generateEmployeeNumber = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setStaffData(prev => ({ ...prev, employee_number: `TK${year}${month}${random}` }));
  };

  const workflowSteps = [
    { id: 'assessment', label: 'Assessment', status: 'completed', icon: CheckCircle },
    { id: 'review', label: 'Review', status: review.review_status === 'completed' ? 'completed' : 'current', icon: Eye },
    { id: 'decision', label: 'Decision', status: review.final_decision ? 'completed' : 'pending', icon: UserCheck },
    { id: 'integration', label: 'Staff Integration', status: 'pending', icon: Users }
  ];

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'current': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'pending': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl">
              {candidate.full_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-white">{candidate.full_name}</h1>
            <p className="text-purple-300">{candidate.position_applied}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {ROLE_CATEGORY_LABELS[candidate.role_category]}
              </Badge>
              <Badge className={cn("text-xs", STATUS_COLORS[candidate.overall_status])}>
                {STATUS_LABELS[candidate.overall_status]}
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
            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Profile
          </Button>
          <Button
            variant="outline"
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Assessment
          </Button>
        </div>
      </div>

      {/* Workflow Progress */}
      <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Workflow className="h-5 w-5 text-purple-400" />
            Approval Workflow Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === workflowSteps.length - 1;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-full border-2 flex items-center justify-center",
                      getStepColor(step.status)
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-sm font-medium text-white">{step.label}</div>
                      <div className={cn(
                        "text-xs capitalize",
                        step.status === 'completed' ? 'text-green-400' :
                        step.status === 'current' ? 'text-blue-400' : 'text-gray-400'
                      )}>
                        {step.status}
                      </div>
                    </div>
                  </div>
                  {!isLast && (
                    <div className={cn(
                      "w-16 h-0.5 mx-4 -mt-6",
                      step.status === 'completed' ? 'bg-green-500' : 'bg-gray-500/30'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Workflow Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-black/30 border-purple-500/30">
          <TabsTrigger value="review" className="data-[state=active]:bg-purple-500/30">
            <Eye className="h-4 w-4 mr-2" />
            Review
          </TabsTrigger>
          <TabsTrigger value="decision" className="data-[state=active]:bg-purple-500/30">
            <CheckSquare className="h-4 w-4 mr-2" />
            Decision
          </TabsTrigger>
          <TabsTrigger value="staff-setup" className="data-[state=active]:bg-purple-500/30">
            <User className="h-4 w-4 mr-2" />
            Staff Setup
          </TabsTrigger>
          <TabsTrigger value="interview" className="data-[state=active]:bg-purple-500/30">
            <Calendar className="h-4 w-4 mr-2" />
            Interview
          </TabsTrigger>
        </TabsList>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Candidate Summary */}
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-400" />
                  Candidate Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-300">Email</Label>
                    <div className="text-white text-sm">{candidate.email}</div>
                  </div>
                  <div>
                    <Label className="text-purple-300">Application Date</Label>
                    <div className="text-white text-sm">
                      {new Date(candidate.application_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-purple-300">Assessment Score</Label>
                    <div className="text-white text-sm">{candidate.overall_score}%</div>
                  </div>
                  <div>
                    <Label className="text-purple-300">AI Match Score</Label>
                    <div className="text-white text-sm">{candidate.ai_match_score}%</div>
                  </div>
                  <div>
                    <Label className="text-purple-300">Source</Label>
                    <div className="text-white text-sm capitalize">{candidate.application_source}</div>
                  </div>
                  <div>
                    <Label className="text-purple-300">Status</Label>
                    <Badge className={cn("text-xs", STATUS_COLORS[candidate.overall_status])}>
                      {STATUS_LABELS[candidate.overall_status]}
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-purple-500/20" />

                <div>
                  <Label className="text-purple-300">Assessment Completion</Label>
                  <div className="mt-2">
                    <Progress value={candidate.progress_percentage} className="h-2" />
                    <div className="text-xs text-purple-400 mt-1">
                      {candidate.progress_percentage}% complete
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Status */}
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Review Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-purple-300">Review ID</Label>
                  <div className="text-white text-sm font-mono">{review.id}</div>
                </div>

                <div>
                  <Label className="text-purple-300">Status</Label>
                  <Badge className={cn(
                    "ml-2",
                    review.review_status === 'completed' ? "bg-green-500/20 text-green-300 border-green-500/30" :
                    review.review_status === 'in_review' ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                    "bg-orange-500/20 text-orange-300 border-orange-500/30"
                  )}>
                    {review.review_status}
                  </Badge>
                </div>

                <div>
                  <Label className="text-purple-300">Priority Level</Label>
                  <div className="flex items-center gap-2">
                    <div className="text-white text-sm">{review.priority_level}/5</div>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-2 h-2 rounded-full mr-1",
                            i < review.priority_level ? "bg-orange-400" : "bg-gray-600"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-purple-300">Created</Label>
                  <div className="text-white text-sm">
                    {new Date(review.created_at).toLocaleString()}
                  </div>
                </div>

                {review.assigned_to && (
                  <div>
                    <Label className="text-purple-300">Assigned Reviewer</Label>
                    <div className="text-white text-sm">{review.assigned_to}</div>
                  </div>
                )}

                {review.reviewer_notes && (
                  <div>
                    <Label className="text-purple-300">Reviewer Notes</Label>
                    <div className="text-white text-sm p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      {review.reviewer_notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-400" />
                Quick Review Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => setSelectedTab('decision')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Approve for Hiring
                </Button>
                <Button
                  onClick={() => setSelectedTab('interview')}
                  variant="outline"
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Request Changes
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decision Tab */}
        <TabsContent value="decision" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Approval Section */}
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-400" />
                  Approve for Hiring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-300 font-medium">Ready for Staff Integration</span>
                  </div>
                  <p className="text-green-400 text-sm">
                    This candidate has passed all assessments and is recommended for hiring.
                    Proceeding will create a staff profile and begin onboarding.
                  </p>
                </div>

                <Button
                  onClick={() => setSelectedTab('staff-setup')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Proceed to Staff Setup
                </Button>
              </CardContent>
            </Card>

            {/* Rejection Section */}
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserX className="h-5 w-5 text-red-400" />
                  Reject Application
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rejection-reason" className="text-purple-300">Rejection Reason *</Label>
                  <Textarea
                    id="rejection-reason"
                    name="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a clear reason for rejection..."
                    className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-400 min-h-[100px]"
                  />
                </div>

                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-400" />
                    <span className="text-red-300 font-medium">Permanent Decision</span>
                  </div>
                  <p className="text-red-400 text-sm">
                    Rejecting this application will permanently remove the candidate from consideration.
                    This action cannot be undone.
                  </p>
                </div>

                <Button
                  onClick={handleRejection}
                  disabled={!rejectionReason.trim() || isProcessing}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Reject Application
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Request Changes Section */}
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-yellow-400" />
                Request Changes or Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  id="new-change-request"
                  name="newChangeRequest"
                  value={newChange}
                  onChange={(e) => setNewChange(e.target.value)}
                  placeholder="Add a change request..."
                  className="bg-black/30 border-purple-500/30 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addChange()}
                  aria-label="Add change request"
                />
                <Button
                  onClick={addChange}
                  disabled={!newChange.trim()}
                  variant="outline"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>

              {requestedChanges.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-purple-300">Requested Changes:</Label>
                  {requestedChanges.map((change, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <span className="text-white text-sm">{change}</span>
                      <Button
                        onClick={() => removeChange(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    onClick={handleRequestChanges}
                    disabled={isProcessing}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white mt-4"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Change Requests
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Setup Tab */}
        <TabsContent value="staff-setup" className="space-y-6">
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-purple-400" />
                Staff Profile Creation
              </CardTitle>
              <p className="text-purple-300 text-sm">
                Configure the staff profile for integration into the TeddyKids system
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="staff-full-name" className="text-purple-300">Full Name *</Label>
                    <Input
                      id="staff-full-name"
                      name="fullName"
                      value={staffData.full_name}
                      onChange={(e) => setStaffData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="bg-black/30 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff-email" className="text-purple-300">Email *</Label>
                    <Input
                      id="staff-email"
                      name="email"
                      type="email"
                      value={staffData.email}
                      onChange={(e) => setStaffData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-black/30 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff-phone" className="text-purple-300">Phone</Label>
                    <Input
                      id="staff-phone"
                      name="phone"
                      type="tel"
                      value={staffData.phone || ''}
                      onChange={(e) => setStaffData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-black/30 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff-employee-number" className="text-purple-300">Employee Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="staff-employee-number"
                        name="employeeNumber"
                        value={staffData.employee_number || ''}
                        onChange={(e) => setStaffData(prev => ({ ...prev, employee_number: e.target.value }))}
                        placeholder="Auto-generate or enter manually"
                        className="bg-black/30 border-purple-500/30 text-white"
                      />
                      <Button
                        onClick={generateEmployeeNumber}
                        variant="outline"
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-purple-500/20" />

              {/* Employment Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Employment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="staff-position" className="text-purple-300">Position *</Label>
                    <Input
                      id="staff-position"
                      name="position"
                      value={staffData.position}
                      onChange={(e) => setStaffData(prev => ({ ...prev, position: e.target.value }))}
                      className="bg-black/30 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff-department" className="text-purple-300">Department *</Label>
                    <Select
                      name="department"
                      value={staffData.department}
                      onValueChange={(value) => setStaffData(prev => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger id="staff-department" className="bg-black/30 border-purple-500/30">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEDDYKIDS_DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-purple-300">Location *</Label>
                    <Select
                      value={staffData.location}
                      onValueChange={(value) => setStaffData(prev => ({ ...prev, location: value }))}
                    >
                      <SelectTrigger className="bg-black/30 border-purple-500/30">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEDDYKIDS_LOCATIONS.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-purple-300">Manager *</Label>
                    <Select
                      value={staffData.manager}
                      onValueChange={(value) => setStaffData(prev => ({ ...prev, manager: value }))}
                    >
                      <SelectTrigger className="bg-black/30 border-purple-500/30">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {MANAGERS.map((manager) => (
                          <SelectItem key={manager} value={manager}>
                            {manager}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-purple-300">Start Date *</Label>
                    <Input
                      type="date"
                      value={staffData.start_date}
                      onChange={(e) => setStaffData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="bg-black/30 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-300">Contract Type *</Label>
                    <Select
                      value={staffData.contract_type}
                      onValueChange={(value) => setStaffData(prev => ({ ...prev, contract_type: value as any }))}
                    >
                      <SelectTrigger className="bg-black/30 border-purple-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="permanent">Permanent</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="bg-purple-500/20" />

              {/* Compensation */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Compensation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-purple-300">Hours per Week *</Label>
                    <Input
                      type="number"
                      value={staffData.hours_per_week}
                      onChange={(e) => setStaffData(prev => ({ ...prev, hours_per_week: parseInt(e.target.value) || 0 }))}
                      min="1"
                      max="40"
                      className="bg-black/30 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-300">Monthly Salary (€)</Label>
                    <Input
                      type="number"
                      value={staffData.salary_amount || ''}
                      onChange={(e) => setStaffData(prev => ({ ...prev, salary_amount: parseInt(e.target.value) || undefined }))}
                      placeholder="Optional"
                      className="bg-black/30 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-300">Hourly Wage (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={staffData.hourly_wage || ''}
                      onChange={(e) => setStaffData(prev => ({ ...prev, hourly_wage: parseFloat(e.target.value) || undefined }))}
                      placeholder="Optional"
                      className="bg-black/30 border-purple-500/30 text-white"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-purple-500/20" />

              {/* Notes */}
              <div>
                <Label className="text-purple-300">Additional Notes</Label>
                <Textarea
                  value={staffData.notes || ''}
                  onChange={(e) => setStaffData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information for the staff profile..."
                  className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleApproval}
                  disabled={!staffData.full_name || !staffData.email || !staffData.start_date || !staffData.department || !staffData.location || !staffData.manager || isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating Staff Profile...
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Create Staff Profile & Approve
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTab('review')}
                  className="border-gray-500/30 text-gray-300 hover:bg-gray-500/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interview Tab */}
        <TabsContent value="interview" className="space-y-6">
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                Schedule Interview
              </CardTitle>
              <p className="text-purple-300 text-sm">
                Schedule an interview before making final hiring decision
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-purple-300">Interviewer *</Label>
                  <Select
                    value={interviewData.interviewer}
                    onValueChange={(value) => setInterviewData(prev => ({ ...prev, interviewer: value }))}
                  >
                    <SelectTrigger className="bg-black/30 border-purple-500/30">
                      <SelectValue placeholder="Select interviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {MANAGERS.map((manager) => (
                        <SelectItem key={manager} value={manager}>
                          {manager}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-purple-300">Interview Type *</Label>
                  <Select
                    value={interviewData.interview_type}
                    onValueChange={(value) => setInterviewData(prev => ({ ...prev, interview_type: value as any }))}
                  >
                    <SelectTrigger className="bg-black/30 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-purple-300">Date *</Label>
                  <Input
                    type="date"
                    value={interviewData.interview_date}
                    onChange={(e) => setInterviewData(prev => ({ ...prev, interview_date: e.target.value }))}
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-purple-300">Time *</Label>
                  <Input
                    type="time"
                    value={interviewData.interview_time}
                    onChange={(e) => setInterviewData(prev => ({ ...prev, interview_time: e.target.value }))}
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-purple-300">Duration (minutes) *</Label>
                  <Select
                    value={interviewData.duration_minutes.toString()}
                    onValueChange={(value) => setInterviewData(prev => ({ ...prev, duration_minutes: parseInt(value) }))}
                  >
                    <SelectTrigger className="bg-black/30 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-purple-300">Location/Link</Label>
                  <Input
                    value={interviewData.location_or_link || ''}
                    onChange={(e) => setInterviewData(prev => ({ ...prev, location_or_link: e.target.value }))}
                    placeholder={interviewData.interview_type === 'in_person' ? 'Office location' : 'Video call link'}
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-purple-300">Preparation Notes</Label>
                <Textarea
                  value={interviewData.preparation_notes || ''}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, preparation_notes: e.target.value }))}
                  placeholder="Notes for the interviewer about focus areas, concerns, or specific topics to cover..."
                  className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-400 min-h-[100px]"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleScheduleInterview}
                  disabled={!interviewData.interviewer || !interviewData.interview_date || !interviewData.interview_time || isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Interview
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTab('review')}
                  className="border-gray-500/30 text-gray-300 hover:bg-gray-500/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}