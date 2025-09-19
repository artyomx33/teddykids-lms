'use client';

import { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type {
  KnowledgeDocument,
  KnowledgeDocumentSection,
  StaffSectionCompletion,
} from '@/modules/growbuddy/data/documents';

import { DocumentSection } from './DocumentSection';

export type SectionCompletionHandler = (sectionId: string, score: number) => Promise<void>;

interface DocumentReaderClientProps {
  document: KnowledgeDocument;
  sections: KnowledgeDocumentSection[];
  initialCompletions: StaffSectionCompletion[];
  staffId?: string;
  onSectionCompletion?: SectionCompletionHandler;
}

const determineInitialSectionIndex = (
  sections: KnowledgeDocumentSection[],
  completedIds: string[],
): number => {
  if (sections.length === 0) {
    return 0;
  }

  const completedSet = new Set(completedIds);
  const firstIncomplete = sections.findIndex((section) => !completedSet.has(section.id));
  return firstIncomplete === -1 ? 0 : firstIncomplete;
};

export const DocumentReaderClient = ({
  document,
  sections,
  initialCompletions,
  staffId,
  onSectionCompletion,
}: DocumentReaderClientProps) => {
  const initialCompletedIds = useMemo(
    () =>
      initialCompletions
        .filter((completion) => completion.passed && completion.sectionId)
        .map((completion) => completion.sectionId),
    [initialCompletions],
  );

  const [completedSections, setCompletedSections] = useState<Set<string>>(
    () => new Set(initialCompletedIds),
  );

  const initialSectionIndex = useMemo(
    () => determineInitialSectionIndex(sections, initialCompletedIds),
    [sections, initialCompletedIds],
  );

  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(initialSectionIndex);

  const totalSections = sections.length;
  const safeIndex = totalSections === 0 ? 0 : Math.min(currentSectionIndex, totalSections - 1);
  const currentSection = totalSections > 0 ? sections[safeIndex] : undefined;

  const progressPercentage =
    totalSections === 0 ? 0 : (completedSections.size / totalSections) * 100;

  const backHref = staffId ? `/staff/${staffId}` : '/grow/knowledge';

  const handleSectionComplete = useCallback(
    async (sectionId: string, score: number) => {
      setCompletedSections((previous) => {
        if (previous.has(sectionId)) {
          return previous;
        }

        const updated = new Set(previous);
        updated.add(sectionId);
        return updated;
      });

      if (onSectionCompletion) {
        try {
          await onSectionCompletion(sectionId, score);
        } catch (error) {
          console.error('Failed to persist section completion', error);
        }
      }
    },
    [onSectionCompletion],
  );

  const canNavigateNext =
    !!currentSection &&
    currentSectionIndex < totalSections - 1 &&
    completedSections.has(currentSection.id);

  const goToNextSection = useCallback(() => {
    if (canNavigateNext) {
      setCurrentSectionIndex((index) => Math.min(index + 1, totalSections - 1));
    }
  }, [canNavigateNext, totalSections]);

  const goToPreviousSection = useCallback(() => {
    setCurrentSectionIndex((index) => Math.max(index - 1, 0));
  }, []);

  const sectionIndicators = sections.map((section, index) => {
    const isActive = index === safeIndex;
    const isCompleted = completedSections.has(section.id);

    const baseClasses = 'w-3 h-3 rounded-full transition-colors';
    const stateClass = isActive
      ? 'bg-primary'
      : isCompleted
      ? 'bg-green-500'
      : 'bg-muted';

    return <div key={section.id} className={`${baseClasses} ${stateClass}`} />;
  });

  const renderSectionContent = () => {
    if (!currentSection) {
      return (
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <BookOpen className="w-10 h-10 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">No sections available</h2>
            <p className="text-muted-foreground">
              This knowledge module has not been populated with any sections yet. Please check back later.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <DocumentSection
        key={currentSection.id}
        section={currentSection}
        isCompleted={completedSections.has(currentSection.id)}
        onComplete={async (score) => handleSectionComplete(currentSection.id, score)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" asChild>
              <a href={backHref}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {staffId ? 'Back to Profile' : 'Knowledge Center'}
              </a>
            </Button>

            <div className="flex items-center gap-4">
              {document.required && <Badge variant="secondary">Required</Badge>}
              {totalSections > 0 && (
                <span className="text-sm text-muted-foreground">
                  Section {safeIndex + 1} of {totalSections}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <div className="flex items-center justify-between gap-4">
              <p className="text-muted-foreground flex-1">
                {document.description || 'Dive into this knowledge module to continue your learning journey.'}
              </p>
              <div className="text-right">
                <div className="text-sm font-medium">{Math.round(progressPercentage)}% Complete</div>
                <Progress value={progressPercentage} className="w-32 h-2 mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {renderSectionContent()}

        {totalSections > 0 && currentSection && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goToPreviousSection}
                  disabled={safeIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous Section
                </Button>

                <div className="flex items-center gap-2">{sectionIndicators}</div>

                {safeIndex < totalSections - 1 ? (
                  <Button
                    onClick={goToNextSection}
                    disabled={!canNavigateNext}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Next Section
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : completedSections.has(currentSection.id) ? (
                  <Button
                    asChild
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <a href={backHref}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Module
                    </a>
                  </Button>
                ) : (
                  <Button disabled>
                    Complete Section First
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
