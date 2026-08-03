import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinPayload, SendChatMessagePayload } from '@codesync/shared-types';
export declare class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private userSocketMap;
    private roomChatHistory;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    private getAllConnectedClients;
    handleJoin(client: Socket, payload: JoinPayload): void;
    handleChatMessage(client: Socket, payload: SendChatMessagePayload): void;
}
//# sourceMappingURL=room.gateway.d.ts.map