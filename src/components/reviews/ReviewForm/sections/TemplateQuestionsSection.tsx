import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { QuestionRenderer } from '../components/QuestionRenderer';
import { useReviewFormContext } from '../context/ReviewFormContext';

export function TemplateQuestionsSection() {
  const { selectedTemplate, state, updateResponse } = useReviewFormContext();

  if (!selectedTemplate || !selectedTemplate.questions) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Review Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedTemplate.questions.map((question, index) => (
          <div key={index} className="space-y-2">
            <Label className="flex items-center gap-2">
              {question.question}
              {question.required && (
                <Badge variant="outline" className="text-muted-foreground border-dashed">
                  Suggested
                </Badge>
              )}
            </Label>
            <QuestionRenderer
              question={question}
              index={index}
              response={state.responses[index]}
              onResponseChange={updateResponse}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

