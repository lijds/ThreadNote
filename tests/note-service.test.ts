import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createNote, updateNote } from '../src/note-service.js';
import {
  createOfflineNoteStore,
  createPersistentNoteStore,
} from '../src/note-store.js';
import { createNotesController } from '../src/note-controller.js';

test('creates a note with contract metadata and a generated title', () => {
  const note = createNote({ body: '# Project plan', tags: ['work'] });

  assert.match(note.id, /^note-/);
  assert.equal(note.title, 'Untitled note');
  assert.equal(note.body, '# Project plan');
  assert.deepEqual(note.tags, ['work']);
  assert.deepEqual(note.backlinks, []);
  assert.doesNotThrow(() => new Date(note.createdAt).toISOString());
  assert.doesNotThrow(() => new Date(note.updatedAt).toISOString());
  assert.equal(note.createdAt, note.updatedAt);
});

test('rejects a note without a body', () => {
  assert.throws(() => createNote({ body: '' }), /body is required/i);
});

test('normalizes an empty title when a note is updated', () => {
  const note = createNote({ title: 'Initial title', body: 'Content' });

  const updatedNote = updateNote(note, { title: '  ' });

  assert.equal(updatedNote.title, 'Untitled note');
  assert.equal(updatedNote.body, note.body);
  assert.equal(updatedNote.id, note.id);
});

test('creates, reads, and updates notes without network access', () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('network access is forbidden in offline mode');
  };

  try {
    const store = createOfflineNoteStore();
    const createdNote = store.create({ body: 'Local content' });
    const readNote = store.get(createdNote.id);
    const updatedNote = store.update(createdNote.id, { body: 'Updated locally' });

    assert.equal(readNote?.body, 'Local content');
    assert.equal(updatedNote.body, 'Updated locally');
    assert.equal(store.get(createdNote.id)?.body, 'Updated locally');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('persists notes in the application sandbox across store instances', async () => {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), 'threadnote-'));
  const storagePath = path.join(sandbox, 'notes.json');

  try {
    const firstStore = await createPersistentNoteStore(storagePath);
    const createdNote = await firstStore.create({ body: 'Persisted content' });
    const updatedNote = await firstStore.update(createdNote.id, {
      body: 'Updated persisted content',
    });

    const reopenedStore = await createPersistentNoteStore(storagePath);

    assert.deepEqual(await reopenedStore.get(createdNote.id), updatedNote);
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
});

test('supports the complete note lifecycle and paginated list', async () => {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), 'threadnote-'));
  const storagePath = path.join(sandbox, 'notes.json');

  try {
    const store = await createPersistentNoteStore(storagePath);
    const controller = createNotesController(store);
    const createdNote = await controller.create({
      title: 'Lifecycle note',
      body: 'Initial content',
      tags: ['work'],
    });

    const listedNotes = await controller.list({ page: 1, limit: 20 });
    assert.equal(listedNotes.status, 200);
    assert.equal(listedNotes.body.total, 1);
    assert.deepEqual(listedNotes.body.items[0], {
      id: createdNote.id,
      title: 'Lifecycle note',
      updatedAt: createdNote.updatedAt,
    });

    const openedNote = await controller.get(createdNote.id);
    assert.equal(openedNote.status, 200);
    assert.equal(openedNote.body.body, 'Initial content');

    const editedNote = await controller.update(createdNote.id, {
      body: 'Edited content',
    });
    assert.equal(editedNote.status, 200);
    assert.equal(editedNote.body.body, 'Edited content');

    await assert.rejects(
      controller.delete(createdNote.id),
      (error: unknown) => (error as { status: number }).status === 400,
    );
    await assert.rejects(
      controller.delete(createdNote.id, false),
      (error: unknown) => (error as { status: number }).status === 409,
    );
    const deletedNote = await controller.delete(createdNote.id, true);
    assert.equal(deletedNote.status, 204);
    assert.equal((await controller.list({ page: 1, limit: 20 })).body.total, 0);
    await assert.rejects(
      controller.get(createdNote.id),
      (error: unknown) => (error as { status: number }).status === 404,
    );
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
});
