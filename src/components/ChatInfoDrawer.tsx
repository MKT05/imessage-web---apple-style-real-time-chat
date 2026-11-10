import { FC } from 'react';
import {
  X,
  Trash2,
  Users,
  Database,
} from 'lucide-react';
import { ChatConversation } from '../types/chat';

interface ChatInfoDrawerProps {
  conversation: ChatConversation;
  onClose: () => void;
  onClearChat: () => void;
}

export const ChatInfoDrawer: FC<ChatInfoDrawerProps> = ({
  conversation,
  onClose,
  onClearChat,
}) => {
  return (
    <aside className="absolute inset-y-0 right-0 z-20 flex h-full w-[min(88vw,320px)] flex-col border-l border-[#e5e5ea] bg-white shadow-[-12px_0_36px_rgba(0,0,0,0.08)] md:relative md:inset-auto md:w-[300px] md:shrink-0 md:shadow-none">
      {/* Top Header */}
      <div className="flex h-[76px] items-center justify-between border-b border-[#e5e5ea] px-5">
        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
          Detalhes
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#86868b] transition-colors hover:bg-[#f2f2f7] hover:text-[#1d1d1f]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {/* Profile Card */}
        <div className="flex flex-col items-center border-b border-[#f0f0f2] pb-5 text-center">
          {conversation.isGroup ? (
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#b7d9ff] to-[#e0eaff] text-[#0066cc]">
              <Users className="h-8 w-8" />
            </div>
          ) : (
            <img
              src={conversation.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt=""
              className="mb-3 h-20 w-20 rounded-full object-cover shadow-sm ring-1 ring-black/[0.05]"
            />
          )}
          <h4 className="text-[17px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">
            {conversation.name}
          </h4>
          <p className="mt-1 text-[12px] text-[#86868b]">
            {conversation.isGroup ? 'Conversa em grupo' : 'Conversa individual'}
          </p>
        </div>

        {/* Participants list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#86868b]">
              <Users className="w-3 h-3" />
              <span>Participantes ({conversation.participants.length})</span>
            </span>
          </div>

              <div className="space-y-1 rounded-2xl border border-[#e5e5ea] bg-[#f9f9fb] p-1.5">
            {conversation.participants.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white ${
                        user.isOnline ? 'bg-emerald-500' : 'bg-neutral-400'
                      }`}
                    />
                  </div>
                  <span className="font-medium text-[#3a3a3c]">
                    {user.name}
                  </span>
                </div>
                <span className="text-[10px] text-[#8e8e93]">
                  {user.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-2xl border border-[#e5e5ea] bg-[#f5f5f7] p-3 text-xs text-[#3a3a3c]">
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-[#007aff]" />
          <p className="text-[11px] leading-relaxed text-[#6e6e73]">
            As mensagens desta conversa são guardadas no histórico do servidor.
          </p>
        </div>

        {/* Actions */}
        <div className="border-t border-[#e5e5ea] pt-4">
          <button
            type="button"
            onClick={onClearChat}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[12px] font-medium text-[#ff3b30] transition-colors hover:bg-[#fff2f1]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Mensagens desta Conversa</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
