import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardCenterGreeting } from './DashboardCenterGreeting';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputBar, KODI_MODELS } from './ChatInputBar';
import { SidebarDrawer } from './SidebarDrawer';
import { SettingsModal, SettingsTab } from './SettingsModal';
import { User, ChatSession, ChatMessage, ChatAttachment, KodiModelId } from '../types';
import { 
  getUserChats, 
  loadUserChatsFromCloud,
  saveUserChats, 
  deductUserCredit, 
  getUserProfile, 
  MODEL_CREDIT_COSTS,
  updateUserCustomSettings,
  mergeChatSessions
} from '../services/db';
import { requestKodiCompletion } from '../services/kodiAgent';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user: initialUser, onLogout }) => {
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [chats, setChats] = useState<ChatSession[]>(() => getUserChats(initialUser.uid));
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const initialChats = getUserChats(initialUser.uid);
    return initialChats.length > 0 ? initialChats[0].id : null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('profile');
  const [isStreaming, setIsStreaming] = useState(false);
  const isStreamingRef = useRef(false);
  const [chatSeed, setChatSeed] = useState<string>(() => Date.now().toString());

  // Keep isStreamingRef synchronized with state
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Global theme state ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = initialUser.customSettings?.theme;
    return saved === 'light' ? 'light' : 'dark';
  });

  const handleOpenBilling = useCallback(() => {
    setSettingsTab('billing');
    setIsSettingsOpen(true);
  }, []);

  const handleOpenSettings = useCallback((tab: SettingsTab = 'profile') => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  }, []);

  // Refresh user profile and chats on mount or user change
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile && isMounted) {
          setCurrentUser((prev) => ({
            ...prev,
            ...profile,
            customSettings: {
              ...prev.customSettings,
              ...profile.customSettings,
            },
          }));
          if (profile.customSettings?.theme && (profile.customSettings.theme === 'dark' || profile.customSettings.theme === 'light')) {
            setTheme(profile.customSettings.theme);
          }
        }
      } catch (err) {
        console.warn('Failed to load profile in Dashboard:', err);
      }

      try {
        const storedChats = await loadUserChatsFromCloud(currentUser.uid);
        if (isMounted && storedChats) {
          setChats((current) => {
            // Never overwrite chats if actively streaming a response
            if (isStreamingRef.current) return current;
            return mergeChatSessions(current, storedChats);
          });
          setActiveChatId((prevActive) => {
            if (prevActive && storedChats.some((c) => c.id === prevActive)) {
              return prevActive;
            }
            return storedChats.length > 0 ? storedChats[0].id : null;
          });
        }
      } catch (err) {
        console.warn('Failed to load chats from cloud, fallback to cache:', err);
        const fallback = getUserChats(currentUser.uid);
        if (isMounted) {
          setChats((current) => {
            if (isStreamingRef.current) return current;
            return mergeChatSessions(current, fallback);
          });
          setActiveChatId((prevActive) => {
            if (prevActive && fallback.some((c) => c.id === prevActive)) {
              return prevActive;
            }
            return fallback.length > 0 ? fallback[0].id : null;
          });
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentUser.uid]);

  // Sync theme changes to database & state
  const handleToggleTheme = useCallback((newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    setCurrentUser((prev) => {
      const updated = {
        ...prev,
        customSettings: {
          ...prev.customSettings,
          theme: newTheme,
        },
      };
      updateUserCustomSettings(prev.uid, { theme: newTheme });
      return updated;
    });
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const messages = activeChat?.messages || [];

  // Handler for creating a fresh conversation
  const handleNewChat = useCallback(() => {
    const newChat: ChatSession = {
      id: 'chat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: 'Nueva Conversación',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
    };

    setChats((prev) => {
      const updated = [newChat, ...prev];
      saveUserChats(currentUser.uid, updated);
      return updated;
    });
    setActiveChatId(newChat.id);
    setChatSeed(Date.now().toString());
    setIsSidebarOpen(false);
  }, [currentUser.uid]);

  // Handler for selecting an existing conversation
  const handleSelectChat = useCallback((id: string) => {
    setActiveChatId(id);
    setIsSidebarOpen(false);
  }, []);

  // Handler for deleting a conversation (supports specific targetChatId from 3-dot menus or activeChatId)
  const handleDeleteChat = useCallback(
    (targetChatId?: string) => {
      const idToDelete = typeof targetChatId === 'string' && targetChatId ? targetChatId : activeChatId;
      if (!idToDelete) return;
      setChats((prev) => {
        const updated = prev.filter((c) => c.id !== idToDelete);
        saveUserChats(currentUser.uid, updated);
        return updated;
      });
      if (activeChatId === idToDelete) {
        setActiveChatId(null);
        setChatSeed(Date.now().toString());
      }
    },
    [activeChatId, currentUser.uid]
  );

  // Handler for bulk deleting conversations
  const handleDeleteMultipleChats = useCallback(
    (chatIds: string[]) => {
      setChats((prev) => {
        const updated = prev.filter((c) => !chatIds.includes(c.id));
        saveUserChats(currentUser.uid, updated);
        return updated;
      });
      if (activeChatId && chatIds.includes(activeChatId)) {
        setActiveChatId(null);
        setChatSeed(Date.now().toString());
      }
    },
    [activeChatId, currentUser.uid]
  );

  // Handler for renaming a conversation
  const handleRenameChat = useCallback(
    (newTitle: string) => {
      if (!activeChatId) return;
      setChats((prev) => {
        const updated = prev.map((c) =>
          c.id === activeChatId ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c
        );
        saveUserChats(currentUser.uid, updated);
        return updated;
      });
    },
    [activeChatId, currentUser.uid]
  );

  // Handler for pinning/unpinning a conversation
  const handleTogglePinChat = useCallback(() => {
    if (!activeChatId) return;
    setChats((prev) => {
      const updated = prev.map((c) =>
        c.id === activeChatId ? { ...c, isPinned: !c.isPinned, updatedAt: new Date().toISOString() } : c
      );
      saveUserChats(currentUser.uid, updated);
      return updated;
    });
  }, [activeChatId, currentUser.uid]);

  // Stream AI response chunk by chunk for typewriter effect
  const streamAIResponse = useCallback(
    async (
      fullText: string, 
      targetMsgId: string, 
      currentSessionId: string, 
      modelConfig: any, 
      verifiedByTavily?: boolean,
      libraryAudit?: { isVerified: boolean; checkedLibraries?: string[]; timestamp?: string; details?: string; },
      codePerformance?: any
    ) => {
      setIsStreaming(true);
      isStreamingRef.current = true;
      const textLen = fullText.length;
      
      // Dynamic high-speed chunk calculation for snappy delivery
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const stepDuration = 8; // ms
      const targetTotalTimeMs = textLen > 2000 ? 400 : textLen > 500 ? 250 : 100;
      const totalSteps = Math.max(1, Math.floor(targetTotalTimeMs / stepDuration));
      const chunkSize = Math.max(isMobile ? 18 : 25, Math.ceil(textLen / totalSteps));
      let currentIndex = 0;

      while (currentIndex < textLen) {
        currentIndex = Math.min(currentIndex + chunkSize, textLen);
        const currentSlice = fullText.slice(0, currentIndex);

        setChats((prevChats) => {
          return prevChats.map((c) => {
            if (c.id === currentSessionId) {
              let msgFound = false;
              const newMsgs = c.messages.map((m) => {
                if (m.id === targetMsgId) {
                  msgFound = true;
                  return { 
                    ...m, 
                    text: currentSlice,
                    isStreaming: true,
                    verifiedByTavily,
                    libraryAudit,
                    codePerformance
                  };
                }
                return m;
              });

              if (!msgFound) {
                newMsgs.push({
                  id: targetMsgId,
                  sender: 'kodi',
                  text: currentSlice,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  modelName: modelConfig?.name || 'KODI Nova Core 2.1',
                  modelId: modelConfig?.id || 'nova-core-2.1',
                  isStreaming: true,
                  verifiedByTavily,
                  libraryAudit,
                  codePerformance,
                });
              }

              return { ...c, messages: newMsgs, updatedAt: new Date().toISOString() };
            }
            return c;
          });
        });

        // Snappy frame rate for instantaneous response
        if (currentIndex < textLen) {
          await new Promise((resolve) => setTimeout(resolve, stepDuration));
        }
      }

      // Save state permanently when complete
      setChats((prevChats) => {
        const updated = prevChats.map((c) => {
          if (c.id === currentSessionId) {
            let msgFound = false;
            const finalMsgs = c.messages.map((m) => {
              if (m.id === targetMsgId) {
                msgFound = true;
                return { 
                  ...m, 
                  text: fullText,
                  isStreaming: false,
                  verifiedByTavily,
                  libraryAudit,
                  codePerformance
                };
              }
              return m;
            });

            if (!msgFound) {
              finalMsgs.push({
                id: targetMsgId,
                sender: 'kodi',
                text: fullText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                modelName: modelConfig?.name || 'KODI Nova Core 2.1',
                modelId: modelConfig?.id || 'nova-core-2.1',
                isStreaming: false,
                verifiedByTavily,
                libraryAudit,
                codePerformance,
              });
            }

            return { ...c, messages: finalMsgs, updatedAt: new Date().toISOString() };
          }
          return c;
        });
        saveUserChats(currentUser.uid, updated);
        return updated;
      });

      setIsStreaming(false);
      isStreamingRef.current = false;
    },
    [currentUser.uid]
  );

  // Send message handler with credit enforcement & model execution
  const handleSendMessage = async (
    text: string,
    attachments: ChatAttachment[] = [],
    webSearchEnabled: boolean = false,
    selectedModel: KodiModelId = 'nova-core-2.1'
  ) => {
    if ((!text.trim() && attachments.length === 0) || isStreaming) return;

    const creditCost = MODEL_CREDIT_COSTS[selectedModel] || 2;
    const isProOrMax = selectedModel !== 'nova-core-2.1';

    // Credit check
    if (currentUser.credits !== -1 && currentUser.credits < creditCost) {
      alert(`No tienes suficientes créditos para usar este modelo. Requiere ${creditCost} créditos.`);
      return;
    }

    // Determine target chat session
    let targetChatId = activeChatId;
    let targetChat = chats.find((c) => c.id === targetChatId);

    if (!targetChat) {
      const newSession: ChatSession = {
        id: 'chat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        title: text.slice(0, 32) || 'Nueva Conversación',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
      };
      targetChatId = newSession.id;
      setChats((prev) => [newSession, ...prev]);
      setActiveChatId(targetChatId);
      targetChat = newSession;
    }

    // Auto rename conversation from first message if default title
    if (targetChat.messages.length === 0 && targetChat.title === 'Nueva Conversación') {
      const generatedTitle = text.trim().slice(0, 32) + (text.length > 32 ? '...' : '');
      targetChat.title = generatedTitle;
    }

    // Build User message
    const userMsgId = 'msg_' + Date.now() + '_user';
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Placeholder AI message
    const aiMsgId = 'msg_' + (Date.now() + 1) + '_ai';
    const currentModelConfig = KODI_MODELS.find((m) => m.id === selectedModel) || KODI_MODELS[0];
    const aiPlaceholderMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'kodi',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelName: currentModelConfig.name,
      modelId: selectedModel,
      isStreaming: true,
    };

    // Optimistically update conversation state
    const currentHistory = [...targetChat.messages, userMsg];
    setChats((prev) => {
      const updated = prev.map((c) => {
        if (c.id === targetChatId) {
          return {
            ...c,
            messages: [...c.messages, userMsg, aiPlaceholderMsg],
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });
      saveUserChats(currentUser.uid, updated);
      return updated;
    });

    // Deduct credits
    try {
      const result = deductUserCredit(currentUser.uid, selectedModel);
      if (result.success && result.user) {
        setCurrentUser(result.user);
      }
    } catch (err) {
      console.warn('Failed to deduct credit:', err);
    }

    setIsStreaming(true);
    isStreamingRef.current = true;

    try {
      // Execute request to KODI backend engine
      const historyForAgent = currentHistory.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const response = await requestKodiCompletion(
        text,
        selectedModel,
        webSearchEnabled,
        attachments,
        historyForAgent,
        currentUser
      );

      // Stream the response smoothly with Zero-Hallucination verification metadata & real performance telemetry
      await streamAIResponse(
        response.text, 
        aiMsgId, 
        targetChatId, 
        currentModelConfig,
        response.verifiedByTavily,
        response.libraryAudit,
        response.codePerformance
      );
    } catch (err) {
      console.error('Error generating AI response:', err);
      setChats((prev) => {
        const updated = prev.map((c) => {
          if (c.id === targetChatId) {
            const msgs = c.messages.map((m) =>
              m.id === aiMsgId
                ? {
                    ...m,
                    text: 'Ocurrió un error inesperado al procesar la respuesta con el servidor. Por favor intenta de nuevo.',
                    isStreaming: false,
                  }
                : m
            );
            return { ...c, messages: msgs };
          }
          return c;
        });
        saveUserChats(currentUser.uid, updated);
        return updated;
      });
      setIsStreaming(false);
      isStreamingRef.current = false;
    }
  };

  // Retry previous message in conversation
  const handleRetryMessage = (messageId: string) => {
    if (!activeChat || isStreaming) return;
    const msgIndex = activeChat.messages.findIndex((m) => m.id === messageId);
    if (msgIndex < 0) return;

    const clickedMsg = activeChat.messages[msgIndex];
    let targetUserMsg: ChatMessage | null = null;

    if (clickedMsg.sender === 'user') {
      targetUserMsg = clickedMsg;
    } else if (msgIndex > 0) {
      const prev = activeChat.messages[msgIndex - 1];
      if (prev && prev.sender === 'user') {
        targetUserMsg = prev;
      }
    }

    if (targetUserMsg) {
      if (clickedMsg.sender === 'kodi') {
        setChats((prev) => {
          const updated = prev.map((c) => {
            if (c.id === activeChatId) {
              return {
                ...c,
                messages: c.messages.filter((m) => m.id !== messageId),
              };
            }
            return c;
          });
          saveUserChats(currentUser.uid, updated);
          return updated;
        });
      }

      handleSendMessage(
        targetUserMsg.text,
        targetUserMsg.attachments,
        false,
        (clickedMsg.modelId as KodiModelId) || 'nova-core-2.1'
      );
    }
  };

  const isLight = theme === 'light';

  return (
    <div className={`flex flex-col h-screen w-full font-sans antialiased overflow-hidden select-text transition-colors duration-200 ${
      isLight ? 'bg-[#f4f4f6] text-zinc-900' : 'bg-[#0f0f14] text-zinc-100'
    }`}>
      {/* Top Application Header */}
      <DashboardHeader
        user={currentUser}
        activeChat={activeChat}
        onOpenMenu={() => setIsSidebarOpen(true)}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameChat}
        onTogglePinChat={handleTogglePinChat}
        onDeleteChat={handleDeleteChat}
        currentTheme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenBilling={handleOpenBilling}
      />

      {/* Main Chat Canvas Area */}
      <main className="flex-1 flex flex-col justify-between overflow-hidden relative">
        {messages.length === 0 ? (
          <DashboardCenterGreeting 
            chatSeed={chatSeed} 
            currentTheme={theme}
            user={currentUser}
          />
        ) : (
          <ChatMessageList
            messages={messages}
            user={currentUser}
            isStreaming={isStreaming}
            currentTheme={theme}
            onRetryMessage={handleRetryMessage}
          />
        )}

        {/* Floating Chat Input Bar */}
        <ChatInputBar
          user={currentUser}
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
          currentTheme={theme}
          onOpenSettingsBilling={handleOpenBilling}
        />
      </main>

      {/* Interactive Sidebar with complete Settings Modal */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={currentUser}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onRenameChat={(id, newTitle) => {
          setChats((prev) => {
            const updated = prev.map((chat) =>
              chat.id === id ? { ...chat, title: newTitle, updatedAt: new Date().toISOString() } : chat
            );
            saveUserChats(currentUser.uid, updated);
            return updated;
          });
        }}
        onTogglePinChat={(id) => {
          setChats((prev) => {
            const updated = prev.map((chat) =>
              chat.id === id ? { ...chat, isPinned: !chat.isPinned } : chat
            );
            saveUserChats(currentUser.uid, updated);
            return updated;
          });
        }}
        onDeleteChat={handleDeleteChat}
        onDeleteMultipleChats={handleDeleteMultipleChats}
        onSignOut={onLogout}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        currentTheme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={handleOpenSettings}
      />

      {/* Centralized Settings & Plans Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
        onSignOut={onLogout}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        currentTheme={theme}
        onToggleTheme={handleToggleTheme}
        initialTab={settingsTab}
      />
    </div>
  );
};
