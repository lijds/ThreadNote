import { marked } from 'marked';

export type EditorMode = 'edit' | 'preview';

export interface MarkdownEditor {
  readonly markdown: string;
  readonly mode: EditorMode;
  readonly rendered: string;
  setMarkdown(markdown: string): MarkdownEditor;
  setMode(mode: EditorMode): MarkdownEditor;
}

export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
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
