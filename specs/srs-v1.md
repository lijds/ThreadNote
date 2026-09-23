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

## 3. Definitions and domain terms

The following terms are used throughout this document:
- Note: the main information unit in the system. A note contains a title, Markdown content, tags, timestamps, and backlinks.
- Backlink: a reverse reference from a note to the current note.
- Internal link: a reference in the form `[[NoteName]]` used to connect notes.
- Placeholder / draft: an automatically created new note used when a link points to a non-existing note.
- Knowledge graph: a graph of note-to-note relationships derived from Markdown links.
- Ego-network: a local graph view centered on the active note and its first-degree neighbors.
- Local-first: all primary data is stored and processed on the user device.

## 4. General description

### 4.1 System context and product perspective
ThreadNote is a standalone mobile application for personal knowledge management. It is designed to help users capture notes, discover relationships between them, and navigate information via backlinks and local graph structure. The application operates independently of cloud services in v1 and relies on local storage and device-native execution.

### 4.2 User classes and roles
The v1 system defines a single user role:
- End-User: a person who creates, edits, searches, filters, and navigates between personal notes on a mobile device.

No additional administrator, collaborator, or multi-user role is defined for v1.

### 4.3 Interfaces and screens in v1
The application shall provide the following screens and interface areas:
- notes list screen;
- note editor and preview screen;
- backlink panel inside the note view;
- search and tag filter panel;
- graph visualization screen for the active-note ego-network;
- manual export/import flow for local backup and recovery.

The system is limited to Mobile UI on React Native / Expo Go. No web or desktop client is included in v1, and no external API is required for the core product operation.

### 4.4 Assumptions and dependencies
- The application will operate on a mobile device with local storage access in the application sandbox.
- The system assumes users work with a single local notebook space.
- The system depends on the platform’s ability to store and retrieve local files and database records.
- Offline access is a required product condition.

## 5. Functional Requirements

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

## 6. Behavioral Scenarios (Given–When–Then)

### 6.1 Create and edit a note
- Given the user is on the notes screen and has opened the “new note” action
- When the user enters a title and Markdown content and saves the note
- Then the system stores the note locally and displays it in the notes list with the provided metadata

### 6.2 Create a note from a missing internal link
- Given the user is viewing a note that contains `[[NoteName]]` and no note with that title exists
- When the user taps the unresolved link
- Then the system creates a new placeholder note, opens it for editing, and keeps the original link intact

### 6.3 Generate backlinks
- Given note A contains a valid internal link to note B
- When note B is opened
- Then the system displays a “Backlinks” section containing note A as a reference to note B

### 6.4 Search notes by title and content
- Given the user has multiple notes in the local database
- When the user enters a keyword into the search field
- Then the system returns matching notes sorted by relevance and recency

### 6.5 Filter notes by tag
- Given the user has notes tagged with different categories
- When the user selects a specific tag filter
- Then the system shows only notes associated with that tag

### 6.6 View the knowledge graph around the active note
- Given the user opens a note that has related notes
- When the graph view is activated
- Then the system displays an ego-network centered on the active note, showing the note and first-level neighbors only

### 6.7 Navigate through the graph
- Given the graph view is visible and contains related nodes
- When the user taps a node representing another note
- Then the system opens that note and updates the active context

### 6.8 Export and import backup data
- Given the user wants to create a manual backup of local notes
- When the user triggers export and saves the file
- Then the system generates a portable export and allows the user to restore it later through import

### 6.9 Delete a note safely
- Given the user selects a note for deletion
- When the user confirms the delete action
- Then the note is removed from the local store; otherwise, the action is canceled

## 7. Interface Requirements

### 7.1 Notes list interface
The notes list shall provide a clear overview of stored notes, allow sorting by recency, and support tag-based filtering.

### 7.2 Note editor and preview interface
The note screen shall allow users to switch between edit mode and preview mode. Markdown formatting shall be rendered in preview mode, and internal links shall be clickable.

### 7.3 Backlinks interface
Each note shall display a dedicated Backlinks section listing all notes that reference the current note.

### 7.4 Search and filter interface
The search panel shall support keyword search over titles and contents, and shall allow filtering by tags.

### 7.5 Graph interface
The graph screen shall render the active note and its immediate neighbors, allow tap interaction with nodes, and support mobile pan and zoom gestures.

### 7.6 Export and import interface
The system shall provide a simple manual import/export workflow for local backup and restore through the device’s local file environment.

## 8. Non-Functional Requirements

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

## 9. Constraints and Assumptions

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

## 10. Out of Scope

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

## 11. Functional decomposition and user scenarios

### 11.1 Note creation and editing
The user can create a note, set a title, and edit the Markdown body. If the title is empty, the system creates a placeholder automatically.

### 11.2 Linking and backlinks
The user enters `[[NoteName]]` into the note body. The system recognizes it as an internal note reference. When the target note does not exist, the system creates a placeholder note. The current note is then linked to that target. The system also updates the target note’s backlink section to include the current note.

### 11.3 Search and filtering
The user can search by note title and content. The system can also filter by tags. Search results are sorted by relevance and recency.

### 11.4 Graph navigation
The user opens a note and views a graph centered on it. Only the active note and its first-level neighbors are displayed. The user can tap on a neighbor node to open the corresponding note.

### 11.5 Backup and safety
The user can export notes to a backup file and later import them back. Deletion actions require explicit confirmation to reduce accidental data loss.

## 12. Acceptance criteria and verification

The v1 release is considered complete when all key behaviors have been validated through the scenarios below:

| Feature | Acceptance criterion |
| --- | --- |
| Note creation | A user can create a note, save it, and see it in the list with correct metadata. |
| Note editing | A user can edit the Markdown body and switch between edit and preview modes without losing content. |
| Internal links | A `[[NoteName]]` reference is recognized and resolved; if the target note does not exist, a placeholder note is created. |
| Backlinks | When a note is referenced by another note, the target note shows it in the Backlinks section. |
| Search and filter | A user can search by title and content and filter by tags with consistent results. |
| Graph | The graph view shows the active note and first-degree neighbors, and tapping a node opens the corresponding note. |
| Backup | The user can export notes to a backup file and restore them using the import flow. |
| Safety | Deleting a note requires confirmation and does not proceed without explicit user approval. |
| Offline use | The application remains functional without network connectivity. |

## 13. Open questions for future versions

The following items are intentionally deferred beyond v1:
- cloud synchronization;
- collaborative editing;
- advanced graph semantics;
- multi-project organization;
- AI-assisted links and summaries.
