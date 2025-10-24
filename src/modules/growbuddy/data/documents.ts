// MIGRATION IN PROGRESS: Consolidating to single Supabase client
// This shim ensures GrowBuddy functionality is preserved during migration
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

/**
 * Compatibility shim for GrowBuddy's Supabase client
 * Returns the main application Supabase client
 * 
 * NOTE: persistSession: false vs true doesn't matter in client-side SPA
 * Both use browser localStorage - the difference only matters in SSR/Edge
 */
export const createSupabaseServerClient = () => {
  if (import.meta.env.DEV) {
    console.log('[GrowBuddy] Using main Supabase client (consolidated)');
  }
  return supabase;
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
