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
      className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-5 sm:px-8"
      onClick={() => setActiveTapbackMsgId(null)}
    >
      <div className="mx-auto w-full max-w-[860px] space-y-1.5">
      {groupedItems.map((item) => {
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
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[11px] font-medium text-[#86868b]">
                  {dateDividerText}
                </span>
              </div>
            )}

            {/* Sender name in group chat for incoming clusters */}
            {showSenderName && !isMe && (
              <span className="mb-1 ml-10 mt-3 text-[11px] font-semibold text-[#6e6e73]">
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
              className={`flex items-center opacity-100 transition-opacity sm:opacity-0 sm:group-hover/row:opacity-100 ${
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
                  className="rounded-full p-1 text-[#8e8e93] transition-colors hover:bg-[#f2f2f7] hover:text-[#3a3a3c]"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* Message Bubble Container */}
              <div
                className="relative max-w-[82%] sm:max-w-[68%]"
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
                    ? `bg-[#007aff] text-white shadow-[0_2px_8px_rgba(0,122,255,0.13)] ${
                          isLastInGroup
                            ? 'rounded-2xl rounded-br-[4px]'
                            : 'rounded-2xl'
                        }`
                      : `bg-[#f2f2f7] text-[#1d1d1f] ${
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
                    } z-10 flex cursor-pointer items-center gap-0.5 rounded-full border border-black/[0.05] bg-white px-1.5 py-0.5 shadow-[0_3px_12px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in-75 duration-100 hover:scale-105`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTapbackMsgId(message.id);
                    }}
                  >
                    {Object.entries(message.reactions || {}).map(([emoji, users]) => (
                      <span key={emoji} className="flex items-center text-xs">
                        <span>{emoji}</span>
                        {users.length > 1 && (
                          <span className="ml-0.5 text-[10px] font-bold text-[#6e6e73]">
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
                <span className="flex items-center gap-1 text-[10px] font-medium tracking-tight text-[#8e8e93]">
                  {message.status === 'read' ? (
                    <>
                      <span>Lida</span>
                      <CheckCheck className="w-3 h-3 text-[#007aff]" />
                    </>
                  ) : message.status === 'delivered' ? (
                    <>
                      <span>Entregue</span>
                      <Check className="h-3 w-3 text-[#8e8e93]" />
                    </>
                  ) : message.status === 'sent' ? (
                    <>
                      <span>Enviada</span>
                      <Check className="h-3 w-3 text-[#8e8e93]" />
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
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-[5px] bg-[#f2f2f7] px-3.5 py-2.5">
            <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" />
          </div>
          <span className="text-[11px] text-[#86868b]">
            {typingUsers.join(', ')} digitando...
          </span>
        </div>
      )}

      <div ref={scrollEndRef} className="h-2" />
      </div>
    </div>
  );
};
