import { FC } from 'react';
import {
  X,
  Bell,
  BellOff,
  Trash2,
  Image as ImageIcon,
  Users,
  ShieldCheck,
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
    <aside className="w-72 h-full border-l border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl flex flex-col select-none z-20">
      {/* Top Header */}
      <div className="h-14 border-b border-black/[0.08] dark:border-white/[0.08] px-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Detalhes
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="p-1 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center pb-2">
          <img
            src={conversation.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={conversation.name}
            className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-white dark:border-neutral-800 mb-2.5"
          />
          <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {conversation.name}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {conversation.isGroup ? 'Conversa em Grupo' : 'iMessage'}
          </p>
        </div>

        {/* Participants list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              <span>Participantes ({conversation.participants.length})</span>
            </span>
          </div>

          <div className="space-y-1 bg-neutral-100/60 dark:bg-neutral-800/40 rounded-xl p-1.5 border border-black/[0.04] dark:border-white/[0.04]">
            {conversation.participants.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-neutral-900 ${
                        user.isOnline ? 'bg-emerald-500' : 'bg-neutral-400'
                      }`}
                    />
                  </div>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {user.name}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400">
                  {user.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shared photos */}
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <ImageIcon className="w-3 h-3" />
            <span>Fotos & Mídias Compartilhadas</span>
          </span>

          <div className="grid grid-cols-3 gap-1.5">
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop&q=80"
              alt="MacBook"
              className="w-full h-16 rounded-lg object-cover hover:opacity-80 transition-opacity cursor-pointer"
            />
            <img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80"
              alt="iPhone"
              className="w-full h-16 rounded-lg object-cover hover:opacity-80 transition-opacity cursor-pointer"
            />
            <img
              src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200&auto=format&fit=crop&q=80"
              alt="iPad"
              className="w-full h-16 rounded-lg object-cover hover:opacity-80 transition-opacity cursor-pointer"
            />
          </div>
        </div>

        {/* Security & Encryption badge */}
        <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#007aff] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Mensagens e chamadas são protegidas com criptografia de ponta a ponta.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-black/[0.08] dark:border-white/[0.08]">
          <button
            type="button"
            onClick={onClearChat}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Mensagens desta Conversa</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
