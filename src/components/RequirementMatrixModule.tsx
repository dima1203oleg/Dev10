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
  FileSpreadsheet
} from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isMatching, setIsMatching] = useState(false);
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
    try {
      const response = await fetch('/api/company/audit-vault-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyProfile: company,
          tenderTitle: currentTender.title,
          tenderRequirements: requirements,
          tenderText: currentTender.tenderText
        })
      });

      if (!response.ok) throw new Error('Помилка зіставлення');
      const data = await response.json();
      if (data.requirements) {
        onUpdateTenderRequirements(currentTender.id, data.requirements);
      }
    } catch (err) {
      console.error(err);
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
    <div id="requirement-matrix-module" className="space-y-6">
      {/* Header & Compliance Scorecard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                AI Requirement Decomposer
              </span>
              <span className="text-xs text-slate-400 font-mono">{currentTender.tenderNumber}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{currentTender.title}</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Автоматичне зіставлення вимог Тендерної документації зі Smart Vault компанії <strong className="text-slate-200">{company.shortName}</strong>
            </p>
          </div>

          {/* Compliance Gauge */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex-shrink-0">
            <div className="text-center">
              <div className="text-xs text-slate-400">Покриття вимог ТД</div>
              <div className={`text-3xl font-extrabold ${complianceRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {complianceRate}%
              </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800" />
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> {coveredCount} Виконано
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" /> {warningCount} Увага / Оновити
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <XCircle className="w-3.5 h-3.5" /> {gapCount} GAP (Бракує)
              </div>
            </div>
          </div>
        </div>

        {/* AI Action Trigger Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-400 mr-2">
              <Filter className="w-3.5 h-3.5" /> Фільтр:
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Всі категорії вимог</option>
              <option value="QUALIFICATION_ART16">Кваліфікація (ст. 16)</option>
              <option value="TECHNICAL_SPEC">Технічна специфікація</option>
              <option value="FINANCIAL_GUARANTEE">Банківська гарантія</option>
              <option value="ANTI_CORRUPTION_ART17">Стаття 17 (Доброчесність)</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Всі статуси відповідності</option>
              <option value="COVERED">🟢 Виконано (Covered)</option>
              <option value="WARNING">🟡 Увага (Warning)</option>
              <option value="GAP_MISSING">🔴 GAP (Бракує документа)</option>
            </select>
          </div>

          <button
            onClick={handleRunAiMatching}
            disabled={isMatching}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isMatching ? 'animate-spin' : ''}`} />
            {isMatching ? 'Аудит відповідності у процесі...' : 'AI Повторне зіставлення з Vault'}
          </button>
        </div>
      </div>

      {/* Critical Gap Alert if exists */}
      {gapCount > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-200">
                  Виявлено {gapCount} критичний розрив (GAP) у тендерній пропозиції!
                </h4>
                <p className="text-xs text-rose-300/80 mt-1">
                  Замовник встановив дискримінаційну вимогу, якій компанія не відповідає (відстань виробничої бази). Подання без усунення цієї вимоги гарантовано призведе до відхилення пропозиції!
                </p>
              </div>
            </div>
            <button
              onClick={onNavigateToAmcu}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex-shrink-0 flex items-center gap-1.5 shadow-md shadow-rose-600/30"
            >
              Скласти скаргу до АМКУ <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Requirements Table / Grid */}
      <div className="space-y-4">
        {filteredRequirements.map((req) => (
          <div
            key={req.id}
            className={`border rounded-2xl p-5 transition-all bg-slate-900/90 ${
              req.status === 'GAP_MISSING'
                ? 'border-rose-500/40 hover:border-rose-500'
                : req.status === 'WARNING'
                ? 'border-amber-500/40 hover:border-amber-500'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {req.clauseInTenderDoc}
                  </span>

                  {req.status === 'COVERED' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Виконано (100% Match)
                    </span>
                  )}
                  {req.status === 'WARNING' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      <AlertCircle className="w-3.5 h-3.5" /> Потребує оновлення / дій
                    </span>
                  )}
                  {req.status === 'GAP_MISSING' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                      <XCircle className="w-3.5 h-3.5" /> GAP / Дискримінаційна вимога
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-100">{req.title}</h3>

                {/* Exact quote from Tender Document */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs font-mono text-slate-300">
                  <span className="text-slate-500 font-sans block mb-1">Цитата з ТД:</span>
                  "{req.exactQuote}"
                </div>

                {/* Evidence & Explanation */}
                <div className="text-xs text-slate-300 space-y-1">
                  {req.matchingDocName && (
                    <div>
                      <strong className="text-emerald-400">Документ зі сховища:</strong> {req.matchingDocName}
                    </div>
                  )}
                  <div>
                    <strong className="text-slate-400">Аналіз експерта:</strong> {req.explanation}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-center gap-2 flex-shrink-0">
                {req.status === 'GAP_MISSING' ? (
                  <button
                    onClick={onNavigateToAmcu}
                    className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30"
                  >
                    Оскаржити в АМКУ
                  </button>
                ) : (
                  <button
                    onClick={() => handleGenerateDocument(req)}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 hover:border-slate-600"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    Згенерувати довідку
                  </button>
                )}

                <button
                  onClick={onNavigateToVault}
                  className="text-xs text-slate-400 hover:text-emerald-400 underline underline-offset-2 py-1"
                >
                  Переглянути у Vault
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Generated Document Modal */}
      {generatedDocModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{generatedDocModal.title}</h3>
              <span className="text-xs text-emerald-400 font-mono">Готово до накладання КЕП</span>
            </div>

            <textarea
              readOnly
              value={generatedDocModal.content}
              rows={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedDocModal.content);
                  alert('Текст довідки скопійовано в буфер обміну!');
                }}
                className="text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-2 rounded-xl"
              >
                Копіювати текст
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGeneratedDocModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 text-xs font-semibold"
                >
                  Закрити
                </button>
                <button
                  onClick={() => {
                    alert('Довідку додано до пакета тендерних документів!');
                    setGeneratedDocModal(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-950 bg-emerald-500 hover:bg-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/20"
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
