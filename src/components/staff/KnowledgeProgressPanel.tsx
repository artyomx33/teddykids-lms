import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, BookOpen } from "lucide-react";

interface KnowledgeModule {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  score?: number;
}

interface KnowledgeProgressPanelProps {
  staffId: string;
  modules?: KnowledgeModule[];
  onViewProgress?: () => void;
}

export function KnowledgeProgressPanel({ staffId, modules, onViewProgress }: KnowledgeProgressPanelProps) {
  // Default modules when no data available
  const defaultModules = [
    { id: 'pedagogy', title: 'Pedagogy', completed: false, score: undefined },
    { id: 'illness', title: 'Illness Protocol', completed: false, score: undefined },
    { id: 'intern-hours', title: 'Intern Hours', completed: false, score: undefined },
    { id: 'safety', title: 'Safety Guidelines', completed: false, score: undefined },
  ];

  const displayModules = modules || defaultModules;
  const completedCount = displayModules.filter(m => m.completed).length;
  const totalCount = displayModules.length;
  const hasData = modules && modules.length > 0;

  const getModuleIcon = (completed: boolean) => {
    return completed ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-muted-foreground" />
    );
  };

  const getCompletionBadge = () => {
    if (!hasData) {
      return <Badge variant="secondary">Missing Data</Badge>;
    }
    
    if (completedCount === totalCount) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge>;
    } else if (completedCount > 0) {
      return <Badge variant="secondary">{completedCount}/{totalCount} Done</Badge>;
    } else {
      return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Knowledge Progress
          </CardTitle>
          {getCompletionBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasData && (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3 text-center">
            No knowledge progress data available
          </div>
        )}
        
        <div className="space-y-2">
          {displayModules.map((module) => (
            <div key={module.id} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                {getModuleIcon(module.completed)}
                <span className={`text-sm ${!hasData ? 'text-muted-foreground' : ''}`}>
                  {module.title}
                </span>
              </div>
              {module.completed && module.score && (
                <Badge variant="outline" className="text-xs">
                  {module.score}%
                </Badge>
              )}
            </div>
          ))}
        </div>

        {hasData && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewProgress}
            className="w-full mt-3"
          >
            View Full Progress
          </Button>
        )}
      </CardContent>
    </Card>
  );
}