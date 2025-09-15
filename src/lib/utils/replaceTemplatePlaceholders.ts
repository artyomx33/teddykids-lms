export function fillContractTemplate(template: string, data: Record<string, string | number | null | undefined>) {
  return Object.entries(data).reduce((filled, [key, value]) => {
    const placeholder = `[${key.toUpperCase()}]`;
    const safe = value == null ? '' : String(value);
    return filled.replace(new RegExp(placeholder.replace(/[[\]]/g, '\\$&'), 'g'), safe);
  }, template);
}
