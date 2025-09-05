import { useState } from "react";

export type StaffFilters = {
  internsOnly: boolean;
  year: "" | "1" | "2" | "3";
  missingOnly: boolean;
  // Per-document missing filters
  vog_missing: boolean;
  pok_missing: boolean;
  id_card_missing: boolean;
  bank_card_missing: boolean;
  prk_missing: boolean;
  employees_missing: boolean;
  portobase_missing: boolean;
};

// Type for document counts
export type DocCounts = {
  vog_missing?: number;
  pok_missing?: number;
  id_card_missing?: number;
  bank_card_missing?: number;
  prk_missing?: number;
  employees_missing?: number;
  portobase_missing?: number;
  any_missing?: number;
  intern_missing?: number;
};

export function FilterBar({
  value,
  onChange,
  counts,
}: {
  value: StaffFilters;
  onChange: (v: StaffFilters) => void;
  counts?: DocCounts;
}) {
  // Toggle for showing document filters
  const [showDocFilters, setShowDocFilters] = useState(false);

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.internsOnly}
            onChange={(e) =>
              onChange({
                ...value,
                internsOnly: e.target.checked,
                year: e.target.checked ? value.year : "",
              })
            }
          />
          <span className="text-sm">
            Interns only
            {counts?.intern_missing !== undefined && counts.intern_missing > 0 && (
              <span className="text-muted-foreground ml-1">
                ({counts.intern_missing})
              </span>
            )}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Year</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={value.year}
            onChange={(e) => onChange({ ...value, year: e.target.value as any })}
            disabled={!value.internsOnly}
          >
            <option value="">All</option>
            <option value="1">Y1</option>
            <option value="2">Y2</option>
            <option value="3">Y3</option>
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.missingOnly}
            onChange={(e) =>
              onChange({ ...value, missingOnly: e.target.checked })
            }
          />
          <span className="text-sm">
            Missing docs only
            {counts?.any_missing !== undefined && counts.any_missing > 0 && (
              <span className="text-muted-foreground ml-1">
                ({counts.any_missing})
              </span>
            )}
          </span>
        </label>

        <button
          type="button"
          onClick={() => setShowDocFilters(!showDocFilters)}
          className="text-sm text-primary underline ml-2"
        >
          {showDocFilters ? "Hide document filters" : "Show document filters"}
        </button>
      </div>

      {showDocFilters && (
        <div className="flex flex-wrap items-center gap-3 pl-4 pt-2 border-l-2 border-l-muted">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.vog_missing}
              onChange={(e) =>
                onChange({ ...value, vog_missing: e.target.checked })
              }
            />
            <span className="text-sm">
              Missing VOG
              {counts?.vog_missing !== undefined && (
                <span className="text-muted-foreground ml-1">
                  ({counts.vog_missing})
                </span>
              )}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.pok_missing}
              onChange={(e) =>
                onChange({ ...value, pok_missing: e.target.checked })
              }
            />
            <span className="text-sm">
              Missing POK
              {counts?.pok_missing !== undefined && (
                <span className="text-muted-foreground ml-1">
                  ({counts.pok_missing})
                </span>
              )}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.id_card_missing}
              onChange={(e) =>
                onChange({ ...value, id_card_missing: e.target.checked })
              }
            />
            <span className="text-sm">
              Missing ID Card
              {counts?.id_card_missing !== undefined && (
                <span className="text-muted-foreground ml-1">
                  ({counts.id_card_missing})
                </span>
              )}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.bank_card_missing}
              onChange={(e) =>
                onChange({ ...value, bank_card_missing: e.target.checked })
              }
            />
            <span className="text-sm">
              Missing Bank Card
              {counts?.bank_card_missing !== undefined && (
                <span className="text-muted-foreground ml-1">
                  ({counts.bank_card_missing})
                </span>
              )}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.prk_missing}
              onChange={(e) =>
                onChange({ ...value, prk_missing: e.target.checked })
              }
            />
            <span className="text-sm">
              Missing PRK
              {counts?.prk_missing !== undefined && (
                <span className="text-muted-foreground ml-1">
                  ({counts.prk_missing})
                </span>
              )}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.employees_missing}
              onChange={(e) =>
                onChange({ ...value, employees_missing: e.target.checked })
              }
            />
            <span className="text-sm">
              Missing Employees
              {counts?.employees_missing !== undefined && (
                <span className="text-muted-foreground ml-1">
                  ({counts.employees_missing})
                </span>
              )}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.portobase_missing}
              onChange={(e) =>
                onChange({ ...value, portobase_missing: e.target.checked })
              }
            />
            <span className="text-sm">
              Missing Portobase
              {counts?.portobase_missing !== undefined && (
                <span className="text-muted-foreground ml-1">
                  ({counts.portobase_missing})
                </span>
              )}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
