import React, { useState, useEffect } from 'react';
import { 
  useReviewTemplates, 
  useCreateReview, 
  useUpdateReview, 
  useCompleteReview,
  useDISCMiniQuestions,
  useStaffGoals
} from '@/lib/hooks/useReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Save, CheckCircle, Star, Calendar, User, Trophy, DollarSign, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { SelfAssessment } from './SelfAssessment';
import { DISCMiniQuestions } from './DISCMiniQuestions';
import { calculateAverageRating, calculateRatingDelta, CORE_METRICS } from '@/lib/reviewMetrics';
import { calculateDISCFromMiniQuestions } from '@/lib/discIntegration';

interface ReviewFormProps {
  reviewId?: string;
  staffId?: string;
  templateId?: string;
  reviewType?: 'six_month' | 'yearly' | 'performance' | 'probation' | 'exit' | 'promotion_review' | 'salary_review' | 'warning';
  mode?: 'create' | 'edit' | 'complete';
  onSave?: (reviewData: any) => void;
  onCancel?: () => void;
  className?: string;
}

interface QuestionData {
  question: string;
  type: 'text' | 'rating' | 'boolean' | 'select';
  required: boolean;
  options?: string[];
}

interface ReviewTemplate {
  id: string;
  name: string;
  type: string;
  questions: QuestionData[];
  criteria: Record<string, number>;
  scoring_method: 'five_star' | 'percentage' | 'qualitative';
}

export function ReviewForm({
  reviewId,
  staffId,
  templateId,
  reviewType = 'six_month',
  mode = 'create',
  onSave,
  onCancel,
  className
}: ReviewFormProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(templateId || '');
  const [formData, setFormData] = useState({
    staff_id: staffId || '',
    reviewer_id: '',
    review_type: reviewType,
    review_date: format(new Date(), 'yyyy-MM-dd'),
    responses: {} as Record<string, any>,
    summary: '',
    goals_next: [] as string[],
    development_areas: [] as string[],
    achievements: [] as string[],
    overall_score: 0,
    star_rating: 0,
    performance_level: 'meets' as const,
    promotion_ready: false,
    salary_recommendation: 'maintain' as const,
    signed_by_employee: false,
    signed_by_reviewer: false,
    
    // ===== v1.1 FIELDS =====
    self_assessment: {
      self_ratings: {} as Record<string, number>,
      proud_moment: '',
      work_on: '',
      how_supported: 0
    },
    disc_responses: {} as Record<string, number>,
    emotional_scores: {
      empathy: 0,
      stress_tolerance: 0,
      emotional_regulation: 0,
      team_support: 0,
      conflict_resolution: 0
    },
    xp_earned: 0,
    review_trigger_type: 'manual' as const,
    warning_level: undefined as number | undefined,
    behavior_score: undefined as number | undefined,
    impact_score: undefined as number | undefined,
    support_suggestions: [] as string[],
    promotion_readiness_score: undefined as number | undefined,
    leadership_potential_score: undefined as number | undefined,
    salary_suggestion_reason: '',
    future_raise_goal: '',
    adaptability_speed: undefined as number | undefined,
    initiative_taken: undefined as number | undefined,
    team_reception_score: undefined as number | undefined
  });

  const { data: templates = [], isLoading: templatesLoading } = useReviewTemplates();
  const { data: discQuestions = [] } = useDISCMiniQuestions(3);
  const { data: previousGoals = [] } = useStaffGoals(staffId || '', false);
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const completeReview = useCompleteReview();

  const selectedTemplate = templates.find((t: ReviewTemplate) => t.id === selectedTemplateId);
  
  // Check if template requires self-assessment or DISC
  const showSelfAssessment = selectedTemplate?.self_assessment_required !== false; // Default true
  const showDISC = selectedTemplate?.disc_injection_enabled !== false && discQuestions.length > 0;

  useEffect(() => {
    if (templateId && !selectedTemplateId) {
      setSelectedTemplateId(templateId);
    }
  }, [templateId, selectedTemplateId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResponseChange = (questionIndex: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionIndex]: value
      }
    }));
  };

  const handleArrayFieldChange = (field: 'goals_next' | 'development_areas' | 'achievements', index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      if (value.trim()) {
        newArray[index] = value;
      } else {
        newArray.splice(index, 1);
      }
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const addArrayField = (field: 'goals_next' | 'development_areas' | 'achievements') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const calculateOverallScore = () => {
    if (!selectedTemplate || selectedTemplate.scoring_method !== 'five_star') return 0;
    return calculateAverageRating(formData.responses);
  };
  
  const calculateSelfVsManagerDelta = () => {
    if (!showSelfAssessment || !formData.self_assessment.self_ratings) return 0;
    return calculateRatingDelta(formData.responses, formData.self_assessment.self_ratings);
  };

  const handleSave = async () => {
    // Calculate v1.1 fields
    const overallScore = calculateOverallScore();
    const selfDelta = calculateSelfVsManagerDelta();
    
    // Calculate DISC profile from responses
    let discSnapshot = null;
    if (showDISC && Object.keys(formData.disc_responses).length === discQuestions.length) {
      const discProfile = calculateDISCFromMiniQuestions(
        discQuestions.map((q, idx) => ({
          question_id: q.id,
          selected_option_index: formData.disc_responses[q.id],
          question: q
        }))
      );
      
      discSnapshot = {
        profile: discProfile,
        primary_color: Object.entries(discProfile).sort((a, b) => b[1] - a[1])[0][0],
        assessment_date: new Date().toISOString(),
        assessment_type: 'mini',
        confidence_level: 'medium'
      };
    }
    
    // Calculate XP reward from template
    const xpEarned = selectedTemplate?.xp_reward || 100;
    
    // Build reviewData with ONLY database columns (exclude UI-only fields)
    const reviewData = {
      staff_id: formData.staff_id,
      reviewer_id: formData.reviewer_id,
      review_type: formData.review_type,
      review_date: formData.review_date,
      responses: formData.responses,
      summary: formData.summary,
      goals_next: formData.goals_next,
      development_areas: formData.development_areas,
      achievements: formData.achievements,
      overall_score: overallScore,
      star_rating: formData.star_rating,
      performance_level: formData.performance_level,
      promotion_ready: formData.promotion_ready,
      salary_recommendation: formData.salary_recommendation,
      signed_by_employee: formData.signed_by_employee,
      signed_by_reviewer: formData.signed_by_reviewer,
      template_id: selectedTemplateId,
      
      // v1.1 fields
      self_assessment: formData.self_assessment,
      manager_vs_self_delta: selfDelta,
      disc_snapshot: discSnapshot,
      disc_questions_answered: formData.disc_responses, // Map disc_responses to disc_questions_answered
      xp_earned: xpEarned,
      wellbeing_score: formData.self_assessment.how_supported || 0
    };

    try {
      if (mode === 'create') {
        await createReview.mutateAsync(reviewData);
      } else if (mode === 'complete') {
        await completeReview.mutateAsync({
          reviewId: reviewId!,
          reviewData: {
            ...reviewData,
            signed_by_reviewer: true
          }
        });
      } else {
        await updateReview.mutateAsync({
          reviewId: reviewId!,
          updates: reviewData
        });
      }

      onSave?.(reviewData);
    } catch (error) {
      console.error('Failed to save review:', error);
    }
  };

  const renderQuestion = (question: QuestionData, index: number) => {
    const response = formData.responses[index];

    switch (question.type) {
      case 'text':
        return (
          <Textarea
            value={response || ''}
            onChange={(e) => handleResponseChange(index, e.target.value)}
            placeholder="Enter your response..."
            className="min-h-[100px]"
          />
        );

      case 'rating':
        return (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleResponseChange(index, rating)}
                className={`p-2 rounded transition-colors ${
                  response >= rating
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              >
                <Star className={`h-6 w-6 ${response >= rating ? 'fill-current' : ''}`} />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {response ? `${response}/5` : 'Not rated'}
            </span>
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={`question_${index}`}
                checked={response === true}
                onChange={() => handleResponseChange(index, true)}
                className="text-primary"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={`question_${index}`}
                checked={response === false}
                onChange={() => handleResponseChange(index, false)}
                className="text-primary"
              />
              <span>No</span>
            </label>
          </div>
        );

      case 'select':
        return (
          <Select value={response || ''} onValueChange={(value) => handleResponseChange(index, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  if (templatesLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading review form...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'create' && <Calendar className="h-5 w-5" />}
          {mode === 'edit' && <Save className="h-5 w-5" />}
          {mode === 'complete' && <CheckCircle className="h-5 w-5" />}
          {mode === 'create' ? 'Schedule New Review' : mode === 'edit' ? 'Edit Review' : 'Complete Review'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-2">
          <Label htmlFor="template">Review Template</Label>
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a review template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template: ReviewTemplate) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name} ({template.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="review_date">Review Date</Label>
            <Input
              id="review_date"
              type="date"
              value={formData.review_date}
              onChange={(e) => handleInputChange('review_date', e.target.value)}
            />
          </div>
        </div>

        {/* Template Questions */}
        {selectedTemplate && (
          <div className="space-y-6">
            <Separator />
            <div>
              <h3 className="text-lg font-medium mb-4">Review Questions</h3>
              <div className="space-y-6">
                {selectedTemplate.questions.map((question: QuestionData, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {question.question}
                      {question.required && <Badge variant="destructive">Required</Badge>}
                    </Label>
                    {renderQuestion(question, index)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== v1.1 SECTIONS ===== */}
        
        {/* Self-Assessment Section */}
        {showSelfAssessment && (mode === 'edit' || mode === 'complete') && (
          <div className="space-y-4">
            <Separator />
            <SelfAssessment
              reviewType={formData.review_type}
              value={formData.self_assessment}
              onChange={(assessment) => handleInputChange('self_assessment', assessment)}
              readOnly={mode === 'complete'}
            />
          </div>
        )}

        {/* DISC Mini Questions */}
        {showDISC && staffId && (mode === 'edit' || mode === 'complete') && (
          <div className="space-y-4">
            <Separator />
            <DISCMiniQuestions
              staffId={staffId}
              questions={discQuestions}
              responses={formData.disc_responses}
              onChange={(responses) => handleInputChange('disc_responses', responses)}
              readOnly={mode === 'complete'}
            />
          </div>
        )}

        {/* Review-Type Specific Fields */}
        {(mode === 'edit' || mode === 'complete') && (
          <>
            {/* First Month / Probation Specific */}
            {formData.review_type === 'probation' && (
              <div className="space-y-4">
                <Separator />
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">🌱</span>
                      First Month Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Adaptability Speed (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={formData.adaptability_speed || ''}
                          onChange={(e) => handleInputChange('adaptability_speed', parseFloat(e.target.value))}
                          placeholder="1.0 - 5.0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Initiative Taken (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={formData.initiative_taken || ''}
                          onChange={(e) => handleInputChange('initiative_taken', parseFloat(e.target.value))}
                          placeholder="1.0 - 5.0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Team Reception (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={formData.team_reception_score || ''}
                          onChange={(e) => handleInputChange('team_reception_score', parseFloat(e.target.value))}
                          placeholder="1.0 - 5.0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Warning / Intervention Specific */}
            {formData.review_type === 'warning' && (
              <div className="space-y-4">
                <Separator />
                <Card className="border-red-200 bg-red-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Warning / Intervention Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Warning Level</Label>
                        <Select 
                          value={formData.warning_level?.toString() || ''} 
                          onValueChange={(value) => handleInputChange('warning_level', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Level 1 (Verbal)</SelectItem>
                            <SelectItem value="2">Level 2 (Written)</SelectItem>
                            <SelectItem value="3">Level 3 (Final)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Behavior Score (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={formData.behavior_score || ''}
                          onChange={(e) => handleInputChange('behavior_score', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Impact Score (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={formData.impact_score || ''}
                          onChange={(e) => handleInputChange('impact_score', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Support Suggestions</Label>
                      <Textarea
                        value={formData.support_suggestions.join('\n')}
                        onChange={(e) => handleInputChange('support_suggestions', e.target.value.split('\n').filter(s => s.trim()))}
                        placeholder="Enter support suggestions (one per line)..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Promotion Review Specific */}
            {formData.review_type === 'promotion_review' && (
              <div className="space-y-4">
                <Separator />
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-purple-600" />
                      Promotion Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Promotion Readiness (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={formData.promotion_readiness_score || ''}
                          onChange={(e) => handleInputChange('promotion_readiness_score', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Leadership Potential (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={formData.leadership_potential_score || ''}
                          onChange={(e) => handleInputChange('leadership_potential_score', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Salary Review Specific */}
            {formData.review_type === 'salary_review' && (
              <div className="space-y-4">
                <Separator />
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Salary Review Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Reason for Salary Suggestion</Label>
                      <Textarea
                        value={formData.salary_suggestion_reason}
                        onChange={(e) => handleInputChange('salary_suggestion_reason', e.target.value)}
                        placeholder="Explain the reasoning for the salary recommendation..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Future Raise Goal / Milestones</Label>
                      <Textarea
                        value={formData.future_raise_goal}
                        onChange={(e) => handleInputChange('future_raise_goal', e.target.value)}
                        placeholder="What should they achieve to be eligible for the next raise?"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Performance Assessment */}
        {(mode === 'edit' || mode === 'complete') && (
          <div className="space-y-6">
            <Separator />
            <div>
              <h3 className="text-lg font-medium mb-4">Performance Assessment</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Overall Star Rating</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleInputChange('star_rating', rating)}
                        className={`p-1 rounded transition-colors ${
                          formData.star_rating >= rating
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                      >
                        <Star className={`h-8 w-8 ${formData.star_rating >= rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Performance Level</Label>
                  <Select value={formData.performance_level} onValueChange={(value) => handleInputChange('performance_level', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exceptional">Exceptional</SelectItem>
                      <SelectItem value="exceeds">Exceeds Expectations</SelectItem>
                      <SelectItem value="meets">Meets Expectations</SelectItem>
                      <SelectItem value="below">Below Expectations</SelectItem>
                      <SelectItem value="unsatisfactory">Unsatisfactory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Salary Recommendation</Label>
                  <Select value={formData.salary_recommendation} onValueChange={(value) => handleInputChange('salary_recommendation', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">Increase</SelectItem>
                      <SelectItem value="maintain">Maintain</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                      <SelectItem value="decrease">Decrease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="promotion_ready"
                    checked={formData.promotion_ready}
                    onCheckedChange={(checked) => handleInputChange('promotion_ready', checked)}
                  />
                  <Label htmlFor="promotion_ready">Ready for promotion</Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Goals and Development */}
        {(mode === 'edit' || mode === 'complete') && (
          <div className="space-y-6">
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Goals & Development</h3>

              {/* Goals for Next Period */}
              <div className="space-y-2">
                <Label>Goals for Next Period</Label>
                {formData.goals_next.map((goal, index) => (
                  <Input
                    key={index}
                    value={goal}
                    onChange={(e) => handleArrayFieldChange('goals_next', index, e.target.value)}
                    placeholder={`Goal ${index + 1}`}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('goals_next')}
                >
                  Add Goal
                </Button>
              </div>

              {/* Development Areas */}
              <div className="space-y-2">
                <Label>Development Areas</Label>
                {formData.development_areas.map((area, index) => (
                  <Input
                    key={index}
                    value={area}
                    onChange={(e) => handleArrayFieldChange('development_areas', index, e.target.value)}
                    placeholder={`Development area ${index + 1}`}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('development_areas')}
                >
                  Add Development Area
                </Button>
              </div>

              {/* Achievements */}
              <div className="space-y-2">
                <Label>Key Achievements</Label>
                {formData.achievements.map((achievement, index) => (
                  <Input
                    key={index}
                    value={achievement}
                    onChange={(e) => handleArrayFieldChange('achievements', index, e.target.value)}
                    placeholder={`Achievement ${index + 1}`}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('achievements')}
                >
                  Add Achievement
                </Button>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <Label htmlFor="summary">Review Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Provide an overall summary of the review..."
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Signatures */}
        {mode === 'complete' && (
          <div className="space-y-4">
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sign-off</h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="signed_by_reviewer"
                    checked={formData.signed_by_reviewer}
                    onCheckedChange={(checked) => handleInputChange('signed_by_reviewer', checked)}
                  />
                  <Label htmlFor="signed_by_reviewer">I confirm this review as the reviewer</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="signed_by_employee"
                    checked={formData.signed_by_employee}
                    onCheckedChange={(checked) => handleInputChange('signed_by_employee', checked)}
                  />
                  <Label htmlFor="signed_by_employee">Employee has acknowledged this review</Label>
                </div>
              </div>

              {selectedTemplate?.scoring_method === 'five_star' && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium mb-2">Calculated Overall Score</div>
                  <div className="text-2xl font-bold text-primary">
                    {calculateOverallScore()}/5.0
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={createReview.isPending || updateReview.isPending || completeReview.isPending}
          >
            {createReview.isPending || updateReview.isPending || completeReview.isPending ? (
              'Saving...'
            ) : mode === 'create' ? (
              'Schedule Review'
            ) : mode === 'complete' ? (
              'Complete Review'
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}