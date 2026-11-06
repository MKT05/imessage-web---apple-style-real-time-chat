import { useState, useEffect } from 'react';
import { useWebSocketChat } from './hooks/useWebSocketChat';
import { filterConversations } from './utils/chatLogic';
import { MacWindowHeader } from './components/MacWindowHeader';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { ChatInfoDrawer } from './components/ChatInfoDrawer';
import { WebSocketModal } from './components/WebSocketModal';
import { NewChatModal } from './components/NewChatModal';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);
  const [wsModalOpen, setWsModalOpen] = useState(false);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);

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

  // Apply dark mode class to root document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
    <div className="w-screen h-screen flex flex-col items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-[#d4d8e0] via-[#e2e6ee] to-[#cbd2de] dark:from-[#111113] dark:via-[#18181b] dark:to-[#0d0d0f] text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans">
      {/* macOS Main Window Frame */}
      <div className="w-full h-full max-w-6xl max-h-[920px] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col overflow-hidden mac-glass transition-colors">
        {/* Apple Window Title Bar */}
        <MacWindowHeader
          title={activeChat ? activeChat.name : 'Mensagens'}
          currentUser={currentUser}
          allUsers={allUsers}
          onSwitchUser={switchActiveUser}
          wsStatus={wsStatus}
          simulatedMode={simulatedMode}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenWsModal={() => setWsModalOpen(true)}
          autoReplyEnabled={autoReplyEnabled}
          onToggleAutoReply={() => setAutoReplyEnabled(!autoReplyEnabled)}
        />

        {/* Window Content Split */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar */}
          <Sidebar
            conversations={filteredConversations}
            activeChatId={activeChatId}
            onSelectChat={(id) => {
              setActiveChatId(id);
              // mark unread as 0
            }}
            onNewChat={() => setNewChatModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Center Chat View */}
          <main className="flex-1 flex flex-col h-full bg-white/40 dark:bg-[#161618]/40 backdrop-blur-md relative overflow-hidden">
            {activeChat ? (
              <>
                <ChatHeader
                  conversation={activeChat}
                  infoOpen={infoOpen}
                  onToggleInfo={() => setInfoOpen(!infoOpen)}
                  onSimulateIncoming={handleSimulateIncoming}
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

          {/* Right Info Drawer (Collapsible) */}
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
        }}
      />
    </div>
  );
}
