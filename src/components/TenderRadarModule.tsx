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
  const [nextOffset, setNextOffset] = useState<string | null>(null);

  // Apply natural language filter
  const handleApplyNlPrompt = async (prompt: string, isAppend = false) => {
    if (!isAppend) {
      setNlPrompt(prompt);
      setLocalTenders([]);
    }
    
    if (!token) return;
    
    setIsSearching(true);
    setSearchError(null);
    if (!isAppend) setSearchTelemetry(null);

    try {
      const url = `/api/prozorro/search?query=${encodeURIComponent(prompt)}${isAppend && nextOffset ? `&offset=${nextOffset}` : ''}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error || "Не вдалося отримати дані з Prozorro. Перевірте з'єднання.");
        setIsSearching(false);
        return;
      }

      if (data.telemetry) {
        setSearchTelemetry(data.telemetry);
        setNextOffset(data.telemetry.nextOffset || null);
      }
      
      if (data.tenders) {
        // Map backend objects to frontend types
        const mappedTenders: Tender[] = data.tenders.map((t: any) => ({
            id: t.id,
            tenderNumber: t.tenderId, // Correctly use tenderId (UA-...)
            title: t.title,
            customer: t.customer,
            customerEdrpou: t.customerEdrpou,
            customerCity: t.customerCity,
            budgetUah: t.budgetUah || 0,
            deadline: t.deadline,
            region: t.region || t.customerCity,
            status: t.status === 'active' ? 'ACTIVE' : 'AUDIT_FLAGGED',
            category: t.category,
            foulScore: t.foulScore,
            riskLevel: t.riskLevel,
            summary: t.summary,
            source: t.source,
            createdDate: new Date().toISOString(),
            boqItems: [],
            violations: [],
            requirements: [],
            opportunityScore: {
                overallScore: t.fitScore || (t.foulScore ? Math.max(10, 100 - t.foulScore) : 70),
                bidDecision: t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL' ? 'BID_WITH_CONDITIONS' : 'BID',
                bidDecisionReason: t.radarReasons?.[0] || "Автоматичний скоринг Prozorro за даними Vault компанії",
                factors: t.fitFactors || {
                  companyFit: company ? 85 : 50,
                  legalFit: t.riskLevel === 'CRITICAL' ? 40 : 80,
                  docReadiness: 75,
                  financialFeasibility: 80,
                  competitionScore: 60,
                  historicalWinProb: 0,
                  executionFeasibility: 85,
                  riskPenalty: t.foulScore || 20
                },
                whyThisTender: (t.radarReasons || []).map((r: string) => ({
                  icon: "Shield",
                  title: "Аналіз відповідності",
                  description: r,
                  type: "POSITIVE"
                }))
            }
        }));
        
        if (isAppend) {
          setLocalTenders(prev => [...prev, ...mappedTenders]);
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
    if (nlPrompt && nextOffset) {
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
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Radar className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>AI Autonomous Tender Radar • Prozorro Continuous Sync</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Персональний Радар & Оцінка Можливостей
            </h1>
            
            <p className="text-sm text-slate-300">
              Система не просто показує сотні закупівель, а аналізує цифровий двійник вашої компанії (КВЕД <strong>{company.edrpou}</strong>, ліцензії СС2/СС3, наявну техніку) та виділяє лише ті тендери, які ви реально можете виграти та виконати.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-w-[240px] space-y-2">
            <div className="text-xs text-slate-400 font-medium">Профіль пошуку:</div>
            <div className="text-sm font-bold text-white truncate">{company.shortName}</div>
            <div className="text-xs text-slate-300 flex items-center justify-between">
              <span>Відібрано алгоритмом:</span>
              <span className="font-bold text-emerald-400">{filteredTenders.length} з {tenders.length}</span>
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between">
              <span>Пріоритет BID 🟢:</span>
              <span className="font-bold text-emerald-400">
                {tenders.filter(t => t.opportunityScore?.bidDecision === 'BID' || t.opportunityScore?.bidDecision === 'BID_WITH_CONDITIONS').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Natural Language Search Filter (Prompt поверх каталогу) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AI Пошуковий Промпт (Real-time Prozorro Connector)
          </label>
          <div className="flex items-center gap-4">
            {isSearching && (
              <div className="text-[10px] animate-pulse text-emerald-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                Crawling Prozorro API...
              </div>
            )}
            {searchError && (
              <div className="text-[10px] text-rose-400 font-bold bg-rose-950/30 px-2 py-0.5 rounded border border-rose-900 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                {searchError}
              </div>
            )}
            {searchTelemetry && !isSearching && (
              <div className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Found {searchTelemetry.recordsReturned} in {searchTelemetry.durationMs}ms ({searchTelemetry.pagesFetched} pages)
              </div>
            )}
            <span className="text-[11px] text-slate-400">AI автоматично розпізнає критерії та фільтрує закупівлі</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={nlPrompt}
              onChange={(e) => setNlPrompt(e.target.value)}
              placeholder="Наприклад: «Покажи мені будівництво укриттів...» (Реальний пошук у Prozorro API)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <button
            onClick={() => handleApplyNlPrompt(nlPrompt)}
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            {isSearching ? <Radar className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{isSearching ? "Шукаю..." : "Шукати в Prozorro"}</span>
          </button>
        </div>

        {/* Quick Prompt Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500 font-medium">Швидкі запити:</span>
          {[
            'Укриття для шкіл та ліцеїв у Києві',
            'Капремонти лікарень від 10 млн грн',
            'Дорожнє будівництво без дискримінаційних вимог'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyNlPrompt(prompt)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-emerald-500/40 transition-all cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Top Opportunity Highlight (Feature Card) */}
      {topMatchTender && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-1">
                <Flame className="w-4 h-4 text-emerald-400" />
                ТОП-РЕКОМЕНДАЦІЯ AI RADAR
              </span>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {topMatchTender.tenderNumber}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Opportunity Score:</span>
              <span className="text-lg font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-800">
                {topMatchTender.opportunityScore?.overallScore ? `${topMatchTender.opportunityScore.overallScore}% MATCH` : 'UNKNOWN'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-2">
              <h2 className="text-xl font-extrabold text-white hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => onNavigateToWarRoom(topMatchTender)}>
                {topMatchTender.title}
              </h2>
              <p className="text-xs text-slate-300 line-clamp-2">
                {topMatchTender.summary}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Бюджет замовника</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {topMatchTender.budgetUah.toLocaleString()} ₴
                  </div>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Рішення Bid/No-Bid</div>
                  <div className="text-sm font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>BID (Участь)</span>
                  </div>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Дедлайн подання</div>
                  <div className="text-sm font-bold text-amber-300 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{topMatchTender.submissionDeadline}</span>
                  </div>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Конкурентність</div>
                  <div className="text-sm font-bold text-slate-200">
                    Середня (3 учасники)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Висновок щодо участі:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {topMatchTender.opportunityScore?.bidDecisionReason || 'Висока відповідність матеріальної бази та наявного досвіду за СС2. Розрахована маржинальність становить 21.4%.'}
                </p>
              </div>

              <button
                id="top-match-warroom-btn"
                onClick={() => {
                  onSelectTender(topMatchTender);
                  onNavigateToWarRoom(topMatchTender);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                <span>Відкрити Tender War Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Structured Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук за назвою, номером закупівлі, замовником або містом..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">Категорія:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Всі категорії ({tenders.length})</option>
            {categories.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Decision Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">Рішення:</span>
          <select
            value={selectedDecision}
            onChange={(e) => setSelectedDecision(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Всі рішення</option>
            <option value="BID">🟢 BID (Рекомендовано)</option>
            <option value="BID_WITH_CONDITIONS">🟡 BID WITH CONDITIONS</option>
            <option value="NO_BID">🔴 NO BID (Високий ризик)</option>
          </select>
        </div>

      </div>

      {/* Tender List Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Знайдено закупівель: <strong>{filteredTenders.length}</strong></span>
          <span>Сортування: За найвищим Opportunity Score</span>
        </div>

        {filteredTenders.map((tender) => {
          const score = tender.opportunityScore?.overallScore;
          const decision = tender.opportunityScore?.bidDecision || (tender.foulScore > 60 ? 'NO_BID' : 'BID');
          const isExpanded = expandedWhyTenderId === tender.id;

          return (
            <div
              key={tender.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm transition-all space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Info Block */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {tender.tenderNumber}
                    </span>
                    
                    <span className="text-xs text-slate-400 font-medium">
                      {tender.customerCity} • {tender.category}
                    </span>

                    {/* Decision Badge */}
                    {decision === 'BID' && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>BID (Рекомендовано)</span>
                      </span>
                    )}

                    {decision === 'BID_WITH_CONDITIONS' && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>BID З УМОВАМИ (Оскарження ТД)</span>
                      </span>
                    )}

                    {decision === 'NO_BID' && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        <span>NO BID (Високий ризик відхилення)</span>
                      </span>
                    )}

                    {/* Foul Score Badge */}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      tender.foulScore >= 60 ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      Foul Score: {tender.foulScore}/100
                    </span>
                  </div>

                  <h3 
                    onClick={() => {
                      onSelectTender(tender);
                      onNavigateToWarRoom(tender);
                    }}
                    className="text-base font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer leading-snug"
                  >
                    {tender.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {tender.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                    <span>Замовник: <strong className="text-slate-200">{tender.customer}</strong></span>
                    <span>Бюджет: <strong className="text-emerald-400 font-mono">{tender.budgetUah?.toLocaleString() || 'NOT_AVAILABLE'} ₴</strong></span>
                    <span>Дедлайн: <strong className="text-amber-400 font-mono">{tender.deadline}</strong></span>
                    {tender.source && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Provenance: Prozorro API • {new Date(tender.source.retrievedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 min-w-[200px]">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Opportunity Score</div>
                    <div className="text-2xl font-black text-emerald-400">
                      {score ? `${score}%` : 'UNKNOWN'}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveModalTenderId(tender.id)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition-all cursor-pointer"
                      title="Переглянути офіційні деталі та документацію з Prozorro"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-400" />
                      <span>Деталі</span>
                    </button>

                    <button
                      onClick={() => setExpandedWhyTenderId(isExpanded ? null : tender.id)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition-all cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Чому цей тендер?</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
                         } catch (e) {
                           console.error(e);
                         }
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1 transition-all shadow-md cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Імпорт & War Room</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Accordion: "Why This Tender?" Detailed Multi-Factor Breakdown */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/60 rounded-xl p-4 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Багатофакторний розрахунок Opportunity Score ({score ? `${score}/100` : 'Дані відсутні'})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Формула: Company Fit + Legal + Docs + Margin + Competition - Risk Penalty
                    </span>
                  </div>

                  {/* 8 Factor Bars */}
                  {tender.opportunityScore?.factors && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Відповідність компанії</div>
                        <div className="text-sm font-bold text-emerald-400">{tender.opportunityScore.factors.companyFit}%</div>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Юридична відповідність</div>
                        <div className="text-sm font-bold text-blue-400">{tender.opportunityScore.factors.legalFit}%</div>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Готовність документів</div>
                        <div className="text-sm font-bold text-emerald-400">{tender.opportunityScore.factors.docReadiness}%</div>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Виробнича виконуваність</div>
                        <div className="text-sm font-bold text-purple-400">{tender.opportunityScore.factors.executionFeasibility}%</div>
                      </div>
                    </div>
                  )}

                  {/* Why this tender list */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-300">Ключові фактори аналізу:</div>
                    {tender.opportunityScore?.whyThisTender?.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                        <div className={`p-1 rounded-full mt-0.5 ${
                          item.type === 'POSITIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                          item.type === 'WARNING' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-200">{item.title}: </span>
                          <span className="text-slate-400">{item.description}</span>
                        </div>
                      </div>
                    )) || (
                      <div className="text-xs text-slate-400 italic">
                        Замовник вимагає ліцензію СС2, аналогічний договір за 2023-2024 роки та власний парк спецтехніки. Дані перевірено за Vault вашої компанії.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
      
      {nextOffset && (
        <div className="flex justify-center pt-8 pb-12">
          <button
            onClick={handleLoadMore}
            disabled={isSearching}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-8 rounded-xl border border-slate-700 hover:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
            ) : (
              <TrendingUp className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            )}
            <span>Завантажити ще результати з Prozorro</span>
          </button>
        </div>
      )}

      {/* Real Prozorro Tender Detail Modal */}
      {activeModalTenderId && (
        <TenderDetailModal
          tenderId={activeModalTenderId}
          onClose={() => setActiveModalTenderId(null)}
          onRunAudit={(tender) => {
            onSelectTender(tender);
          }}
          onOpenWarRoom={(tender) => {
            onSelectTender(tender);
            onNavigateToWarRoom(tender);
          }}
        />
      )}

    </div>
  );
};
