import { FC } from 'react';
import { TapbackEmoji } from '../types/chat';

interface TapbackMenuProps {
  onSelectReaction: (emoji: TapbackEmoji) => void;
  onClose: () => void;
  activeEmoji?: string;
  isMe?: boolean;
}

const TAPBACK_OPTIONS: { emoji: TapbackEmoji; label: string }[] = [
  { emoji: '❤️', label: 'Amar' },
  { emoji: '👍', label: 'Gostei' },
  { emoji: '👎', label: 'Não gostei' },
  { emoji: '😂', label: 'Riso' },
  { emoji: '‼️', label: 'Ênfase' },
  { emoji: '❓', label: 'Dúvida' },
];

export const TapbackMenu: FC<TapbackMenuProps> = ({
  onSelectReaction,
  onClose,
  activeEmoji,
  isMe = false,
}) => {
  return (
    <div
      className={`absolute z-30 -top-11 ${
        isMe ? 'right-2' : 'left-2'
      } flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 dark:bg-[#2c2c2e]/95 backdrop-blur-2xl shadow-xl border border-black/10 dark:border-white/10 animate-in fade-in zoom-in-90 duration-150`}
      onClick={(e) => e.stopPropagation()}
    >
      {TAPBACK_OPTIONS.map((item) => {
        const isSelected = activeEmoji === item.emoji;
        return (
          <button
            key={item.emoji}
            type="button"
            onClick={() => {
              onSelectReaction(item.emoji);
              onClose();
            }}
            title={item.label}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-transform hover:scale-125 active:scale-95 ${
              isSelected
                ? 'bg-[#007aff]/15 dark:bg-[#007aff]/30 scale-110'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
            }`}
          >
            <span>{item.emoji}</span>
          </button>
        );
      })}
    </div>
  );
};
