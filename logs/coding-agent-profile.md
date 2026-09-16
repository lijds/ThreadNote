# Coding Agent Profile & Capabilities

## 1. Tool Classification
- **Tool Name:** GitHub Copilot in Visual Studio Code
- **Tool Class:** IDE-integrated AI coding assistant that analyzes the workspace, explains code, proposes focused changes, and validates implementation results.

## 2. Repository Access Method
- **Access Type:** Direct interaction with the currently opened workspace through VS Code tools.
- **Details:** The agent reads relevant project files, searches for definitions and references, applies targeted patches, and works with the existing Git working tree without discarding unrelated user changes.

## 3. Workspace Operations
- **File Management:** Reading and editing project files in directories such as `/spec`, `/src`, `/tests`, `/docs`, and `/logs`.
- **Validation:** Running focused tests, type checks, linters, and other available diagnostics after changes.
- **Terminal and Git:** Executing repository commands when needed, including inspection of history and status. Commits, pushes, and other remote operations are performed only when explicitly requested.
- **Engineering Support:** Helping with implementation, debugging, documentation, code review, and incremental repository maintenance while following the project guidelines.