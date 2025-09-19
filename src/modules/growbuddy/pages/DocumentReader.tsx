import { ArrowLeft, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DocumentReaderClient, type SectionCompletionHandler } from '@/modules/growbuddy/components/knowledge/DocumentReaderClient';
import { saveSectionCompletion } from '@/modules/growbuddy/actions/knowledge';
import { getCompletionForStaff, getDocumentWithSections } from '@/modules/growbuddy/data/documents';

type DocumentReaderPageProps = {
  params: {
    slug: string;
  };
  searchParams?: {
    staffId?: string;
  };
};

type DocumentFallbackProps = {
  title: string;
  message: string;
  backHref: string;
};

const DocumentFallback = ({ title, message, backHref }: DocumentFallbackProps) => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 flex items-center justify-center">
    <Card className="w-full max-w-md text-center">
      <CardContent className="pt-6 space-y-4">
        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{message}</p>
        <Button asChild>
          <a href={backHref}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Knowledge Center
          </a>
        </Button>
      </CardContent>
    </Card>
  </div>
);

const DocumentReaderPage = async ({ params, searchParams }: DocumentReaderPageProps) => {
  const slug = params.slug;
  const staffId = searchParams?.staffId;
  const backHref = staffId ? `/staff/${staffId}` : '/grow/knowledge';

  try {
    const documentWithSections = await getDocumentWithSections(slug);

    if (!documentWithSections) {
      return (
        <DocumentFallback
          title="Document Not Found"
          message="The knowledge module you're looking for doesn't exist or may have been archived."
          backHref={backHref}
        />
      );
    }

    const { document, sections } = documentWithSections;

    const completions = staffId
      ? await getCompletionForStaff(document.id, staffId)
      : [];

    const sectionCompletionHandler: SectionCompletionHandler | undefined = staffId
      ? async (sectionId, score) => {
          await saveSectionCompletion(document.id, staffId, sectionId, score);
        }
      : undefined;

    return (
      <DocumentReaderClient
        document={document}
        sections={sections}
        initialCompletions={completions}
        staffId={staffId}
        onSectionCompletion={sectionCompletionHandler}
      />
    );
  } catch (error) {
    console.error('Failed to render knowledge document', error);
    return (
      <DocumentFallback
        title="Unable to load document"
        message="We ran into a problem while loading this knowledge module. Please try again later."
        backHref={backHref}
      />
    );
  }
};

export default DocumentReaderPage;
