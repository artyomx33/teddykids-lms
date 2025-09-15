import { TimelineItem } from "@/components/staff/StaffTimeline";
import { StaffReview, StaffNote, StaffCertificate } from "./staff";

export function createTimelineFromStaffData(
  reviews: StaffReview[],
  notes: StaffNote[],
  certificates: StaffCertificate[]
): TimelineItem[] {
  const items: TimelineItem[] = [];
  
  // Add reviews
  reviews.forEach(review => {
    items.push({
      id: review.id,
      type: 'review',
      date: review.review_date,
      title: `${review.review_type || 'Review'} Complete`,
      description: review.summary || undefined,
      metadata: {
        score: review.score || undefined,
        raise: review.raise
      }
    });
  });
  
  // Add notes
  notes.forEach(note => {
    items.push({
      id: note.id,
      type: 'note',
      date: note.created_at,
      title: `Note Added`,
      description: note.note || undefined,
      metadata: {
        note_type: note.note_type || undefined
      }
    });
  });
  
  // Add certificates
  certificates.forEach(cert => {
    items.push({
      id: cert.id,
      type: 'certificate',
      date: cert.uploaded_at,
      title: `Certificate Uploaded`,
      description: cert.title || 'Certificate',
      metadata: {
        file_path: cert.file_path || undefined
      }
    });
  });
  
  // Sort by date, newest first
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}