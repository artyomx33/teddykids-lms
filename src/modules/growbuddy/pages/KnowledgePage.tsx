import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: string;
  title: string;
  slug: string;
  description: string;
  required: boolean;
  section_count: number;
  completed_sections: number;
  completion_percentage: number;
}

export const KnowledgePage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      // Get documents with section counts and completion status
      const { data: docsData, error: docsError } = await supabase
        .from('tk_documents')
        .select(`
          id,
          title,
          slug,
          description,
          required,
          tk_document_sections!inner(id)
        `);

      if (docsError) throw docsError;

      // For now, mock completion data since we don't have user auth
      const documentsWithProgress = docsData?.map(doc => ({
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        description: doc.description || '',
        required: doc.required,
        section_count: doc.tk_document_sections?.length || 0,
        completed_sections: 0, // TODO: Get from actual user progress
        completion_percentage: 0
      })) || [];

      setDocuments(documentsWithProgress);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mx-auto mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">{documents.length}</div>
              <div className="text-sm text-muted-foreground">Knowledge Modules</div>
            </CardContent>
          </Card>
          
          <Card className="border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold">
                {documents.reduce((acc, doc) => acc + doc.completed_sections, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Sections Completed</div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 mx-auto mb-2">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">
                {Math.round(documents.reduce((acc, doc) => acc + doc.completion_percentage, 0) / documents.length) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {documents.map((doc) => (
            <Card 
              key={doc.id} 
              className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/30 hover:border-l-primary"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {doc.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {doc.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {doc.required && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                    {doc.completion_percentage > 0 && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {doc.completion_percentage}%
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
                      {doc.section_count} sections
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      ~{doc.section_count * 5} min
                    </span>
                  </div>
                </div>
                
                {doc.completion_percentage > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{doc.completed_sections}/{doc.section_count} sections</span>
                    </div>
                    <Progress value={doc.completion_percentage} className="h-2" />
                  </div>
                )}
                
                <Link to={`/grow/knowledge/${doc.slug}`}>
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant={doc.completion_percentage > 0 ? "outline" : "default"}
                  >
                    {doc.completion_percentage > 0 ? 'Continue Learning' : 'Start Learning'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};