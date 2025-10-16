/**
 * REVIEWS v1.1 - SELF ASSESSMENT COMPONENT
 * "Reflect & Respond" section for employee self-evaluation
 */

import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CORE_METRICS, getMetricsForReviewType } from '@/lib/reviewMetrics';

interface SelfAssessmentProps {
  reviewType: string;
  value: {
    self_ratings?: Record<string, number>;
    proud_moment?: string;
    work_on?: string;
    how_supported?: number; // 1-5
  };
  onChange: (assessment: SelfAssessmentProps['value']) => void;
  readOnly?: boolean;
}

export function SelfAssessment({ reviewType, value, onChange, readOnly = false }: SelfAssessmentProps) {
  const metrics = getMetricsForReviewType(reviewType);

  const handleRatingChange = (metricId: string, rating: number) => {
    onChange({
      ...value,
      self_ratings: {
        ...value.self_ratings,
        [metricId]: rating
      }
    });
  };

  const handleFieldChange = (field: 'proud_moment' | 'work_on', text: string) => {
    onChange({
      ...value,
      [field]: text
    });
  };

  const handleSupportRating = (rating: number) => {
    onChange({
      ...value,
      how_supported: rating
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💭</span>
          Self-Assessment: Reflect & Respond
        </CardTitle>
        <CardDescription>
          Share your perspective on your performance and well-being
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Self-Ratings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">How would you rate yourself?</h3>
          <p className="text-sm text-muted-foreground">
            Rate yourself honestly on the same metrics your manager uses
          </p>
          
          <div className="grid gap-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="space-y-2">
                <Label htmlFor={`self-${metric.id}`}>{metric.label}</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={readOnly}
                      onClick={() => handleRatingChange(metric.id, star)}
                      className={`transition-colors ${
                        readOnly ? 'cursor-default' : 'hover:scale-110'
                      }`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          (value.self_ratings?.[metric.id] || 0) >= star
                            ? 'fill-blue-500 text-blue-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {value.self_ratings?.[metric.id] 
                      ? `${value.self_ratings[metric.id]}/5`
                      : 'Not rated'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proud Moment */}
        <div className="space-y-2">
          <Label htmlFor="proud-moment">
            🌟 One thing I'm proud of
          </Label>
          <Textarea
            id="proud-moment"
            value={value.proud_moment || ''}
            onChange={(e) => handleFieldChange('proud_moment', e.target.value)}
            placeholder="What accomplishment or moment made you feel proud?"
            disabled={readOnly}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Work On */}
        <div className="space-y-2">
          <Label htmlFor="work-on">
            🎯 One thing I want to work on
          </Label>
          <Textarea
            id="work-on"
            value={value.work_on || ''}
            onChange={(e) => handleFieldChange('work_on', e.target.value)}
            placeholder="What area would you like to improve?"
            disabled={readOnly}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Support Feeling */}
        <div className="space-y-2">
          <Label htmlFor="support-feeling">
            💙 How supported do you feel lately?
          </Label>
          <p className="text-sm text-muted-foreground">
            This helps us understand your well-being and where we can help
          </p>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                disabled={readOnly}
                onClick={() => handleSupportRating(rating)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                  value.how_supported === rating
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-gray-200 hover:border-blue-300'
                } ${readOnly ? 'cursor-default' : 'hover:scale-105'}`}
              >
                <Star
                  className={`w-8 h-8 ${
                    value.how_supported === rating
                      ? 'fill-blue-500 text-blue-500'
                      : 'text-gray-400'
                  }`}
                />
                <span className="text-xs font-medium">{rating}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Not at all</span>
            <span>Very supported</span>
          </div>
        </div>

        {/* Completion Note */}
        {readOnly && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Self-assessment completed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

