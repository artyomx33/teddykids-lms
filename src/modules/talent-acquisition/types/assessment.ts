/**
 * Assessment-related type definitions
 */

export type DISCColor = 'red' | 'blue' | 'green' | 'yellow';
export type GroupFit = 'babies' | 'one_two' | 'three_plus' | 'mixed';

export interface AssessmentAnswer {
  id: number;
  choice: 'A' | 'B' | 'C' | 'D';
}

export interface AssessmentQuestion {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c?: string;
  option_d?: string;
  question_type: 'disc_color' | 'red_flag' | 'age_group' | 'competency';
  color_mapping?: Record<string, DISCColor>;
  red_flag_mapping?: Record<string, boolean>;
  age_group_mapping?: Record<string, GroupFit>;
  competency_mapping?: Record<string, Record<string, number>>;
  required: boolean;
}

export interface AssessmentResult {
  color_counts: Record<DISCColor, number>;
  color_primary: DISCColor;
  color_secondary: DISCColor;
  red_flag_count: number;
  red_flag_items: number[];
  age_fit: GroupFit;
  age_fit_confidence: number;
  competency_scores: Record<string, number>;
  overall_score: number;
}

export interface DISCProfile {
  title: string;
  description: string;
  strengths: string[];
  childcare_fit: string;
}
