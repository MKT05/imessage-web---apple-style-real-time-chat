export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  color?: string;
  isOnline: boolean;
  statusText?: string;
}

export type TapbackEmoji = '❤️' | '👍' | '👎' | '😂' | '‼️' | '❓';

export interface MessageReaction {
  emoji: TapbackEmoji | string;
  users: { id: string; name: string }[];
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
  status: MessageStatus;
  type: 'text' | 'image' | 'audio' | 'system';
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  audioDuration?: number; // in seconds
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface ChatConversation {
  id: string;
  name: string;
  isGroup: boolean;
  avatar?: string;
  participants: User[];
  unreadCount: number;
  lastMessage?: string;
  lastTimestamp?: number;
  isPinned?: boolean;
  muted?: boolean;
}

export type WSEventType =
  | 'join'
  | 'message'
  | 'reaction'
  | 'typing'
  | 'status_update'
  | 'history_sync'
  | 'user_list'
  | 'user_joined'
  | 'user_left'
  | 'ping'
  | 'pong';

export interface WSPacket<T = any> {
  type: WSEventType;
  payload: T;
  timestamp?: number;
}
