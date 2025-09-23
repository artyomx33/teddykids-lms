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

type StoredModuleProgressInput = Partial<StoredModuleProgress> & {
  completedAt?: string | number | Date | null;
};

type PersistedOnboardingProgress = Partial<StoredOnboardingProgress> & {
  currentModule?: number;
  modules?: Partial<Record<OnboardingModuleKey, StoredModuleProgressInput | null>>;
  startedAt?: string | number | Date | null;
  completedAt?: string | number | Date | null;
};

const parseDate = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value;

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return undefined;
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
  stored: PersistedOnboardingProgress
): OnboardingProgress => {
  const modules: Partial<Record<OnboardingModuleKey, ModuleProgress>> = {};

  const resolveModuleId = (
    key: string,
    moduleData?: StoredModuleProgressInput | null
  ): OnboardingModuleKey | null => {
    const dataId = moduleData?.id;
    if (typeof dataId === 'string') {
      const matched = ONBOARDING_MODULES.find(module => module.id === dataId);
      if (matched) {
        return matched.id;
      }
    }

    const keyedMatch = ONBOARDING_MODULES.find(module => module.id === key);
    if (keyedMatch) {
      return keyedMatch.id;
    }

    const numericIndex = Number.parseInt(key, 10);
    if (!Number.isNaN(numericIndex)) {
      const byIndex = ONBOARDING_MODULES[numericIndex];
      if (byIndex) {
        return byIndex.id;
      }
    }

    return null;
  };

  if (stored.modules) {
    for (const [key, module] of Object.entries(stored.modules)) {
      if (!module) continue;

      const moduleData = module as StoredModuleProgressInput;
      const moduleId = resolveModuleId(key, moduleData);
      if (!moduleId) continue;

      const { completedAt, completed, id, ...rest } = moduleData;
      const normalizedModule: ModuleProgress = {
        id: moduleId,
        completed: completed ?? false,
        completedAt: parseDate(completedAt),
        ...(rest as Partial<ModuleProgress>),
      };

      const existing = modules[moduleId];
      modules[moduleId] = existing
        ? {
            ...existing,
            ...normalizedModule,
            completed: normalizedModule.completed || existing.completed,
            completedAt: normalizedModule.completedAt ?? existing.completedAt,
          }
        : normalizedModule;
    }
  }

  const fallbackModuleId = ONBOARDING_MODULES[0]?.id ?? 'welcome';
  const legacyModuleKey =
    typeof stored.currentModule === 'number'
      ? ONBOARDING_MODULES[stored.currentModule]?.id
      : undefined;
  const resolvedModuleKey =
    stored.currentModuleKey ?? legacyModuleKey ?? fallbackModuleId;
  const safeModuleKey =
    ONBOARDING_MODULES.find(module => module.id === resolvedModuleKey)?.id ?? fallbackModuleId;

  return {
    userId:
      typeof stored.userId === 'string'
        ? stored.userId
        : `user-${Math.random().toString(36).slice(2, 11)}`,
    currentModuleKey: safeModuleKey,
    modules,
    completionPercentage:
      typeof stored.completionPercentage === 'number' ? stored.completionPercentage : 0,
    startedAt: parseDate(stored.startedAt) ?? new Date(),
    completedAt: parseDate(stored.completedAt),
    optionalModules: {
      ...createDefaultOptionalModuleState(),
      ...(stored.optionalModules ?? {}),
    },
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
