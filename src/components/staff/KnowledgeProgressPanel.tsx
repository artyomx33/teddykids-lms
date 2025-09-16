import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, BookOpen, Play, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const navigate = useNavigate();

  // Fetch available documents from tk_documents
  const { data: availableDocuments } = useQuery({
    queryKey: ['tk_documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tk_documents')
        .select('*')
        .eq('required', true)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch staff progress from staff_knowledge_completion
  const { data: completionData } = useQuery({
    queryKey: ['staff_knowledge_completion', staffId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_knowledge_completion')
        .select('doc_id, score, passed, completed_at')
        .eq('staff_id', staffId);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Combine real data with modules prop fallback
  const getRealModules = () => {
    if (availableDocuments && completionData) {
      return availableDocuments.map(doc => {
        const completion = completionData.find(c => c.doc_id === doc.id);
        return {
          id: doc.slug,
          title: doc.title,
          completed: completion?.passed || false,
          completedAt: completion?.completed_at,
          score: completion?.score
        };
      });
    }
    return null;
  };

  // Default modules when no real data available
  const defaultModules = [
    { id: 'pedagogy', title: 'Pedagogy Basics', completed: false, score: undefined },
    { id: 'illness', title: 'Illness Protocol', completed: false, score: undefined },
    { id: 'intern-hours', title: 'Intern Hours Policy', completed: false, score: undefined },
    { id: 'safety', title: 'Safety Guidelines', completed: false, score: undefined },
  ];

  const realModules = getRealModules();
  const displayModules = modules || realModules || defaultModules;
  const hasRealData = realModules && realModules.length > 0;
  const completedCount = displayModules.filter(m => m.completed).length;
  const totalCount = displayModules.length;
  const hasData = modules && modules.length > 0 || hasRealData;
  const progressPercentage = (completedCount / totalCount) * 100;

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

  // Get available trainings from real documents or defaults
  const getAvailableTrainings = () => {
    if (availableDocuments && availableDocuments.length > 0) {
      return availableDocuments.slice(0, 2).map(doc => ({
        id: doc.slug,
        title: `Start ${doc.title}`,
        description: doc.description || '~15 min course'
      }));
    }
    
    return [
      { id: 'pedagogy', title: 'Start Pedagogy Training', description: '~15 min course' },
      { id: 'safety', title: 'Begin Safety Course', description: '~10 min course' },
    ];
  };

  const availableTrainings = getAvailableTrainings();

  const handleStartTraining = (trainingId: string) => {
    navigate(`/staff/${staffId}/knowledge/${trainingId}`);
  };

  const handleViewAllKnowledge = () => {
    navigate('/grow/knowledge');
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
        {!hasData && (
          <div className="mt-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {completedCount} of {totalCount} modules complete
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Start your knowledge journey with these essential trainings:
            </div>
            
            <div className="space-y-2">
              {availableTrainings.map((training) => (
                <Button
                  key={training.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 h-auto p-3"
                  onClick={() => handleStartTraining(training.id)}
                >
                  <Play className="h-4 w-4 text-primary" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{training.title}</div>
                    <div className="text-xs text-muted-foreground">{training.description}</div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
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

        {hasData ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewProgress || handleViewAllKnowledge}
            className="w-full mt-3"
          >
            View Full Progress
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewAllKnowledge}
            className="w-full mt-3"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Browse All Courses
          </Button>
        )}
      </CardContent>
    </Card>
  );
}