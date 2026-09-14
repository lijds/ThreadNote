# Coding Agent Profile & Capabilities

## 1. Tool Classification
- **Tool Name:** Roo Code (VS Code Extension) powered by Google Gemini (`gemini-3-flash-preview` / Google AI Studio API)
- **Tool Class:** IDE-integrated, LLM-powered autonomous coding agent capable of executing file operations, shell commands, and structured workspace navigation.

## 2. Repository Access Method
- **Access Type:** Direct workspace and local file-system interaction via extension permissions.
- **Details:** The agent connects to the local Git repository through the VS Code extension interface using an authorized API key from Google AI Studio. It reads local files, indexes directories, and proposes or applies code patches directly within the working tree.

## 3. Permitted Workspace Operations
- **File & Directory Management:** Creating, reading, editing, and deleting files across structural directories (`/spec`, `/src`, `/tests`, `/docs`, `/logs`).
- **Command Line Execution:** Running terminal commands (such as testing, package management, and Git workflows) under user approval.
- **Version Control Guidance:** Assisting with repository initialization, staging, committing, and remote synchronization.