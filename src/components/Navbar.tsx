import React, { useState } from 'react';
import { AppSection } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldAlert, 
  Building2, 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Bot, 
  FolderSearch,
  Sparkles,
  ShieldCheck,
  CheckSquare,
  Users2,
  GitCompare,
  FileCheck2,
  ChevronDown,
  LogOut,
  User as UserIcon,
  BarChart3
} from 'lucide-react';

interface NavbarProps {
  currentSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  activeTenderCount: number;
  highRiskCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onSelectSection,
  highRiskCount,
}) => {
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const { user, signIn, signOut } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectSection('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl">
              T
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  TenderAI <span className="text-emerald-400 font-light">&</span> FoulTender
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Enterprise Suite
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden md:block">
                Підготовка, перевірка, кошториси та антикорупційний захист тендерів
              </p>
            </div>
          </div>

          {/* Navigation Links and User Actions */}
          <div className="flex items-center space-x-4">
            <nav className="hidden xl:flex items-center space-x-1">
            <button
              id="nav-dashboard-btn"
              onClick={() => onSelectSection('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentSection === 'dashboard'
                  ? 'bg-slate-800 text-white shadow-inner border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Огляд</span>
            </button>

            <button
              id="nav-radar-btn"
              onClick={() => onSelectSection('radar')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentSection === 'radar'
                  ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/60 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Радар</span>
            </button>

            <button
              id="nav-war-room-btn"
              onClick={() => onSelectSection('war-room')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentSection === 'war-room'
                  ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-800/60 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>War Room</span>
            </button>

            <button
              id="nav-vault-btn"
              onClick={() => onSelectSection('vault')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentSection === 'vault'
                  ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/60 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Smart Vault</span>
            </button>

            <button
              id="nav-analytics-btn"
              onClick={() => onSelectSection('analytics')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentSection === 'analytics'
                  ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-800/60 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Аналітика</span>
            </button>

            {/* Dropdown for More Tools */}
            <div className="relative">
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  ['foultender', 'construction', 'matrix', 'audit', 'competitors', 'diff', 'post-tender', 'complaints', 'bid-packages', 'multiagent-chat', 'catalog', 'services'].includes(currentSection)
                  ? 'bg-slate-800 text-white shadow-inner border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>Всі інструменти</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
                {highRiskCount > 0 && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>

              {toolsDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 grid grid-cols-1 gap-1 px-2"
                  onMouseLeave={() => setToolsDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Підготовка</div>
                  <button onClick={() => { onSelectSection('matrix'); setToolsDropdownOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2"><CheckSquare className="w-4 h-4 text-emerald-400" />Матриця вимог</button>
                  <button onClick={() => { onSelectSection('construction'); setToolsDropdownOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-400" />Кошторис & BoQ</button>
                  <button onClick={() => { onSelectSection('diff'); setToolsDropdownOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2"><GitCompare className="w-4 h-4 text-indigo-400" />AI Diff версій ТД</button>
                  <button onClick={() => { onSelectSection('catalog'); setToolsDropdownOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2"><FolderSearch className="w-4 h-4 text-teal-400" />Реєстр тендерів</button>

                  <div className="px-3 py-1.5 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Аналітика та Безпека</div>
                  <button onClick={() => { onSelectSection('foultender'); setToolsDropdownOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-400" /> FoulTender</div>
                    {highRiskCount > 0 && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-600/20 text-red-400">{highRiskCount}</span>}
                  </button>
                  <button onClick={() => { onSelectSection('competitors'); setToolsDropdownOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2"><Users2 className="w-4 h-4 text-amber-400" />Конкуренти & Змови</button>
                  
                  <div className="px-3 py-1.5 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Фіналізація</div>
                  <button onClick={() => { onSelectSection('audit'); setToolsDropdownOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2"><FileCheck2 className="w-4 h-4 text-emerald-400" />Pre-Audit</button>
                  <button onClick={() => { onSelectSection('bid-packages'); setToolsDropdownOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2"><Briefcase className="w-4 h-4 text-indigo-400" />Генератор пакетів</button>
                  <button onClick={() => { onSelectSection('complaints'); setToolsDropdownOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2"><FileText className="w-4 h-4 text-amber-400" />Скарги до АМКУ</button>
                  
                  <div className="px-3 py-1.5 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Інше</div>
                  <button onClick={() => { onSelectSection('multiagent-chat'); setToolsDropdownOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2"><Bot className="w-4 h-4 text-blue-400" />Мультиагентний чат</button>
                  <button onClick={() => { onSelectSection('post-tender'); setToolsDropdownOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2"><LayoutDashboard className="w-4 h-4 text-purple-400" />Посттендер</button>
                </div>
              )}
            </div>
          </nav>

          {/* Right side AI status & quick actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">Gemini Online</span>
            </div>

            {user ? (
              <div className="flex items-center space-x-2 border-l border-slate-700 pl-3">
                <div className="flex items-center space-x-2 px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate max-w-[100px]">{user.email}</span>
                </div>
                <button 
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Вийти"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Увійти</span>
              </button>
            )}

            <button
              id="quick-pre-submission-btn"
              onClick={() => onSelectSection('audit')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pre-Submission</span>
            </button>
          </div>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation Bar */}
        <div className="xl:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800 text-xs no-scrollbar">
          <button
            onClick={() => onSelectSection('dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              currentSection === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Огляд
          </button>
          <button
            onClick={() => onSelectSection('radar')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              currentSection === 'radar' ? 'bg-emerald-900/60 text-emerald-200' : 'text-slate-400'
            }`}
          >
            AI Радар
          </button>
          <button
            onClick={() => onSelectSection('war-room')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              currentSection === 'war-room' ? 'bg-indigo-900/60 text-indigo-200' : 'text-slate-400'
            }`}
          >
            War Room
          </button>
          <button
            onClick={() => onSelectSection('vault')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              currentSection === 'vault' ? 'bg-emerald-900/60 text-emerald-200' : 'text-slate-400'
            }`}
          >
            Smart Vault
          </button>
        </div>
      </div>
    </header>
  );
};
