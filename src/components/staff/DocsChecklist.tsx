import { useTransition, useState } from "react";
import { patchStaffDocs } from "@/lib/staff";
import { Button } from "@/components/ui/button";

const DOCS: { key: string; label: string }[] = [
  { key: "id_card", label: "ID card" },
  { key: "bank_card", label: "Bank card" },
  { key: "pok", label: "POK (stage overeenkomst)" },
  { key: "vog", label: "VOG" },
  { key: "prk", label: "PRK" },
  { key: "employees", label: "Employees (HR file entry)" },
  { key: "portobase", label: "Portobase" },
];

export function DocsChecklist({
  staffId,
  initialDocs,
  onChanged,
}: {
  staffId: string;
  initialDocs: Record<string, any> | null | undefined;
  onChanged?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [docs, setDocs] = useState<Record<string, any>>(initialDocs ?? {});

  const onTick = (key: string, received: boolean) => {
    startTransition(async () => {
      // minimal patch: update 1 key only
      const patch: Record<string, any> = {};
      patch[key] = {
        received,
        received_at: received ? new Date().toISOString() : null
      };

      await patchStaffDocs(staffId, patch);

      setDocs(prev => ({ ...prev, [key]: patch[key] }));

      if (onChanged) {
        onChanged();
      }
    });
  };

  const fakeUpload = (label: string) => {
    // placeholder — wire storage later
    console.log(`Uploaded ${label} (placeholder)`);
  };

  return (
    <div className="border p-4 rounded-md space-y-3 bg-background">
      <h3 className="text-sm font-semibold">Required documents</h3>
      <ul className="space-y-2">
        {DOCS.map(({ key, label }) => {
          const d = docs?.[key];
          return (
            <li key={key} className="flex items-center justify-between gap-3 border rounded-md px-3 py-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!d?.received}
                  onChange={(e) => onTick(key, e.currentTarget.checked)}
                  disabled={pending}
                  className="h-4 w-4"
                />
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">
                    {d?.received
                      ? `Received ${new Date(d.received_at || "").toLocaleDateString("nl-NL")}`
                      : "Missing"}
                  </div>
                </div>
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => fakeUpload(label)}
              >
                Upload
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}