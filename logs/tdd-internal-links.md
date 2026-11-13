# TDD Log: Stage 3 Tickets #7, #8, and #9

## Red

- Acceptance scope: recognize `[[NoteName]]`, render internal links as clickable preview links, and resolve missing targets into placeholder drafts.
- Red result: `npm.cmd test` failed because `parseInternalLinks` was not exported by the Markdown editor.

## Green

- Added `parseInternalLinks` with title and source offsets.
- Preview rendering converts internal links to `threadnote://note/<encoded-title>` anchors.
- Added `createPlaceholderNote` and persistent-store support for empty draft bodies.
- Added `resolveLink` with `200` for existing targets and `201` for newly created placeholders.
- `npm.cmd test` passed: 12 tests, 12 passed, 0 failed.

## Refactor

- Centralized internal-link title normalization and left empty `[[ ]]` expressions unchanged instead of rendering them as links.
- Final validation: `npm.cmd test` and `npm.cmd run typecheck` passed.