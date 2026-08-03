import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io as SocketIOClient, Socket } from 'socket.io-client';
import { RoomGateway } from '../src/room.gateway';
import { SocketActions, ChatMessage } from '@codesync/shared-types';

describe('RoomGateway Integration & Chat Events', () => {
  let app: INestApplication;
  let client1: Socket;
  let client2: Socket;
  let serverPort: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RoomGateway],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.listen(0, '127.0.0.1');

    const server = app.getHttpServer();
    serverPort = server.address().port;
  });

  afterAll(async () => {
    if (client1) client1.disconnect();
    if (client2) client2.disconnect();
    await app.close();
  });

  it('should allow two clients to join a room, send chat messages, and receive history', async () => {
    const roomId = 'test-chat-room';

    client1 = SocketIOClient(`http://127.0.0.1:${serverPort}`, {
      transports: ['websocket'],
    });
    client2 = SocketIOClient(`http://127.0.0.1:${serverPort}`, {
      transports: ['websocket'],
    });

    const client1JoinPromise = new Promise<void>((resolve) => {
      client1.once(SocketActions.JOINED, (data) => {
        expect(data.username).toBe('User1');
        resolve();
      });
    });

    client1.emit(SocketActions.JOIN, { roomId, username: 'User1' });
    await client1JoinPromise;

    // Send a chat message from Client 1
    client1.emit(SocketActions.CHAT_SEND, {
      roomId,
      content: 'Hello **world**!',
      senderName: 'User1',
    });

    // Client 2 joins and should receive chat history
    const historyPromise = new Promise<ChatMessage[]>((resolve) => {
      client2.once(SocketActions.CHAT_HISTORY, (data) => {
        resolve(data.messages);
      });
    });

    client2.emit(SocketActions.JOIN, { roomId, username: 'User2' });
    const history = await historyPromise;

    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0].content).toBe('Hello **world**!');

    // Client 2 sends a message, both should receive broadcast
    const broadcastPromise = new Promise<ChatMessage>((resolve) => {
      client1.once(SocketActions.CHAT_BROADCAST, (data) => {
        resolve(data);
      });
    });

    client2.emit(SocketActions.CHAT_SEND, {
      roomId,
      content: 'Hey @User1!',
      senderName: 'User2',
    });

    const broadcastMsg = await broadcastPromise;
    expect(broadcastMsg.senderName).toBe('User2');
    expect(broadcastMsg.content).toBe('Hey @User1!');
  });
});
