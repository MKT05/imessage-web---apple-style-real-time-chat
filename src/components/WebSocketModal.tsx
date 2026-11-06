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

  const sampleServerCode = `// server.js (Node.js + ws + express)
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const DB_FILE = './messages.json';
let db = { messages: {}, conversations: [] };
if (fs.existsSync(DB_FILE)) {
  db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado!');

  ws.on('message', (raw) => {
    const packet = JSON.parse(raw);
    // Broadcast para todos os clientes conectados
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(packet));
      }
    });
    // Persistência em JSON
    if (packet.type === 'message') {
      const msg = packet.payload;
      if (!db.messages[msg.chatId]) db.messages[msg.chatId] = [];
      db.messages[msg.chatId].push(msg);
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    }
  });
});

server.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleServerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white/95 dark:bg-[#222225]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 border-b border-black/[0.08] dark:border-white/[0.08] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#007aff]/10 text-[#007aff]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Central de Conexão WebSocket
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Integração do frontend Apple com o backend Node.js
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-[#007aff] text-[#007aff]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
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
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <span>Tráfego de Pacotes</span>
            <span className="px-1.5 py-0.2 rounded-full bg-neutral-200 dark:bg-neutral-700 text-[10px]">
              {packetLogs.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('protocol')}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'protocol'
                ? 'border-[#007aff] text-[#007aff]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Especificação do Protocolo
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Connection Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  wsStatus === 'connected'
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
                    : wsStatus === 'connecting'
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200'
                    : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40 text-blue-900 dark:text-blue-200'
                }`}
              >
                {wsStatus === 'connected' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Activity className="w-5 h-5 text-[#007aff] flex-shrink-0 mt-0.5 animate-pulse" />
                )}

                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">
                    {wsStatus === 'connected'
                      ? 'Conectado ao Servidor WebSocket!'
                      : wsStatus === 'connecting'
                      ? 'Conectando ao servidor WebSocket...'
                      : 'Modo Simulador Interativo Ativo'}
                  </h4>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {wsStatus === 'connected'
                      ? 'O frontend está se comunicando em tempo real com seu servidor Node.js.'
                      : 'Como você está desenvolvendo o backend Node.js separadamente, a interface funciona perfeitamente de forma simulada. Assim que seu servidor WebSocket estiver rodando na porta indicada abaixo, ele conectará automaticamente!'}
                  </p>
                </div>
              </div>

              {/* URL input */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  URL do Servidor WebSocket (ws:// ou wss://)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="ws://localhost:3000/ws"
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-xs focus:outline-none focus:border-[#007aff]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAndConnect}
                    className="px-4 py-2 rounded-xl bg-[#007aff] hover:bg-[#006ee6] text-white font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Conectar</span>
                  </button>
                </div>
              </div>

              {/* Multi-user local testing tip */}
              <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#007aff]" />
                  <span>Como testar múltiplos usuários agora mesmo</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Utilize o seletor de usuário na barra superior da janela Apple (ao lado dos botões de fechar). Você pode trocar entre <strong>Steve Jobs</strong>, <strong>Tim Cook</strong>, <strong>Craig Federighi</strong> e <strong>Jony Ive</strong> a qualquer momento para disparar mensagens e respostas de qualquer participante.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2">
              <p className="text-[11px] text-neutral-500">
                Histórico em tempo real de pacotes JSON enviados e recebidos:
              </p>

              {packetLogs.length === 0 ? (
                <div className="py-8 text-center text-neutral-400">
                  Nenhum pacote trafegado ainda. Envie uma mensagem no chat para ver o log.
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px]">
                  {packetLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-black/[0.04] dark:border-white/[0.04]"
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
                        <span className="text-neutral-400 text-[10px]">{log.time}</span>
                      </div>
                      <pre className="text-[10px] text-neutral-700 dark:text-neutral-300 overflow-x-auto p-1 bg-white/50 dark:bg-black/20 rounded">
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
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Exemplo de Servidor WebSocket Node.js (ws + express)
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-[11px] text-[#007aff] hover:underline"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-[10px] overflow-x-auto leading-relaxed border border-neutral-700">
                {sampleServerCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-black/[0.08] dark:border-white/[0.08] px-5 flex items-center justify-end bg-neutral-50 dark:bg-[#1f1f22]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
