import { FC, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioMessageBubbleProps {
  duration?: number;
  isMe?: boolean;
}

export const AudioMessageBubble: FC<AudioMessageBubbleProps> = ({
  duration = 14,
  isMe = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 100 / (duration * 10);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlay = () => {
    if (progress >= 100) {
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  // Mock waveform bars
  const bars = [25, 45, 70, 85, 60, 40, 90, 65, 80, 50, 75, 95, 60, 40, 85, 30, 70, 55, 45, 60];

  return (
    <div className="flex items-center gap-3 py-1 px-1 min-w-[210px] select-none">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 ${
          isMe
            ? 'bg-white text-[#007aff] hover:bg-white/90'
            : 'bg-[#007aff] text-white hover:bg-[#0062e0]'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Waveform bars */}
      <div className="flex-1 flex items-center gap-0.5 h-6">
        {bars.map((height, i) => {
          const barProgress = (i / bars.length) * 100;
          const isPassed = progress >= barProgress;
          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-100 ${
                isMe
                  ? isPassed
                    ? 'bg-white opacity-100'
                    : 'bg-white/40'
                  : isPassed
                  ? 'bg-[#007aff] opacity-100'
                  : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      {/* Time duration */}
      <span
        className={`text-xs font-mono font-medium flex-shrink-0 ${
          isMe ? 'text-white/90' : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        0:{duration < 10 ? `0${duration}` : duration}
      </span>
    </div>
  );
};
