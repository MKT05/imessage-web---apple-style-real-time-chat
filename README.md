# Aplicação Web de Chat em Tempo Real

Aplicação web desenvolvida com Node.js para troca de mensagens em tempo real. O servidor HTTP entrega a interface, as conexões entre usuários usam WebSocket e as mensagens são armazenadas em um arquivo JSON.

## Requisitos

- Node.js 20.19 ou superior, ou 22.12 ou superior
- npm

## Instalação e execução

Na pasta do projeto, instale as dependências e compile a interface:

```bash
npm install
npm run build
```

Inicie o servidor:

```bash
npm start
```

O servidor HTTP e WebSocket será iniciado na porta `3000`. Para escolher outra porta, defina a variável de ambiente `PORT`.

## Acesso à aplicação

Abra este endereço no navegador:

```text
http://localhost:3000
```

Para simular usuários diferentes, abra a aplicação em duas abas ou janelas e escolha um perfil em cada uma.

## Desenvolvimento

Para trabalhar com recarga automática, use dois terminais na pasta do projeto. No primeiro, inicie o servidor Node.js:

```bash
npm run dev:server
```

No segundo, inicie o servidor de desenvolvimento da interface:

```bash
npm run dev
```

Acesse `http://localhost:5173`. O Vite encaminha as conexões WebSocket ao servidor Node.js na porta `3000`.

## Componentes do sistema

- **Servidor HTTP:** Express entrega os arquivos compilados da pasta `dist/`.
- **WebSocket:** o endpoint `/ws` aceita conexões simultâneas e retransmite mensagens, reações e indicadores de digitação aos demais clientes.
- **Histórico:** ao conectar, o cliente recebe as mensagens previamente armazenadas.
- **Persistência:** o servidor salva mensagens e reações em `messages.json`, agrupadas pelo identificador da conversa. O arquivo é criado automaticamente na primeira execução e permanece no computador onde o servidor está rodando.

O arquivo de dados segue esta estrutura:

```json
{
  "messages": {
    "chat_exemplo": [
      {
        "id": "msg_1710000000000_abc",
        "chatId": "chat_exemplo",
        "senderId": "user_01",
        "senderName": "Participante",
        "text": "Olá!",
        "timestamp": 1710000000000,
        "status": "delivered",
        "type": "text",
        "reactions": {
          "👍": ["user_02"]
        }
      }
    ]
  }
}
```
