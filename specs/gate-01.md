# GATE-01: Core Tests

## Decision

**Status: PASS**

The core data model, Markdown editor behavior, and internal-link system are
ready to proceed to the next implementation stage.

## Scope

| Test ID | Ticket | Area | Result | Evidence |
| --- | --- | --- | --- | --- |
| TEST-01 | #33 | Note data model | PASS | `tests/core-gate.test.ts` validates required fields, generated title, tags, timestamps, and backlinks. |
| TEST-02 | #34 | Markdown editor | PASS | `tests/core-gate.test.ts` validates headings, emphasis, preview rendering, and source preservation across modes. |
| TEST-03 | #35 | Internal links | PASS | `tests/core-gate.test.ts` validates `[[NoteName]]` parsing, placeholder resolution, and backlink exposure. |

## Verification

Executed from the repository root:

```text
npm.cmd test
npm.cmd run typecheck
```

Observed result:

- `17` tests passed, `0` failed.
- `tsc --noEmit` completed successfully.
- TEST-01, TEST-02, and TEST-03 each passed.

## Readiness Assessment

| Gate criterion | Result | Evidence |
| --- | --- | --- |
| Note model has required contract fields | PASS | `src/note-service.ts`, TEST-01 |
| Markdown syntax renders in preview | PASS | `src/markdown-editor.ts`, TEST-02 |
| Edit/preview switching preserves source | PASS | `src/markdown-editor.ts`, TEST-02 |
| Internal links are parsed and resolved | PASS | `src/markdown-editor.ts`, `src/note-controller.ts`, TEST-03 |
| Missing targets become local placeholders | PASS | `src/note-store.ts`, TEST-03 |
| Backlinks are generated and exposed | PASS | `src/note-store.ts`, `src/note-controller.ts`, TEST-03 |
| Strict TypeScript validation is clean | PASS | `npm.cmd run typecheck` |

## Residual Scope

This gate covers core domain behavior and service-level tests. React Native
screens, device-specific Expo adapters, HTTP server wiring, search/filtering,
graph UI, and performance targets remain outside this gate and are validated
by later tickets and GATE-02.
