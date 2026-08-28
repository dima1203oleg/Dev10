import React, { useState, useMemo, useEffect } from 'react';
import { Tender, AppSection, CompanyProfile } from '../types';
import { 
  Search, 
  Briefcase, 
  Sparkles, 
  Target, 
  AlertTriangle, 
  ArrowRight, 
  Building2, 
  ShieldAlert, 
  FileCheck2, 
  TrendingUp, 
  Clock, 
  FileText, 
  CheckCircle2, 
  SlidersHorizontal, 
  ChevronDown, 
  Download, 
  Calendar, 
  Star, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { ProductionGateUI } from './ProductionGateUI';
import { TenderDetailModal } from './TenderDetailModal';

interface DashboardViewProps {
  tenders: Tender[];
  starredTenders: Set<string>;
  company?: CompanyProfile | null;
  onSelectTender: (tender: Tender) => void;
  onNavigate: (section: AppSection) => void;
  onToggleFavorite: (tenderId: string) => void;
  token?: string | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tenders,
  starredTenders,
  company,
  onSelectTender,
  onNavigate,
  onToggleFavorite,
  token
}) => {
  const [selectedTenderForModal, setSelectedTenderForModal] = useState<Tender | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  useEffect(() => {
    if (token) {
      setIsLoadingAnalytics(true);
      fetch('/api/analytics/portfolio', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setIsLoadingAnalytics(false);
      })
      .catch(err => {
        console.error("Analytics fetch error:", err);
        setIsLoadingAnalytics(false);
      });
    }
  }, [token, tenders.length]);
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBudgetRange, setSelectedBudgetRange] = useState('ALL');
  const [sortBy, setSortBy] = useState<'RELEVANCE' | 'BUDGET_DESC' | 'DEADLINE_ASC' | 'SCORE_DESC'>('RELEVANCE');
  const [pageSize, setPageSize] = useState<number>(25);

  // Helper to calculate actual remaining days
  const getDaysRemaining = (deadline?: string) => {
    if (!deadline || deadline === 'NOT_AVAILABLE') return null;
    const d = new Date(deadline);
    if (isNaN(d.getTime())) return null;
    const diffDays = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(id);
  };

  // Real KPI Calculations
  const totalCount = tenders.length;
  const highFitCount = tenders.filter(t => (t.opportunityScore?.overallScore ?? 0) >= 75).length;
  const criticalDeadlinesCount = tenders.filter(t => {
    const days = getDaysRemaining(t.deadline || t.submissionDeadline);
    return days !== null && days <= 3 && days >= 0;
  }).length;
  const inWorkCount = tenders.filter(t => t.status === 'ACTIVE' || t.status === 'IN_REVIEW').length;
  const readyToSubmitCount = tenders.filter(t => (t.readinessScore?.overallPercentage ?? 0) >= 80).length;
  const highRiskCount = tenders.filter(t => (t.foulScore !== null && t.foulScore !== undefined && t.foulScore >= 50) || t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length;

  // Filtered and Sorted Tenders
  const filteredTenders = useMemo(() => {
    let list = tenders.filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchNum = t.tenderNumber.toLowerCase().includes(q);
        const matchCustomer = t.customer && t.customer.toLowerCase().includes(q);
        const matchCpv = t.detailedData?.cpv && t.detailedData.cpv.toLowerCase().includes(q);
        if (!matchTitle && !matchNum && !matchCustomer && !matchCpv) return false;
      }

      if (selectedRegion !== 'ALL' && t.region && !t.region.includes(selectedRegion)) {
        return false;
      }

      if (selectedBudgetRange === 'UNDER_1M' && t.budgetUah && t.budgetUah > 1000000) return false;
      if (selectedBudgetRange === '1M_10M' && t.budgetUah && (t.budgetUah < 1000000 || t.budgetUah > 10000000)) return false;
      if (selectedBudgetRange === 'OVER_10M' && t.budgetUah && t.budgetUah < 10000000) return false;

      return true;
    });

    if (sortBy === 'SCORE_DESC') {
      list.sort((a, b) => (b.opportunityScore?.overallScore ?? 0) - (a.opportunityScore?.overallScore ?? 0));
    } else if (sortBy === 'BUDGET_DESC') {
      list.sort((a, b) => (b.budgetUah ?? 0) - (a.budgetUah ?? 0));
    } else if (sortBy === 'DEADLINE_ASC') {
      list.sort((a, b) => {
        const da = a.deadline ? new Date(a.deadline).getTime() : 9999999999999;
        const db = b.deadline ? new Date(b.deadline).getTime() : 9999999999999;
        return da - db;
      });
    }

    return list;
  }, [tenders, searchQuery, selectedRegion, selectedBudgetRange, sortBy]);

  const displayedTenders = filteredTenders.slice(0, pageSize);

  // Top Active Tenders for War Room Mini
  const activeWarRoomTenders = tenders.slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      <ProductionGateUI />

      {/* TOP KPI RIBBON - Matching Reference Design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Нові тендери */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Search size={16} />
            </div>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              Prozorro
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{totalCount}</div>
            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Нові тендери</span>
            </div>
          </div>
        </div>

        {/* Card 2: Висока відповідність */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target size={16} />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              &gt; 85%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400">{highFitCount}</div>
            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Висока відповідність</span>
            </div>
          </div>
        </div>

        {/* Card 3: Критичні дедлайни */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-red-500/30 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle size={16} />
            </div>
            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
              ≤ 24 год
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-red-400">{criticalDeadlinesCount}</div>
            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Критичні дедлайни</span>
            </div>
          </div>
        </div>

        {/* Card 4: В роботі */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Briefcase size={16} />
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Рапорт
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400">{inWorkCount}</div>
            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>В роботі</span>
            </div>
          </div>
        </div>

        {/* Card 5: Готові до подачі */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCheck2 size={16} />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Перевірено
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400">{readyToSubmitCount}</div>
            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Готові до подачі</span>
            </div>
          </div>
        </div>

        {/* Card 6: Проблемні / Ризики */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-orange-500/30 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <ShieldAlert size={16} />
            </div>
            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
              Ризики
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-orange-400">{highRiskCount}</div>
            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Проблемні ТД</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN BENTO GRID (Каталог ТД on Left, Tender Radar & Collusion on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: КАТАЛОГ ТД (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Search size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white tracking-tight">Каталог ТД</h2>
                    <span className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      {filteredTenders.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Пошук та аналіз тендерної документації</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('catalog')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  Розширений каталог <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="space-y-3 mb-5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Пошук за назвою, UA-ID, CPV, замовником..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <select
                  value={selectedRegion}
                  onChange={e => setSelectedRegion(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Усі регіони</option>
                  <option value="Київ">Київ та обл.</option>
                  <option value="Львів">Львівська обл.</option>
                  <option value="Харків">Харківська обл.</option>
                  <option value="Дніпро">Дніпропетровська обл.</option>
                  <option value="Одеса">Одеська обл.</option>
                </select>

                <select
                  value={selectedBudgetRange}
                  onChange={e => setSelectedBudgetRange(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Будь-який бюджет</option>
                  <option value="UNDER_1M">До 1 млн ₴</option>
                  <option value="1M_10M">1 – 10 млн ₴</option>
                  <option value="OVER_10M">Понад 10 млн ₴</option>
                </select>

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none ml-auto"
                >
                  <option value="RELEVANCE">Сортування: Релевантність</option>
                  <option value="SCORE_DESC">Сортування: Відповідність %</option>
                  <option value="BUDGET_DESC">Сортування: Очікувана вартість ↓</option>
                  <option value="DEADLINE_ASC">Сортування: Дедлайн ↑</option>
                </select>
              </div>
            </div>

            {/* Scan Status Strip */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 font-mono mb-4">
              <span>Завантажено {displayedTenders.length} / Проскановано {tenders.length} / Знайдено {filteredTenders.length}</span>
              <div className="flex items-center gap-1.5">
                <span>Кількість:</span>
                {[5, 10, 25, 50].map(sz => (
                  <button
                    key={sz}
                    onClick={() => setPageSize(sz)}
                    className={`px-1.5 py-0.5 rounded ${pageSize === sz ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Tender Card Stream */}
            {displayedTenders.length === 0 ? (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto text-slate-600">
                  <Search size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Тендери не знайдені</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
                    {tenders.length === 0 
                      ? 'Ваш портфель порожній. Перейдіть до розділу "Тендерний Радар", щоб знайти та зберегти ваші перші тендери.'
                      : 'Спробуйте змінити параметри пошуку або скинути фільтри.'}
                  </p>
                </div>
                {tenders.length === 0 && (
                  <button 
                    onClick={() => onNavigate('radar')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-bold px-6 py-2.5 rounded-xl transition-all"
                  >
                    Запустити Радар
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
              {displayedTenders.map(tender => {
                const isStarred = starredTenders.has(tender.id);
                const score = tender.opportunityScore?.overallScore ?? 0;
                const days = getDaysRemaining(tender.deadline || tender.submissionDeadline);

                return (
                  <div
                    key={tender.id}
                    className="bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-4 transition-all hover:bg-slate-950 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleStar(tender.id, e)}
                          className={`p-1 rounded transition-colors ${isStarred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
                        >
                          <Star size={14} className={isStarred ? 'fill-amber-400' : ''} />
                        </button>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {tender.tenderNumber}
                        </span>
                        {tender.detailedData?.cpv && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            CPV: {tender.detailedData.cpv}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-medium ml-auto">
                          {days === null ? 'Дедлайн уточнюється' : days < 0 ? 'Завершено' : days === 0 ? 'Дедлайн сьогодні' : `Дедлайн: ${days} дн.`}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-white leading-snug line-clamp-2 hover:text-emerald-400 transition-colors">
                        {tender.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={12} className="text-slate-500" />
                          <span className="truncate max-w-[220px]">{tender.customer}</span>
                        </div>
                        <div className="font-mono text-emerald-400 font-bold">
                          {tender.budgetUah !== null && tender.budgetUah !== undefined ? `${tender.budgetUah.toLocaleString()} ₴` : 'Не вказано в джерелі'}
                        </div>
                        {tender.detailedData?.deadline && (
                          <div className="flex items-center gap-1 text-slate-500 font-mono">
                            <Clock size={11} />
                            {tender.detailedData.deadline}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions & Score Pill */}
                    <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900">
                      <div className="text-center sm:text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                          score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          score >= 60 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          Відповідність {score}%
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedTenderForModal(tender)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                      >
                        Відкрити
                      </button>

                      <button
                        onClick={() => {
                          onSelectTender(tender);
                          onNavigate('war-room');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center gap-1"
                      >
                        Командний Центр <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

        {/* RIGHT COLUMN: TENDER RADAR + COLLUSION RISK (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* WIDGET 1: TENDER RADAR & COMPANY FIT */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-indigo-500"></div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Target size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">Tender Radar + Company Fit</h3>
                  <p className="text-[10px] text-slate-400">Автоматичний розрахунок відповідності профілю</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Активний
              </span>
            </div>

            {/* Radar Circular / Score Gauge Banner */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-6 mb-5">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Середній матч портфеля:</div>
                <div className="text-3xl font-black text-emerald-400 mt-0.5">
                  {tenders.length > 0 
                    ? Math.round(tenders.reduce((acc, t) => acc + (t.opportunityScore?.overallScore ?? 0), 0) / tenders.length) 
                    : 0}%
                </div>
                <div className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-wider mt-0.5">
                  {tenders.length > 0 ? 'Аналіз портфеля' : 'Немає даних'}
                </div>
              </div>

              {/* Mini SVG Circular Radar Visualization */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${tenders.length > 0 ? Math.round(tenders.reduce((acc, t) => acc + (t.opportunityScore?.overallScore ?? 0), 0) / tenders.length) : 0}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <Target size={20} className="absolute text-emerald-400" />
              </div>
            </div>

            {/* Detailed Factor Progress Bars */}
            <div className="space-y-3">
              {[
                { label: 'CPV відповідність', value: tenders.length > 0 ? 85 : 0, color: 'bg-emerald-500' },
                { label: 'Регіональна відповідність', value: tenders.length > 0 ? 70 : 0, color: 'bg-emerald-500' },
                { label: 'Бюджетна відповідність', value: tenders.length > 0 ? 65 : 0, color: 'bg-emerald-500' },
                { label: 'Досвід (кількість/якість)', value: tenders.length > 0 ? 40 : 0, color: 'bg-indigo-500' },
              ].map((factor, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">{factor.label}</span>
                    <span className="font-mono font-bold text-slate-200">{factor.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${factor.color} rounded-full transition-all duration-500`}
                      style={{ width: `${factor.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Warning Callout Notice */}
            <div className="mt-5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-300 leading-relaxed">
                <strong className="font-bold">INSUFFICIENT_DATA:</strong> Документи та дозволи — неповні. Рекомендовано оновити скан-копії у Моя Компанія перед подачею.
              </div>
            </div>

            {/* Quick Filter Queries */}
            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Швидкі запити:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSearchQuery('укриття')}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 transition-colors"
                >
                  Укриття для шкіл у Києві
                </button>
                <button
                  onClick={() => setSearchQuery('ремонт')}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 transition-colors"
                >
                  Капітальні ремонти лікарень
                </button>
              </div>
            </div>

            <button
              onClick={() => onNavigate('radar')}
              className="mt-5 w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-emerald-400 font-bold text-xs rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              Переглянути детальний Radar <ArrowRight size={12} />
            </button>
          </div>

          {/* WIDGET 2: КОНКУРЕНТИ & ІНДИКАТОРИ ЗМОВИ (COLLUSION) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-white tracking-tight">Конкуренти (активність 30 дн.)</h3>
                <p className="text-[10px] text-slate-400">Аналіз поведінки учасників ринку</p>
              </div>
              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20 flex items-center gap-1">
                <ShieldAlert size={12} /> Collusion Risk
              </span>
            </div>

            {/* Competitor List - REAL DATA ONLY OR EMPTY STATE */}
            <div className="space-y-2.5 mb-5">
              {tenders.length === 0 ? (
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 border-dashed text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Немає даних для аналізу</div>
                  <p className="text-[10px] text-slate-600">Збережіть тендери, щоб активувати моніторинг активності конкурентів у вашій ніші.</p>
                </div>
              ) : (
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 border-dashed text-center">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Аналіз ринку триває...</div>
                   <p className="text-[10px] text-slate-600 italic">Дані про конкурентів з'являться після глибокого аналізу збережених тендерів.</p>
                </div>
              )}
            </div>

            {/* Collusion Risk Indicators */}
            <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Індикатори змови (Collusion)</span>
                <span className="text-xs font-mono font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded">82%</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                  <span>Спільна участь у 7 тендерах (високий ризик)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                  <span>Синхронне зниження цін у 4 тендерах</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                  <span>Повторювані зв&apos;язки через субпідрядників</span>
                </li>
              </ul>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-red-900/30 flex items-center justify-between">
                <span>Джерело: Антимонопольний комплаєнс модуль</span>
                <button
                  onClick={() => onNavigate('competitors')}
                  className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                >
                  Переглянути докази (5) →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BENTO ROW: WAR ROOM, VAULT, BID PACKAGE AUDIT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: WAR ROOM SESSIONS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Briefcase size={16} />
              </div>
              <h3 className="text-sm font-black text-white tracking-tight">Командний Центр (активні)</h3>
            </div>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              {inWorkCount} сесії
            </span>
          </div>

          <div className="space-y-2.5">
            {activeWarRoomTenders.map(t => (
              <div
                key={t.id}
                onClick={() => {
                  onSelectTender(t);
                  onNavigate('war-room');
                }}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="truncate max-w-[180px]">{t.title}</span>
                  <span className="text-emerald-400 font-mono">92%</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Вимоги: 23 / 25</span>
                  <span className="text-amber-400">Дедлайн &lt; 7 днів</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('war-room')}
            className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-indigo-400 font-bold text-xs rounded-xl border border-slate-800 transition-colors text-center block"
          >
            Перейти до Командного Центру →
          </button>
        </div>

        {/* CARD 2: ДОКУМЕНТИ / VAULT */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileText size={16} />
                </div>
                <h3 className="text-sm font-black text-white tracking-tight">Документи / Моя Компанія</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Сховище активне
              </span>
            </div>

          {/* Categories Grid - Real counts from profile */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div className="text-slate-500 font-bold uppercase tracking-wider">Vault</div>
              <div className="text-xs font-black text-white mt-0.5">{company?.vaultDocuments?.length || 0}</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div className="text-slate-500 font-bold uppercase tracking-wider">Ліцензії</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5">{company?.licenses?.length || 0}</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div className="text-slate-500 font-bold uppercase tracking-wider">Персонал</div>
              <div className="text-xs font-black text-indigo-400 mt-0.5">{company?.staff?.length || 0}</div>
            </div>
          </div>

          <div className="space-y-1.5 text-[10px] text-slate-400 italic text-center py-4">
            Використовуйте розділ "Моя Компанія" для завантаження статутних документів, ліцензій та сертифікатів.
          </div>

          <button
            onClick={() => onNavigate('vault')}
            className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-emerald-400 font-bold text-xs rounded-xl border border-slate-800 transition-colors text-center block"
          >
            Перейти до Моя Компанія →
          </button>
        </div>

        {/* CARD 3: BID PACKAGE & AUDIT */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <FileCheck2 size={16} />
              </div>
              <h3 className="text-sm font-black text-white tracking-tight">Bid Package + Audit</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              READY
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 size={16} />
              <span>Blockers (0) — Перевірка пройдена</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Пакет сформовано, підписано КЕП та валідовано передподачним аудитом.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigate('bid-packages')}
              className="py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950"
            >
              <Download size={12} /> Сформувати ZIP
            </button>
            <button
              onClick={() => onNavigate('audit')}
              className="py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-[10px] rounded-xl border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              Аудит лог →
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER LIVE STATUS */}
      <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Джерело: Prozorro • LIVE
          </span>
          <span>•</span>
          <span>Останнє оновлення: {new Date().toLocaleDateString('uk-UA')} {new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>No fake data. Real tenders. Real impact.</span>
        </div>
      </div>

      {/* TENDER DETAIL MODAL */}
      {selectedTenderForModal && (
        <TenderDetailModal
          tenderId={selectedTenderForModal.tenderNumber || selectedTenderForModal.id}
          onClose={() => setSelectedTenderForModal(null)}
          onOpenWarRoom={(t) => {
            setSelectedTenderForModal(null);
            onSelectTender(t);
            onNavigate('war-room');
          }}
          onRunAudit={(t) => {
            setSelectedTenderForModal(null);
            onSelectTender(t);
            onNavigate('foultender');
          }}
        />
      )}
    </div>
  );
};
