import { randomUUID } from 'node:crypto';

const DEFAULT_TITLE = 'Untitled note';

export interface CreateNoteInput {
  title?: string;
  body: string;
  tags?: string[];
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  backlinks: [];
}

function normalizeTitle(title: string | undefined): string {
  return title?.trim() || DEFAULT_TITLE;
}

function normalizeTags(tags: string[] | undefined): string[] {
  return [...(tags ?? [])];
}

export function createNote(input: CreateNoteInput): Note {
  if (!input.body) {
    throw new Error('body is required');
  }

  const timestamp = new Date().toISOString();

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
