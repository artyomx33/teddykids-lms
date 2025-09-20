import { KnowledgePage } from '@/modules/growbuddy/pages/KnowledgePage';
import { listKnowledgeDocuments } from '@/modules/growbuddy/data/documents';

type KnowledgeIndexPageProps = {
  searchParams?: {
    staffId?: string;
  };
};

const KnowledgeIndexPage = async ({ searchParams }: KnowledgeIndexPageProps) => {
  const staffIdParam = searchParams?.staffId;
  const staffId = staffIdParam && staffIdParam.trim().length > 0 ? staffIdParam.trim() : undefined;
  const { documents, stats } = await listKnowledgeDocuments({ staffId });

  return <KnowledgePage documents={documents} stats={stats} />;
};

export default KnowledgeIndexPage;
