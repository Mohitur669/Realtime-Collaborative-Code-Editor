import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinPayload, CodeChangePayload, SyncCodePayload } from '@codesync/shared-types';
export declare class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private userSocketMap;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    private getAllConnectedClients;
    handleJoin(client: Socket, payload: JoinPayload): Promise<void>;
    handleCodeChange(client: Socket, payload: CodeChangePayload): void;
    handleSyncCode(_client: Socket, payload: SyncCodePayload): void;
}
//# sourceMappingURL=room.gateway.d.ts.map