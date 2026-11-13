# TDD Log: POST /notes

## Red

- Ticket scope: first backlog slice `#3/#4`, aligned with `POST /notes` and `API-P01`.
- Acceptance behavior specified first in `tests/note-service.test.ts`:
  - required `body`;
  - generated non-empty title when title is absent;
  - response metadata `id`, `createdAt`, `updatedAt`, and `backlinks`.
- Implementation status at this point: not started.
- Red result: `npm.cmd test` failed with `ERR_MODULE_NOT_FOUND` because `src/note-service.ts` did not exist.

## Green

- Added the minimal `createNote` service for the `POST /notes` contract.
- `npm.cmd test` passed: 2 tests, 2 passed, 0 failed.

## Refactor

- Generalized the `backlinks` type to the OpenAPI `Backlink` shape without changing the initial empty collection returned by creation.
- Refactor validation: `npm.cmd test` passed and `npm.cmd run typecheck` passed.

## Ticket #5 Red

- Added the FR-03 acceptance test for updating a note with an empty title.
- Red result: `npm.cmd test` failed because `updateNote` was not exported by the service.

## Ticket #5 Green and Refactor

- Implemented `updateNote` with shared title normalization; empty or whitespace-only titles become `Untitled note`.
- `npm.cmd test` passed: 3 tests, 3 passed, 0 failed.
- Refactored timestamp creation into one helper shared by create and update.
- Final validation: `npm.cmd test` and `npm.cmd run typecheck` passed.
