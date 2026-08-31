import React, { useState } from 'react';
import { Tender, CompanyProfile, RequirementItem } from '../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  Filter,
  Check,
  Download,
  FileSpreadsheet,
  Scale,
  Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RequirementMatrixModuleProps {
  currentTender: Tender;
  company: CompanyProfile;
  onUpdateTenderRequirements: (tenderId: string, requirements: RequirementItem[]) => void;
  onNavigateToAmcu: () => void;
  onNavigateToVault: () => void;
}

export const RequirementMatrixModule: React.FC<RequirementMatrixModuleProps> = ({
  currentTender,
  company,
  onUpdateTenderRequirements,
  onNavigateToAmcu,
  onNavigateToVault,
}) => {
  const { token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [generatedDocModal, setGeneratedDocModal] = useState<{ title: string; content: string } | null>(null);

  const requirements = currentTender.requirements || [];

  const coveredCount = requirements.filter(r => r.status === 'COVERED').length;
  const warningCount = requirements.filter(r => r.status === 'WARNING').length;
  const gapCount = requirements.filter(r => r.status === 'GAP_MISSING').length;
  const totalCount = requirements.length || 1;
  const complianceRate = Math.round((coveredCount / totalCount) * 100);

  // Trigger AI Matching with Gemini & Company Vault
  const handleRunAiMatching = async () => {
    setIsMatching(true);
    setMatchError(null);
    try {
      const response = await fetch('/api/company/audit-vault-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          companyProfile: company,
          tenderTitle: currentTender.title,
          tenderRequirements: requirements,
          tenderText: currentTender.tenderText
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || errData.error || 'Помилка зіставлення вимог з Vault');
      }
      const data = await response.json();
      if (data.requirements) {
        onUpdateTenderRequirements(currentTender.id, data.requirements);
      }
    } catch (err: any) {
      console.error(err);
      setMatchError(err.message || 'Не вдалося виконати AI зіставлення вимог з Vault');
    } finally {
      setIsMatching(false);
    }
  };

  const handleGenerateDocument = (req: RequirementItem) => {
    let content = '';
    if (req.category === 'QUALIFICATION_ART16') {
      content = `ДОВІДКА
про наявність обладнання, матеріально-технічної бази та технологій

Цим документом ${company.name} (код ЄДРПОУ ${company.edrpou}) підтверджує наявність матеріально-технічної бази та обладнання для виконання робіт за закупівлею "${currentTender.title}" (ідентифікатор ${currentTender.tenderNumber}):

${company.equipment.map((eq, i) => `${i + 1}. ${eq.name} (${eq.model}) — ${eq.ownership === 'OWNED' ? 'Власне' : 'Орендоване'}, ${eq.docNumber}`).join('\n')}

Усе зазначене обладнання знаходиться у справному робочому стані та готове до мобілізації на будівельний майданчик протягом 48 годин.

Генеральний директор: ${company.directorName} __________________ (КЕП)`;
    } else {
      content = `ГАРАНТІЙНИЙ ЛИСТ
щодо виконання вимог технічної специфікації та нормативів

${company.name} (код ЄДРПОУ ${company.edrpou}) гарантує повну відповідність будівельно-монтажних робіт вимогам нормативно-правових актів та державних будівельних норм (ДБН, ДСТУ, Єврокоди) за процедурою ${currentTender.tenderNumber}.

Пункт ТД: ${req.clauseInTenderDoc}
Зобов'язуємось надати всі необхідні сертифікати відповідності та паспорти якості на застосовані будівельні матеріали до підписання проміжних актів КБ-2в.

Генеральний директор: ${company.directorName} __________________ (КЕП)`;
    }

    setGeneratedDocModal({
      title: `Згенеровано документ: ${req.title}`,
      content
    });
  };

  const filteredRequirements = requirements.filter(req => {
    const matchesCategory = selectedCategory === 'ALL' || req.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || req.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  return (
    <div id="requirement-matrix-module" className="space-y-6 sm:space-y-8 pb-12 animate-fadeIn">
      {/* Header & Compliance Scorecard - Responsive Layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AI Requirement Decomposer</span>
              </div>
              <div className="text-[10px] font-mono font-bold bg-slate-950 text-slate-400 px-2 py-1 rounded-lg border border-slate-800">
                {currentTender.tenderNumber}
              </div>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">Матриця вимог ТД</h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              Автоматичне зіставлення вимог Тендерної документації зі Smart Vault компанії <strong className="text-slate-200">{company.shortName}</strong>.
            </p>
          </div>

          {/* Compliance Gauge - Adaptive Design */}
          <div className="flex items-center gap-6 bg-slate-950 border border-slate-800 rounded-3xl p-6 flex-shrink-0 shadow-inner">
            <div className="text-center space-y-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Compliance Rate</div>
              <div className={`text-4xl font-black ${complianceRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {complianceRate}%
              </div>
            </div>
            <div className="h-12 w-[1px] bg-slate-800" />
            <div className="space-y-2 text-[10px] font-black uppercase tracking-tighter">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={14} /> {coveredCount} COVERED
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle size={14} /> {warningCount} WARNING
              </div>
              <div className="flex items-center gap-2 text-rose-400">
                <XCircle size={14} /> {gapCount} GAP
              </div>
            </div>
          </div>
        </div>

        {/* AI Action Trigger Bar - Stacked on Mobile */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative">
               <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
               <select
                 value={selectedCategory}
                 onChange={(e) => setSelectedCategory(e.target.value)}
                 className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:border-emerald-500 cursor-pointer transition-all"
               >
                 <option value="ALL">Всі категорії</option>
                 <option value="QUALIFICATION_ART16">Кваліфікація (ст. 16)</option>
                 <option value="TECHNICAL_SPEC">Технічна специфікація</option>
                 <option value="FINANCIAL_GUARANTEE">Гарантія</option>
                 <option value="ANTI_CORRUPTION_ART17">Стаття 17</option>
               </select>
            </div>

            <div className="relative">
               <select
                 value={selectedStatus}
                 onChange={(e) => setSelectedStatus(e.target.value)}
                 className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:border-emerald-500 cursor-pointer transition-all"
               >
                 <option value="ALL">Всі статуси</option>
                 <option value="COVERED">🟢 COVERED</option>
                 <option value="WARNING">🟡 WARNING</option>
                 <option value="GAP_MISSING">🔴 GAP</option>
               </select>
            </div>
          </div>

          <button
            onClick={handleRunAiMatching}
            disabled={isMatching}
            className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-950/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isMatching ? 'animate-spin' : ''}`} />
            {isMatching ? 'Аудит...' : 'Запустити AI Аудит Vault'}
          </button>
        </div>
      </div>

      {matchError && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between text-rose-300 text-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Помилка зіставлення: </span>
              {matchError}
            </div>
          </div>
          <button 
            onClick={() => setMatchError(null)} 
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-slate-800"
          >
            Закрити
          </button>
        </div>
      )}

      {/* Critical Gap Alert */}
      {gapCount > 0 && (
        <div className="bg-rose-500/5 border-2 border-rose-500/20 rounded-3xl p-6 sm:p-8 space-y-4 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                <ShieldCheck size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">
                  Виявлено {gapCount} критичний розрив (GAP)!
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                  Подання без усунення цих зауважень призведе до 100% відхилення пропозиції замовником.
                </p>
              </div>
            </div>
            <button
              onClick={onNavigateToAmcu}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Скласти скаргу АМКУ
            </button>
          </div>
        </div>
      )}

      {/* Requirements List - Adaptive Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRequirements.map((req) => (
          <div
            key={req.id}
            className={`group border-2 rounded-3xl p-6 sm:p-8 transition-all bg-slate-900 shadow-sm hover:shadow-xl ${
              req.status === 'GAP_MISSING'
                ? 'border-rose-500/20 hover:border-rose-500/40 bg-rose-950/5'
                : req.status === 'WARNING'
                ? 'border-amber-500/20 hover:border-amber-500/40 bg-amber-950/5'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
              <div className="space-y-6 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-mono font-black text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 uppercase tracking-tighter">
                    Пункт {req.clauseInTenderDoc}
                  </span>

                  {req.status === 'COVERED' && (
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 size={14} /> COVERED
                    </span>
                  )}
                  {req.status === 'WARNING' && (
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      <AlertCircle size={14} /> WARNING
                    </span>
                  )}
                  {req.status === 'GAP_MISSING' && (
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                      <XCircle size={14} /> GAP
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors leading-tight">
                    {req.title}
                  </h3>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-mono text-slate-300 leading-relaxed relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-800"></div>
                    <span className="text-[10px] text-slate-600 font-sans block mb-2 uppercase tracking-widest font-bold">Цитата з ТД:</span>
                    "{req.exactQuote}"
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Висновок AI:</div>
                      <p className="text-sm text-slate-400 leading-relaxed italic">{req.explanation}</p>
                    </div>
                    {req.matchingDocName && (
                      <div className="space-y-2">
                        <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Знайдено у Vault:</div>
                        <div className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-xs font-bold text-slate-200">
                          <FileText size={16} className="text-emerald-400" />
                          {req.matchingDocName}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Sticky on Desktop */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 min-w-[220px]">
                {req.status === 'GAP_MISSING' ? (
                  <button
                    onClick={onNavigateToAmcu}
                    className="w-full px-6 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Scale size={16} /> Оскаржити
                  </button>
                ) : (
                  <button
                    onClick={() => handleGenerateDocument(req)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-widest border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles size={16} className="text-emerald-400" /> Герувати довідку
                  </button>
                )}

                <button
                  onClick={onNavigateToVault}
                  className="w-full px-6 py-3 rounded-2xl bg-transparent hover:bg-slate-800 text-slate-500 hover:text-emerald-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Building2 size={14} /> Відкрити Vault
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Generated Document Modal - Full Screen Mobile */}
      {generatedDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-6">
          <div className="bg-slate-900 border-0 sm:border sm:border-slate-800 rounded-none sm:rounded-3xl max-w-4xl w-full h-full sm:h-auto flex flex-col p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">{generatedDocModal.title}</h3>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Готово до накладання КЕП
                </div>
              </div>
              <button 
                onClick={() => setGeneratedDocModal(null)}
                className="p-2 hover:bg-slate-800 rounded-xl transition-all"
              >
                <XCircle size={24} className="text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <div id="generated-doc-printable" className="bg-slate-950 border border-slate-800 rounded-2xl p-8 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                <div className="mb-12">{generatedDocModal.content}</div>
                
                {(company.signatureCliche || company.stampCliche) && (
                  <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">Електронне кліше:</div>
                      <div className="flex items-center gap-12 h-24">
                        {company.signatureCliche && (
                          <div className="relative w-32 h-full">
                            <img 
                              src={company.signatureCliche} 
                              alt="Signature" 
                              className="max-w-full max-h-full object-contain filter brightness-110 contrast-125 mix-blend-multiply" 
                            />
                            <div className="absolute bottom-0 left-0 w-full border-b border-slate-700 text-[8px] text-slate-500 text-center pt-1 italic">
                              (підпис)
                            </div>
                          </div>
                        )}
                        {company.stampCliche && (
                          <div className="relative w-32 h-full">
                            <img 
                              src={company.stampCliche} 
                              alt="Stamp" 
                              className="max-w-full max-h-full object-contain filter brightness-110 contrast-125 mix-blend-multiply" 
                            />
                            <div className="absolute bottom-0 left-0 w-full text-[8px] text-slate-500 text-center pt-1 italic">
                              М.П.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right self-end pb-1">
                      <div className="font-bold text-white uppercase tracking-wider">{company.directorPosition || 'Директор'}</div>
                      <div className="text-slate-400 mt-1">{company.directorName || '_________________'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedDocModal.content);
                  alert('Текст довідки скопійовано в буфер обміну!');
                }}
                className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={16} /> Копіювати
              </button>
              
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <button
                  onClick={() => setGeneratedDocModal(null)}
                  className="px-8 py-4 rounded-2xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all cursor-pointer"
                >
                  Закрити
                </button>
                <button
                  onClick={() => {
                    alert('Довідку додано до пакета тендерних документів!');
                    setGeneratedDocModal(null);
                  }}
                  className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-950/40 cursor-pointer"
                >
                  Додати до Bid Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
