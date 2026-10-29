# ThreadNote API-GATE

## Gate decision

**Status: PASS**

The REST API contract is ready for the next implementation stage. This gate
approves the design and mock only; it does not approve a production server
implementation.

## Evidence checklist

| Check | Result | Evidence |
| --- | --- | --- |
| 1. Every substantive operation has a REQ-ID link | PASS | `x-req-ids` is present on every operation in `specs/openapi.yaml`; cross-check in `specs/traceability-matrix.md` |
| 2. Resources and terminology match the domain glossary | PASS | `Note`, `Backlink`, `Graph`, and `BackupDocument` match the ThreadNote domain terms |
| 3. URI and HTTP methods are consistent | PASS | Collection/resource conventions are used consistently under `/notes` and `/backup` |
| 4. Request and response schemas are defined | PASS | Operation bodies and responses reference `components.schemas` |
| 5. HTTP codes and one error model are defined | PASS | Documented `2xx`, `4xx` responses use `components.schemas.Error` where applicable |
| 6. Positive and negative scenarios are defined | PASS | API-P01–API-P13 and API-N01–API-N11 in `specs/api-scenarios.md` |
| 7. The API does not expose implementation details | PASS | Contract exposes domain resources, not storage tables or internal services |
| 8. OpenAPI automatic validation | PASS | Redocly CLI: validated, exit code `0` |
| 9. Mock starts from the approved specification | PASS | Prism started on `http://127.0.0.1:4010` and registered all paths |
| 10. Main scenarios reproduce through mock | PASS | Verified collection, create, update, link resolution, backlinks, graph, export/import, delete, and documented `4xx` responses |

## Validation commands

Run from the repository root in PowerShell:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
npx.cmd --yes @redocly/cli lint specs/openapi.yaml
npx.cmd --yes @stoplight/prism-cli@latest mock specs/openapi.yaml --host 127.0.0.1 --port 4010 --dynamic
```

The Prism mock exposes the paths from the OpenAPI `paths` section directly,
for example `http://127.0.0.1:4010/notes`. Use
`Prefer: code=<status>` to select a documented negative response when needed.

## Mock verification record

The following requests were executed against the running Prism mock:

| Request | Expected | Observed |
| --- | --- | --- |
| `GET /notes` | `200` | `200` |
| `POST /notes` with a valid body | `201` | `201` |
| `PATCH /notes/test` with a valid body | `200` | `200` |
| `GET /notes/test/backlinks` | `200` | `200` |
| `POST /notes/test/links/resolve` with a valid body | `200` | `200` |
| `GET /notes/test/graph` | `200` | `200` |
| `GET /backup/export` | `200` | `200` |
| `POST /backup/import` with a valid body | `200` | `200` |
| `DELETE /notes/test?confirm=true` | `204` | `204` |
| `DELETE /notes/test?confirm=false` with `Prefer: code=409` | `409` | `409` |
| `GET /notes/unknown` with `Prefer: code=404` | `404` | `404` |
| `GET /notes/test/graph?depth=2` with `Prefer: code=400` | `400` | `400` |

Prism is a schema/status-code mock and does not implement persistence or
business logic. Therefore, response payload semantics such as actual search
matching and note creation persistence remain implementation-stage checks.
Dynamic mode is required for request-body scenarios in the current Prism/Node
environment.

## Follow-up

Implementing the approved operations and integrating them with the mobile
client is deferred to the next laboratory work.
