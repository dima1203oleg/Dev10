import React, { useState } from 'react';
import { Tender, CompanyProfile, BidDecision } from '../types';
import { useAuth } from '../contexts/AuthContext';
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
  FileText
} from 'lucide-react';

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
  const [tenders, setLocalTenders] = useState<Tender[]>(dbTenders);
  const [searchQuery, setSearchQuery] = useState('');
  const [nlPrompt, setNlPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDecision, setSelectedDecision] = useState<string>('ALL');
  const [minBudget, setMinBudget] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(100000000);
  const [expandedWhyTenderId, setExpandedWhyTenderId] = useState<string | null>(null);
  const [activeModalTenderId, setActiveModalTenderId] = useState<string | null>(null);
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchTelemetry, setSearchTelemetry] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  // Apply natural language filter
  const handleApplyNlPrompt = async (prompt: string, isAppend = false) => {
    if (!isAppend) {
      setNlPrompt(prompt);
      setLocalTenders([]);
      setSearchId(null);
      setHasMore(false);
    }
    
    if (!token) return;
    
    setIsSearching(true);
    setSearchError(null);
    if (!isAppend) setSearchTelemetry(null);

    try {
      const url = isAppend && searchId
        ? `/api/prozorro/search?searchId=${searchId}`
        : `/api/prozorro/search?query=${encodeURIComponent(prompt)}`;
        
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error || "Не вдалося отримати дані з Prozorro. Перевірте з'єднання.");
        setIsSearching(false);
        return;
      }

      if (data.searchId) {
        setSearchId(data.searchId);
      }
      if (data.pagination) {
        setHasMore(data.pagination.hasMore);
        setSearchTelemetry({
          pagesFetched: data.pagination.pagesFetched,
          recordsFetched: data.pagination.recordsScanned,
          recordsReturned: data.pagination.recordsMatched,
          durationMs: data.telemetry?.durationMs || 150
        });
      }
      
      const tendersToMap = data.results || data.tenders;
      if (tendersToMap) {
        // Map backend objects to frontend types
        const mappedTenders: Tender[] = tendersToMap.map((t: any) => ({
            id: t.id,
            tenderNumber: t.tenderId, // Correctly use tenderId (UA-...)
            title: t.title,
            customer: t.customer,
            customerEdrpou: t.customerEdrpou,
            customerCity: t.customerCity,
            budgetUah: t.budgetUah,
            deadline: t.deadline,
            region: t.region || t.customerCity,
            status: t.status === 'active' ? 'ACTIVE' : 'AUDIT_FLAGGED',
            category: t.category,
            foulScore: t.foulScore,
            riskLevel: t.riskLevel,
            summary: t.summary,
            source: t.source,
            createdDate: t.datePublished || new Date().toISOString(),
            boqItems: [],
            violations: [],
            requirements: [],
            opportunityScore: {
                overallScore: t.fitScore ?? null,
                bidDecision: t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL' ? 'BID_WITH_CONDITIONS' : 'BID',
                bidDecisionReason: t.radarReasons?.[0] || "Автоматичний скоринг Prozorro за даними Vault компанії",
                factors: t.fitFactors || null,
                whyThisTender: (t.radarReasons || []).map((r: string) => ({
                  icon: "Shield",
                  title: "Аналіз відповідності",
                  description: r,
                  type: "POSITIVE"
                }))
            }
        }));
        
        if (isAppend) {
          setLocalTenders(prev => {
            const existingIds = new Set(prev.map(t => t.id));
            const uniqueNew = mappedTenders.filter(t => !existingIds.has(t.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setLocalTenders(mappedTenders);
        }
      }
    } catch (err) {
      console.error(err);
      setSearchError("Виникла помилка під час пошуку.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadMore = () => {
    if (searchId && hasMore) {
      handleApplyNlPrompt(nlPrompt, true);
    }
  };

  // Filter tenders
  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = 
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.tenderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.region.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || tender.category === selectedCategory;
    
    const decision = tender.opportunityScore?.bidDecision || (tender.foulScore > 60 ? 'NO_BID' : 'BID');
    const matchesDecision = selectedDecision === 'ALL' || decision === selectedDecision;

    const matchesBudget = tender.budgetUah >= minBudget && tender.budgetUah <= maxBudget;

    return matchesSearch && matchesCategory && matchesDecision && matchesBudget;
  });

  const categories = Array.from(new Set(tenders.map(t => t.category)));

  // Best match tender
  const topMatchTender = [...tenders].sort((a, b) => 
    (b.opportunityScore?.overallScore ?? 0) - 
    (a.opportunityScore?.overallScore ?? 0)
  )[0];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      
      {/* Header Banner - Responsive Layout */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              <Radar className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>AI Autonomous Radar • Prozorro Sync</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              AI Персональний Радар
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Система аналізує цифровий двійник вашої компанії та відбирає лише ті тендери, які ви реально можете виграти.
            </p>
          </div>

          {/* Stats Pill - Hidden on smallest mobile, shown on SM+ */}
          <div className="hidden sm:block bg-slate-900/90 border border-slate-800 rounded-2xl p-5 min-w-[280px] space-y-3">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Профіль пошуку:</div>
            <div className="text-sm font-bold text-white truncate">{company.shortName}</div>
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Відібрано алгоритмом:</span>
                <span className="font-bold text-emerald-400">{filteredTenders.length}</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Рекомендовано (BID):</span>
                <span className="font-bold text-emerald-400">
                  {tenders.filter(t => t.opportunityScore?.bidDecision === 'BID').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Search Section - Adaptive Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AI Пошуковий Промпт (Prozorro Connector)
          </label>
          <div className="flex items-center gap-3">
            {isSearching && (
              <div className="text-[10px] animate-pulse text-emerald-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                Crawling Prozorro...
              </div>
            )}
            {searchTelemetry && !isSearching && (
              <div className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {searchTelemetry.recordsReturned} records in {searchTelemetry.durationMs}ms
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={nlPrompt}
              onChange={(e) => setNlPrompt(e.target.value)}
              placeholder="«Покажи мені будівництво укриттів...»"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
            />
          </div>
          <button
            onClick={() => handleApplyNlPrompt(nlPrompt)}
            disabled={isSearching}
            className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isSearching ? <Radar className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{isSearching ? "Шукаю..." : "Шукати"}</span>
          </button>
        </div>

        {/* Quick Prompt Pills - Scrolling on mobile */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter whitespace-nowrap">Швидкі запити:</span>
          {[
            'Укриття для шкіл у Києві',
            'Капремонти лікарень від 10 млн',
            'Дорожнє будівництво'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyNlPrompt(prompt)}
              className="text-[10px] sm:text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-emerald-500/40 transition-all cursor-pointer whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
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
              <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded-lg border border-slate-700">
                {topMatchTender.tenderNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Opportunity Score:</span>
              <span className="text-xl font-black text-emerald-400">
                {topMatchTender.opportunityScore?.overallScore}% MATCH
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors leading-tight">
                {topMatchTender.title}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                {topMatchTender.summary}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-1">Бюджет</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">{topMatchTender.budgetUah.toLocaleString()} ₴</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-1">AI Рішення</div>
                  <div className="text-sm font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 size={14} /> BID
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-1">Дедлайн</div>
                  <div className="text-sm font-bold text-amber-400 font-mono">{topMatchTender.submissionDeadline}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-1">Конкуренти</div>
                  <div className="text-sm font-bold text-slate-200">~3-5</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 h-full">
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  AI Висновок
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  {topMatchTender.opportunityScore?.bidDecisionReason}
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectTender(topMatchTender);
                  onNavigateToWarRoom(topMatchTender);
                }}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-950/40 cursor-pointer"
              >
                Відкрити War Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main List Filters - Stacked on Mobile */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук за назвою, номером, містом..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 shadow-inner"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-400 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Всі Категорії</option>
            {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
          <select
            value={selectedDecision}
            onChange={(e) => setSelectedDecision(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-400 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Всі Рішення</option>
            <option value="BID">🟢 BID</option>
            <option value="BID_WITH_CONDITIONS">🟡 CONDITIONAL</option>
            <option value="NO_BID">🔴 NO BID</option>
          </select>
        </div>
      </div>

      {/* Tender List - Hybrid Card/List Layout */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Знайдено: {filteredTenders.length}</div>
           <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:block">Сортування: За відповідністю</div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredTenders.map((tender) => {
            const score = tender.opportunityScore?.overallScore;
            const decision = tender.opportunityScore?.bidDecision || (tender.foulScore > 60 ? 'NO_BID' : 'BID');
            const isExpanded = expandedWhyTenderId === tender.id;

            return (
              <div
                key={tender.id}
                className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 transition-all space-y-6"
              >
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-[10px] font-mono font-black text-emerald-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                        {tender.tenderNumber}
                      </span>
                      
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                        {tender.customerCity} • {tender.category}
                      </span>

                      <div className="flex items-center gap-2">
                        {decision === 'BID' && (
                          <span className="text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-tighter bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">BID</span>
                        )}
                        {decision === 'BID_WITH_CONDITIONS' && (
                          <span className="text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-tighter bg-amber-500/10 text-amber-400 border border-amber-500/20">CONDITION</span>
                        )}
                        {decision === 'NO_BID' && (
                          <span className="text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-tighter bg-red-500/10 text-red-400 border border-red-500/20">NO BID</span>
                        )}
                        <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-tighter ${
                          tender.foulScore >= 60 ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-500'
                        }`}>Risk: {tender.foulScore}/100</span>
                      </div>
                    </div>

                    <h3 
                      onClick={() => { onSelectTender(tender); onNavigateToWarRoom(tender); }}
                      className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-400 transition-colors cursor-pointer leading-tight"
                    >
                      {tender.title}
                    </h3>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6 text-xs text-slate-400">
                      <div className="flex items-center gap-2 font-bold text-slate-300">
                        <Building2 size={14} className="text-slate-500" />
                        {tender.customer}
                      </div>
                      <div className="flex items-center gap-2 font-mono text-emerald-500 font-bold">
                        <DollarSign size={14} className="text-emerald-600" />
                        {tender.budgetUah?.toLocaleString()} ₴
                      </div>
                      <div className="flex items-center gap-2 font-mono text-amber-500 font-bold">
                        <Clock size={14} className="text-amber-600" />
                        {tender.deadline}
                      </div>
                    </div>
                  </div>

                  {/* Actions Area - Full width on Mobile */}
                  <div className="flex flex-col sm:flex-row xl:flex-col items-stretch sm:items-center xl:items-end gap-3 min-w-[220px]">
                    <div className="hidden xl:block text-right mb-2">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Match Score</div>
                      <div className="text-3xl font-black text-emerald-400">{score}%</div>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full">
                      <button
                        onClick={() => setActiveModalTenderId(tender.id)}
                        className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all flex items-center justify-center gap-2"
                      >
                        <FileText size={14} /> <span>Деталі</span>
                      </button>

                      <button
                        onClick={() => setExpandedWhyTenderId(isExpanded ? null : tender.id)}
                        className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles size={14} className="text-emerald-400" /> <span>Match</span>
                      </button>

                      <button
                        onClick={async () => {
                           if (!token) return;
                           try {
                             await fetch('/api/tenders', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                               body: JSON.stringify(tender)
                             });
                             onSelectTender(tender);
                             onNavigateToWarRoom(tender);
                           } catch (e) { console.error(e); }
                        }}
                        className="col-span-2 sm:flex-1 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                      >
                        <Download size={14} /> <span>War Room</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Accordion */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-slate-800/60 bg-slate-950/40 rounded-3xl p-6 space-y-6 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 text-xl font-black">
                          {score}%
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Opportunity Fit Score</div>
                          <div className="text-xs text-slate-300 font-medium italic leading-relaxed">{tender.opportunityScore?.bidDecisionReason}</div>
                        </div>
                      </div>
                    </div>

                    {tender.opportunityScore?.whyThisTender && (
                      <div className="space-y-3">
                         <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Обґрунтування відповідності:</div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {tender.opportunityScore.whyThisTender.map((reason: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/40">
                                 <div className="mt-0.5 text-emerald-500"><CheckCircle2 size={12} /></div>
                                 <div className="text-[11px] text-slate-300 leading-snug">{reason.description}</div>
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
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={handleLoadMore}
            disabled={isSearching}
            className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {isSearching ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div> : <TrendingUp className="text-emerald-400" />}
            <span>Завантажити ще результати</span>
          </button>
        </div>
      )}

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
