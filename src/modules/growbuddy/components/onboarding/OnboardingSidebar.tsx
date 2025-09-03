import { CheckCircle2, Circle, Heart, Shield, MapPin, BookOpen, Award, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OnboardingProgress } from '@/modules/growbuddy/types/onboarding';

// Use placeholder SVG instead of imported image
const appiesMascot = '/placeholder.svg';

const modules = [
  { id: 'welcome', title: 'Welcome to the Teddy Family', icon: Heart },
  { id: 'values', title: 'The Teddy Code', icon: BookOpen },
  { id: 'daily-life', title: 'Daily Life at Teddy Kids', icon: User },
  { id: 'safety', title: 'Safety & Conduct', icon: Shield },
  { id: 'netherlands', title: 'Moving to the Netherlands', icon: MapPin },
  { id: 'quiz', title: 'Final Quiz & Certification', icon: Award },
];

interface OnboardingSidebarProps {
  progress: OnboardingProgress;
  currentModule: number;
  onModuleSelect: (index: number) => void;
  showNetherlandsModule: boolean;
}

export const OnboardingSidebar = ({ 
  progress, 
  currentModule, 
  onModuleSelect, 
  showNetherlandsModule 
}: OnboardingSidebarProps) => {
  const getModuleIcon = (index: number) => {
    const moduleId = modules[index].id;
    const isCompleted = progress.modules[moduleId]?.completed;
    
    return isCompleted ? CheckCircle2 : Circle;
  };

  const filteredModules = showNetherlandsModule 
    ? modules 
    : modules.filter(m => m.id !== 'netherlands');

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
        {filteredModules.map((module, index) => {
          const actualIndex = showNetherlandsModule 
            ? index 
            : index >= 4 ? index + 1 : index;
          
          const Icon = module.icon;
          const StatusIcon = getModuleIcon(actualIndex);
          const isCompleted = progress.modules[module.id]?.completed;
          const isCurrent = currentModule === actualIndex;
          
          return (
            <Button
              key={module.id}
              variant={isCurrent ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-4 text-left",
                isCurrent && "bg-primary text-primary-foreground",
                isCompleted && !isCurrent && "bg-success/10 text-success hover:bg-success/20"
              )}
              onClick={() => onModuleSelect(actualIndex)}
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
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          © 2024 Teddy Kids LMS
        </div>
      </div>
    </div>
  );
};
