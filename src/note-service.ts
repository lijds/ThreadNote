import { randomUUID } from 'node:crypto';

const DEFAULT_TITLE = 'Untitled note';

export interface CreateNoteInput {
  title?: string;
  body: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  body?: string;
  tags?: string[];
}

export interface Backlink {
  id: string;
  title: string;
  linkText?: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  backlinks: Backlink[];
}

function normalizeTitle(title: string | undefined): string {
  return title?.trim() || DEFAULT_TITLE;
}

function normalizeTags(tags: string[] | undefined): string[] {
  return [...(tags ?? [])];
}

function createTimestamp(): string {
  return new Date().toISOString();
}

export function createNote(input: CreateNoteInput): Note {
  if (!input.body) {
    throw new Error('body is required');
  }

  const timestamp = createTimestamp();

  return {
    id: `note-${randomUUID()}`,
    title: normalizeTitle(input.title),
    body: input.body,
    tags: normalizeTags(input.tags),
    createdAt: timestamp,
    updatedAt: timestamp,
    backlinks: [],
  };
}

export function updateNote(note: Note, input: UpdateNoteInput): Note {
  return {
    ...note,
    title: input.title === undefined ? note.title : normalizeTitle(input.title),
    body: input.body ?? note.body,
    tags: input.tags === undefined ? [...note.tags] : normalizeTags(input.tags),
    backlinks: [...note.backlinks],
    updatedAt: createTimestamp(),
  };
}
