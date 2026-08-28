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
  FileSearch,
  Calculator,
  UserCheck,
  Package
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  group?: 'GLOBAL' | 'WORKSPACE';
}

interface ResponsiveNavigationProps {
  activeTab: string;
  onNavigate: (id: string) => void;
  isDrawerOpen?: boolean;
  onCloseDrawer?: () => void;
  hasActiveTender?: boolean;
}

export const globalNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Головна', icon: LayoutDashboard, group: 'GLOBAL' },
  { id: 'catalog', label: 'Каталог ТД', icon: Search, group: 'GLOBAL' },
  { id: 'radar', label: 'Tender Radar', icon: Radar, group: 'GLOBAL' },
  { id: 'vault', label: 'Smart Vault', icon: FileText, group: 'GLOBAL' },
  { id: 'analytics', label: 'Аналітика', icon: TrendingUp, group: 'GLOBAL' },
];

export const workspaceNavItems: NavItem[] = [
  { id: 'war-room', label: 'War Room', icon: Briefcase, group: 'WORKSPACE' },
  { id: 'matrix', label: 'Вимоги ТД', icon: Layers, group: 'WORKSPACE' },
  { id: 'foultender', label: 'FoulTender', icon: ShieldAlert, group: 'WORKSPACE' },
  { id: 'construction', label: 'Кошторис (AI)', icon: Calculator, group: 'WORKSPACE' },
  { id: 'audit', label: 'Pre-Audit', icon: UserCheck, group: 'WORKSPACE' },
  { id: 'bid-packages', label: 'Bid Package', icon: Package, group: 'WORKSPACE' },
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

  const allItems = hasActiveTender 
    ? [...globalNavItems, ...workspaceNavItems] 
    : globalNavItems;

  // 1. MOBILE BOTTOM NAVIGATION
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 pb-safe z-[40]">
        {globalNavItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 p-1 min-w-[64px] transition-all duration-300 ${
              activeTab === item.id ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'scale-110' : ''} />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => onNavigate(hasActiveTender ? 'war-room' : 'catalog')}
          className={`flex flex-col items-center gap-1 p-1 min-w-[64px] transition-all duration-300 ${
            workspaceNavItems.some(i => i.id === activeTab) ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <Menu size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">{hasActiveTender ? 'Workspace' : 'Меню'}</span>
        </button>
      </nav>
    );
  }

  // 2. TABLET RAIL (Icon Only Sidebar)
  if (isTablet || isLaptop) {
    return (
      <aside className="w-20 bg-slate-950 border-r border-slate-900 flex flex-col items-center py-8 z-[30]">
        <div className="flex-1 space-y-6">
          {allItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                group relative p-3 rounded-2xl transition-all duration-300
                ${activeTab === item.id ? 'bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-white hover:bg-slate-900'}
                ${item.group === 'WORKSPACE' ? 'border border-emerald-500/20' : ''}
              `}
            >
              <item.icon size={24} />
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                {item.label} {item.group === 'WORKSPACE' ? '(Active Tender)' : ''}
              </div>
            </button>
          ))}
        </div>
        <button 
          onClick={() => signOut()}
          className="p-3 text-slate-500 hover:text-rose-400 transition-colors mt-auto"
        >
          <LogOut size={24} />
        </button>
      </aside>
    );
  }

  // 3. DESKTOP / TV NAVIGATION (Side Sidebar)
  return (
    <aside className={`${isTV ? 'w-80' : 'w-72'} bg-slate-950 border-r border-slate-900 flex flex-col z-[30]`}>
      <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
             <ShieldAlert className="text-white w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black text-white tracking-tighter uppercase leading-none">Tender<span className="text-emerald-500">AI</span></div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Enterprise OS</div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Global Group */}
          <div className="space-y-2">
            <div className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Навігація</div>
            {globalNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 group
                  ${activeTab === item.id 
                    ? 'bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-600/20' 
                    : 'text-slate-500 hover:text-white hover:bg-slate-900/50'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} className={activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                  <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>

          {/* Workspace Group (Conditional) */}
          {hasActiveTender && (
            <div className="space-y-2 animate-fadeIn">
              <div className="px-4 flex items-center justify-between text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">
                <span>Робочий простір</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              {workspaceNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 group
                    ${activeTab === item.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/5 border border-transparent hover:border-emerald-500/10'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={20} className={activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                  {activeTab === item.id && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User & Notifications in Sidebar for Desktop */}
      <div className="p-8 border-t border-slate-900 space-y-6">
        <div className="flex items-center justify-between">
          <button className="relative p-2 text-slate-500 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-950"></span>
          </button>
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-rose-400 uppercase tracking-widest transition-colors"
          >
            <LogOut size={16} />
            Вихід
          </button>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900/30 p-3 rounded-2xl border border-slate-900">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 overflow-hidden">
             {user?.photoURL ? (
               <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             ) : (
               <User size={20} />
             )}
          </div>
          <div className="text-left min-w-0">
            <div className="text-[10px] font-black text-white uppercase tracking-widest truncate">{user?.displayName || 'Користувач'}</div>
            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter truncate">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
