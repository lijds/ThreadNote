# TDD Log: Ticket #13 (Internal-Link Autocomplete)

## Red

- Acceptance scope: when the editor contains an unfinished `[[` expression, suggest matching note titles; do not suggest outside link context or after `]]`.
- Red result: `npm.cmd test` failed because `getLinkSuggestions` was not exported by the Markdown editor.

## Green

- Added local autocomplete filtering against the supplied note-title collection.
- Matching is case-insensitive and works from the cursor position without network access.
- `npm.cmd test` passed: 14 tests, 14 passed, 0 failed.

## Refactor

- Extracted active-link-context detection from title filtering into a focused helper.
- Final validation: `npm.cmd test` and `npm.cmd run typecheck` passed.