import { useState, useTransition } from "react";
import { patchInternMeta } from "@/lib/staff";
import { Button } from "@/components/ui/button";

type InternMeta = {
  school?: string;
  supervisor?: string;
  portobase_email?: string;
  portobase_phone?: string;
  portobase_notes?: string;
};

export function InternMetaForm({
  staffId,
  initialIsIntern,
  initialYear,
  initialMeta,
  onSaved,
}: {
  staffId: string;
  initialIsIntern?: boolean;
  initialYear?: 1 | 2 | 3 | null;
  initialMeta?: InternMeta;
  onSaved?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [isIntern, setIsIntern] = useState(!!initialIsIntern);
  const [year, setYear] = useState<1 | 2 | 3 | null>(initialYear ?? null);

  const onSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const patch: InternMeta = {
      school: String(fd.get("school") || ""),
      supervisor: String(fd.get("supervisor") || ""),
      portobase_email: String(fd.get("portobase_email") || ""),
      portobase_phone: String(fd.get("portobase_phone") || ""),
      portobase_notes: String(fd.get("portobase_notes") || ""),
    };

    startTransition(async () => {
      await patchInternMeta(
        staffId,
        patch,
        fd.get("is_intern") ? true : false,
        fd.get("intern_year") ? Number(fd.get("intern_year")) : null
      );
      if (onSaved) onSaved();
    });
  };

  return (
    <form onSubmit={onSave} className="border p-4 rounded-md space-y-3 bg-background">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_intern"
            defaultChecked={isIntern}
            onChange={(e) => setIsIntern(e.currentTarget.checked)}
          />
          Is intern
        </label>
        <select
          name="intern_year"
          className="border rounded px-2 py-1"
          value={year ?? ""}
          onChange={(e) =>
            setYear(e.target.value ? (Number(e.target.value) as 1 | 2 | 3) : null)
          }
          disabled={!isIntern}
        >
          <option value="">Year</option>
          <option value="1">1st year</option>
          <option value="2">2nd year</option>
          <option value="3">3rd year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          name="school"
          placeholder="School"
          defaultValue={initialMeta?.school || ""}
          className="border rounded px-3 py-2"
          disabled={!isIntern}
        />
        <input
          name="supervisor"
          placeholder="Supervisor"
          defaultValue={initialMeta?.supervisor || ""}
          className="border rounded px-3 py-2"
          disabled={!isIntern}
        />
        <input
          name="portobase_email"
          placeholder="Portobase email"
          defaultValue={initialMeta?.portobase_email || ""}
          className="border rounded px-3 py-2"
          disabled={!isIntern}
        />
        <input
          name="portobase_phone"
          placeholder="Portobase phone"
          defaultValue={initialMeta?.portobase_phone || ""}
          className="border rounded px-3 py-2"
          disabled={!isIntern}
        />
        <textarea
          name="portobase_notes"
          placeholder="Notes for Portobase"
          defaultValue={initialMeta?.portobase_notes || ""}
          className="border rounded px-3 py-2 md:col-span-2"
          disabled={!isIntern}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save intern info"}
      </Button>
    </form>
  );
}