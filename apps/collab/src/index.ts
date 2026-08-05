import * as HocuspocusServerModule from '@hocuspocus/server';
import { Database } from '@hocuspocus/extension-database';

const mod: any = HocuspocusServerModule;
const HocuspocusClass = mod.Hocuspocus || mod.default?.Hocuspocus || mod.Server?.constructor;

// In-memory snapshot persistence store (persists across reconnects/intervals, replaced by Postgres in Phase 12)
export const docStore = new Map<string, Uint8Array>();

export const server = new HocuspocusClass({
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
  const port = Number(process.env.HOCUSPOCUS_PORT || 1234);
  server.listen(port).then(() => {
    console.log(`Hocuspocus Collab Server running on port ${port}`);
  });
}
