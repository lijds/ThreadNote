# TDD Log: Stage 2 Tickets #1 and #2

## Red

- Acceptance scope: create, paginated list, open, edit, and confirmed delete notes.
- The integration test also checks the OpenAPI delete errors: missing confirmation is `400`, false confirmation is `409`, and an unknown note is `404`.
- Red result: `npm.cmd test` failed with `ERR_MODULE_NOT_FOUND` because `src/note-controller.ts` did not exist.

## Green

- Added list and delete operations to local and persistent note stores.
- Added a contract-oriented notes controller for create, list, get, update, and delete operations.
- List responses include note summaries, total, page, and limit; notes are ordered by `updatedAt`.
- `npm.cmd test` passed: 6 tests, 6 passed, 0 failed.

## Refactor

- Extracted controller note lookup and `404` handling into a private helper instead of relying on method `this`.
- Final validation: `npm.cmd test` and `npm.cmd run typecheck` passed.