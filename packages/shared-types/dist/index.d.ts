export declare enum SocketActions {
    JOIN = "join",
    JOINED = "joined",
    DISCONNECTED = "disconnected",
    LEAVE = "leave",
    CODE_CHANGE = "code-change",
    SYNC_CODE = "sync-code",
    CHAT_SEND = "chat-message:send",
    CHAT_BROADCAST = "chat-message:broadcast",
    CHAT_HISTORY = "chat-history",
    RECORDING_NOTIFY = "recording-notify",
    USER_MUTE = "user-mute",
    USER_KICK = "user-kick"
}
export interface User {
    socketId: string;
    username: string;
}
export interface Room {
    roomId: string;
    users: User[];
}
export interface JoinPayload {
    roomId: string;
    username: string;
}
export interface ClientInfo {
    socketId: string;
    username: string;
}
export interface JoinedPayload {
    clients: ClientInfo[];
    username: string;
    socketId: string;
}
export interface CodeChangePayload {
    roomId: string;
    code: string;
}
export interface SyncCodePayload {
    socketId: string;
    code: string;
}
export interface DisconnectedPayload {
    socketId: string;
    username: string;
    clients?: ClientInfo[];
}
export interface ChatMessage {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: number;
}
export interface SendChatMessagePayload {
    roomId: string;
    content: string;
    senderName: string;
}
export interface ChatHistoryPayload {
    messages: ChatMessage[];
}
export interface LiveKitTokenRequest {
    roomName: string;
    participantName: string;
}
export interface LiveKitTokenResponse {
    token: string;
    wsUrl: string;
    isConfigured: boolean;
}
export interface RecordingEvent {
    timestamp: number;
    type: 'code' | 'chat' | 'presence';
    author: string;
    detail: string;
}
export interface SessionRecording {
    id: string;
    roomId: string;
    title: string;
    createdAt: number;
    durationSeconds: number;
    eventCount: number;
    events: RecordingEvent[];
}
export interface StartRecordingRequest {
    roomId: string;
    title?: string;
}
export interface StopRecordingRequest {
    recordingId: string;
}
export interface RecordingListResponse {
    recordings: SessionRecording[];
}
export interface AiCompletionRequest {
    prompt: string;
    contextCode?: string;
    action?: 'explain' | 'generate' | 'refactor' | 'fix';
}
export interface AiCompletionResponse {
    result: string;
    action: string;
    timestamp: number;
}
export interface WhiteboardElement {
    id: string;
    type: 'pencil' | 'rectangle' | 'circle' | 'text';
    points?: {
        x: number;
        y: number;
    }[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    color: string;
    strokeWidth: number;
}
export interface WhiteboardState {
    elements: WhiteboardElement[];
}
export interface RoomSnapshotDTO {
    roomId: string;
    documentName: string;
    snapshot: string;
    updatedAt: number;
}
export interface AuthLoginRequest {
    username: string;
    password?: string;
}
export interface AuthLoginResponse {
    token: string;
    user: {
        id: string;
        username: string;
    };
}
//# sourceMappingURL=index.d.ts.map