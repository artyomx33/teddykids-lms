import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingSidebar } from '@/modules/growbuddy/components/onboarding/OnboardingSidebar';
import { AskAppiesButton } from '@/modules/growbuddy/components/onboarding/AskAppiesButton';
import { WelcomeModule } from '@/modules/growbuddy/components/onboarding/modules/WelcomeModule';
import { ValuesModule } from '@/modules/growbuddy/components/onboarding/modules/ValuesModule';
import { DailyLifeModule } from '@/modules/growbuddy/components/onboarding/modules/DailyLifeModule';
import { SafetyModule } from '@/modules/growbuddy/components/onboarding/modules/SafetyModule';
import { NetherlandsModule } from '@/modules/growbuddy/components/onboarding/modules/NetherlandsModule';
import { QuizModule } from '@/modules/growbuddy/components/onboarding/modules/QuizModule';
import { useOnboardingProgress } from '@/modules/growbuddy/hooks/useOnboardingProgress';

const modules = [
  { id: 'welcome', component: WelcomeModule },
  { id: 'values', component: ValuesModule },
  { id: 'daily-life', component: DailyLifeModule },
  { id: 'safety', component: SafetyModule },
  { id: 'netherlands', component: NetherlandsModule },
  { id: 'quiz', component: QuizModule },
];

const OnboardingPage = () => {
  const { progress, updateModuleProgress, setCurrentModule } = useOnboardingProgress();
  const [showNetherlandsModule, setShowNetherlandsModule] = useState(false);

  const getCurrentModuleIndex = () => {
    if (!showNetherlandsModule && progress.currentModule === 4) {
      return 5; // Skip to quiz if Netherlands module is hidden
    }
    return progress.currentModule;
  };

  const currentModuleIndex = getCurrentModuleIndex();
  const CurrentModuleComponent = modules[currentModuleIndex]?.component;

  const handleModuleProgressUpdate = (moduleId: string, updates: any) => {
    updateModuleProgress(moduleId, updates);
    
    // Auto-advance to next module when completed
    if (updates.completed) {
      const nextIndex = currentModuleIndex + 1;
      if (nextIndex < modules.length) {
        // Skip Netherlands module if not enabled
        if (nextIndex === 4 && !showNetherlandsModule) {
          setCurrentModule(5);
        } else {
          setCurrentModule(nextIndex);
        }
      }
    }
  };

  const handleNetherlandsToggle = (checked: boolean) => {
    setShowNetherlandsModule(checked);
    // If we're currently on Netherlands module and it's being disabled, move to quiz
    if (!checked && progress.currentModule === 4) {
      setCurrentModule(5);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <OnboardingSidebar
        progress={progress}
        currentModule={currentModuleIndex}
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
              moduleProgress={progress.modules[modules[currentModuleIndex].id]}
              onUpdateProgress={(updates: any) => 
                handleModuleProgressUpdate(modules[currentModuleIndex].id, updates)
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
