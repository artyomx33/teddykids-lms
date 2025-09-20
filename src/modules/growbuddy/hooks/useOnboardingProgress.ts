import { useEffect, useMemo, useState } from 'react';

import {
  getEnabledModules,
  isModuleOptional,
  createDefaultOptionalModuleState,
  ONBOARDING_MODULES,
  type OnboardingModuleDefinition
} from '@/modules/growbuddy/data/onboardingModules';
import {
  createDefaultStoredProgress,
  deserializeOnboardingProgress,
  serializeOnboardingProgress,
  type StoredOnboardingProgress
} from '@/modules/growbuddy/utils/progressSerialization';
import type {
  ModuleProgress,
  OnboardingModuleKey,
  OnboardingProgress
} from '@/modules/growbuddy/types/onboarding';

const STORAGE_KEY = 'teddy-onboarding-progress';

const mergeOptionalModules = (
  optionalModules?: Partial<Record<OnboardingModuleKey, boolean>>
): Partial<Record<OnboardingModuleKey, boolean>> => ({
  ...createDefaultOptionalModuleState(),
  ...optionalModules,
});

const calculateCompletionPercentage = (
  modules: Partial<Record<OnboardingModuleKey, ModuleProgress>>,
  optionalModules: Partial<Record<OnboardingModuleKey, boolean>>
) => {
  const enabledModules = getEnabledModules(optionalModules);
  if (!enabledModules.length) {
    return 0;
  }

  const completedCount = enabledModules.reduce((count, module) => {
    return modules[module.id]?.completed ? count + 1 : count;
  }, 0);

  return Math.round((completedCount / enabledModules.length) * 100);
};

const ensureValidCurrentModuleKey = (
  currentModuleKey: OnboardingModuleKey,
  optionalModules: Partial<Record<OnboardingModuleKey, boolean>>
): OnboardingModuleKey => {
  const enabledModules = getEnabledModules(optionalModules);
  if (!enabledModules.length) {
    return currentModuleKey;
  }

  if (enabledModules.some(module => module.id === currentModuleKey)) {
    return currentModuleKey;
  }

  const currentIndex = ONBOARDING_MODULES.findIndex(module => module.id === currentModuleKey);

  if (currentIndex !== -1) {
    for (let i = currentIndex + 1; i < ONBOARDING_MODULES.length; i += 1) {
      const candidate = ONBOARDING_MODULES[i];
      if (!candidate.optional || optionalModules[candidate.id]) {
        return candidate.id;
      }
    }
  }

  return enabledModules[enabledModules.length - 1].id;
};

const normalizeProgress = (progress: OnboardingProgress): OnboardingProgress => {
  const optionalModules = mergeOptionalModules(progress.optionalModules);
  const completionPercentage = calculateCompletionPercentage(
    progress.modules,
    optionalModules
  );

  return {
    ...progress,
    optionalModules,
    currentModuleKey: ensureValidCurrentModuleKey(progress.currentModuleKey, optionalModules),
    completionPercentage,
    completedAt: completionPercentage === 100 ? progress.completedAt : undefined,
  };
};

export const useOnboardingProgress = () => {
  const [progress, setProgress] = useState<OnboardingProgress>(() =>
    normalizeProgress(
      deserializeOnboardingProgress(createDefaultStoredProgress())
    )
  );
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: StoredOnboardingProgress = JSON.parse(stored);
        setProgress(normalizeProgress(deserializeOnboardingProgress(parsed)));
      } catch (error) {
        console.error('Failed to parse onboarding progress from storage', error);
      }
    }

    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !hasHydrated) {
      return;
    }

    try {
      const serialized = serializeOnboardingProgress(progress);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist onboarding progress', error);
    }
  }, [progress, hasHydrated]);

  const enabledModules = useMemo<OnboardingModuleDefinition[]>(
    () => getEnabledModules(progress.optionalModules),
    [progress.optionalModules]
  );

  const currentModuleIndex = useMemo(() => {
    const index = enabledModules.findIndex(module => module.id === progress.currentModuleKey);
    return index === -1 ? 0 : index;
  }, [enabledModules, progress.currentModuleKey]);

  const updateModuleProgress = (
    moduleId: OnboardingModuleKey,
    updates: Partial<ModuleProgress>
  ) => {
    setProgress(prev => {
      const existing = prev.modules[moduleId] ?? { id: moduleId, completed: false };
      const nextCompleted =
        updates.completed !== undefined ? updates.completed : existing.completed ?? false;

      let completedAt = existing.completedAt;
      if (updates.completed !== undefined) {
        completedAt = updates.completed ? updates.completedAt ?? new Date() : undefined;
      } else if (updates.completedAt) {
        completedAt = updates.completedAt;
      }

      const nextModule: ModuleProgress = {
        ...existing,
        ...updates,
        id: moduleId,
        completed: nextCompleted,
        completedAt,
      };

      const modules = {
        ...prev.modules,
        [moduleId]: nextModule,
      };

      const completionPercentage = calculateCompletionPercentage(modules, prev.optionalModules);
      const completedAtTimestamp =
        completionPercentage === 100 ? prev.completedAt ?? new Date() : undefined;

      return {
        ...prev,
        modules,
        completionPercentage,
        completedAt: completedAtTimestamp,
      };
    });
  };

  const moveToNextModule = () => {
    setProgress(prev => {
      const enabled = getEnabledModules(prev.optionalModules);
      if (!enabled.length) {
        return prev;
      }

      const currentIndex = enabled.findIndex(module => module.id === prev.currentModuleKey);
      const nextModule =
        currentIndex === -1
          ? enabled[0]
          : enabled[Math.min(currentIndex + 1, enabled.length - 1)];

      if (!nextModule || nextModule.id === prev.currentModuleKey) {
        return prev;
      }

      return {
        ...prev,
        currentModuleKey: nextModule.id,
      };
    });
  };

  const setCurrentModule = (moduleIndex: number) => {
    setProgress(prev => {
      const enabled = getEnabledModules(prev.optionalModules);
      const target = enabled[moduleIndex];
      if (!target) {
        return prev;
      }

      return {
        ...prev,
        currentModuleKey: target.id,
      };
    });
  };

  const setCurrentModuleKey = (moduleId: OnboardingModuleKey) => {
    setProgress(prev => {
      const enabled = getEnabledModules(prev.optionalModules);
      if (!enabled.some(module => module.id === moduleId) || prev.currentModuleKey === moduleId) {
        return prev;
      }

      return {
        ...prev,
        currentModuleKey: moduleId,
      };
    });
  };

  const setOptionalModuleEnabled = (moduleId: OnboardingModuleKey, enabled: boolean) => {
    if (!isModuleOptional(moduleId)) {
      return;
    }

    setProgress(prev => {
      const optionalModules = mergeOptionalModules(prev.optionalModules);
      if (optionalModules[moduleId] === enabled) {
        return prev;
      }

      optionalModules[moduleId] = enabled;
      const safeCurrentModuleKey = ensureValidCurrentModuleKey(
        prev.currentModuleKey,
        optionalModules
      );
      const completionPercentage = calculateCompletionPercentage(prev.modules, optionalModules);
      const completedAt =
        completionPercentage === 100 ? prev.completedAt ?? new Date() : undefined;

      return {
        ...prev,
        optionalModules,
        currentModuleKey: safeCurrentModuleKey,
        completionPercentage,
        completedAt,
      };
    });
  };

  return {
    progress,
    updateModuleProgress,
    moveToNextModule,
    setCurrentModule,
    setCurrentModuleKey,
    setOptionalModuleEnabled,
    enabledModules,
    currentModuleIndex,
  };
};
