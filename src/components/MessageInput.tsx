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
    <div className="p-3 bg-white/70 dark:bg-[#1e1e20]/80 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/[0.08] relative select-none">
      {/* Attachment popover */}
      {showAttachMenu && (
        <div className="absolute bottom-16 left-4 bg-white/95 dark:bg-[#252528]/95 backdrop-blur-2xl rounded-2xl p-2 shadow-2xl border border-black/10 dark:border-white/10 z-30 animate-in fade-in zoom-in-95 duration-100 w-56">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() =>
                handleSendImageSample(
                  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
                  ' Mockup do MacBook Pro Sonoma'
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
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        {/* Plus / App Store button */}
        <button
          type="button"
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          aria-label="Adicionar anexo"
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            showAttachMenu
              ? 'bg-[#007aff] text-white rotate-45'
              : 'bg-neutral-200/80 dark:bg-neutral-800/80 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
          }`}
        >
          <Plus className="w-4 h-4 transition-transform" />
        </button>

        {/* Input or Voice Recording Bar */}
        <div className="flex-1 min-h-[38px] max-h-32 rounded-2xl bg-neutral-200/60 dark:bg-neutral-800/80 border border-neutral-300/40 dark:border-neutral-700/50 flex items-center px-3 py-1.5 focus-within:bg-white dark:focus-within:bg-neutral-900 focus-within:border-[#007aff]/60 transition-all">
          {isRecording ? (
            <div className="flex-1 flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-mono text-red-500 font-semibold">
                  Gravando áudio (0:0{recordingSeconds})
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
              placeholder="iMessage"
              className="w-full bg-transparent resize-none text-[14px] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none leading-relaxed"
            />
          )}

          {!isRecording && !text.trim() && (
            <button
              type="button"
              onClick={() => setIsRecording(true)}
              aria-label="Gravar áudio"
              title="Gravar mensagem de voz"
              className="ml-2 text-neutral-400 hover:text-[#007aff] transition-colors p-1"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Send Button (Apple Blue Circle with Up Arrow) */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          aria-label="Enviar mensagem"
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            text.trim()
              ? 'bg-[#007aff] hover:bg-[#006ee6] text-white shadow-md active:scale-95'
              : 'bg-neutral-300/60 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
          }`}
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
