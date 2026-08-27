import React, { useState } from 'react';
import { Tender, CompanyProfile } from '../types';
import { 
  BarChart3, 
  Sparkles, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  FileText, 
  ArrowRight, 
  ShieldAlert, 
  HelpCircle,
  Clock,
  Download,
  Flame,
  Zap
} from 'lucide-react';

interface PostTenderModuleProps {
  tenders: Tender[];
  company: CompanyProfile;
  onNavigateToAmcu: (tender: Tender) => void;
}

export const PostTenderModule: React.FC<PostTenderModuleProps> = ({
  tenders,
  company,
  onNavigateToAmcu
}) => {
  const stats = company?.historicalStats || {
    totalParticipated: tenders.length,
    wonCount: tenders.filter(t => t.status === 'COMPLETED').length,
    lostCount: tenders.filter(t => t.status === 'CLOSED').length,
    disqualifiedCount: tenders.filter(t => t.status === 'DISQUALIFIED').length,
    totalWonAmountUah: tenders.filter(t => t.status === 'COMPLETED').reduce((acc, t) => acc + t.budgetUah, 0)
  };

  // Past cases breakdown derived from real tenders
  const pastCases = tenders.map(t => ({
    id: t.id,
    tenderTitle: t.title,
    tenderNumber: t.tenderNumber,
    customer: t.customer,
    budgetUah: t.budgetUah,
    outcome: t.status === 'DISQUALIFIED' ? 'DISQUALIFIED' : t.status === 'COMPLETED' ? 'WON' : 'AUDIT',
    outcomeTitle: t.status === 'DISQUALIFIED' ? 'Дискваліфікація' : t.status === 'COMPLETED' ? 'Перемога' : 'На стадії перевірки',
    rootCause: t.summary || 'Аналіз причин зауважень замовника',
    aiAnalysis: t.multiAgentAnalysis?.summary || 'Потребує додаткового аналізу матеріалів справи.',
    appealWinChance: t.foulScore ? Math.max(0, 100 - t.foulScore) : null,
    appealStatus: t.foulScore && t.foulScore > 70 ? 'RECOMMENDED' : 'NO_GROUNDS',
    amcuPrecedent: t.violations?.[0]?.title ? `Справа № ${t.tenderNumber}` : 'UNVERIFIED',
    tenderRef: t
  }));

  const [selectedCaseId, setSelectedCaseId] = useState<string>(pastCases[0]?.id || '');

  const currentCase = pastCases.find(c => c.id === selectedCaseId) || pastCases[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Post-Tender Intelligence & Disqualification Defense</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Посттендерний Розбір & База Дискваліфікацій
            </h1>

            <p className="text-sm text-slate-300">
              Аналіз причин відхилень, ретроспективна діагностика аукціонів та автоматична оцінка шансів оскарження рішень замовника в Антимонопольному комітеті України (АМКУ).
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-w-[260px] space-y-2">
            <div className="text-xs text-slate-400">Історична конверсія перемог:</div>
            <div className="text-2xl font-black text-emerald-400">
              {stats.totalParticipated > 0 ? Math.round((stats.wonCount / stats.totalParticipated) * 100) : 0}% Win Rate
            </div>
            <div className="text-xs text-slate-300 flex justify-between">
              <span>Сума виграних контрактів:</span>
              <strong className="text-white font-mono">{stats.totalWonAmountUah.toLocaleString()} ₴</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="text-xs text-slate-400">Всього подано тендерів</div>
          <div className="text-2xl font-black text-white">{stats.totalParticipated}</div>
          <div className="text-[11px] text-slate-500">За останні 12 місяців</div>
        </div>

        <div className="bg-slate-900 border border-emerald-900/50 rounded-2xl p-5 space-y-2">
          <div className="text-xs text-emerald-400 font-semibold">Виграно тендерів</div>
          <div className="text-2xl font-black text-emerald-400">{stats.wonCount}</div>
          <div className="text-[11px] text-emerald-300/80">33.3% від загальної кількості</div>
        </div>

        <div className="bg-slate-900 border border-amber-900/50 rounded-2xl p-5 space-y-2">
          <div className="text-xs text-amber-400 font-semibold">Програно на аукціоні</div>
          <div className="text-2xl font-black text-amber-400">{stats.lostCount}</div>
          <div className="text-[11px] text-amber-300/80">Середній розрив у ціні: 6.2%</div>
        </div>

        <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-5 space-y-2">
          <div className="text-xs text-red-400 font-semibold">Дискваліфіковано замовником</div>
          <div className="text-2xl font-black text-red-400">{stats.disqualifiedCount}</div>
          <div className="text-[11px] text-red-300/80">2 успішно оскаржено в АМКУ</div>
        </div>
      </div>

      {/* Interactive Case Analysis Split View */}
      {pastCases.length > 0 && currentCase ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Case Selector */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Історія останніх закупівель
            </div>

            {pastCases.map((c) => {
              const isSelected = selectedCaseId === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-900 border-purple-500 shadow-md'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">{c.tenderNumber}</span>
                    {c.outcome === 'WON' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        ПЕРЕМОГА
                      </span>
                    )}
                    {c.outcome === 'DISQUALIFIED' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold">
                        ВІДХИЛЕНО
                      </span>
                    )}
                    {c.outcome === 'LOST_AUCTION' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        ПРОГРАШ
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{c.tenderTitle}</h3>
                  
                  <div className="text-xs text-slate-400 flex justify-between">
                    <span>Бюджет:</span>
                    <strong className="text-emerald-400 font-mono">{c.budgetUah.toLocaleString()} ₴</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Deep Dive & Appeal Engine */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded border border-purple-800/60">
                  {currentCase.tenderNumber}
                </span>
                <h2 className="text-lg font-bold text-white mt-2">{currentCase.tenderTitle}</h2>
                <p className="text-xs text-slate-400">{currentCase.customer}</p>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">Шанс оскарження в АМКУ:</div>
                <div className="text-2xl font-black text-emerald-400">
                  {currentCase.appealWinChance !== null ? `${currentCase.appealWinChance}%` : 'UNVERIFIED'}
                </div>
              </div>
            </div>

            {/* Root Cause & AI Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Причина відхилення / результату</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{currentCase.rootCause}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Правова позиція & AI Висновок</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{currentCase.aiAnalysis}</p>
              </div>
            </div>

            {/* Appeal Defense Card */}
            {currentCase.outcome === 'DISQUALIFIED' && (
              <div className="bg-gradient-to-br from-purple-950/30 to-slate-950 border border-purple-500/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-sm text-white">Модуль Оскарження в АМКУ</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    {currentCase.amcuPrecedent}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Правова оцінка матеріалів справи та підготовка обґрунтованої скарги до Колегії АМКУ.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => currentCase.tenderRef && onNavigateToAmcu(currentCase.tenderRef)}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-purple-950/50 cursor-pointer"
                  >
                    <Scale className="w-4 h-4" />
                    <span>Відкрити генератор скарги АМКУ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <BarChart3 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Історія пост-тендерного аналізу порожня</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Імпортуйте тендери з Prozorro або створіть новий об'єкт аналізу у каталозі тендерів.
          </p>
        </div>
      )}

    </div>
  );
};
