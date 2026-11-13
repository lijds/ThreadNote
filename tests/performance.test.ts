import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import test from 'node:test';
import { createNotesController } from '../src/note-controller.js';
import { createNote } from '../src/note-service.js';
import { createPersistentNoteStore } from '../src/note-store.js';

const NOTE_COUNT = 500;
const MAX_OPERATION_MS = 500;

function createBenchmarkNotes() {
  const linkedTitles = Array.from({ length: 10 }, (_, index) => `Note ${index + 1}`);
  const center = createNote({
    title: 'Center note',
    body: linkedTitles.map((title) => `[[${title}]]`).join(' '),
    tags: ['core', 'work'],
  });
  const notes = [center];

  for (let index = 1; index < NOTE_COUNT; index += 1) {
    notes.push(createNote({
      title: `Note ${index}`,
      body: index === 250 ? 'needle performance content' : `Body ${index}`,
      tags: index % 2 === 0 ? ['work'] : ['personal'],
    }));
  }

  return notes;
}

test('remains responsive with 500 notes across core retrieval operations', async () => {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), 'threadnote-performance-'));

  try {
    const store = await createPersistentNoteStore(path.join(sandbox, 'notes.json'));
    const benchmarkNotes = createBenchmarkNotes();
    await store.importNotes(benchmarkNotes);
    const controller = createNotesController(store);

    const indexedMatches = await store.search('needle', undefined);
    assert.deepEqual(indexedMatches.map((note) => note.id), [benchmarkNotes[250].id]);

    const measure = async (operation: () => Promise<void>): Promise<number> => {
      const startedAt = performance.now();
      await operation();
      return performance.now() - startedAt;
    };

    const searchDuration = await measure(async () => {
      const result = await controller.list({ query: 'needle', sort: 'relevance' });
      assert.equal(result.body.total, 1);
    });
    const filterDuration = await measure(async () => {
      const result = await controller.list({ tag: 'work', limit: 100 });
      assert.equal(result.body.total, 250);
    });
    const paginationDuration = await measure(async () => {
      const result = await controller.list({ page: 10, limit: 50 });
      assert.equal(result.body.items.length, 50);
    });
    const graphDuration = await measure(async () => {
      const result = await controller.getGraph(benchmarkNotes[0].id);
      assert.equal(result.body.nodes.length, 11);
    });

    for (const [operation, duration] of Object.entries({
      search: searchDuration,
      filter: filterDuration,
      pagination: paginationDuration,
      graph: graphDuration,
    })) {
      assert.ok(
        duration < MAX_OPERATION_MS,
        `${operation} took ${duration.toFixed(2)}ms, expected < ${MAX_OPERATION_MS}ms`,
      );
    }
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
});
