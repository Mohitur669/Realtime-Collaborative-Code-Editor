export enum SocketActions {
  JOIN = 'join',
  JOINED = 'joined',
  DISCONNECTED = 'disconnected',
  LEAVE = 'leave',
  CODE_CHANGE = 'code-change',
  SYNC_CODE = 'sync-code',
  CHAT_SEND = 'chat-message:send',
  CHAT_BROADCAST = 'chat-message:broadcast',
  CHAT_HISTORY = 'chat-history',
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
