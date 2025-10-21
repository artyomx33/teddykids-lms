import React from 'react';
import { Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuestionRendererProps {
  question: {
    question: string;
    type: 'text' | 'rating' | 'boolean' | 'select';
    required: boolean;
    options?: string[];
  };
  index: number;
  response: any;
  onResponseChange: (index: number, value: any) => void;
}

export function QuestionRenderer({ question, index, response, onResponseChange }: QuestionRendererProps) {
  switch (question.type) {
    case 'text':
      return (
        <Textarea
          value={response || ''}
          onChange={(e) => onResponseChange(index, e.target.value)}
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
              onClick={() => onResponseChange(index, rating)}
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
              onChange={() => onResponseChange(index, true)}
              className="text-primary"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name={`question_${index}`}
              checked={response === false}
              onChange={() => onResponseChange(index, false)}
              className="text-primary"
            />
            <span>No</span>
          </label>
        </div>
      );

    case 'select':
      return (
        <Select value={response || ''} onValueChange={(value) => onResponseChange(index, value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((option: string) => (
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
}

