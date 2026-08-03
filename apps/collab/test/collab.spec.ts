import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as HocuspocusServerModule from '@hocuspocus/server';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import WebSocket from 'ws';

const mod: any = HocuspocusServerModule;
const HocuspocusClass = mod.Hocuspocus || mod.default?.Hocuspocus || mod.Server?.constructor;

describe('CRDT Collaboration Server (Hocuspocus + Yjs)', () => {
  let server: any;
  const port = 1235;

  beforeAll(async () => {
    server = new HocuspocusClass({
      port,
    });
    await server.listen(port);
  });

  afterAll(async () => {
    if (server && typeof server.destroy === 'function') {
      await server.destroy();
    }
  });

  it('should synchronize concurrent edits from two Yjs clients without losing data', async () => {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    const provider1 = new HocuspocusProvider({
      url: `ws://127.0.0.1:${port}`,
      name: 'crdt-test-room',
      document: doc1,
      WebSocketPolyfill: WebSocket as any,
    });

    const provider2 = new HocuspocusProvider({
      url: `ws://127.0.0.1:${port}`,
      name: 'crdt-test-room',
      document: doc2,
      WebSocketPolyfill: WebSocket as any,
    });

    await Promise.all([
      new Promise<void>((res) => provider1.on('synced', () => res())),
      new Promise<void>((res) => provider2.on('synced', () => res())),
    ]);

    const yText1 = doc1.getText('codemirror');
    const yText2 = doc2.getText('codemirror');

    // Client 1 inserts text at beginning
    yText1.insert(0, 'Hello ');

    // Client 2 inserts text concurrently
    yText2.insert(yText2.length, 'World!');

    // Wait for CRDT convergence
    await new Promise((res) => setTimeout(res, 300));

    expect(yText1.toString()).toBe(yText2.toString());
    expect(yText1.toString()).toContain('Hello');
    expect(yText1.toString()).toContain('World!');

    provider1.destroy();
    provider2.destroy();
  });
});
