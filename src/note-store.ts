import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  createNote,
  type CreateNoteInput,
  type Note,
  type UpdateNoteInput,
  updateNote,
} from './note-service.js';

export interface OfflineNoteStore {
  create(input: CreateNoteInput): Note;
  get(noteId: string): Note | undefined;
  update(noteId: string, input: UpdateNoteInput): Note;
}

export interface PersistentNoteStore {
  create(input: CreateNoteInput): Promise<Note>;
  get(noteId: string): Promise<Note | undefined>;
  update(noteId: string, input: UpdateNoteInput): Promise<Note>;
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

export function createOfflineNoteStore(): OfflineNoteStore {
  const notes = new Map<string, Note>();

  return {
    create(input) {
      const note = createNote(input);
      notes.set(note.id, note);
      return copyNote(note);
    },
    get(noteId) {
      const note = notes.get(noteId);
      return note === undefined ? undefined : copyNote(note);
    },
    update(noteId, input) {
      const note = requireNote(notes, noteId);
      const updatedNote = updateNote(note, input);
      notes.set(noteId, updatedNote);
      return copyNote(updatedNote);
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
    async get(noteId) {
      const note = notes.get(noteId);
      return note === undefined ? undefined : copyNote(note);
    },
    async update(noteId, input) {
      const note = requireNote(notes, noteId);
      const updatedNote = updateNote(note, input);
      notes.set(noteId, updatedNote);
      await persistNotes(storagePath, notes);
      return copyNote(updatedNote);
    },
  };
}
