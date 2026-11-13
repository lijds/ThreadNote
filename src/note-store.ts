import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  createNote,
  createPlaceholderNote,
  type Backlink,
  type CreateNoteInput,
  type Note,
  type UpdateNoteInput,
  updateNote,
} from './note-service.js';

export interface OfflineNoteStore {
  create(input: CreateNoteInput): Note;
  createPlaceholder(title: string): Note;
  get(noteId: string): Note | undefined;
  search(query?: string, tag?: string): Note[];
  list(): Note[];
  update(noteId: string, input: UpdateNoteInput): Note;
  delete(noteId: string): boolean;
  addBacklink(noteId: string, backlink: Backlink): Note;
  importNotes(notesToImport: Note[]): number;
}

export interface PersistentNoteStore {
  create(input: CreateNoteInput): Promise<Note>;
  createPlaceholder(title: string): Promise<Note>;
  get(noteId: string): Promise<Note | undefined>;
  search(query?: string, tag?: string): Promise<Note[]>;
  list(): Promise<Note[]>;
  update(noteId: string, input: UpdateNoteInput): Promise<Note>;
  delete(noteId: string): Promise<boolean>;
  addBacklink(noteId: string, backlink: Backlink): Promise<Note>;
  importNotes(notesToImport: Note[]): Promise<number>;
}

function copyNote(note: Note): Note {
  return {
    ...note,
    tags: [...note.tags],
    backlinks: [...note.backlinks],
  };
}

function requireNote(notes: Map<string, Note>, noteId: string): Note {
  const note = notes.get(noteId);
  if (note === undefined) {
    throw new Error(`note not found: ${noteId}`);
  }

  return note;
}

function addBacklinkToNote(note: Note, backlink: Backlink): Note {
  const backlinks = note.backlinks.some(
    (existing) => existing.id === backlink.id && existing.linkText === backlink.linkText,
  )
    ? note.backlinks
    : [...note.backlinks, { ...backlink }];

  return { ...note, backlinks };
}

function tokenize(value: string): string[] {
  return value.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

class NoteIndex {
  private readonly tokens = new Map<string, Set<string>>();
  private readonly tags = new Map<string, Set<string>>();

  add(note: Note): void {
    for (const token of new Set([...tokenize(note.title), ...tokenize(note.body)])) {
      const ids = this.tokens.get(token) ?? new Set<string>();
      ids.add(note.id);
      this.tokens.set(token, ids);
    }
    for (const tag of note.tags) {
      const ids = this.tags.get(tag) ?? new Set<string>();
      ids.add(note.id);
      this.tags.set(tag, ids);
    }
  }

  remove(note: Note): void {
    for (const token of new Set([...tokenize(note.title), ...tokenize(note.body)])) {
      const ids = this.tokens.get(token);
      ids?.delete(note.id);
      if (ids?.size === 0) {
        this.tokens.delete(token);
      }
    }
    for (const tag of note.tags) {
      const ids = this.tags.get(tag);
      ids?.delete(note.id);
      if (ids?.size === 0) {
        this.tags.delete(tag);
      }
    }
  }

  find(notes: Map<string, Note>, query = '', tag?: string): Note[] {
    let candidateIds = new Set(notes.keys());
    if (query.trim() !== '') {
      for (const queryToken of tokenize(query)) {
        const tokenIds = new Set<string>();
        for (const [indexedToken, ids] of this.tokens) {
          if (indexedToken.includes(queryToken)) {
            for (const id of ids) {
              tokenIds.add(id);
            }
          }
        }
        candidateIds = new Set([...candidateIds].filter((id) => tokenIds.has(id)));
      }
    }
    if (tag !== undefined) {
      const tagIds = this.tags.get(tag) ?? new Set<string>();
      candidateIds = new Set([...candidateIds].filter((id) => tagIds.has(id)));
    }

    return [...candidateIds]
      .map((id) => notes.get(id))
      .filter((note): note is Note => note !== undefined);
  }
}

export function createOfflineNoteStore(): OfflineNoteStore {
  const notes = new Map<string, Note>();
  const index = new NoteIndex();

  return {
    create(input) {
      const note = createNote(input);
      notes.set(note.id, note);
      index.add(note);
      return copyNote(note);
    },
    createPlaceholder(title) {
      const note = createPlaceholderNote(title);
      notes.set(note.id, note);
      index.add(note);
      return copyNote(note);
    },
    get(noteId) {
      const note = notes.get(noteId);
      return note === undefined ? undefined : copyNote(note);
    },
    search(query, tag) {
      return index.find(notes, query, tag).map(copyNote);
    },
    addBacklink(noteId, backlink) {
      const note = requireNote(notes, noteId);
      const updatedNote = addBacklinkToNote(note, backlink);
      notes.set(noteId, updatedNote);
      return copyNote(updatedNote);
    },
    importNotes(notesToImport) {
      for (const note of notesToImport) {
        const existing = notes.get(note.id);
        if (existing !== undefined) {
          index.remove(existing);
        }
        notes.set(note.id, copyNote(note));
        index.add(note);
      }

      return notesToImport.length;
    },
    list() {
      return [...notes.values()].map(copyNote);
    },
    update(noteId, input) {
      const note = requireNote(notes, noteId);
      const updatedNote = updateNote(note, input);
      index.remove(note);
      notes.set(noteId, updatedNote);
      index.add(updatedNote);
      return copyNote(updatedNote);
    },
    delete(noteId) {
      const note = notes.get(noteId);
      if (note === undefined) {
        return false;
      }
      index.remove(note);
      return notes.delete(noteId);
    },
  };
}

async function loadNotes(storagePath: string): Promise<Map<string, Note>> {
  try {
    const serializedNotes = await readFile(storagePath, 'utf8');
    return deserializeNotes(serializedNotes);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }

    return new Map();
  }
}

function deserializeNotes(serializedNotes: string): Map<string, Note> {
  const storedNotes = JSON.parse(serializedNotes) as Note[];
  return new Map(storedNotes.map((note) => [note.id, note]));
}

function serializeNotes(notes: Map<string, Note>): string {
  return JSON.stringify([...notes.values()], null, 2);
}

async function persistNotes(storagePath: string, notes: Map<string, Note>): Promise<void> {
  await mkdir(path.dirname(storagePath), { recursive: true });
  await writeFile(storagePath, serializeNotes(notes), 'utf8');
}

export async function createPersistentNoteStore(storagePath: string): Promise<PersistentNoteStore> {
  const notes = await loadNotes(storagePath);
  const index = new NoteIndex();
  for (const note of notes.values()) {
    index.add(note);
  }

  return {
    async create(input) {
      const note = createNote(input);
      notes.set(note.id, note);
      index.add(note);
      await persistNotes(storagePath, notes);
      return copyNote(note);
    },
    async createPlaceholder(title) {
      const note = createPlaceholderNote(title);
      notes.set(note.id, note);
      index.add(note);
      await persistNotes(storagePath, notes);
      return copyNote(note);
    },
    async get(noteId) {
      const note = notes.get(noteId);
      return note === undefined ? undefined : copyNote(note);
    },
    async search(query, tag) {
      return index.find(notes, query, tag).map(copyNote);
    },
    async addBacklink(noteId, backlink) {
      const note = requireNote(notes, noteId);
      const updatedNote = addBacklinkToNote(note, backlink);
      notes.set(noteId, updatedNote);
      await persistNotes(storagePath, notes);
      return copyNote(updatedNote);
    },
    async importNotes(notesToImport) {
      for (const note of notesToImport) {
        const existing = notes.get(note.id);
        if (existing !== undefined) {
          index.remove(existing);
        }
        notes.set(note.id, copyNote(note));
        index.add(note);
      }

      await persistNotes(storagePath, notes);
      return notesToImport.length;
    },
    async list() {
      return [...notes.values()].map(copyNote);
    },
    async update(noteId, input) {
      const note = requireNote(notes, noteId);
      const updatedNote = updateNote(note, input);
      index.remove(note);
      notes.set(noteId, updatedNote);
      index.add(updatedNote);
      await persistNotes(storagePath, notes);
      return copyNote(updatedNote);
    },
    async delete(noteId) {
      const note = notes.get(noteId);
      if (note === undefined) {
        return false;
      }
      index.remove(note);
      const deleted = notes.delete(noteId);
      if (deleted) {
        await persistNotes(storagePath, notes);
      }

      return deleted;
    },
  };
}
