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
  const highRiskTenders = tenders.filter(t => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL');

  return (
    <div className="space-y-6">
      
      {/* 1. AI Radar & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI RADAR */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">AI RADAR</h2>
            </div>
            
            <p className="text-sm text-slate-400 mb-6">Виявлено {tenders.length} тендерів, які відповідають вашому профілю</p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-2xl font-bold text-white mb-1">12</div>
                    <div className="text-xs text-emerald-400 uppercase tracking-widest">Висока відповідність</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-2xl font-bold text-white mb-1">23</div>
                    <div className="text-xs text-amber-400 uppercase tracking-widest">Потребують перевірки</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-2xl font-bold text-white mb-1">12</div>
                    <div className="text-xs text-slate-400 uppercase tracking-widest">Низька відповідність</div>
                </div>
            </div>
            
            <button
                onClick={() => onNavigate('radar')}
                className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-all"
            >
                <span>ПЕРЕГЛЯНУТИ {tenders.length} ТЕНДЕРІВ</span>
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>

        {/* Action Center */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">ACTION CENTER</h2>
            </div>
            
            <div className="space-y-4">
                <div className="border border-red-900/50 bg-red-950/10 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-red-400 uppercase">🔴 Терміново</span>
                        <span className="text-xs text-slate-500">2 дні 14 год</span>
                    </div>
                    <h4 className="font-bold text-white mb-1">Капітальний ремонт лікарні №7</h4>
                    <div className="text-sm text-slate-300 mb-2">Бюджет: 18 420 000 ₴</div>
                    <button className="text-xs bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded-lg w-full">ПЕРЕВІРИТИ ТЕНДЕР</button>
                </div>
                <div className="border border-slate-700 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-400 uppercase">🟡 Підготувати</span>
                        <span className="text-xs text-slate-500">6 днів</span>
                    </div>
                    <h4 className="font-bold text-white mb-1">Реконструкція школи</h4>
                    <div className="text-sm text-slate-300 mb-2">Бюджет: 12,8 млн ₴</div>
                    <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-bold py-1 px-3 rounded-lg w-full">ВИПРАВИТИ</button>
                </div>
            </div>
        </div>
      </div>

      {/* List of Tenders (Watchlist) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Активні тендери</h2>
        <div className="space-y-3">
          {tenders.map((tender) => (
            <div key={tender.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">{tender.title}</h3>
                <p className="text-xs text-slate-400">{tender.customer} • {tender.budgetUah?.toLocaleString()} ₴</p>
              </div>
              <button 
                onClick={() => onSelectTender(tender)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                ДЕТАЛЬНО
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
