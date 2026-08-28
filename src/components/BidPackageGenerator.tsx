import React, { useState } from 'react';
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
  const [selectedPkg, setSelectedPkg] = useState<BidPackage | null>(bidPackages[0] || null);
  const [companyName, setCompanyName] = useState(company?.shortName || company?.fullName || 'Учасник закупівель');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generate new package
  const handleCreatePackage = () => {
    const calculatedPrice = currentTender.multiAgentAnalysis?.agents.bidManager.recommendedBidPrice || (currentTender.budgetUah * 0.88);
    const newPkg: BidPackage = {
      id: `bid-${Date.now()}`,
      tenderId: currentTender.id,
      tenderNumber: currentTender.tenderNumber,
      tenderTitle: currentTender.title,
      companyName: companyName,
      calculatedPrice: calculatedPrice,
      marginPercent: 18.5,
      timelineDays: 45,
      status: 'READY_TO_SUBMIT',
      updatedAt: new Date().toISOString().split('T')[0],
      documents: [
        {
          name: 'Форма 1: Цінова тендерна пропозиція',
          type: 'FINANCIAL',
          ready: true,
          contentPreview: `ТЕНДЕРНА ПРОПОЗИЦІЯ (ЦІНОВА)
До: ${currentTender.customer}
Закупівля: ${currentTender.tenderNumber} - «${currentTender.title}»
Учасник: ${companyName}

1. Ми, ${companyName}, вивчивши тендерну документацію, пропонуємо виконати зазначені роботи за ціною:
${calculatedPrice.toLocaleString()} грн (з ПДВ).
2. Термін виконання робіт: 45 календарних днів з моменту підписання договору.
3. Умови оплати: згідно з проєктом договору замовника (протягом 20 банківських днів після підписання актів КБ-2в).
4. Пропозиція діє протягом 90 календарних днів.`
        },
        {
          name: 'Довідка про наявність матеріально-технічної бази та обладнання',
          type: 'QUALIFICATION',
          ready: true,
          contentPreview: `ДОВІДКА
про наявність обладнання, матеріально-технічної бази та технологій

1. Автобетонозмішувачі MAN 9м³ - 4 од. (власні)
2. Автокран КС-55712 (25т) - 2 од. (власний)
3. Екскаватор-навантажувач JCB 4CX - 2 од. (договір оренди №12/24)
4. Вібратори глибинні для бетону Wacker Neuson - 6 од. (власні)
5. Апарати для зварювання арматури та ПЕ труб - 4 од. (власні)`
        },
        {
          name: 'Довідка про працівників відповідної кваліфікації',
          type: 'QUALIFICATION',
          ready: true,
          contentPreview: `ДОВІДКА
про наявність працівників відповідної кваліфікації

1. Головний інженер (ГІП) - Коваленко О.В., сертифікат АР №0018923
2. Начальник дільниці - Мельник С.І., досвід понад 14 років
3. Бетонярі 4-5 розряду - 12 осіб (атестовані)
4. Електрозварники ручного зварювання 5 розряду - 4 особи (посвідчення Держпраці)
5. Монтажники будівельних конструкцій - 8 осіб`
        },
        {
          name: 'Календарний план-графік виконання робіт',
          type: 'TECHNICAL',
          ready: true,
          contentPreview: `КАЛЕНДАРНИЙ ПЛАН ВИКОНАННЯ РОБІТ

Етап 1 (1-10 дні): Підготовчі та демонтажні роботи, геодезична розбивка.
Етап 2 (11-25 дні): Армування та бетонування несучих конструкцій, монолітні перекриття.
Етап 3 (26-38 дні): Гідроізоляція мембраною, монтаж інженерних мереж та вентиляції.
Етап 4 (39-45 дні): Опоряджувальні роботи, пусконалагодження, підписання актів готовності.`
        },
        {
          name: 'Гарантійний лист про дотримання екологічних та технічних норм ДБН',
          type: 'LEGAL',
          ready: true,
          contentPreview: `ГАРАНТІЙНИЙ ЛИСТ

Цим листом ${companyName} гарантує безумовне дотримання всіх вимог чинного законодавства України з охорони навколишнього середовища, правил пожежної безпеки, норм ДБН А.3.1-5:2016 «Організація будівельного виробництва» та ДБН В.2.2-5:2023.`
        }
      ]
    };

    onAddBidPackage(newPkg);
    setSelectedPkg(newPkg);
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
                <strong className="text-slate-200 font-mono">{(currentTender.budgetUah).toLocaleString()} ₴</strong>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Ціна пропозиції:</span>
                <strong className="text-emerald-400 font-mono text-sm font-bold">
                  {(selectedPkg?.calculatedPrice || currentTender.budgetUah * 0.88).toLocaleString()} ₴
                </strong>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Маржинальність:</span>
                <strong className="text-indigo-300 font-mono font-bold">18.5%</strong>
              </div>
            </div>
          </div>

          {/* Previous Packages List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Створені пакети ({bidPackages.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {bidPackages.map((pkg) => (
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
                    <span className="font-bold text-indigo-400 font-mono">{(pkg.calculatedPrice).toLocaleString()} ₴</span>
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

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {doc.contentPreview}
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
