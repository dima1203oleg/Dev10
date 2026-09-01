import React from 'react';
import { 
  Home, Target, Search, Briefcase, Scale, Calculator, 
  Users, Share2, AlertTriangle, FileText, BarChart3, Bell,
  Settings, User, Building2, FileSpreadsheet, Calendar
} from 'lucide-react';
import { AppSection } from '../types';

interface SidebarProps {
  currentSection: AppSection;
  onSelectSection: (section: AppSection) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentSection, onSelectSection }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Головна' },
    { id: 'radar', icon: Target, label: 'Тендерний Радар' },
    { id: 'catalog', icon: Search, label: 'Пошук закупівель' },
    { id: 'war-room', icon: Briefcase, label: 'Командний Центр' },
    { id: 'matrix', icon: Scale, label: 'Юридичний аудит' },
    { id: 'construction', icon: Calculator, label: 'Кошторис та БОК' },
    { id: 'cost-analysis', icon: FileSpreadsheet, label: 'Аналіз кошторису (АВК/XLS)' },
    { id: 'gantt-chart', icon: Calendar, label: 'Діаграма Ганта' },
    { id: 'competitors', icon: Users, label: 'Конкуренти' },
    { id: 'foultender', icon: AlertTriangle, label: 'Ризики' },
    { id: 'complaints', icon: FileText, label: 'Документи та Скарги' },
    { id: 'analytics', icon: BarChart3, label: 'Аналітика' },
    { id: 'multiagent-chat', icon: Bell, label: 'Сповіщення' },
  ];

  return (
    <aside className="w-[80px] bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6 fixed h-full z-50">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 mb-4" />
      
      <nav className="flex flex-col gap-4 w-full px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectSection(item.id as AppSection)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              currentSection === item.id ? 'text-emerald-400 bg-slate-800' : 'text-slate-500 hover:text-slate-200'
            }`}
            title={item.label}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4 text-slate-500">
        <button type="button" title="Налаштування та аудит" aria-label="Налаштування та аудит" onClick={() => onSelectSection('audit')} className="p-2 hover:text-slate-200"><Settings /></button>
        <button type="button" title="Профіль користувача" aria-label="Профіль користувача" onClick={() => onSelectSection('profile')} className="p-2 hover:text-slate-200"><User /></button>
        <button type="button" title="Профіль компанії" aria-label="Профіль компанії" onClick={() => onSelectSection('profile')} className="p-2 hover:text-slate-200"><Building2 /></button>
      </div>
    </aside>
  );
};
