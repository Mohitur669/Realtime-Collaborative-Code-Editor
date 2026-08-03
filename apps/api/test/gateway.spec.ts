import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { SocketActions, JoinedPayload, CodeChangePayload } from '@codesync/shared-types';

describe('RoomGateway Integration', () => {
  let app: INestApplication;
  let serverUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address();
    const port = typeof address === 'string' ? 5000 : address.port;
    serverUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should broadcast JOINED event when two clients join the same room and broadcast CODE_CHANGE', async () => {
    const roomId = 'test-room-101';

    const client1: ClientSocket = ioClient(serverUrl, { transports: ['websocket'], forceNew: true });

    // Client 1 joins room first
    await new Promise<void>((resolve) => {
      client1.once(SocketActions.JOINED, (data: JoinedPayload) => {
        expect(data.username).toBe('Alice');
        expect(data.clients).toHaveLength(1);
        resolve();
      });
      if (client1.connected) {
        client1.emit(SocketActions.JOIN, { roomId, username: 'Alice' });
      } else {
        client1.on('connect', () => {
          client1.emit(SocketActions.JOIN, { roomId, username: 'Alice' });
        });
      }
    });

    const client2: ClientSocket = ioClient(serverUrl, { transports: ['websocket'], forceNew: true });

    // Client 2 joins room; both clients expect JOINED notification
    const joinedPromiseClient1 = new Promise<JoinedPayload>((resolve) => {
      client1.once(SocketActions.JOINED, (data) => resolve(data));
    });

    const joinedPromiseClient2 = new Promise<JoinedPayload>((resolve) => {
      client2.once(SocketActions.JOINED, (data) => resolve(data));
      if (client2.connected) {
        client2.emit(SocketActions.JOIN, { roomId, username: 'Bob' });
      } else {
        client2.on('connect', () => {
          client2.emit(SocketActions.JOIN, { roomId, username: 'Bob' });
        });
      }
    });

    const [client1Data, client2Data] = await Promise.all([joinedPromiseClient1, joinedPromiseClient2]);

    expect(client1Data.username).toBe('Bob');
    expect(client1Data.clients).toHaveLength(2);
    expect(client2Data.clients).toHaveLength(2);

    // Client 1 sends code change, Client 2 receives it
    const codePromise = new Promise<CodeChangePayload>((resolve) => {
      client2.once(SocketActions.CODE_CHANGE, (data) => resolve(data));
    });

    client1.emit(SocketActions.CODE_CHANGE, { roomId, code: 'console.log("hello world");' });

    const codeData = await codePromise;
    expect(codeData.code).toBe('console.log("hello world");');

    client1.disconnect();
    client2.disconnect();
  });
});
