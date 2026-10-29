# ThreadNote API-GATE

## Gate decision

**Status: PASS**

The REST API contract is ready for the next implementation stage. This gate
approves the design and mock only; it does not approve a production server
implementation.

## Evidence checklist

| Check | Result | Evidence |
| --- | --- | --- |
| OpenAPI document exists | PASS | `specs/openapi.yaml` |
| OpenAPI version is supported | PASS | OpenAPI `3.0.3` |
| Automatic OpenAPI validation | PASS | Redocly CLI: `specs/openapi.yaml validated`; exit code `0` |
| Mock API starts from the contract | PASS | Prism started on `http://127.0.0.1:4010` |
| Mock routes are registered | PASS | Notes, backlinks, graph, and backup routes listed by Prism |
| Positive scenarios are defined | PASS | API-P01 through API-P13 in `specs/api-scenarios.md` |
| Negative scenarios are defined | PASS | API-N01 through API-N11 in `specs/api-scenarios.md` |
| Shared error model exists | PASS | `components.schemas.Error` |
| Requirement links exist | PASS | `x-req-ids` on each substantive operation |
| New API behavior is documented | PASS | `specs/api-addendum.md` |
| Production implementation is excluded | PASS | OpenAPI description and addendum scope |

## Validation commands

Run from the repository root in PowerShell:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
npx.cmd --yes @redocly/cli lint specs/openapi.yaml
npx.cmd --yes @stoplight/prism-cli@latest mock specs/openapi.yaml --host 127.0.0.1 --port 4010
```

The Prism mock exposes the paths from the OpenAPI `paths` section directly,
for example `http://127.0.0.1:4010/notes`. Use
`Prefer: code=<status>` to select a documented negative response when needed.

## Known non-blocking warning

Redocly reports one warning that the academic-project license entry has no URL.
It does not invalidate the OpenAPI document and does not block this gate.

## Follow-up

Implementing the approved operations and integrating them with the mobile
client is deferred to the next laboratory work.
