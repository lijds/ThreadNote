import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createNotesController } from '../src/note-controller.js';
import { createPersistentNoteStore } from '../src/note-store.js';

test('builds a depth-one ego-network around the active note', async () => {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), 'threadnote-graph-'));

  try {
    const store = await createPersistentNoteStore(path.join(sandbox, 'notes.json'));
    const controller = createNotesController(store);
    const center = await controller.create({
      title: 'Center',
      body: 'See [[Outgoing]]',
    });
    const outgoing = await controller.create({ title: 'Outgoing', body: 'Target' });
    const incoming = await controller.create({
      title: 'Incoming',
      body: 'See [[Center]]',
    });
    const secondDegree = await controller.create({
      title: 'Second degree',
      body: 'Not a direct neighbor',
    });

    await controller.resolveLink(center.id, 'Outgoing');
    await controller.resolveLink(incoming.id, 'Center');
    await controller.resolveLink(outgoing.id, 'Second degree');

    const graph = await controller.getGraph(center.id);

    assert.equal(graph.status, 200);
    assert.equal(graph.body.center, center.id);
    assert.deepEqual(
      graph.body.nodes.map((node) => node.id).sort(),
      [center.id, outgoing.id, incoming.id].sort(),
    );
    assert.ok(!graph.body.nodes.some((node) => node.id === secondDegree.id));
    assert.deepEqual(graph.body.edges, [
      { source: center.id, target: outgoing.id },
      { source: incoming.id, target: center.id },
    ]);

    await assert.rejects(
      controller.getGraph(center.id, 2),
      (error: unknown) => (error as { status: number }).status === 400,
    );
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
});
