import { FC } from 'react';
import { Pin, Search, SquarePen, Users, X } from 'lucide-react';
import { ChatConversation } from '../types/chat';
import { formatConversationDate } from '../utils/chatLogic';

interface SidebarProps {
  conversations: ChatConversation[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export const Sidebar: FC<SidebarProps> = ({
  conversations,
  activeChatId,
  onSelectChat,
  onNewChat,
  searchQuery,
  onSearchChange,
  className = '',
}) => {
  const pinnedConversations = conversations.filter((conversation) => conversation.isPinned);
  const unpinnedConversations = conversations.filter((conversation) => !conversation.isPinned);

  const renderConversation = (conversation: ChatConversation) => {
    const isSelected = conversation.id === activeChatId;

    return (
      <button
        key={conversation.id}
        type="button"
        onClick={() => onSelectChat(conversation.id)}
        aria-current={isSelected ? 'true' : undefined}
        className={`conversation-row group flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition ${
          isSelected
            ? 'conversation-row-selected bg-[#eaf3ff]'
            : 'hover:bg-white/80'
        }`}
      >
        <span className="relative block shrink-0">
          {conversation.isGroup ? (
            <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gradient-to-br from-[#b7d9ff] to-[#e0eaff] text-[#0066cc]">
              <Users className="h-5 w-5" />
            </span>
          ) : (
            <>
              <img
                src={conversation.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt=""
                className="h-[50px] w-[50px] rounded-full object-cover ring-1 ring-black/[0.04]"
              />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#f5f5f7] bg-[#34c759]" />
            </>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className={`truncate text-[13px] font-semibold ${isSelected ? 'text-[#0066cc]' : 'text-[#1d1d1f]'}`}>
              {conversation.name}
            </span>
            <span className="shrink-0 text-[10px] text-[#8e8e93]">
              {conversation.lastTimestamp ? formatConversationDate(conversation.lastTimestamp) : ''}
            </span>
          </span>
          <span className="mt-1 flex items-center justify-between gap-2">
            <span className={`truncate text-[12px] ${conversation.unreadCount > 0 ? 'font-medium text-[#3a3a3c]' : 'text-[#86868b]'}`}>
              {conversation.lastMessage || 'Comece uma conversa'}
            </span>
            {conversation.unreadCount > 0 && (
              <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[#007aff] px-1 text-[10px] font-semibold text-white">
                {conversation.unreadCount}
              </span>
            )}
          </span>
        </span>
      </button>
    );
  };

  return (
    <aside className={`flex h-full min-h-0 w-full shrink-0 flex-col border-r border-[#e5e5ea] bg-[#f5f5f7] md:w-[320px] ${className}`}>
      <div className="flex items-center justify-between px-5 pb-3 pt-6">
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.04em] text-[#1d1d1f]">Conversas</h2>
          <p className="mt-0.5 text-[12px] text-[#86868b]">Suas mensagens recentes</p>
        </div>
        <button
          type="button"
          onClick={onNewChat}
          aria-label="Nova conversa"
          title="Escrever nova mensagem"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#007aff] text-white shadow-[0_2px_6px_rgba(0,122,255,0.22)] transition hover:bg-[#006ee6] active:scale-95"
        >
          <SquarePen className="h-[17px] w-[17px]" />
        </button>
      </div>

      <div className="px-4 pb-4">
        <label className="relative flex h-10 items-center rounded-xl border border-[#e5e5ea] bg-white px-3 shadow-sm shadow-black/[0.02] focus-within:border-[#007aff]/50 focus-within:ring-2 focus-within:ring-[#007aff]/10">
          <Search className="h-4 w-4 shrink-0 text-[#8e8e93]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar"
            aria-label="Buscar conversas"
            className="ml-2 min-w-0 flex-1 bg-transparent text-[13px] text-[#1d1d1f] placeholder:text-[#8e8e93] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Limpar busca"
              className="ml-1 rounded-full p-0.5 text-[#8e8e93] transition hover:bg-[#e5e5ea] hover:text-[#3a3a3c]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {searchQuery ? (
          <div className="space-y-1">{conversations.map(renderConversation)}</div>
        ) : (
          <>
            {pinnedConversations.length > 0 && (
              <section className="mb-4">
                <h3 className="mb-1.5 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8e8e93]">
                  <Pin className="h-3 w-3" /> Fixadas
                </h3>
                <div className="space-y-1">{pinnedConversations.map(renderConversation)}</div>
              </section>
            )}
            {unpinnedConversations.length > 0 && (
              <section>
                {pinnedConversations.length > 0 && (
                  <h3 className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8e8e93]">
                    Recentes
                  </h3>
                )}
                <div className="space-y-1">{unpinnedConversations.map(renderConversation)}</div>
              </section>
            )}
          </>
        )}

        {conversations.length === 0 && (
          <div className="px-3 py-12 text-center">
            <p className="text-[13px] font-medium text-[#6e6e73]">Nenhuma conversa encontrada</p>
            <p className="mt-1 text-[12px] text-[#8e8e93]">Tente outro nome ou mensagem.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
