# ThreadNote — Software Requirements Specification (SRS) v1

## 1. Purpose

This document defines the initial functional and non-functional requirements for the first release of ThreadNote, a mobile-first local-first PKM application for Markdown notes, backlinks, and a lightweight knowledge graph.

The target platform is React Native / Expo running on mobile devices. The first version is intentionally limited to local, offline-capable usage without cloud synchronization.

## 2. Product scope

ThreadNote v1 supports:
- creating and editing Markdown notes;
- local-first storage in the application sandbox;
- internal note links in the form `[[NoteName]]`;
- automatic backlink generation;
- lightweight graph visualization around the active note;
- full-text search by title and contents;
- tag-based filtering;
- note navigation via list, backlinks, and graph;
- manual export/import for backup purposes.

The following are explicitly excluded from v1:
- cloud sync;
- real-time collaborative editing;
- external cloud export integrations;
- multi-project or multi-space architecture;
- advanced semantic graph types beyond note-to-note links.

## 3. Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-01 | The system shall allow users to create, open, edit, and delete notes. | Must |
| FR-02 | Each note shall include the following fields: `id`, `title`, `body`, `tags`, `createdAt`, `updatedAt`, and `backlinks`. | Must |
| FR-03 | The note title shall be mandatory. If empty, the system shall generate a placeholder title based on date or initial words. | Must |
| FR-04 | The system shall support Markdown editing for basic syntax, including headings, lists, emphasis, quotes, and paragraphs. | Must |
| FR-05 | The system shall recognize internal links in the format `[[NoteName]]`. | Must |
| FR-06 | When the user selects a link to a note that does not exist, the system shall create a new empty draft/placeholder note automatically. | Must |
| FR-07 | The system shall automatically generate backlinks for notes that reference the current note and display them in a dedicated “Backlinks” section in the note view. | Must |
| FR-08 | The system shall allow switching between Markdown editing mode and preview mode. | Must |
| FR-09 | The editor shall support autocompletion for note references when the user types `[[]`. | Must |
| FR-10 | The system shall provide full-text search by note title and note content. | Must |
| FR-11 | The system shall support filtering notes by tags. | Must |
| FR-12 | The system shall allow users to navigate between linked notes via backlinks and graph nodes. | Must |
| FR-13 | The system shall render an interactive knowledge graph around the active note as an ego-network (central note plus first-level neighbors). | Must |
| FR-14 | Clicking a graph node shall display the node title and allow transition to the corresponding note. | Must |
| FR-15 | The graph shall support basic mobile interaction, including zoom and pan. | Must |
| FR-16 | The system shall sort search results by recency and relevance. | Must |
| FR-17 | The system shall allow users to manually export notes to a backup format and import them back into the application. | Must |
| FR-18 | Deleting a note shall require explicit confirmation before the action is finalized. | Must |

## 4. Non-Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-01 | The application shall operate fully offline and without network access. | Must |
| NFR-02 | The app shall store all note data locally in the application sandbox. | Must |
| NFR-03 | The application shall remain responsive for up to 500 notes in normal mobile usage conditions. | Must |
| NFR-04 | Search and graph rendering shall remain smooth on a mid-range mobile device without noticeable UI lag. | Must |
| NFR-05 | The application shall support a fast cold start when launched in offline mode. | Must |
| NFR-06 | The local data model shall be resilient to normal user operations such as edits, note creation, and deletion without data corruption. | Must |
| NFR-07 | The export/import workflow shall be simple enough for a non-technical user to perform manual backups. | Should |
| NFR-08 | The UI shall provide an understandable and consistent layout across common mobile screen sizes. | Should |

## 5. Constraints and Assumptions

| ID | Constraint / Assumption |
| --- | --- |
| C-01 | The system shall use local-first storage in the application sandbox; no cloud backend is included in v1. |
| C-02 | Graph data is a derived structure generated from Markdown internal links; no separate graph edge storage is required in v1. |
| C-03 | Backlinks are stored as metadata in the note model and also rendered as a visible UI block. |
| C-04 | Standard `[[NoteName]]` links are supported; alias syntax such as `[[NoteName|Alias]]` is not required in v1. |
| C-05 | The knowledge graph is limited to note-to-note relationships and does not include advanced semantic node types. |
| C-06 | The graph view is intentionally limited to the active note and first-degree neighbors; it does not render all notes in the repository at once. |
| C-07 | Additional encryption of the local database is not required in v1 because data stays on-device and is not transmitted over the network. |
| C-08 | The product scope includes a single default notebook space; multiple independent projects or spaces are out of scope for v1. |
| C-09 | The system assumes a single active note can be opened and edited at one time. |

## 6. Out of Scope

| ID | Excluded Item |
| --- | --- |
| OOS-01 | Cloud synchronization between devices and accounts. |
| OOS-02 | Real-time collaborative editing. |
| OOS-03 | Integration with third-party cloud storage services. |
| OOS-04 | Multiple independent note spaces or projects. |
| OOS-05 | Advanced semantic typing of graph nodes and edges. |
| OOS-06 | Advanced NLP-based knowledge extraction, entity recognition, or AI-assisted linking. |
| OOS-07 | Advanced database encryption or enterprise-grade security controls. |
| OOS-08 | Full-graph visualization of all notes at once. |
| OOS-09 | Automated semantic conflict resolution across distributed copies. |

## 7. Functional decomposition and user scenarios

### 7.1 Note creation and editing
The user can create a note, set a title, and edit the Markdown body. If the title is empty, the system creates a placeholder automatically.

### 7.2 Linking and backlinks
The user enters `[[NoteName]]` into the note body. The system recognizes it as an internal note reference. When the target note does not exist, the system creates a placeholder note. The current note is then linked to that target. The system also updates the target note’s backlink section to include the current note.

### 7.3 Search and filtering
The user can search by note title and content. The system can also filter by tags. Search results are sorted by relevance and recency.

### 7.4 Graph navigation
The user opens a note and views a graph centered on it. Only the active note and its first-level neighbors are displayed. The user can tap on a neighbor node to open the corresponding note.

### 7.5 Backup and safety
The user can export notes to a backup file and later import them back. Deletion actions require explicit confirmation to reduce accidental data loss.

## 8. Acceptance summary

The v1 release is considered complete when the following are verified:
- notes can be created, edited, filtered, and searched;
- `[[NoteName]]` links are parsed and processed;
- missing links create placeholder notes;
- backlinks are generated and displayed;
- the graph view shows an active-note ego-network;
- offline local-first use works without cloud services;
- manual export/import and delete confirmation are implemented.

## 9. Open questions for future versions

The following items are intentionally deferred beyond v1:
- cloud synchronization;
- collaborative editing;
- advanced graph semantics;
- multi-project organization;
- AI-assisted links and summaries.
