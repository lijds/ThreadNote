# TDD Log: Stage 2 Tickets #6 and #12

## Red

- Acceptance scope: render headings, lists, emphasis, quotes, and paragraphs; switch between edit and preview without losing Markdown input.
- Red result: `npm.cmd test` failed with `ERR_MODULE_NOT_FOUND` because `src/markdown-editor.ts` did not exist.

## Green

- Added `marked` for basic Markdown parsing.
- Added `renderMarkdown` and an immutable editor model with `edit` and `preview` modes.
- `setMarkdown` preserves the active mode; `setMode` preserves the source Markdown.
- `npm.cmd test` passed: 8 tests, 8 passed, 0 failed.

## Refactor

- Reused the existing rendered output when only the editor mode changes, avoiding unnecessary reparsing.
- Final validation: `npm.cmd test` and `npm.cmd run typecheck` passed.