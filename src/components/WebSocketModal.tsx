import { FC, useState } from 'react';
import {
  X,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Code2,
} from 'lucide-react';
import { PacketLogEntry } from '../hooks/useWebSocketChat';

interface WebSocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  wsUrl: string;
  onUpdateWsUrl: (url: string) => void;
  wsStatus: 'connected' | 'connecting' | 'disconnected';
  simulatedMode: boolean;
  onReconnect: (url?: string) => void;
  packetLogs: PacketLogEntry[];
}

export const WebSocketModal: FC<WebSocketModalProps> = ({
  isOpen,
  onClose,
  wsUrl,
  onUpdateWsUrl,
  wsStatus,
  simulatedMode,
  onReconnect,
  packetLogs,
}) => {
  const [inputUrl, setInputUrl] = useState(wsUrl);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'logs' | 'protocol'>('status');

  if (!isOpen) return null;

  const handleSaveAndConnect = () => {
    onUpdateWsUrl(inputUrl);
    onReconnect(inputUrl);
  };

  const sampleServerCode = `# Modo de execução completo
npm run build
npm start

# Modo de desenvolvimento (use dois terminais)
npm run dev:server
npm run dev

# Interface e WebSocket: http://localhost:3000 e ws://localhost:3000/ws`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleServerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1d1f]/25 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex h-[72px] items-center justify-between border-b border-[#e5e5ea] px-5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f2f7ff] text-[#007aff]">
              <Server className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                Central de Conexão WebSocket
              </h3>
              <p className="text-[11px] text-[#86868b]">
                Integração do chat com o servidor Node.js
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel de conexão"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#8e8e93] transition-colors hover:bg-[#f2f2f7] hover:text-[#1d1d1f]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-5 overflow-x-auto border-b border-[#e5e5ea] px-5 pt-3 text-[12px] sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-[#007aff] text-[#007aff]'
                : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            Status da Conexão
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`pb-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-[#007aff] text-[#007aff]'
                : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            <span>Tráfego de Pacotes</span>
            <span className="rounded-full bg-[#f2f2f7] px-1.5 py-0.5 text-[10px] text-[#6e6e73]">
              {packetLogs.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('protocol')}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'protocol'
                ? 'border-[#007aff] text-[#007aff]'
                : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            Especificação do Protocolo
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs sm:p-6">
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Connection Status Banner */}
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4 ${
                  wsStatus === 'connected'
                    ? 'border-[#b7ebc6] bg-[#f0fbf3] text-[#1d6b36]'
                    : wsStatus === 'connecting'
                    ? 'border-[#f7d9a4] bg-[#fff9ed] text-[#8a5b00]'
                    : 'border-[#cfe2ff] bg-[#f2f7ff] text-[#164f9c]'
                }`}
              >
                {wsStatus === 'connected' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Activity className="w-5 h-5 text-[#007aff] flex-shrink-0 mt-0.5 animate-pulse" />
                )}

                <div className="space-y-1">
                  <h4 className="text-[14px] font-semibold">
                    {wsStatus === 'connected'
                      ? 'Conectado ao Servidor WebSocket!'
                      : wsStatus === 'connecting'
                      ? 'Conectando ao servidor WebSocket...'
                      : 'Modo Simulador Interativo Ativo'}
                  </h4>
                  <p className="text-[12px] leading-relaxed opacity-90">
                    {wsStatus === 'connected'
                      ? 'O frontend está se comunicando em tempo real com seu servidor Node.js.'
                      : 'Inicie o servidor com npm start depois de compilar a interface. No desenvolvimento, use npm run dev:server e npm run dev em dois terminais. A interface fica em modo simulado enquanto não houver conexão.'}
                  </p>
                </div>
              </div>

              {/* URL input */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#3a3a3c]">
                  URL do Servidor WebSocket (ws:// ou wss://)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="ws://localhost:3000/ws"
                    className="min-w-0 flex-1 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-3 py-2.5 font-mono text-[12px] text-[#1d1d1f] focus:border-[#007aff] focus:outline-none focus:ring-4 focus:ring-[#007aff]/10"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAndConnect}
                    className="flex items-center gap-1.5 rounded-full bg-[#007aff] px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#006ee6]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Conectar</span>
                  </button>
                </div>
              </div>

              {/* Multi-user local testing tip */}
              <div className="space-y-1.5 rounded-2xl border border-[#e5e5ea] bg-[#f9f9fb] p-4">
                <div className="flex items-center gap-1.5 font-semibold text-[#3a3a3c]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#007aff]" />
                  <span>Como testar múltiplos usuários agora mesmo</span>
                </div>
                <p className="text-[12px] leading-relaxed text-[#6e6e73]">
                  Use o seletor de perfil no canto superior direito. Abra o app em duas abas e escolha um perfil diferente em cada uma para trocar mensagens.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2">
              <p className="text-[12px] text-[#86868b]">
                Histórico em tempo real de pacotes JSON enviados e recebidos:
              </p>

              {packetLogs.length === 0 ? (
                <div className="py-8 text-center text-[#8e8e93]">
                  Nenhum pacote trafegado ainda. Envie uma mensagem no chat para ver o log.
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px]">
                  {packetLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            log.direction === 'out'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}
                        >
                          {log.direction === 'out' ? 'ENVIADO (OUT)' : 'RECEBIDO (IN)'} • {log.packet.type}
                        </span>
                        <span className="text-[10px] text-[#8e8e93]">{log.time}</span>
                      </div>
                      <pre className="overflow-x-auto rounded-lg bg-white p-2 text-[10px] text-[#3a3a3c]">
                        {JSON.stringify(log.packet.payload, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'protocol' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#1d1d1f]">
                  Como iniciar o servidor Node.js
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-[#007aff] hover:bg-[#f2f7ff]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar comandos'}</span>
                </button>
              </div>

              <pre className="overflow-x-auto rounded-2xl border border-[#2c2c2e] bg-[#1d1d1f] p-4 font-mono text-[11px] leading-relaxed text-[#f5f5f7]">
                {sampleServerCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex h-[68px] items-center justify-end border-t border-[#e5e5ea] bg-[#fafafd] px-5 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#f2f2f7] px-5 py-2 text-[13px] font-medium text-[#3a3a3c] transition-colors hover:bg-[#e5e5ea]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
