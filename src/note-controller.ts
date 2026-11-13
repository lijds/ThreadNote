import type {
  CreateNoteInput,
  Note,
  UpdateNoteInput,
} from './note-service.js';
import type { PersistentNoteStore } from './note-store.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export interface ListNotesQuery {
  page?: number;
  limit?: number;
}

export interface NoteSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export interface NoteListResponse {
  items: NoteSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface ControllerResponse<T> {
  status: number;
  body: T;
}

export class NoteControllerError extends Error {
  constructor(
    public readonly status: 400 | 404 | 409,
    message: string,
  ) {
    super(message);
  }
}

function getPagination(query: ListNotesQuery): { page: number; limit: number } {
  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_LIMIT;
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    throw new NoteControllerError(400, 'page and limit must be positive integers');
  }

  return { page, limit };
}

async function getNoteOrThrow(store: PersistentNoteStore, noteId: string): Promise<Note> {
  const note = await store.get(noteId);
  if (note === undefined) {
    throw new NoteControllerError(404, 'note was not found');
  }

  return note;
}

function validateDeleteConfirmation(confirm: boolean | undefined): void {
  if (typeof confirm !== 'boolean') {
    throw new NoteControllerError(400, 'delete confirmation is required');
  }
  if (!confirm) {
    throw new NoteControllerError(409, 'delete confirmation must be true');
  }
}

export function createNotesController(store: PersistentNoteStore) {
  return {
    create(input: CreateNoteInput): Promise<Note> {
      return store.create(input);
    },
    async list(query: ListNotesQuery = {}): Promise<ControllerResponse<NoteListResponse>> {
      const { page, limit } = getPagination(query);
      const notes = (await store.list()).sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      );
      const start = (page - 1) * limit;
      return {
        status: 200,
        body: {
          items: notes.slice(start, start + limit).map(({ id, title, updatedAt }) => ({
            id,
            title,
            updatedAt,
          })),
          total: notes.length,
          page,
          limit,
        },
      };
    },
    async get(noteId: string): Promise<ControllerResponse<Note>> {
      return { status: 200, body: await getNoteOrThrow(store, noteId) };
    },
    async update(
      noteId: string,
      input: UpdateNoteInput,
    ): Promise<ControllerResponse<Note>> {
      await getNoteOrThrow(store, noteId);
      return { status: 200, body: await store.update(noteId, input) };
    },
    async delete(noteId: string, confirm?: boolean): Promise<{ status: 204 }> {
      validateDeleteConfirmation(confirm);
      if (!(await store.delete(noteId))) {
        throw new NoteControllerError(404, 'note was not found');
      }

      return { status: 204 };
    },
  };
}