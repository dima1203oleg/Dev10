import React, { useState } from 'react';
import { Tender, Violation, AppSection } from '../types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  TrendingUp, 
  Building2, 
  Gavel,
  RefreshCw,
  Search,
  ExternalLink,
  Info,
  DollarSign
} from 'lucide-react';

interface FoulTenderModuleProps {
  currentTender: Tender;
  allTenders: Tender[];
  onSelectTender: (tender: Tender) => void;
  onNavigate: (section: AppSection) => void;
  onPrepareComplaintForTender: (tender: Tender) => void;
}

export const FoulTenderModule: React.FC<FoulTenderModuleProps> = ({
  currentTender,
  allTenders,
  onSelectTender,
  onNavigate,
  onPrepareComplaintForTender,
}) => {
  const [tenderText, setTenderText] = useState(currentTender.tenderText || '');
  const [customTitle, setCustomTitle] = useState(currentTender.title);
  const [customBudget, setCustomBudget] = useState(currentTender.budgetUah.toString());
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    foulScore: number;
    riskLevel: string;
    summary: string;
    violations: Violation[];
    amcuAppealRecommendation?: any;
  } | null>(null);

  // Trigger Live AI Audit
  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/foultender/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderTitle: customTitle,
          tenderId: currentTender.tenderNumber,
          customer: currentTender.customer,
          budget: customBudget,
          tenderText: tenderText,
          category: currentTender.category,
        }),
      });
      const data = await res.json();
      setAuditResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const activeFoulScore = auditResult ? auditResult.foulScore : currentTender.foulScore;
  const activeSummary = auditResult ? auditResult.summary : currentTender.summary;
  const activeViolations = auditResult ? auditResult.violations : currentTender.violations;
  const activeAmcu = auditResult ? auditResult.amcuAppealRecommendation : currentTender.amcuAppealRecommendation;

  const isHighRisk = activeFoulScore >= 60;
  const isClean = activeFoulScore < 35;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Module Header */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 border border-red-900/50 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-red-400 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>FoulTender MVP • Антикорупційний ШІ-аудит Prozorro</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Автоматичний аналіз дискримінаційних вимог та порушень
          </h1>
          <p className="text-sm text-slate-300">
            Миттєва ідентифікація корупційних пасток, завужених критеріїв під фаворита та підготовка скарг до АМКУ
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center space-x-2">
          <select
            aria-label="Виберіть тендер для аудиту"
            value={currentTender.id}
            onChange={(e) => {
              const found = allTenders.find(t => t.id === e.target.value);
              if (found) {
                onSelectTender(found);
                setCustomTitle(found.title);
                setCustomBudget(found.budgetUah.toString());
                setTenderText(found.tenderText || '');
                setAuditResult(null);
              }
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-medium"
          >
            {allTenders.map(t => (
              <option key={t.id} value={t.id}>
                {t.tenderNumber}: {t.title.slice(0, 45)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left Scanner & Right Risk Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Tender Document Input & Scanner */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-white flex items-center space-x-2">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Параметри тендерної документації</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">{currentTender.tenderNumber}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Назва закупівлі
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Замовник (ЄДРПОУ)
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentTender.customerEdrpou} • ${currentTender.customerCity}`}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Бюджет (грн)
                </label>
                <input
                  type="number"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Текст кваліфікаційних вимог / Технічного завдання
                </label>
                <span className="text-[10px] text-slate-400">Підтримує вставку будь-якої ТД</span>
              </div>
              <textarea
                rows={7}
                value={tenderText}
                onChange={(e) => setTenderText(e.target.value)}
                placeholder="Вставте вимоги тендерної документації, специфікації або умови договору..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-red-500 leading-relaxed font-sans"
              />
            </div>

            <button
              id="foultender-run-audit-btn"
              disabled={isAuditing}
              onClick={handleRunAudit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAuditing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ШІ-Аудитор FoulTender аналізує норми ЗУ та АМКУ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Запустити повний аудит FoulTender</span>
                </>
              )}
            </button>
          </div>

          {/* Quick transfer to Construction BoQ */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Перейти до інженерного розрахунку</div>
              <div className="text-[11px] text-slate-400">Розрахунок собівартості BoQ та підготовка ціни</div>
            </div>
            <button
              onClick={() => onNavigate('construction')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>TenderAI BoQ</span>
            </button>
          </div>
        </div>

        {/* Right Col: Foul Risk Gauge, Violations & AMCU Strategy */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Risk Score Summary Banner */}
          <div className={`border rounded-2xl p-5 shadow-lg ${
            isHighRisk
              ? 'bg-red-950/40 border-red-800/80'
              : isClean
              ? 'bg-emerald-950/40 border-emerald-800/80'
              : 'bg-amber-950/40 border-amber-800/80'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Radial Meter representation */}
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black shadow-inner ${
                  isHighRisk 
                    ? 'bg-red-600 text-white' 
                    : isClean 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-amber-600 text-white'
                }`}>
                  <span className="text-xl leading-none">{activeFoulScore}</span>
                  <span className="text-[9px] uppercase font-bold opacity-80">/ 100</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Індекс Foul Score</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                      isHighRisk 
                        ? 'bg-red-500/30 text-red-300' 
                        : isClean 
                        ? 'bg-emerald-500/30 text-emerald-300' 
                        : 'bg-amber-500/30 text-amber-300'
                    }`}>
                      {isHighRisk ? 'Критичний ризик' : isClean ? 'Чистий тендер' : 'Помірний ризик'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {isHighRisk ? 'Виявлено ознаки дискримінації або змови' : isClean ? 'Дискримінаційних обмежень не виявлено' : 'Є спірні кваліфікаційні вимоги'}
                  </h3>
                </div>
              </div>

              {/* AMCU Win chance */}
              {activeAmcu && activeAmcu.recommended && (
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-right">
                  <div className="text-[11px] text-slate-400">Перспектива оскарження в АМКУ</div>
                  <div className="text-sm font-bold text-emerald-400">
                    {activeAmcu.prospectsText || 'Високий юридичний потенціал (Потребує підтвердження доказів)'}
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-200 mt-4 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              {activeSummary}
            </p>
          </div>

          {/* List of Detected Violations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Виявлені порушення та дискримінаційні пастки ({activeViolations.length})</span>
              </h3>
            </div>

            {activeViolations.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs">У тендерній документації порушень не виявлено.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeViolations.map((v, i) => (
                  <div
                    key={v.id || i}
                    className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-2 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          v.severity === 'CRITICAL' || v.severity === 'HIGH'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {v.severity}
                        </span>
                        <h4 className="text-sm font-bold text-white">{v.title}</h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {v.description}
                    </p>

                    {v.exactQuote && (
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/30 font-mono text-[11px] text-emerald-400 italic">
                        <div className="text-[9px] uppercase font-black text-slate-500 mb-1">Цитата з ТД:</div>
                        "{v.exactQuote}"
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-x-4 gap-y-1">
                      <div className="text-slate-300 font-medium">
                        ⚖️ <strong className="text-slate-200">Правова норма:</strong> {v.legalBasis}
                      </div>
                      {v.pageReference && (
                        <div className="text-slate-400">
                          📄 <strong className="text-slate-300">Джерело:</strong> {v.pageReference}
                        </div>
                      )}
                      {v.confidence !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Conf: {Math.round(v.confidence * 100)}%</span>
                        </div>
                      )}
                    </div>

                    {v.amcuPrecedent && (
                      <div className="bg-slate-900/90 rounded-lg p-2.5 text-[11px] text-amber-200/90 border border-amber-900/30 mt-1">
                        🏛️ <strong>Практика АМКУ:</strong> {v.amcuPrecedent}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AMCU Action Card */}
          {activeAmcu && activeAmcu.recommended && (
            <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-amber-800/60 rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                  <Gavel className="w-4 h-4" />
                  <span>Рекомендовано подання скарги до АМКУ</span>
                </div>
                <p className="text-xs text-slate-300">
                  {activeAmcu.appealGrounds}
                </p>
                <div className="text-[11px] text-slate-400">
                  Орієнтовна плата за подання: <strong className="text-slate-200 font-mono">{(activeAmcu.estimatedAmcuFeeUah || 85000).toLocaleString()} ₴</strong>
                </div>
              </div>

              <button
                id="foultender-create-complaint-btn"
                onClick={() => {
                  onPrepareComplaintForTender(currentTender);
                  onNavigate('complaints');
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-amber-900/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                <span>Сформувати скаргу до АМКУ</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
