import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  SocketActions,
  JoinPayload,
  CodeChangePayload,
  SyncCodePayload,
  ClientInfo,
} from '@codesync/shared-types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private userSocketMap: Record<string, string> = {};

  handleConnection(client: Socket) {
    // Client connected
  }

  handleDisconnect(client: Socket) {
    const rooms = Array.from(client.rooms);
    rooms.forEach((roomId) => {
      client.in(roomId).emit(SocketActions.DISCONNECTED, {
        socketId: client.id,
        username: this.userSocketMap[client.id],
      });
    });
    delete this.userSocketMap[client.id];
  }

  private getAllConnectedClients(roomId: string): ClientInfo[] {
    const room = this.server.sockets.adapter.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room).map((socketId) => ({
      socketId,
      username: this.userSocketMap[socketId] || 'Guest',
    }));
  }

  @SubscribeMessage(SocketActions.JOIN)
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinPayload,
  ) {
    const { roomId, username } = payload;
    this.userSocketMap[client.id] = username;
    await client.join(roomId);

    const clients = this.getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      this.server.to(socketId).emit(SocketActions.JOINED, {
        clients,
        username,
        socketId: client.id,
      });
    });
  }

  @SubscribeMessage(SocketActions.CODE_CHANGE)
  handleCodeChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CodeChangePayload,
  ) {
    const { roomId, code } = payload;
    if (roomId) {
      client.in(roomId).emit(SocketActions.CODE_CHANGE, { code });
    }
  }

  @SubscribeMessage(SocketActions.SYNC_CODE)
  handleSyncCode(
    @ConnectedSocket() _client: Socket,
    @MessageBody() payload: SyncCodePayload,
  ) {
    const { socketId, code } = payload;
    this.server.to(socketId).emit(SocketActions.CODE_CHANGE, { code });
  }
}
