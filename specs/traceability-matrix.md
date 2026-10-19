# ThreadNote v1 — Initial Traceability Matrix

## 1. Purpose

This matrix links the core requirements of ThreadNote v1 to the product decisions captured in the SKED process, and provides an initial basis for validation and future extension.

## 2. Requirement traceability table

| ID | Requirement summary | Source / rationale | Validation approach | Priority | Ідентифікатори тікетів (GitHub Issues) |
| --- | --- | --- | --- | --- | --- |
| **FR-01** | Create, edit, open, and delete notes | Core PKM functionality | Manual UI test / CRUD test | Must | `#1`, `#2` (`[FR-01]`) |
| **FR-02** | Note data model includes required fields | Product specification | Data model validation test | Must | `#3`, `#4` (`[FR-02]`), `#33` (`[TEST-01]`) |
| **FR-03** | Empty title auto-generates placeholder title | Product decision / UX requirement | Unit test for title normalization | Must | `#5` (`[FR-03]`), `#33` (`[TEST-01]`) |
| **FR-04** | Markdown editor supports core syntax | Product requirement | UI rendering test | Must | `#6` (`[FR-04]`), `#34` (`[TEST-02]`) |
| **FR-05** | Support internal links with `[[NoteName]]` syntax | Core knowledge-link feature | Parser test / integration test | Must | `#7`, `#8` (`[FR-05]`), `#35` (`[TEST-03]`) |
| **FR-06** | Missing note links create placeholder draft | SKED decision | Behavior test for unresolved links | Must | `#9` (`[FR-06]`), `#35` (`[TEST-03]`) |
| **FR-07** | Backlinks are generated and displayed | Required product feature | Link graph test / UI test | Must | `#10`, `#11` (`[FR-07]`), `#36` (`[TEST-04]`) |
| **FR-08** | Edit and preview modes are available | User experience requirement | UI toggle test | Must | `#12` (`[FR-08]`), `#34` (`[TEST-02]`) |
| **FR-09** | Autocomplete appears for `[[` input | UX requirement | Input test | Must | `#13` (`[FR-09]`), `#35` (`[TEST-03]`) |
| **FR-10** | Full-text search by title and content | Core note retrieval | Search test | Must | `#14` (`[FR-10]`), `#37` (`[TEST-05]`) |
| **FR-11** | Filter by tags | Product requirement | Filter test | Must | `#15` (`[FR-11]`), `#37` (`[TEST-05]`) |
| **FR-12** | Navigate via backlinks and graph | Core knowledge navigation | UI interaction test | Must | `#16`, `#17` (`[FR-12]`), `#36`, `#38` (`[TEST-04`, `TEST-06]`) |
| **FR-13** | Render ego-network around active note | Graph scope decision | UI and graph rendering test | Must | `#18` (`[FR-13]`), `#38` (`[TEST-06]`) |
| **FR-14** | Graph node click opens note | UX requirement | Interaction test | Must | `#19` (`[FR-14]`), `#38` (`[TEST-06]`) |
| **FR-15** | Graph zoom and pan supported | Mobile UX requirement | Gesture test | Must | `#20` (`[FR-15]`), `#38` (`[TEST-06]`) |
| **FR-16** | Search results sorted by recency and relevance | Product requirement | Search ranking check | Must | `#21` (`[FR-16]`), `#37` (`[TEST-05]`) |
| **FR-17** | Manual export/import support | Backup and safety requirement | Import/export test | Must | `#22`, `#23` (`[FR-17]`), `#39` (`[TEST-07]`) |
| **FR-18** | Delete action requires confirmation | Safety requirement | Delete confirmation test | Must | `#24` (`[FR-18]`), `#40` (`[TEST-08]`) |
| **NFR-01** | Offline local-first operation | Core architecture decision | Offline mode validation | Must | `#25` (`[NFR-01]`), `#41` (`[TEST-09]`) |
| **NFR-02** | Local storage in application sandbox | Platform constraint | Storage validation | Must | `#26` (`[NFR-02]`) |
| **NFR-03** | Performance for up to 500 notes | Product scale assumption | Performance benchmark | Must | `#27` (`[NFR-03]`), `#41` (`[TEST-09]`) |
| **NFR-04** | Search and graph rendering remain smooth | UX/NFR requirement | Performance profiling | Must | `#28` (`[NFR-04]`), `#41` (`[TEST-09]`) |
| **NFR-05** | Fast cold start in offline mode | Product requirement | Startup timing test | Must | `#29` (`[NFR-05]`), `#41` (`[TEST-09]`) |
| **NFR-06** | Local data integrity protection | Data safety | Integrity test | Must | `#30` (`[NFR-06]`), `#41` (`[TEST-09]`) |
| **NFR-07** | Backup usability for non-experts | UX requirement | Usability check | Must | `#31` (`[NFR-07]`), `#39` (`[TEST-07]`) |
| **NFR-08** | Responsive mobile layout | Mobile design | UI layout test | Must | `#32` (`[NFR-08]`), `#41` (`[TEST-09]`) |
| **C-01 — C-07** | Архітектурні обмеження та дизайн-рішення v1 | Architecture review | Architectural review | Must | Забезпечується через загальну архітектуру та гейти (`#42`, `#43`) |
| **OOS-01 — OOS-06** | Виключені з v1 функції (хмарне сховище, AI тощо) | Scope review | Scope exclusion | Excluded | Виключено з плану реалізації v1 |
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
