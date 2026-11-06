import { FC } from 'react';
import {
  Video,
  Phone,
  Info,
  Users,
  Sparkles,
} from 'lucide-react';
import { ChatConversation } from '../types/chat';

interface ChatHeaderProps {
  conversation: ChatConversation;
  onToggleInfo: () => void;
  infoOpen: boolean;
  onSimulateIncoming: () => void;
}

export const ChatHeader: FC<ChatHeaderProps> = ({
  conversation,
  onToggleInfo,
  infoOpen,
  onSimulateIncoming,
}) => {
  return (
    <header className="h-14 border-b border-black/[0.08] dark:border-white/[0.08] px-4 flex items-center justify-between mac-glass select-none relative z-10">
      {/* Contact / Group Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={conversation.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={conversation.name}
            className="w-9 h-9 rounded-full object-cover shadow-sm border border-black/10 dark:border-white/10"
          />
          {!conversation.isGroup && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-neutral-900 bg-emerald-500" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight leading-tight">
              {conversation.name}
            </h2>
            {conversation.isGroup && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium">
                {conversation.participants.length}
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-none mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            {conversation.isGroup
              ? `${conversation.participants.map((p) => p.name.split(' ')[0]).join(', ')}`
              : 'iMessage • Ativo agora'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Simulate incoming test message button */}
        <button
          type="button"
          onClick={onSimulateIncoming}
          title="Simular mensagem recebida instantânea para teste"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#007aff] hover:bg-[#007aff]/10 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Simular Mensagem</span>
        </button>

        {/* FaceTime Video Call */}
        <button
          type="button"
          aria-label="Iniciar chamada de vídeo FaceTime"
          title="FaceTime Vídeo"
          className="p-2 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-200"
        >
          <Video className="w-4 h-4" />
        </button>

        {/* FaceTime Audio Call */}
        <button
          type="button"
          aria-label="Iniciar chamada de áudio"
          title="FaceTime Áudio"
          className="p-2 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-200"
        >
          <Phone className="w-4 h-4" />
        </button>

        {/* Info button */}
        <button
          type="button"
          onClick={onToggleInfo}
          aria-label="Detalhes da conversa"
          title="Detalhes da conversa"
          className={`p-2 rounded-lg transition-colors ${
            infoOpen
              ? 'bg-[#007aff] text-white shadow-sm'
              : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
          }`}
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
