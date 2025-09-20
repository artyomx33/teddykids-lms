import { ONBOARDING_MODULES, createDefaultOptionalModuleState } from '@/modules/growbuddy/data/onboardingModules';
import type {
  ModuleProgress,
  OnboardingModuleKey,
  OnboardingProgress
} from '@/modules/growbuddy/types/onboarding';

export type StoredModuleProgress = Omit<ModuleProgress, 'completedAt'> & {
  completedAt?: string;
};

export type StoredOnboardingProgress = Omit<
  OnboardingProgress,
  'modules' | 'startedAt' | 'completedAt'
> & {
  modules: Partial<Record<OnboardingModuleKey, StoredModuleProgress>>;
  startedAt: string;
  completedAt?: string;
};

export const serializeOnboardingProgress = (
  progress: OnboardingProgress
): StoredOnboardingProgress => {
  const storedModules: Partial<Record<OnboardingModuleKey, StoredModuleProgress>> = {};

  for (const [key, module] of Object.entries(progress.modules)) {
    if (!module) continue;

    const { completedAt, ...rest } = module;
    storedModules[key as OnboardingModuleKey] = {
      ...rest,
      completedAt: completedAt ? completedAt.toISOString() : undefined,
    };
  }

  return {
    userId: progress.userId,
    currentModuleKey: progress.currentModuleKey,
    modules: storedModules,
    completionPercentage: progress.completionPercentage,
    startedAt: progress.startedAt.toISOString(),
    completedAt: progress.completedAt ? progress.completedAt.toISOString() : undefined,
    optionalModules: { ...progress.optionalModules },
  };
};

export const deserializeOnboardingProgress = (
  stored: StoredOnboardingProgress
): OnboardingProgress => {
  const modules: Partial<Record<OnboardingModuleKey, ModuleProgress>> = {};

  if (stored.modules) {
    for (const [key, module] of Object.entries(stored.modules)) {
      if (!module) continue;

      const { completedAt, ...rest } = module;
      modules[key as OnboardingModuleKey] = {
        ...rest,
        completedAt: completedAt ? new Date(completedAt) : undefined,
      };
    }
  }

  return {
    userId: stored.userId,
    currentModuleKey: stored.currentModuleKey,
    modules,
    completionPercentage: stored.completionPercentage,
    startedAt: new Date(stored.startedAt),
    completedAt: stored.completedAt ? new Date(stored.completedAt) : undefined,
    optionalModules: stored.optionalModules ?? {},
  };
};

export const createDefaultStoredProgress = (): StoredOnboardingProgress => {
  const optionalModules = createDefaultOptionalModuleState();
  const firstModule = ONBOARDING_MODULES[0]?.id ?? 'welcome';

  return {
    userId: `user-${Math.random().toString(36).slice(2, 11)}`,
    currentModuleKey: firstModule,
    modules: {},
    completionPercentage: 0,
    startedAt: new Date().toISOString(),
    optionalModules,
  };
};
