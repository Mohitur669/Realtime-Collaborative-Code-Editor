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
let RoomGateway = class RoomGateway {
    server;
    userSocketMap = {};
    handleConnection(client) {
        // Client connected
    }
    handleDisconnect(client) {
        const rooms = Array.from(client.rooms);
        rooms.forEach((roomId) => {
            client.in(roomId).emit(shared_types_1.SocketActions.DISCONNECTED, {
                socketId: client.id,
                username: this.userSocketMap[client.id],
            });
        });
        delete this.userSocketMap[client.id];
    }
    getAllConnectedClients(roomId) {
        const room = this.server.sockets.adapter.rooms.get(roomId);
        if (!room)
            return [];
        return Array.from(room).map((socketId) => ({
            socketId,
            username: this.userSocketMap[socketId] || 'Guest',
        }));
    }
    async handleJoin(client, payload) {
        const { roomId, username } = payload;
        this.userSocketMap[client.id] = username;
        await client.join(roomId);
        const clients = this.getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            this.server.to(socketId).emit(shared_types_1.SocketActions.JOINED, {
                clients,
                username,
                socketId: client.id,
            });
        });
    }
    handleCodeChange(client, payload) {
        const { roomId, code } = payload;
        if (roomId) {
            client.in(roomId).emit(shared_types_1.SocketActions.CODE_CHANGE, { code });
        }
    }
    handleSyncCode(_client, payload) {
        const { socketId, code } = payload;
        this.server.to(socketId).emit(shared_types_1.SocketActions.CODE_CHANGE, { code });
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
    __metadata("design:returntype", Promise)
], RoomGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(shared_types_1.SocketActions.CODE_CHANGE),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RoomGateway.prototype, "handleCodeChange", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(shared_types_1.SocketActions.SYNC_CODE),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RoomGateway.prototype, "handleSyncCode", null);
exports.RoomGateway = RoomGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], RoomGateway);
//# sourceMappingURL=room.gateway.js.map