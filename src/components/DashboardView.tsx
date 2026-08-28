import React from 'react';
import { Tender, AppSection } from '../types';
import { Search, Briefcase, Sparkles, Target, AlertTriangle, ArrowRight, Building2, CheckSquare, ShieldAlert, Bot, Scale, Users2, FileCheck2 } from 'lucide-react';

interface DashboardViewProps {
  tenders: Tender[];
  onSelectTender: (tender: Tender) => void;
  onNavigate: (section: AppSection) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tenders,
  onSelectTender,
  onNavigate,
}) => {
  const highFit = tenders.filter(t => (t.opportunityScore?.overallScore ?? 0) >= 70).length;
  const mediumFit = tenders.filter(t => {
    const score = t.opportunityScore?.overallScore ?? 0;
    return score >= 40 && score < 70;
  }).length;
  const lowFit = tenders.filter(t => (t.opportunityScore?.overallScore ?? 0) < 40).length;

  const highRiskTenders = tenders.filter(t => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL');

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* 1. RESPONSIVE KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Всього знайдено</div>
          <div className="text-2xl sm:text-3xl font-bold text-white">{tenders.length}</div>
        </div>
        <div className="bg-slate-900 border border-emerald-500/20 p-4 rounded-2xl">
          <div className="text-xs text-emerald-500 font-bold uppercase tracking-widest mb-1">Високий Match</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{highFit}</div>
        </div>
        <div className="bg-slate-900 border border-amber-500/20 p-4 rounded-2xl">
          <div className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">Середній Match</div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400">{mediumFit}</div>
        </div>
        <div className="bg-slate-900 border border-red-500/20 p-4 rounded-2xl">
          <div className="text-xs text-red-500 font-bold uppercase tracking-widest mb-1">Критичні ризики</div>
          <div className="text-2xl sm:text-3xl font-bold text-red-400">{highRiskTenders.length}</div>
        </div>
      </div>

      {/* 2. MAIN ADAPTIVE COMPOSITION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* RADAR OVERVIEW (Main Area) */}
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div className="flex items-center gap-3">
                        <Target className="w-6 h-6 text-emerald-400" />
                        <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">Тендерний Радар</h2>
                    </div>
                    <button onClick={() => onNavigate('radar')} className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
                      ВСІ OPPORTUNITIES <ArrowRight size={14} />
                    </button>
                </div>

                <div className="space-y-4">
                  {tenders.slice(0, 5).map(tender => (
                    <div 
                      key={tender.id} 
                      onClick={() => onSelectTender(tender)}
                      className="group bg-slate-950 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{tender.title}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Building2 size={12} /> {tender.customer}</span>
                          <span className="flex items-center gap-1 font-mono text-slate-400">{tender.budgetUah?.toLocaleString()} ₴</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center">
                         <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                           (tender.opportunityScore?.overallScore ?? 0) >= 70 ? 'bg-emerald-500/10 text-emerald-400' :
                           (tender.opportunityScore?.overallScore ?? 0) >= 40 ? 'bg-amber-500/10 text-amber-400' :
                           'bg-slate-800 text-slate-500'
                         }`}>
                           {tender.opportunityScore?.overallScore || '—'}% Match
                         </div>
                         <ArrowRight size={16} className="text-slate-700 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
            </div>
        </div>

        {/* ACTION CENTER (Context Area) */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                    <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">Action Center</h2>
                </div>
                
                <div className="space-y-4">
                    {highRiskTenders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-600">
                            <ShieldAlert size={48} className="mb-4 opacity-20" />
                            <p className="text-sm">Критичних ризиків не виявлено</p>
                        </div>
                    ) : (
                        highRiskTenders.slice(0, 3).map(tender => (
                            <div key={tender.id} className="group bg-red-950/10 border border-red-900/30 p-4 rounded-2xl hover:bg-red-950/20 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-tighter">
                                        <AlertTriangle size={12} /> Critical Risk
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-3 line-clamp-2">{tender.title}</h4>
                                <button 
                                  onClick={() => onSelectTender(tender)}
                                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-lg shadow-red-900/20"
                                >
                                    АНАЛІЗ РИЗИКІВ
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 gap-3">
               <button onClick={() => onNavigate('catalog')} className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500/40 transition-all">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                    <Search size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Пошук</span>
               </button>
               <button onClick={() => onNavigate('vault')} className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/40 transition-all">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                    <Briefcase size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vault</span>
               </button>
            </div>
        </div>
      </div>
    </div>
  );
};
