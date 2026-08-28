import React, { useState, useEffect, useRef } from 'react';
import { Search, Radar, Briefcase, FileText, ShieldAlert, Calculator, Package, Users, TrendingUp, X, ArrowRight, CornerDownLeft, Sparkles, Building2, AlertTriangle } from 'lucide-react';
import { Tender, AppSection } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenders: Tender[];
  onSelectTender: (tender: Tender) => void;
  onNavigate: (section: AppSection) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  tenders,
  onSelectTender,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global keydown handler for Escape & Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via parent if needed
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Navigation shortcuts
  const navShortcuts = [
    { id: 'dashboard', label: 'Головна панель (Dashboard)', icon: Sparkles, category: 'Навігація' },
    { id: 'catalog', label: 'Каталог ТД (Пошук закупівель)', icon: Search, category: 'Навігація' },
    { id: 'radar', label: 'Тендерний Радар ШІ (Company Fit)', icon: Radar, category: 'Навігація' },
    { id: 'war-room', label: 'Командний Центр', icon: Briefcase, category: 'Навігація' },
    { id: 'vault', label: 'Сховище документів (Company Моя компанія)', icon: FileText, category: 'Навігація' },
    { id: 'foultender', label: 'Аудит ризиків та корупції (FoulTender)', icon: ShieldAlert, category: 'Навігація' },
    { id: 'construction', label: 'Кошторис та BoQ (ШІ-Аналіз)', icon: Calculator, category: 'Навігація' },
    { id: 'audit', label: 'Передподачний аудит (Pre-Submission)', icon: Package, category: 'Навігація' },
    { id: 'team', label: 'Командний простір (Team Workspace)', icon: Users, category: 'Навігація' },
    { id: 'analytics', label: 'Аналітика та звіти', icon: TrendingUp, category: 'Навігація' }
  ].filter(item => !q || item.label.toLowerCase().includes(q));

  // Tenders matching query
  const matchedTenders = tenders.filter(t => {
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.tenderNumber.toLowerCase().includes(q) ||
      (t.customer && t.customer.toLowerCase().includes(q)) ||
      (t.detailedData?.cpv && t.detailedData.cpv.toLowerCase().includes(q))
    );
  }).slice(0, 6);

  const totalItems = navShortcuts.length + matchedTenders.length;

  const handleSelect = (index: number) => {
    if (index < navShortcuts.length) {
      const item = navShortcuts[index];
      onNavigate(item.id as AppSection);
      onClose();
    } else {
      const tender = matchedTenders[index - navShortcuts.length];
      if (tender) {
        onSelectTender(tender);
        onNavigate('war-room');
        onClose();
      }
    }
  };

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (totalItems || 1)) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-10 flex flex-col max-h-[80vh] animate-scaleIn">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-emerald-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            placeholder="Пошук тендерів, CPV, ЄДРПОУ, модулів або дій..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-500 hover:text-white mr-2"
            >
              <X size={16} />
            </button>
          )}
          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">ESC</span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
          {/* Matched Tenders */}
          {matchedTenders.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center justify-between">
                <span>Знайдені закупівлі Prozorro</span>
                <span className="text-slate-500 font-mono text-[9px]">{matchedTenders.length} результатів</span>
              </div>
              <div className="space-y-1">
                {matchedTenders.map((tender, i) => {
                  const itemIndex = navShortcuts.length + i;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <div
                      key={tender.id}
                      onClick={() => handleSelect(itemIndex)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected ? 'bg-emerald-600/20 border border-emerald-500/40 text-white' : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {tender.tenderNumber}
                          </span>
                          {tender.opportunityScore && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              Match {tender.opportunityScore.overallScore}%
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs truncate text-white">{tender.title}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-3 mt-0.5">
                          <span className="truncate max-w-[240px]">{tender.customer}</span>
                          {tender.budgetUah && (
                            <span className="font-mono text-slate-300">{tender.budgetUah.toLocaleString()} ₴</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold text-emerald-400 bg-slate-800 px-2 py-1 rounded border border-slate-700 flex items-center gap-1">
                          Командний Центр <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Items */}
          {navShortcuts.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Швидка навігація
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {navShortcuts.map((item, i) => {
                  const isSelected = selectedIndex === i;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(i)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected ? 'bg-indigo-600/30 border border-indigo-500/40 text-white' : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon size={16} />
                      </div>
                      <div className="text-xs font-bold truncate">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {totalItems === 0 && (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
              <p className="text-sm font-semibold">Нічого не знайдено за запитом &quot;{query}&quot;</p>
              <p className="text-xs text-slate-600">Спробуйте пошук за номером закупівлі UA-..., назвою або кодом CPV</p>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">↑</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">↓</span>
              Навігація
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">↵</span>
              Вибрати
            </span>
          </div>
          <span className="text-emerald-500 font-bold">TenderAI OS • Live Search</span>
        </div>
      </div>
    </div>
  );
};
