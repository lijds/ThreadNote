# ThreadNote API Addendum v1

## Purpose

This addendum records clarifications introduced for the API-first laboratory
work. It does not change the ThreadNote v1 product scope or add a server
implementation.

## Clarifications

| ID | Clarification | Reason |
| --- | --- | --- |
| API-A01 | The functional capabilities of FR-01, FR-02, FR-03, FR-05, FR-06, FR-07, FR-10, FR-11, FR-12, FR-13, FR-14, FR-16, FR-17, and FR-18 are represented by REST operations in `specs/openapi.yaml`. | Makes the SRS behavior testable through a formal API contract. |
| API-A02 | The REST contract uses the `/api/v1` version prefix and exposes notes, backlinks, graph, search, and backup operations. | Defines stable resource boundaries and URI versioning. |
| API-A03 | The API uses the `Note`, `Backlink`, `Graph`, and `BackupDocument` data schemas and the shared `Error` response. | Establishes consistent request and response structures. |
| API-A04 | The API is unauthenticated in the laboratory mock because the approved SRS defines one end-user and no account or collaboration model. | Keeps the contract aligned with the single-user v1 scope. |
| API-A05 | Prism mock routes are tested using the paths from the `paths` section, for example `/notes`; the `/api/v1` prefix is the documented server base URL. | Documents the behavior of the selected mock tool. |
| API-A06 | The `Prefer: code=<status>` header is a mock-testing instruction for selecting a documented response and is not a product requirement. | Enables deterministic positive and negative mock scenarios. |
| API-A07 | Markdown rendering, edit/preview switching, autocomplete, and graph pan/zoom remain client/UI behavior and are not separate REST resources. | Prevents UI-only behavior from being incorrectly modeled as API operations. |

## Scope and implementation boundary

This addendum applies only to API design, OpenAPI validation, mock execution,
and API-GATE approval. It does not introduce cloud synchronization, remote
storage, authentication, collaboration, or a production REST server. Server
implementation remains planned for the subsequent laboratory work.

## Controlled artifacts

- `specs/openapi.yaml` — normative API contract;
- `specs/api-scenarios.md` — positive and negative mock scenarios;
- `specs/api-gate.md` — API-GATE evidence and decision;
- `specs/traceability-matrix.md` — API operation traceability.
