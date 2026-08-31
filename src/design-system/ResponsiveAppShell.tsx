import React, { useState } from 'react';
import { useViewport } from './useViewport';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  Search, 
  ShieldAlert, 
  LogOut, 
  Globe, 
  ChevronDown, 
  Check, 
  Users, 
  Sparkles,
  Command,
  ExternalLink
} from 'lucide-react';
import { ResponsiveNavigation, allNavItems } from './ResponsiveNavigation';

interface ResponsiveAppShellProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  contextPanel?: React.ReactNode;
  activeTab?: string;
  onNavigate?: (id: string) => void;
  hasActiveTender?: boolean;
  onOpenCommandPalette?: () => void;
  systemMode?: 'SOLO' | 'TEAM';
  onToggleSystemMode?: (mode: 'SOLO' | 'TEAM') => void;
}

export const ResponsiveAppShell: React.FC<ResponsiveAppShellProps> = ({
  children,
  sidebarContent,
  headerContent,
  contextPanel,
  activeTab = 'dashboard',
  onNavigate,
  hasActiveTender = false,
  onOpenCommandPalette,
  systemMode = 'TEAM',
  onToggleSystemMode
}) => {
  const { isMobile, isTablet, isLaptop, isDesktop, isTV } = useViewport();
  const { user, signOut } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'UK' | 'EN'>('UK');

  // Notifications stay empty until the persisted notifications API is available.
  const notifications: Array<{ id: string; title: string; desc: string; time: string; read: boolean }> = [];

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 flex flex-row overflow-hidden selection:bg-emerald-500/30">
      {/* 1. SIDEBAR NAVIGATION (Tablet/Desktop/TV) */}
      {!isMobile && (
        <ResponsiveNavigation 
          activeTab={activeTab} 
          onNavigate={(id) => onNavigate?.(id)} 
          hasActiveTender={hasActiveTender}
        />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative h-[100dvh]">
        {/* TOP HEADER BAR (Mobile / Tablet / Desktop) */}
        <header className="h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-900/90 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 z-30">
          {/* Left: Mobile branding / Desktop Search trigger */}
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {isMobile ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-tr from-emerald-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md shadow-emerald-950">
                  T
                </div>
                <span className="font-black text-sm tracking-tight text-white uppercase">
                  Tender<span className="text-emerald-400">AI</span>
                </span>
              </div>
            ) : (
              <button
                onClick={onOpenCommandPalette}
                className="w-full max-w-md bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-400 flex items-center justify-between transition-all group shadow-inner cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Search size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  <span className="truncate">Пошук тендерів, CPV, ЄДРПОУ, модулів...</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="hidden sm:inline-block text-[10px] font-mono font-bold bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                    ⌘ K
                  </kbd>
                </div>
              </button>
            )}
          </div>

          {/* Right: Language switch, Mode toggle, Notifications, User profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
              >
                <Globe size={13} className="text-slate-400" />
                <span>{language === 'UK' ? 'Українська' : 'English'}</span>
                <ChevronDown size={12} className="text-slate-500" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-fadeIn">
                  <button
                    onClick={() => { setLanguage('UK'); setIsLangMenuOpen(false); }}
                    className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-slate-800 ${language === 'UK' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}
                  >
                    <span>Українська</span>
                    {language === 'UK' && <Check size={14} />}
                  </button>
                  <button
                    onClick={() => { setLanguage('EN'); setIsLangMenuOpen(false); }}
                    className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-slate-800 ${language === 'EN' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}
                  >
                    <span>English</span>
                    {language === 'EN' && <Check size={14} />}
                  </button>
                </div>
              )}
            </div>

            {/* SOLO / TEAM Switch */}
            {onToggleSystemMode && (
              <div className="hidden sm:inline-flex rounded-xl p-1 bg-slate-900 border border-slate-800 text-[11px] font-bold">
                <button
                  onClick={() => onToggleSystemMode('SOLO')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    systemMode === 'SOLO' ? 'bg-emerald-600 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  СОЛО
                </button>
                <button
                  onClick={() => onToggleSystemMode('TEAM')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    systemMode === 'TEAM' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  КОМАНДА
                </button>
              </div>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">Сповіщення</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">2 нових</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {notifications.map(n => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{n.title}</span>
                          <span className="text-[9px] text-slate-500">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 rounded-xl transition-all"
              >
                <div className="w-7 h-7 bg-gradient-to-tr from-emerald-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-inner">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[100px]">
                    {user?.displayName || user?.email?.split('@')[0] || 'Андрій М.'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">Тендерний аналітик</div>
                </div>
                <ChevronDown size={12} className="text-slate-500 hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <div className="text-xs font-bold text-white truncate">{user?.displayName || 'Андрій Мельник'}</div>
                    <div className="text-[10px] text-slate-400 truncate">{user?.email || 'andrii.m@tenderai.ua'}</div>
                  </div>
                  <button
                    onClick={() => { onNavigate?.('team'); setIsUserMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <Users size={14} className="text-slate-400" />
                    <span>Командний простір</span>
                  </button>
                  <button
                    onClick={() => { onNavigate?.('vault'); setIsUserMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <Sparkles size={14} className="text-slate-400" />
                    <span>Профіль компанії</span>
                  </button>
                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => signOut()}
                      className="w-full px-3 py-2 rounded-xl text-xs text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-bold"
                    >
                      <LogOut size={14} />
                      <span>Вийти з системи</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Drawer Trigger */}
            {isMobile && (
              <button 
                onClick={() => setIsDrawerOpen(true)} 
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
              >
                <Menu size={18} />
              </button>
            )}
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full animate-fadeIn">
              {children}
            </div>
          </div>
          {isMobile && <div className="h-20" />}
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        {isMobile && (
          <ResponsiveNavigation 
            activeTab={activeTab} 
            onNavigate={(id) => onNavigate?.(id)} 
            hasActiveTender={hasActiveTender}
          />
        )}
      </div>

      {/* CONTEXT PANEL (Right Sidebar on Desktop) */}
      {(isDesktop || isTV) && contextPanel && (
        <aside className="w-80 bg-slate-950 border-l border-slate-900/90 p-6 overflow-y-auto custom-scrollbar flex-shrink-0 animate-slideInRight">
          {contextPanel}
          {sidebarContent && <div className="mt-6 pt-6 border-t border-slate-900">{sidebarContent}</div>}
        </aside>
      )}

      {/* MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-slate-950 border-l border-slate-800 z-[101] p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-emerald-950">T</div>
                  <span className="font-black text-lg text-white">Меню системи</span>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl">
                  <X size={20} />
                </button>
              </div>
              
              <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
                {allNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate?.(item.id); setIsDrawerOpen(false); }}
                    className={`
                      w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left
                      ${activeTab === item.id ? 'bg-emerald-600 text-slate-950 font-black shadow-lg shadow-emerald-950' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}
                    `}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-slate-900 space-y-3">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 text-rose-400 font-bold text-xs rounded-xl"
                >
                  <LogOut size={16} /> Вийти
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
