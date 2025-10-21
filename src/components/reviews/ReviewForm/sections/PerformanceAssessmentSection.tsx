import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Star } from 'lucide-react';
import { useReviewFormContext } from '../context/ReviewFormContext';

export function PerformanceAssessmentSection() {
  const { state, updateField } = useReviewFormContext();

  return (
    <Card className="border-yellow-200 bg-yellow-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          Performance Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Overall Star Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => updateField('star_rating', rating)}
                  className={`p-1 rounded transition-colors ${
                    state.star_rating >= rating
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <Star className={`h-8 w-8 ${state.star_rating >= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Performance Level</Label>
            <Select value={state.performance_level} onValueChange={(value: any) => updateField('performance_level', value)}>
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
            <Select value={state.salary_recommendation} onValueChange={(value: any) => updateField('salary_recommendation', value)}>
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
              checked={state.promotion_ready}
              onCheckedChange={(checked) => updateField('promotion_ready', !!checked)}
            />
            <Label htmlFor="promotion_ready">Ready for promotion</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

