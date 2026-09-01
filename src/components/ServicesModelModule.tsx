import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Users, 
  Building, 
  Zap, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Award
} from 'lucide-react';

export const ServicesModelModule: React.FC = () => {
  const [targetVolumeMln, setTargetVolumeMln] = useState<number>(40);
  const [winRateTarget, setWinRateTarget] = useState<number>(35);

  const estimatedTendersNeeded = Math.ceil(targetVolumeMln / 15);
  const hoursSavedPerTender = 68;
  const totalHoursSaved = estimatedTendersNeeded * hoursSavedPerTender;
  const openSupportChat = () => window.dispatchEvent(new CustomEvent('tenderai:navigate', { detail: 'multiagent-chat' }));

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>TenderAI Business & Service Model</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Формати Співпраці: Від SaaS до Повного Супроводу
          </h1>

          <p className="text-sm text-slate-300">
            Оберіть оптимальний рівень інтеграції для вашої будівельної компанії: самостійна робота з AI-платформою, гібридний формат з юридичним аудитом або генпідрядний супровід «під ключ».
          </p>
        </div>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tier 1: SaaS DIY */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-lg">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Рівень 1</span>
              <h3 className="text-xl font-black text-white">SaaS DIY (Autonomous AI)</h3>
              <p className="text-xs text-slate-400">Для самостійних фахівців та внутрішніх тендерних відділів</p>
            </div>

            <div className="text-3xl font-black text-white font-mono">
              6 500 ₴ <span className="text-xs font-normal text-slate-400 font-sans">/ місяць</span>
            </div>

            <ul className="text-xs text-slate-300 space-y-2.5 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> AI Tender Radar & Prozorro моніторинг
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Автодекомпозиція вимог ТД (ст. 16, 17)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Антикорупційний FoulTender детектор
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Smart Vault та автогенератор довідок
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> BoQ & АВК-5 ціновий аналізатор
              </li>
            </ul>
          </div>

          <button type="button" onClick={openSupportChat} className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer">
            Активувати підписку DIY
          </button>
        </div>

        {/* Tier 2: AI-Assisted (Hybrid) - Featured */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
            Найпопулярніший вибір
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Рівень 2</span>
              <h3 className="text-xl font-black text-white">AI-Assisted Hybrid</h3>
              <p className="text-xs text-slate-400">Швидкість штучного інтелекту + експертна верифікація юристом</p>
            </div>

            <div className="text-3xl font-black text-white font-mono">
              18 500 ₴ <span className="text-xs font-normal text-slate-400 font-sans">/ місяць</span>
            </div>

            <ul className="text-xs text-slate-300 space-y-2.5 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> <strong>Все з пакету SaaS DIY</strong>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Ручна перевірка пропозиції адвокатом по закупівлях
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Експертиза кошторису сертифікованим інженером
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Підготовка скарг до АМКУ з супроводом
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Пріоритетний SLA відповіді: до 2 годин
              </li>
            </ul>
          </div>

          <button type="button" onClick={openSupportChat} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/60 transition-all cursor-pointer">
            Обрати AI-Assisted
          </button>
        </div>

        {/* Tier 3: Managed Tender Service */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-lg">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Рівень 3</span>
              <h3 className="text-xl font-black text-white">Managed Tender Service</h3>
              <p className="text-xs text-slate-400">Повний зовнішній тендерний департамент «під ключ»</p>
            </div>

            <div className="text-2xl font-black text-white font-mono">
              Success Fee <span className="text-xs font-normal text-slate-400 font-sans">(1.5% - 3%)</span>
            </div>

            <ul className="text-xs text-slate-300 space-y-2.5 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Повна підготовка пакета від «А» до «Я»
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Оформлення банківських гарантій та КЕП
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Онлайн-супровід 3 раундів редукціону
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Повне представництво в колегії АМКУ
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Оплата лише за результат перемоги
              </li>
            </ul>
          </div>

          <button type="button" onClick={openSupportChat} className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer">
            Замовити аудит компанії
          </button>
        </div>

      </div>

      {/* Interactive Value & ROI Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Калькулятор Економічного Ефекту & ROI
          </h2>
          <p className="text-xs text-slate-400">
            Розрахуйте вигоду від автоматизації тендерної рутини та захисту від дискваліфікацій
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Controls */}
          <div className="space-y-5 bg-slate-950 p-5 rounded-xl border border-slate-800">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Бажаний обсяг контрактів на рік:</span>
                <strong className="text-emerald-400 font-mono text-sm">{targetVolumeMln} млн ₴</strong>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={targetVolumeMln}
                onChange={(e) => setTargetVolumeMln(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Цільовий відсоток перемог (Win Rate):</span>
                <strong className="text-teal-400 font-mono text-sm">{winRateTarget}%</strong>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                step="5"
                value={winRateTarget}
                onChange={(e) => setWinRateTarget(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400">Економія часу команди</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">{totalHoursSaved} год</div>
              <div className="text-[10px] text-slate-500">~{Math.round(totalHoursSaved / 8)} робочих днів</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400">Потенційний маржинальний прибуток</div>
              <div className="text-2xl font-black text-slate-400 font-mono">UNKNOWN</div>
              <div className="text-[10px] text-slate-500">Потрібні підтверджені дані собівартості та маржі</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400">Необхідно подати заявок</div>
              <div className="text-2xl font-black text-white font-mono">{estimatedTendersNeeded}</div>
              <div className="text-[10px] text-slate-500">За поточним Win Rate</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400">Ризик втрати завдатків</div>
              <div className="text-2xl font-black text-slate-400 font-mono">UNKNOWN</div>
              <div className="text-[10px] text-slate-500">Немає підтвердженої статистики втрат</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
