import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Heart, BookOpen, User, Shield, MapPin, Award } from 'lucide-react';

import { WelcomeModule } from '@/modules/growbuddy/components/onboarding/modules/WelcomeModule';
import { ValuesModule } from '@/modules/growbuddy/components/onboarding/modules/ValuesModule';
import { DailyLifeModule } from '@/modules/growbuddy/components/onboarding/modules/DailyLifeModule';
import { SafetyModule } from '@/modules/growbuddy/components/onboarding/modules/SafetyModule';
import { NetherlandsModule } from '@/modules/growbuddy/components/onboarding/modules/NetherlandsModule';
import { QuizModule } from '@/modules/growbuddy/components/onboarding/modules/QuizModule';
import type { ModuleProgress, OnboardingModuleKey } from '@/modules/growbuddy/types/onboarding';

export interface OnboardingModuleDefinition {
  id: OnboardingModuleKey;
  title: string;
  icon: LucideIcon;
  component: ComponentType<{
    moduleProgress?: ModuleProgress;
    onUpdateProgress: (updates: Partial<ModuleProgress>) => void;
  }>;
  optional?: boolean;
}

export const ONBOARDING_MODULES: OnboardingModuleDefinition[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Teddy Family',
    icon: Heart,
    component: WelcomeModule,
  },
  {
    id: 'values',
    title: 'The Teddy Code',
    icon: BookOpen,
    component: ValuesModule,
  },
  {
    id: 'daily-life',
    title: 'Daily Life at Teddy Kids',
    icon: User,
    component: DailyLifeModule,
  },
  {
    id: 'safety',
    title: 'Safety & Conduct',
    icon: Shield,
    component: SafetyModule,
  },
  {
    id: 'netherlands',
    title: 'Moving to the Netherlands',
    icon: MapPin,
    component: NetherlandsModule,
    optional: true,
  },
  {
    id: 'quiz',
    title: 'Final Quiz & Certification',
    icon: Award,
    component: QuizModule,
  },
];

export const createDefaultOptionalModuleState = (): Partial<Record<OnboardingModuleKey, boolean>> => {
  const state: Partial<Record<OnboardingModuleKey, boolean>> = {};

  for (const module of ONBOARDING_MODULES) {
    if (module.optional) {
      state[module.id] = false;
    }
  }

  return state;
};

export const getEnabledModules = (
  optionalModules: Partial<Record<OnboardingModuleKey, boolean>>
): OnboardingModuleDefinition[] => {
  return ONBOARDING_MODULES.filter(
    module => !module.optional || optionalModules[module.id]
  );
};

export const isModuleOptional = (moduleId: OnboardingModuleKey): boolean =>
  ONBOARDING_MODULES.some(module => module.id === moduleId && module.optional);
