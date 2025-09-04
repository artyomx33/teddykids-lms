// src/components/ui/MonoDate.tsx
export function MonoDate({ value }:{ value?: string | null }) {
  if (!value) return <span className="text-gray-400">—</span>;
  return <span className="font-mono text-xs">{value}</span>;
}
