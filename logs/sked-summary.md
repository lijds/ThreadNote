# SKED Summary — ThreadNote v1

## 1. Objective

This summary captures the main outcomes of the SKED dialogue for the first version of ThreadNote. The goal was to define a realistic, academically acceptable starting point for the software requirements specification and the initial traceability matrix.

## 2. Confirmed architecture decisions

### 2.1 Storage and offline-first model
- v1 shall use local-first storage in the application sandbox.
- All notes, metadata, and search indexes are stored locally on the mobile device.
- Cloud synchronization is explicitly excluded from v1.
- Full offline support is a mandatory requirement.

### 2.2 Scope of v1
- Core v1 functionality includes note creation, Markdown editing, backlink support, knowledge graph viewing, and search.
- The system does not include real-time collaborative editing.
- Third-party cloud integration is out of scope.
- The first version is intentionally limited to a single, local knowledge space.

### 2.3 Knowledge graph definition
- The graph is a derived structure built from Markdown links in the form `[[NoteName]]`.
- The graph is not persisted separately as a set of edges in the database.
- The graph is rendered as an ego-network around the active note, with central note and first-level neighbors only.
- Cycles are allowed; the graph is not constrained to be acyclic.

### 2.4 Backlinks
- Backlinks are stored as metadata in the note model.
- Backlinks are also displayed in the UI as a dedicated visible section called “Backlinks”.
- This is a product requirement, not only a data structure detail.

### 2.5 Note linking behavior
- Link syntax is based on `[[NoteName]]`.
- When a referenced note does not exist, the system creates a placeholder draft automatically.
- The system does not require automatic renaming synchronization of links in v1.

### 2.6 Search and UI
- Search supports full-text matching for title and body.
- Tag filtering is required.
- Sorting is by recency and relevance.
- Graph interactions include tap-to-open, zoom, and pan.
- Only one active note is required on-screen at a time.

## 3. Functional decisions that were explicitly accepted

- Note model includes `id`, `title`, `body`, `tags`, `createdAt`, `updatedAt`, and `backlinks`.
- Title is mandatory and auto-generated if empty.
- Markdown preview and editor modes are both required.
- Autocomplete for `[[` is required.
- Manual export/import is required for backup and restore.
- Delete actions require confirmation.

## 4. Explicitly excluded functionality

The following features were intentionally excluded from v1 and should be tracked as future work or later releases:
- cloud synchronization;
- collaborative real-time editing;
- integration with external cloud storage or services;
- multi-space or multi-project organization;
- advanced semantic graph modeling;
- AI-based relationship extraction or automatic semantic linking;
- advanced database encryption or enterprise security features.

## 5. Initial assumptions for SRS and traceability

The SKED process established the following assumptions that should guide the formal requirement documents:
- v1 is a local-first, offline-capable mobile application;
- the knowledge graph is derived from Markdown links rather than stored as separate graph data;
- the graph is intentionally limited to the active note and its direct neighbors;
- backlinks are a visible product feature, not only internal metadata;
- product scope is intentionally narrow and feasible for a first release.

## 6. Result

The current SKED dialogue has produced a stable v1 baseline for requirements and traceability. This baseline is appropriate for documenting the initial SRS and for starting the matrix of traceability in a structured, academically acceptable form.
