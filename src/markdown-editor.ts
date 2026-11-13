import { marked } from 'marked';

export type EditorMode = 'edit' | 'preview';

export interface MarkdownEditor {
  readonly markdown: string;
  readonly mode: EditorMode;
  readonly rendered: string;
  setMarkdown(markdown: string): MarkdownEditor;
  setMode(mode: EditorMode): MarkdownEditor;
}

export interface InternalLink {
  title: string;
  start: number;
  end: number;
}

const INTERNAL_LINK_PATTERN = /\[\[([^\[\]]+)\]\]/g;

function normalizeLinkTitle(title: string): string {
  return title.trim();
}

export function parseInternalLinks(markdown: string): InternalLink[] {
  return [...markdown.matchAll(INTERNAL_LINK_PATTERN)]
    .map((match) => {
      const title = normalizeLinkTitle(match[1]);
      return {
        title,
        start: match.index ?? 0,
        end: (match.index ?? 0) + match[0].length,
      };
    })
    .filter((link) => link.title.length > 0);
}

function linkifyInternalLinks(markdown: string): string {
  return markdown.replace(INTERNAL_LINK_PATTERN, (match, rawTitle: string) => {
    const title = normalizeLinkTitle(rawTitle);
    if (!title) {
      return match;
    }

    return `[${title}](threadnote://note/${encodeURIComponent(title)})`;
  });
}

export function renderMarkdown(markdown: string): string {
  return marked.parse(linkifyInternalLinks(markdown), { async: false }) as string;
}

function createEditor(
  markdown: string,
  mode: EditorMode,
  rendered = renderMarkdown(markdown),
): MarkdownEditor {
  return {
    markdown,
    mode,
    rendered,
    setMarkdown(nextMarkdown) {
      return createEditor(nextMarkdown, mode);
    },
    setMode(nextMode) {
      return createEditor(markdown, nextMode, rendered);
    },
  };
}

export function createMarkdownEditor(markdown: string): MarkdownEditor {
  return createEditor(markdown, 'edit');
}
