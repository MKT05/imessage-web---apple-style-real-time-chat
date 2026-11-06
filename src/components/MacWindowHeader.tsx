import { FC, useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Radio,
  UserCheck,
  ChevronDown,
  Server,
  Sparkles,
} from 'lucide-react';
import { AppleIcon } from './AppleIcon';
import { User } from '../types/chat';

interface MacWindowHeaderProps {
  title: string;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  wsStatus: 'connected' | 'connecting' | 'disconnected';
  simulatedMode: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenWsModal: () => void;
  autoReplyEnabled: boolean;
  onToggleAutoReply: () => void;
}

export const MacWindowHeader: FC<MacWindowHeaderProps> = ({
  title,
  currentUser,
  allUsers,
  onSwitchUser,
  wsStatus,
  simulatedMode,
  soundEnabled,
  onToggleSound,
  darkMode,
  onToggleDarkMode,
  onOpenWsModal,
  autoReplyEnabled,
  onToggleAutoReply,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-12 border-b border-black/[0.08] dark:border-white/[0.08] px-4 flex items-center justify-between select-none relative z-30 bg-white/70 dark:bg-[#1e1e20]/80 backdrop-blur-xl">
      {/* macOS Traffic Lights */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 group mr-2">
          <button
            type="button"
            aria-label="Fechar janela"
            className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] flex items-center justify-center transition-all hover:brightness-90 cursor-default"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#4c0000] leading-none">×</span>
          </button>
          <button
            type="button"
            aria-label="Minimizar janela"
            className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] flex items-center justify-center transition-all hover:brightness-90 cursor-default"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#5c4000] leading-none mb-0.5">-</span>
          </button>
          <button
            type="button"
            aria-label="Expandir janela"
            className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] flex items-center justify-center transition-all hover:brightness-90 cursor-default"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[6px] font-bold text-[#004d0f] leading-none">+</span>
          </button>
        </div>

        {/* WebSocket Connection Status Pill */}
        <button
          type="button"
          onClick={onOpenWsModal}
          title="Clique para configurar WebSocket e ver logs"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-200/60 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700/80 transition-colors text-neutral-700 dark:text-neutral-300 border border-neutral-300/40 dark:border-neutral-700/50"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              wsStatus === 'connected'
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                : wsStatus === 'connecting'
                ? 'bg-amber-500 animate-pulse'
                : simulatedMode
                ? 'bg-blue-500'
                : 'bg-red-500'
            }`}
          />
          <Server className="w-3 h-3 opacity-60" />
          <span className="text-[11px]">
            {wsStatus === 'connected'
              ? 'WS Online'
              : wsStatus === 'connecting'
              ? 'Conectando...'
              : 'Modo Simulador'}
          </span>
        </button>

        {/* Simulated Auto-Reply Toggle */}
        <button
          type="button"
          onClick={onToggleAutoReply}
          title={autoReplyEnabled ? 'Auto-respostas ativadas' : 'Auto-respostas desativadas'}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-colors border ${
            autoReplyEnabled
              ? 'bg-[#007aff]/10 text-[#007aff] border-[#007aff]/30'
              : 'bg-neutral-200/50 dark:bg-neutral-800/50 text-neutral-500 border-transparent'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Auto-reply: {autoReplyEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Center Title */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
        <AppleIcon className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200 fill-current mb-0.5" />
        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight">
          Mensagens
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* User Switcher Dropdown (Multi-user testing) */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-neutral-200/70 dark:bg-neutral-800/80 hover:bg-neutral-300/70 dark:hover:bg-neutral-700/80 transition-all border border-neutral-300/40 dark:border-neutral-700/40 text-xs font-medium text-neutral-800 dark:text-neutral-200"
            title="Alternar usuário ativo para simular múltiplos participantes"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover border border-white/20"
            />
            <span className="text-[11px] max-w-[90px] truncate">
              {currentUser.name.split(' ')[0]} (Você)
            </span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white/95 dark:bg-[#252528]/95 backdrop-blur-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-700/80 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 mb-1 border-b border-neutral-200/60 dark:border-neutral-700/60">
                <p className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                  Alternar Usuário Ativo
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Envie mensagens como qualquer participante
                </p>
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
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                      isActive
                        ? 'bg-[#007aff] text-white font-medium'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs leading-none">{user.name}</p>
                        <p
                          className={`text-[10px] mt-0.5 leading-none ${
                            isActive ? 'text-white/80' : 'text-neutral-400 dark:text-neutral-500'
                          }`}
                        >
                          {user.statusText || 'Participante'}
                        </p>
                      </div>
                    </div>
                    {isActive && <UserCheck className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Silenciar sons do chat' : 'Ativar sons do chat'}
          title={soundEnabled ? 'Efeitos sonoros ativados' : 'Efeitos sonoros desativados'}
          className="p-1.5 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          className="p-1.5 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
