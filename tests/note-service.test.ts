import assert from 'node:assert/strict';
import test from 'node:test';
import { createNote } from '../src/note-service.js';

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
