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
  private roomChatHistory: Map<string, ChatMessage[]> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const username = this.userSocketMap[client.id];
    delete this.userSocketMap[client.id];

    // Find rooms client was in
    const rooms = Array.from(client.rooms).filter((r) => r !== client.id);

    rooms.forEach((roomId) => {
      client.to(roomId).emit(SocketActions.DISCONNECTED, {
        socketId: client.id,
        username,
      });
    });

    console.log(`Client disconnected: ${client.id}`);
  }

  private getAllConnectedClients(roomId: string) {
    const room = this.server.sockets.adapter.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room).map((socketId) => ({
      socketId,
      username: this.userSocketMap[socketId] || 'Anonymous',
    }));
  }

  @SubscribeMessage(SocketActions.JOIN)
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinPayload,
  ) {
    const { roomId, username } = payload;
    this.userSocketMap[client.id] = username;
    client.join(roomId);

    const clients = this.getAllConnectedClients(roomId);

    // Notify everyone in the room
    this.server.in(roomId).emit(SocketActions.JOINED, {
      clients,
      username,
      socketId: client.id,
    });

    // Send Chat history to newly joined user
    const history = this.roomChatHistory.get(roomId) || [];
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
