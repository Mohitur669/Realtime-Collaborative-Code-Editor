import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinPayload, SendChatMessagePayload } from '@codesync/shared-types';
export declare class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private userSocketMap;
    private socketRoomMap;
    private roomChatHistory;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    private getAllConnectedClients;
    handleJoin(client: Socket, payload: JoinPayload): void;
    handleChatMessage(client: Socket, payload: SendChatMessagePayload): void;
    handleRecordingNotify(client: Socket, payload: {
        roomId: string;
        username: string;
        action: 'start' | 'stop';
        title?: string;
    }): void;
    handleUserMute(client: Socket, payload: {
        roomId: string;
        targetSocketId: string;
        targetUsername: string;
        mute: boolean;
        byUsername: string;
    }): void;
    handleUserKick(client: Socket, payload: {
        roomId: string;
        targetSocketId: string;
        targetUsername: string;
        byUsername: string;
    }): void;
}
//# sourceMappingURL=room.gateway.d.ts.map