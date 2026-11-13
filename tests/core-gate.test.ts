import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createNotesController } from '../src/note-controller.js';
import {
  createMarkdownEditor,
  parseInternalLinks,
  renderMarkdown,
} from '../src/markdown-editor.js';
import { createNote } from '../src/note-service.js';
import { createPersistentNoteStore } from '../src/note-store.js';

test('TEST-01 #33: note data model has required fields', () => {
  const note = createNote({ body: 'Core model body', tags: ['core'] });

  assert.match(note.id, /^note-/);
  assert.equal(note.title, 'Untitled note');
  assert.equal(note.body, 'Core model body');
  assert.deepEqual(note.tags, ['core']);
  assert.ok(note.createdAt);
  assert.ok(note.updatedAt);
  assert.deepEqual(note.backlinks, []);
});

test('TEST-02 #34: Markdown rendering and edit-preview state are stable', () => {
  const editor = createMarkdownEditor('# Core heading\n\n**bold**');
  const preview = editor.setMode('preview');

  assert.match(preview.rendered, /<h1[^>]*>Core heading<\/h1>/);
  assert.match(preview.rendered, /<strong>bold<\/strong>/);
  assert.equal(preview.markdown, editor.markdown);
  assert.equal(preview.setMode('edit').markdown, editor.markdown);
  assert.match(renderMarkdown('> quote'), /<blockquote>[\s\S]*quote/);
});

test('TEST-03 #35: internal links resolve and produce backlinks', async () => {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), 'threadnote-gate-'));
  const storagePath = path.join(sandbox, 'notes.json');

  try {
    const links = parseInternalLinks('Read [[Core target]]');
    assert.deepEqual(links.map((link) => link.title), ['Core target']);

    const store = await createPersistentNoteStore(storagePath);
    const controller = createNotesController(store);
    const source = await controller.create({
      title: 'Core source',
      body: 'Read [[Core target]]',
    });
    const resolution = await controller.resolveLink(source.id, 'Core target');

    assert.equal(resolution.status, 201);
    assert.equal(resolution.body.note.title, 'Core target');
    assert.equal(resolution.body.note.backlinks[0].id, source.id);

    const backlinks = await controller.getBacklinks(resolution.body.note.id);
    assert.equal(backlinks.status, 200);
    assert.equal(backlinks.body.items[0].title, 'Core source');
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
});
