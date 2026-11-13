import {
  createNote,
  createPlaceholderNote,
  type Backlink,
  type CreateNoteInput,
  type Note,
  type UpdateNoteInput,
  updateNote,
} from '../note-service.js';

export interface MobileStore {
  create(input: CreateNoteInput): Note;
  createPlaceholder(title: string): Note;
  get(noteId: string): Note | undefined;
  list(): Note[];
  search(query?: string, tag?: string): Note[];
  update(noteId: string, input: UpdateNoteInput): Note;
  addBacklink(noteId: string, backlink: Backlink): Note;
  importNotes(notes: Note[]): number;
}

function copyNote(note: Note): Note {
  return { ...note, tags: [...note.tags], backlinks: [...note.backlinks] };
}

function requireNote(notes: Map<string, Note>, noteId: string): Note {
  const note = notes.get(noteId);
  if (note === undefined) {
    throw new Error(`note not found: ${noteId}`);
  }
  return note;
}

function matches(note: Note, query: string, tag?: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return (
    (tag === undefined || note.tags.includes(tag)) &&
    (normalizedQuery === '' ||
      note.title.toLocaleLowerCase().includes(normalizedQuery) ||
      note.body.toLocaleLowerCase().includes(normalizedQuery))
  );
}

export function createMobileStore(): MobileStore {
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
    list() {
      return [...notes.values()].map(copyNote);
    },
    search(query = '', tag) {
      return [...notes.values()]
        .filter((note) => matches(note, query, tag))
        .map(copyNote);
    },
    update(noteId, input) {
      const note = requireNote(notes, noteId);
      const updatedNote = updateNote(note, input);
      notes.set(noteId, updatedNote);
      return copyNote(updatedNote);
    },
    addBacklink(noteId, backlink) {
      const note = requireNote(notes, noteId);
      const hasBacklink = note.backlinks.some(
        (existing) => existing.id === backlink.id && existing.linkText === backlink.linkText,
      );
      const updatedNote = hasBacklink
        ? note
        : { ...note, backlinks: [...note.backlinks, { ...backlink }] };
      notes.set(noteId, updatedNote);
      return copyNote(updatedNote);
    },
    importNotes(notesToImport) {
      for (const note of notesToImport) {
        notes.set(note.id, copyNote(note));
      }
      return notesToImport.length;
    },
  };
}
