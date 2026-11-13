# TDD Log: Stage 5 Tickets #14, #15, and #16

## Red

- Acceptance scope: full-text title/body search, tag filtering, relevance ordering, and recency ordering.
- Red result: `npm.cmd test` failed because the list controller ignored `query`, `tag`, and `sort`; the search test received all 3 notes instead of 2.

## Green

- Added `query`, `tag`, and `sort` list parameters matching the OpenAPI contract.
- Search matches both title and body, with title matches weighted above body matches for relevance.
- Tag filtering is applied before pagination; recency uses `updatedAt` descending.
- Invalid sort values and limits above the contract maximum return `400`.
- `npm.cmd test` passed: 18 tests, 18 passed, 0 failed.

## Refactor

- Extracted query matching and filter/sort ranking from response assembly into focused controller helpers.
- Final validation: `npm.cmd test` and `npm.cmd run typecheck` passed.