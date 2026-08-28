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
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16">
      
      {/* War Room Header Banner - Responsive Layout */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                <Briefcase className="w-3.5 h-3.5" />
                <span>War Room • Командний Центр</span>
              </div>
              <div className="text-[10px] font-mono font-bold bg-slate-950 text-slate-400 px-2 py-1 rounded-lg border border-slate-800">
                {currentTender.tenderNumber}
              </div>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {currentTender.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-tighter">
              <div className="flex items-center gap-1.5">
                <Building2 size={14} className="text-slate-500" />
                <span className="text-slate-200">{currentTender.customer}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-500" />
                <span className="text-emerald-400 font-mono">{currentTender.budgetUah.toLocaleString()} ₴</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber-500" />
                <span className="text-amber-400 font-mono">{currentTender.submissionDeadline}</span>
              </div>
            </div>
          </div>

          {/* Progress Pill - Adaptive Size */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 min-w-[280px] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Готовність пропозиції:</span>
              <span className="text-xl font-black text-emerald-400">{currentTender.readinessScore?.overallPercentage || 92}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-indigo-600 transition-all duration-500 shadow-lg shadow-emerald-500/20" 
                style={{ width: `${currentTender.readinessScore?.overallPercentage || 92}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
              <span>Задач виконано:</span>
              <span className="text-slate-200">{completedTaskCount} / {tasks.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Horizontal Scroll on Mobile */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar sticky top-4 z-40 shadow-xl">
        {[
          { id: 'OVERVIEW', icon: Layers, label: 'Огляд' },
          { id: 'DE_JURE_DE_FACTO', icon: Building2, label: 'Ресурси' },
          { id: 'PRICE_STRATEGY', icon: TrendingUp, label: 'Ціна' },
          { id: 'GANTT_FEASIBILITY', icon: Calendar, label: 'Графік' },
          { id: 'ACTION_PLAN', icon: Clock, label: 'План' },
          { id: 'QA_CHECKLIST', icon: FileCheck2, label: 'QA' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as WarRoomTab)}
            className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & DECISION */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 sm:space-y-8">
          
          {/* Quick Actions Grid - Adaptive Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={onNavigateToMatrix}
              className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckSquare size={20} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-emerald-400 transition-all" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Матриця вимог</div>
                <div className="text-xl font-black text-white mt-1">12 вимог ТД</div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">Всі вимоги зіставлені з Vault</p>
              </div>
            </div>

            <div 
              onClick={onNavigateToBoQ}
              className="group bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-3xl p-6 cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Building2 size={20} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-blue-400 transition-all" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">BoQ Кошторис</div>
                <div className="text-xl font-black text-white mt-1">Декомпозиція</div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">Аналіз АВК-5 / BoQ</p>
              </div>
            </div>

            <div 
              onClick={onNavigateToCollusion}
              className="group bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Users2 size={20} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-amber-400 transition-all" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Конкуренти</div>
                <div className="text-xl font-black text-white mt-1">Граф зв'язків</div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">Ризик змови: Low</p>
              </div>
            </div>

            <div 
              onClick={onNavigateToAmcu}
              className="group bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-3xl p-6 cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                  <Scale size={20} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-red-400 transition-all" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Захист в АМКУ</div>
                <div className="text-xl font-black text-white mt-1">Проєкт скарги</div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">Дискримінаційні вимоги</p>
              </div>
            </div>
          </div>

          {/* Bid/No-Bid Decision - Adaptive Rich Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  AI Резюме та Стратегічне Рішення
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  Multi-Agent Decision Framework
                </p>
              </div>
              
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" />
                <span>BID WITH CONDITIONS</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                  {currentTender.opportunityScore?.bidDecisionReason || currentTender.summary}
                </p>
              </div>

              <div className="lg:col-span-4 space-y-4">
                 <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ключові фактори:</div>
                    <ul className="space-y-3">
                      {[
                        { icon: Check, color: 'text-emerald-400', label: 'Досвід (ст. 16)', value: 'MATCH' },
                        { icon: AlertTriangle, color: 'text-amber-400', label: 'Техніка', value: 'GAP (Rental)' },
                        { icon: Zap, color: 'text-indigo-400', label: 'Маржа', value: '21.4%' }
                      ].map((f, i) => (
                        <li key={i} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-400">
                            <f.icon size={14} className={f.color} />
                            {f.label}
                          </div>
                          <span className="font-bold text-slate-200">{f.value}</span>
                        </li>
                      ))}
                    </ul>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESOURCE AUDIT - Adaptive Cards */}
      {activeTab === 'DE_JURE_DE_FACTO' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Трирівнева Модель Ресурсів
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
              Система зіставляє юридичні вимоги (De Jure) з реальними активами компанії (De Facto) та формує план закупівлі відсутніх ресурсів (Acquirable).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {currentTender.resourceAudit?.map((res) => (
              <div key={res.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="text-lg font-black text-white">{res.resourceName}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{res.category}</div>
                  </div>
                  <div className="text-[10px] px-3 py-1 rounded-xl bg-slate-950 text-emerald-400 font-black border border-emerald-500/20">
                    {res.evidenceStatus}
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Вимога ТД:</div>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">{res.tenderRequirement}</p>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">De Jure</div>
                        <div className={`text-[10px] font-black ${res.deJureStatus === 'COMPLIANT' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {res.deJureStatus === 'COMPLIANT' ? 'ВІДПОВІДАЄ' : 'РИЗИК'}
                        </div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">De Facto</div>
                        <div className={`text-[10px] font-black ${res.deFactoStatus === 'IN_HOUSE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {res.deFactoStatus === 'IN_HOUSE' ? 'В НАЯВНОСТІ' : 'ЧАСТКОВО'}
                        </div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-indigo-900/40">
                        <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Acquirable</div>
                        <div className="text-[10px] font-black text-indigo-300 font-mono">
                          {res.costToAcquireUah.toLocaleString()} ₴
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ACTION PLAN - Mobile Optimized List */}
      {activeTab === 'ACTION_PLAN' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Тактичний План Дій
              </h2>
              <p className="text-sm text-slate-400">
                Задачі адаптовані під режим: <strong>{systemMode}</strong>
              </p>
            </div>

            <div className="px-6 py-3 rounded-2xl bg-amber-500/10 text-amber-400 font-black text-xs uppercase tracking-widest border border-amber-500/20 flex items-center gap-2">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>Дедлайн через 48 год</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {tasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`group bg-slate-900 border rounded-3xl p-5 sm:p-6 transition-all cursor-pointer flex items-start gap-4 ${
                  task.isCompleted 
                    ? 'border-slate-800/50 opacity-50 grayscale' 
                    : task.priority === 'IMMEDIATE'
                    ? 'border-red-900/40 hover:border-red-500/40 bg-red-950/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`mt-1 min-w-[24px] h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                  task.isCompleted ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-950'
                }`}>
                  {task.isCompleted && <Check className="w-4 h-4" />}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className={`text-base font-black tracking-tight ${task.isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800 uppercase tracking-tighter">
                        {task.assigneeRole}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter ${
                        task.priority === 'IMMEDIATE' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {task.deadlineHoursRemaining}H LEFT
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed max-w-4xl">{task.description}</p>
                  
                  {!task.isCompleted && (
                    <div className="text-[11px] text-red-400/80 font-bold uppercase tracking-widest flex items-center gap-1.5 pt-1">
                      <ShieldAlert size={14} />
                      Ризик: {task.riskIfSkipped}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Tabs Placeholder - Same responsive pattern applies */}
      {['PRICE_STRATEGY', 'GANTT_FEASIBILITY', 'QA_CHECKLIST'].includes(activeTab) && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
           <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap size={32} />
           </div>
           <h3 className="text-xl font-black text-white">Розділ оптимізується...</h3>
           <p className="text-sm text-slate-400 max-w-md mx-auto">
             Цей підмодуль перекладається на нову responsive архітектуру для підтримки De Jure/De Facto моделей.
           </p>
        </div>
      )}

    </div>
  );
};
