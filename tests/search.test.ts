import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import { createNotesController } from '../src/note-controller.js';
import { createPersistentNoteStore } from '../src/note-store.js';

test('searches title and body, filters tags, and sorts results', async () => {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), 'threadnote-search-'));

  try {
    const store = await createPersistentNoteStore(path.join(sandbox, 'notes.json'));
    const controller = createNotesController(store);
    const titleMatch = await controller.create({
      title: 'Project architecture',
      body: 'Design notes',
      tags: ['work', 'design'],
    });
    const bodyMatch = await controller.create({
      title: 'Daily log',
      body: 'architecture architecture architecture',
      tags: ['work'],
    });
    await controller.create({
      title: 'Cooking notes',
      body: 'Recipes for the week',
      tags: ['home'],
    });

    const relevant = await controller.list({
      query: 'architecture',
      sort: 'relevance',
      page: 1,
      limit: 20,
    });
    assert.equal(relevant.body.total, 2);
    assert.deepEqual(
      relevant.body.items.map((item) => item.id),
      [titleMatch.id, bodyMatch.id],
    );

    const workNotes = await controller.list({ tag: 'work', page: 1, limit: 20 });
    assert.equal(workNotes.body.total, 2);
    assert.ok(workNotes.body.items.every((item) => [titleMatch.id, bodyMatch.id].includes(item.id)));

    await delay(2);
    await controller.update(titleMatch.id, { body: 'Updated architecture notes' });
    const recent = await controller.list({ sort: 'recency', page: 1, limit: 20 });
    assert.equal(recent.body.items[0].id, titleMatch.id);
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
});
