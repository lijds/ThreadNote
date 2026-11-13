import assert from 'node:assert/strict';
import test from 'node:test';
import { createMobileNotesApp, type MobileStorage } from '../src/mobile/notes-app.js';

class MemorySandbox implements MobileStorage {
  private content: string | null = null;

  async read(): Promise<string | null> {
    return this.content;
  }

  async write(content: string): Promise<void> {
    this.content = content;
  }
}

test('integrates offline note lifecycle, persistence, search, and graph', async () => {
  const sandbox = new MemorySandbox();
  const app = createMobileNotesApp(sandbox);
  await app.initialize();

  const center = await app.createNote({ title: 'Center', body: 'Initial' });
  const target = await app.createNote({ title: 'Target', body: 'Target body' });
  await app.updateNote(center.id, {
    title: 'Renamed center',
    body: 'See [[Target]]',
    tags: ['work'],
  });
  await app.resolveLink(center.id, 'Target');

  assert.equal((await app.search('target')).length, 2);
  assert.equal((await app.getBacklinks(target.id))[0].title, 'Renamed center');
  assert.deepEqual((await app.getGraph(center.id)).nodes.map((node) => node.title), [
    'Renamed center',
    'Target',
  ]);

  const reopenedApp = createMobileNotesApp(sandbox);
  await reopenedApp.initialize();
  assert.equal((await reopenedApp.openNote(target.id))?.body, 'Target body');
  assert.equal((await reopenedApp.openNote(center.id))?.title, 'Renamed center');
  assert.equal((await reopenedApp.getGraph(center.id)).edges[0].target, target.id);

  const backup = await reopenedApp.exportBackup();
  const restoredSandbox = new MemorySandbox();
  const restoredApp = createMobileNotesApp(restoredSandbox);
  await restoredApp.initialize();
  await restoredApp.importBackup(backup);
  assert.equal((await restoredApp.openNote(center.id))?.title, 'Renamed center');
  await restoredApp.deleteNote(target.id);
  assert.equal(await restoredApp.openNote(target.id), undefined);
});
