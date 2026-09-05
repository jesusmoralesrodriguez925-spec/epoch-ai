import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Crown, 
  Zap, 
  MessageSquarePlus, 
  MoreVertical, 
  Pin, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  Sun,
  Moon
} from 'lucide-react';
import { KodiLogo } from './KodiLogo';
import { User, ChatSession } from '../types';

interface DashboardHeaderProps {
  user: User;
  activeChat: ChatSession | null;
  onOpenMenu: () => void;
  onNewChat: () => void;
  onRenameChat: (newTitle: string) => void;
  onTogglePinChat: () => void;
  onDeleteChat: () => void;
  currentTheme?: 'dark' | 'light';
  onToggleTheme?: (theme: 'dark' | 'light') => void;
  onOpenBilling?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  activeChat,
  onOpenMenu,
  onNewChat,
  onRenameChat,
  onTogglePinChat,
  onDeleteChat,
  currentTheme = 'dark',
  onToggleTheme,
  onOpenBilling,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const isLight = currentTheme === 'light';
  const userEmail = (user?.email || '').toLowerCase();
  const isAdmin = Boolean(user?.isAdmin) || userEmail === 'jesusmoralesrodriguez925@gmail.com' || user?.credits === -1;
  const standardCredits = typeof user?.credits === 'number' ? user.credits : 50;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartRename = () => {
    setNewTitle(activeChat?.title || 'Chat de KODI');
    setIsRenaming(true);
    setIsMenuOpen(false);
  };

  const handleSaveRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newTitle.trim()) {
      onRenameChat(newTitle.trim());
    }
    setIsRenaming(false);
  };

  return (
    <header className={`w-full px-3 sm:px-5 py-2.5 flex items-center justify-between z-30 select-none border-b transition-colors ${
      isLight
        ? 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
        : 'bg-[#000000] border-[#141418] text-white'
    }`}>
      {/* Left side: Hamburger, Logo, VIP Crown / Standard Credits pill */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Menu Hamburger */}
        <button
          id="btn-sidebar-menu"
          onClick={onOpenMenu}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 cursor-pointer ${
            isLight
              ? 'text-zinc-700 hover:text-black hover:bg-zinc-100'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
          }`}
          title="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* KODI Hexagon Logo */}
        <div className="flex items-center select-none" title="KODI">
          <KodiLogo size="sm" showText={false} />
        </div>

        {/* VIP Exclusive badge or Standard Credits Bar */}
        {isAdmin ? (
          <div 
            onClick={onOpenBilling}
            className={`flex items-center space-x-2 sm:space-x-3 ml-1 sm:ml-2 ${onOpenBilling ? 'cursor-pointer hover:opacity-90' : ''}`}
            title={onOpenBilling ? 'Ver planes y facturación' : 'Acceso Creador Ilimitado'}
          >
            {/* Crown Icon Pill */}
            <div className="flex items-center justify-center px-2 py-1 bg-[#1a1308] border border-[#483312] rounded-lg shadow-[0_0_10px_rgba(245,158,11,0.15)]">
              <Crown className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
            </div>

            {/* Unlimited Creator Credits Bar */}
            <div className="flex items-center space-x-1.5 bg-[#0d0d12] border border-[#1f1f28] px-2.5 py-1 rounded-lg">
              <Zap className="w-3 h-3 text-[#eab308] fill-[#eab308] animate-pulse" />
              <div className="flex flex-col justify-center">
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] font-bold text-amber-400 font-mono uppercase tracking-wider">
                    CREADOR ILIMITADO
                  </span>
                </div>
                <div className="w-16 sm:w-20 h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 w-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenBilling}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg ml-1 sm:ml-2 border transition-all ${
              onOpenBilling ? 'cursor-pointer hover:border-amber-500/50 active:scale-95' : ''
            } ${
              isLight
                ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
                : 'bg-[#0d0d12] border-[#1f1f28] text-zinc-200'
            }`}
            title="Ver planes y recargar créditos"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <div className="flex flex-col justify-center text-left">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="font-semibold text-zinc-400">Créditos:</span>
                <span className="font-bold text-amber-400 ml-1">
                  {standardCredits} / {user.maxDailyCredits || 50}
                </span>
              </div>
              <div className="w-16 sm:w-20 h-1 bg-zinc-700/60 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, (standardCredits / (user.maxDailyCredits || 50)) * 100))}%` }}
                />
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Center Spacer - Completely empty as requested */}
      <div className="flex-1" />

      {/* Right side controls: Quick theme toggle, New Chat, and Chat Options */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Quick Theme Toggle Icon */}
        {onToggleTheme && (
          <button
            onClick={() => onToggleTheme(isLight ? 'dark' : 'light')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isLight
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
            title={isLight ? 'Cambiar a Tema Oscuro' : 'Cambiar a Tema Claro'}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        )}

        {/* New Chat Button */}
        <button
          id="btn-header-new-chat"
          onClick={onNewChat}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all active:scale-95 cursor-pointer ${
            isLight
              ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
              : 'bg-[#121218] hover:bg-[#1c1c24] border-[#22222e] text-zinc-200'
          }`}
          title="Iniciar nuevo chat"
        >
          <MessageSquarePlus className="w-4 h-4 text-zinc-400" />
          <span className="hidden md:inline">Nuevo Chat</span>
        </button>

        {/* Chat More Options Dropdown */}
        {activeChat && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                isLight
                  ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className={`absolute right-0 top-10 w-44 border rounded-xl p-1.5 shadow-2xl z-50 space-y-1 ${
                    isLight
                      ? 'bg-white border-zinc-200 text-zinc-800'
                      : 'bg-[#15151c] border-[#252533] text-zinc-200'
                  }`}
                >
                  <button
                    onClick={handleStartRename}
                    className={`w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-zinc-100' : 'hover:bg-zinc-800 text-zinc-200'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Renombrar</span>
                  </button>
                  <button
                    onClick={() => {
                      onTogglePinChat();
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-zinc-100' : 'hover:bg-zinc-800 text-zinc-200'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activeChat.isPinned ? 'Desfijar chat' : 'Fijar chat'}</span>
                  </button>
                  <button
                    onClick={() => {
                      onDeleteChat();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar chat</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
};
