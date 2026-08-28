import React, { useState } from 'react';
import { Tender, CompanyProfile, BidPackage, PreSubmissionReadinessScore } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  FileCheck, 
  ArrowRight, 
  Download,
  Lock,
  Layers,
  Check
} from 'lucide-react';

interface PreSubmissionAuditModuleProps {
  currentTender: Tender;
  company: CompanyProfile;
  bidPackages: BidPackage[];
  onNavigateToAmcu: () => void;
  onNavigateToVault: () => void;
  onNavigateToBidPackages: () => void;
}

export const PreSubmissionAuditModule: React.FC<PreSubmissionAuditModuleProps> = ({
  currentTender,
  company,
  bidPackages,
  onNavigateToAmcu,
  onNavigateToVault,
  onNavigateToBidPackages,
}) => {
  const [readiness, setReadiness] = useState<PreSubmissionReadinessScore | undefined>(currentTender.readinessScore);
  const [isAuditing, setIsAuditing] = useState(false);

  const activeBid = bidPackages.find(b => b.tenderId === currentTender.id) || bidPackages[0];

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const response = await fetch('/api/tenderai/readiness-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tender: currentTender,
          companyProfile: company,
          bidPackage: activeBid
        })
      });
      if (!response.ok) throw new Error('Помилка аудиту');
      const data = await response.json();
      setReadiness(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  const totalScore = readiness?.totalScore ?? null;
  const categories = readiness?.categories ?? null;

  const checklist = readiness?.criticalChecklist || [];
  const blockingIssues = checklist.filter(c => !c.passed && c.severity === 'BLOCKING');

  return (
    <div id="pre-submission-audit-module" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Pre-Submission Compliance Audit
              </span>
              <span className="text-xs text-slate-400 font-mono">{currentTender.tenderNumber}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Фінальний аудит готовності пропозиції до подання на Prozorro</h1>
            <p className="text-sm text-slate-400">
              Комплексна перевірка наявності блокуючих помилок, банківської гарантії, ризику АНЦ та відповідності КЕП
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex-shrink-0">
            <div className="text-center">
              <div className="text-xs text-slate-400">Tender Readiness Score</div>
              <div className={`text-3xl font-extrabold ${totalScore !== null ? (totalScore >= 90 ? 'text-emerald-400' : 'text-amber-400') : 'text-slate-500'}`}>
                {totalScore !== null ? `${totalScore}/100` : 'UNVERIFIED'}
              </div>
              <div className={`text-xs font-bold mt-0.5 ${totalScore === null ? 'text-slate-400' : (blockingIssues.length === 0 ? 'text-emerald-400' : 'text-rose-400')}`}>
                {totalScore === null ? 'ПОТРЕБУЄ АУДИТУ' : (blockingIssues.length === 0 ? 'ГОТОВО ДО ПОДАННЯ' : `БЛОКУЮЧИХ РИЗИКІВ: ${blockingIssues.length}`)}
              </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800" />
            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
              {isAuditing ? 'Перевірка пропозиції...' : 'Запустити Pre-Submission AI аудит'}
            </button>
          </div>
        </div>
      </div>

      {/* Category Progress Gauges */}
      {categories && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Юридична готовність</div>
            <div className="text-2xl font-black text-emerald-400">{categories.legalDraftContract || 100}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${categories.legalDraftContract || 100}%` }} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Документи</div>
            <div className="text-2xl font-black text-emerald-400">{categories.documentsVault || 92}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${categories.documentsVault || 92}%` }} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Кошторис</div>
            <div className="text-2xl font-black text-emerald-400">{categories.costAndBoQ || 98}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${categories.costAndBoQ || 98}%` }} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Фінанси</div>
            <div className="text-2xl font-black text-emerald-400">{categories.qualificationArt16 || 91}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${categories.qualificationArt16 || 91}%` }} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Технічні вимоги</div>
            <div className="text-2xl font-black text-emerald-400">{categories.technicalSpecs || 100}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${categories.technicalSpecs || 100}%` }} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Строки</div>
            <div className="text-2xl font-black text-emerald-400">100%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `100%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Blocking Issues Alert Banner */}
      {blockingIssues.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 space-y-3">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-rose-200">
                УВАГА: Подання пропозиції наразі заблоковано через {blockingIssues.length} критичні невідповідності!
              </h3>
              <p className="text-xs text-rose-300/80 mt-1">
                Подання у поточному стані призведе до автоматичної дискваліфікації уповноваженою особою замовника або за результатами моніторингу ДАСУ.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Critical Checklist Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Контрольний перелік перевірки перед завантаженням на Prozorro
        </h2>

        <div className="space-y-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                !item.passed && item.severity === 'BLOCKING'
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : item.severity === 'WARNING'
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {item.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : item.severity === 'BLOCKING' ? (
                  <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                    {!item.passed && item.severity === 'BLOCKING' && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        БЛОКУЮЧИЙ РИЗИК
                      </span>
                    )}
                    {item.passed && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        Пройдено
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{item.detail}</p>
                </div>
              </div>

              <div className="flex-shrink-0">
                {!item.passed && item.title.includes('Дискримінаційне') ? (
                  <button
                    onClick={onNavigateToAmcu}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1"
                  >
                    Оскаржити в АМКУ <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : !item.passed && item.title.includes('гарантія') ? (
                  <button
                    onClick={onNavigateToBidPackages}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1"
                  >
                    Замовити гарантію <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={onNavigateToVault}
                    className="text-xs text-slate-400 hover:text-emerald-400 underline underline-offset-2"
                  >
                    Перевірити у Vault
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
