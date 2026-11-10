import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChatConversation,
  Message,
  User,
  WSPacket,
  TapbackEmoji,
} from '../types/chat';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_USERS,
} from '../data/initialData';
import {
  parseWSPacket,
  serializeWSPacket,
  toggleReaction as applyReactionToggle,
} from '../utils/chatLogic';
import {
  playAppleReceiveSound,
  playAppleSendSound,
  playAppleTapbackSound,
} from '../utils/audio';

export interface PacketLogEntry {
  id: string;
  direction: 'in' | 'out';
  packet: WSPacket;
  time: string;
}

export function useWebSocketChat() {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [activeChatId, setActiveChatId] = useState<string>('chat_group_keynote');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Steve Jobs
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // WebSocket connection state
  const [wsUrl, setWsUrl] = useState<string>(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  });
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [simulatedMode, setSimulatedMode] = useState<boolean>(true);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState<boolean>(true);
  const [packetLogs, setPacketLogs] = useState<PacketLogEntry[]>([]);

  // Typing status: chatId -> array of user names currently typing
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeChat = conversations.find((c) => c.id === activeChatId) || conversations[0];
  const activeMessages = messages[activeChatId] || [];

  // Add packet log entry
  const logPacket = useCallback((direction: 'in' | 'out', packet: WSPacket) => {
    const entry: PacketLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      direction,
      packet,
      time: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
    };
    setPacketLogs((prev) => [entry, ...prev.slice(0, 49)]); // keep last 50
  }, []);

  // Connect to WebSocket server
  const connectWebSocket = useCallback((url = wsUrl) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      setWsStatus('connecting');
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        setSimulatedMode(false);
        // Announce user joining
        const joinPacket: WSPacket = {
          type: 'join',
          payload: { user: currentUser },
          timestamp: Date.now(),
        };
        ws.send(JSON.stringify(joinPacket));
        logPacket('out', joinPacket);
      };

      ws.onmessage = (event) => {
        const packet = parseWSPacket(event.data);
        if (!packet) return;

        logPacket('in', packet);

        switch (packet.type) {
          case 'message': {
            const incomingMsg: Message = packet.payload;
            setMessages((prev) => {
              const currentChatMsgs = prev[incomingMsg.chatId] || [];
              if (currentChatMsgs.some((m) => m.id === incomingMsg.id)) {
                return prev;
              }
              return {
                ...prev,
                [incomingMsg.chatId]: [...currentChatMsgs, incomingMsg],
              };
            });

            // Update conversation preview
            setConversations((prev) =>
              prev.map((c) =>
                c.id === incomingMsg.chatId
                  ? {
                      ...c,
                      lastMessage: incomingMsg.text,
                      lastTimestamp: incomingMsg.timestamp,
                      unreadCount: c.id === activeChatId ? 0 : c.unreadCount + 1,
                    }
                  : c
              )
            );

            if (incomingMsg.senderId !== currentUser.id) {
              playAppleReceiveSound(soundEnabled);
            }
            break;
          }

          case 'reaction': {
            const { messageId, emoji, userId, chatId } = packet.payload;
            setMessages((prev) => {
              const targetChatId = chatId || activeChatId;
              const chatMsgs = prev[targetChatId] || [];
              return {
                ...prev,
                [targetChatId]: chatMsgs.map((m) =>
                  m.id === messageId ? applyReactionToggle(m, emoji, userId) : m
                ),
              };
            });
            playAppleTapbackSound(soundEnabled);
            break;
          }

          case 'typing': {
            const { chatId, userName, isTyping } = packet.payload;
            setTypingUsers((prev) => {
              const currentTypers = prev[chatId] || [];
              const updated = isTyping
                ? Array.from(new Set([...currentTypers, userName]))
                : currentTypers.filter((u) => u !== userName);
              return { ...prev, [chatId]: updated };
            });
            break;
          }

          case 'history_sync': {
            if (packet.payload.messages) {
              setMessages(packet.payload.messages);
            }
            if (packet.payload.conversations) {
              setConversations(packet.payload.conversations);
            }
            break;
          }

          case 'status_update': {
            const { chatId, messageId, status } = packet.payload;
            if (
              typeof chatId !== 'string' ||
              typeof messageId !== 'string' ||
              !['sending', 'sent', 'delivered', 'read'].includes(status)
            ) {
              break;
            }

            setMessages((prev) => ({
              ...prev,
              [chatId]: (prev[chatId] || []).map((message) =>
                message.id === messageId ? { ...message, status: status as Message['status'] } : message
              ),
            }));
            break;
          }

          case 'user_list': {
            if (Array.isArray(packet.payload.users)) {
              setAllUsers(packet.payload.users);
            }
            break;
          }
        }
      };

      ws.onerror = () => {
        // Fallback to simulated mode
        setWsStatus('disconnected');
        setSimulatedMode(true);
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
        setSimulatedMode(true);
      };
    } catch {
      setWsStatus('disconnected');
      setSimulatedMode(true);
    }
  }, [wsUrl, currentUser, soundEnabled, logPacket, activeChatId]);

  // Attempt initial connection once, fallback seamlessly if server isn't up yet
  useEffect(() => {
    // Only attempt if not already connected
    if (wsStatus === 'disconnected' && !wsRef.current) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Send message function
  const sendMessage = useCallback((
    text: string,
    type: 'text' | 'image' | 'audio' | 'system' = 'text',
    attachmentUrl?: string,
    audioDuration?: number
  ) => {
    if (!text.trim() && type === 'text') return;

    const newMessageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    const newMessage: Message = {
      id: newMessageId,
      chatId: activeChatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: now,
      status: 'sent',
      type,
      attachmentUrl,
      audioDuration,
    };

    // Play swoosh sound immediately
    playAppleSendSound(soundEnabled);

    // Update local state
    setMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage],
    }));

    // Update conversation preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              lastMessage: type === 'audio' ? '🎤 Mensagem de áudio' : text.trim(),
              lastTimestamp: now,
            }
          : c
      )
    );

    // If WebSocket is open, broadcast to server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const packet: WSPacket<Message> = {
        type: 'message',
        payload: newMessage,
        timestamp: now,
      };
      wsRef.current.send(JSON.stringify(packet));
      logPacket('out', packet);
    } else {
      // In simulated mode, simulate status progression to delivered and read
      setTimeout(() => {
        setMessages((prev) => ({
          ...prev,
          [activeChatId]: (prev[activeChatId] || []).map((m) =>
            m.id === newMessageId ? { ...m, status: 'delivered' } : m
          ),
        }));
      }, 700);

      setTimeout(() => {
        setMessages((prev) => ({
          ...prev,
          [activeChatId]: (prev[activeChatId] || []).map((m) =>
            m.id === newMessageId ? { ...m, status: 'read' } : m
          ),
        }));
      }, 1600);

      // Trigger realistic Apple simulated reply if enabled and other participants exist
      if (autoReplyEnabled) {
        const otherParticipants = activeChat.participants.filter((p) => p.id !== currentUser.id);
        if (otherParticipants.length > 0) {
          const responder = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];

          // Show typing indicator after 1.2s
          setTimeout(() => {
            setTypingUsers((prev) => ({
              ...prev,
              [activeChatId]: [responder.name],
            }));
          }, 1200);

          // Deliver reply after 3.2s
          setTimeout(() => {
            // Remove typing indicator
            setTypingUsers((prev) => ({
              ...prev,
              [activeChatId]: [],
            }));

            const replies = [
              'Excelente ideia! Vamos incluir isso na próxima atualização.',
              'Concordo totalmente. A fluidez da interface é prioridade.',
              'Ficou perfeito. O feedback tátil e sonoro está sensacional.',
              'Vou testar agora mesmo na build do macOS.',
              'Sensacional! O design segue à risca os princípios da Apple.',
            ];
            const replyText = replies[Math.floor(Math.random() * replies.length)];

            const replyMsg: Message = {
              id: `msg_reply_${Date.now()}`,
              chatId: activeChatId,
              senderId: responder.id,
              senderName: responder.name,
              senderAvatar: responder.avatar,
              text: replyText,
              timestamp: Date.now(),
              status: 'read',
              type: 'text',
            };

            setMessages((prev) => ({
              ...prev,
              [activeChatId]: [...(prev[activeChatId] || []), replyMsg],
            }));

            setConversations((prev) =>
              prev.map((c) =>
                c.id === activeChatId
                  ? {
                      ...c,
                      lastMessage: replyText,
                      lastTimestamp: Date.now(),
                    }
                  : c
              )
            );

            playAppleReceiveSound(soundEnabled);
          }, 3200);
        }
      }
    }
  }, [
    activeChatId,
    currentUser,
    soundEnabled,
    logPacket,
    autoReplyEnabled,
    activeChat.participants,
  ]);

  // Toggle Tapback reaction
  const toggleReaction = useCallback((messageId: string, emoji: TapbackEmoji | string) => {
    playAppleTapbackSound(soundEnabled);

    setMessages((prev) => {
      const currentChatMsgs = prev[activeChatId] || [];
      return {
        ...prev,
        [activeChatId]: currentChatMsgs.map((m) =>
          m.id === messageId ? applyReactionToggle(m, emoji, currentUser.id) : m
        ),
      };
    });

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const packet: WSPacket = {
        type: 'reaction',
        payload: {
          messageId,
          emoji,
          userId: currentUser.id,
          chatId: activeChatId,
        },
        timestamp: Date.now(),
      };
      wsRef.current.send(JSON.stringify(packet));
      logPacket('out', packet);
    }
  }, [activeChatId, currentUser.id, soundEnabled, logPacket]);

  // Send typing event
  const sendTyping = useCallback((isTyping: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const packet: WSPacket = {
        type: 'typing',
        payload: {
          chatId: activeChatId,
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping,
        },
        timestamp: Date.now(),
      };
      wsRef.current.send(JSON.stringify(packet));
      logPacket('out', packet);
    }
  }, [activeChatId, currentUser, logPacket]);

  // Switch active user profile (so the user can test multiple users locally)
  const switchActiveUser = useCallback((user: User) => {
    setCurrentUser(user);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const joinPacket: WSPacket = {
        type: 'join',
        payload: { user },
        timestamp: Date.now(),
      };
      wsRef.current.send(JSON.stringify(joinPacket));
      logPacket('out', joinPacket);
    }
  }, [logPacket]);

  // Create new conversation
  const createConversation = useCallback((name: string, participants: User[], isGroup = false) => {
    const newChatId = `chat_${Date.now()}`;
    const newChat: ChatConversation = {
      id: newChatId,
      name,
      isGroup,
      avatar: participants[0]?.avatar || '',
      participants: [currentUser, ...participants.filter((p) => p.id !== currentUser.id)],
      unreadCount: 0,
      lastMessage: 'Conversa iniciada',
      lastTimestamp: Date.now(),
    };

    setConversations((prev) => [newChat, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newChatId]: [
        {
          id: `msg_init_${Date.now()}`,
          chatId: newChatId,
          senderId: 'system',
          senderName: 'Sistema',
          text: `Conversa com ${name} iniciada`,
          timestamp: Date.now(),
          status: 'read',
          type: 'system',
        },
      ],
    }));
    setActiveChatId(newChatId);
    return newChatId;
  }, [currentUser]);

  // Clear messages in current chat
  const clearCurrentChat = useCallback(() => {
    setMessages((prev) => ({
      ...prev,
      [activeChatId]: [],
    }));
  }, [activeChatId]);

  return {
    conversations,
    setConversations,
    activeChat,
    activeChatId,
    setActiveChatId,
    messages: activeMessages,
    allMessages: messages,
    currentUser,
    setCurrentUser,
    allUsers,
    typingUsers: typingUsers[activeChatId] || [],
    soundEnabled,
    setSoundEnabled,
    wsStatus,
    wsUrl,
    setWsUrl,
    simulatedMode,
    autoReplyEnabled,
    setAutoReplyEnabled,
    packetLogs,
    sendMessage,
    toggleReaction,
    sendTyping,
    switchActiveUser,
    connectWebSocket,
    createConversation,
    clearCurrentChat,
  };
}
