import assert from 'node:assert/strict';
import { safeReadJson, safeWriteJson } from '../preview/storage.mjs';

const storage = {
  data: new Map(),
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; },
  setItem(key, value) {
    if (value.length > 32) throw new Error('quota');
    this.data.set(key, value);
  },
  removeItem(key) { this.data.delete(key); },
};

assert.equal(safeReadJson(storage, 'missing', { fallback: { ok: true } }).ok, true, 'missing values use fallback');
assert.deepEqual(safeReadJson(storage, 'broken', { fallback: { ok: false } }), { ok: false }, 'invalid JSON falls back safely');
storage.data.set('broken', '{invalid');
assert.deepEqual(safeReadJson(storage, 'broken', { fallback: { ok: false } }), { ok: false }, 'malformed JSON is rejected');
const writeResult = safeWriteJson(storage, 'small', { version: 1, ids: ['a'] }, { maxBytes: 64 });
assert.equal(writeResult.ok, true, 'small payloads are stored');
assert.equal(safeWriteJson(storage, 'big', { version: 1, ids: ['a', 'b', 'c', 'd'] }, { maxBytes: 16 }).ok, false, 'oversized payload is rejected');
console.log('PASS storage robustness: fallback, invalid JSON, quota and size enforcement');
