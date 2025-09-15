import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  fetchStaffDetail,
  StaffDetail,
  addReview,
  addNote,
  uploadCertificate,
} from "@/lib/staff";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewDueBanner } from "@/components/staff/ReviewDueBanner";
import { StaffProfileHeader } from "@/components/staff/StaffProfileHeader";
import { StaffTimeline } from "@/components/staff/StaffTimeline";
import { DocumentStatusPanel } from "@/components/staff/DocumentStatusPanel";
import { ReviewSummaryPanel } from "@/components/staff/ReviewSummaryPanel";
import { InternMetaPanel } from "@/components/staff/InternMetaPanel";
import { KnowledgeProgressPanel } from "@/components/staff/KnowledgeProgressPanel";
import { MilestonesPanel } from "@/components/staff/MilestonesPanel";
import { createTimelineFromStaffData } from "@/lib/staff-timeline";

export default function StaffProfile() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<StaffDetail>({
    queryKey: ["staffDetail", id],
    queryFn: () => fetchStaffDetail(id!),
    enabled: !!id,
  });

  // Modals state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);

  if (isLoading || !data) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  // Create timeline data
  const timelineItems = createTimelineFromStaffData(
    data.reviews,
    data.notes,
    data.certificates
  );

  return (
    <div className="space-y-6">
      {/* Review due banner */}
      <ReviewDueBanner
        nextReviewDue={data.enrichedContract?.next_review_due}
        needsSix={data.enrichedContract?.needs_six_month_review}
        needsYearly={data.enrichedContract?.needs_yearly_review}
        onCreateReview={() => setReviewOpen(true)}
      />

      {/* Enhanced Profile Header */}
      <StaffProfileHeader
        staff={data.staff}
        enrichedData={data.enrichedContract}
        firstContractDate={data.firstContractDate}
        documentStatus={data.documentStatus ? {
          missing_count: data.documentStatus.missing_count,
          total_docs: 7
        } : null}
      />

      {/* Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Timeline (2/3 width) */}
        <div className="lg:col-span-2">
          <StaffTimeline items={timelineItems} />
        </div>

        {/* Right Column - Info Panels (1/3 width) */}
        <div className="space-y-4">
          {/* Knowledge Progress Panel - Priority placement for actionable content */}
          <KnowledgeProgressPanel 
            staffId={data.staff.id}
            modules={[]} // Will be populated when knowledge system is implemented
            onViewProgress={() => console.log('View knowledge progress')}
          />

          {/* Milestones Panel - Show career progression */}
          <MilestonesPanel 
            staffId={data.staff.id}
            contractStartDate={data.enrichedContract?.first_start}
            onScheduleReview={(milestone) => console.log('Schedule milestone review:', milestone)}
          />

          {/* Document Status Panel */}
          <DocumentStatusPanel
            staffId={data.staff.id}
            documentsStatus={data.documentStatus}
          />

          {/* Review Summary Panel */}
          <ReviewSummaryPanel
            reviews={data.reviews}
            enrichedData={data.enrichedContract}
            onCreateReview={() => setReviewOpen(true)}
          />

          {/* Intern Meta Panel (only for interns) */}
          <InternMetaPanel
            staff={data.staff}
            enrichedData={data.enrichedContract}
          />
        </div>
      </div>

      {/* Review Modal (inline simple version) */}
      {reviewOpen && (
        <ReviewModal
          staffId={data.staff.id}
          onClose={() => setReviewOpen(false)}
          onSaved={async () => {
            await qc.invalidateQueries({ queryKey: ["staffDetail", id] });
            setReviewOpen(false);
          }}
        />
      )}

      {/* Note Modal */}
      {noteOpen && (
        <NoteModal
          staffId={data.staff.id}
          onClose={() => setNoteOpen(false)}
          onSaved={async () => {
            await qc.invalidateQueries({ queryKey: ["staffDetail", id] });
            setNoteOpen(false);
          }}
        />
      )}

      {/* Certificate Modal */}
      {certOpen && (
        <CertificateModal
          staffId={data.staff.id}
          onClose={() => setCertOpen(false)}
          onSaved={async () => {
            await qc.invalidateQueries({ queryKey: ["staffDetail", id] });
            setCertOpen(false);
          }}
        />
      )}
    </div>
  );
}

// Inline minimal modals (can be split to components/)
function ReviewModal({
  staffId, onClose, onSaved,
}: { staffId: string; onClose: () => void; onSaved: () => void }) {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<string>("yearly");
  const [score, setScore] = useState<number>(3);
  const [summary, setSummary] = useState<string>("");
  const [raise, setRaise] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    try {
      setSaving(true);
      await addReview({
        staff_id: staffId,
        review_type: type,
        review_date: date,
        score,
        summary,
        raise,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-md p-4 w-full max-w-md space-y-3">
        <div className="text-lg font-semibold">Add Review</div>
        <div className="grid gap-2">
          <label className="text-sm">
            Date
            <input
              className="w-full border rounded px-2 py-1 mt-1 bg-background"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Type
            <select
              className="w-full border rounded px-2 py-1 mt-1 bg-background"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="6mo">6 months</option>
              <option value="yearly">yearly</option>
              <option value="custom">custom</option>
            </select>
          </label>
          <label className="text-sm">
            Score (1-5)
            <input
              className="w-full border rounded px-2 py-1 mt-1 bg-background"
              type="number"
              min={1}
              max={5}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            />
          </label>
          <label className="text-sm">
            Summary
            <textarea
              className="w-full border rounded px-2 py-1 mt-1 bg-background"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </label>
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={raise}
              onChange={(e) => setRaise(e.target.checked)}
            />
            Raise proposed
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NoteModal({
  staffId, onClose, onSaved,
}: { staffId: string; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<string>("note");
  const [note, setNote] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    try {
      setSaving(true);
      await addNote({ staff_id: staffId, note_type: type, note });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-md p-4 w-full max-w-md space-y-3">
        <div className="text-lg font-semibold">Add Note</div>
        <div className="grid gap-2">
          <label className="text-sm">
            Type
            <select
              className="w-full border rounded px-2 py-1 mt-1 bg-background"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="positive">positive</option>
              <option value="concern">concern</option>
              <option value="warning">warning</option>
              <option value="note">note</option>
            </select>
          </label>
          <label className="text-sm">
            Note
            <textarea
              className="w-full border rounded px-2 py-1 mt-1 bg-background"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CertificateModal({
  staffId, onClose, onSaved,
}: { staffId: string; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (!file) return;
    try {
      setSaving(true);
      await uploadCertificate({ staff_id: staffId, title: title || "Certificate", file });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-md p-4 w-full max-w-md space-y-3">
        <div className="text-lg font-semibold">Upload Certificate</div>
        <div className="grid gap-2">
          <label className="text-sm">
            Title
            <input
              className="w-full border rounded px-2 py-1 mt-1 bg-background"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="First Aid, VOG, Diploma, …"
            />
          </label>
          <label className="text-sm">
            File
            <input
              className="w-full border rounded px-2 py-1 mt-1 bg-background"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={onSubmit} disabled={!file || saving}>
            {saving ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}
