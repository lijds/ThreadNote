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
import { createMarkdownEditor, renderMarkdown } from '../src/markdown-editor.js';

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

test('requires an explicit boolean true before deleting a note', async () => {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), 'threadnote-'));
  const storagePath = path.join(sandbox, 'notes.json');

  try {
    const store = await createPersistentNoteStore(storagePath);
    const controller = createNotesController(store);
    const note = await controller.create({ body: 'Protected note' });

    await assert.rejects(
      controller.delete(note.id, 'true' as unknown as boolean),
      (error: unknown) => (error as { status: number }).status === 400,
    );
    assert.equal((await controller.get(note.id)).status, 200);
    assert.equal((await controller.delete(note.id, true)).status, 204);
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
});

test('renders the required basic Markdown syntax', () => {
  const markdown = '# Heading\n\n- first\n- second\n\n**bold** and *italic*\n\n> quote\n\nParagraph';

  const rendered = renderMarkdown(markdown);

  assert.match(rendered, /<h1[^>]*>Heading<\/h1>/);
  assert.match(rendered, /<ul>[\s\S]*<li>first<\/li>[\s\S]*<li>second<\/li>[\s\S]*<\/ul>/);
  assert.match(rendered, /<strong>bold<\/strong>/);
  assert.match(rendered, /<em>italic<\/em>/);
  assert.match(rendered, /<blockquote>[\s\S]*quote[\s\S]*<\/blockquote>/);
  assert.match(rendered, /<p>Paragraph<\/p>/);
});

test('switches editor and preview modes without losing Markdown input', () => {
  const editor = createMarkdownEditor('# Draft');

  assert.equal(editor.mode, 'edit');
  assert.equal(editor.markdown, '# Draft');

  const preview = editor.setMode('preview');
  assert.equal(preview.mode, 'preview');
  assert.equal(preview.markdown, '# Draft');
  assert.match(preview.rendered, /<h1[^>]*>Draft<\/h1>/);

  const edited = preview.setMarkdown('## Updated draft');
  assert.equal(edited.markdown, '## Updated draft');
  assert.equal(edited.mode, 'preview');

  const editMode = edited.setMode('edit');
  assert.equal(editMode.mode, 'edit');
  assert.equal(editMode.markdown, '## Updated draft');
});
