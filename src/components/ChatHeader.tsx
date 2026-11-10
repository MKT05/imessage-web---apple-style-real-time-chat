import { FC } from 'react';
import { ArrowLeft, Info, Sparkles, Users } from 'lucide-react';
import { ChatConversation } from '../types/chat';

interface ChatHeaderProps {
  conversation: ChatConversation;
  onToggleInfo: () => void;
  infoOpen: boolean;
  onSimulateIncoming: () => void;
  onBack: () => void;
}

export const ChatHeader: FC<ChatHeaderProps> = ({
  conversation,
  onToggleInfo,
  infoOpen,
  onSimulateIncoming,
  onBack,
}) => {
  return (
    <header className="flex h-[76px] shrink-0 items-center justify-between gap-3 border-b border-[#e5e5ea] bg-white px-4 sm:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar para conversas"
          className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#007aff] transition hover:bg-[#f2f7ff] md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="relative block shrink-0">
          {conversation.isGroup ? (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#b7d9ff] to-[#e0eaff] text-[#0066cc]">
              <Users className="h-[18px] w-[18px]" />
            </span>
          ) : (
            <>
              <img
                src={conversation.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt=""
                className="h-11 w-11 rounded-full object-cover ring-1 ring-black/[0.05]"
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#34c759]" />
            </>
          )}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
            {conversation.name}
          </h2>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-[#86868b]">
            {conversation.isGroup ? (
              <>
                <Users className="h-3 w-3 shrink-0" />
                <span>{conversation.participants.length} participantes</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#34c759]" />
                <span>Ativo agora</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onSimulateIncoming}
          title="Enviar uma mensagem de demonstração"
          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium text-[#007aff] transition hover:bg-[#f2f7ff]"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Testar conversa</span>
        </button>
        <button
          type="button"
          onClick={onToggleInfo}
          aria-label="Detalhes da conversa"
          aria-pressed={infoOpen}
          title="Detalhes da conversa"
          className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
            infoOpen ? 'bg-[#eaf3ff] text-[#007aff]' : 'text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]'
          }`}
        >
          <Info className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
};
