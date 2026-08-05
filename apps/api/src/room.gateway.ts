import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  SocketActions,
  JoinPayload,
  SendChatMessagePayload,
  ChatMessage,
} from '@codesync/shared-types';
import { randomUUID } from 'crypto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private userSocketMap: Record<string, string> = {};
  private socketRoomMap: Record<string, string> = {};
  private roomChatHistory: Map<string, ChatMessage[]> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const username = this.userSocketMap[client.id];
    const roomId = this.socketRoomMap[client.id];
    delete this.userSocketMap[client.id];
    delete this.socketRoomMap[client.id];

    if (roomId && username) {
      this.server.in(roomId).emit(SocketActions.DISCONNECTED, {
        socketId: client.id,
        username,
      });

      const leaveSystemMsg: ChatMessage = {
        id: randomUUID(),
        roomId,
        senderId: 'system',
        senderName: 'System',
        content: `${username} left the room`,
        timestamp: Date.now(),
      };

      if (!this.roomChatHistory.has(roomId)) {
        this.roomChatHistory.set(roomId, []);
      }
      const history = this.roomChatHistory.get(roomId)!;
      history.push(leaveSystemMsg);
      if (history.length > 100) history.shift();

      this.server.in(roomId).emit(SocketActions.CHAT_BROADCAST, leaveSystemMsg);
    }

    console.log(`Client disconnected: ${client.id}`);
  }

  private getAllConnectedClients(roomId: string) {
    const room = this.server.sockets.adapter.rooms.get(roomId);
    if (!room) return [];

    const rawClients = Array.from(room).map((socketId) => ({
      socketId,
      username: this.userSocketMap[socketId] || 'Anonymous',
    }));

    // Deduplicate by username so the same participant is never shown multiple times
    const uniqueMap = new Map<string, { socketId: string; username: string }>();
    for (const client of rawClients) {
      uniqueMap.set(client.username, client);
    }
    return Array.from(uniqueMap.values());
  }

  @SubscribeMessage(SocketActions.JOIN)
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinPayload,
  ) {
    const { roomId, username } = payload;
    this.userSocketMap[client.id] = username;
    this.socketRoomMap[client.id] = roomId;
    client.join(roomId);

    const clients = this.getAllConnectedClients(roomId);

    // Notify everyone in the room
    this.server.in(roomId).emit(SocketActions.JOINED, {
      clients,
      username,
      socketId: client.id,
    });

    const joinSystemMsg: ChatMessage = {
      id: randomUUID(),
      roomId,
      senderId: 'system',
      senderName: 'System',
      content: `${username} joined the room`,
      timestamp: Date.now(),
    };

    if (!this.roomChatHistory.has(roomId)) {
      this.roomChatHistory.set(roomId, []);
    }
    const history = this.roomChatHistory.get(roomId)!;
    history.push(joinSystemMsg);
    if (history.length > 100) history.shift();

    this.server.in(roomId).emit(SocketActions.CHAT_BROADCAST, joinSystemMsg);

    // Send Chat history to newly joined user
    client.emit(SocketActions.CHAT_HISTORY, { messages: history });
  }

  @SubscribeMessage(SocketActions.CHAT_SEND)
  handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendChatMessagePayload,
  ) {
    const { roomId, content, senderName } = payload;

    const chatMsg: ChatMessage = {
      id: randomUUID(),
      roomId,
      senderId: client.id,
      senderName: senderName || this.userSocketMap[client.id] || 'Anonymous',
      content,
      timestamp: Date.now(),
    };

    if (!this.roomChatHistory.has(roomId)) {
      this.roomChatHistory.set(roomId, []);
    }
    const history = this.roomChatHistory.get(roomId)!;
    history.push(chatMsg);
    if (history.length > 100) history.shift(); // maintain 100 msg ring buffer

    this.server.in(roomId).emit(SocketActions.CHAT_BROADCAST, chatMsg);
  }

  @SubscribeMessage(SocketActions.RECORDING_NOTIFY)
  handleRecordingNotify(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; username: string; action: 'start' | 'stop'; title?: string },
  ) {
    this.server.in(payload.roomId).emit(SocketActions.RECORDING_NOTIFY, payload);
  }

  @SubscribeMessage(SocketActions.USER_MUTE)
  handleUserMute(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; targetSocketId: string; targetUsername: string; mute: boolean; byUsername: string },
  ) {
    this.server.in(payload.roomId).emit(SocketActions.USER_MUTE, payload);
  }

  @SubscribeMessage(SocketActions.USER_KICK)
  handleUserKick(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; targetSocketId: string; targetUsername: string; byUsername: string },
  ) {
    this.server.in(payload.roomId).emit(SocketActions.USER_KICK, payload);
    const targetClient = this.server.sockets.sockets.get(payload.targetSocketId);
    if (targetClient) {
      targetClient.leave(payload.roomId);
    }
  }
}
