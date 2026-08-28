import React from 'react';
import { useViewport } from './useViewport';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Search, 
  Radar, 
  ShieldAlert, 
  Settings, 
  Menu, 
  X,
  ChevronRight,
  TrendingUp, 
  FileText, 
  User, 
  Bell, 
  LogOut, 
  Briefcase, 
  Layers, 
  Calculator, 
  UserCheck, 
  Package,
  Users,
  Shield,
  Building2,
  Lock
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  group?: 'GLOBAL' | 'WORKSPACE' | 'SETTINGS';
}

interface ResponsiveNavigationProps {
  activeTab: string;
  onNavigate: (id: string) => void;
  isDrawerOpen?: boolean;
  onCloseDrawer?: () => void;
  hasActiveTender?: boolean;
}

export const allNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Головна панель', icon: LayoutDashboard, group: 'GLOBAL' },
  { id: 'catalog', label: 'Каталог ТД', icon: Search, group: 'GLOBAL' },
  { id: 'radar', label: 'Тендерний Радар', icon: Radar, group: 'GLOBAL' },
  { id: 'war-room', label: 'Командний Центр', icon: Briefcase, group: 'WORKSPACE' },
  { id: 'vault', label: 'Документи / Vault', icon: FileText, group: 'GLOBAL' },
  { id: 'bid-packages', label: 'Пакет Пропозиції', icon: Package, group: 'WORKSPACE' },
  { id: 'audit', label: 'Аудит', icon: UserCheck, group: 'WORKSPACE' },
  { id: 'competitors', label: 'Конкуренти', icon: Users, group: 'WORKSPACE' },
  { id: 'foultender', label: 'Ризики / FoulTender', icon: ShieldAlert, group: 'WORKSPACE' },
  { id: 'analytics', label: 'Аналітика', icon: TrendingUp, group: 'GLOBAL' },
  { id: 'team', label: 'Команда', icon: Users, group: 'GLOBAL' },
];

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  activeTab,
  onNavigate,
  isDrawerOpen,
  onCloseDrawer,
  hasActiveTender = false
}) => {
  const { mode, isMobile, isTablet, isLaptop, isDesktop, isTV } = useViewport();
  const { user, signOut } = useAuth();

  // 1. MOBILE BOTTOM NAVIGATION
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 pb-safe z-[40]">
        {[
          { id: 'dashboard', label: 'Головна', icon: LayoutDashboard },
          { id: 'catalog', label: 'Каталог', icon: Search },
          { id: 'radar', label: 'Радар', icon: Radar },
          { id: 'war-room', label: 'Командний центр', icon: Briefcase },
          { id: 'vault', label: 'Vault', icon: FileText },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 p-1 min-w-[60px] transition-all duration-200 ${
              activeTab === item.id ? 'text-emerald-400 font-bold' : 'text-slate-500'
            }`}
          >
            <item.icon size={18} className={activeTab === item.id ? 'scale-110' : ''} />
            <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
    );
  }

  // 2. TABLET RAIL (Icon Only Sidebar)
  if (isTablet) {
    return (
      <aside className="w-16 bg-slate-950 border-r border-slate-900 flex flex-col items-center py-6 z-[30]">
        <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-sm mb-8 shadow-lg shadow-emerald-950">
          T
        </div>
        <div className="flex-1 space-y-4">
          {allNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                group relative p-2.5 rounded-xl transition-all duration-200
                ${activeTab === item.id ? 'bg-emerald-600 text-slate-950 shadow-md shadow-emerald-600/20' : 'text-slate-500 hover:text-white hover:bg-slate-900'}
              `}
            >
              <item.icon size={20} />
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                {item.label}
              </div>
            </button>
          ))}
        </div>
        <button 
          onClick={() => signOut()}
          className="p-2.5 text-slate-500 hover:text-rose-400 transition-colors mt-auto"
        >
          <LogOut size={20} />
        </button>
      </aside>
    );
  }

  // 3. DESKTOP / TV NAVIGATION (Matching exact mockup from IMG_8097/IMG_8098/IMG_8099)
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900/90 flex flex-col z-[30] select-none">
      <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
        {/* Branding Logo */}
        <div className="flex items-center gap-3 px-2 pt-1 pb-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-950">
            <Shield className="text-white w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-black text-white tracking-tight flex items-center gap-1.5 leading-none">
              <span>Tender<span className="text-emerald-400">AI</span> OS</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">/ Predator v2.7.1</div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {allNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 group text-left
                  ${isActive 
                    ? 'bg-slate-900 text-white font-bold border border-slate-800 shadow-inner' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={17} className={`${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="text-xs tracking-tight">{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Support & Live Status Footer */}
      <div className="p-4 border-t border-slate-900/90 space-y-3">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Потрібна допомога?</div>
          <p className="text-[10px] text-slate-500">Зверніться до експертної підтримки</p>
          <button
            onClick={() => onNavigate('multiagent-chat')}
            className="w-full py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-bold transition-colors"
          >
            Чат з підтримкою
          </button>
        </div>

        <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Online</span>
          </div>
          <span>Prozorro LIVE</span>
        </div>
      </div>
    </aside>
  );
};
