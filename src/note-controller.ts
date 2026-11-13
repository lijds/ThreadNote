import type {
  Backlink,
  CreateNoteInput,
  Note,
  UpdateNoteInput,
} from './note-service.js';
import type { PersistentNoteStore } from './note-store.js';
import { parseInternalLinks } from './markdown-editor.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export interface ListNotesQuery {
  page?: number;
  limit?: number;
  query?: string;
  tag?: string;
  sort?: 'relevance' | 'recency';
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

export interface GraphNode {
  id: string;
  title: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphResponse {
  center: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ResolveLinkResponse {
  created: boolean;
  note: Note;
}

export interface BacklinkListResponse {
  noteId: string;
  items: Backlink[];
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
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new NoteControllerError(400, 'page and limit must be positive integers');
  }

  return { page, limit };
}

function countOccurrences(value: string, query: string): number {
  return value.split(query).length - 1;
}

function relevanceScore(note: Note, query: string): number {
  const title = note.title.toLocaleLowerCase();
  const body = note.body.toLocaleLowerCase();
  return countOccurrences(title, query) * 10 + countOccurrences(body, query);
}

function validateSort(sort: ListNotesQuery['sort']): 'relevance' | 'recency' {
  if (sort !== undefined && sort !== 'relevance' && sort !== 'recency') {
    throw new NoteControllerError(400, 'sort must be relevance or recency');
  }

  return sort ?? 'relevance';
}

function matchesQuery(note: Note, query: string): boolean {
  return (
    query === '' ||
    note.title.toLocaleLowerCase().includes(query) ||
    note.body.toLocaleLowerCase().includes(query)
  );
}

function filterAndSortNotes(
  notes: Note[],
  query: string,
  tag: string | undefined,
  sort: 'relevance' | 'recency',
): Note[] {
  return notes
    .filter((note) => tag === undefined || note.tags.includes(tag))
    .filter((note) => matchesQuery(note, query))
    .sort((left, right) => {
      if (sort === 'relevance' && query !== '') {
        const scoreDifference = relevanceScore(right, query) - relevanceScore(left, query);
        if (scoreDifference !== 0) {
          return scoreDifference;
        }
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });
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

function addGraphConnection(
  nodes: Map<string, GraphNode>,
  edges: GraphEdge[],
  edgeKeys: Set<string>,
  note: Note,
  source: string,
  target: string,
): void {
  nodes.set(note.id, { id: note.id, title: note.title });
  const edgeKey = `${source}->${target}`;
  if (!edgeKeys.has(edgeKey)) {
    edgeKeys.add(edgeKey);
    edges.push({ source, target });
  }
}

function buildGraph(center: Note, notes: Note[]): GraphResponse {
  const notesById = new Map(notes.map((note) => [note.id, note]));
  const notesByTitle = new Map(notes.map((note) => [note.title, note]));
  const nodes = new Map<string, GraphNode>([
    [center.id, { id: center.id, title: center.title }],
  ]);
  const edges: GraphEdge[] = [];
  const edgeKeys = new Set<string>();

  for (const link of parseInternalLinks(center.body)) {
    const target = notesByTitle.get(link.title);
    if (target !== undefined) {
      addGraphConnection(nodes, edges, edgeKeys, target, center.id, target.id);
    }
  }

  for (const backlink of center.backlinks) {
    const source = notesById.get(backlink.id);
    if (source !== undefined) {
      addGraphConnection(nodes, edges, edgeKeys, source, source.id, center.id);
    }
  }

  return { center: center.id, nodes: [...nodes.values()], edges };
}

export function createNotesController(store: PersistentNoteStore) {
  return {
    create(input: CreateNoteInput): Promise<Note> {
      return store.create(input);
    },
    async resolveLink(
      sourceNoteId: string,
      targetTitle: string,
    ): Promise<ControllerResponse<ResolveLinkResponse>> {
      const sourceNote = await getNoteOrThrow(store, sourceNoteId);
      const normalizedTitle = targetTitle.trim();
      if (!normalizedTitle) {
        throw new NoteControllerError(400, 'target title is required');
      }

      const backlink: Backlink = {
        id: sourceNote.id,
        title: sourceNote.title,
        linkText: `[[${normalizedTitle}]]`,
      };

      const existingNote = (await store.list()).find(
        (note) => note.title === normalizedTitle,
      );
      if (existingNote !== undefined) {
        const linkedNote = await store.addBacklink(existingNote.id, backlink);
        return { status: 200, body: { created: false, note: linkedNote } };
      }

      const placeholder = await store.createPlaceholder(normalizedTitle);
      const linkedPlaceholder = await store.addBacklink(placeholder.id, backlink);
      return { status: 201, body: { created: true, note: linkedPlaceholder } };
    },
    async list(query: ListNotesQuery = {}): Promise<ControllerResponse<NoteListResponse>> {
      const { page, limit } = getPagination(query);
      const sort = validateSort(query.sort);
      const normalizedQuery = query.query?.trim().toLocaleLowerCase() ?? '';
      const notes = filterAndSortNotes(
        await store.list(),
        normalizedQuery,
        query.tag,
        sort,
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
    async getBacklinks(
      noteId: string,
    ): Promise<ControllerResponse<BacklinkListResponse>> {
      const note = await getNoteOrThrow(store, noteId);
      return { status: 200, body: { noteId, items: note.backlinks } };
    },
    async getGraph(
      noteId: string,
      depth = 1,
    ): Promise<ControllerResponse<GraphResponse>> {
      if (depth !== 1) {
        throw new NoteControllerError(400, 'graph depth must be 1');
      }

      const center = await getNoteOrThrow(store, noteId);
      return { status: 200, body: buildGraph(center, await store.list()) };
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