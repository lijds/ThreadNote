# TDD Log: Stage 6 Tickets #22 and #23

## Red

- Acceptance scope: export all local notes, restore them into a new store, reject malformed backups, and reject conflicting note IDs.
- Red result: `npm.cmd test` failed because `exportBackup` was not available on the notes controller.

## Green

- Added `exportBackup` returning a versioned `BackupDocument` with all notes and an export timestamp.
- Added validated `importBackup` with note-shape/timestamp/backlink checks, duplicate-ID protection, and conflict detection.
- Import persists notes through the local store and returns `imported`, `skipped`, and `errors` fields.
- `npm.cmd test` passed: 21 tests, 21 passed, 0 failed.

## Refactor

- Extracted timestamp and backlink validation into focused helpers.
- Final validation: `npm.cmd test` and `npm.cmd run typecheck` passed.