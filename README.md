# Sync Code: Realtime Collaborative Code Editor

> **Sync Code** is an ultra-fast, modern, real-time collaborative code editor built as a TypeScript monorepo using **pnpm** and **Turborepo**. It features CRDT-based document synchronization, multi-file project workspaces, live video/audio calling, interactive session recordings replay, AI pair programming, and a shared collaborative whiteboard.

---

## 🚀 Features

- **⚡ Realtime CRDT Collaboration**: Powered by **Yjs** and **Hocuspocus** for conflict-free document synchronization across multiple active clients.
- **📁 Multi-file Project Workspace**: Tree view with real-time CRUD operations, file tab switching, and ZIP project import/export.
- **👥 Presence Bar & Cursor Tracking**: Visual badges showing real-time active users and their active files.
- **💬 Realtime Text Chat**: Markdown message rendering, `@username` mentions, and history backfill.
- **🎙️ LiveKit Audio & Video Call**: High-quality SFU video, voice chat, screen sharing, and participant controls.
- **📼 Session Recording & Replay**: Capture workspace events and replay them step-by-step with an interactive scrubber bar and playback speed controls (1x, 2x, 4x).
- **🤖 AI Pair Programmer**: Copilot assistance for code explanation, refactoring, bug fixes, and custom code generation with one-click editor insertion.
- **🎨 Collaborative Whiteboard**: Real-time canvas drawing with pencil, rectangle, circle, text tools, color palette, and PNG image export.
- **💾 Snapshot & Persistence Engine**: Background CRDT state snapshotting and persistence endpoints.
- **🔐 JWT Authentication**: Token issuance and session validation.

---

## 🏗️ Monorepo Architecture Layout

```
code-editor/
├── apps/
│   ├── client/          React 18 + TypeScript + Vite + Tailwind CSS + CodeMirror 6
│   ├── api/             NestJS + TypeScript — REST API, Auth, Chat, AI proxy, LiveKit tokens
│   └── collab/          Node.js + TypeScript — Hocuspocus (Yjs) server for CRDT doc sync
├── packages/
│   ├── shared-types/    Shared TypeScript DTOs, event contracts & schema types
│   └── ui/              Shared React design system primitives & tab panels
├── infra/
│   └── docker-compose.yml PostgreSQL, Redis, MinIO, LiveKit SFU container orchestration
└── legacy/              Preserved CRA + Express codebase reference
```

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher
- **pnpm**: `v8.0.0` or higher (`npm i -g pnpm`)
- **Docker & Docker Compose** *(optional, for full containerized stack execution)*

---

## ⚙️ Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Mohitur669/Realtime-Collaborative-Code-Editor.git
cd code-editor
pnpm install
```

### 2. Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env
```

Default local service ports:
- **Client App**: `http://localhost:5173`
- **NestJS API**: `http://localhost:3000`
- **Collab CRDT Server**: `ws://localhost:1234`
- **LiveKit SFU Server**: `ws://localhost:7880`

### 3. Run Development Servers

Start all application development servers simultaneously via Turborepo:

```bash
pnpm dev
```

Open your browser and navigate to `http://localhost:5173` to join or create a collaboration room!

---

## 🛠️ Monorepo Development Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts development servers for `apps/client`, `apps/api`, and `apps/collab` |
| `pnpm build` | Builds production bundles for all packages and apps via Turborepo |
| `pnpm test` | Executes unit and integration test suites across all packages |
| `pnpm --filter @codesync/client dev` | Starts only the client web application |
| `pnpm --filter @codesync/api dev` | Starts only the NestJS backend API |
| `pnpm --filter @codesync/collab dev` | Starts only the Hocuspocus CRDT server |

---

## 🧪 Running Tests

To run all unit and integration tests across the monorepo:

```bash
pnpm test
```

Specific package testing:

```bash
pnpm --filter @codesync/api test
pnpm --filter @codesync/collab test
```

---

## 🐳 Running via Docker Compose

To launch the complete infrastructure stack (PostgreSQL, Redis, MinIO, LiveKit SFU, API, Collab, Client) in containerized mode:

```bash
docker compose up --build
```

Access the stack at:
- **Web Client**: `http://localhost:5173`
- **NestJS API**: `http://localhost:3000`
- **Hocuspocus Server**: `http://localhost:1234`
- **LiveKit Server**: `http://localhost:7880`

---

## 📜 Development Guidelines

All contributions must follow the architectural constraints defined in [AGENTS.md](file:///Users/mohitur/Desktop/git-projects/code-editor/AGENTS.md):
- **Shared Types First**: Shared logic and schemas must reside in `packages/shared-types` or `packages/ui`.
- **No Code Execution**: In-browser code execution is explicitly out of scope for security.
- **Build & Test Gate**: Every phase must pass `pnpm build` and `pnpm test` cleanly.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
