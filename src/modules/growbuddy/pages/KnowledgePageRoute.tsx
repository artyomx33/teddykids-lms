'use client';

import { useLoaderData } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';

import { supabase } from '@/integrations/supabase/client';
import {
  listKnowledgeDocuments,
  type KnowledgeDocumentsListResult,
} from '@/modules/growbuddy/data/documents';

import { KnowledgePage, type KnowledgePageProps } from './KnowledgePage';

export type KnowledgePageLoaderData = KnowledgePageProps;

export const knowledgePageLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const staffIdParam = url.searchParams.get('staffId');
  const staffId = staffIdParam && staffIdParam.trim().length > 0 ? staffIdParam.trim() : undefined;

  const { documents, stats }: KnowledgeDocumentsListResult = await listKnowledgeDocuments({
    staffId,
    client: supabase,
  });

  return { documents, stats } satisfies KnowledgePageLoaderData;
};

export const KnowledgePageRoute = () => {
  const data = useLoaderData() as KnowledgePageLoaderData;
  return <KnowledgePage {...data} />;
};
