import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  fetchStaffDetail,
  StaffDetail,
  calculateMilestones,
  addReview,
  addNote,
  uploadCertificate,
} from "@/lib/staff";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewDueBanner } from "@/components/staff/ReviewDueBanner";
import { StarBadge } from "@/components/staff/ReviewChips";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function StaffProfile() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<StaffDetail>({
    queryKey: ["staffDetail", id],
    queryFn: () => fetchStaffDetail(id!),
    enabled: !!id,
  });

  // Enriched flags (star badge + review due)
  const { data: enrichedRow } = useQuery({
    queryKey: ["enrichedProfile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts_enriched")
        .select(
          "has_five_star_badge, needs_six_month_review, needs_yearly_review, next_review_due"
        )
        .eq("staff_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as {
        has_five_star_badge?: boolean | null;
        needs_six_month_review?: boolean | null;
        needs_yearly_review?: boolean | null;
        next_review_due?: string | null;
      } | null;
    },
    enabled: !!id,
  });

  // Modals state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);

  if (isLoading || !data) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  const milestones = calculateMilestones(data.firstContractDate);

  return (
    <div className="space-y-6">
      {/* Review due banner */}
      <ReviewDueBanner
        nextReviewDue={enrichedRow?.next_review_due}
        needsSix={enrichedRow?.needs_six_month_review}
        needsYearly={enrichedRow?.needs_yearly_review}
        onCreateReview={() => setReviewOpen(true)}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {data.staff.full_name}
            <StarBadge show={enrichedRow?.has_five_star_badge} />
          </CardTitle>
          <CardDescription>
            First contract: {data.firstContractDate ?? "—"} • Last review:{" "}
            {data.lastReview ?? "—"} •{" "}
            {data.raiseEligible ? "Raise flagged" : "No raise flagged"}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="milestones" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones">
          <Section title="Milestones (derived)">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground">First Month</div>
                <div className="font-medium">{milestones.firstMonth ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">6 Months</div>
                <div className="font-medium">{milestones.halfYear ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">1 Year</div>
                <div className="font-medium">{milestones.oneYear ?? "—"}</div>
              </div>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="reviews">
          <Section title="Reviews">
            <div className="flex justify-end mb-3">
              <Button onClick={() => setReviewOpen(true)}>Add Review</Button>
            </div>
            {data.reviews.length === 0 ? (
              <div className="text-sm text-muted-foreground">No reviews yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-left">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Score</th>
                      <th className="py-2 pr-4">Raise</th>
                      <th className="py-2 pr-4">Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reviews.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="py-2 pr-4">{r.review_date}</td>
                        <td className="py-2 pr-4">{r.review_type ?? "—"}</td>
                        <td className="py-2 pr-4">{r.score ?? "—"}</td>
                        <td className="py-2 pr-4">{r.raise ? "Yes" : "No"}</td>
                        <td className="py-2 pr-4">{r.summary ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="notes">
          <Section title="Notes">
            <div className="flex justify-end mb-3">
              <Button variant="outline" onClick={() => setNoteOpen(true)}>
                Add Note
              </Button>
            </div>
            {data.notes.length === 0 ? (
              <div className="text-sm text-muted-foreground">No notes yet.</div>
            ) : (
              <ul className="space-y-3">
                {data.notes.map((n) => (
                  <li key={n.id} className="border p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">
                      {n.created_at} • {n.note_type || "note"}
                    </div>
                    <div className="text-sm mt-1">{n.note}</div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="certificates">
          <Section title="Certificates">
            <div className="flex justify-end mb-3">
              <Button variant="outline" onClick={() => setCertOpen(true)}>
                Upload Certificate
              </Button>
            </div>
            {data.certificates.length === 0 ? (
              <div className="text-sm text-muted-foreground">No certificates yet.</div>
            ) : (
              <ul className="space-y-3">
                {data.certificates.map((c) => (
                  <li key={c.id} className="border p-3 rounded-md flex justify-between">
                    <div>
                      <div className="font-medium">{c.title || "Certificate"}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(c.uploaded_at).toLocaleDateString("nl-NL")}
                      </div>
                    </div>
                    <a
                      className="text-primary text-sm hover:underline"
                      href={
                        supabase.storage.from("certificates").getPublicUrl(c.file_path || "")
                          .data.publicUrl
                      }
                      target="_blank"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>
      </Tabs>

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
