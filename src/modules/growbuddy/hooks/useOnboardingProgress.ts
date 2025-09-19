import { useState, useEffect } from 'react';

import {
  getModuleIndexByKey,
  getModuleKeyByIndex,
  isOnboardingModuleKey,
  ONBOARDING_MODULES,
} from '@/modules/growbuddy/onboarding/modules.config';
import {
  ModuleProgress,
  OnboardingModuleKey,
  OnboardingProgress,
} from '@/modules/growbuddy/types/onboarding';

const STORAGE_KEY = 'teddy-onboarding-progress';

const DEFAULT_MODULE_KEY: OnboardingModuleKey = ONBOARDING_MODULES[0].key;

const createDefaultProgress = (): OnboardingProgress => ({
  userId: 'user-' + Math.random().toString(36).substr(2, 9),
  currentModule: DEFAULT_MODULE_KEY,
  modules: {},
  completionPercentage: 0,
  startedAt: new Date(),
});

const parseStoredProgress = (storedValue: string): OnboardingProgress | null => {
  try {
    const parsed = JSON.parse(storedValue);
    const currentModule: OnboardingModuleKey = (() => {
      if (isOnboardingModuleKey(parsed.currentModule)) {
        return parsed.currentModule;
      }

      if (typeof parsed.currentModule === 'number') {
        return getModuleKeyByIndex(parsed.currentModule) ?? DEFAULT_MODULE_KEY;
      }

      return DEFAULT_MODULE_KEY;
    })();

    return {
      ...parsed,
      currentModule,
      modules: parsed.modules ?? {},
      startedAt: new Date(parsed.startedAt),
      completedAt: parsed.completedAt ? new Date(parsed.completedAt) : undefined,
    };
  } catch {
    return null;
  }
};

export const useOnboardingProgress = () => {
  const [progress, setProgress] = useState<OnboardingProgress>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createDefaultProgress();
    }

    const parsed = parseStoredProgress(stored);
    return parsed ?? createDefaultProgress();
  });

  const updateModuleProgress = (
    moduleId: OnboardingModuleKey,
    updates: Partial<ModuleProgress>,
  ) => {
    setProgress(prev => {
      const previousModuleProgress = prev.modules[moduleId];
      const newModules = {
        ...prev.modules,
        [moduleId]: {
          id: moduleId,
          completed: false,
          ...previousModuleProgress,
          ...updates,
          completedAt: updates.completed
            ? new Date()
            : previousModuleProgress?.completedAt,
        },
      };

      // Calculate completion percentage
      const totalModules = ONBOARDING_MODULES.length;
      const completedCount = Object.values(newModules).filter(
        module => module?.completed,
      ).length;
      const completionPercentage = Math.round((completedCount / totalModules) * 100);

      const newProgress = {
        ...prev,
        modules: newModules,
        completionPercentage,
        completedAt: completionPercentage === 100 ? new Date() : prev.completedAt,
      };

      return newProgress;
    });
  };

  const moveToNextModule = () => {
    setProgress(prev => {
      const currentIndex = getModuleIndexByKey(prev.currentModule);
      const nextModule = ONBOARDING_MODULES[currentIndex + 1];

      if (!nextModule) {
        return prev;
      }

      return {
        ...prev,
        currentModule: nextModule.key,
      };
    });
  };

  const setCurrentModule = (moduleKey: OnboardingModuleKey) => {
    setProgress(prev => {
      if (prev.currentModule === moduleKey) {
        return prev;
      }

      return {
        ...prev,
        currentModule: moduleKey,
      };
    });
  };

  // Save to localStorage whenever progress changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  return {
    progress,
    updateModuleProgress,
    moveToNextModule,
    setCurrentModule,
  };
};
