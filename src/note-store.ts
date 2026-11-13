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
  list(): Note[];
  update(noteId: string, input: UpdateNoteInput): Note;
  delete(noteId: string): boolean;
  addBacklink(noteId: string, backlink: Backlink): Note;
}

export interface PersistentNoteStore {
  create(input: CreateNoteInput): Promise<Note>;
  createPlaceholder(title: string): Promise<Note>;
  get(noteId: string): Promise<Note | undefined>;
  list(): Promise<Note[]>;
  update(noteId: string, input: UpdateNoteInput): Promise<Note>;
  delete(noteId: string): Promise<boolean>;
  addBacklink(noteId: string, backlink: Backlink): Promise<Note>;
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

export function createOfflineNoteStore(): OfflineNoteStore {
  const notes = new Map<string, Note>();

  return {
    create(input) {
      const note = createNote(input);
      notes.set(note.id, note);
      return copyNote(note);
    },
    createPlaceholder(title) {
      const note = createPlaceholderNote(title);
      notes.set(note.id, note);
      return copyNote(note);
    },
    get(noteId) {
      const note = notes.get(noteId);
      return note === undefined ? undefined : copyNote(note);
    },
    addBacklink(noteId, backlink) {
      const note = requireNote(notes, noteId);
      const updatedNote = addBacklinkToNote(note, backlink);
      notes.set(noteId, updatedNote);
      return copyNote(updatedNote);
    },
    list() {
      return [...notes.values()].map(copyNote);
    },
    update(noteId, input) {
      const note = requireNote(notes, noteId);
      const updatedNote = updateNote(note, input);
      notes.set(noteId, updatedNote);
      return copyNote(updatedNote);
    },
    delete(noteId) {
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

  return {
    async create(input) {
      const note = createNote(input);
      notes.set(note.id, note);
      await persistNotes(storagePath, notes);
      return copyNote(note);
    },
    async createPlaceholder(title) {
      const note = createPlaceholderNote(title);
      notes.set(note.id, note);
      await persistNotes(storagePath, notes);
      return copyNote(note);
    },
    async get(noteId) {
      const note = notes.get(noteId);
      return note === undefined ? undefined : copyNote(note);
    },
    async addBacklink(noteId, backlink) {
      const note = requireNote(notes, noteId);
      const updatedNote = addBacklinkToNote(note, backlink);
      notes.set(noteId, updatedNote);
      await persistNotes(storagePath, notes);
      return copyNote(updatedNote);
    },
    async list() {
      return [...notes.values()].map(copyNote);
    },
    async update(noteId, input) {
      const note = requireNote(notes, noteId);
      const updatedNote = updateNote(note, input);
      notes.set(noteId, updatedNote);
      await persistNotes(storagePath, notes);
      return copyNote(updatedNote);
    },
    async delete(noteId) {
      const deleted = notes.delete(noteId);
      if (deleted) {
        await persistNotes(storagePath, notes);
      }

      return deleted;
    },
  };
}
