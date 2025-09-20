import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingSidebar } from '@/modules/growbuddy/components/onboarding/OnboardingSidebar';
import { AskAppiesButton } from '@/modules/growbuddy/components/onboarding/AskAppiesButton';
import { useOnboardingProgress } from '@/modules/growbuddy/hooks/useOnboardingProgress';
import type {
  ModuleProgress,
  OnboardingModuleKey
} from '@/modules/growbuddy/types/onboarding';

const OnboardingPage = () => {
  const {
    progress,
    updateModuleProgress,
    setCurrentModuleKey,
    setOptionalModuleEnabled,
    enabledModules,
    currentModuleIndex,
  } = useOnboardingProgress();

  const currentModule = enabledModules[currentModuleIndex];
  const CurrentModuleComponent = currentModule?.component;

  const handleModuleProgressUpdate = (
    moduleId: OnboardingModuleKey,
    updates: Partial<ModuleProgress>
  ) => {
    updateModuleProgress(moduleId, updates);

    // Auto-advance to next module when completed
    if (updates.completed) {
      const currentIndex = enabledModules.findIndex(module => module.id === moduleId);
      const nextModule = currentIndex === -1 ? undefined : enabledModules[currentIndex + 1];

      if (nextModule) {
        setCurrentModuleKey(nextModule.id);
      }
    }
  };

  const handleNetherlandsToggle = (value: boolean | 'indeterminate') => {
    setOptionalModuleEnabled('netherlands', value === true);
  };

  const netherlandsEnabled = progress.optionalModules.netherlands ?? false;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <OnboardingSidebar
        progress={progress}
        currentModuleKey={progress.currentModuleKey}
        onModuleSelect={setCurrentModuleKey}
        modules={enabledModules}
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
                  checked={netherlandsEnabled}
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
          {CurrentModuleComponent && currentModule && (
            <CurrentModuleComponent
              moduleProgress={progress.modules[currentModule.id]}
              onUpdateProgress={(updates: Partial<ModuleProgress>) =>
                handleModuleProgressUpdate(currentModule.id, updates)
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
