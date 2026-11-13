# TDD Log: Stage 5 Tickets #18 through #21

## Red

- Acceptance scope: build the active-note ego-network with the center, direct incoming/outgoing neighbors, directed edges, and `depth=1` enforcement.
- Red result: `npm.cmd test` failed because `controller.getGraph` was not available.

## Green

- Added Graph response types and `getGraph` controller operation.
- Outgoing neighbors are derived from parsed internal links; incoming neighbors come from persisted backlinks.
- The graph remains first-degree only and rejects `depth` values other than `1` with `400`.
- `npm.cmd test` passed: 19 tests, 19 passed, 0 failed.

## Refactor

- Extracted graph node/edge accumulation into a reusable helper with edge deduplication.
- Final validation: `npm.cmd test` and `npm.cmd run typecheck` passed.