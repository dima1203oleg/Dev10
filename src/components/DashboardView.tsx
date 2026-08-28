import React from 'react';
import { Tender, AppSection } from '../types';
import { Search, Briefcase, Sparkles, Target, AlertTriangle, ArrowRight, Building2, CheckSquare, ShieldAlert, Bot, Scale, Users2, FileCheck2 } from 'lucide-react';
import { ProductionGateUI } from './ProductionGateUI';

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
  // Business Status Metrics (Static placeholders matching the final spec, in a real app these would be calculated from filtered tenders)
  const stats = [
    { label: 'Нові тендери', count: 37, color: 'text-white', bgColor: 'bg-slate-900', icon: Search },
    { label: 'Висока відповідність', count: 8, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', icon: Target },
    { label: 'Варто розглянути', count: 12, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', icon: Sparkles },
    { label: 'Критичні дедлайни', count: 3, color: 'text-red-400', bgColor: 'bg-red-500/10', icon: AlertTriangle },
    { label: 'В роботі', count: 7, color: 'text-amber-400', bgColor: 'bg-amber-500/10', icon: Briefcase },
    { label: 'Готові до подачі', count: 4, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20 border-emerald-500/30', icon: FileCheck2 },
    { label: 'Проблемні', count: 5, color: 'text-red-500', bgColor: 'bg-red-950/20 border-red-900/30', icon: ShieldAlert },
  ];

  const highFitTenders = tenders.filter(t => (t.opportunityScore?.overallScore ?? 0) >= 70).slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      <ProductionGateUI />
      
      {/* BUSINESS STATUS KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bgColor} border border-slate-800 p-4 rounded-2xl flex flex-col justify-between h-32 transition-all hover:scale-[1.02] cursor-default`}>
            <div className="flex justify-between items-start">
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-60`} />
            </div>
            <div>
              <div className="text-[28px] font-bold text-white leading-none mb-1">{stat.count}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight line-clamp-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl shadow-black/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/40"></div>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shadow-inner">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white tracking-tight">AI TENDER RADAR</h2>
                          <p className="text-xs text-slate-500">Автоматично відібрані тендери з найвищим Match Score</p>
                        </div>
                    </div>
                    <button onClick={() => onNavigate('radar')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-all flex items-center gap-2 border border-slate-700 uppercase tracking-widest">
                      Відкрити Радар <ArrowRight size={12} />
                    </button>
                </div>

                <div className="space-y-3">
                  {highFitTenders.length > 0 ? highFitTenders.map(tender => (
                    <div 
                      key={tender.id} 
                      onClick={() => onSelectTender(tender)}
                      className="group bg-slate-950/50 border border-slate-800/60 hover:border-emerald-500/40 p-5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-6"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">{tender.tenderNumber}</span>
                          <span className="text-[10px] text-slate-500 font-medium">Закінчується через {Math.floor(Math.random() * 10) + 1} дн.</span>
                        </div>
                        <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate text-sm">{tender.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Building2 size={12} /> <span className="truncate max-w-[200px]">{tender.customer}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
                            {tender.budgetUah?.toLocaleString()} ₴
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                         <div className="text-right">
                           <div className="text-2xl font-black text-emerald-400">{tender.opportunityScore?.overallScore || '—'}%</div>
                           <div className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">Match Score</div>
                         </div>
                         <div className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-slate-950 text-slate-600 transition-all shadow-inner">
                           <ArrowRight size={18} />
                         </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mx-auto text-slate-800 border border-slate-800 shadow-inner">
                        <Search size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 font-bold">Немає відповідних тендерів</p>
                        <p className="text-xs text-slate-600">Налаштуйте профіль компанії у Vault для активації Радару.</p>
                      </div>
                    </div>
                  )}
                </div>
            </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/40"></div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight uppercase">AI Assistant</h2>
                      <p className="text-xs text-slate-500">Персональні рекомендації</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl relative">
                        <div className="flex gap-4">
                          <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Bot size={16} />
                          </div>
                          <div className="space-y-3">
                            <p className="text-xs text-slate-300 leading-relaxed">
                              Я знайшов новий тендер на капітальний ремонт лікарні у вашому регіоні. Відповідність профілю <span className="text-emerald-400 font-bold">94%</span>.
                            </p>
                            <button onClick={() => onNavigate('radar')} className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 hover:underline uppercase tracking-widest">
                              Переглянути тендер <ArrowRight size={10} />
                            </button>
                          </div>
                        </div>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl relative">
                        <div className="flex gap-4">
                          <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                            <AlertTriangle size={16} />
                          </div>
                          <div className="space-y-3">
                            <p className="text-xs text-slate-300 leading-relaxed">
                              У тендері <span className="font-bold">UA-2024...</span> залишилося лише 3 дні до кінця прийому пропозицій. Пакет документів готовий на <span className="text-amber-400 font-bold">92%</span>.
                            </p>
                            <button onClick={() => onNavigate('audit')} className="text-[10px] font-bold text-amber-400 flex items-center gap-1 hover:underline uppercase tracking-widest">
                              Завершити підготовку <ArrowRight size={10} />
                            </button>
                          </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => onNavigate('catalog')} className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-emerald-500/40 transition-all group shadow-xl">
                  <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
                    <Search size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase tracking-[0.2em] transition-colors">Каталог TD</span>
               </button>
               <button onClick={() => onNavigate('vault')} className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-indigo-500/40 transition-all group shadow-xl">
                  <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                    <Briefcase size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase tracking-[0.2em] transition-colors">Company Vault</span>
               </button>
            </div>
        </div>
      </div>
    </div>
  );
};
