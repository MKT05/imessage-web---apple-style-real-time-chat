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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1d1f]/25 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex h-[68px] items-center justify-between border-b border-[#e5e5ea] px-6">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#007aff]" />
            <h3 className="text-[17px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">
              Nova Mensagem
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8e8e93] transition-colors hover:bg-[#f2f2f7] hover:text-[#3a3a3c]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-6 text-[13px]">
          {/* Group mode toggle */}
          {selectedUserIds.length > 1 && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="flex items-center gap-1.5 font-medium text-[#3a3a3c]">
                <Users className="w-3.5 h-3.5 text-[#007aff]" />
                <span>Nome do Grupo</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ex: Equipe do projeto..."
                className="w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-3.5 py-2.5 text-[13px] text-[#1d1d1f] placeholder:text-[#8e8e93] focus:border-[#007aff] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#007aff]/10"
              />
            </div>
          )}

          {/* Contact Selection */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#86868b]">
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
                    className={`flex w-full items-center justify-between rounded-2xl border p-2.5 text-left transition-colors ${
                      isSelected
                        ? 'border-[#007aff]/30 bg-[#f2f7ff]'
                        : 'border-transparent hover:bg-[#f5f5f7]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-[13px] font-medium text-[#1d1d1f]">
                          {user.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#86868b]">
                          {user.statusText || 'Disponível'}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected
                          ? 'border-[#007aff] bg-[#007aff] text-white'
                          : 'border-[#c7c7cc] bg-white'
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
        <div className="flex h-[68px] items-center justify-end gap-2 border-t border-[#e5e5ea] bg-[#fafafd] px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-[13px] font-medium text-[#6e6e73] transition-colors hover:bg-[#f0f0f2]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={selectedUserIds.length === 0}
            className={`rounded-full px-5 py-2 text-[13px] font-medium text-white transition-all ${
              selectedUserIds.length > 0
                ? 'bg-[#007aff] hover:bg-[#006ee6]'
                : 'cursor-not-allowed bg-[#b7d4fa]'
            }`}
          >
            Criar Conversa
          </button>
        </div>
      </div>
    </div>
  );
};
