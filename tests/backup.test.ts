import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createNotesController } from '../src/note-controller.js';
import { createPersistentNoteStore } from '../src/note-store.js';

test('exports all notes and restores them from a backup document', async () => {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), 'threadnote-backup-'));

  try {
    const sourceStore = await createPersistentNoteStore(path.join(sandbox, 'source.json'));
    const sourceController = createNotesController(sourceStore);
    const firstNote = await sourceController.create({
      title: 'First note',
      body: 'First body',
      tags: ['work'],
    });
    await sourceController.create({
      title: 'Second note',
      body: 'Second body',
      tags: ['research'],
    });

    const exported = await sourceController.exportBackup();
    assert.equal(exported.status, 200);
    assert.equal(exported.body.version, '1.0');
    assert.equal(exported.body.notes.length, 2);
    assert.ok(exported.body.exportedAt);

    const restoredStore = await createPersistentNoteStore(path.join(sandbox, 'restored.json'));
    const restoredController = createNotesController(restoredStore);
    const imported = await restoredController.importBackup(exported.body);

    assert.equal(imported.status, 200);
    assert.deepEqual(imported.body, { imported: 2, skipped: 0, errors: [] });
    assert.deepEqual((await restoredController.get(firstNote.id)).body, firstNote);
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
});

test('rejects malformed and conflicting backup data', async () => {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), 'threadnote-backup-'));

  try {
    const store = await createPersistentNoteStore(path.join(sandbox, 'notes.json'));
    const controller = createNotesController(store);
    const note = await controller.create({ title: 'Existing', body: 'Body' });
    const backup = (await controller.exportBackup()).body;

    await assert.rejects(
      controller.importBackup({ ...backup, version: '' }),
      (error: unknown) => (error as { status: number }).status === 422,
    );
    await assert.rejects(
      controller.importBackup(backup),
      (error: unknown) => (error as { status: number }).status === 409,
    );
    assert.deepEqual((await controller.get(note.id)).body, note);
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
});
