/**
 * REVIEWS v1.1 - DISC MINI QUESTIONS COMPONENT
 * Rotating 3-question DISC personality assessment
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useDISCProfile } from '@/lib/hooks/useReviews';
import { formatDISCProfileForDisplay, DISCSnapshot } from '@/lib/discIntegration';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface DISCQuestion {
  id: string;
  question_text: string;
  options: Array<{
    text: string;
    disc_weights: {
      red?: number;
      yellow?: number;
      green?: number;
      blue?: number;
    };
  }>;
  category: string;
}

interface DISCMiniQuestionsProps {
  staffId: string;
  questions: DISCQuestion[];
  responses: Record<string, number>;
  onChange: (responses: Record<string, number>) => void;
  readOnly?: boolean;
}

export function DISCMiniQuestions({ 
  staffId, 
  questions, 
  responses, 
  onChange, 
  readOnly = false 
}: DISCMiniQuestionsProps) {
  const { data: currentProfile } = useDISCProfile(staffId);

  const handleResponseChange = (questionId: string, optionIndex: number) => {
    onChange({
      ...responses,
      [questionId]: optionIndex
    });
  };

  const getColorBadge = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; label: string }> = {
      red: { bg: 'bg-red-100', text: 'text-red-700', label: 'Red (Dominance)' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Yellow (Influence)' },
      green: { bg: 'bg-green-100', text: 'text-green-700', label: 'Green (Steadiness)' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Blue (Compliance)' }
    };
    
    const colorData = colorMap[color] || colorMap.blue;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorData.bg} ${colorData.text}`}>
        {colorData.label}
      </span>
    );
  };

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          DISC Personality Check-in
        </CardTitle>
        <CardDescription>
          Answer these 3 quick questions to update your DISC profile
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Profile Display */}
        {currentProfile && (
          <Alert className="bg-white border-purple-200">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Your current profile:</p>
                <div className="flex gap-2">
                  {currentProfile.primary_color && getColorBadge(currentProfile.primary_color)}
                  {currentProfile.secondary_color && getColorBadge(currentProfile.secondary_color)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(currentProfile.date).toLocaleDateString()}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Mini Questions */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-3 p-4 bg-white rounded-lg border border-purple-100">
              <Label className="text-base font-medium">
                {index + 1}. {question.question_text}
              </Label>
              
              <RadioGroup
                value={responses[question.id]?.toString() || ''}
                onValueChange={(value) => handleResponseChange(question.id, parseInt(value))}
                disabled={readOnly}
                className="space-y-3"
              >
                {question.options.map((option, optionIndex) => (
                  <div 
                    key={optionIndex}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <RadioGroupItem 
                      value={optionIndex.toString()} 
                      id={`${question.id}-${optionIndex}`}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={`${question.id}-${optionIndex}`}
                      className="flex-1 cursor-pointer text-sm leading-relaxed"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>

        {/* Completion Status */}
        {readOnly && Object.keys(responses).length === questions.length && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ DISC questions completed
            </p>
          </div>
        )}

        {/* Progress Indicator */}
        {!readOnly && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {Object.keys(responses).length} / {questions.length} answered
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{
                  width: `${(Object.keys(responses).length / questions.length) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* DISC Info */}
        <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-lg">
          <p className="text-xs text-purple-800 leading-relaxed">
            <strong>About DISC:</strong> This quick assessment helps track how your work style 
            evolves over time. There are no right or wrong answers—just choose what feels most 
            natural to you right now.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * DISC Profile Display Component
 * Shows existing DISC profile with visual breakdown
 */
interface DISCProfileDisplayProps {
  profile: DISCSnapshot;
  showEvolution?: boolean;
}

export function DISCProfileDisplay({ profile, showEvolution = true }: DISCProfileDisplayProps) {
  const formatted = formatDISCProfileForDisplay(profile);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{formatted.displayText}</h4>
          <p className="text-sm text-muted-foreground">{formatted.description}</p>
        </div>
        <div className="text-2xl font-bold px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
          {formatted.badge}
        </div>
      </div>

      {/* Color Bars */}
      <div className="space-y-2">
        {formatted.colors.map((color) => (
          <div key={color.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{color.name}</span>
              <span className="text-muted-foreground">{color.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${color.percentage}%`,
                  backgroundColor: color.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Evolution Note */}
      {showEvolution && profile.assessment_type && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Source:</span> {profile.assessment_type === 'full' 
            ? 'Full assessment' 
            : profile.assessment_type === 'mini' 
            ? 'Mini assessment' 
            : 'Review-based'}
          {' · '}
          <span className="font-medium">Last updated:</span> {new Date(profile.assessment_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

