import { useEffect, useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingSidebar } from '@/modules/growbuddy/components/onboarding/OnboardingSidebar';
import { AskAppiesButton } from '@/modules/growbuddy/components/onboarding/AskAppiesButton';
import { useOnboardingProgress } from '@/modules/growbuddy/hooks/useOnboardingProgress';
import {
  getNextVisibleModuleKey,
  getVisibleModules,
  ONBOARDING_MODULES,
} from '@/modules/growbuddy/onboarding/modules.config';
import type { ModuleProgressUpdate } from '@/modules/growbuddy/types/onboarding';

const OnboardingPage = () => {
  const { progress, updateModuleProgress, setCurrentModule } = useOnboardingProgress();
  const [showNetherlandsModule, setShowNetherlandsModule] = useState(false);

  const visibleModules = useMemo(
    () => getVisibleModules(showNetherlandsModule),
    [showNetherlandsModule],
  );

  const activeModuleConfig =
    visibleModules.find(module => module.key === progress.currentModule) ??
    (() => {
      const fallbackKey = getNextVisibleModuleKey(
        progress.currentModule,
        showNetherlandsModule,
      );
      return (
        visibleModules.find(module => module.key === fallbackKey) ??
        visibleModules[0]
      );
    })();

  const activeModuleKey = activeModuleConfig?.key ?? ONBOARDING_MODULES[0].key;
  const CurrentModuleComponent = activeModuleConfig?.component;

  useEffect(() => {
    if (!showNetherlandsModule && progress.currentModule === 'netherlands') {
      const nextModuleKey = getNextVisibleModuleKey('netherlands', false);
      if (nextModuleKey && nextModuleKey !== progress.currentModule) {
        setCurrentModule(nextModuleKey);
      }
    }
  }, [showNetherlandsModule, progress.currentModule, setCurrentModule]);

  const handleModuleProgressUpdate = ({
    module,
    updates,
  }: ModuleProgressUpdate) => {
    updateModuleProgress(module, updates);

    if (updates.completed) {
      const nextModuleKey = getNextVisibleModuleKey(module, showNetherlandsModule);
      if (nextModuleKey) {
        setCurrentModule(nextModuleKey);
      }
    }
  };

  const handleNetherlandsToggle = (checked: boolean) => {
    setShowNetherlandsModule(checked);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <OnboardingSidebar
        progress={progress}
        currentModule={activeModuleKey}
        onModuleSelect={setCurrentModule}
        showNetherlandsModule={showNetherlandsModule}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Netherlands Module Toggle */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10 p-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="netherlands-toggle"
                  checked={showNetherlandsModule}
                  onCheckedChange={handleNetherlandsToggle}
                />
                <Label 
                  htmlFor="netherlands-toggle" 
                  className="text-sm font-medium cursor-pointer"
                >
                  I moved from abroad (show Netherlands module)
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Content */}
        <div className="min-h-screen">
          {CurrentModuleComponent && (
            <CurrentModuleComponent
              moduleProgress={progress.modules[activeModuleKey]}
              onUpdateProgress={updates =>
                handleModuleProgressUpdate({ module: activeModuleKey, updates })
              }
            />
          )}
        </div>
      </div>

      {/* Ask Appies Button */}
      <AskAppiesButton />
    </div>
  );
};

export default OnboardingPage;
