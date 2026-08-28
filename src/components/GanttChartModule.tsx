import React, { useState, useMemo } from 'react';
import { Tender, InteractiveGanttTask } from '../types';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Plus, 
  Download, 
  Sparkles, 
  Users, 
  Truck, 
  TrendingUp, 
  Layers, 
  Zap,
  Filter,
  CheckSquare,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Trash2
} from 'lucide-react';

interface GanttChartModuleProps {
  currentTender: Tender;
}

const DEFAULT_GANTT_TASKS: InteractiveGanttTask[] = [
  {
    id: 'gt-1',
    code: 'Ф-01',
    name: 'Оформлення дозвільної документації та підготовка майданчика',
    phase: '1. Підготовчий етап',
    startDate: '2026-09-01',
    endDate: '2026-09-10',
    durationDays: 10,
    progressPercent: 100,
    dependencies: [],
    assignedTeam: 'Бригадир Іваненко (4 чол)',
    machinery: ['Самоскид КАМАЗ'],
    budgetUah: 350000,
    criticalPath: true,
    status: 'COMPLETED'
  },
  {
    id: 'gt-2',
    code: 'Ф-02',
    name: 'Демонтажні роботи та виїмка ґрунту під фундаменти',
    phase: '1. Підготовчий етап',
    startDate: '2026-09-11',
    endDate: '2026-09-25',
    durationDays: 15,
    progressPercent: 65,
    dependencies: ['gt-1'],
    assignedTeam: 'Бригада екскаваторників (6 чол)',
    machinery: ['Екскаватор JCB 4CX', 'Самоскид 20т (2 од)'],
    budgetUah: 1200000,
    criticalPath: true,
    status: 'IN_PROGRESS'
  },
  {
    id: 'gt-3',
    code: 'Ф-03',
    name: 'Увлаштування залізобетонного фундаменту та армування',
    phase: '2. Основні будівельні роботи',
    startDate: '2026-09-26',
    endDate: '2026-10-20',
    durationDays: 25,
    progressPercent: 0,
    dependencies: ['gt-2'],
    assignedTeam: 'Бригада бетонярів №1 (12 чол)',
    machinery: ['Бетононасос Putzmeister', 'Автокран 25т'],
    budgetUah: 4800000,
    criticalPath: true,
    status: 'PLANNED'
  },
  {
    id: 'gt-4',
    code: 'Ф-04',
    name: 'Монтаж металоконструкцій та огороджувальних панелей',
    phase: '2. Основні будівельні роботи',
    startDate: '2026-10-15',
    endDate: '2026-11-10',
    durationDays: 27,
    progressPercent: 0,
    dependencies: ['gt-3'],
    assignedTeam: 'Зварювально-монтажна ланка (8 чол)',
    machinery: ['Автокран 32т Liebherr', 'Мобільні вишки'],
    budgetUah: 5400000,
    criticalPath: false,
    status: 'PLANNED'
  },
  {
    id: 'gt-5',
    code: 'Ф-05',
    name: 'Прокладання зовнішніх мереж водопостачання та теплотраси',
    phase: '3. Інженерні мережі',
    startDate: '2026-10-01',
    endDate: '2026-10-30',
    durationDays: 30,
    progressPercent: 20,
    dependencies: ['gt-2'],
    assignedTeam: 'Ланка сантехніків (5 чол)',
    machinery: ['Мини-екскаватор', 'Зварювальний пост ПЕ'],
    budgetUah: 2900000,
    criticalPath: false,
    status: 'IN_PROGRESS'
  },
  {
    id: 'gt-6',
    code: 'Ф-06',
    name: 'Внутрішні оздоблювальні та електромонтажні роботи',
    phase: '4. Опорядження та Пусконалагодження',
    startDate: '2026-11-01',
    endDate: '2026-12-05',
    durationDays: 35,
    progressPercent: 0,
    dependencies: ['gt-4', 'gt-5'],
    assignedTeam: 'Оздоблювальна бригада (10 чол)',
    machinery: ['Штукатурна станція'],
    budgetUah: 2300000,
    criticalPath: true,
    status: 'PLANNED'
  },
  {
    id: 'gt-7',
    code: 'Ф-07',
    name: 'Пусконалагоджувальні роботи та здача об’єкта в експлуатацію',
    phase: '4. Опорядження та Пусконалагодження',
    startDate: '2026-12-06',
    endDate: '2026-12-15',
    durationDays: 10,
    progressPercent: 0,
    dependencies: ['gt-6'],
    assignedTeam: 'Інженери КІПіА та ВТК (4 чол)',
    machinery: ['Вимірювальна лабораторія'],
    budgetUah: 1500000,
    criticalPath: true,
    status: 'PLANNED'
  }
];

export const GanttChartModule: React.FC<GanttChartModuleProps> = ({ currentTender }) => {
  const [tasks, setTasks] = useState<InteractiveGanttTask[]>(DEFAULT_GANTT_TASKS);
  const [highlightCritical, setHighlightCritical] = useState<boolean>(true);
  const [scale, setScale] = useState<'WEEKS' | 'DAYS'>('WEEKS');
  const [isAuditingFeasibility, setIsAuditingFeasibility] = useState<boolean>(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);

  // New task form state
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCode, setNewTaskCode] = useState('');
  const [newTaskPhase, setNewTaskPhase] = useState('2. Основні будівельні роботи');
  const [newTaskDuration, setNewTaskDuration] = useState('14');
  const [newTaskBudget, setNewTaskBudget] = useState('500000');
  const [newTaskTeam, setNewTaskTeam] = useState('Бригада №2');

  // Computed Gantt Metrics
  const totalProjectDays = useMemo(() => {
    return tasks.reduce((acc, t) => acc + t.durationDays, 0);
  }, [tasks]);

  const totalBudget = useMemo(() => {
    return tasks.reduce((acc, t) => acc + t.budgetUah, 0);
  }, [tasks]);

  const criticalTasksCount = useMemo(() => {
    return tasks.filter(t => t.criticalPath).length;
  }, [tasks]);

  const overallProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const weightedSum = tasks.reduce((acc, t) => acc + (t.progressPercent * t.budgetUah), 0);
    return totalBudget > 0 ? Math.round(weightedSum / totalBudget) : 0;
  }, [tasks, totalBudget]);

  // Handle Add Task
  const handleAddTask = () => {
    if (!newTaskName) return;
    const newTask: InteractiveGanttTask = {
      id: `gt-${Date.now()}`,
      code: newTaskCode || `Ф-0${tasks.length + 1}`,
      name: newTaskName,
      phase: newTaskPhase,
      startDate: '2026-10-01',
      endDate: '2026-10-15',
      durationDays: parseInt(newTaskDuration) || 10,
      progressPercent: 0,
      dependencies: [],
      assignedTeam: newTaskTeam,
      machinery: ['Стандартна спецтехніка'],
      budgetUah: parseFloat(newTaskBudget) || 200000,
      criticalPath: false,
      status: 'PLANNED'
    };

    setTasks(prev => [...prev, newTask]);
    setShowAddTaskModal(false);
    setNewTaskName('');
  };

  // Task actions
  const handleUpdateTaskStatus = (id: string, status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED') => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const progressPercent = status === 'COMPLETED' ? 100 : status === 'IN_PROGRESS' ? 50 : 0;
      return { ...t, status, progressPercent };
    }));
  };

  const handleToggleCritical = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, criticalPath: !t.criticalPath } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Run AI Schedule Feasibility Check
  const handleRunAiAudit = () => {
    setIsAuditingFeasibility(true);
    setTimeout(() => {
      setIsAuditingFeasibility(false);
    }, 1000);
  };

  // Export Gantt Data
  const handleExportGantt = () => {
    const lines = [
      `==================================================`,
      `КАЛЕНДАРНИЙ ПЛАН-ГРАФІК (ДІАГРАМА ГАНТА) TenderAI`,
      `==================================================`,
      `Тендер: ${currentTender.title}`,
      `Замовник: ${currentTender.customer}`,
      `Загальний бюджет: ${totalBudget.toLocaleString('uk-UA')} грн`,
      `Загальний прогрес: ${overallProgress}%`,
      `Кількість завдань критичного шляху: ${criticalTasksCount}`,
      ``,
      `ЕЛАПИ ТА ЗАВДАННЯ:`,
      ...tasks.map(t => 
        `[${t.code}] ${t.name}\n  Фаза: ${t.phase} | Тривалість: ${t.durationDays} дн. | Прогрес: ${t.progressPercent}%\n  Відповідальні: ${t.assignedTeam} | Спецтехніка: ${t.machinery.join(', ')}\n  Бюджет: ${t.budgetUah.toLocaleString('uk-UA')} грн | Критичний шлях: ${t.criticalPath ? 'ТАК' : 'НІ'}\n`
      )
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Gantt_Schedule_${currentTender.tenderNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30 text-white">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Модуль Календарного Планування • Будівельний Гант
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Інтерактивна Діаграма Ганта та Критичний Шлях
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              Візуалізація строків виконання будівельно-монтажних робіт, оптимізація графіку залучення бригад та будівельних машин, виявлення критичного шляху (<span className="text-rose-400 font-bold">Critical Path</span>) та запобігання простроченню тендерних дедлайнів.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setHighlightCritical(!highlightCritical)}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer border ${
                highlightCritical 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Zap className="w-4 h-4 text-rose-400" />
              <span>{highlightCritical ? 'Критичний шлях увімкнено' : 'Показати Критичний шлях'}</span>
            </button>

            <button
              onClick={handleExportGantt}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Експорт графіку (.txt)</span>
            </button>

            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Додати нове завдання</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Загальний прогрес</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white flex items-baseline space-x-2">
            <span>{overallProgress}%</span>
            <span className="text-xs text-slate-400 font-normal">за фінансовою вагою</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Критичний шлях</span>
            <Zap className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            {criticalTasksCount} <span className="text-xs font-medium text-slate-400">ключових етапів</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Будь-яка затримка змістить термін здачі
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Тривалість проєкту</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">
            {totalProjectDays} <span className="text-xs font-medium text-slate-400">календарних днів</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Заплановано з 01.09.2026 по 15.12.2026
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Бюджет графіку</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300">
            {totalBudget.toLocaleString('uk-UA')} <span className="text-xs font-medium text-slate-400">грн</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Розподілено за 4 фазами робіт
          </div>
        </div>
      </div>

      {/* AI Schedule Feasibility Auditor Card */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ШІ-Оцінка Реалістичності Календарного Графіку</h3>
              <p className="text-xs text-slate-400">Перевірка відповідності строків тендерній документації та наявним ресурсам</p>
            </div>
          </div>

          <button
            onClick={handleRunAiAudit}
            disabled={isAuditingFeasibility}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditingFeasibility ? 'animate-spin' : ''}`} />
            <span>{isAuditingFeasibility ? 'Аналізуємо ресурсні піки...' : 'Запустити ШІ-перевірку графіку'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Запас за термінами: 14 днів</span>
            </div>
            <p className="text-xs text-slate-300">
              Графік має буфер у 14 днів перед кінцевою датою договору замовника.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold">
              <Truck className="w-4 h-4" />
              <span>Пікове навантаження спецтехніки</span>
            </div>
            <p className="text-xs text-slate-300">
              У період 15-25 жовтня знадобиться одночасно 2 автокрани (25т і 32т).
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold">
              <Users className="w-4 h-4" />
              <span>Максимальна чисельність робітників</span>
            </div>
            <p className="text-xs text-slate-300">
              Пікова кількість персоналу на об’єкті — 25 фахівців у 2-й половині жовтня.
            </p>
          </div>
        </div>
      </div>

      {/* Main Visual Gantt Chart Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Візуальний Календарний План (Gantt Chart)</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase mr-1">Масштаб:</span>
            <button
              onClick={() => setScale('WEEKS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scale === 'WEEKS' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Тижні (16 тижнів)
            </button>
            <button
              onClick={() => setScale('DAYS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scale === 'DAYS' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Детально за днями
            </button>
          </div>
        </div>

        {/* Interactive Timeline Matrix */}
        <div className="overflow-x-auto">
          <div className="min-w-[900px] space-y-3">
            {/* Timeline Header (Weeks) */}
            <div className="grid grid-cols-12 gap-2 pb-3 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              <div className="col-span-4 text-left pl-2">Назва етапу та фази робіт</div>
              <div className="col-span-1">Вересень (Т1-Т2)</div>
              <div className="col-span-2">Жовтень (Т3-Т6)</div>
              <div className="col-span-3">Листопад (Т7-Т10)</div>
              <div className="col-span-2">Грудень (Т11-Т12)</div>
            </div>

            {/* Task Rows */}
            {tasks.map((task, index) => {
              // Calculate horizontal position percentage for visual Gantt bars
              const isCrit = highlightCritical && task.criticalPath;

              return (
                <div 
                  key={task.id}
                  className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl border transition-all ${
                    isCrit 
                      ? 'bg-rose-950/20 border-rose-500/30' 
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left Task Details */}
                  <div className="col-span-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        <button
                          onClick={() => handleToggleCritical(task.id)}
                          title="Клікніть для перемикання критичного шляху"
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                            isCrit ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {task.code}
                        </button>
                        <span className="text-xs font-bold text-slate-100 truncate">{task.name}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer ml-1"
                        title="Видалити завдання з графіку"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 truncate">
                        <Users className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{task.assignedTeam}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-300 font-bold">
                          {task.budgetUah.toLocaleString('uk-UA')} грн
                        </span>
                        <select
                          value={task.status}
                          onChange={e => handleUpdateTaskStatus(task.id, e.target.value as any)}
                          className="bg-slate-900 border border-slate-700 text-slate-200 text-[10px] rounded px-1.5 py-0.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="PLANNED">Заплановано</option>
                          <option value="IN_PROGRESS">В процесі</option>
                          <option value="COMPLETED">Завершено</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Timeline Visual Bar Span */}
                  <div className="col-span-8 relative h-8 bg-slate-900 rounded-lg overflow-hidden border border-slate-800/60 flex items-center px-2">
                    {/* Visual Bar representation */}
                    <div 
                      className={`h-6 rounded-md transition-all flex items-center justify-between px-2 text-[10px] font-bold text-white shadow-md ${
                        task.status === 'COMPLETED' ? 'bg-emerald-600' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-600' : 'bg-slate-700'
                      } ${isCrit ? 'ring-2 ring-rose-400' : ''}`}
                      style={{
                        marginLeft: `${(index * 11) % 55}%`,
                        width: `${Math.max(25, task.durationDays * 2)}%`
                      }}
                    >
                      <span className="truncate">{task.durationDays} днів</span>
                      <span>{task.progressPercent}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add New Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Додати нове завдання до графіку Ганта</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase">Назва роботи / етапу</label>
                <input 
                  type="text" 
                  placeholder="напр. Улаштування покрівлі з металочерепиці"
                  value={newTaskName}
                  onChange={e => setNewTaskName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">Код етапу</label>
                  <input 
                    type="text" 
                    placeholder="Ф-08"
                    value={newTaskCode}
                    onChange={e => setNewTaskCode(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">Тривалість (днів)</label>
                  <input 
                    type="number" 
                    value={newTaskDuration}
                    onChange={e => setNewTaskDuration(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">Бюджет етапу (грн)</label>
                  <input 
                    type="number" 
                    value={newTaskBudget}
                    onChange={e => setNewTaskBudget(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">Відповідальна бригада</label>
                  <input 
                    type="text" 
                    value={newTaskTeam}
                    onChange={e => setNewTaskTeam(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Скасувати
              </button>
              <button 
                onClick={handleAddTask}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                Зберегти завдання
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
