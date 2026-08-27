import React, { useState } from 'react';
import { 
  Tender, 
  CompanyProfile, 
  SystemMode, 
  PriceStrategyScenario, 
  ResourceAuditItem, 
  ActionTask, 
  GanttFeasibilityTask 
} from '../types';
import { 
  Briefcase, 
  CheckSquare, 
  Scale, 
  Building2, 
  FileCheck2, 
  DollarSign, 
  Calendar, 
  Users2, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  ArrowRight, 
  TrendingUp, 
  Play, 
  GitCompare, 
  Download, 
  Send,
  Zap,
  Info,
  Check
} from 'lucide-react';

interface TenderWarRoomModuleProps {
  currentTender: Tender;
  company: CompanyProfile;
  systemMode: SystemMode;
  onNavigateToMatrix: () => void;
  onNavigateToBoQ: () => void;
  onNavigateToAmcu: () => void;
  onNavigateToAudit: () => void;
  onNavigateToCollusion: () => void;
}

type WarRoomTab = 'OVERVIEW' | 'DE_JURE_DE_FACTO' | 'PRICE_STRATEGY' | 'GANTT_FEASIBILITY' | 'ACTION_PLAN' | 'QA_CHECKLIST';

export const TenderWarRoomModule: React.FC<TenderWarRoomModuleProps> = ({
  currentTender,
  company,
  systemMode,
  onNavigateToMatrix,
  onNavigateToBoQ,
  onNavigateToAmcu,
  onNavigateToAudit,
  onNavigateToCollusion
}) => {
  const [activeTab, setActiveTab] = useState<WarRoomTab>('OVERVIEW');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('COMPETITIVE');
  const [tasks, setTasks] = useState<ActionTask[]>(currentTender.actionPlan || []);

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const completedTaskCount = tasks.filter(t => t.isCompleted).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* War Room Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Tender War Room • Командний Центр Закупівлі</span>
              </span>
              <span className="text-xs font-mono bg-slate-950 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800">
                {currentTender.tenderNumber}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Режим: {systemMode === 'SOLO' ? '👤 SOLO (Один фахівець)' : '👥 TEAM (Розподіл ролей)'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {currentTender.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span>Замовник: <strong className="text-white">{currentTender.customer}</strong></span>
              <span>Очікувана вартість: <strong className="text-emerald-400 font-mono">{currentTender.budgetUah.toLocaleString()} ₴</strong></span>
              <span>Дедлайн: <strong className="text-amber-400 font-mono">{currentTender.submissionDeadline}</strong></span>
            </div>
          </div>

          {/* Quick Action Matrix Pill */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Прогрес підготовки:</span>
              <span className="font-bold text-emerald-400">{completedTaskCount} / {tasks.length} задач</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-500" 
                style={{ width: `${tasks.length ? (completedTaskCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Готовність пропозиції:</span>
              <span className="font-bold text-slate-200">{currentTender.readinessScore?.overallPercentage || 92}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex flex-wrap items-center gap-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Огляд & Рішення</span>
        </button>

        <button
          onClick={() => setActiveTab('DE_JURE_DE_FACTO')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'DE_JURE_DE_FACTO'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>3-Станова модель ресурсів (De Jure vs De Facto)</span>
        </button>

        <button
          onClick={() => setActiveTab('PRICE_STRATEGY')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'PRICE_STRATEGY'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Цінові сценарії аукціону</span>
        </button>

        <button
          onClick={() => setActiveTab('GANTT_FEASIBILITY')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'GANTT_FEASIBILITY'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Графік & Виконуваність</span>
        </button>

        <button
          onClick={() => setActiveTab('ACTION_PLAN')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'ACTION_PLAN'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>План дій & Дедлайни</span>
          {tasks.filter(t => !t.isCompleted && t.priority === 'IMMEDIATE').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {tasks.filter(t => !t.isCompleted && t.priority === 'IMMEDIATE').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('QA_CHECKLIST')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'QA_CHECKLIST'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Фінальний QA Стоп-лист</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & DECISION */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          
          {/* Top Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div 
              onClick={onNavigateToMatrix}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Матриця вимог</span>
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3">
                <div className="text-lg font-bold text-white">12 вимог ТД</div>
                <p className="text-xs text-slate-400 mt-0.5">Всі вимоги зіставлені з Vault</p>
              </div>
              <div className="mt-3 text-xs text-emerald-400 font-semibold flex items-center gap-1">
                Перевірити декомпозицію <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            <div 
              onClick={onNavigateToBoQ}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">BoQ Кошторис</span>
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-3">
                <div className="text-lg font-bold text-white">4 розділи робіт</div>
                <p className="text-xs text-slate-400 mt-0.5">Маржа 21.4% (8.25 млн ₴)</p>
              </div>
              <div className="mt-3 text-xs text-blue-400 font-semibold flex items-center gap-1">
                Відкрити АВК-5 аналізатор <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            <div 
              onClick={onNavigateToCollusion}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Аналіз конкурентів</span>
                <Users2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3">
                <div className="text-lg font-bold text-white">2 спаринг-партнери</div>
                <p className="text-xs text-slate-400 mt-0.5">Ризик змови: 78/100</p>
              </div>
              <div className="mt-3 text-xs text-amber-400 font-semibold flex items-center gap-1">
                Перевірити граф зв'язків <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            <div 
              onClick={onNavigateToAmcu}
              className="bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Захист в АМКУ</span>
                <Scale className="w-4 h-4 text-red-400" />
              </div>
              <div className="mt-3">
                <div className="text-lg font-bold text-white">92% шанс виграшу</div>
                <p className="text-xs text-slate-400 mt-0.5">Готовий проєкт скарги ст. 18</p>
              </div>
              <div className="mt-3 text-xs text-red-400 font-semibold flex items-center gap-1">
                Згенерувати скаргу <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Bid/No-Bid Decision & Strategic Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  AI Резюме та Стратегічне Рішення (Bid / No-Bid)
                </h2>
                <p className="text-xs text-slate-400">
                  Згенеровано Мультиагентним консиліумом TenderAI на основі ТД та Smart Vault
                </p>
              </div>
              
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>BID WITH CONDITIONS (Участь з оскарженням)</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {currentTender.opportunityScore?.bidDecisionReason || currentTender.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Сильні сторони нашої пропозиції</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>Аналогічний договір № 44/КБ-23 на 28.4 млн грн на 100% задовольняє ст. 16</li>
                  <li>Власна ліцензія ДІАМ СС2/СС3 та дозвіл Держпраці</li>
                  <li>Оптимальна собівартість матеріалів у кошторисі BoQ</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Вразливості та ризики</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>Дискримінаційна вимога радіусу 12 км для ЗБК (потрібна скарга)</li>
                  <li>Строк дії довідки ДПС закінчується за 2 дні до розкриття</li>
                  <li>Дефіцит 7 монолітників (потрібен договір ЦПХ)</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>Рекомендовані першочергові кроки</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>Подати проєкт скарги до АМКУ до 16.11</li>
                  <li>Замовити свіжу довідку ДПС з КЕП</li>
                  <li>Отримати банківську гарантію на 192 500 ₴ в Ощадбанку</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: 3-STATE RESOURCE AUDIT (DE JURE VS DE FACTO VS ACQUIRABLE) */}
      {activeTab === 'DE_JURE_DE_FACTO' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Трирівнева Модель Ресурсів (De Jure vs De Facto vs Acquirable)
            </h2>
            <p className="text-xs text-slate-400">
              Розділення вимог: що подається в документах (De Jure) ➔ що є наявно зараз (De Facto) ➔ що законно наймається/орендується до моменту виконання (Acquirable).
            </p>
          </div>

          <div className="space-y-4">
            {currentTender.resourceAudit?.map((res) => (
              <div key={res.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{res.resourceName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {res.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Статус доказу: <strong className="text-emerald-400 font-mono">{res.evidenceStatus}</strong>
                  </div>
                </div>

                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">Вимога ТД: </span>
                  {res.tenderRequirement}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  
                  {/* De Jure */}
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">1. DE JURE (Документи)</span>
                      {res.deJureStatus === 'COMPLIANT' ? (
                        <span className="text-[10px] font-bold text-emerald-400">🟢 Відповідає</span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-400">🔴 Оскарження</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{res.deJureNote}</p>
                  </div>

                  {/* De Facto */}
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">2. DE FACTO (Зараз в наявності)</span>
                      {res.deFactoStatus === 'IN_HOUSE' ? (
                        <span className="text-[10px] font-bold text-emerald-400">🟢 В наявності</span>
                      ) : res.deFactoStatus === 'PARTIAL' ? (
                        <span className="text-[10px] font-bold text-amber-400">🟡 Частково</span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-400">🔴 Відсутній</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{res.deFactoNote}</p>
                  </div>

                  {/* Acquirable */}
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-indigo-900/40 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-300">3. ACQUIRABLE (План залучення)</span>
                      <span className="text-[10px] font-bold text-indigo-400 font-mono">{res.costToAcquireUah.toLocaleString()} ₴ ({res.timeToAcquireDays} дн)</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{res.acquirablePlan}</p>
                  </div>

                </div>
              </div>
            )) || (
              <div className="text-xs text-slate-400 italic">
                Аудит ресурсів для цієї закупівлі повністю підтверджує наявність 100% необхідної техніки та персоналу.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PRICE STRATEGY SCENARIOS */}
      {activeTab === 'PRICE_STRATEGY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Симулятор Цінових Сценаріїв Аукціону Prozorro
            </h2>
            <p className="text-xs text-slate-400">
              Моделювання редукціону на основі собівартості кошторису BoQ та історичної поведінки конкурентів
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentTender.priceScenarios?.map((scenario) => {
              const isSelected = selectedScenarioId === scenario.id;

              return (
                <div
                  key={scenario.id}
                  onClick={() => setSelectedScenarioId(scenario.id)}
                  className={`rounded-2xl p-5 border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-slate-950 border-emerald-500 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {scenario.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Обраний сценарій
                        </span>
                      )}
                    </div>

                    <div className="text-2xl font-black text-white font-mono">
                      {scenario.priceUah.toLocaleString()} ₴
                    </div>

                    <div className="text-xs text-emerald-400 font-semibold">
                      Знижка від бюджету: -{scenario.discountPercent}%
                    </div>

                    <p className="text-xs text-slate-400">{scenario.tagline}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Очікуваний прибуток:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {scenario.estimatedMarginUah.toLocaleString()} ₴ ({scenario.estimatedMarginPercent}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Ймовірність перемоги:</span>
                      <span className="font-bold text-slate-200">{scenario.winProbabilityPercent}%</span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" 
                        style={{ width: `${scenario.winProbabilityPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-slate-300">Історичний контекст: </strong>
                    {scenario.historicalDiscountContext}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-300">
              Обрана пропозиція для 1 раунду: <strong>{(currentTender.priceScenarios?.find(s => s.id === selectedScenarioId)?.priceUah || currentTender.budgetUah).toLocaleString()} ₴</strong>
            </div>
            <button
              onClick={onNavigateToBoQ}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Синхронізувати з формою цінової пропозиції</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: GANTT & EXECUTION FEASIBILITY */}
      {activeTab === 'GANTT_FEASIBILITY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Календарний План & Виробнича Спроможність (Gantt Engine)
            </h2>
            <p className="text-xs text-slate-400">
              Аналіз тривалості етапів, потреби в бригадах та критичного шляху виконання об'єкта
            </p>
          </div>

          <div className="space-y-3">
            {currentTender.ganttTasks?.map((task) => (
              <div key={task.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">{task.title}</span>
                    {task.criticalPath && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                        Критичний шлях
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Тижні: {task.startWeek}–{task.startWeek + task.durationWeeks - 1} ({task.durationWeeks} тижнів)
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <span>Потрібно робітників: <strong className="text-emerald-400">{task.crewNeeded} осіб</strong></span>
                  <span>Спецтехніка: <strong className="text-slate-200">{task.machineryNeeded.join(', ')}</strong></span>
                  <span>
                    Забезпеченість: {task.feasibleWithCurrentResources ? (
                      <strong className="text-emerald-400">🟢 100% Власні ресурси</strong>
                    ) : (
                      <strong className="text-amber-400">🟡 {task.gapSolution}</strong>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ACTION PLAN & DEADLINE COUNTDOWN */}
      {activeTab === 'ACTION_PLAN' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Тактичний План Дій & Таймер Дедлайнів (Countdown Intelligence)
              </h2>
              <p className="text-xs text-slate-400">
                Задачі адаптовані під режим: <strong>{systemMode === 'SOLO' ? 'SOLO (Виконання власником)' : 'TEAM (Розподіл за ролями)'}</strong>
              </p>
            </div>

            <div className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>До кінця прийому: 48 год</span>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`bg-slate-950 border rounded-xl p-4 transition-all cursor-pointer flex items-start space-x-3.5 ${
                  task.isCompleted 
                    ? 'border-slate-800 opacity-60' 
                    : task.priority === 'IMMEDIATE'
                    ? 'border-red-900/60 hover:border-red-700'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  task.isCompleted ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600 bg-slate-900'
                }`}>
                  {task.isCompleted && <Check className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-sm font-bold ${task.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {systemMode === 'SOLO' ? 'SOLO USER' : task.assigneeRole}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        task.priority === 'IMMEDIATE' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        Залишилось: {task.deadlineHoursRemaining} год
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">{task.description}</p>
                  
                  <div className="text-[11px] text-red-400/90 pt-1">
                    <strong>Ризик у разі невиконання: </strong> {task.riskIfSkipped}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: QA CHECKLIST */}
      {activeTab === 'QA_CHECKLIST' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                Фінальний Pre-Submission QA Стоп-Лист
              </h2>
              <p className="text-xs text-slate-400">
                Автоматична перевірка 100% пунктів перед завантаженням на електронний майданчик
              </p>
            </div>

            <button
              onClick={onNavigateToAudit}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Повний звіт аудиту</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Пройдені перевірки (98%)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li className="flex items-center gap-1.5 text-emerald-300">
                  <Check className="w-3.5 h-3.5" /> Ліцензія ДІАМ СС2/СС3 чинна в реєстрі
                </li>
                <li className="flex items-center gap-1.5 text-emerald-300">
                  <Check className="w-3.5 h-3.5" /> Досвід за ст. 16 підтверджено актами КБ-2в
                </li>
                <li className="flex items-center gap-1.5 text-emerald-300">
                  <Check className="w-3.5 h-3.5" /> Кошторис BoQ перевірено на арифметичні помилки
                </li>
                <li className="flex items-center gap-1.5 text-emerald-300">
                  <Check className="w-3.5 h-3.5" /> КЕП уповноваженої особи дійсний
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-red-900/40 space-y-3">
              <div className="font-bold text-sm text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Блокуючі фактори (Стоп-лист)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li className="flex items-center gap-1.5 text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" /> Отримати нову довідку ДПС перед подачею
                </li>
                <li className="flex items-center gap-1.5 text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" /> Завантажити електронну банківську гарантію (.p7s)
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
