'use server';

import { createSupabaseServerClient } from '@/modules/growbuddy/data/documents';

export const saveSectionCompletion = async (
  docId: string,
  staffId: string,
  sectionId: string,
  score: number
) => {
  if (!docId || !staffId || !sectionId) {
    throw new Error('Missing identifiers for section completion');
  }

  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from('staff_knowledge_completion')
    .upsert({
      doc_id: docId,
      staff_id: staffId,
      section_id: sectionId,
      score,
      passed: score >= 80,
      completed_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(`Failed to persist section completion: ${error.message}`);
  }
};
