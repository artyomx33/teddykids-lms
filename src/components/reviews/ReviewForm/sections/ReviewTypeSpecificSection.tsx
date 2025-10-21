import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Trophy, DollarSign, AlertTriangle } from 'lucide-react';
import { useReviewFormContext } from '../context/ReviewFormContext';

export function ReviewTypeSpecificSection() {
  const { state, updateField } = useReviewFormContext();

  return (
    <>
      {/* First Month / Probation Specific */}
      {state.review_type === 'probation' && (
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
                    value={state.adaptability_speed || ''}
                    onChange={(e) => updateField('adaptability_speed', parseFloat(e.target.value))}
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
                    value={state.initiative_taken || ''}
                    onChange={(e) => updateField('initiative_taken', parseFloat(e.target.value))}
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
                    value={state.team_reception_score || ''}
                    onChange={(e) => updateField('team_reception_score', parseFloat(e.target.value))}
                    placeholder="1.0 - 5.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Warning / Intervention Specific */}
      {state.review_type === 'warning' && (
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
                    value={state.warning_level?.toString() || ''} 
                    onValueChange={(value) => updateField('warning_level', parseInt(value))}
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
                    value={state.behavior_score || ''}
                    onChange={(e) => updateField('behavior_score', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Impact Score (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={state.impact_score || ''}
                    onChange={(e) => updateField('impact_score', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Support Suggestions</Label>
                <Textarea
                  value={state.support_suggestions.join('\n')}
                  onChange={(e) => updateField('support_suggestions', e.target.value.split('\n').filter(s => s.trim()))}
                  placeholder="Enter support suggestions (one per line)..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promotion Review Specific */}
      {state.review_type === 'promotion_review' && (
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
                    value={state.promotion_readiness_score || ''}
                    onChange={(e) => updateField('promotion_readiness_score', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Leadership Potential (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={state.leadership_potential_score || ''}
                    onChange={(e) => updateField('leadership_potential_score', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Salary Review Specific */}
      {state.review_type === 'salary_review' && (
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
                  value={state.salary_suggestion_reason}
                  onChange={(e) => updateField('salary_suggestion_reason', e.target.value)}
                  placeholder="Explain the reasoning for the salary recommendation..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Future Raise Goal / Milestones</Label>
                <Textarea
                  value={state.future_raise_goal}
                  onChange={(e) => updateField('future_raise_goal', e.target.value)}
                  placeholder="What should they achieve to be eligible for the next raise?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

