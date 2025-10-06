/**
 * Widget-related type definitions
 */

import type { DISCColor } from './assessment';

export interface QuestionOption {
  value: string;
  label: string;
  color?: DISCColor;
  isRisk?: boolean;
}

export interface WidgetState {
  currentStep: number;
  answers: Record<number, string>;
  isComplete: boolean;
}
