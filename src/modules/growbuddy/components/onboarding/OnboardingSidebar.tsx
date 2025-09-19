import { CheckCircle2, Circle, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getVisibleModules } from '@/modules/growbuddy/onboarding/modules.config';
import { OnboardingProgress, OnboardingModuleKey } from '@/modules/growbuddy/types/onboarding';

// Use placeholder SVG instead of imported image
const appiesMascot = '/placeholder.svg';

interface OnboardingSidebarProps {
  progress: OnboardingProgress;
  currentModule: OnboardingModuleKey;
  onModuleSelect: (module: OnboardingModuleKey) => void;
  showNetherlandsModule: boolean;
}

export const OnboardingSidebar = ({
  progress,
  currentModule,
  onModuleSelect,
  showNetherlandsModule
}: OnboardingSidebarProps) => {
  const modules = getVisibleModules(showNetherlandsModule);

  const getModuleIcon = (moduleKey: OnboardingModuleKey) => {
    const isCompleted = progress.modules[moduleKey]?.completed;

    return isCompleted ? CheckCircle2 : Circle;
  };

  return (
    <div className="w-80 bg-card border-r border-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <img src={appiesMascot} alt="Appies" className="w-12 h-12 rounded-full" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Teddy Kids</h1>
            <p className="text-sm text-muted-foreground">Staff Onboarding</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-primary font-medium">{progress.completionPercentage}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Module List */}
      <div className="flex-1 p-4 space-y-2">
        {modules.map(module => {
          const Icon = module.icon;
          const StatusIcon = getModuleIcon(module.key);
          const isCompleted = progress.modules[module.key]?.completed;
          const isCurrent = currentModule === module.key;

          return (
            <Button
              key={module.key}
              variant={isCurrent ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-4 text-left",
                isCurrent && "bg-primary text-primary-foreground",
                isCompleted && !isCurrent && "bg-success/10 text-success hover:bg-success/20"
              )}
              onClick={() => onModuleSelect(module.key)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <StatusIcon
                    className={cn(
                      "h-4 w-4",
                      isCompleted && "text-success"
                    )} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{module.title}</div>
                  {isCompleted && (
                    <div className="text-xs opacity-70">Completed</div>
                  )}
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3">
        <Button
          asChild
          variant="outline"
          className="w-full justify-start gap-2 hover:bg-primary/10"
        >
          <a href="/grow/knowledge">
            <Brain className="w-4 h-4" />
            Knowledge Center
          </a>
        </Button>
        
        <div className="text-xs text-muted-foreground text-center">
          © 2024 Teddy Kids LMS
        </div>
      </div>
    </div>
  );
};
