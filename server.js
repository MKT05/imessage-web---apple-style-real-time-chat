import express from 'express';
import { createServer } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const buildDirectory = path.join(projectDirectory, 'dist');
const databaseFile = path.join(projectDirectory, 'messages.json');
const port = Number(process.env.PORT) || 3000;

const app = express();
const server = createServer(app);
const webSocketServer = new WebSocketServer({ server, path: '/ws' });

function createEmptyDatabase() {
  return { messages: {}, conversations: [] };
}

function loadDatabase() {
  try {
    if (!fs.existsSync(databaseFile)) return createEmptyDatabase();

    const savedData = JSON.parse(fs.readFileSync(databaseFile, 'utf8'));
    return {
      messages:
        savedData.messages && typeof savedData.messages === 'object' && !Array.isArray(savedData.messages)
          ? savedData.messages
          : {},
      conversations: Array.isArray(savedData.conversations) ? savedData.conversations : [],
    };
  } catch (error) {
    console.error('Não foi possível ler messages.json. Um histórico vazio será usado.', error);
    return createEmptyDatabase();
  }
}

const database = loadDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2), 'utf8');
  } catch (error) {
    console.error('Não foi possível salvar messages.json.', error);
  }
}

if (!fs.existsSync(databaseFile)) saveDatabase();

function sendPacket(client, packet) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(packet));
  }
}

function broadcast(packet, sender) {
  for (const client of webSocketServer.clients) {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      sendPacket(client, packet);
    }
  }
}

function toggleSavedReaction({ chatId, messageId, emoji, userId }) {
  const chatMessages = database.messages[chatId] || [];
  const targetMessage = chatMessages.find((message) => message.id === messageId);
  if (!targetMessage) return;

  targetMessage.reactions ??= {};
  targetMessage.reactions[emoji] ??= [];

  const users = targetMessage.reactions[emoji];
  const existingIndex = users.indexOf(userId);
  if (existingIndex === -1) {
    users.push(userId);
  } else {
    users.splice(existingIndex, 1);
    if (users.length === 0) delete targetMessage.reactions[emoji];
  }

  saveDatabase();
}

app.use(express.static(buildDirectory));
app.get('*', (_request, response) => {
  const indexFile = path.join(buildDirectory, 'index.html');
  if (!fs.existsSync(indexFile)) {
    return response
      .status(503)
      .type('text/plain')
      .send('A interface ainda não foi compilada. Execute "npm run build" e inicie o servidor novamente.');
  }

  return response.sendFile(indexFile);
});

webSocketServer.on('connection', (client) => {
  sendPacket(client, {
    type: 'history_sync',
    payload: { messages: database.messages },
    timestamp: Date.now(),
  });

  client.on('message', (rawData) => {
    let packet;
    try {
      packet = JSON.parse(rawData.toString());
    } catch {
      return;
    }

    if (!packet || typeof packet.type !== 'string' || !packet.payload || typeof packet.payload !== 'object') {
      return;
    }

    const outgoingPacket = {
      type: packet.type,
      payload: packet.payload,
      timestamp: Number.isFinite(packet.timestamp) ? packet.timestamp : Date.now(),
    };

    switch (packet.type) {
      case 'message': {
        const message = packet.payload;
        if (typeof message.id !== 'string' || typeof message.chatId !== 'string') return;

        const chatMessages = (database.messages[message.chatId] ??= []);
        const deliveredMessage = { ...message, status: 'delivered' };
        const savedMessageIndex = chatMessages.findIndex((savedMessage) => savedMessage.id === message.id);
        if (savedMessageIndex === -1) {
          chatMessages.push(deliveredMessage);
        } else {
          chatMessages[savedMessageIndex] = deliveredMessage;
        }
        saveDatabase();

        sendPacket(client, {
          type: 'status_update',
          payload: { chatId: message.chatId, messageId: message.id, status: 'delivered' },
          timestamp: Date.now(),
        });
        broadcast({ ...outgoingPacket, payload: deliveredMessage }, client);
        break;
      }

      case 'reaction': {
        const { chatId, messageId, emoji, userId } = packet.payload;
        if (
          typeof chatId !== 'string' ||
          typeof messageId !== 'string' ||
          typeof emoji !== 'string' ||
          typeof userId !== 'string'
        ) {
          return;
        }
        toggleSavedReaction({ chatId, messageId, emoji, userId });
        broadcast(outgoingPacket, client);
        break;
      }

      case 'typing':
        broadcast(outgoingPacket, client);
        break;

      case 'ping':
        sendPacket(client, { type: 'pong', payload: {}, timestamp: Date.now() });
        break;

      // "join" informs the server that a client is ready; the interface keeps
      // its built-in participant list and only messages, reactions and typing
      // need to be relayed to the other connected clients.
      case 'join':
        break;

      default:
        break;
    }
  });

  client.on('error', (error) => {
    console.error('Erro na conexão WebSocket:', error);
  });
});

server.listen(port, () => {
  console.log(`Servidor HTTP e WebSocket em http://localhost:${port}`);
  console.log(`Endpoint WebSocket: ws://localhost:${port}/ws`);
  if (!fs.existsSync(path.join(buildDirectory, 'index.html'))) {
    console.log('Compile a interface com "npm run build" para servi-la neste endereço.');
  }
});
