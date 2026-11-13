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
