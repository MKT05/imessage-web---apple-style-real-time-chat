import { useState } from 'react';
import { useWebSocketChat } from './hooks/useWebSocketChat';
import { filterConversations } from './utils/chatLogic';
import { AppToolbar } from './components/AppToolbar';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { ChatInfoDrawer } from './components/ChatInfoDrawer';
import { WebSocketModal } from './components/WebSocketModal';
import { NewChatModal } from './components/NewChatModal';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);
  const [wsModalOpen, setWsModalOpen] = useState(false);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const {
    conversations,
    activeChat,
    activeChatId,
    setActiveChatId,
    messages,
    currentUser,
    allUsers,
    typingUsers,
    soundEnabled,
    setSoundEnabled,
    wsStatus,
    wsUrl,
    setWsUrl,
    simulatedMode,
    autoReplyEnabled,
    setAutoReplyEnabled,
    packetLogs,
    sendMessage,
    toggleReaction,
    sendTyping,
    switchActiveUser,
    connectWebSocket,
    createConversation,
    clearCurrentChat,
  } = useWebSocketChat();

  // Filter conversations based on user search
  const filteredConversations = filterConversations(conversations, searchQuery);

  // Simulate an instant incoming message for testing
  const handleSimulateIncoming = () => {
    const otherParticipants = activeChat.participants.filter((p) => p.id !== currentUser.id);
    const sender = otherParticipants[0] || allUsers.find((u) => u.id !== currentUser.id) || allUsers[1];

    const sampleReplies = [
      'Estou revisando as telas aqui no Apple Studio Display. O acabamento ficou incrível!',
      'Conexão WebSocket estabilizada com latência mínima.',
      'Perfeito! Vamos integrar com o banco de mensagens persistido em JSON.',
      'O novo design dos balões de conversa no macOS ficou impecável.',
    ];
    const text = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];

    // Send as if received from the sender
    sendMessage(text, 'text');
  };

  return (
    <div className="app-background h-[100dvh] w-screen overflow-hidden text-[#1d1d1f]">
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <AppToolbar
          currentUser={currentUser}
          allUsers={allUsers}
          onSwitchUser={switchActiveUser}
          wsStatus={wsStatus}
          simulatedMode={simulatedMode}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onOpenWsModal={() => setWsModalOpen(true)}
          autoReplyEnabled={autoReplyEnabled}
          onToggleAutoReply={() => setAutoReplyEnabled(!autoReplyEnabled)}
        />

        <div className="relative flex min-h-0 flex-1 overflow-hidden bg-white">
          <Sidebar
            className={mobileChatOpen ? 'hidden md:flex' : 'flex'}
            conversations={filteredConversations}
            activeChatId={activeChatId}
            onSelectChat={(id) => {
              setActiveChatId(id);
              setMobileChatOpen(true);
            }}
            onNewChat={() => setNewChatModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <main className={`${mobileChatOpen ? 'flex' : 'hidden md:flex'} relative min-w-0 flex-1 flex-col overflow-hidden bg-white`}>
            {activeChat ? (
              <>
                <ChatHeader
                  conversation={activeChat}
                  infoOpen={infoOpen}
                  onToggleInfo={() => setInfoOpen(!infoOpen)}
                  onSimulateIncoming={handleSimulateIncoming}
                  onBack={() => setMobileChatOpen(false)}
                />

                <MessageList
                  messages={messages}
                  currentUserId={currentUser.id}
                  isGroupChat={activeChat.isGroup}
                  typingUsers={typingUsers}
                  onToggleReaction={toggleReaction}
                />

                <MessageInput
                  onSendMessage={sendMessage}
                  onTyping={sendTyping}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-400">
                Selecione uma conversa para começar
              </div>
            )}
          </main>

          {infoOpen && activeChat && (
            <ChatInfoDrawer
              conversation={activeChat}
              onClose={() => setInfoOpen(false)}
              onClearChat={clearCurrentChat}
            />
          )}
        </div>
      </div>

      {/* WebSocket Diagnostics & Configuration Modal */}
      <WebSocketModal
        isOpen={wsModalOpen}
        onClose={() => setWsModalOpen(false)}
        wsUrl={wsUrl}
        onUpdateWsUrl={setWsUrl}
        wsStatus={wsStatus}
        simulatedMode={simulatedMode}
        onReconnect={connectWebSocket}
        packetLogs={packetLogs}
      />

      {/* New Conversation Modal */}
      <NewChatModal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        users={allUsers}
        currentUserId={currentUser.id}
        onCreateChat={(name, participants, isGroup) => {
          createConversation(name, participants, isGroup);
          setMobileChatOpen(true);
        }}
      />
    </div>
  );
}
