# Sync Code: Realtime Collaborative Code Editor (Full Platform Revamp)

> **Note on Architecture & Migration**: This project is undergoing a full platform revamp into a TypeScript pnpm/Turborepo monorepo. All development must follow the non-negotiable rules specified in [AGENTS.md](file:///Users/mohitur/Desktop/git-projects/code-editor/AGENTS.md).

## Monorepo Layout

```
apps/
  client/            React 18 + TypeScript + Vite + Tailwind CSS
  api/               NestJS + TypeScript — REST, auth, room metadata, chat, AI proxy, LiveKit tokens
  collab/            Node + TypeScript — Hocuspocus (Yjs) server for CRDT document sync
packages/
  shared-types/      DTOs, socket event contracts, Yjs document schema types
  ui/                Shared React component primitives & design system
infra/
  docker-compose.yml Local dev services (PostgreSQL, Redis, MinIO, LiveKit, Egress)
legacy/
  Original single-service CRA + Express + Socket.io app preserved for reference
```

---

## Legacy Overview & Features

### Introduction

Are you tired of sending code snippets back and forth, struggling to debug and collaborate with your team? Look no further! **Sync Code** is here to revolutionize the way you code together. This powerful and intuitive collaborative code editor is designed to empower developers and teams to work seamlessly in real-time, regardless of their location. With **Sync Code**, you can code together, debug together, and ship faster, together.

### Monorepo Development Commands

- `pnpm install`: Install dependencies across all workspace packages
- `pnpm build`: Build all workspace packages via Turborepo
- `pnpm dev`: Start development servers across apps
- `pnpm test`: Execute test suites across apps

---

## Connect & Contribute

- Rules and guidelines: See [AGENTS.md](file:///Users/mohitur/Desktop/git-projects/code-editor/AGENTS.md)
- GitHub Repository: [Mohitur669/Realtime-Collaborative-Code-Editor](https://github.com/Mohitur669/Realtime-Collaborative-Code-Editor)
