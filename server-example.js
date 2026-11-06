/**
 * server-example.js
 *
 * Exemplo de servidor Node.js com Express, WebSockets (ws) e persistência em messages.json.
 * Você pode utilizar este arquivo como base para implementar seu backend completo!
 *
 * Para rodar:
 * 1. npm install ws
 * 2. node server-example.js
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs';
import path from 'path';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;
const DB_FILE = path.resolve('./messages.json');

app.use(express.json());

// 1. Inicializar ou carregar banco de dados JSON
let db = { messages: {}, conversations: [] };
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(raw);
    console.log('📦 messages.json carregado com sucesso!');
  } catch (err) {
    console.error('Erro ao ler messages.json:', err);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar messages.json:', err);
  }
}

// 2. Configurar Servidor WebSocket
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('🟢 Cliente WebSocket conectado!');

  // Enviar histórico sincronizado logo ao conectar
  ws.send(
    JSON.stringify({
      type: 'history_sync',
      payload: { messages: db.messages, conversations: db.conversations },
      timestamp: Date.now(),
    })
  );

  ws.on('message', (data) => {
    try {
      const packet = JSON.parse(data.toString());
      console.log(`📩 [${packet.type}]:`, packet.payload);

      // Tratamento por tipo de evento
      switch (packet.type) {
        case 'message': {
          const msg = packet.payload;
          if (!db.messages[msg.chatId]) {
            db.messages[msg.chatId] = [];
          }
          db.messages[msg.chatId].push(msg);
          saveDatabase();
          break;
        }

        case 'reaction': {
          const { messageId, emoji, userId, chatId } = packet.payload;
          const chatMsgs = db.messages[chatId] || [];
          const target = chatMsgs.find((m) => m.id === messageId);
          if (target) {
            if (!target.reactions) target.reactions = {};
            if (!target.reactions[emoji]) target.reactions[emoji] = [];

            const idx = target.reactions[emoji].indexOf(userId);
            if (idx > -1) {
              target.reactions[emoji].splice(idx, 1);
              if (target.reactions[emoji].length === 0) delete target.reactions[emoji];
            } else {
              target.reactions[emoji].push(userId);
            }
            saveDatabase();
          }
          break;
        }

        case 'typing':
          // Reencaminha digitação para os demais sem persistir
          break;
      }

      // Broadcast para todos os clientes conectados
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(packet));
        }
      });
    } catch (err) {
      console.error('Erro ao processar pacote:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔴 Cliente WebSocket desconectado');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP rodando em http://localhost:${PORT}`);
  console.log(`📡 WebSocket escutando em ws://localhost:${PORT}/ws`);
});
