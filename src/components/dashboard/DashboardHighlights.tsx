import type { ElementType } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface DashboardHighlight {
  id: string;
  label: string;
  value: string | number;
  hint?: string;
  icon?: ElementType;
}

interface DashboardHighlightsProps {
  highlights: DashboardHighlight[];
}

export function DashboardHighlights({ highlights }: DashboardHighlightsProps) {
  if (highlights.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {highlights.map(({ id, label, value, hint, icon: Icon }) => (
        <Card key={id} className="border bg-card shadow-sm">
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{label}</span>
              {Icon && <Icon className="h-4 w-4 text-primary" />}
            </div>
            <span className="text-2xl font-semibold text-foreground">{value}</span>
            {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
