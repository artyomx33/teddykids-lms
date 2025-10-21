import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useReviewFormContext } from '../context/ReviewFormContext';
import { calculateReviewScores } from '@/lib/reviews/reviewCalculations';

export function SignaturesSection() {
  const { state, selectedTemplate, updateField } = useReviewFormContext();

  const calculateOverallScore = () => {
    if (!selectedTemplate || selectedTemplate.scoring_method !== 'five_star') return 0;
    const scores = calculateReviewScores(state);
    return scores.overallScore.toFixed(1);
  };

  return (
    <Card className="border-slate-200 bg-slate-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">✍️</span>
          Sign-off
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="signed_by_reviewer"
              checked={state.signed_by_reviewer}
              onCheckedChange={(checked) => updateField('signed_by_reviewer', !!checked)}
            />
            <Label htmlFor="signed_by_reviewer">I confirm this review as the reviewer</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="signed_by_employee"
              checked={state.signed_by_employee}
              onCheckedChange={(checked) => updateField('signed_by_employee', !!checked)}
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
      </CardContent>
    </Card>
  );
}

