import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server } from '@hocuspocus/server';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import WebSocket from 'ws';

describe('CRDT Collaboration Server (Hocuspocus + Yjs)', () => {
  let server: Server;
  const port = 1235;

  beforeAll(async () => {
    server = new Server({
      port,
    });
    await server.listen();
  });

  afterAll(async () => {
    await server.destroy();
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
    await new Promise((res) => setTimeout(res, 200));

    expect(yText1.toString()).toBe('Hello World!');
    expect(yText2.toString()).toBe('Hello World!');

    provider1.destroy();
    provider2.destroy();
  });
});
