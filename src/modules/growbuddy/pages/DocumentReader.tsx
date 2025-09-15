import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, CheckCircle, BookOpen, Brain, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentSection } from '../components/knowledge/DocumentSection';

interface Document {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

interface Section {
  id: string;
  section_number: number;
  title: string;
  content: string;
  summary: string;
  key_points: string[];
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: number;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  correctAnswer: number | boolean;
}

export const DocumentReader: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchDocument();
    }
  }, [slug]);

  const fetchDocument = async () => {
    try {
      // Fetch document
      const { data: docData, error: docError } = await supabase
        .from('tk_documents')
        .select('*')
        .eq('slug', slug)
        .single();

      if (docError) throw docError;
      
      setDocument(docData);

      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('tk_document_sections')
        .select('*')
        .eq('doc_id', docData.id)
        .order('section_number');

      if (sectionsError) throw sectionsError;

      const sectionsWithParsedData = sectionsData?.map(section => ({
        ...section,
        key_points: JSON.parse(section.key_points || '[]'),
        questions: JSON.parse(section.questions || '[]')
      })) || [];

      setSections(sectionsWithParsedData);
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionComplete = (sectionId: string) => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
  };

  const canNavigateNext = () => {
    const currentSection = sections[currentSectionIndex];
    return currentSection && completedSections.has(currentSection.id);
  };

  const nextSection = () => {
    if (currentSectionIndex < sections.length - 1 && canNavigateNext()) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const prevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const progressPercentage = (completedSections.size / sections.length) * 100;
  const currentSection = sections[currentSectionIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 flex items-center justify-center">
        <div className="animate-pulse text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto" />
          <div className="w-48 h-6 bg-muted rounded mx-auto" />
          <div className="w-32 h-4 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!document || !currentSection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Document Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The knowledge module you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/grow/knowledge')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Knowledge Center
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate('/grow/knowledge')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Knowledge Center
            </Button>
            
            <div className="flex items-center gap-4">
              {document.required && (
                <Badge variant="secondary">Required</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                Section {currentSectionIndex + 1} of {sections.length}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">{document.description}</p>
              <div className="text-right">
                <div className="text-sm font-medium">{Math.round(progressPercentage)}% Complete</div>
                <Progress value={progressPercentage} className="w-32 h-2 mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <DocumentSection
          section={currentSection}
          isCompleted={completedSections.has(currentSection.id)}
          onComplete={() => handleSectionComplete(currentSection.id)}
        />

        {/* Navigation */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={prevSection}
                disabled={currentSectionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Section
              </Button>

              <div className="flex items-center gap-2">
                {sections.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSectionIndex
                        ? 'bg-primary'
                        : completedSections.has(sections[index].id)
                        ? 'bg-green-500'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {currentSectionIndex < sections.length - 1 ? (
                <Button 
                  onClick={nextSection}
                  disabled={!canNavigateNext()}
                  className="bg-primary hover:bg-primary/90"
                >
                  Next Section
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : completedSections.has(currentSection.id) ? (
                <Button 
                  onClick={() => navigate('/grow/knowledge')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Module
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
      </div>
    </div>
  );
};