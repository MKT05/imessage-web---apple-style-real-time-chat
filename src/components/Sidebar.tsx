import { FC, useState } from 'react';
import {
  Search,
  SquarePen,
  Pin,
  X,
  Users,
} from 'lucide-react';
import { ChatConversation } from '../types/chat';
import { formatConversationDate } from '../utils/chatLogic';

interface SidebarProps {
  conversations: ChatConversation[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Sidebar: FC<SidebarProps> = ({
  conversations,
  activeChatId,
  onSelectChat,
  onNewChat,
  searchQuery,
  onSearchChange,
}) => {
  const pinnedConversations = conversations.filter((c) => c.isPinned);
  const unpinnedConversations = conversations.filter((c) => !c.isPinned);

  return (
    <aside className="w-80 h-full flex flex-col border-r border-black/[0.08] dark:border-white/[0.08] mac-sidebar-glass select-none flex-shrink-0">
      {/* Top Header */}
      <div className="p-3 pb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 pl-1">
          Mensagens
        </h1>
        <button
          type="button"
          onClick={onNewChat}
          aria-label="Nova conversa"
          title="Escrever nova mensagem"
          className="p-1.5 rounded-lg hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 text-[#007aff] transition-colors"
        >
          <SquarePen className="w-4 h-4" />
        </button>
      </div>

      {/* Apple Search Bar */}
      <div className="px-3 pb-2">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-neutral-200/60 dark:bg-neutral-800/80 border border-transparent focus:border-[#007aff]/50 focus:bg-white dark:focus:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
              aria-label="Limpar busca"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {/* Pinned Section */}
        {pinnedConversations.length > 0 && !searchQuery && (
          <div className="pt-1 pb-3 px-1 border-b border-black/[0.05] dark:border-white/[0.05] mb-2">
            <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider mb-2 px-1">
              <Pin className="w-2.5 h-2.5" />
              <span>Fixados</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {pinnedConversations.map((chat) => {
                const isSelected = chat.id === activeChatId;
                return (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => onSelectChat(chat.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative ${
                      isSelected
                        ? 'bg-neutral-300/40 dark:bg-neutral-700/40 shadow-sm'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="relative mb-1">
                      <img
                        src={chat.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={chat.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-neutral-800 shadow-sm"
                      />
                      {chat.unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#007aff] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md border border-white dark:border-neutral-900">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 text-center truncate max-w-[100px]">
                      {chat.name.replace(' ', '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Conversation Items */}
        <div className="space-y-0.5">
          {conversations.map((chat) => {
            const isSelected = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelectChat(chat.id)}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-all text-left relative ${
                  isSelected
                    ? 'bg-[#007aff] text-white shadow-sm'
                    : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-neutral-900 dark:text-neutral-100'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <img
                    src={chat.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={chat.name}
                    className="w-11 h-11 rounded-full object-cover shadow-sm"
                  />
                  {chat.isGroup ? (
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                        isSelected
                          ? 'bg-white text-[#007aff]'
                          : 'bg-neutral-800 text-white dark:bg-white dark:text-black'
                      }`}
                    >
                      <Users className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                        isSelected ? 'border-[#007aff]' : 'border-white dark:border-neutral-900'
                      } bg-emerald-500`}
                    />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <span
                      className={`text-[13px] font-semibold truncate ${
                        isSelected ? 'text-white' : 'text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      {chat.name}
                    </span>
                    <span
                      className={`text-[11px] flex-shrink-0 ml-1.5 ${
                        isSelected ? 'text-white/80' : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {chat.lastTimestamp ? formatConversationDate(chat.lastTimestamp) : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p
                      className={`text-[12px] truncate ${
                        isSelected
                          ? 'text-white/85'
                          : chat.unreadCount > 0
                          ? 'font-medium text-neutral-900 dark:text-neutral-100'
                          : 'text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      {chat.lastMessage || 'Nenhuma mensagem recente'}
                    </p>

                    {chat.unreadCount > 0 && !isSelected && (
                      <span className="ml-2 w-4 h-4 rounded-full bg-[#007aff] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {conversations.length === 0 && (
            <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
              Nenhuma conversa encontrada
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
