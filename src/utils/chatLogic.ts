import { ChatConversation, Message, WSEventType, WSPacket } from '../types/chat';

export interface GroupedMessageItem {
  message: Message;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  showAvatar: boolean;
  showSenderName: boolean;
  showDateDivider: boolean;
  dateDividerText?: string;
}

/**
 * Formats a timestamp into Apple Messages time format.
 * E.g., "14:25" or "09:05".
 */
export function formatAppleTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Formats a timestamp for the conversation preview list or header divider.
 */
export function formatConversationDate(timestamp: number, now = Date.now()): string {
  const messageDate = new Date(timestamp);
  const today = new Date(now);

  const isSameDay =
    messageDate.getFullYear() === today.getFullYear() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getDate() === today.getDate();

  if (isSameDay) {
    return formatAppleTime(timestamp);
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    messageDate.getFullYear() === yesterday.getFullYear() &&
    messageDate.getMonth() === yesterday.getMonth() &&
    messageDate.getDate() === yesterday.getDate();

  if (isYesterday) {
    return 'Ontem';
  }

  const diffDays = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[messageDate.getDay()];
  }

  return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
}

/**
 * Formats divider timestamp shown between message clusters in chat history.
 */
export function formatDateDivider(timestamp: number, now = Date.now()): string {
  const messageDate = new Date(timestamp);
  const today = new Date(now);

  const isSameDay =
    messageDate.getFullYear() === today.getFullYear() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getDate() === today.getDate();

  const timeStr = formatAppleTime(timestamp);

  if (isSameDay) {
    return `Hoje ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    messageDate.getFullYear() === yesterday.getFullYear() &&
    messageDate.getMonth() === yesterday.getMonth() &&
    messageDate.getDate() === yesterday.getDate();

  if (isYesterday) {
    return `Ontem ${timeStr}`;
  }

  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return `${days[messageDate.getDay()]} ${timeStr}`;
}

/**
 * Calculates message grouping and bubble tail placements.
 * In Apple Messages:
 * - Messages sent within 2 minutes by the same sender belong to the same cluster.
 * - Only the last message in a sender cluster receives the distinctive curved bubble tail.
 * - Senders' names only appear at the top of incoming clusters in group chats.
 * - Date dividers appear when consecutive messages have a gap greater than 20 minutes.
 */
export function groupMessages(
  messages: Message[],
  currentUserId: string,
  isGroupChat = false
): GroupedMessageItem[] {
  const result: GroupedMessageItem[] = [];
  const GROUP_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes
  const DIVIDER_THRESHOLD_MS = 20 * 60 * 1000; // 20 minutes

  for (let i = 0; i < messages.length; i++) {
    const current = messages[i];
    const prev = i > 0 ? messages[i - 1] : null;
    const next = i < messages.length - 1 ? messages[i + 1] : null;

    const isPrevSameSender =
      prev !== null &&
      prev.senderId === current.senderId &&
      current.timestamp - prev.timestamp < GROUP_THRESHOLD_MS;

    const isNextSameSender =
      next !== null &&
      next.senderId === current.senderId &&
      next.timestamp - current.timestamp < GROUP_THRESHOLD_MS;

    const showDateDivider =
      i === 0 ||
      (prev !== null && current.timestamp - prev.timestamp > DIVIDER_THRESHOLD_MS);

    const isFirstInGroup = !isPrevSameSender || showDateDivider;
    const isLastInGroup = !isNextSameSender;

    const isMe = current.senderId === currentUserId;
    const showSenderName = isGroupChat && !isMe && isFirstInGroup;
    const showAvatar = !isMe && isLastInGroup;

    result.push({
      message: current,
      isFirstInGroup,
      isLastInGroup,
      showAvatar,
      showSenderName,
      showDateDivider,
      dateDividerText: showDateDivider ? formatDateDivider(current.timestamp) : undefined,
    });
  }

  return result;
}

/**
 * Pure function to toggle a tapback reaction on a message.
 * If user already clicked the same reaction, it toggles it off.
 * If user clicked a different reaction, it switches to the new reaction.
 */
export function toggleReaction(message: Message, emoji: string, userId: string): Message {
  const currentReactions = { ...(message.reactions || {}) };
  const existingEmojiForUser = Object.keys(currentReactions).find((e) =>
    (currentReactions[e] || []).includes(userId)
  );

  // Remove user from any existing reaction
  if (existingEmojiForUser) {
    currentReactions[existingEmojiForUser] = currentReactions[existingEmojiForUser].filter(
      (id) => id !== userId
    );
    if (currentReactions[existingEmojiForUser].length === 0) {
      delete currentReactions[existingEmojiForUser];
    }
  }

  // If clicked emoji is different from previous, add it
  if (existingEmojiForUser !== emoji) {
    if (!currentReactions[emoji]) {
      currentReactions[emoji] = [];
    }
    currentReactions[emoji].push(userId);
  }

  return {
    ...message,
    reactions: currentReactions,
  };
}

/**
 * Filter conversations by contact/group name or recent message text.
 */
export function filterConversations(
  conversations: ChatConversation[],
  searchQuery: string
): ChatConversation[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return conversations;

  return conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(query)) ||
      c.participants.some((p) => p.name.toLowerCase().includes(query))
  );
}

/**
 * Safely serialize a WebSocket event packet into a JSON string.
 */
export function serializeWSPacket(type: WSEventType, payload: any): string {
  const packet: WSPacket = {
    type,
    payload,
    timestamp: Date.now(),
  };
  return JSON.stringify(packet);
}

/**
 * Safely parse a raw string from a WebSocket into a validated WSPacket.
 */
export function parseWSPacket(raw: string): WSPacket | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && typeof parsed.type === 'string') {
      return parsed as WSPacket;
    }
    return null;
  } catch {
    return null;
  }
}
