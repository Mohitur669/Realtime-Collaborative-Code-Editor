# Sync Code — Realtime Collaborative Code Editor

A modern, real-time collaborative code editor built as a **TypeScript monorepo** using **pnpm workspaces** and **Turborepo**. Features CRDT-based conflict-free document synchronization, multi-file project workspaces, live video/audio calling, session recording & replay, AI pair programming, and a shared collaborative whiteboard.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![NestJS](https://img.shields.io/badge/NestJS-10-e0234e?logo=nestjs)
![Yjs](https://img.shields.io/badge/Yjs-CRDT-green)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)
![pnpm](https://img.shields.io/badge/pnpm-9-f69220?logo=pnpm)
![License](https://img.shields.io/badge/License-GPLv3-blue)

---

## Features

- **Realtime CRDT Collaboration** — Powered by [Yjs](https://yjs.dev/) and [Hocuspocus](https://tiptap.dev/hocuspocus) for conflict-free document sync across multiple clients with no merge conflicts.
- **Multi-file Project Workspace** — File tree with real-time CRUD, tab switching, CodeMirror 6 editor with syntax highlighting for 20+ languages, and ZIP import/export.
- **Presence & Cursor Tracking** — Live avatar badges showing active users and which files they're editing.
- **Realtime Text Chat** — Markdown message rendering, `@username` mention notifications, and chat history backfill on join.
- **LiveKit Audio & Video Calls** — SFU-based video/voice chat, screen sharing, and participant controls powered by [LiveKit](https://livekit.io/).
- **Session Recording & Replay** — Capture canvas recordings as `.webm` video and replay with interactive scrubber and playback speed controls (1×, 2×, 4×).
- **AI Pair Programmer** — Code explanation, refactoring, bug fixes, and custom generation with one-click editor insertion. Supports Anthropic and OpenAI providers.
- **Collaborative Whiteboard** — Shared real-time canvas with pencil, rectangle, circle, and text tools, color palette, and PNG export.
- **Admin Controls** — Room host can mute/unmute and remove participants.
- **Snapshot & Persistence** — Background CRDT state snapshotting with database persistence.
- **JWT Authentication** — Token-based session management.
- **Dark Mode** — Toggle between dark and light editor themes.

---

## Tech Stack

| Layer          | Technology                                                      |
| :------------- | :-------------------------------------------------------------- |
| Frontend       | React 18, TypeScript, Vite, Tailwind CSS, CodeMirror 6, Zustand |
| Backend API    | NestJS 10, Socket.IO, TypeScript                                |
| CRDT Server    | Hocuspocus (Yjs), WebSocket                                     |
| Video/Audio    | LiveKit (SFU), `@livekit/components-react`                      |
| AI             | Anthropic Claude, OpenAI (configurable)                         |
| Database       | PostgreSQL                                                      |
| Cache          | Redis                                                           |
| Object Storage | MinIO (local) / S3 / R2 (production)                            |
| Monorepo       | pnpm workspaces, Turborepo                                      |
| Testing        | Vitest                                                          |

---

## Monorepo Structure

```
code-editor/
├── apps/
│   ├── client/            React 18 + Vite + Tailwind CSS + CodeMirror 6
│   ├── api/               NestJS — REST API, Auth, Chat, AI proxy, LiveKit tokens
│   └── collab/            Hocuspocus (Yjs) CRDT document sync server
├── packages/
│   ├── shared-types/      Shared TypeScript DTOs, socket event contracts, schemas
│   └── ui/                Shared React component primitives & panel designs
├── infra/
│   └── docker-compose.yml PostgreSQL, Redis, MinIO, LiveKit orchestration
└── legacy/                Preserved original CRA + Express codebase (reference only)
```

---

## Prerequisites

- **Node.js** `v18.0.0` or higher
- **pnpm** `v9.0.0` or higher — install with `npm i -g pnpm`
- **Docker & Docker Compose** _(optional — for the full containerized stack)_

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Mohitur669/code-editor.git
cd code-editor
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

| Variable              | Description                         |
| :-------------------- | :---------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string        |
| `REDIS_URL`           | Redis connection string             |
| `JWT_SECRET`          | Secret for JWT token signing        |
| `AI_DEFAULT_PROVIDER` | `anthropic` or `openai`             |
| `ANTHROPIC_API_KEY`   | Anthropic API key (if using Claude) |
| `OPENAI_API_KEY`      | OpenAI API key (if using GPT)       |
| `LIVEKIT_API_KEY`     | LiveKit API key                     |
| `LIVEKIT_API_SECRET`  | LiveKit API secret                  |
| `S3_ACCESS_KEY`       | MinIO / S3 access key               |
| `S3_SECRET_KEY`       | MinIO / S3 secret key               |

### 3. Start Development Servers

```bash
pnpm dev
```

This starts all three services simultaneously via Turborepo:

| Service            | URL                     |
| :----------------- | :---------------------- |
| Client App         | `http://localhost:5173` |
| NestJS API         | `http://localhost:3001` |
| Collab CRDT Server | `ws://localhost:1234`   |
| LiveKit SFU        | `ws://localhost:7880`   |

Open `http://localhost:5173` to create or join a collaboration room.

---

## Development Commands

| Command                              | Description                                   |
| :----------------------------------- | :-------------------------------------------- |
| `pnpm dev`                           | Start all dev servers (client + api + collab) |
| `pnpm build`                         | Build all packages and apps for production    |
| `pnpm test`                          | Run all unit and integration tests            |
| `pnpm lint`                          | Lint all packages                             |
| `pnpm format`                        | Format all files with Prettier                |
| `pnpm --filter @codesync/client dev` | Start only the client                         |
| `pnpm --filter @codesync/api dev`    | Start only the API server                     |
| `pnpm --filter @codesync/collab dev` | Start only the CRDT server                    |

---

## Running Tests

Run the full test suite across all packages:

```bash
pnpm test
```

Run tests for a specific package:

```bash
pnpm --filter @codesync/api test      # API tests (auth, gateway, AI, recordings, persistence, LiveKit)
pnpm --filter @codesync/collab test    # CRDT collaboration tests
```

---

## Docker Compose

Launch the complete stack in containers:

```bash
docker compose up --build
```

Services:

| Service           | Port                    |
| :---------------- | :---------------------- |
| Web Client        | `http://localhost:5173` |
| NestJS API        | `http://localhost:3001` |
| Hocuspocus Server | `ws://localhost:1234`   |
| LiveKit SFU       | `ws://localhost:7880`   |
| PostgreSQL        | `localhost:5432`        |
| Redis             | `localhost:6379`        |
| MinIO             | `localhost:9000`        |

---

## Contributing

All contributions must follow the rules defined in [AGENTS.md](AGENTS.md):

1. **Shared types first** — Shared logic, DTOs, and schemas go in `packages/shared-types` or `packages/ui`. No duplicating concerns across apps.
2. **Strict type contracts** — Every socket event, payload, and API endpoint must be fully typed in `shared-types` before use.
3. **No fallow dependencies** — Every added dependency must be actively used.
4. **Build & test gate** — `pnpm build` and `pnpm test` must pass before any merge.
5. **No in-browser code execution** — Running user code is explicitly out of scope.

---

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
