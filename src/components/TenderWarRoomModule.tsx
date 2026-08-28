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
  Check,
  FileText
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
  onNavigateToDocuments: () => void;
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
  onNavigateToCollusion,
  onNavigateToDocuments
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

      {/* E2E Pipeline Status Tracker */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-[800px] px-4">
          {[
            { step: 1, label: 'Radar', status: 'COMPLETED', icon: Radar },
            { step: 2, label: 'Analysis', status: 'COMPLETED', icon: Search },
            { step: 3, label: 'Audit', status: 'COMPLETED', icon: ShieldAlert },
            { step: 4, label: 'Cost', status: 'IN_PROGRESS', icon: DollarSign },
            { step: 5, label: 'Documents', status: 'PENDING', icon: FileText },
            { step: 6, label: 'Pre-Submission', status: 'PENDING', icon: FileCheck2 },
          ].map((item, idx, arr) => (
            <React.Fragment key={item.step}>
              <div className="flex flex-col items-center gap-2 group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  item.status === 'COMPLETED' ? 'bg-emerald-500 text-slate-950' : 
                  item.status === 'IN_PROGRESS' ? 'bg-indigo-600 text-white animate-pulse' : 
                  'bg-slate-800 text-slate-500'
                }`}>
                  <item.icon size={18} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  item.status === 'COMPLETED' ? 'text-emerald-400' : 
                  item.status === 'IN_PROGRESS' ? 'text-indigo-400' : 
                  'text-slate-600'
                }`}>{item.label}</span>
              </div>
              {idx < arr.length - 1 && (
                <div className={`flex-1 h-px max-w-[60px] mx-2 ${
                  item.status === 'COMPLETED' ? 'bg-emerald-500/40' : 'bg-slate-800'
                }`} />
              )}
            </React.Fragment>
          ))}
          <div className="ml-8 pl-8 border-l border-slate-800 flex flex-col items-end">
             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Final Status</div>
             <div className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest border border-slate-700">
                Awaiting Audit
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div 
              onClick={onNavigateToDocuments}
              className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <FileText size={20} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-emerald-400 transition-all" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Документація</div>
                <div className="text-xl font-black text-white mt-1">Документи ТД</div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">AI Екстракція та аналіз</p>
              </div>
            </div>

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

      {/* TAB 6: QA CHECKLIST - Pre-Submission Audit */}
      {activeTab === 'QA_CHECKLIST' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
            <div className="space-y-1 relative z-10">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                Pre-Submission Audit (QA)
              </h2>
              <p className="text-sm text-slate-400">
                Фінальна перевірка пропозиції перед завантаженням у Prozorro.
              </p>
            </div>

            <button className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-950/40 transition-all flex items-center gap-2 relative z-10">
              <Zap size={16} />
              <span>READY TO SUBMIT</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                category: 'Юридична відповідність', 
                items: [
                  { label: 'Відсутність у санкційних списках', status: 'PASS', evidence: 'Скриншот РНБО від 20.08' },
                  { label: 'Стаття 17 (відсутність судимостей)', status: 'PASS', evidence: 'Довідка МВС №12345' },
                  { label: 'Повноваження підписанта', status: 'PASS', evidence: 'Наказ про призначення' }
                ]
              },
              { 
                category: 'Технічна частина', 
                items: [
                  { label: 'Повна відповідність BoQ', status: 'PASS', evidence: 'Звіт TenderAI BoQ Analyzer' },
                  { label: 'Сертифікати на матеріали', status: 'WARN', evidence: 'Відсутній сертифікат на бетон B25' },
                  { label: 'Гарантійні листи', status: 'PASS', evidence: 'Підписано КЕП' }
                ]
              },
              { 
                category: 'Кваліфікаційні критерії', 
                items: [
                  { label: 'Аналогічний досвід (3 договори)', status: 'PASS', evidence: 'Prozorro: UA-2023-...' },
                  { label: 'Наявність техніки', status: 'PASS', evidence: 'Техпаспорти + договори оренди' },
                  { label: 'Наявність працівників', status: 'PASS', evidence: 'Накази про прийняття' }
                ]
              },
              { 
                category: 'Фінансова частина', 
                items: [
                  { label: 'Тендерна гарантія', status: 'PASS', evidence: 'Банківська гарантія №789' },
                  { label: 'Довідка про відсутність заборгованості', status: 'PASS', evidence: 'ДПС: Витяг від 21.08' },
                  { label: 'Фінансова звітність за 2023', status: 'PASS', evidence: 'Баланс (ф. №1)' }
                ]
              }
            ].map((cat, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{cat.category}</h3>
                <div className="space-y-3">
                  {cat.items.map((item, i) => (
                    <div key={i} className="flex flex-col gap-2 p-4 bg-slate-950/50 border border-slate-800/50 rounded-2xl hover:border-slate-700 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{item.label}</span>
                        <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                          item.status === 'PASS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {item.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="p-1 rounded bg-slate-900 text-slate-500">
                          <Info size={12} />
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium italic truncate">{item.evidence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRICE STRATEGY */}
      {activeTab === 'PRICE_STRATEGY' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Аналіз Цін та Стратегія Подання (Cost & Margin Intelligence)
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
              Розрахунок трьох сценаріїв демпінгу та маржинальності з урахуванням прямих витрат, накладних, податків та ризику аномально низької ціни (АНЦ).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 'CONSERVATIVE',
                name: 'Консервативний сценарій',
                tagline: 'Максимальна маржа, мінімальний ризик дефіциту',
                priceUah: (currentTender.budgetUah || 10000000) * 0.96,
                discountPercent: 4.0,
                estimatedMarginUah: (currentTender.budgetUah || 10000000) * 0.16,
                estimatedMarginPercent: 16.0,
                riskDescription: 'Низька ймовірність перемоги при агресивних конкурентах',
                color: 'border-blue-500/40 text-blue-400'
              },
              {
                id: 'COMPETITIVE',
                name: 'Конкурентний (Оптимальний)',
                tagline: 'Баланс між перемогою та прибутком',
                priceUah: (currentTender.budgetUah || 10000000) * 0.915,
                discountPercent: 8.5,
                estimatedMarginUah: (currentTender.budgetUah || 10000000) * 0.115,
                estimatedMarginPercent: 11.5,
                riskDescription: 'Оптимальний баланс за історичною статистикою регіону',
                color: 'border-emerald-500/50 text-emerald-400'
              },
              {
                id: 'AGGRESSIVE',
                name: 'Агресивний прорив',
                tagline: 'Максимальний шанс виграшу з мінімальною маржею',
                priceUah: (currentTender.budgetUah || 10000000) * 0.86,
                discountPercent: 14.0,
                estimatedMarginUah: (currentTender.budgetUah || 10000000) * 0.06,
                estimatedMarginPercent: 6.0,
                riskDescription: 'Ризик запиту обґрунтування АНЦ згідно ст. 29 Закону',
                color: 'border-amber-500/40 text-amber-400'
              }
            ].map((scenario) => (
              <div 
                key={scenario.id}
                onClick={() => setSelectedScenarioId(scenario.id)}
                className={`bg-slate-900 border rounded-3xl p-6 space-y-5 cursor-pointer transition-all ${
                  selectedScenarioId === scenario.id 
                    ? `border-2 ${scenario.color} shadow-lg shadow-emerald-950/20 bg-slate-950/80` 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">{scenario.name}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                    selectedScenarioId === scenario.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {selectedScenarioId === scenario.id ? 'ВИБРАНО' : 'ОБРАТИ'}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Пропонована ціна</div>
                  <div className="text-2xl font-black text-white font-mono mt-0.5">
                    {Math.round(scenario.priceUah).toLocaleString()} ₴
                  </div>
                  <div className="text-xs font-bold text-amber-400 mt-1">
                    Знижка: -{scenario.discountPercent}% від очікуваної
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Прогнозований прибуток:</span>
                    <span className="font-mono font-bold text-emerald-400">{Math.round(scenario.estimatedMarginUah).toLocaleString()} ₴</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Чиста маржа:</span>
                    <span className="font-mono font-bold text-emerald-400">{scenario.estimatedMarginPercent}%</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 leading-snug">
                  <span className="font-bold text-slate-300">Ризик:</span> {scenario.riskDescription}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GANTT FEASIBILITY */}
      {activeTab === 'GANTT_FEASIBILITY' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Графік Виконання Робіт (Gantt & Feasibility Engine)
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
              Зіставлення нормативних строків виконання з доступними трудовими ресурсами та технікою компанії.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { id: 'g1', title: 'Підготовчі та демонтажні роботи', weeks: 'Тижні 1-2', crew: '1 бригада (4 робітники)', machinery: 'Самоскид 20т, Екскаватор', critical: true, feasible: true },
              { id: 'g2', title: 'Влаштування залізобетонних конструкцій', weeks: 'Тижні 3-6', crew: '2 бригади (10 робітників)', machinery: 'Автобетононасос, Вібратори', critical: true, feasible: true },
              { id: 'g3', title: 'Монтаж інженерних систем та вентиляції', weeks: 'Тижні 5-8', crew: '1 спец-бригада (4 чол)', machinery: 'Зварювальні пости, Підйомники', critical: false, feasible: true },
              { id: 'g4', title: 'Опоряджувальні та фінішні роботи', weeks: 'Тижні 7-10', crew: '2 бригади (8 робітників)', machinery: 'Штукатурні станції', critical: true, feasible: true },
              { id: 'g5', title: 'Пусконаладка та здача в експлуатацію', weeks: 'Тижні 10-12', crew: 'Інженерна група (3 чол)', machinery: 'Лабораторне обладнання', critical: true, feasible: true },
            ].map((g) => (
              <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{g.title}</span>
                    {g.critical && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[9px] font-black uppercase">
                        Критичний шлях
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>⏱ Строки: <strong className="text-slate-200">{g.weeks}</strong></span>
                    <span>👷 Бригада: <strong className="text-slate-200">{g.crew}</strong></span>
                    <span>🚜 Техніка: <strong className="text-slate-200">{g.machinery}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black rounded-xl">
                    ✓ РЕСУРСИ ПІДТВЕРДЖЕНО
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
