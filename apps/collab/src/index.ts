import { Server } from '@hocuspocus/server';
import { Database } from '@hocuspocus/extension-database';

// In-memory snapshot persistence store (persists across reconnects/intervals, replaced by Postgres in Phase 12)
export const docStore = new Map<string, Uint8Array>();

export const server = new Server({
  port: Number(process.env.HOCUSPOCUS_PORT || 1234),
  extensions: [
    new Database({
      fetch: async ({ documentName }) => {
        return docStore.get(documentName) || null;
      },
      store: async ({ documentName, state }) => {
        docStore.set(documentName, state);
      },
    }),
  ],
});

if (process.env.NODE_ENV !== 'test') {
  server.listen().then(() => {
    console.log(`Hocuspocus Collab Server running on port ${process.env.HOCUSPOCUS_PORT || 1234}`);
  });
}
