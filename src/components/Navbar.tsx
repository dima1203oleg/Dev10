import React, { useState } from 'react';
import { AppSection } from '../types';
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
  ChevronDown
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
              <p className="text-xs text-slate-400 font-medium">
                Підготовка, перевірка, кошториси та антикорупційний захист тендерів
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            <button
              id="nav-dashboard-btn"
              onClick={() => onSelectSection('dashboard')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentSection === 'dashboard'
                  ? 'bg-slate-800 text-white shadow-inner border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Огляд</span>
            </button>

            <button
              id="nav-radar-btn"
              onClick={() => onSelectSection('radar')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentSection === 'radar'
                  ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/60 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Радар</span>
            </button>

            <button
              id="nav-war-room-btn"
              onClick={() => onSelectSection('war-room')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentSection === 'war-room'
                  ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-800/60 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>War Room</span>
            </button>

            <button
              id="nav-matrix-btn"
              onClick={() => onSelectSection('matrix')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentSection === 'matrix'
                  ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/60 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Матриця вимог</span>
            </button>

            <button
              id="nav-vault-btn"
              onClick={() => onSelectSection('vault')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentSection === 'vault'
                  ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/60 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Vault</span>
            </button>

            <button
              id="nav-foultender-btn"
              onClick={() => onSelectSection('foultender')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentSection === 'foultender'
                  ? 'bg-red-950/50 text-red-200 border border-red-800/60 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>FoulTender</span>
              {highRiskCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-600 text-white">
                  {highRiskCount}
                </span>
              )}
            </button>

            <button
              id="nav-construction-btn"
              onClick={() => onSelectSection('construction')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentSection === 'construction'
                  ? 'bg-emerald-950/50 text-emerald-200 border border-emerald-800/60 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Кошторис</span>
            </button>

            <button
              id="nav-competitors-btn"
              onClick={() => onSelectSection('competitors')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentSection === 'competitors'
                  ? 'bg-amber-950/60 text-amber-200 border border-amber-800/60 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Конкуренти</span>
            </button>

            <button
              id="nav-audit-btn"
              onClick={() => onSelectSection('audit')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentSection === 'audit'
                  ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/60 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pre-Audit</span>
            </button>

            {/* Dropdown for More Tools */}
            <div className="relative">
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                <span>Більше</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {toolsDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50"
                  onMouseLeave={() => setToolsDropdownOpen(false)}
                >
                  <button
                    onClick={() => { onSelectSection('post-tender'); setToolsDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-purple-400" />
                    <span>Посттендер & АМКУ</span>
                  </button>
                  <button
                    onClick={() => { onSelectSection('diff'); setToolsDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <GitCompare className="w-4 h-4 text-indigo-400" />
                    <span>AI Diff версій ТД</span>
                  </button>
                  <button
                    onClick={() => { onSelectSection('complaints'); setToolsDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Скарги до АМКУ</span>
                  </button>
                  <button
                    onClick={() => { onSelectSection('bid-packages'); setToolsDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    <span>Генератор пакетів</span>
                  </button>
                  <button
                    onClick={() => { onSelectSection('multiagent-chat'); setToolsDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <Bot className="w-4 h-4 text-blue-400" />
                    <span>Мультиагентний чат</span>
                  </button>
                  <button
                    onClick={() => { onSelectSection('services'); setToolsDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Тарифи & Сервісна модель</span>
                  </button>
                  <button
                    onClick={() => { onSelectSection('catalog'); setToolsDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <FolderSearch className="w-4 h-4 text-teal-400" />
                    <span>Реєстр тендерів</span>
                  </button>
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
              <span className="text-slate-300 font-medium">Gemini 3.7 Online</span>
            </div>

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

        {/* Mobile Horizontal Sub-Navigation Bar */}
        <div className="xl:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800 text-xs no-scrollbar">
          <button
            onClick={() => onSelectSection('dashboard')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
              currentSection === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Огляд
          </button>
          <button
            onClick={() => onSelectSection('matrix')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
              currentSection === 'matrix' ? 'bg-emerald-900/60 text-emerald-200' : 'text-slate-400'
            }`}
          >
            Матриця вимог
          </button>
          <button
            onClick={() => onSelectSection('vault')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
              currentSection === 'vault' ? 'bg-emerald-900/60 text-emerald-200' : 'text-slate-400'
            }`}
          >
            Smart Vault
          </button>
          <button
            onClick={() => onSelectSection('foultender')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
              currentSection === 'foultender' ? 'bg-red-900/60 text-red-200' : 'text-slate-400'
            }`}
          >
            FoulTender
          </button>
          <button
            onClick={() => onSelectSection('construction')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
              currentSection === 'construction' ? 'bg-emerald-900/60 text-emerald-200' : 'text-slate-400'
            }`}
          >
            Кошторис & BoQ
          </button>
          <button
            onClick={() => onSelectSection('competitors')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
              currentSection === 'competitors' ? 'bg-amber-900/60 text-amber-200' : 'text-slate-400'
            }`}
          >
            Конкуренти & Змови
          </button>
          <button
            onClick={() => onSelectSection('diff')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
              currentSection === 'diff' ? 'bg-indigo-900/60 text-indigo-200' : 'text-slate-400'
            }`}
          >
            AI Diff
          </button>
          <button
            onClick={() => onSelectSection('audit')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
              currentSection === 'audit' ? 'bg-emerald-900/60 text-emerald-200' : 'text-slate-400'
            }`}
          >
            Pre-Submission
          </button>
          <button
            onClick={() => onSelectSection('complaints')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
              currentSection === 'complaints' ? 'bg-amber-900/60 text-amber-200' : 'text-slate-400'
            }`}
          >
            Скарги АМКУ
          </button>
          <button
            onClick={() => onSelectSection('bid-packages')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
              currentSection === 'bid-packages' ? 'bg-indigo-900/60 text-indigo-200' : 'text-slate-400'
            }`}
          >
            Пакети
          </button>
          <button
            onClick={() => onSelectSection('multiagent-chat')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
              currentSection === 'multiagent-chat' ? 'bg-blue-900/60 text-blue-200' : 'text-slate-400'
            }`}
          >
            Мультиагенти
          </button>
          <button
            onClick={() => onSelectSection('catalog')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
              currentSection === 'catalog' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Реєстр
          </button>
        </div>
      </div>
    </header>
  );
};
