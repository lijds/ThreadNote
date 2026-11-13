# TDD Log: Stage 3 Tickets #10 and #11

## Red

- Acceptance scope: resolving a source note link generates backlink metadata on the target and exposes it through `GET /notes/{noteId}/backlinks`.
- Red result: `npm.cmd test` failed because `controller.getBacklinks` was not available.
- During Green validation, the first implementation also exposed an empty backlink list until `resolveLink` was wired to persist the source backlink.

## Green

- Added persisted `addBacklink` operations to local stores.
- `resolveLink` now records `{ id, title, linkText }` on existing and placeholder targets.
- Added `getBacklinks` with the OpenAPI `{ noteId, items }` response and `404` handling through the shared lookup helper.
- `npm.cmd test` passed: 13 tests, 13 passed, 0 failed.

## Refactor

- Centralized backlink deduplication and merge logic in one store helper.
- Final validation: `npm.cmd test` and `npm.cmd run typecheck` passed.