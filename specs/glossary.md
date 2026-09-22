# ThreadNote — Glossary of Domain Terms

## 1. Overview

This glossary defines the core domain concepts used in the ThreadNote project specification. It is intended to support consistent communication between product, engineering, and academic review stakeholders.

## 2. Terms

### 2.1 Application Sandbox
A protected local storage area assigned to the mobile application by the operating system. In v1, the app stores all note data in this sandbox and does not rely on external cloud storage.

### 2.2 Backlink
A reverse reference from a note that points to the current note. For example, if Note A contains `[[Note B]]`, then Note B has a backlink from Note A. Backlinks are explicitly displayed in the note interface in v1.

### 2.3 Ego-network
A local subgraph centered on a selected node, showing the node and its immediate neighbors. In ThreadNote v1, the graph view is restricted to the active note and its first-level related notes.

### 2.4 Graph of Knowledge
A visual or logical representation of relationships between notes. In v1, this graph is derived from internal Markdown links and is shown as a lightweight mobile-friendly network graph.

### 2.5 Internal Link
A reference within a note body written in the format `[[NoteName]]`. Internal links are interpreted by the app as connections between notes.

### 2.6 Knowledge Management System (PKM)
A personal knowledge management system that helps users capture, connect, search, and revisit information. ThreadNote is designed as a mobile PKM tool for Markdown-based note-taking and relationship mapping.

### 2.7 Local-first
An architecture model where the application stores and processes the primary data on the user’s device, with no mandatory cloud dependency. In v1, all primary data is local-first and fully offline-capable.

### 2.8 Markdown
A lightweight markup language used for formatting plain-text notes. ThreadNote supports a subset of Markdown required for note editing and preview.

### 2.9 Note
The main unit of information in ThreadNote. A note contains a title, body in Markdown, metadata, tags, timestamps, and backlinks.

### 2.10 Placeholder / Draft
A temporary note created automatically when a user follows a link to a note that does not yet exist. This is an explicit requirement for v1.

### 2.11 Search Index
A local in-memory or persisted index used to quickly search notes by title and body. In v1, the index is maintained from the current local database state in real time.

### 2.12 Tag
A keyword or label assigned to a note to support classification and filtering. Tags are part of the note metadata and are used in the local search and filtering functions.

### 2.13 Traceability Matrix
A structured table that maps requirements to their source, implementation area, validation method, and priority. It supports requirement verification and change impact analysis.

### 2.14 v1 (First Version / MVP)
The initial release scope of ThreadNote. It includes core local note-taking, Markdown editing, internal links, backlinks, an ego-network knowledge graph, and offline search.

## 3. Related concepts

### 3.1 Link Resolution
The process of resolving an internal `[[NoteName]]` reference to a note or placeholder/draft.

### 3.2 Derived Structure
A structure computed from existing note content, rather than stored as a separate database entity. In v1, the graph is derived from note links.

### 3.3 Offline Mode
The app state in which the user can create, edit, view, and search notes without an internet connection.

## 4. Domain assumptions

- The main information unit is the note.
- Relationships are primarily established through Markdown links.
- The system prioritizes local control, privacy, and offline usability.
- The v1 graph is intentionally lightweight and does not model advanced semantic relationship types.

## 5. Summary

The domain vocabulary of ThreadNote centers on notes, links, backlinks, local-first storage, and a lightweight graph of knowledge that emerges from note relationships. These concepts form the basis of the SRS, traceability matrix, and product architecture decisions for v1.
