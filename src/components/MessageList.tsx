import { FC, useRef, useEffect, useState } from 'react';
import { Smile, Check, CheckCheck } from 'lucide-react';
import { Message, TapbackEmoji } from '../types/chat';
import { groupMessages } from '../utils/chatLogic';
import { TapbackMenu } from './TapbackMenu';
import { AudioMessageBubble } from './AudioMessageBubble';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isGroupChat?: boolean;
  typingUsers?: string[];
  onToggleReaction: (messageId: string, emoji: TapbackEmoji) => void;
}

export const MessageList: FC<MessageListProps> = ({
  messages,
  currentUserId,
  isGroupChat = false,
  typingUsers = [],
  onToggleReaction,
}) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const [activeTapbackMsgId, setActiveTapbackMsgId] = useState<string | null>(null);

  // Group messages with tail calculation
  const groupedItems = groupMessages(messages, currentUserId, isGroupChat);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5"
      onClick={() => setActiveTapbackMsgId(null)}
    >
      {groupedItems.map((item, index) => {
        const { message, isLastInGroup, showAvatar, showSenderName, showDateDivider, dateDividerText } = item;
        const isMe = message.senderId === currentUserId;
        const hasReactions = message.reactions && Object.keys(message.reactions).length > 0;
        const isTapbackOpen = activeTapbackMsgId === message.id;

        // User's own active reaction
        const myActiveReaction = message.reactions
          ? Object.keys(message.reactions).find((e) => (message.reactions?.[e] || []).includes(currentUserId))
          : undefined;

        return (
          <div key={message.id} className="group/row flex flex-col">
            {/* Date divider */}
            {showDateDivider && dateDividerText && (
              <div className="py-3 flex justify-center">
                <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  {dateDividerText}
                </span>
              </div>
            )}

            {/* Sender name in group chat for incoming clusters */}
            {showSenderName && !isMe && (
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 ml-9 mt-3 mb-1">
                {message.senderName}
              </span>
            )}

            {/* Message Row */}
            <div
              className={`flex items-end gap-2 relative ${
                isMe ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Incoming Avatar */}
              {!isMe && (
                <div className="w-7 h-7 flex-shrink-0">
                  {showAvatar ? (
                    <img
                      src={message.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt={message.senderName}
                      className="w-7 h-7 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-7 h-7" />
                  )}
                </div>
              )}

              {/* Tapback trigger button on hover */}
              <div
                className={`opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center ${
                  isMe ? 'order-first mr-1' : 'order-last ml-1'
                }`}
              >
                <button
                  type="button"
                  aria-label="Reagir à mensagem"
                  title="Reação Tapback"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTapbackMsgId(isTapbackOpen ? null : message.id);
                  }}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* Message Bubble Container */}
              <div
                className="relative max-w-[70%] sm:max-w-[62%]"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setActiveTapbackMsgId(message.id);
                }}
              >
                {/* Tapback Menu Popup */}
                {isTapbackOpen && (
                  <TapbackMenu
                    onSelectReaction={(emoji) => onToggleReaction(message.id, emoji)}
                    onClose={() => setActiveTapbackMsgId(null)}
                    activeEmoji={myActiveReaction}
                    isMe={isMe}
                  />
                )}

                {/* Bubble Content */}
                <div
                  className={`relative px-4 py-2 text-[14px] leading-relaxed shadow-sm transition-all ${
                    isMe
                      ? `bg-gradient-to-b from-[#007aff] to-[#006ee6] text-white ${
                          isLastInGroup
                            ? 'rounded-2xl rounded-br-[4px]'
                            : 'rounded-2xl'
                        }`
                      : `bg-[#e9e9eb] dark:bg-[#262629] text-neutral-900 dark:text-neutral-100 ${
                          isLastInGroup
                            ? 'rounded-2xl rounded-bl-[4px]'
                            : 'rounded-2xl'
                        }`
                  }`}
                >
                  {/* Message Type: Audio */}
                  {message.type === 'audio' ? (
                    <AudioMessageBubble duration={message.audioDuration || 14} isMe={isMe} />
                  ) : message.type === 'image' && message.attachmentUrl ? (
                    <div className="space-y-1.5">
                      <img
                        src={message.attachmentUrl}
                        alt="Anexo"
                        className="rounded-xl max-h-60 object-cover w-full"
                      />
                      {message.text && <p className="text-sm pt-1">{message.text}</p>}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  )}
                </div>

                {/* Tapback Badge Pill on the Bubble */}
                {hasReactions && (
                  <div
                    className={`absolute -top-3 ${
                      isMe ? 'right-2' : 'left-2'
                    } flex items-center gap-0.5 bg-white/95 dark:bg-[#323235]/95 shadow-md px-1.5 py-0.5 rounded-full border border-black/10 dark:border-white/10 z-10 animate-in fade-in zoom-in-75 duration-100 cursor-pointer hover:scale-105`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTapbackMsgId(message.id);
                    }}
                  >
                    {Object.entries(message.reactions || {}).map(([emoji, users]) => (
                      <span key={emoji} className="flex items-center text-xs">
                        <span>{emoji}</span>
                        {users.length > 1 && (
                          <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 ml-0.5">
                            {users.length}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Apple Status Indicator under the last outgoing message */}
            {isMe && isLastInGroup && (
              <div className="flex justify-end pr-1 mt-0.5">
                <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 tracking-tight flex items-center gap-1">
                  {message.status === 'read' ? (
                    <>
                      <span>Lida</span>
                      <CheckCheck className="w-3 h-3 text-[#007aff]" />
                    </>
                  ) : message.status === 'delivered' ? (
                    <>
                      <span>Entregue</span>
                      <Check className="w-3 h-3 text-neutral-400" />
                    </>
                  ) : (
                    <span>Enviando...</span>
                  )}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Typing Bubble */}
      {typingUsers.length > 0 && (
        <div className="flex items-end gap-2 pt-1 animate-in fade-in duration-200">
          <div className="w-7 h-7 flex-shrink-0" />
          <div className="bg-[#e9e9eb] dark:bg-[#262629] px-3.5 py-2.5 rounded-2xl rounded-bl-[4px] shadow-sm flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" />
          </div>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {typingUsers.join(', ')} digitando...
          </span>
        </div>
      )}

      <div ref={scrollEndRef} className="h-2" />
    </div>
  );
};
