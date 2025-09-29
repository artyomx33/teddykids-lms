import React, { useState, useEffect } from 'react';
import { useReviewTemplates, useCreateReview, useUpdateReview, useCompleteReview } from '@/lib/hooks/useReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Save, CheckCircle, Star, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewFormProps {
  reviewId?: string;
  staffId?: string;
  templateId?: string;
  reviewType?: 'six_month' | 'yearly' | 'performance' | 'probation' | 'exit';
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
    due_date: '',
    review_period_start: '',
    review_period_end: '',
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
    signed_by_reviewer: false
  });

  const { data: templates = [], isLoading: templatesLoading } = useReviewTemplates();
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const completeReview = useCompleteReview();

  const selectedTemplate = templates.find((t: ReviewTemplate) => t.id === selectedTemplateId);

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

    const responses = Object.values(formData.responses);
    const ratingResponses = responses.filter(r => typeof r === 'number' && r >= 1 && r <= 5);

    if (ratingResponses.length === 0) return 0;

    const average = ratingResponses.reduce((sum, rating) => sum + rating, 0) / ratingResponses.length;
    return Math.round(average * 100) / 100;
  };

  const handleSave = async () => {
    const reviewData = {
      ...formData,
      template_id: selectedTemplateId,
      overall_score: calculateOverallScore()
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

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review_period_start">Review Period Start</Label>
            <Input
              id="review_period_start"
              type="date"
              value={formData.review_period_start}
              onChange={(e) => handleInputChange('review_period_start', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review_period_end">Review Period End</Label>
            <Input
              id="review_period_end"
              type="date"
              value={formData.review_period_end}
              onChange={(e) => handleInputChange('review_period_end', e.target.value)}
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