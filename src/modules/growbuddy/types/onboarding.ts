export interface ModuleProgress {
  id: string;
  completed: boolean;
  completedAt?: Date;
  quizScore?: number;
  notes?: string;
  videoWatched?: boolean;
}

export interface OnboardingProgress {
  userId: string;
  currentModule: number;
  modules: Record<string, ModuleProgress>;
  completionPercentage: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'yes-no' | 'text' | 'multi-select';
  options?: string[];
  correctAnswer?: string | string[];
  required: boolean;
}

export interface ValueReflection {
  value: string;
  mantra: string;
  description: string;
  reflection?: string;
}

export interface SafetyItem {
  id: string;
  text: string;
  type: 'must-do' | 'never-do' | 'protocol';
  acknowledged: boolean;
}
