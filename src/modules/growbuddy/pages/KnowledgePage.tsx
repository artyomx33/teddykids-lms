import { BookOpen, CheckCircle, Clock, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type {
  KnowledgeDocumentListEntry,
  KnowledgeDocumentsStats,
} from '@/modules/growbuddy/data/documents';

export type KnowledgePageProps = {
  documents: KnowledgeDocumentListEntry[];
  stats?: KnowledgeDocumentsStats;
};

const computeStats = (documents: KnowledgeDocumentListEntry[]): KnowledgeDocumentsStats => {
  const totalSections = documents.reduce((accumulator, entry) => accumulator + entry.sectionCount, 0);
  const completedSections = documents.reduce(
    (accumulator, entry) => accumulator + entry.completedSections,
    0,
  );

  return {
    totalDocuments: documents.length,
    totalSections,
    completedSections,
    overallCompletionPercentage:
      totalSections === 0 ? 0 : Math.round((completedSections / totalSections) * 100),
  };
};

export const KnowledgePage = ({ documents, stats }: KnowledgePageProps) => {
  const derivedStats = stats ?? computeStats(documents);
  const { totalDocuments, completedSections, overallCompletionPercentage } = derivedStats;

  const hasDocuments = documents.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Teddy Kids Knowledge Center
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Master the essential knowledge you need to excel at Teddy Kids. Each module contains
            interactive content, quizzes, and practical insights from our experienced team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mx-auto mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">{totalDocuments}</div>
              <div className="text-sm text-muted-foreground">Knowledge Modules</div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{completedSections}</div>
              <div className="text-sm text-muted-foreground">Sections Completed</div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 mx-auto mb-2">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">
                {totalDocuments === 0 ? 0 : overallCompletionPercentage}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </CardContent>
          </Card>
        </div>

        {hasDocuments ? (
          <div className="grid gap-6 md:grid-cols-2">
            {documents.map(({
              document,
              sectionCount,
              completedSections: docCompletedSections,
              completionPercentage,
            }) => {
              const description = document.description ?? '';
              const estimatedMinutes = sectionCount * 5;
              const showProgress = completionPercentage > 0 && sectionCount > 0;

              return (
                <Card
                  key={document.id}
                  className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/30 hover:border-l-primary"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {document.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {description.length > 0 ? description : 'Explore this knowledge module to learn more.'}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {document.required && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                        {completionPercentage > 0 && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {completionPercentage}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {sectionCount} sections
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          ~{estimatedMinutes} min
                        </span>
                      </div>
                    </div>

                    {showProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {docCompletedSections}/{sectionCount} sections
                          </span>
                        </div>
                        <Progress value={completionPercentage} className="h-2" />
                      </div>
                    )}

                    <Button
                      asChild
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      variant={completionPercentage > 0 ? 'outline' : 'default'}
                    >
                      <a href={`/grow/knowledge/${document.slug}`}>
                        {completionPercentage > 0 ? 'Continue Learning' : 'Start Learning'}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-10 text-center space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">No knowledge modules available yet</h2>
              <p className="text-muted-foreground text-sm">
                We're preparing engaging training materials. Check back soon to begin your learning journey.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
