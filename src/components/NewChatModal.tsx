import { FC, useState } from 'react';
import { X, Check, Users, UserPlus } from 'lucide-react';
import { User } from '../types/chat';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUserId: string;
  onCreateChat: (name: string, participants: User[], isGroup: boolean) => void;
}

export const NewChatModal: FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUserId,
  onCreateChat,
}) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isGroup, setIsGroup] = useState(false);

  if (!isOpen) return null;

  const availableUsers = users.filter((u) => u.id !== currentUserId);

  const toggleUserSelection = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      const next = [...selectedUserIds, userId];
      setSelectedUserIds(next);
      if (next.length > 1) {
        setIsGroup(true);
      }
    }
  };

  const handleCreate = () => {
    if (selectedUserIds.length === 0) return;

    const selectedUsers = users.filter((u) => selectedUserIds.includes(u.id));
    const title = isGroup
      ? groupName.trim() || `Grupo com ${selectedUsers.map((u) => u.name.split(' ')[0]).join(', ')}`
      : selectedUsers[0].name;

    onCreateChat(title, selectedUsers, isGroup);
    setSelectedUserIds([]);
    setGroupName('');
    setIsGroup(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white/95 dark:bg-[#242426]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-12 border-b border-black/[0.08] dark:border-white/[0.08] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#007aff]" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Nova Mensagem
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Group mode toggle */}
          {selectedUserIds.length > 1 && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#007aff]" />
                <span>Nome do Grupo</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ex: Projeto Apple Watch..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[#007aff]"
              />
            </div>
          )}

          {/* Contact Selection */}
          <div className="space-y-1.5">
            <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
              Selecione o(s) participante(s):
            </span>

            <div className="space-y-1 max-h-56 overflow-y-auto">
              {availableUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleUserSelection(user.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors text-left ${
                      isSelected
                        ? 'bg-[#007aff]/10 border border-[#007aff]/30'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 text-xs">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          {user.statusText || 'Disponível'}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-[#007aff] border-[#007aff] text-white'
                          : 'border-neutral-300 dark:border-neutral-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-black/[0.08] dark:border-white/[0.08] px-4 flex items-center justify-end gap-2 bg-neutral-50 dark:bg-[#1f1f22]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={selectedUserIds.length === 0}
            className={`px-4 py-1.5 rounded-lg font-medium text-white transition-all ${
              selectedUserIds.length > 0
                ? 'bg-[#007aff] hover:bg-[#006ee6] shadow-sm'
                : 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed opacity-60'
            }`}
          >
            Criar Conversa
          </button>
        </div>
      </div>
    </div>
  );
};
