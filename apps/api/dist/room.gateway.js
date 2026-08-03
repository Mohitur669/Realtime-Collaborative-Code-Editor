"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const shared_types_1 = require("@codesync/shared-types");
const crypto_1 = require("crypto");
let RoomGateway = class RoomGateway {
    server;
    userSocketMap = {};
    roomChatHistory = new Map();
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        const username = this.userSocketMap[client.id];
        delete this.userSocketMap[client.id];
        // Find rooms client was in
        const rooms = Array.from(client.rooms).filter((r) => r !== client.id);
        rooms.forEach((roomId) => {
            client.to(roomId).emit(shared_types_1.SocketActions.DISCONNECTED, {
                socketId: client.id,
                username,
            });
        });
        console.log(`Client disconnected: ${client.id}`);
    }
    getAllConnectedClients(roomId) {
        const room = this.server.sockets.adapter.rooms.get(roomId);
        if (!room)
            return [];
        return Array.from(room).map((socketId) => ({
            socketId,
            username: this.userSocketMap[socketId] || 'Anonymous',
        }));
    }
    handleJoin(client, payload) {
        const { roomId, username } = payload;
        this.userSocketMap[client.id] = username;
        client.join(roomId);
        const clients = this.getAllConnectedClients(roomId);
        // Notify everyone in the room
        this.server.in(roomId).emit(shared_types_1.SocketActions.JOINED, {
            clients,
            username,
            socketId: client.id,
        });
        // Send Chat history to newly joined user
        const history = this.roomChatHistory.get(roomId) || [];
        client.emit(shared_types_1.SocketActions.CHAT_HISTORY, { messages: history });
    }
    handleChatMessage(client, payload) {
        const { roomId, content, senderName } = payload;
        const chatMsg = {
            id: (0, crypto_1.randomUUID)(),
            roomId,
            senderId: client.id,
            senderName: senderName || this.userSocketMap[client.id] || 'Anonymous',
            content,
            timestamp: Date.now(),
        };
        if (!this.roomChatHistory.has(roomId)) {
            this.roomChatHistory.set(roomId, []);
        }
        const history = this.roomChatHistory.get(roomId);
        history.push(chatMsg);
        if (history.length > 100)
            history.shift(); // maintain 100 msg ring buffer
        this.server.in(roomId).emit(shared_types_1.SocketActions.CHAT_BROADCAST, chatMsg);
    }
};
exports.RoomGateway = RoomGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RoomGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)(shared_types_1.SocketActions.JOIN),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RoomGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(shared_types_1.SocketActions.CHAT_SEND),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RoomGateway.prototype, "handleChatMessage", null);
exports.RoomGateway = RoomGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], RoomGateway);
//# sourceMappingURL=room.gateway.js.map