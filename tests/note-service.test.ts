import assert from 'node:assert/strict';
import test from 'node:test';
import { createNote, updateNote } from '../src/note-service.js';
import { createOfflineNoteStore } from '../src/note-store.js';

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
