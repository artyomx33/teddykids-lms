import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle, Save } from 'lucide-react';

import { SectionErrorBoundary } from '@/components/error-boundaries/SectionErrorBoundary';
import { SelfAssessment } from '../SelfAssessment';
import { DISCMiniQuestions } from '../DISCMiniQuestions';
import { useReviewFormContext } from './context/ReviewFormContext';

import { TemplateQuestionsSection } from './sections/TemplateQuestionsSection';
import { PerformanceAssessmentSection } from './sections/PerformanceAssessmentSection';
import { GoalsSection } from './sections/GoalsSection';
import { ReviewTypeSpecificSection } from './sections/ReviewTypeSpecificSection';
import { SignaturesSection } from './sections/SignaturesSection';

export function ReviewFormContent() {
  const {
    state,
    templates,
    selectedTemplateId,
    selectTemplate,
    selectedTemplate,
    discQuestions,
    showSelfAssessment,
    showDISC,
    mode,
    updateField,
    submitReview,
    isSubmitting,
    onCancel,
  } = useReviewFormContext();

  return (
    <Card>
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
        <SectionErrorBoundary section="Template Selection">
          <div className="space-y-2">
            <Label htmlFor="template">Review Template</Label>
            <Select value={selectedTemplateId} onValueChange={selectTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a review template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SectionErrorBoundary>

        {/* Basic Information */}
        <SectionErrorBoundary section="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="review_date">Review Date</Label>
              <Input
                id="review_date"
                type="date"
                value={state.review_date}
                onChange={(e) => updateField('review_date', e.target.value)}
              />
            </div>
          </div>
        </SectionErrorBoundary>

        {/* Template Questions */}
        {selectedTemplate && (
          <SectionErrorBoundary section="Template Questions">
            <TemplateQuestionsSection />
          </SectionErrorBoundary>
        )}

        {/* Self-Assessment Section */}
        {showSelfAssessment && (mode === 'edit' || mode === 'complete') && (
          <SectionErrorBoundary section="Self Assessment">
            <div className="space-y-4">
              <Card className="border-green-200 bg-green-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💭</span>
                    Self-Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SelfAssessment
                    reviewType={state.review_type}
                    value={state.self_assessment}
                    onChange={(assessment) => updateField('self_assessment', assessment)}
                    readOnly={mode === 'complete'}
                  />
                </CardContent>
              </Card>
            </div>
          </SectionErrorBoundary>
        )}

        {/* DISC Mini Questions */}
        {showDISC && state.staff_id && (mode === 'edit' || mode === 'complete') && (
          <SectionErrorBoundary section="DISC Assessment">
            <div className="space-y-4">
              <Card className="border-indigo-200 bg-indigo-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎨</span>
                    DISC Personality Check-in
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DISCMiniQuestions
                    staffId={state.staff_id}
                    questions={discQuestions}
                    responses={state.disc_responses}
                    onChange={(responses) => updateField('disc_responses', responses)}
                    readOnly={mode === 'complete'}
                  />
                </CardContent>
              </Card>
            </div>
          </SectionErrorBoundary>
        )}

        {/* Review-Type Specific Fields */}
        {(mode === 'edit' || mode === 'complete') && (
          <SectionErrorBoundary section="Review Type Specific">
            <ReviewTypeSpecificSection />
          </SectionErrorBoundary>
        )}

        {/* Performance Assessment */}
        {(mode === 'edit' || mode === 'complete') && (
          <SectionErrorBoundary section="Performance Assessment">
            <PerformanceAssessmentSection />
          </SectionErrorBoundary>
        )}

        {/* Goals and Development */}
        {(mode === 'edit' || mode === 'complete') && (
          <SectionErrorBoundary section="Goals and Development">
            <GoalsSection />
          </SectionErrorBoundary>
        )}

        {/* Signatures */}
        {mode === 'complete' && (
          <SectionErrorBoundary section="Signatures">
            <SignaturesSection />
          </SectionErrorBoundary>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => submitReview()}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
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
