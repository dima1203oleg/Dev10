import React from 'react';
import { Tender, AppSection } from '../types';
import { 
  ShieldAlert, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Scale, 
  ArrowRight,
  Sparkles,
  Bot,
  FileCheck2,
  Banknote,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  Users2,
  GitCompare,
  Briefcase
} from 'lucide-react';

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
  const totalBudget = tenders.reduce((acc, t) => acc + t.budgetUah, 0);
  const highRiskTenders = tenders.filter(t => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL');
  const cleanTenders = tenders.filter(t => t.riskLevel === 'LOW');
  const avgFoulScore = Math.round(tenders.reduce((acc, t) => acc + t.foulScore, 0) / (tenders.length || 1));

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Hero Banner: Unification of FoulTender + TenderAI Construction */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Tender Intelligence & Preparation Platform • Версія 1.0</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              TenderAI <span className="text-emerald-400 font-light">&</span> FoulTender Suite
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Комплексна платформа автоматизованої підготовки, кваліфікаційної перевірки, декомпозиції кошторисів BoQ, виявлення картельних змов та антикорупційного захисту тендерних пропозицій у Prozorro.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-radar-btn"
                onClick={() => onNavigate('radar')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Тендерний Радар</span>
              </button>

              <button
                id="hero-war-room-btn"
                onClick={() => onNavigate('war-room')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>Tender War Room</span>
              </button>

              <button
                id="hero-matrix-btn"
                onClick={() => onNavigate('matrix')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Матриця вимог</span>
              </button>

              <button
                id="hero-foultender-btn"
                onClick={() => onNavigate('foultender')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/70 text-red-200 border border-red-800/60 text-sm font-semibold transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>FoulTender</span>
              </button>
            </div>
          </div>

          {/* Quick Stat Pill */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-xl p-4 sm:p-5 flex flex-col justify-center space-y-3 min-w-[240px]">
            <div className="text-xs text-slate-400 font-medium">Ефективність платформи</div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-emerald-400">94.2%</span>
              <span className="text-xs text-slate-300">успіх скарг в АМКУ</span>
            </div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '94.2%' }}></div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Запобігли збиткам:</span>
              <span className="font-semibold text-slate-200">~148.5 млн ₴</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Активні тендери</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{tenders.length}</span>
            <span className="text-xs text-slate-400">у моніторингу</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Загальний бюджет: <span className="text-slate-200 font-semibold">{(totalBudget / 1000000).toFixed(1)} млн ₴</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900/90 border border-red-900/40 rounded-xl p-5 shadow-sm hover:border-red-800/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">FoulTender Сигнали</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-red-400">{highRiskTenders.length}</span>
            <span className="text-xs text-red-300/80">дискримінаційних</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Сер. ризик (Foul Score): <span className="text-red-400 font-bold">{avgFoulScore}/100</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-xl p-5 shadow-sm hover:border-emerald-800/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">TenderAI BoQ Розрахунки</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-400">{tenders.filter(t => t.multiAgentAnalysis).length}</span>
            <span className="text-xs text-slate-400">готових кошторисів</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Сер. маржинальність: <span className="text-emerald-400 font-bold">18.5%</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Скарги АМКУ</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-400">{tenders.filter(t => t.amcuAppealRecommendation?.recommended).length}</span>
            <span className="text-xs text-slate-400">рекомендовано</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Правовий шанс виграшу: <span className="text-amber-400 font-bold">&gt; 90%</span>
          </div>
        </div>

      </div>

      {/* Enterprise Platform Interactive Modules */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Модулі корпоративної платформи Tender Intelligence
          </h2>
          <p className="text-xs text-slate-400">Швидкий доступ до інструментів підготовки та безпеки тендерної пропозиції</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div 
            onClick={() => onNavigate('matrix')}
            className="bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">Матриця вимог</h3>
              <p className="text-xs text-slate-400 mt-1">Декомпозиція ТД та зіставлення з Vault</p>
            </div>
            <div className="mt-4 text-xs font-semibold text-emerald-400 flex items-center gap-1">
              Перейти <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('vault')}
            className="bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">Smart Vault</h3>
              <p className="text-xs text-slate-400 mt-1">Документи, техніка, персонал компанії</p>
            </div>
            <div className="mt-4 text-xs font-semibold text-emerald-400 flex items-center gap-1">
              Перейти <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('competitors')}
            className="bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                <Users2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200 group-hover:text-amber-400 transition-colors">Конкуренти & Змови</h3>
              <p className="text-xs text-slate-400 mt-1">Виявлення спарингів та змов у торгах</p>
            </div>
            <div className="mt-4 text-xs font-semibold text-amber-400 flex items-center gap-1">
              Перейти <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('diff')}
            className="bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200 group-hover:text-indigo-400 transition-colors">AI Diff версій</h3>
              <p className="text-xs text-slate-400 mt-1">Контроль змін та прихованих умов ТД</p>
            </div>
            <div className="mt-4 text-xs font-semibold text-indigo-400 flex items-center gap-1">
              Перейти <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('audit')}
            className="bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">Pre-Submission</h3>
              <p className="text-xs text-slate-400 mt-1">Фінальний аудит та блокуючий чеклист</p>
            </div>
            <div className="mt-4 text-xs font-semibold text-emerald-400 flex items-center gap-1">
              Перейти <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('complaints')}
            className="bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/40 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200 group-hover:text-rose-400 transition-colors">Скарги АМКУ</h3>
              <p className="text-xs text-slate-400 mt-1">Генератор скарг за ст. 18 Закону</p>
            </div>
            <div className="mt-4 text-xs font-semibold text-rose-400 flex items-center gap-1">
              Перейти <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* 5 AI Agents Team Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <span>Мультиагентна система TenderAI & FoulTender</span>
            </h2>
            <p className="text-xs text-slate-400">
              5 спеціалізованих агентів виконують паралельний аналіз кожного проєкту
            </p>
          </div>
          <button
            onClick={() => onNavigate('multiagent-chat')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>Відкрити мультиагентний консиліум</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
          
          {/* Agent 1 */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">👷</span>
              <div>
                <div className="font-bold text-sm text-white">Кошторисник</div>
                <div className="text-[11px] text-emerald-400 font-medium">BoQ & АВК-5</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-2.5 leading-snug">
              Парсинг відомості обсягів робіт, перевірка розцінок на бетон, метал, трудовитрати.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
              <span>Статус:</span>
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Активний</span>
              </span>
            </div>
          </div>

          {/* Agent 2 */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">🏗️</span>
              <div>
                <div className="font-bold text-sm text-white">ГІП / Інженер</div>
                <div className="text-[11px] text-blue-400 font-medium">Технологія & ДБН</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-2.5 leading-snug">
              Календарні графіки, технологічна сумісність, аналіз строків виконання та ризиків затримок.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
              <span>Статус:</span>
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Активний</span>
              </span>
            </div>
          </div>

          {/* Agent 3 */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">⚖️</span>
              <div>
                <div className="font-bold text-sm text-white">Тендерний Юрист</div>
                <div className="text-[11px] text-amber-400 font-medium">Кваліфікація ст. 16</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-2.5 leading-snug">
              Перевірка ліцензій СС2/СС3, банківських гарантій, гарантійних листів та комплаєнсу ТД.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
              <span>Статус:</span>
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Активний</span>
              </span>
            </div>
          </div>

          {/* Agent 4 */}
          <div className="bg-slate-800/70 border border-red-900/40 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">🛡️</span>
              <div>
                <div className="font-bold text-sm text-red-300">FoulTender Guard</div>
                <div className="text-[11px] text-red-400 font-medium">Антикорупція & АМКУ</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-2.5 leading-snug">
              Виявлення прихованих дискримінаційних вимог під конкретного фаворита, розрахунок скарг.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
              <span>Статус:</span>
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Активний</span>
              </span>
            </div>
          </div>

          {/* Agent 5 */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">💼</span>
              <div>
                <div className="font-bold text-sm text-white">Тендерний Директор</div>
                <div className="text-[11px] text-indigo-400 font-medium">Цінова стратегія</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-2.5 leading-snug">
              Оптимізація цінової пропозиції для 3 раундів аукціону, розрахунок максимальної маржі.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
              <span>Статус:</span>
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Активний</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Featured Tenders Watchlist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Моніторинг та аналітика закупівель</h2>
            <p className="text-xs text-slate-400">Перегляньте деталі та запустіть відповідний модуль обробки</p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1"
          >
            <span>Весь реєстр ({tenders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {tenders.map((tender) => {
            const isHighRisk = tender.foulScore >= 60;
            const isClean = tender.foulScore < 40;

            return (
              <div
                key={tender.id}
                className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 rounded-xl p-4 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                      {tender.tenderNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {tender.customerCity} • {tender.category}
                    </span>
                    
                    {/* Foul Score Badge */}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold inline-flex items-center space-x-1 ${
                        isHighRisk
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : isClean
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      <ShieldAlert className="w-3 h-3" />
                      <span>Foul Score: {tender.foulScore}/100</span>
                    </span>

                    {tender.multiAgentAnalysis && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        BoQ розраховано (Маржа {tender.multiAgentAnalysis.expectedMarginPercent}%)
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {tender.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {tender.summary}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-slate-300 pt-1">
                    <span>Замовник: <strong className="text-slate-200">{tender.customer}</strong></span>
                    <span>Бюджет: <strong className="text-emerald-400">{(tender.budgetUah).toLocaleString()} ₴</strong></span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 self-end lg:self-center">
                  <button
                    onClick={() => {
                      onSelectTender(tender);
                      onNavigate('matrix');
                    }}
                    className="px-3 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-800 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Матриця</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTender(tender);
                      onNavigate('foultender');
                    }}
                    className="px-3 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>FoulTender</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTender(tender);
                      onNavigate('construction');
                    }}
                    className="px-3 py-2 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 text-blue-200 border border-blue-800 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>BoQ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
