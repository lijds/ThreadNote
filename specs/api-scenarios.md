# ThreadNote API mock scenarios

These scenarios validate the OpenAPI contract in `specs/openapi.yaml`.
They are intended for execution against an OpenAPI mock server. The current
laboratory scope includes mock validation only; no server implementation is
required.

## Positive scenarios

| ID | Operation | Request | Expected result |
| --- | --- | --- | --- |
| API-P01 | Create a note | `POST /api/v1/notes` with `body` and `tags` | `201 Created`; response contains `id`, generated or supplied `title`, timestamps, and backlinks |
| API-P02 | Get a note | `GET /api/v1/notes/{noteId}` for an existing ID | `200 OK`; response conforms to `Note` |
| API-P03 | Update a note | `PATCH /api/v1/notes/{noteId}` with a new body | `200 OK`; response contains the updated body and `updatedAt` |
| API-P04 | List recent notes | `GET /api/v1/notes?sort=recency` | `200 OK`; response contains paginated `items` |
| API-P05 | Search by title/body | `GET /api/v1/notes?query=project&sort=relevance` | `200 OK`; matching notes are returned |
| API-P06 | Filter by tag | `GET /api/v1/notes?tag=work` | `200 OK`; every returned note contains the requested tag |
| API-P07 | Get backlinks | `GET /api/v1/notes/{noteId}/backlinks` | `200 OK`; response contains `noteId` and backlink items |
| API-P08 | Resolve an existing link | `POST /api/v1/notes/{noteId}/links/resolve` with `targetTitle` of an existing note | `200 OK`; `created` is `false` and the target note is returned |
| API-P09 | Resolve a missing link | `POST /api/v1/notes/{noteId}/links/resolve` with a new `targetTitle` | `201 Created`; `created` is `true` and a placeholder note is returned |
| API-P10 | Get the ego-network | `GET /api/v1/notes/{noteId}/graph?depth=1` | `200 OK`; response contains the center node, first-degree nodes, and edges |
| API-P11 | Export backup | `GET /api/v1/backup/export` | `200 OK`; response conforms to `BackupDocument` |
| API-P12 | Import backup | `POST /api/v1/backup/import` with a valid `BackupDocument` | `200 OK`; response reports imported, skipped, and failed items |
| API-P13 | Delete with confirmation | `DELETE /api/v1/notes/{noteId}?confirm=true` | `204 No Content` |

## Negative scenarios

| ID | Operation | Request | Expected result |
| --- | --- | --- | --- |
| API-N01 | Get an unknown note | `GET /api/v1/notes/unknown-id` | `404 Not Found`; response conforms to `Error` |
| API-N02 | Update an unknown note | `PATCH /api/v1/notes/unknown-id` | `404 Not Found`; response conforms to `Error` |
| API-N03 | Delete without confirmation | `DELETE /api/v1/notes/{noteId}?confirm=false` | `409 Conflict`; deletion is not performed |
| API-N04 | Delete with a missing confirmation parameter | `DELETE /api/v1/notes/{noteId}` | `400 Bad Request`; deletion is not performed |
| API-N05 | Create without body | `POST /api/v1/notes` with an empty JSON object | `422 Unprocessable Entity`; validation error is returned |
| API-N06 | Resolve an empty link | `POST /api/v1/notes/{noteId}/links/resolve` with `targetTitle: ""` | `400 Bad Request` or `422 Unprocessable Entity`; validation error is returned |
| API-N07 | Use an invalid sort value | `GET /api/v1/notes?sort=unknown` | `400 Bad Request`; response conforms to `Error` |
| API-N08 | Use an invalid graph depth | `GET /api/v1/notes/{noteId}/graph?depth=2` | `400 Bad Request`; v1 allows only depth `1` |
| API-N09 | Import malformed backup | `POST /api/v1/backup/import` with missing `version` or `notes` | `422 Unprocessable Entity`; validation error is returned |
| API-N10 | Import conflicting data | `POST /api/v1/backup/import` with conflicting note IDs | `409 Conflict`; response conforms to `Error` |
| API-N11 | Delete an unknown note | `DELETE /api/v1/notes/unknown-id?confirm=true` | `404 Not Found`; no data is changed |

## Common error response

```json
{
  "code": "NOTE_NOT_FOUND",
  "message": "Note was not found",
  "details": []
}
```

## Mock execution

The scenarios should be executed against a mock generated from
`specs/openapi.yaml`, for example with Stoplight Prism:

```text
npx.cmd --yes @stoplight/prism-cli@latest mock specs/openapi.yaml --host 127.0.0.1 --port 4010 --dynamic
```

The mock is used to validate request/response shapes and documented status
codes. It does not implement note persistence or business logic.

Prism exposes the paths from the `paths` section directly, so the mock URLs
use `http://127.0.0.1:4010/notes` rather than the `/api/v1` server base URL.
When a negative scenario has more than one documented response, send the
header `Prefer: code=<expected-status>` to select that status in the mock.
