import { Link } from 'react-router-dom';

interface EmployeeCardProps {
  id: string;
  name: string;
  role?: string | null;
  manager?: string | null;
  location?: string | null;
  status?: string | null;
  highlight?: string | null;
  href: string;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  badge?: string | null;
}

export function EmployeeCard({
  name,
  role,
  manager,
  location,
  status,
  highlight,
  href,
  selected = false,
  onSelect,
  badge,
}: EmployeeCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">{name}</h3>
          {role && <p className="text-sm text-muted-foreground">{role}</p>}
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={selected}
            onChange={(event) => onSelect?.(event.target.checked)}
          />
          Select
        </label>
      </div>

      <dl className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
        {manager && (
          <div className="flex items-center justify-between gap-2">
            <dt>Manager</dt>
            <dd className="font-medium text-foreground">{manager}</dd>
          </div>
        )}
        {location && (
          <div className="flex items-center justify-between gap-2">
            <dt>Location</dt>
            <dd className="font-medium text-foreground">{location}</dd>
          </div>
        )}
        {status && (
          <div className="flex items-center justify-between gap-2">
            <dt>Status</dt>
            <dd className="font-medium text-foreground">{status}</dd>
          </div>
        )}
        {highlight && (
          <div className="flex items-center justify-between gap-2">
            <dt>Review</dt>
            <dd className="font-medium text-foreground">{highlight}</dd>
          </div>
        )}
      </dl>

      <div className="flex items-center justify-between gap-3 text-sm">
        {badge && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {badge}
          </span>
        )}
        <Link
          to={href}
          className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}
