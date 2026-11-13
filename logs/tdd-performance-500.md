# TDD Log: Ticket #27 (500-Note Performance)

## Red

- Acceptance scope: search, tag filtering, pagination, and depth-one graph operations remain stable with 500 notes.
- The initial benchmark baseline completed under the timing threshold, so it did not expose a performance failure by itself.
- The optimization contract was made explicit by requiring indexed store search; the focused test then failed with `store.search is not a function`.

## Green

- Added token indexes for title/body terms and tag indexes to both local store variants.
- Indexes are synchronized on create, import, update, and delete; controller list uses indexed candidates before relevance sorting and pagination.
- The benchmark verifies one search result, 250 tag-filtered notes, pagination, and an 11-node ego-network.
- `npm.cmd test` passed: 22 tests, 22 passed, 0 failed.

## Refactor

- Removed empty token/tag buckets after mutations to keep long-running index memory bounded.
- Final validation: `npm.cmd test` and `npm.cmd run typecheck` passed.