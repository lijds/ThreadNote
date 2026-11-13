# TDD Log: Ticket #25 (NFR-01 Offline Operation)

## Red

- Acceptance scope: create, read, and update notes locally without network access.
- The test replaces `globalThis.fetch` with a failure sentinel so any network call fails immediately.
- Red result: `npm.cmd test` failed with `ERR_MODULE_NOT_FOUND` because `src/note-store.ts` did not exist.

## Green

- Added `createOfflineNoteStore` backed by an in-memory local `Map`.
- Store create/read/update operations delegate to the note service and do not use network APIs.
- `npm.cmd test` passed: 4 tests, 4 passed, 0 failed.

## Refactor

- Extracted required-note lookup and defensive note copying into private store helpers.
- Final validation: `npm.cmd test` and `npm.cmd run typecheck` passed.
- Offline actions covered by the test: local create, local read, and local update with network access blocked.
