import type { Database } from '@/integrations/supabase/types';

export type KnowledgeDocument = Database['public']['Tables']['tk_documents']['Row'];
export type KnowledgeDocumentSectionRow = Database['public']['Tables']['tk_document_sections']['Row'];

export type KnowledgeQuizQuestion = {
  id: number;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  correctAnswer: number | boolean;
};

export type KnowledgeContentElementTag =
  | 'p'
  | 'strong'
  | 'em'
  | 'ul'
  | 'ol'
  | 'li'
  | 'a'
  | 'blockquote'
  | 'code'
  | 'pre'
  | 'span'
  | 'br'
  | 'h1'
  | 'h2'
  | 'h3';

export type KnowledgeContentTextNode = {
  type: 'text';
  value: string;
};

export type KnowledgeContentElementNode = {
  type: 'element';
  name: KnowledgeContentElementTag;
  attributes?: Record<string, string>;
  children?: KnowledgeContentNode[];
};

export type KnowledgeContentNode =
  | KnowledgeContentTextNode
  | KnowledgeContentElementNode;

export type KnowledgeDocumentSection = Omit<
  KnowledgeDocumentSectionRow,
  'key_points' | 'questions'
> & {
  key_points: string[];
  questions: KnowledgeQuizQuestion[];
  contentNodes: KnowledgeContentNode[];
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
