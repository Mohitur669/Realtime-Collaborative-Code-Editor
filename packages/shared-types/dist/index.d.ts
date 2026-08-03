export declare enum SocketActions {
    JOIN = "join",
    JOINED = "joined",
    DISCONNECTED = "disconnected",
    CODE_CHANGE = "code-change",
    SYNC_CODE = "sync-code",
    LEAVE = "leave"
}
export interface ClientInfo {
    socketId: string;
    username: string;
}
export interface JoinPayload {
    roomId: string;
    username: string;
}
export interface JoinedPayload {
    clients: ClientInfo[];
    username: string;
    socketId: string;
}
export interface CodeChangePayload {
    roomId?: string;
    code: string;
}
export interface SyncCodePayload {
    socketId: string;
    code: string;
}
export interface DisconnectedPayload {
    socketId: string;
    username?: string;
}
export interface User {
    id: string;
    username: string;
}
export interface Room {
    id: string;
    name?: string;
    users: User[];
}
//# sourceMappingURL=index.d.ts.map