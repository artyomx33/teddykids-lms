// src/lib/refreshContractsCache.ts

export async function refreshContractsCache() {
  try {
    const res = await fetch('/api/db/refresh-contracts-cache', { method: 'POST' });
    // ignore result (cron also runs), but you can toast success
    return await res.json();
  } catch (_) {
    // swallow — cron will catch up
    return { ok: false };
  }
}
