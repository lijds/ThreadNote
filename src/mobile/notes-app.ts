import { parseInternalLinks } from '../markdown-editor';
import type {
  Backlink,
  CreateNoteInput,
  Note,
  UpdateNoteInput,
} from '../note-service';
import { createMobileStore, type MobileStore } from './memory-store';

export interface MobileStorage {
  read(): Promise<string | null>;
  write(content: string): Promise<void>;
  readBackup?(): Promise<string | null>;
  writeBackup?(content: string): Promise<void>;
}

export interface MobileGraph {
  center: string;
  nodes: Array<{ id: string; title: string }>;
  edges: Array<{ source: string; target: string }>;
}

export interface MobileNotesApp {
  initialize(): Promise<void>;
  createNote(input: CreateNoteInput): Promise<Note>;
  listNotes(): Promise<Note[]>;
  openNote(noteId: string): Promise<Note | undefined>;
  updateNote(noteId: string, input: UpdateNoteInput): Promise<Note>;
  deleteNote(noteId: string): Promise<void>;
  getBacklinks(noteId: string): Promise<Backlink[]>;
  resolveLink(sourceNoteId: string, targetTitle: string): Promise<Note>;
  search(query: string, tag?: string): Promise<Note[]>;
  getGraph(noteId: string): Promise<MobileGraph>;
  exportBackup(): Promise<string>;
  importBackup(serialized?: string): Promise<void>;
}

function copyNotes(notes: Note[]): string {
  return JSON.stringify(notes, null, 2);
}

function buildGraph(center: Note, notes: Note[]): MobileGraph {
  const notesById = new Map(notes.map((note) => [note.id, note]));
  const notesByTitle = new Map(notes.map((note) => [note.title, note]));
  const nodes = new Map<string, { id: string; title: string }>([
    [center.id, { id: center.id, title: center.title }],
  ]);
  const edges: Array<{ source: string; target: string }> = [];
  const edgeKeys = new Set<string>();

  const addConnection = (note: Note, source: string, target: string): void => {
    nodes.set(note.id, { id: note.id, title: note.title });
    const edgeKey = `${source}->${target}`;
    if (!edgeKeys.has(edgeKey)) {
      edgeKeys.add(edgeKey);
      edges.push({ source, target });
    }
  };

  for (const link of parseInternalLinks(center.body)) {
    const target = notesByTitle.get(link.title);
    if (target !== undefined) {
      addConnection(target, center.id, target.id);
    }
  }
  for (const backlink of center.backlinks) {
    const source = notesById.get(backlink.id);
    if (source !== undefined) {
      addConnection(source, source.id, center.id);
    }
  }

  return { center: center.id, nodes: [...nodes.values()], edges };
}

export function createMobileNotesApp(storage: MobileStorage): MobileNotesApp {
  const store: MobileStore = createMobileStore();
  let initialized = false;

  function ensureInitialized(): void {
    if (!initialized) {
      throw new Error('mobile notes app is not initialized');
    }
  }

  async function persist(): Promise<void> {
    await storage.write(copyNotes(store.list()));
  }

  return {
    async initialize() {
      if (initialized) {
        return;
      }
      const serializedNotes = await storage.read();
      if (serializedNotes !== null) {
        const notes = JSON.parse(serializedNotes) as Note[];
        store.importNotes(notes);
      }
      initialized = true;
    },
    async createNote(input) {
      ensureInitialized();
      const note = store.create(input);
      await persist();
      return note;
    },
    async listNotes() {
      ensureInitialized();
      return store.list();
    },
    async openNote(noteId) {
      ensureInitialized();
      return store.get(noteId);
    },
    async updateNote(noteId, input) {
      ensureInitialized();
      const note = store.update(noteId, input);
      await persist();
      return note;
    },
    async deleteNote(noteId) {
      ensureInitialized();
      if (!store.delete(noteId)) {
        throw new Error(`note not found: ${noteId}`);
      }
      await persist();
    },
    async getBacklinks(noteId) {
      ensureInitialized();
      const note = store.get(noteId);
      if (note === undefined) {
        throw new Error(`note not found: ${noteId}`);
      }
      return note.backlinks;
    },
    async resolveLink(sourceNoteId, targetTitle) {
      ensureInitialized();
      const source = store.get(sourceNoteId);
      if (source === undefined) {
        throw new Error(`note not found: ${sourceNoteId}`);
      }
      const normalizedTitle = targetTitle.trim();
      if (!normalizedTitle) {
        throw new Error('target title is required');
      }
      const target = store.list().find((note) => note.title === normalizedTitle)
        ?? store.createPlaceholder(normalizedTitle);
      const backlink: Backlink = {
        id: source.id,
        title: source.title,
        linkText: `[[${normalizedTitle}]]`,
      };
      const linkedTarget = store.addBacklink(target.id, backlink);
      await persist();
      return linkedTarget;
    },
    async search(query, tag) {
      ensureInitialized();
      return store.search(query, tag);
    },
    async getGraph(noteId) {
      ensureInitialized();
      const center = store.get(noteId);
      if (center === undefined) {
        throw new Error(`note not found: ${noteId}`);
      }
      return buildGraph(center, store.list());
    },
    async exportBackup() {
      ensureInitialized();
      const serialized = JSON.stringify({
        version: '1.0',
        exportedAt: new Date().toISOString(),
        notes: store.list(),
      }, null, 2);
      if (storage.writeBackup !== undefined) {
        await storage.writeBackup(serialized);
      }
      return serialized;
    },
    async importBackup(serialized) {
      ensureInitialized();
      let source: string | null | undefined = serialized;
      if (source === undefined && storage.readBackup !== undefined) {
        source = await storage.readBackup();
      }
      if (source === null || source === undefined) {
        throw new Error('No backup found');
      }
      const backup = JSON.parse(source) as { version?: string; notes?: Note[] };
      if (backup.version !== '1.0' || !Array.isArray(backup.notes)) {
        throw new Error('backup document is invalid');
      }
      store.importNotes(backup.notes);
      await persist();
    },
  };
}
