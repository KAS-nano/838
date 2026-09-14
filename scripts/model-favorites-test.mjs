import assert from 'node:assert/strict';
import { createFavoritesStore, FAVORITES_KEY } from '../preview/model-favorites.mjs';

const browser = new EventTarget();
let raw = JSON.stringify({ version: 1, ids: ['a', 'a', 'unknown', 3] });
let blocked = false;
browser.localStorage = {
  getItem: () => raw,
  setItem: (_key, value) => { if (blocked) throw new Error('Blocked'); raw = value; },
};
globalThis.window = browser;
const store = createFavoritesStore(['a', 'b']);
const listener = () => {};
let unsubscribe = store.subscribe(listener);
assert.deepEqual(store.getSnapshot().ids, ['a'], 'Deduplicates and ignores unknown IDs');
store.toggle('unknown');
assert.deepEqual(store.getSnapshot().ids, ['a']);
store.toggle('b');
assert.deepEqual(JSON.parse(raw), { version: 1, ids: ['a', 'b'] });
const update = value => {
  raw = value;
  const event = new Event('storage');
  event.key = FAVORITES_KEY;
  browser.dispatchEvent(event);
};
update(JSON.stringify({ version: 1, ids: ['b'] }));
assert.deepEqual(store.getSnapshot().ids, ['b'], 'Receives another tab update');
update('{invalid');
assert.deepEqual(store.getSnapshot().ids, ['b'], 'Corruption retains current copy');
assert.ok(store.getSnapshot().error);
blocked = true;
store.toggle('a');
unsubscribe();
unsubscribe = store.subscribe(listener);
assert.deepEqual(store.getSnapshot().ids, ['b', 'a'], 'Remount retains unsaved session changes');
update(null);
assert.deepEqual(store.getSnapshot().ids, ['b', 'a'], 'Remote update cannot erase unsaved changes');
blocked = false;
store.toggle('b');
assert.equal(store.getSnapshot().error, '');
assert.deepEqual(JSON.parse(raw).ids, ['a'], 'Storage recovers on next user change');
update(null);
assert.deepEqual(store.getSnapshot().ids, [], 'Storage deletion resets favorites');
for (const value of [null, [], { version: 2, ids: [] }, { version: 1, ids: 'a' }, { version: 1, ids: Array(1001).fill('a') }]) {
  update(JSON.stringify(value));
  assert.ok(store.getSnapshot().error, 'Rejects invalid schema');
}
unsubscribe();
delete globalThis.window;
assert.deepEqual(store.getServerSnapshot().ids, [], 'Server snapshot stays empty');
console.log('PASS favorites: validation, persistence, cross-tab updates, corruption, session fallback and recovery');
