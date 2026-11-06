#  iMessage Web - Chat em Tempo Real (Estilo Apple)

Uma aplicação de chat em tempo real com design inspirado no ecossistema Apple (**macOS & iOS iMessage**), desenvolvida com **React**, **TypeScript**, **Tailwind CSS**, suporte a **WebSockets** e modo simulador interativo para desenvolvimento.

---

## 📋 Sumário
1. [Visão Geral](#-visão-geral)
2. [Instalação das Dependências](#-instalação-das-dependências)
3. [Como Executar a Aplicação](#-como-executar-a-aplicação)
4. [Como Acessar no Navegador](#-como-acessar-no-navegador)
5. [Como Implementar o seu Servidor Node.js (Backend)](#-como-implementar-o-seu-servidor-nodejs-backend)
6. [Estrutura da Persistência em JSON (`messages.json`)](#-estrutura-da-persistência-em-json-messagesjson)
7. [Protocolo de Comunicação WebSocket](#-protocolo-de-comunicação-websocket)
8. [Recursos Exclusivos da Interface](#-recursos-exclusivos-da-interface)

---

## 🚀 Visão Geral

O frontend foi desenvolvido para funcionar tanto com um **servidor WebSocket real em Node.js** quanto em **modo simulador autônomo**. Isso permite que você teste imediatamente todas as interações visuais, troque de perfil de usuário e visualize pacotes trafegados enquanto desenvolve o seu backend!

### Tecnologias do Frontend:
- **React 19** + **TypeScript**
- **Tailwind CSS v4** com estética de vidro translúcido (*frosted glass*), tipografia San Francisco e gradientes oficiais da Apple
- **Web Audio API**: Síntese nativa dos sons clássicos do iMessage (*Swoosh* de envio, *Pop* de recebimento e clique tátil de reações Tapback)
- **Lucide Icons**
- **Node Test Runner** para testes unitários de lógica de conversas e agrupamento de balões

---

## 📦 Instalação das Dependências

Certifique-se de ter o **Node.js 18+** instalado em seu sistema. No terminal, execute:

```bash
npm install
```

Caso queira instalar também o pacote `ws` para o seu servidor backend em Node.js:

```bash
npm install ws
```

---

## ⚡ Como Executar a Aplicação

### 1. Iniciar o Frontend (Vite Dev Server)
Para rodar a interface web com recarregamento rápido:

```bash
npm run dev
```

O servidor local iniciará na porta `3000`.

---

## 🌐 Como Acessar no Navegador

Abra o seu navegador de preferência (Safari, Chrome, Edge, Firefox) e acesse:

```
http://localhost:3000
```

---

## 🛠️ Como Implementar o seu Servidor Node.js (Backend)

Abaixo está um exemplo de referência para criar o arquivo `server.js` com suporte a **HTTP**, **WebSockets** e **persistência em `messages.json`**:

### Exemplo de `server.js`:

```javascript
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs';
import path from 'path';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;
const DB_FILE = path.resolve('./messages.json');

// Servir arquivos estáticos do frontend (após o build)
app.use(express.static('dist'));
app.use(express.json());

// 1. Inicializar ou carregar banco de dados JSON
let db = { messages: {}, conversations: [] };
if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    console.log('📦 Banco messages.json carregado com sucesso!');
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
  console.log('🟢 Novo cliente conectado via WebSocket');

  // Enviar histórico sincronizado na conexão
  ws.send(JSON.stringify({
    type: 'history_sync',
    payload: { messages: db.messages, conversations: db.conversations },
    timestamp: Date.now()
  }));

  ws.on('message', (data) => {
    try {
      const packet = JSON.parse(data.toString());
      console.log(`📩 Pacote recebido [${packet.type}]:`, packet.payload);

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
          // Apenas retransmite o evento de digitação sem persistir
          break;
      }

      // Broadcast para todos os clientes conectados
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(packet));
        }
      });
    } catch (err) {
      console.error('Erro ao processar pacote WebSocket:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔴 Cliente desconectado');
  });
});

// 3. Iniciar Servidor HTTP
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📡 WebSocket endpoint em ws://localhost:${PORT}/ws`);
});
```

---

## 🗄️ Estrutura da Persistência em JSON (`messages.json`)

O arquivo `messages.json` armazena as mensagens agrupadas por identificador de conversa (`chatId`):

```json
{
  "messages": {
    "chat_group_keynote": [
      {
        "id": "msg_1710000000000_abc",
        "chatId": "chat_group_keynote",
        "senderId": "user_steve",
        "senderName": "Steve Jobs",
        "senderAvatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "text": "Ficou incrivelmente elegante o design do chat!",
        "timestamp": 1710000000000,
        "status": "read",
        "type": "text",
        "reactions": {
          "❤️": ["user_tim", "user_craig"]
        }
      }
    ]
  }
}
```

---

## 📡 Protocolo de Comunicação WebSocket

Todos os pacotes trafegam em formato JSON estruturado:

### 1. Envio de Mensagem (`type: "message"`)
```json
{
  "type": "message",
  "payload": {
    "id": "msg_170000000_xyz",
    "chatId": "chat_tim",
    "senderId": "user_steve",
    "senderName": "Steve Jobs",
    "text": "A apresentação foi aprovada!",
    "timestamp": 1700000000000,
    "status": "sent",
    "type": "text"
  }
}
```

### 2. Reação Tapback (`type: "reaction"`)
Suporta os 6 ícones Apple: `❤️`, `👍`, `👎`, `😂`, `‼️`, `❓`
```json
{
  "type": "reaction",
  "payload": {
    "chatId": "chat_tim",
    "messageId": "msg_170000000_xyz",
    "emoji": "👍",
    "userId": "user_steve"
  }
}
```

### 3. Indicador de Digitação (`type: "typing"`)
```json
{
  "type": "typing",
  "payload": {
    "chatId": "chat_group_keynote",
    "userId": "user_tim",
    "userName": "Tim Cook",
    "isTyping": true
  }
}
```

---

## ✨ Recursos Exclusivos da Interface

- 🖥️ **Janela macOS com Semáforos:** Botões autênticos Vermelho, Amarelo e Verde com efeitos de hover.
- 👥 **Alternador de Usuário (Multi-user Simulator):** Permite trocar no menu superior entre **Steve Jobs**, **Tim Cook**, **Craig Federighi** e **Jony Ive** para enviar mensagens como qualquer participante sem precisar abrir várias abas.
- 💬 **Balões com Rabo Agrupado:** Somente o último balão de uma sequência do mesmo emissor recebe o rabo curvado original do iMessage.
- 🔊 **Sons Apple Sintetizados:** Efeitos de áudio fiéis sem dependência de arquivos externos (Web Audio API).
- 🎙️ **Mensagens de Áudio:** Gravador simulado com visualizador de ondas e reprodutor interativo.
- 🔍 **Busca Instantânea:** Filtre conversas por nome de contato ou trecho de mensagens.
- 🌙 **Modo Escuro & Claro:** Alternância suave com vidro translúcido (*backdrop-filter*).
- 🛠️ **Inspetor WebSocket:** Clique no chip de status na barra de título para ver o painel com tráfego de pacotes em tempo real e alterar a URL do servidor.
