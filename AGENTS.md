# AGENTS.md — Development Rules & Guidelines

This document outlines non-negotiable engineering rules and conventions for all agentic and human developers working on the Realtime Collaborative Code Editor revamp.

## Non-Negotiable Rules

1. **Shared Logic & Types First**:
   - No duplicate implementations of the same concern across apps.
   - Shared business logic, DTOs, interfaces, and component primitives belong in `packages/shared-types` or `packages/ui`.

2. **No Fallow Dependencies**:
   - Every dependency added to `package.json` must be actively used in the same phase it is added.

3. **Strict Type Contracts**:
   - Every new socket event, payload schema, or REST endpoint contract MUST be fully typed in `packages/shared-types` before being consumed in client or server apps (`apps/client`, `apps/api`, `apps/collab`).

4. **Explicit Exclusion — In-Browser Code Execution**:
   - **In-browser code EXECUTION is explicitly OUT OF SCOPE.**
   - Do NOT implement a code runner, container-per-session executor, or active "Run" functionality.
   - If a "Run" button is required in UI placeholders, label it `"Run — coming soon"` with a disabled state and leave `// TODO(execution): Phase 16, not yet approved`.

5. **Phase Completion Gate**:
   - Every phase MUST leave `pnpm build` and `pnpm test` green at the root before the phase can be declared complete.

## Monorepo Architecture Overview

- **`apps/client`**: React 18 + TypeScript + Vite + Tailwind CSS frontend.
- **`apps/api`**: NestJS + TypeScript backend (REST API, Auth, Chat, AI proxy, LiveKit token issuance).
- **`apps/collab`**: Node + TypeScript Hocuspocus (Yjs) server dedicated to CRDT document sync.
- **`packages/shared-types`**: Shared TypeScript DTOs, socket event contracts, and Yjs document schema types.
- **`packages/ui`**: Shared React component primitives and design system elements.
- **`infra/`**: Infrastructure manifests (Docker Compose, LiveKit, Redis, Postgres, MinIO).
- **`legacy/`**: Preserved legacy CRA + Express codebase (excluded from build/lint tooling).
