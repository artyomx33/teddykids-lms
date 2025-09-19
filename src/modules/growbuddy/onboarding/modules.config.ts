import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Heart, BookOpen, User, Shield, MapPin, Award } from 'lucide-react';

import { WelcomeModule } from '@/modules/growbuddy/components/onboarding/modules/WelcomeModule';
import { ValuesModule } from '@/modules/growbuddy/components/onboarding/modules/ValuesModule';
import { DailyLifeModule } from '@/modules/growbuddy/components/onboarding/modules/DailyLifeModule';
import { SafetyModule } from '@/modules/growbuddy/components/onboarding/modules/SafetyModule';
import { NetherlandsModule } from '@/modules/growbuddy/components/onboarding/modules/NetherlandsModule';
import { QuizModule } from '@/modules/growbuddy/components/onboarding/modules/QuizModule';
import type {
  ModuleProgress,
  OnboardingModuleKey,
} from '@/modules/growbuddy/types/onboarding';

export type OnboardingModuleFlag = 'optional-netherlands';

export interface OnboardingModuleComponentProps {
  moduleProgress?: ModuleProgress;
  onUpdateProgress: (updates: Partial<ModuleProgress>) => void;
}

export type OnboardingModuleComponent = ComponentType<OnboardingModuleComponentProps>;

export interface OnboardingModuleDefinition {
  key: OnboardingModuleKey;
  title: string;
  icon: LucideIcon;
  component: OnboardingModuleComponent;
  flags?: readonly OnboardingModuleFlag[];
}

const OPTIONAL_NETHERLANDS_FLAG: OnboardingModuleFlag = 'optional-netherlands';

export const ONBOARDING_MODULES: readonly OnboardingModuleDefinition[] = [
  {
    key: 'welcome',
    title: 'Welcome to the Teddy Family',
    icon: Heart,
    component: WelcomeModule,
  },
  {
    key: 'values',
    title: 'The Teddy Code',
    icon: BookOpen,
    component: ValuesModule,
  },
  {
    key: 'daily-life',
    title: 'Daily Life at Teddy Kids',
    icon: User,
    component: DailyLifeModule,
  },
  {
    key: 'safety',
    title: 'Safety & Conduct',
    icon: Shield,
    component: SafetyModule,
  },
  {
    key: 'netherlands',
    title: 'Moving to the Netherlands',
    icon: MapPin,
    component: NetherlandsModule,
    flags: [OPTIONAL_NETHERLANDS_FLAG],
  },
  {
    key: 'quiz',
    title: 'Final Quiz & Certification',
    icon: Award,
    component: QuizModule,
  },
];

export const isOnboardingModuleKey = (value: unknown): value is OnboardingModuleKey =>
  typeof value === 'string' && ONBOARDING_MODULES.some(module => module.key === value);

export const getModuleIndexByKey = (key: OnboardingModuleKey): number =>
  ONBOARDING_MODULES.findIndex(module => module.key === key);

export const getModuleKeyByIndex = (
  index: number,
): OnboardingModuleKey | undefined => ONBOARDING_MODULES[index]?.key;

export const getVisibleModules = (
  showNetherlands: boolean,
): readonly OnboardingModuleDefinition[] => {
  if (showNetherlands) {
    return ONBOARDING_MODULES;
  }

  return ONBOARDING_MODULES.filter(
    module => !module.flags?.includes(OPTIONAL_NETHERLANDS_FLAG),
  );
};

export const getNextVisibleModuleKey = (
  currentKey: OnboardingModuleKey,
  showNetherlands: boolean,
): OnboardingModuleKey | undefined => {
  const currentIndex = getModuleIndexByKey(currentKey);
  if (currentIndex === -1) {
    return undefined;
  }

  const visibleModules = getVisibleModules(showNetherlands);
  const nextModule = visibleModules.find(
    module => getModuleIndexByKey(module.key) > currentIndex,
  );

  return nextModule?.key;
};
