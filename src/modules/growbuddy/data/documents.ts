import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/integrations/supabase/types';

const readProcessEnv = (key: string): string | undefined => {
  if (typeof process === 'undefined' || typeof process.env === 'undefined') {
    return undefined;
  }

  return process.env[key];
};

const resolveSupabaseConfig = () => {
  const url =
    readProcessEnv('NEXT_PUBLIC_SUPABASE_URL') ??
    readProcessEnv('VITE_SUPABASE_URL');

  const key =
    readProcessEnv('SUPABASE_SERVICE_ROLE_KEY') ??
    readProcessEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ??
    readProcessEnv('VITE_SUPABASE_PUBLISHABLE_KEY');

  return { url, key };
};

const assertSupabaseConfig = (url: string | undefined, key: string | undefined) => {
  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Please provide NEXT_PUBLIC_SUPABASE_URL and a valid key.'
    );
  }
};

export const createSupabaseServerClient = () => {
  const { url, key } = resolveSupabaseConfig();
  assertSupabaseConfig(url, key);
  return createClient<Database>(url!, key!, {
    auth: {
      persistSession: false,
    },
  });
};

export type KnowledgeDocument = Database['public']['Tables']['tk_documents']['Row'];
export type KnowledgeDocumentSectionRow = Database['public']['Tables']['tk_document_sections']['Row'];

export type KnowledgeQuizQuestion = {
  id: number;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  correctAnswer: number | boolean;
};

export type KnowledgeDocumentSection = Omit<KnowledgeDocumentSectionRow, 'key_points' | 'questions'> & {
  key_points: string[];
  questions: KnowledgeQuizQuestion[];
};

export type KnowledgeDocumentWithSections = {
  document: KnowledgeDocument;
  sections: KnowledgeDocumentSection[];
};

export type StaffSectionCompletion = {
  sectionId: string;
  score: number | null;
  passed: boolean;
  completedAt: string;
};

export type KnowledgeDocumentListEntry = {
  document: KnowledgeDocument;
  sectionCount: number;
  completedSections: number;
  completionPercentage: number;
};

export type KnowledgeDocumentsStats = {
  totalDocuments: number;
  totalSections: number;
  completedSections: number;
  overallCompletionPercentage: number;
};

export type KnowledgeDocumentsListResult = {
  documents: KnowledgeDocumentListEntry[];
  stats: KnowledgeDocumentsStats;
};

type ListKnowledgeDocumentsOptions = {
  staffId?: string;
  client?: SupabaseClient<Database>;
};

const safeJsonParse = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value ?? null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Failed to parse JSON value for knowledge module', error);
    return null;
  }
};

const normaliseKeyPoints = (value: KnowledgeDocumentSectionRow['key_points']): string[] => {
  const parsed = safeJsonParse(value);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    .map(entry => entry.trim());
};

const normaliseQuestions = (
  value: KnowledgeDocumentSectionRow['questions']
): KnowledgeQuizQuestion[] => {
  const parsed = safeJsonParse(value);
  if (!Array.isArray(parsed)) {
    return [];
  }

  const normalisedQuestions: KnowledgeQuizQuestion[] = [];

  parsed.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }

    const candidate = item as Record<string, unknown>;
    const idRaw = candidate.id;
    const id = typeof idRaw === 'number' ? idRaw : Number(idRaw);
    const question = candidate.question;
    const type = candidate.type;
    const optionsRaw = candidate.options;
    const correctAnswer = candidate.correctAnswer;

    if (!Number.isFinite(id) || typeof question !== 'string') {
      return;
    }

    if (type !== 'multiple-choice' && type !== 'true-false') {
      return;
    }

    let options: string[] | undefined;
    if (Array.isArray(optionsRaw)) {
      options = optionsRaw.filter((option): option is string => typeof option === 'string');
    }

    if (type === 'multiple-choice') {
      if (
        typeof correctAnswer !== 'number' ||
        !options ||
        options.length === 0 ||
        correctAnswer < 0 ||
        correctAnswer >= options.length
      ) {
        return;
      }

      normalisedQuestions.push({
        id,
        question,
        type,
        options,
        correctAnswer,
      });
      return;
    }

    if (type === 'true-false') {
      if (typeof correctAnswer !== 'boolean') {
        return;
      }

      normalisedQuestions.push({
        id,
        question,
        type,
        correctAnswer,
      });
    }
  });

  return normalisedQuestions;
};

export const getDocumentWithSections = async (
  slug: string
): Promise<KnowledgeDocumentWithSections | null> => {
  const supabase = createSupabaseServerClient();

  const { data: document, error: documentError } = await supabase
    .from('tk_documents')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (documentError) {
    throw new Error(`Failed to load knowledge document: ${documentError.message}`);
  }

  if (!document) {
    return null;
  }

  const { data: sections, error: sectionsError } = await supabase
    .from('tk_document_sections')
    .select('*')
    .eq('doc_id', document.id)
    .order('section_number', { ascending: true });

  if (sectionsError) {
    throw new Error(`Failed to load document sections: ${sectionsError.message}`);
  }

  const normalisedSections = (sections ?? []).map((section) => ({
    ...section,
    key_points: normaliseKeyPoints(section.key_points),
    questions: normaliseQuestions(section.questions),
  }));

  return {
    document,
    sections: normalisedSections,
  };
};

export const getCompletionForStaff = async (
  docId: string,
  staffId: string
): Promise<StaffSectionCompletion[]> => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('staff_knowledge_completion')
    .select('section_id, score, passed, completed_at')
    .eq('doc_id', docId)
    .eq('staff_id', staffId)
    .order('completed_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to load staff completion data: ${error.message}`);
  }

  return (data ?? [])
    .filter((entry): entry is typeof entry & { section_id: string } => typeof entry.section_id === 'string')
    .map((entry) => ({
      sectionId: entry.section_id,
      score: entry.score,
      passed: entry.passed,
      completedAt: entry.completed_at,
    }));
};

type KnowledgeDocumentWithRelation = KnowledgeDocument & {
  tk_document_sections: Pick<KnowledgeDocumentSectionRow, 'id'>[] | null;
};

type StaffCompletionRow = Pick<
  Database['public']['Tables']['staff_knowledge_completion']['Row'],
  'doc_id' | 'section_id' | 'passed'
>;

const deriveStatsFromDocuments = (documents: KnowledgeDocumentListEntry[]): KnowledgeDocumentsStats => {
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

const buildCompletionIndex = (rows: StaffCompletionRow[] = []): Map<string, Set<string>> => {
  const completions = new Map<string, Set<string>>();

  rows.forEach((row) => {
    if (!row.passed) {
      return;
    }

    const docId = row.doc_id;
    const sectionId = row.section_id;

    if (typeof docId !== 'string' || typeof sectionId !== 'string') {
      return;
    }

    const sectionSet = completions.get(docId) ?? new Set<string>();
    sectionSet.add(sectionId);
    completions.set(docId, sectionSet);
  });

  return completions;
};

export const listKnowledgeDocuments = async ({
  staffId,
  client,
}: ListKnowledgeDocumentsOptions = {}): Promise<KnowledgeDocumentsListResult> => {
  const supabase = client ?? createSupabaseServerClient();

  const { data: documentRows, error: documentsError } = await supabase
    .from('tk_documents')
    .select('*, tk_document_sections(id)')
    .order('created_at', { ascending: true });

  if (documentsError) {
    throw new Error(`Failed to load knowledge documents: ${documentsError.message}`);
  }

  const documentsWithSections = (documentRows ?? []) as KnowledgeDocumentWithRelation[];

  let completionRows: StaffCompletionRow[] | undefined;

  if (staffId) {
    const { data, error } = await supabase
      .from('staff_knowledge_completion')
      .select('doc_id, section_id, passed')
      .eq('staff_id', staffId)
      .eq('passed', true);

    if (error) {
      throw new Error(`Failed to load staff completion data: ${error.message}`);
    }

    completionRows = data as StaffCompletionRow[] | undefined;
  }

  const completionIndex = buildCompletionIndex(completionRows);

  const documents: KnowledgeDocumentListEntry[] = documentsWithSections.map((doc) => {
    const { tk_document_sections, ...documentRest } = doc;
    const document = documentRest as KnowledgeDocument;

    const sectionIds = (tk_document_sections ?? [])
      .map((section) => section?.id)
      .filter((id): id is string => typeof id === 'string');

    const sectionCount = sectionIds.length;
    const completedSections = Math.min(sectionCount, completionIndex.get(document.id)?.size ?? 0);
    const completionPercentage =
      sectionCount === 0 ? 0 : Math.round((completedSections / sectionCount) * 100);

    return {
      document,
      sectionCount,
      completedSections,
      completionPercentage,
    };
  });

  const stats = deriveStatsFromDocuments(documents);

  return {
    documents,
    stats,
  };
};
