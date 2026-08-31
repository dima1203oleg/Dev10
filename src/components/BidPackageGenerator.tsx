import React, { useEffect, useState } from 'react';
import { Tender, BidPackage, CompanyProfile } from '../types';
import { 
  Briefcase, 
  FileCheck2, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Building2,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BidPackageGeneratorProps {
  currentTender: Tender;
  company?: CompanyProfile;
  bidPackages: BidPackage[];
  onAddBidPackage: (pkg: BidPackage) => void;
}

export const BidPackageGenerator: React.FC<BidPackageGeneratorProps> = ({
  currentTender,
  company,
  bidPackages,
  onAddBidPackage,
}) => {
  const { token } = useAuth();
  const [packages, setPackages] = useState<BidPackage[]>(bidPackages);
  const [selectedPkg, setSelectedPkg] = useState<BidPackage | null>(bidPackages[0] || null);
  const [companyName, setCompanyName] = useState(company?.shortName || company?.fullName || 'Учасник закупівель');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { setPackages(bidPackages); setSelectedPkg(bidPackages[0] || null); }, [bidPackages]);
  useEffect(() => {
    if (!token) return;
    void fetch(`/api/tenders/${currentTender.id}/bid-packages`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body?.error?.message || 'Не вдалося завантажити пакети');
        const loaded = Array.isArray(body.data) ? body.data as BidPackage[] : [];
        setPackages(loaded);
        setSelectedPkg(loaded[0] || null);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Не вдалося завантажити пакети'));
  }, [currentTender.id, token]);

  // Build an evidence-bound draft. The package stays blocked until the database
  // contains verified BoQ, staff, equipment, license, and signature evidence.
  const handleCreatePackage = async () => {
    if (!token) { setError('Потрібна авторизація для збереження пакета.'); return; }
    const calculatedPrice = currentTender.multiAgentAnalysis?.agents?.bidManager?.recommendedBidPrice;
    const customer = currentTender.customer || 'UNKNOWN: замовник не підтверджений';
    const newPkg: BidPackage = {
      id: '',
      tenderId: currentTender.id,
      tenderNumber: currentTender.tenderNumber,
      tenderTitle: currentTender.title,
      companyName: companyName,
      calculatedPrice: calculatedPrice ?? null,
      marginPercent: null,
      timelineDays: null,
      status: 'IN_PROGRESS',
      updatedAt: new Date().toISOString().split('T')[0],
      documents: [
        {
          name: 'Форма 1: Цінова тендерна пропозиція (чернетка)',
          type: 'FINANCIAL',
          ready: calculatedPrice != null,
          contentPreview: `ТЕНДЕРНА ПРОПОЗИЦІЯ (ЦІНОВА)
Статус: DRAFT. Потрібне підтвердження кошторису, вимог ТД та КЕП перед поданням.
До: ${customer}
Закупівля: ${currentTender.tenderNumber} - «${currentTender.title}»
Учасник: ${companyName}

1. Ми, ${companyName}, вивчивши тендерну документацію, пропонуємо виконати зазначені роботи за ціною:
${calculatedPrice != null ? `${calculatedPrice.toLocaleString()} грн (з ПДВ)` : 'UNKNOWN: підтверджена ціна відсутня'}.
2. Термін виконання робіт: UNKNOWN. Потрібен підтверджений графік із розділу Gantt.
3. Умови оплати: UNKNOWN. Потрібна цитата з договору/ТД.
4. Строк дії пропозиції: UNKNOWN. Потрібна цитата з ТД.`
        },
        {
          name: 'Довідка про наявність матеріально-технічної бази та обладнання (потребує доказів)',
          type: 'QUALIFICATION',
          ready: false,
          contentPreview: `ДОВІДКА
про наявність обладнання, матеріально-технічної бази та технологій

UNKNOWN: підтверджений перелік обладнання відсутній.
Додайте у профіль компанії документи власності/оренди або інвентаризаційні записи.
Цей документ не можна подавати, доки кожна позиція не має джерела й дати перевірки.`
        },
        {
          name: 'Довідка про працівників відповідної кваліфікації (потребує доказів)',
          type: 'QUALIFICATION',
          ready: false,
          contentPreview: `ДОВІДКА
про наявність працівників відповідної кваліфікації

UNKNOWN: підтверджений реєстр працівників і сертифікатів відсутній.
Додайте кадрові документи, накази, сертифікати або договори ЦПХ у профіль компанії.
Автоматичне заповнення вимкнено, щоб не створювати вигадані персональні дані.`
        },
        {
          name: 'Календарний план-графік виконання робіт (потребує Gantt)',
          type: 'TECHNICAL',
          ready: false,
          contentPreview: `КАЛЕНДАРНИЙ ПЛАН ВИКОНАННЯ РОБІТ

UNKNOWN: підтверджений календарний графік відсутній.
Сформуйте задачі у розділі «Діаграма Ганта», зв'яжіть їх із BoQ та строками ТД.
Пакет залишиться IN_PROGRESS, доки графік не пройде аудит.`
        },
        {
          name: 'Гарантійний лист про дотримання вимог ТД (потребує цитат)',
          type: 'LEGAL',
          ready: false,
          contentPreview: `ГАРАНТІЙНИЙ ЛИСТ

UNKNOWN: перелік конкретних норм і гарантій не підтверджений цитатами з ТД.
Після OCR/Requirement Matrix система повинна вставити тільки ті вимоги, які мають source URL, hash, сторінку й bbox.`
        }
      ]
    };

    setError('');
    try {
      const response = await fetch(`/api/tenders/${currentTender.id}/bid-packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ manifest: newPkg }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message || 'Не вдалося зберегти пакет');
      const saved = body.data as BidPackage;
      setPackages(previous => [saved, ...previous]);
      setSelectedPkg(saved);
      onAddBidPackage(saved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не вдалося зберегти пакет');
    }
  };

  const handleCopyDoc = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadPackage = () => {
    if (!selectedPkg) return;
    const fullContent = selectedPkg.documents.map(d => `========================================\n${d.name}\nКатегорія: ${d.type}\n========================================\n\n${d.contentPreview}`).join('\n\n\n');
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bid_Package_${selectedPkg.tenderNumber}_${selectedPkg.companyName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>TenderAI Construction • Генератор тендерної пропозиції</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Формування повного пакета документів учасника
          </h1>
          <p className="text-sm text-slate-300">
            Автоматичне складання цінової форми, довідок про МТБ/персонал, календарного плану та гарантійних листів
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedPkg && (
            <button
              onClick={handleDownloadPackage}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Завантажити пакет (.txt)</span>
            </button>
          )}

          <button
            id="create-bid-package-btn"
            onClick={handleCreatePackage}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-indigo-900/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>Згенерувати новий пакет</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Package info & selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h2 className="font-bold text-base text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Параметри пропозиції</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Назва компанії-учасника
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-xs">
              <div className="text-slate-400">Проєкт:</div>
              <div className="font-bold text-white leading-snug">{currentTender.title}</div>
              
              <div className="pt-2 border-t border-slate-700 flex justify-between text-slate-300">
                <span>Очікувана вартість:</span>
                <strong className="text-slate-200 font-mono">{currentTender.budgetUah != null ? `${currentTender.budgetUah.toLocaleString()} ₴` : 'UNKNOWN'}</strong>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Ціна пропозиції:</span>
                <strong className="text-emerald-400 font-mono text-sm font-bold">
                  {selectedPkg?.calculatedPrice != null ? `${selectedPkg.calculatedPrice.toLocaleString()} ₴` : 'UNKNOWN'}
                </strong>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Маржинальність:</span>
                <strong className="text-indigo-300 font-mono font-bold">{selectedPkg?.marginPercent != null ? `${selectedPkg.marginPercent}%` : 'UNKNOWN'}</strong>
              </div>
            </div>
          </div>

          {/* Previous Packages List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Створені пакети ({packages.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedPkg?.id === pkg.id
                      ? 'bg-indigo-950/40 border-indigo-800 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-400 font-mono">{pkg.calculatedPrice != null ? `${pkg.calculatedPrice.toLocaleString()} ₴` : 'UNKNOWN'}</span>
                    <span className="text-[10px] text-slate-400">{pkg.updatedAt}</span>
                  </div>
                  <div className="line-clamp-1 font-medium mt-1">{pkg.companyName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Documents in package */}
        <div className="lg:col-span-8 space-y-4">
          {selectedPkg ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Документи тендерного пакета ({selectedPkg.documents.length})</h3>
                  <p className="text-xs text-slate-400">Готові форми для завантаження в електронну систему Prozorro</p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedPkg.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileCheck2 className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-bold text-sm text-white">{doc.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {doc.type}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyDoc(doc.contentPreview, idx)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedIndex === idx ? 'Скопійовано' : 'Копіювати'}</span>
                      </button>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed overflow-y-auto">
                      <div className="mb-8">{doc.contentPreview}</div>
                      
                      {(company?.signatureCliche || company?.stampCliche) && (
                        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-8 h-16">
                            {company?.signatureCliche && (
                              <div className="relative w-20 h-full">
                                <img 
                                  src={company.signatureCliche} 
                                  alt="Signature" 
                                  className="max-w-full max-h-full object-contain filter brightness-110 contrast-125 mix-blend-multiply" 
                                />
                                <div className="absolute bottom-0 left-0 w-full border-b border-slate-700 text-[6px] text-slate-500 text-center italic">
                                  (підпис)
                                </div>
                              </div>
                            )}
                            {company?.stampCliche && (
                              <div className="relative w-20 h-full">
                                <img 
                                  src={company.stampCliche} 
                                  alt="Stamp" 
                                  className="max-w-full max-h-full object-contain filter brightness-110 contrast-125 mix-blend-multiply" 
                                />
                                <div className="absolute bottom-0 left-0 w-full text-[6px] text-slate-500 text-center italic">
                                  М.П.
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right self-end">
                            <div className="font-bold text-[10px] text-white uppercase tracking-wider">{company?.directorPosition || 'Директор'}</div>
                            <div className="text-slate-500 text-[10px]">{company?.directorName || '_________________'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              Натисніть «Згенерувати новий пакет» для створення повного пакета документів.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
