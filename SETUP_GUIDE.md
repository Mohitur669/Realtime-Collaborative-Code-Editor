# Realtime Collaborative Code Editor — Setup & Development Guide

Welcome to the Realtime Collaborative Code Editor monorepo. This guide provides step-by-step instructions to set up, configure, build, run, and test the entire application stack.

---

## 1. Prerequisites

Before running the application, ensure you have the following installed on your machine:

- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **pnpm**: `v8.x` or `v9.x` (`npm i -g pnpm`)
- **Docker & Docker Compose**: Required for running Redis, Postgres, MinIO, and LiveKit local services.
- **Git**: For version control.

---

## 2. Monorepo Architecture Overview

This project is structured as a pnpm workspace + Turbo monorepo:

| Package | Path | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
| `@codesync/client` | `apps/client` | Single Page Application (SPA) | React 18, Vite, CodeMirror 6, Yjs, Tailwind CSS |
| `@codesync/api` | `apps/api` | Backend REST API & Realtime Gateway | NestJS, Socket.io, Redis, Prisma, LiveKit SDK |
| `@codesync/collab` | `apps/collab` | CRDT Document Sync Server | Node.js, Hocuspocus (Yjs backend server) |
| `@codesync/shared-types` | `packages/shared-types` | Shared TypeScript contracts & DTOs | TypeScript |
| `@codesync/ui` | `packages/ui` | UI primitives & design components | React 18, Tailwind CSS |

---

## 3. Quick Start Guide

### Step 1: Install Dependencies

From the repository root:

```bash
pnpm install
```

### Step 2: Configure Environment Variables

Create environment configuration files for the API and Client applications if not already present:

**`apps/api/.env`**:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codesync?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_URL=ws://localhost:7880
COLLAB_SERVER_URL=ws://localhost:1235
```

**`apps/client/.env`**:
```env
VITE_API_URL=http://localhost:3001
VITE_COLLAB_URL=ws://localhost:1235
VITE_LIVEKIT_URL=ws://localhost:7880
```

### Step 3: Launch Local Infrastructure Services (Optional / Recommended)

To start Postgres, Redis, MinIO, and LiveKit via Docker Compose:

```bash
docker-compose -f infra/docker-compose.yml up -d
```

### Step 4: Run Development Mode

Start all applications (`apps/client`, `apps/api`, `apps/collab`) concurrently:

```bash
pnpm dev
```

Once running:
- **Frontend SPA**: Open [http://localhost:5173](http://localhost:5173) in your browser.
- **NestJS API**: Running on [http://localhost:3001](http://localhost:3001).
- **Hocuspocus CRDT Server**: Running on `ws://localhost:1235`.

---

## 4. Building & Testing

### Build All Packages

To compile TypeScript and build production bundles across all packages:

```bash
pnpm build
```

### Run Monorepo Test Suite

To run Vitest unit and integration test suites:

```bash
pnpm test
```

---

## 5. Application Features & Usage

1. **Multi-File Workspace Explorer**:
   - Create new files using `+`, select active files, delete files, export or import workspace `.zip` archives.
2. **Real-time CRDT Code Collaboration**:
   - Multi-user concurrent text editing powered by Yjs and Hocuspocus CRDT sync with live user presence carets.
3. **Session Recordings & Replay**:
   - Capture live workspace events (`code`, `chat`, `presence`), stop & save recordings, and replay timelines at 1x, 2x, or 4x speed.
4. **Full App Light / Dark Mode**:
   - Switch seamlessly between Light Mode and Dark Mode using the minimal Sun/Moon toggle in the live presence bar.
5. **Interactive Tools Panel**:
   - Access Chat with `@username` mentions, AI Assistant actions, Audio/Video room calls, Collaborative Whiteboard, Session Replays, and Editor Configurations.

---

## 6. Troubleshooting

- **Socket / Server Connection Refused**:
  Ensure `apps/api` (port 3001) and `apps/collab` (port 1235) are running without port conflicts.
- **State or Duplication Issues**:
  Clear browser IndexedDB storage for `http://localhost:5173` to reset cached CRDT document state if testing fresh session states.
