# ThreadNote v1 — Initial Traceability Matrix

## 1. Purpose

This matrix links the core requirements of ThreadNote v1 to the product decisions captured in the SKED process, and provides an initial basis for validation and future extension.

## 2. Requirement traceability table

| ID | Requirement summary | Source / rationale | Validation approach | Priority |
| --- | --- | --- | --- | --- |
| FR-01 | Create, edit, open, and delete notes | Core PKM functionality | Manual UI test / CRUD test | Must |
| FR-02 | Note data model includes required fields | Product specification | Data model validation test | Must |
| FR-03 | Empty title auto-generates placeholder title | Product decision / UX requirement | Unit test for title normalization | Must |
| FR-04 | Markdown editor supports core syntax | Product requirement | UI rendering test | Must |
| FR-05 | Support internal links with `[[NoteName]]` syntax | Core knowledge-link feature | Parser test / integration test | Must |
| FR-06 | Missing note links create placeholder draft | SKED decision | Behavior test for unresolved links | Must |
| FR-07 | Backlinks are generated and displayed | Required product feature | Link graph test / UI test | Must |
| FR-08 | Edit and preview modes are available | User experience requirement | UI toggle test | Must |
| FR-09 | Autocomplete appears for `[[` input | UX requirement | Input test | Must |
| FR-10 | Full-text search by title and content | Core note retrieval | Search test | Must |
| FR-11 | Filter by tags | Product requirement | Filter test | Must |
| FR-12 | Navigate via backlinks and graph | Core knowledge navigation | UI interaction test | Must |
| FR-13 | Render ego-network around active note | Graph scope decision | UI and graph rendering test | Must |
| FR-14 | Graph node click opens note | UX requirement | Interaction test | Must |
| FR-15 | Graph zoom and pan supported | Mobile UX requirement | Gesture test | Must |
| FR-16 | Search results sorted by recency and relevance | Product requirement | Search ranking check | Must |
| FR-17 | Manual export/import support | Backup and safety requirement | Import/export test | Must |
| FR-18 | Delete action requires confirmation | Safety requirement | Delete confirmation test | Must |
| NFR-01 | Offline local-first operation | Core architecture decision | Offline mode validation | Must |
| NFR-02 | Local storage in application sandbox | Platform constraint | Storage validation | Must |
| NFR-03 | Performance for up to 500 notes | Product scale assumption | Performance benchmark | Must |
| NFR-04 | Search and graph rendering remain smooth | UX/NFR requirement | Performance profiling | Must |
| NFR-05 | Fast cold start in offline mode | Product requirement | Startup timing test | Must |
| C-01 | Local-only v1 architecture | Product decision | Architecture review | Must |
| C-02 | Graph is derived from note links | Design decision | Data-flow review | Must |
| C-03 | Backlinks are both metadata and UI-visible block | Product requirement | UI and data validation | Must |
| C-04 | `[[NoteName]]` syntax only; alias syntax excluded | Scope decision | Parser validation | Must |
| C-05 | Graph limited to note-to-note relationships | Scope decision | Graph design review | Must |
| C-06 | Graph shows only active note and first-neighbor nodes | Scope decision | UI review | Must |
| C-07 | No local DB encryption in v1 | Security assumption | Architecture review | Must |
| OOS-01 | No cloud sync | Explicit out-of-scope item | Scope review | Excluded |
| OOS-02 | No real-time collaboration | Explicit out-of-scope item | Scope review | Excluded |
| OOS-03 | No third-party cloud export integration | Explicit out-of-scope item | Scope review | Excluded |
| OOS-04 | No multi-project / multi-space structure | Explicit out-of-scope item | Scope review | Excluded |
| OOS-05 | No advanced semantic graph typing | Explicit out-of-scope item | Scope review | Excluded |
| OOS-06 | No AI-based graph extraction | Explicit out-of-scope item | Scope review | Excluded |

## 3. Coverage overview

The current matrix covers the core v1 scope:
- note lifecycle and data model;
- Markdown and internal linking;
- backlink generation and display;
- local-first storage and offline operation;
- search and filtering;
- graph navigation and interaction;
- safety and backup mechanisms;
- explicit exclusion of non-v1 features.

## 4. Traceability summary

This initial matrix is designed to support future development by linking each requirement to a clear product rationale and a likely validation method. It is intentionally lightweight and should be extended as the product architecture and UI design are refined.

## 5. Proposed evolution direction

For future iterations, this matrix can be expanded with:
- Requirement source (stakeholder / product decision / research insight);
- risk level;
- test case IDs;
- implementation module mapping;
- acceptance criteria per requirement.
