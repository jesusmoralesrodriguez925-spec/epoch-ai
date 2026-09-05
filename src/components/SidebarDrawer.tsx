import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MessageSquare, 
  Plus, 
  Pin, 
  Trash2, 
  Settings,
  ChevronRight,
  MoreVertical,
  Edit3,
  Check,
  CheckSquare,
  Square,
  Cloud,
  CheckCircle2,
  Download,
  Smartphone
} from 'lucide-react';
import { KodiLogo } from './KodiLogo';
import { SettingsModal, SettingsTab } from './SettingsModal';
import { User, ChatSession } from '../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onRenameChat?: (id: string, newTitle: string) => void;
  onTogglePinChat?: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onDeleteMultipleChats?: (ids: string[]) => void;
  onSignOut: () => void;
  onUpdateUser: (updatedUser: User) => void;
  currentTheme: 'dark' | 'light';
  onToggleTheme: (theme: 'dark' | 'light') => void;
  onOpenSettings?: (tab?: SettingsTab) => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  user,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onTogglePinChat,
  onDeleteChat,
  onDeleteMultipleChats,
  onSignOut,
  onUpdateUser,
  currentTheme,
  onToggleTheme,
  onOpenSettings,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [menuOpenChatId, setMenuOpenChatId] = useState<string | null>(null);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const pinnedChats = chats.filter((c) => c.isPinned);
  const recentChats = chats.filter((c) => !c.isPinned);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      if (onOpenSettings) {
        onOpenSettings('profile');
      } else {
        setIsSettingsOpen(true);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setMenuOpenChatId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings('profile');
    } else {
      setIsSettingsOpen(true);
    }
  };

  const handleToggleSelectChat = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedChatIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedChatIds.length === chats.length) {
      setSelectedChatIds([]);
    } else {
      setSelectedChatIds(chats.map((c) => c.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedChatIds.length === 0) return;
    if (onDeleteMultipleChats) {
      onDeleteMultipleChats(selectedChatIds);
    } else {
      selectedChatIds.forEach((id) => onDeleteChat(id));
    }
    setSelectedChatIds([]);
    setIsSelectionMode(false);
  };

  const handleStartRename = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingChatId(chat.id);
    setRenameTitle(chat.title);
    setMenuOpenChatId(null);
  };

  const handleSaveRename = (chatId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (renameTitle.trim() && onRenameChat) {
      onRenameChat(chatId, renameTitle.trim());
    }
    setRenamingChatId(null);
  };

  const isLight = currentTheme === 'light';

  // Render individual chat item with inline renaming & visible 3-dot dropdown menu & selection checkbox
  const renderChatItem = (chat: ChatSession, isPinnedGroup: boolean) => {
    const isActive = chat.id === activeChatId;
    const isMenuOpen = menuOpenChatId === chat.id;
    const isRenamingThis = renamingChatId === chat.id;
    const isSelected = selectedChatIds.includes(chat.id);

    return (
      <div
        key={chat.id}
        className="relative group"
      >
        {isRenamingThis ? (
          <form
            onSubmit={(e) => handleSaveRename(chat.id, e)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border ${
              isLight ? 'bg-white border-zinc-400' : 'bg-zinc-900 border-zinc-600'
            }`}
          >
            <input
              type="text"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              className={`w-full text-xs bg-transparent focus:outline-none ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}
              autoFocus
            />
            <button
              type="submit"
              className="text-emerald-400 hover:text-emerald-300 p-0.5 cursor-pointer"
              title="Guardar"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setRenamingChatId(null)}
              className="text-zinc-500 hover:text-white p-0.5 cursor-pointer"
              title="Cancelar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div
            onClick={() => {
              if (isSelectionMode) {
                handleToggleSelectChat(chat.id);
              } else {
                onSelectChat(chat.id);
                onClose();
              }
            }}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
              isActive && !isSelectionMode
                ? isLight
                  ? 'bg-white text-zinc-900 border border-zinc-300 shadow-sm font-medium'
                  : 'bg-[#1e1e2b] text-white border border-[#333348]'
                : isSelected
                  ? isLight
                    ? 'bg-red-50 border border-red-300 text-zinc-900'
                    : 'bg-red-950/20 border border-red-500/40 text-white'
                  : isLight
                    ? 'text-zinc-700 hover:bg-zinc-200'
                    : 'text-zinc-300 hover:bg-[#14141c] hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5 truncate mr-1.5">
              {isSelectionMode ? (
                <button
                  type="button"
                  onClick={(e) => handleToggleSelectChat(chat.id, e)}
                  className="flex-shrink-0 cursor-pointer text-zinc-400 hover:text-red-400"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-red-500" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-500" />
                  )}
                </button>
              ) : (
                <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${
                  isPinnedGroup ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-600'
                }`} />
              )}
              <span className="truncate">{chat.title}</span>
            </div>

            {/* Always Visible Three Dots Button */}
            {!isSelectionMode && (
              <div className="relative" ref={isMenuOpen ? menuContainerRef : undefined}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenChatId(isMenuOpen ? null : chat.id);
                  }}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                    isMenuOpen
                      ? 'bg-zinc-700 text-white shadow'
                      : isLight
                        ? 'bg-zinc-200/80 hover:bg-zinc-300 text-zinc-600 hover:text-zinc-900'
                        : 'bg-[#1a1a24] hover:bg-[#252536] text-zinc-400 hover:text-white'
                  }`}
                  title="Opciones de conversación"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -2 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -2 }}
                      transition={{ duration: 0.12 }}
                      className={`absolute right-0 top-7 w-40 border rounded-xl p-1 shadow-2xl z-50 space-y-0.5 ${
                        isLight
                          ? 'bg-white border-zinc-200 text-zinc-800 shadow-zinc-400/20'
                          : 'bg-[#181824] border-[#2c2c3e] text-zinc-200'
                      }`}
                    >
                      {/* 1. Renombrar */}
                      <button
                        onClick={(e) => handleStartRename(chat, e)}
                        className={`w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                          isLight ? 'hover:bg-zinc-100 text-zinc-800' : 'hover:bg-zinc-800 text-zinc-200'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Renombrar</span>
                      </button>

                      {/* 2. Fijar / Desfijar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onTogglePinChat) onTogglePinChat(chat.id);
                          setMenuOpenChatId(null);
                        }}
                        className={`w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                          isLight ? 'hover:bg-zinc-100 text-zinc-800' : 'hover:bg-zinc-800 text-zinc-200'
                        }`}
                      >
                        <Pin className={`w-3.5 h-3.5 ${chat.isPinned ? 'text-amber-400' : 'text-zinc-400'}`} />
                        <span>{chat.isPinned ? 'Desfijar' : 'Fijar'}</span>
                      </button>

                      {/* 3. Seleccionar varios para eliminar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSelectionMode(true);
                          setSelectedChatIds([chat.id]);
                          setMenuOpenChatId(null);
                        }}
                        className={`w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                          isLight ? 'hover:bg-zinc-100 text-zinc-800' : 'hover:bg-zinc-800 text-zinc-200'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Seleccionar</span>
                      </button>

                      {/* 4. Eliminar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                          setMenuOpenChatId(null);
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
            />

            {/* Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] border-r z-50 flex flex-col justify-between select-none shadow-2xl ${
                isLight 
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900' 
                  : 'bg-[#0c0c10] border-[#1e1e28] text-zinc-100'
              }`}
            >
              {/* Top Bar: Logo & Close */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isLight ? 'border-zinc-300 bg-white' : 'border-[#1a1a24] bg-transparent'
              }`}>
                <div className="flex items-center space-x-3">
                  <KodiLogo size="sm" showText={false} />
                  <div>
                    <h2 className={`text-sm font-bold tracking-wide ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                      KODI
                    </h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    isLight 
                      ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* New Chat Action Button & Selection Mode Bar */}
              <div className="p-3 space-y-2">
                <button
                  id="btn-drawer-new-chat"
                  onClick={() => {
                    onNewChat();
                    onClose();
                  }}
                  className={`w-full h-10 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-zinc-50 border-zinc-300 text-zinc-900 shadow-sm'
                      : 'bg-[#181822] hover:bg-[#222230] border-[#2b2b3c] text-white'
                  }`}
                >
                  <Plus className="w-4 h-4 text-zinc-400" />
                  <span>Nuevo Chat</span>
                </button>

                {/* Selection Mode Controller */}
                {isSelectionMode ? (
                  <div className={`p-2 rounded-xl border flex items-center justify-between text-xs animate-fadeIn ${
                    isLight ? 'bg-zinc-200/70 border-zinc-300' : 'bg-[#181824] border-[#2b2b3c]'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSelectAll}
                        className="text-[11px] font-medium text-zinc-400 hover:text-white cursor-pointer"
                      >
                        {selectedChatIds.length === chats.length ? 'Desmarcar' : 'Todos'} ({selectedChatIds.length})
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleDeleteSelected}
                        disabled={selectedChatIds.length === 0}
                        className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-medium text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsSelectionMode(false);
                          setSelectedChatIds([]);
                        }}
                        className="px-2 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-[11px] cursor-pointer"
                      >
                        Listo
                      </button>
                    </div>
                  </div>
                ) : (
                  chats.length > 0 && (
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] text-zinc-400 font-mono">Chats guardados ({chats.length})</span>
                      <button
                        onClick={() => setIsSelectionMode(true)}
                        className="text-[11px] text-zinc-400 hover:text-white hover:underline cursor-pointer flex items-center space-x-1"
                      >
                        <CheckSquare className="w-3 h-3" />
                        <span>Seleccionar</span>
                      </button>
                    </div>
                  )
                )}
              </div>

              {/* Chat List Scrollable Area */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
                {/* Pinned Chats */}
                {pinnedChats.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-1.5 px-2 mb-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      <Pin className="w-3 h-3 text-amber-400" />
                      <span>Fijados</span>
                    </div>
                    <div className="space-y-1">
                      {pinnedChats.map((chat) => renderChatItem(chat, true))}
                    </div>
                  </div>
                )}

                {/* Recent Chats */}
                <div>
                  <div className="flex items-center space-x-1.5 px-2 mb-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <span>Recientes</span>
                  </div>
                  {recentChats.length === 0 && pinnedChats.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs text-zinc-400">
                      No hay conversaciones recientes
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {recentChats.map((chat) => renderChatItem(chat, false))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Footer: User Identity Card */}
              <div className={`p-3 border-t ${
                isLight ? 'border-zinc-300 bg-white' : 'border-[#1a1a24] bg-[#09090d]'
              }`}>
                <button
                  id="btn-user-settings-card"
                  onClick={handleOpenSettings}
                  className={`w-full p-2.5 border rounded-xl flex items-center justify-between transition-all cursor-pointer group text-left ${
                    isLight
                      ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-300 shadow-sm'
                      : 'bg-[#121218] hover:bg-[#181822] border-[#20202c] hover:border-[#323246]'
                  }`}
                  title="Abrir configuraciones"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full border border-zinc-500 object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {(user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
                      </div>
                    )}
                    <div className="truncate">
                      <span className={`text-xs font-semibold truncate block ${
                        isLight ? 'text-zinc-900 group-hover:text-black' : 'text-white group-hover:text-zinc-200'
                      }`}>
                        {user?.displayName || 'Usuario'}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate block font-mono">
                        {user?.email || ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-zinc-400 group-hover:text-zinc-600 transition-colors ml-1.5 flex-shrink-0">
                    <Settings className="w-4 h-4 mr-1 opacity-70 group-hover:opacity-100" />
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Settings Modal fallback if not handled by parent */}
      {!onOpenSettings && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          user={user}
          onSignOut={() => {
            setIsSettingsOpen(false);
            onClose();
            onSignOut();
          }}
          onUpdateUser={onUpdateUser}
          currentTheme={currentTheme}
          onToggleTheme={onToggleTheme}
        />
      )}
    </>
  );
};
