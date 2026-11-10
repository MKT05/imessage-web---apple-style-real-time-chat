import { FC, useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Radio,
  Server,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { User } from '../types/chat';

interface AppToolbarProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  wsStatus: 'connected' | 'connecting' | 'disconnected';
  simulatedMode: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenWsModal: () => void;
  autoReplyEnabled: boolean;
  onToggleAutoReply: () => void;
}

export const AppToolbar: FC<AppToolbarProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  wsStatus,
  simulatedMode,
  soundEnabled,
  onToggleSound,
  onOpenWsModal,
  autoReplyEnabled,
  onToggleAutoReply,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const connectionLabel =
    wsStatus === 'connected'
      ? 'Conectado'
      : wsStatus === 'connecting'
        ? 'Conectando'
        : simulatedMode
          ? 'Modo de demonstração'
          : 'Desconectado';

  const connectionColor =
    wsStatus === 'connected'
      ? 'bg-[#34c759]'
      : wsStatus === 'connecting'
        ? 'bg-[#ff9f0a] animate-pulse'
        : simulatedMode
          ? 'bg-[#007aff]'
          : 'bg-[#ff3b30]';

  return (
    <header className="app-toolbar relative z-30 flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-[#e5e5ea] bg-white px-5 sm:px-7">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b]">
          Chat em tempo real
        </p>
        <h1 className="truncate text-[19px] font-semibold tracking-[-0.035em] text-[#1d1d1f]">
          Mensagens
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenWsModal}
          title="Ver conexão e atividade do servidor"
          className="toolbar-control hidden items-center gap-2 sm:flex"
        >
          <span className={`h-2 w-2 rounded-full ${connectionColor}`} />
          <span>{connectionLabel}</span>
          <Server className="h-3.5 w-3.5 text-[#86868b]" />
        </button>

        <button
          type="button"
          onClick={onToggleAutoReply}
          aria-pressed={autoReplyEnabled}
          title={autoReplyEnabled ? 'Desativar respostas de demonstração' : 'Ativar respostas de demonstração'}
          className={`toolbar-icon-button ${autoReplyEnabled ? 'toolbar-icon-button-active' : ''}`}
        >
          <Sparkles className="h-[17px] w-[17px]" />
          <span className="hidden lg:inline">Respostas automáticas</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen((open) => !open)}
            aria-expanded={userDropdownOpen}
            aria-label={`Usuário atual: ${currentUser.name}`}
            className="flex h-10 items-center gap-2 rounded-full border border-[#e5e5ea] bg-white py-1 pl-1 pr-2.5 transition hover:bg-[#f5f5f7]"
          >
            <img
              src={currentUser.avatar}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="hidden max-w-[112px] truncate text-[13px] font-medium text-[#1d1d1f] sm:inline">
              {currentUser.name.split(' ')[0]}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[#86868b]" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.14)] animate-in fade-in zoom-in-95 duration-100">
              <div className="border-b border-[#f0f0f2] px-3 py-2.5">
                <p className="text-[11px] font-medium text-[#86868b]">PERFIL DE TESTE</p>
                <p className="mt-0.5 text-xs text-[#6e6e73]">Troque o remetente desta sessão</p>
              </div>
              {allUsers.map((user) => {
                const isActive = user.id === currentUser.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      onSwitchUser(user);
                      setUserDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition ${
                      isActive ? 'bg-[#f2f7ff]' : 'hover:bg-[#f5f5f7]'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-[#1d1d1f]">
                          {user.name}
                        </span>
                        <span className="block truncate text-[11px] text-[#86868b]">
                          {user.statusText || 'Participante'}
                        </span>
                      </span>
                    </span>
                    {isActive && <Check className="h-4 w-4 text-[#007aff]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Silenciar sons' : 'Ativar sons'}
          title={soundEnabled ? 'Sons ativados' : 'Sons desativados'}
          className="toolbar-icon-button h-10 w-10 justify-center px-0"
        >
          {soundEnabled ? <Volume2 className="h-[17px] w-[17px]" /> : <VolumeX className="h-[17px] w-[17px]" />}
        </button>

        <button
          type="button"
          onClick={onOpenWsModal}
          aria-label={`Status da conexão: ${connectionLabel}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e5ea] bg-white sm:hidden"
        >
          <Radio className={`h-4 w-4 ${wsStatus === 'connected' ? 'text-[#34c759]' : 'text-[#007aff]'}`} />
        </button>
      </div>
    </header>
  );
};
