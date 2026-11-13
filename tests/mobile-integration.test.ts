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
  await app.updateNote(center.id, { body: 'See [[Target]]' });
  await app.resolveLink(center.id, 'Target');

  assert.equal((await app.search('target')).length, 2);
  assert.deepEqual((await app.getGraph(center.id)).nodes.map((node) => node.title), [
    'Center',
    'Target',
  ]);

  const reopenedApp = createMobileNotesApp(sandbox);
  await reopenedApp.initialize();
  assert.equal((await reopenedApp.openNote(target.id))?.body, 'Target body');
  assert.equal((await reopenedApp.getGraph(center.id)).edges[0].target, target.id);
});
