import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useReviewFormContext } from '../context/ReviewFormContext';

export function GoalsSection() {
  const { state, updateField, handleArrayFieldChange, addArrayField } = useReviewFormContext();

  return (
    <Card className="border-teal-200 bg-teal-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Goals & Development
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Goals for Next Period */}
        <div className="space-y-2">
          <Label>Goals for Next Period</Label>
          {state.goals_next.map((goal, index) => (
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
          {state.development_areas.map((area, index) => (
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
          {state.achievements.map((achievement, index) => (
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
            value={state.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            placeholder="Provide an overall summary of the review..."
            className="min-h-[120px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}

