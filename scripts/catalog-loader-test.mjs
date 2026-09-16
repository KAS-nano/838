import assert from 'node:assert/strict';
import { loadCatalog } from '../src/server/catalog/load.ts';
import { seedModels } from '../src/data/seed-models.ts';

const previous = process.env.CATALOG_SOURCE;
try {
  process.env.CATALOG_SOURCE = 'database';
  const model = { ...seedModels[0], id: 'persisted-only', name: 'Persisted fixture' };
  const repository = { listModels: async () => [model], getModel: async () => model };
  const persisted = await loadCatalog(repository);
  assert.equal(persisted.source, 'database');
  assert.equal(persisted.dataState, 'persisted');
  assert.deepEqual(persisted.models, [model]);
  console.log('PASS persisted catalog replaces seed, including non-seed IDs');
  for (const listModels of [
    async () => { throw new Error('Unavailable database'); },
    async () => [],
    async () => [{ ...model, variants: [] }],
  ]) {
    const fallback = await loadCatalog({ ...repository, listModels });
    assert.equal(fallback.source, 'seed-fallback');
    assert.equal(fallback.dataState, 'seed');
    assert.deepEqual(fallback.models, seedModels);
  }
  console.log('PASS unavailable, empty and unusable catalogs have explicit seed fallback');
} finally {
  if (previous === undefined) delete process.env.CATALOG_SOURCE;
  else process.env.CATALOG_SOURCE = previous;
}
