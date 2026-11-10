import { FC, useState, useRef, useEffect, KeyboardEvent } from 'react';
import {
  ArrowUp,
  Plus,
  Mic,
  Image as ImageIcon,
  Smile,
  X,
  FileText,
} from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (
    text: string,
    type?: 'text' | 'image' | 'audio' | 'system',
    attachmentUrl?: string,
    audioDuration?: number
  ) => void;
  onTyping: (isTyping: boolean) => void;
}

export const MessageInput: FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
}) => {
  const [text, setText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Recording counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleTextChange = (val: string) => {
    setText(val);

    // Notify typing status
    onTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text, 'text');
    setText('');
    onTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Send simulated voice memo
  const handleSendVoiceNote = () => {
    setIsRecording(false);
    const duration = Math.max(recordingSeconds, 8);
    onSendMessage('Gravação de Áudio', 'audio', undefined, duration);
  };

  // Send sample photo attachment
  const handleSendImageSample = (url: string, caption = '') => {
    setShowAttachMenu(false);
    onSendMessage(caption, 'image', url);
  };

  return (
    <div className="relative shrink-0 border-t border-[#e5e5ea] bg-white px-4 py-4 sm:px-7">
      {/* Attachment popover */}
      {showAttachMenu && (
        <div className="absolute bottom-[76px] left-5 z-30 w-60 animate-in fade-in zoom-in-95 rounded-2xl border border-black/[0.06] bg-white p-2 shadow-[0_14px_40px_rgba(0,0,0,0.16)] duration-100 sm:left-8">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() =>
                handleSendImageSample(
                  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=80',
                  'Foto de exemplo'
                )
              }
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 hover:bg-[#007aff] hover:text-white transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-[#007aff] group-hover:text-white" />
              <span>Enviar Foto / Imagem</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(false);
                setIsRecording(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 hover:bg-[#007aff] hover:text-white transition-colors"
            >
              <Mic className="w-4 h-4 text-[#ff2d55]" />
              <span>Gravar Mensagem de Áudio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(false);
                onSendMessage('Relatório_Sprint_Keynote.pdf', 'system');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 hover:bg-[#007aff] hover:text-white transition-colors"
            >
              <FileText className="w-4 h-4 text-[#34c759]" />
              <span>Compartilhar Documento</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Apple Input Bar */}
      <div className="mx-auto flex max-w-4xl items-end gap-2.5">
        {/* Plus / App Store button */}
        <button
          type="button"
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          aria-label="Adicionar anexo"
          className={`mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
            showAttachMenu
              ? 'rotate-45 bg-[#007aff] text-white'
              : 'bg-[#f2f2f7] text-[#6e6e73] hover:bg-[#e5e5ea]'
          }`}
        >
          <Plus className="w-4 h-4 transition-transform" />
        </button>

        {/* Input or Voice Recording Bar */}
        <div className="flex min-h-[46px] max-h-36 flex-1 items-center rounded-[20px] border border-[#e5e5ea] bg-[#f5f5f7] px-4 py-2 transition focus-within:border-[#007aff]/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#007aff]/[0.08]">
          {isRecording ? (
            <div className="flex-1 flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-mono text-red-500 font-semibold">
                  Gravando áudio ({Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsRecording(false)}
                  className="px-2 py-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSendVoiceNote}
                  className="px-3 py-1 rounded-full bg-[#007aff] text-white text-xs font-medium hover:bg-[#0062e0]"
                >
                  Enviar
                </button>
              </div>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => {
                handleTextChange(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Mensagem"
              className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-[#1d1d1f] placeholder:text-[#8e8e93] focus:outline-none"
            />
          )}

          {!isRecording && !text.trim() && (
            <button
              type="button"
              onClick={() => setIsRecording(true)}
              aria-label="Gravar áudio"
              title="Gravar mensagem de voz"
              className="ml-2 rounded-full p-1 text-[#8e8e93] transition-colors hover:text-[#007aff]"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          aria-label="Enviar mensagem"
          className={`mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
            text.trim()
              ? 'bg-[#007aff] text-white shadow-[0_2px_7px_rgba(0,122,255,0.25)] hover:bg-[#006ee6] active:scale-95'
              : 'cursor-not-allowed bg-[#f2f2f7] text-[#c7c7cc]'
          }`}
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
