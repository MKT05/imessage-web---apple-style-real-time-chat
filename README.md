#  iMessage Web - Chat em Tempo Real (Estilo Apple)

Uma aplicação web de chat em tempo real com interface inspirada no iMessage. O servidor em **Node.js** serve a interface, gerencia conexões **WebSocket** e persiste mensagens em `messages.json`.

---

## 📋 Sumário
1. [Visão Geral](#-visão-geral)
2. [Instalação das Dependências](#-instalação-das-dependências)
3. [Como Executar a Aplicação](#-como-executar-a-aplicação)
4. [Como Acessar no Navegador](#-como-acessar-no-navegador)
5. [Servidor Node.js e WebSocket](#-servidor-nodejs-e-websocket)
6. [Estrutura da Persistência em JSON (`messages.json`)](#-estrutura-da-persistência-em-json-messagesjson)
7. [Protocolo de Comunicação WebSocket](#-protocolo-de-comunicação-websocket)
8. [Recursos Exclusivos da Interface](#-recursos-exclusivos-da-interface)

---

## 🚀 Visão Geral

O projeto inclui o frontend e o backend integrados. Mensagens e reações são transmitidas aos outros clientes conectados; mensagens e reações ficam salvas em `messages.json`. Se o servidor WebSocket estiver indisponível, a interface também pode ser explorada em modo simulado.

### Tecnologias do Frontend:
- **React 19** + **TypeScript**
- **Node.js** + **Express** + **WebSocket (`ws`)**
- **Tailwind CSS v4** com estética de vidro translúcido (*frosted glass*), tipografia San Francisco e gradientes oficiais da Apple
- **Web Audio API**: Síntese nativa dos sons clássicos do iMessage (*Swoosh* de envio, *Pop* de recebimento e clique tátil de reações Tapback)
- **Lucide Icons**
- **Node Test Runner** para testes unitários de lógica de conversas e agrupamento de balões

---

## 📦 Instalação das Dependências

Use **Node.js 20.19+ ou 22.12+**. Na pasta do projeto, instale todas as dependências:

```bash
npm install
```

---

## ⚡ Como Executar a Aplicação

Compile a interface e inicie o servidor Node.js integrado:

```bash
npm run build
npm start
```

O servidor HTTP e WebSocket será iniciado na porta `3000`. Para usar outra porta, defina a variável de ambiente `PORT`.

---

## 🌐 Como Acessar no Navegador

Abra o seu navegador de preferência (Safari, Chrome, Edge, Firefox) e acesse:

```
http://localhost:3000
```

Para testar a troca entre várias pessoas, abra o endereço em duas abas ou janelas e escolha um perfil diferente em cada uma.

---

## 🛠️ Servidor Node.js e WebSocket

O arquivo `server.js` é o backend executado por `npm start`. Ele serve os arquivos compilados de `dist/`, aceita conexões no endpoint `/ws`, retransmite mensagens, reações e indicadores de digitação aos demais clientes e envia o histórico ao conectar. Mensagens e reações são persistidas no arquivo `messages.json`, criado automaticamente na primeira execução.

### Desenvolvimento com recarregamento rápido

Abra dois terminais na pasta do projeto. No primeiro, inicie o backend:

```bash
npm run dev:server
```

No segundo, inicie o Vite:

```bash
npm run dev
```

Acesse `http://localhost:5173`. O Vite encaminha as conexões WebSocket ao backend na porta `3000`.

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
- 🌙 **Modo escuro:** Interface com vidro translúcido (*backdrop-filter*).
- 🛠️ **Inspetor WebSocket:** Clique no chip de status na barra de título para ver o painel com tráfego de pacotes em tempo real e alterar a URL do servidor.
