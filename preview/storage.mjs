export function safeReadJson(storage, key, { fallback = null, maxBytes = 100_000, throwOnError = false } = {}) {
  try {
    const raw = storage?.getItem?.(key);
    if (raw === null || raw === undefined) return fallback;
    if (typeof raw !== 'string') return fallback;
    if (raw.length > maxBytes) throw new Error('payload_too_large');
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    if (throwOnError) throw error;
    return fallback;
  }
}

export function safeWriteJson(storage, key, value, { maxBytes = 100_000 } = {}) {
  try {
    const serialized = JSON.stringify(value);
    if (typeof serialized !== 'string') throw new Error('serialization_failed');
    if (serialized.length > maxBytes) return { ok: false, error: 'payload_too_large' };
    storage?.setItem?.(key, serialized);
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'write_failed' };
  }
}
