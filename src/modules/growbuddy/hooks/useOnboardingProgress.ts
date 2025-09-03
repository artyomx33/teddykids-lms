import { useState, useEffect } from 'react';
import { ModuleProgress, OnboardingProgress } from '@/modules/growbuddy/types/onboarding';

const STORAGE_KEY = 'teddy-onboarding-progress';

export const useOnboardingProgress = () => {
  const [progress, setProgress] = useState<OnboardingProgress>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        startedAt: new Date(parsed.startedAt),
        completedAt: parsed.completedAt ? new Date(parsed.completedAt) : undefined,
      };
    }
    
    return {
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
      currentModule: 0,
      modules: {},
      completionPercentage: 0,
      startedAt: new Date(),
    };
  });

  const updateModuleProgress = (moduleId: string, updates: Partial<ModuleProgress>) => {
    setProgress(prev => {
      const newModules = {
        ...prev.modules,
        [moduleId]: {
          id: moduleId,
          completed: false,
          ...prev.modules[moduleId],
          ...updates,
          completedAt: updates.completed ? new Date() : prev.modules[moduleId]?.completedAt,
        },
      };

      // Calculate completion percentage
      const totalModules = 6;
      const completedCount = Object.values(newModules).filter(m => m.completed).length;
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
    setProgress(prev => ({
      ...prev,
      currentModule: Math.min(prev.currentModule + 1, 5),
    }));
  };

  const setCurrentModule = (moduleIndex: number) => {
    setProgress(prev => ({
      ...prev,
      currentModule: moduleIndex,
    }));
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
