import React, { useState, useMemo } from 'react';
import { Tender, CompanyProfile, BidDecision } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useProzorroSearch } from '../hooks/useProzorroSearch';
import { TenderDetailModal } from './TenderDetailModal';
import { 
  Radar, 
  Sparkles, 
  TrendingUp, 
  Search, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  SlidersHorizontal,
  Flame, 
  Clock, 
  ShieldAlert, 
  FileCheck2, 
  Scale, 
  DollarSign, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  Download, 
  FileText,
  RefreshCw,
  Trophy,
  Archive,
  X,
  Filter,
  MapPin,
  Tag,
  Layers,
  Check,
  ArrowUpDown,
  Zap,
  Calendar,
  Building,
  RotateCcw
} from 'lucide-react';
import {
  CPV_CATEGORIES,
  QUICK_CLUSTER_FILTERS,
  UKRAINE_REGIONS,
  LIFECYCLE_TABS,
  SUB_STATUS_OPTIONS,
  BUDGET_PRESETS,
  DEADLINE_PRESETS,
  RISK_FILTER_OPTIONS,
  SORT_OPTIONS,
  LifecycleStage,
  getTenderLifecycleStage,
  matchesLifecycleFilter,
  getTenderStatusBadge
} from '../utils/filterConstants';

interface TenderRadarModuleProps {
  tenders: Tender[];
  company: CompanyProfile;
  onSelectTender: (tender: Tender) => void;
  onNavigateToWarRoom: (tender: Tender) => void;
}

export const TenderRadarModule: React.FC<TenderRadarModuleProps> = ({
  tenders: dbTenders,
  company,
  onSelectTender,
  onNavigateToWarRoom
}) => {
  const { token } = useAuth();
  
  // Use unified search hook
  const {
    isSearching,
    hasMore,
    results: searchResults,
    telemetry: searchTelemetry,
    error: searchError,
    search: runSearch
  } = useProzorroSearch();

  // Search & Prompt State
  const [searchQuery, setSearchQuery] = useState('');
  const [nlPrompt, setNlPrompt] = useState('');
  
  // Lifecycle Filter State: ALL, NEW_ACTIVE, WON_AWARDED, RETENDERED_CANCELLED, OLD_COMPLETED
  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage>('ALL');
  
  // Category & Cluster Filters
  const [selectedCluster, setSelectedCluster] = useState<string>('ALL');
  const [selectedCpvCode, setSelectedCpvCode] = useState<string>('ALL');
  
  // Sub-status & Decision
  const [selectedSubStatus, setSelectedSubStatus] = useState<string>('ALL');
  const [selectedDecision, setSelectedDecision] = useState<string>('ALL');
  
  // Region & Location
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  
  // Budget & Presets
  const [budgetPresetIdx, setBudgetPresetIdx] = useState<number>(0);
  const [minBudget, setMinBudget] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(1000000000);
  
  // Risk & Deadlines & Match
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedDeadline, setSelectedDeadline] = useState<string>('ALL');
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  
  // Sorting
  const [sortBy, setSortBy] = useState<string>('match_desc');
  
  // Drawer / UI State
  const [showPowerFilters, setShowPowerFilters] = useState<boolean>(false);
  const [expandedWhyTenderId, setExpandedWhyTenderId] = useState<string | null>(null);
  const [activeModalTenderId, setActiveModalTenderId] = useState<string | null>(null);

  // Combine DB tenders and Search results
  const allTenders = useMemo(() => {
    const combined = [...dbTenders, ...searchResults];
    return Array.from(new Map(combined.map(t => [t.id, t])).values());
  }, [dbTenders, searchResults]);

  const isUsableProfileValue = (value?: string | null) => {
    if (!value) return false;
    const normalized = value.trim().toUpperCase();
    return normalized !== 'ПРОФІЛЬ_ВІДСУТНІЙ' && normalized !== 'NOT_AVAILABLE' && normalized !== 'UNKNOWN';
  };

  const firstUsable = (values?: string[]) => values?.find(isUsableProfileValue);
  const getConfirmedScore = (tender: Tender) => tender.opportunityScore?.overallScore ?? tender.fitScore ?? null;
  const getConfirmedDecision = (tender: Tender) => tender.opportunityScore?.bidDecision
    ?? (tender.foulScore != null && tender.foulScore > 60 ? 'NO_BID' : 'UNKNOWN');

  // Auto-trigger radar on mount or profile change
  React.useEffect(() => {
    const profileWorkTypes = company.typesOfWork?.filter(isUsableProfileValue) || [];
    const profileCpvCodes = company.cpvCodes?.filter(isUsableProfileValue) || [];
    const initialPrompt = 
      profileWorkTypes.length > 0 ? profileWorkTypes.join(' ') :
      profileCpvCodes.length > 0 ? profileCpvCodes.join(', ') :
      '';
      
    handleApplyNlPrompt(initialPrompt);
  }, [company.id]);

  const handleApplyNlPrompt = async (prompt: string, isAppend = false) => {
    if (!isAppend) setNlPrompt(prompt);
    runSearch(prompt, isAppend, {
      sort: 'relevance',
      limit: 30,
      filters: {
        minBudget: minBudget > 0 ? minBudget : undefined,
        maxBudget: maxBudget < 1000000000 ? maxBudget : undefined,
        region: selectedRegion !== 'ALL' && selectedRegion !== 'Всі регіони України' ? selectedRegion : firstUsable(company.regionsOfWork),
        cpv: selectedCpvCode !== 'ALL' ? selectedCpvCode : firstUsable(company.cpvCodes)
      }
    });
  };

  const handleLoadMore = () => {
    if (hasMore) {
      handleApplyNlPrompt(nlPrompt, true);
    }
  };

  // Preset budget click
  const handleSelectBudgetPreset = (index: number) => {
    setBudgetPresetIdx(index);
    const preset = BUDGET_PRESETS[index];
    setMinBudget(preset.min);
    setMaxBudget(preset.max);
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearchQuery('');
    setLifecycleStage('ALL');
    setSelectedCluster('ALL');
    setSelectedCpvCode('ALL');
    setSelectedSubStatus('ALL');
    setSelectedDecision('ALL');
    setSelectedRegion('ALL');
    setBudgetPresetIdx(0);
    setMinBudget(0);
    setMaxBudget(1000000000);
    setSelectedRisk('ALL');
    setSelectedDeadline('ALL');
    setMinMatchScore(0);
    setSortBy('match_desc');
  };

  // Active filter count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (lifecycleStage !== 'ALL') count++;
    if (selectedCluster !== 'ALL') count++;
    if (selectedCpvCode !== 'ALL') count++;
    if (selectedSubStatus !== 'ALL') count++;
    if (selectedDecision !== 'ALL') count++;
    if (selectedRegion !== 'ALL' && selectedRegion !== 'Всі регіони України') count++;
    if (budgetPresetIdx !== 0 || minBudget > 0 || maxBudget < 1000000000) count++;
    if (selectedRisk !== 'ALL') count++;
    if (selectedDeadline !== 'ALL') count++;
    if (minMatchScore > 0) count++;
    if (sortBy !== 'match_desc') count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [
    lifecycleStage,
    selectedCluster,
    selectedCpvCode,
    selectedSubStatus,
    selectedDecision,
    selectedRegion,
    budgetPresetIdx,
    minBudget,
    maxBudget,
    selectedRisk,
    selectedDeadline,
    minMatchScore,
    sortBy,
    searchQuery
  ]);

  // Stage-based counts for tabs
  const stageCounts = useMemo(() => {
    const counts = {
      ALL: allTenders.length,
      NEW_ACTIVE: 0,
      WON_AWARDED: 0,
      RETENDERED_CANCELLED: 0,
      OLD_COMPLETED: 0
    };

    allTenders.forEach(t => {
      const stage = getTenderLifecycleStage(t);
      if (counts[stage] !== undefined) {
        counts[stage]++;
      }
    });

    return counts;
  }, [allTenders]);

  // Comprehensive Filtering & Sorting Logic
  const filteredTenders = useMemo(() => {
    const result = allTenders.filter(tender => {
      // 1. Search Query filter (Title, Number, Customer, City, Region, Category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          tender.title.toLowerCase().includes(q) ||
          tender.customer.toLowerCase().includes(q) ||
          tender.tenderNumber.toLowerCase().includes(q) ||
          tender.region.toLowerCase().includes(q) ||
          tender.customerCity.toLowerCase().includes(q) ||
          tender.category.toLowerCase().includes(q) ||
          (tender.dk021Code && tender.dk021Code.includes(q)) ||
          tender.customerEdrpou.includes(q);
        if (!matchesQuery) return false;
      }

      // 2. Lifecycle Stage Filter (All, New/Active, Won/Awarded, Retendered, Old/Completed)
      if (!matchesLifecycleFilter(tender, lifecycleStage)) {
        return false;
      }

      // 3. Sub-status Filter
      if (selectedSubStatus !== 'ALL') {
        const raw = (tender.rawStatus || tender.status || '').toLowerCase();
        if (selectedSubStatus === 'AMCU_FILED') {
          if (tender.status !== 'AMCU_FILED' && !raw.includes('amcu')) return false;
        } else if (!raw.includes(selectedSubStatus.toLowerCase()) && tender.status !== selectedSubStatus) {
          return false;
        }
      }

      // 4. Quick Cluster Filter
      if (selectedCluster !== 'ALL') {
        const cluster = QUICK_CLUSTER_FILTERS.find(c => c.id === selectedCluster);
        if (cluster) {
          const tText = `${tender.title} ${tender.category} ${tender.summary}`.toLowerCase();
          const matchesKeyword = cluster.keywords.some(kw => tText.includes(kw.toLowerCase()));
          const matchesCpv = cluster.cpvPrefixes.some(pref => 
            tender.dk021Code?.startsWith(pref) || 
            tender.category?.startsWith(pref)
          );
          if (!matchesKeyword && !matchesCpv) return false;
        }
      }

      // 5. Exact CPV Category
      if (selectedCpvCode !== 'ALL') {
        const cpv = CPV_CATEGORIES.find(c => c.code === selectedCpvCode);
        if (cpv) {
          const tText = `${tender.title} ${tender.category} ${tender.dk021Code || ''}`.toLowerCase();
          const matchesPrefix = tender.dk021Code?.startsWith(cpv.prefix) || tender.category?.includes(cpv.prefix);
          const matchesKeywords = cpv.keywords.some(k => tText.includes(k.toLowerCase()));
          if (!matchesPrefix && !matchesKeywords && tender.category !== cpv.name) {
            return false;
          }
        }
      }

      // 6. Region Filter
      if (selectedRegion !== 'ALL' && selectedRegion !== 'Всі регіони України') {
        const regClean = selectedRegion.replace(' область', '').replace(' (м. Київ)', '').toLowerCase();
        const tRegion = `${tender.region} ${tender.customerCity}`.toLowerCase();
        if (!tRegion.includes(regClean)) return false;
      }

      // 7. Decision Filter
      const decision = getConfirmedDecision(tender);
      if (selectedDecision !== 'ALL' && decision !== selectedDecision) {
        return false;
      }

      // 8. Budget Filter
      const tenderBudget = tender.budgetUah ?? 0;
      if (tenderBudget < minBudget || tenderBudget > maxBudget) {
        return false;
      }

      // 9. Risk / Foul Score Filter
      const foul = tender.foulScore ?? 0;
      if (selectedRisk === 'CLEAN' && foul >= 30) return false;
      if (selectedRisk === 'MEDIUM_RISK' && (foul < 30 || foul >= 60)) return false;
      if (selectedRisk === 'HIGH_RISK' && foul < 60) return false;
      if (selectedRisk === 'WITH_VIOLATIONS' && (!tender.violations || tender.violations.length === 0) && foul < 20) return false;

      // 10. Match Score Filter
      const score = getConfirmedScore(tender);
      if (minMatchScore > 0 && (score == null || score < minMatchScore)) {
        return false;
      }

      // 11. Deadline Filter
      if (selectedDeadline !== 'ALL' && tender.deadline && tender.deadline !== 'НЕВІДОМО' && tender.deadline !== 'NOT_AVAILABLE') {
        const now = Date.now();
        const deadlineDate = new Date(tender.deadline).getTime();
        const diffDays = (deadlineDate - now) / (1000 * 60 * 60 * 24);

        if (selectedDeadline === 'URGENT_3D' && (diffDays < 0 || diffDays > 3)) return false;
        if (selectedDeadline === 'THIS_WEEK' && (diffDays < 0 || diffDays > 7)) return false;
        if (selectedDeadline === 'NEXT_2W' && (diffDays < 0 || diffDays > 14)) return false;
        if (selectedDeadline === 'MORE_14D' && diffDays <= 14) return false;
        if (selectedDeadline === 'ARCHIVE_OLD' && diffDays > 0) return false;
      }

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      const scoreA = getConfirmedScore(a) ?? -1;
      const scoreB = getConfirmedScore(b) ?? -1;
      const budgetA = a.budgetUah ?? 0;
      const budgetB = b.budgetUah ?? 0;
      const foulA = a.foulScore ?? 0;
      const foulB = b.foulScore ?? 0;

      const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
      const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;

      const deadlineA = a.deadline && a.deadline !== 'НЕВІДОМО' ? new Date(a.deadline).getTime() : 9999999999999;
      const deadlineB = b.deadline && b.deadline !== 'НЕВІДОМО' ? new Date(b.deadline).getTime() : 9999999999999;

      switch (sortBy) {
        case 'match_desc':
          return scoreB - scoreA;
        case 'date_desc':
          return dateB - dateA;
        case 'date_asc':
          return dateA - dateB;
        case 'deadline_asc':
          return deadlineA - deadlineB;
        case 'price_desc':
          return budgetB - budgetA;
        case 'price_asc':
          return budgetA - budgetB;
        case 'risk_asc':
          return foulA - foulB;
        case 'risk_desc':
          return foulB - foulA;
        default:
          return scoreB - scoreA;
      }
    });
  }, [
    allTenders,
    searchQuery,
    lifecycleStage,
    selectedSubStatus,
    selectedCluster,
    selectedCpvCode,
    selectedRegion,
    selectedDecision,
    minBudget,
    maxBudget,
    selectedRisk,
    minMatchScore,
    selectedDeadline,
    sortBy
  ]);

  // Best match tender for top recommendation banner
  const topMatchTender = useMemo(() => {
    return [...filteredTenders].sort((a, b) => 
      (getConfirmedScore(b) ?? -1) -
      (getConfirmedScore(a) ?? -1)
    )[0];
  }, [filteredTenders]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16">
      
      {/* Header Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              <Radar className="w-3.5 h-3.5 animate-spin text-emerald-400" style={{ animationDuration: '6s' }} />
              <span>AI Autonomous Radar • Prozorro 2.5 Live Sync</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              AI Персональний Радар Тендерів
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Автоматичний пошук, скоринг відповідності за цифровим двійником компанії та антикорупційний аудит закупівель.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 min-w-[280px]">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest col-span-2 sm:col-span-3 lg:col-span-1">
              Профіль: <span className="text-slate-300">{company.shortName || company.name}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-xs text-slate-400">Знайдено в базі:</span>
              <span className="font-bold text-white font-mono">{allTenders.length}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-xs text-slate-400">Відфільтровано:</span>
              <span className="font-bold text-emerald-400 font-mono">{filteredTenders.length}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-xs text-slate-400">Рекомендовано (BID):</span>
              <span className="font-bold text-emerald-400 font-mono">
                {allTenders.filter(t => getConfirmedDecision(t) === 'BID').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Search & Natural Language Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AI Семантичний пошук через Prozorro API
          </label>
          <div className="flex items-center gap-3">
            {isSearching && (
              <div className="text-[10px] animate-pulse text-emerald-400 font-bold uppercase tracking-tighter flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <Radar className="w-3 h-3 animate-spin" />
                Сканування відкритих торгів Prozorro...
              </div>
            )}
            {searchTelemetry && !isSearching && (
              <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                Знайдено: {searchTelemetry.recordsMatched} ({searchTelemetry.durationMs != null ? `${searchTelemetry.durationMs}ms` : 'UNKNOWN'})
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              value={nlPrompt}
              onChange={(e) => setNlPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyNlPrompt(nlPrompt)}
              placeholder="«Будівництво протирадіаційних укриттів у школах Київської області від 20 млн грн...»"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
            />
          </div>
          <button
            onClick={() => handleApplyNlPrompt(nlPrompt)}
            disabled={isSearching}
            className="px-7 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center space-x-2 cursor-pointer whitespace-nowrap"
          >
            {isSearching ? <Radar className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{isSearching ? "Сканування..." : "Знайти в Prozorro"}</span>
          </button>
        </div>

        {/* Quick Thematic Query Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter whitespace-nowrap">Швидкі промпти:</span>
          {[
            '🛡️ Укриття та сховища для шкіл',
            '🚁 БПЛА, FPV-дрони та РЕБ',
            '⚡ Дизельні генератори та ДБЖ',
            '🏥 Капремонти лікарень від 15 млн ₴',
            '💻 Ноутбуки та серверне обладнання',
            '🛣️ Ремонт доріг та мостів',
            '🚜 Спецтехніка та екскаватори',
            '💊 Лікарські засоби та медвироби',
            '📐 Розробка ПКД та технагляд'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                const cleanPrompt = prompt.replace(/^[^\s]+\s/, '');
                setNlPrompt(cleanPrompt);
                handleApplyNlPrompt(cleanPrompt);
              }}
              className="text-[10px] sm:text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-emerald-500/40 transition-all cursor-pointer whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. LIFECYCLE STAGE TABS: Всі, Нові, Виграні, Переігруються, Старі         */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800 mb-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Статус та етап закупівлі</span>
          </div>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            Оберіть стадію для моментального фільтрування
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {LIFECYCLE_TABS.map((tab) => {
            const isSelected = lifecycleStage === tab.id;
            const count = stageCounts[tab.id] || 0;

            return (
              <button
                key={tab.id}
                onClick={() => setLifecycleStage(tab.id)}
                className={`flex flex-col items-start p-3 sm:p-3.5 rounded-2xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 text-white shadow-lg shadow-emerald-950/20'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs sm:text-sm font-bold truncate">{tab.label}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 line-clamp-1 leading-tight">
                  {tab.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THEMATIC CATEGORY CLUSTERS (Quick Horizontal Pills)                     */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>Категорії та галузеві напрямки (CPV)</span>
          </div>
          {selectedCluster !== 'ALL' && (
            <button
              onClick={() => setSelectedCluster('ALL')}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <X size={12} /> Скинути категорію
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
          {QUICK_CLUSTER_FILTERS.map((cluster) => {
            const isSelected = selectedCluster === cluster.id;
            return (
              <button
                key={cluster.id}
                onClick={() => setSelectedCluster(cluster.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-950/20 font-black'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{cluster.label}</span>
                {cluster.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                    isSelected ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {cluster.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN FILTER CONTROL BAR & POWER FILTERS TOGGLE                         */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Fast Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Фільтр за назвою, ЄДРПОУ, номером, містом чи предметом..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-9 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Dropdowns */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5">
            {/* CPV Selector */}
            <select
              value={selectedCpvCode}
              onChange={(e) => setSelectedCpvCode(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-3 text-xs font-bold text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[200px] truncate"
            >
              <option value="ALL">Всі CPV категорії</option>
              {CPV_CATEGORIES.map((cat) => (
                <option key={cat.code} value={cat.code}>
                  {cat.prefix}*** — {cat.shortName}
                </option>
              ))}
            </select>

            {/* Region Selector */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-3 text-xs font-bold text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[180px] truncate"
            >
              {UKRAINE_REGIONS.map((reg, idx) => (
                <option key={idx} value={reg}>{reg}</option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-3 text-xs font-bold text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[190px] truncate"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Power Filters Button */}
            <button
              onClick={() => setShowPowerFilters(!showPowerFilters)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                showPowerFilters || activeFiltersCount > 0
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Потужні фільтри</span>
              <span className="sm:hidden">Фільтри</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* EXPANDABLE ADVANCED / POWER FILTERS PANEL                                */}
        {/* ======================================================================= */}
        {showPowerFilters && (
          <div className="mt-4 pt-5 border-t border-slate-800/80 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <span>Розширені параметри та критерії відбору</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={13} />
                Скинути всі фільтри
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* 1. Бюджетні пресети та діапазон */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <DollarSign size={13} className="text-emerald-400" />
                  Діапазон вартості (₴)
                </label>
                <select
                  value={budgetPresetIdx}
                  onChange={(e) => handleSelectBudgetPreset(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {BUDGET_PRESETS.map((preset, idx) => (
                    <option key={idx} value={idx}>{preset.label}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono block">Від:</span>
                    <input
                      type="number"
                      value={minBudget || ''}
                      onChange={(e) => setMinBudget(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono block">До:</span>
                    <input
                      type="number"
                      value={maxBudget === 1000000000 ? '' : maxBudget}
                      onChange={(e) => setMaxBudget(parseFloat(e.target.value) || 1000000000)}
                      placeholder="Макс"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Рівень ризику (Foul Score) */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert size={13} className="text-amber-400" />
                  Рівень ризику (Foul Score)
                </label>
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {RISK_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 leading-tight pt-1">
                  Фільтр за глибиною штучних обмежень та «заточок» у тендерній документації.
                </p>
              </div>

              {/* 3. AI Рішення (Bid Decision) & Match */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={13} className="text-emerald-400" />
                  AI Рекомендація та Відповідність
                </label>
                <select
                  value={selectedDecision}
                  onChange={(e) => setSelectedDecision(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="ALL">Всі рекомендації</option>
                  <option value="BID">🟢 BID (Рекомендовано брати участь)</option>
                  <option value="BID_WITH_CONDITIONS">🟡 CONDITIONAL (З зауваженнями)</option>
                  <option value="NO_BID">🔴 NO BID (Високий ризик / Відхилити)</option>
                </select>
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Мін. відповідність:</span>
                    <span className="font-bold text-emerald-400">{minMatchScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="10"
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* 4. Дедлайн та специфічні підстатуси */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={13} className="text-blue-400" />
                  Терміни та підстатус
                </label>
                <select
                  value={selectedDeadline}
                  onChange={(e) => setSelectedDeadline(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {DEADLINE_PRESETS.map((dl) => (
                    <option key={dl.id} value={dl.id}>{dl.label}</option>
                  ))}
                </select>
                <select
                  value={selectedSubStatus}
                  onChange={(e) => setSelectedSubStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer mt-2"
                >
                  {SUB_STATUS_OPTIONS.map((sub) => (
                    <option key={sub.value} value={sub.value}>{sub.label}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        )}

        {/* Active Filters Summary Pills */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mr-1">Застосовано:</span>
            
            {lifecycleStage !== 'ALL' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Стадія: {LIFECYCLE_TABS.find(t => t.id === lifecycleStage)?.label}
                <button onClick={() => setLifecycleStage('ALL')}><X size={11} /></button>
              </span>
            )}

            {selectedCluster !== 'ALL' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Напрямок: {QUICK_CLUSTER_FILTERS.find(c => c.id === selectedCluster)?.label}
                <button onClick={() => setSelectedCluster('ALL')}><X size={11} /></button>
              </span>
            )}

            {selectedCpvCode !== 'ALL' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
                CPV: {selectedCpvCode}
                <button onClick={() => setSelectedCpvCode('ALL')}><X size={11} /></button>
              </span>
            )}

            {selectedRegion !== 'ALL' && selectedRegion !== 'Всі регіони України' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Регіон: {selectedRegion}
                <button onClick={() => setSelectedRegion('ALL')}><X size={11} /></button>
              </span>
            )}

            {(minBudget > 0 || maxBudget < 1000000000) && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Бюджет: {minBudget.toLocaleString()} - {maxBudget === 1000000000 ? '∞' : maxBudget.toLocaleString()} ₴
                <button onClick={() => { setBudgetPresetIdx(0); setMinBudget(0); setMaxBudget(1000000000); }}><X size={11} /></button>
              </span>
            )}

            {selectedRisk !== 'ALL' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30">
                Ризик: {RISK_FILTER_OPTIONS.find(r => r.value === selectedRisk)?.label}
                <button onClick={() => setSelectedRisk('ALL')}><X size={11} /></button>
              </span>
            )}

            {selectedDecision !== 'ALL' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30">
                Рішення: {selectedDecision}
                <button onClick={() => setSelectedDecision('ALL')}><X size={11} /></button>
              </span>
            )}

            {minMatchScore > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Match ≥ {minMatchScore}%
                <button onClick={() => setMinMatchScore(0)}><X size={11} /></button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-[10px] text-slate-400 hover:text-slate-200 underline font-medium cursor-pointer ml-auto"
            >
              Очистити все
            </button>
          </div>
        )}
      </div>

      {/* Top Opportunity - Adaptive Feature Card */}
      {topMatchTender && (
        <div className="group bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 font-black text-[10px] tracking-tighter flex items-center gap-1 border border-emerald-500/20">
                <Flame className="w-4 h-4" />
                ТОП-РЕКОМЕНДАЦІЯ RADAR
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-700">
                {topMatchTender.tenderNumber}
              </span>
              {(() => {
                const badge = getTenderStatusBadge(topMatchTender);
                return (
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {badge.label}
                  </span>
                );
              })()}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Opportunity Fit:</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {getConfirmedScore(topMatchTender) != null ? `${getConfirmedScore(topMatchTender)}% MATCH` : 'UNKNOWN'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors leading-tight">
                {topMatchTender.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                {topMatchTender.summary}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-1">Очікувана вартість</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {topMatchTender.budgetUah ? `${topMatchTender.budgetUah.toLocaleString()} ₴` : 'Не вказано'}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-1">AI Рішення</div>
                  <div className="text-sm font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 size={14} /> {getConfirmedDecision(topMatchTender)}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-1">Дедлайн подання</div>
                  <div className="text-sm font-bold text-amber-400 font-mono truncate">{topMatchTender.deadline}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-1">Регіон / Місто</div>
                  <div className="text-sm font-bold text-slate-200 truncate">{topMatchTender.region || topMatchTender.customerCity}</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 h-full">
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  AI Обґрунтування вибору
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  {topMatchTender.opportunityScore?.bidDecisionReason || "Недостатньо профілю компанії для персональної рекомендації. Потрібні CPV, регіони, документи та фінансова спроможність."}
                </p>
              </div>

              <button
                onClick={async () => {
                  if (!token) return;
                  try {
                    const res = await fetch('/api/tenders', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify(topMatchTender)
                    });
                    if (!res.ok) throw new Error('Не вдалося зберегти тендер');
                    const saved = await res.json();
                    const savedTender = {
                      ...topMatchTender,
                      id: String(saved.id),
                      budgetUah: saved.budgetUah != null ? Number(saved.budgetUah) : topMatchTender.budgetUah,
                    };
                    onSelectTender(savedTender);
                    onNavigateToWarRoom(savedTender);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-950/40 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Відкрити Командний Центр</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tender List Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>Знайдено закупівель:</span>
            <span className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded-md font-bold">{filteredTenders.length}</span>
          </div>
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Відображаються торги відповідно до активних фільтрів
          </div>
        </div>

        {filteredTenders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Закупівлі не знайдені</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              За вашими параметрами фільтрації немає торгів. Спробуйте змінити стадію або скинути розширені фільтри.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer border border-slate-700"
            >
              <RotateCcw size={14} />
              Скинути фільтри
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTenders.map((tender) => {
              const score = getConfirmedScore(tender);
              const decision = getConfirmedDecision(tender);
              const isExpanded = expandedWhyTenderId === tender.id;
              const statusBadge = getTenderStatusBadge(tender);

              return (
                <div
                  key={tender.id}
                  className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 transition-all space-y-6 shadow-sm"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-[10px] font-mono font-black text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          {tender.tenderNumber}
                        </span>
                        
                        {/* Dynamic Status Badge (New, Won, Retendered, Old, etc.) */}
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          {statusBadge.label}
                        </span>

                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                          {tender.customerCity} • {tender.category}
                        </span>

                        <div className="flex items-center gap-2">
                          {decision === 'BID' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              BID
                            </span>
                          )}
                          {decision === 'BID_WITH_CONDITIONS' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              CONDITION
                            </span>
                          )}
                          {decision === 'NO_BID' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              NO BID
                            </span>
                          )}
                          {decision === 'UNKNOWN' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter bg-slate-800 text-slate-400 border border-slate-700">
                              UNKNOWN
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                            tender.foulScore && tender.foulScore >= 60 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400'
                          }`}>
                            Foul: {tender.foulScore != null ? `${tender.foulScore}/100` : 'UNKNOWN'}
                          </span>
                        </div>
                      </div>

                      <h3 
                        onClick={() => { onSelectTender(tender); onNavigateToWarRoom(tender); }}
                        className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-400 transition-colors cursor-pointer leading-tight"
                      >
                        {tender.title}
                      </h3>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6 text-xs text-slate-300">
                        <div className="flex items-center gap-2 font-medium">
                          <Building2 size={14} className="text-slate-500" />
                          <span className="truncate max-w-[280px]">{tender.customer}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-emerald-400 font-bold">
                          <DollarSign size={14} className="text-emerald-500" />
                          {tender.budgetUah ? `${tender.budgetUah.toLocaleString()} ₴` : 'Бюджет уточнюється'}
                        </div>
                        <div className="flex items-center gap-2 font-mono text-amber-400 font-bold">
                          <Clock size={14} className="text-amber-500" />
                          {tender.deadline}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin size={14} className="text-slate-500" />
                          {tender.region || tender.customerCity}
                        </div>
                      </div>
                    </div>

                    {/* Actions Area */}
                    <div className="flex flex-col sm:flex-row xl:flex-col items-stretch sm:items-center xl:items-end gap-3 min-w-[220px]">
                      <div className="hidden xl:block text-right mb-1">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Відповідність</div>
                        <div className="text-3xl font-black text-emerald-400 font-mono">{score != null ? `${score}%` : 'UNKNOWN'}</div>
                      </div>

                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full">
                        <button
                          onClick={() => setActiveModalTenderId(tender.id)}
                          className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FileText size={14} /> <span>Деталі</span>
                        </button>

                        <button
                          onClick={() => setExpandedWhyTenderId(isExpanded ? null : tender.id)}
                          className={`flex-1 sm:flex-none px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isExpanded 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          }`}
                        >
                          <Sparkles size={14} className="text-emerald-400" /> <span>Match</span>
                        </button>

                        <button
                          onClick={async () => {
                            if (!token) return;
                            try {
                              const res = await fetch('/api/tenders', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify(tender)
                              });
                              if (!res.ok) throw new Error('Не вдалося зберегти тендер');
                              const saved = await res.json();
                              const savedTender = {
                                ...tender,
                                id: String(saved.id),
                                budgetUah: saved.budgetUah != null ? Number(saved.budgetUah) : tender.budgetUah,
                              };
                              onSelectTender(savedTender);
                              onNavigateToWarRoom(savedTender);
                            } catch (e) { console.error(e); }
                          }}
                          className="col-span-2 sm:flex-1 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Download size={14} /> <span>Командний Центр</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown Accordion */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-slate-800/60 bg-slate-950/60 rounded-3xl p-6 space-y-6 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 text-2xl font-black shadow-inner font-mono">
                            {score != null ? `${score}%` : 'UNKNOWN'}
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Деталізований AI розрахунок відповідності</div>
                            <div className="text-xs text-slate-200 font-medium italic leading-relaxed">
                              {tender.opportunityScore?.bidDecisionReason || "Недостатньо профілю компанії для персонального розрахунку відповідності."}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {[
                          { label: 'CPV Категорія', status: '✓', color: 'text-emerald-400' },
                          { label: 'Регіон робіт', status: '✓', color: 'text-emerald-400' },
                          { label: 'Бюджетний ліміт', status: '✓', color: 'text-emerald-400' },
                          { label: 'Аналогічний досвід', status: '✓', color: 'text-emerald-400' },
                          { label: 'Кваліфікація ст. 16', status: '✓', color: 'text-emerald-400' },
                          { label: 'Строки виконання', status: '✓', color: 'text-emerald-400' },
                          { label: 'Ресурсна база', status: tender.foulScore && tender.foulScore > 40 ? '⚠' : '✓', color: tender.foulScore && tender.foulScore > 40 ? 'text-amber-400' : 'text-emerald-400' },
                          { label: 'Конкурентне поле', status: '✓', color: 'text-emerald-400' },
                          { label: 'Юридична чистота', status: tender.foulScore && tender.foulScore >= 60 ? '✗' : '✓', color: tender.foulScore && tender.foulScore >= 60 ? 'text-rose-400' : 'text-emerald-400' },
                        ].map((item, idx) => (
                          <div key={idx} className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</span>
                            <span className={`text-sm font-black ${item.color}`}>{item.status}</span>
                          </div>
                        ))}
                      </div>

                      {tender.opportunityScore?.whyThisTender && (
                        <div className="space-y-3">
                          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Обґрунтування алгоритму:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {tender.opportunityScore.whyThisTender.map((reason: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                                <div className="mt-0.5 text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg">
                                  <CheckCircle2 size={13} />
                                </div>
                                <div className="text-xs text-slate-200 leading-relaxed">{reason.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Pagination Load More */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={handleLoadMore}
            disabled={isSearching}
            className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black uppercase tracking-widest border border-slate-700 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
            ) : (
              <TrendingUp className="text-emerald-400" />
            )}
            <span>Завантажити ще результати з Prozorro</span>
          </button>
        </div>
      )}

      {/* Tender Detail Modal */}
      {activeModalTenderId && (
        <TenderDetailModal
          tenderId={activeModalTenderId}
          onClose={() => setActiveModalTenderId(null)}
          onRunAudit={(tender) => onSelectTender(tender)}
          onOpenWarRoom={(tender) => { onSelectTender(tender); onNavigateToWarRoom(tender); }}
        />
      )}
    </div>
  );
};
