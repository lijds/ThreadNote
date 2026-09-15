# Concept: ThreadNote (Personal Knowledge Management Mobile System)

## 1. Overview
Lalala is a cross-platform mobile application built with React Native and Expo, designed for personal knowledge management (PKM). It serves as a digital "second brain," enabling users to capture notes in Markdown, link related ideas using bidirectional references, and visualize their knowledge base as an interactive graph.

## 2. Core Features
- **Markdown Note Editor:** Create, edit, and store individual notes locally with clean syntax support and a quick-toolbar for formatting.
- **Wikilink & Backlink Support:** Seamlessly connect notes using double-bracket syntax (`[[Note Name]]`). The system automatically parses links to generate a real-time list of incoming references (backlinks).
- **Interactive Knowledge Graph:** A visual web-view module powered by D3.js/vis-network that renders notes as interconnected nodes and edges, allowing users to explore conceptual clusters.
- **Local-First Storage:** Secure local file management utilizing Expo File System to ensure user data privacy and portability.

## 3. Technology Stack
- **Framework:** React Native with Expo (TypeScript)
- **Local Storage:** Expo File System & SQLite for relational link caching
- **Graph Visualization:** D3.js / vis-network rendered via WebView