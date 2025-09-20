export type OnboardingModuleKey =
  | 'welcome'
  | 'values'
  | 'daily-life'
  | 'safety'
  | 'netherlands'
  | 'quiz';

export interface ModuleProgress {
  id: OnboardingModuleKey;
  completed: boolean;
  completedAt?: Date;
  quizScore?: number;
  notes?: string;
  videoWatched?: boolean;
}

export interface OnboardingProgress {
  userId: string;
  currentModuleKey: OnboardingModuleKey;
  modules: Partial<Record<OnboardingModuleKey, ModuleProgress>>;
  completionPercentage: number;
  startedAt: Date;
  completedAt?: Date;
  optionalModules: Partial<Record<OnboardingModuleKey, boolean>>;
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
