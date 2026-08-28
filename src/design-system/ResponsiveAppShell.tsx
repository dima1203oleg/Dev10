import React from 'react';
import { useViewport } from './useViewport';
import { Z_INDEX } from './tokens';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Bell, User, Search, ShieldAlert } from 'lucide-react';
import { ResponsiveNavigation, navItems } from './ResponsiveNavigation';

interface ResponsiveAppShellProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  contextPanel?: React.ReactNode;
  activeTab?: string;
  onNavigate?: (tab: string) => void;
}

export const ResponsiveAppShell: React.FC<ResponsiveAppShellProps> = ({
  children,
  sidebarContent,
  headerContent,
  contextPanel,
  activeTab = 'dashboard',
  onNavigate
}) => {
  const { isMobile, isTablet, isLaptop, isDesktop, isTV } = useViewport();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 flex flex-row overflow-hidden selection:bg-emerald-500/30">
      {/* 1. SIDEBAR NAVIGATION (Tablet/Desktop/TV) */}
      {!isMobile && (
        <ResponsiveNavigation 
          activeTab={activeTab} 
          onNavigate={(id) => onNavigate?.(id)} 
        />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative h-[100dvh]">
        {/* MOBILE HEADER */}
        {isMobile && (
          <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0 z-30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-lg shadow-emerald-900/40">T</div>
              <span className="font-black text-base tracking-tighter uppercase">Tender<span className="text-emerald-500">AI</span></span>
            </div>
            <div className="flex items-center gap-4">
               <button className="p-2 text-slate-400"><Search size={20} /></button>
               <button onClick={() => setIsDrawerOpen(true)} className="p-2 bg-slate-800 rounded-xl text-white shadow-lg">
                 <Menu size={20} />
               </button>
            </div>
          </header>
        )}

        {/* DESKTOP TOP BAR (Only if headerContent is provided) */}
        {!isMobile && headerContent && (
          <header className="h-16 bg-slate-950 border-b border-slate-900 flex items-center justify-between px-8 flex-shrink-0 z-20">
            <div className="flex-1 max-w-2xl">
              {headerContent}
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 System Online
               </div>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950">
          <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
            <div className="max-w-7xl mx-auto w-full animate-fadeIn">
              {children}
            </div>
          </div>
          {/* Bottom spacer for mobile nav */}
          {isMobile && <div className="h-20" />}
        </main>

        {/* 3. BOTTOM NAV (Mobile Only) */}
        {isMobile && (
          <ResponsiveNavigation 
            activeTab={activeTab} 
            onNavigate={(id) => onNavigate?.(id)} 
          />
        )}
      </div>

      {/* 4. CONTEXT PANEL (Wide Screens Only) */}
      {(isDesktop || isTV) && contextPanel && (
        <aside className="w-96 bg-slate-950 border-l border-slate-900 p-8 overflow-y-auto custom-scrollbar flex-shrink-0 animate-slideInRight">
          {contextPanel}
          {sidebarContent && <div className="mt-8 pt-8 border-t border-slate-900">{sidebarContent}</div>}
        </aside>
      )}

      {/* 5. MOBILE DRAWER OVERLAY */}
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
              className="fixed right-0 top-0 bottom-0 w-80 bg-slate-950 border-l border-slate-800 z-[101] p-8 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center font-black text-white shadow-xl shadow-emerald-950">T</div>
                  <span className="font-black text-xl tracking-tighter uppercase">Menu</span>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl">
                  <X size={24} />
                </button>
              </div>
              
              <nav className="flex-1 space-y-3">
                 {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate?.(item.id); setIsDrawerOpen(false); }}
                    className={`
                      w-full flex items-center gap-5 p-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all
                      ${activeTab === item.id ? 'bg-emerald-600 text-slate-950 shadow-xl shadow-emerald-950' : 'text-slate-400 hover:bg-slate-900'}
                    `}
                  >
                    <item.icon size={24} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t border-slate-900">
                 <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"><User size={20} className="text-slate-500" /></div>
                    <div>
                      <div className="text-xs font-black text-white uppercase tracking-widest">Олександр Б.</div>
                      <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">CEO / Admin</div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
