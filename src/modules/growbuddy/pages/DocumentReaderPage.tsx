import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { getDocumentWithSections } from "@/modules/growbuddy/data/documents";
import { DocumentReaderClient } from "@/modules/growbuddy/components/knowledge/DocumentReaderClient";
import type { 
  KnowledgeDocument, 
  KnowledgeDocumentSection, 
  StaffSectionCompletion 
} from "@/modules/growbuddy/data/documents";

const DocumentReaderPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const staffId = searchParams.get('staffId') || undefined;

  const [document, setDocument] = useState<KnowledgeDocument | null>(null);
  const [sections, setSections] = useState<KnowledgeDocumentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      if (!slug) {
        setError("No document slug provided");
        setLoading(false);
        return;
      }

      try {
        const docWithSections = await getDocumentWithSections(slug);
        
        if (!docWithSections) {
          setError("Document not found");
          setLoading(false);
          return;
        }

        setDocument(docWithSections.document);
        setSections(docWithSections.sections);
        setLoading(false);
      } catch (err) {
        console.error('Error loading document:', err);
        setError("Failed to load document");
        setLoading(false);
      }
    };

    loadDocument();
  }, [slug]);

  const handleSectionCompletion = async (sectionId: string, score: number) => {
    // TODO: Implement section completion saving to database
    const completed = score >= 80; // 80% or higher is considered complete
    console.log('Section completion:', { sectionId, score, completed, staffId });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="space-y-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Document Not Found</CardTitle>
            <CardDescription>
              {error || "The requested document could not be found."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/grow/knowledge">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Knowledge Center
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <DocumentReaderClient
        document={document}
        sections={sections}
        initialCompletions={[]} // TODO: Load actual completions from database
        staffId={staffId}
        onSectionCompletion={handleSectionCompletion}
      />
    </div>
  );
};

export default DocumentReaderPage;