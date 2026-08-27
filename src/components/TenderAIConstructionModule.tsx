import React, { useState } from 'react';
import { Tender, BoQItem, MultiAgentReport, AppSection } from '../types';
import { 
  Building2, 
  Bot, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Calculator, 
  Calendar, 
  Layers, 
  FileCheck2, 
  Briefcase,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface TenderAIConstructionModuleProps {
  currentTender: Tender;
  allTenders: Tender[];
  onSelectTender: (tender: Tender) => void;
  onNavigate: (section: AppSection) => void;
  onUpdateTenderBoq: (tenderId: string, boqItems: BoQItem[]) => void;
  onUpdateTenderAnalysis: (tenderId: string, report: MultiAgentReport) => void;
}

export const TenderAIConstructionModule: React.FC<TenderAIConstructionModuleProps> = ({
  currentTender,
  allTenders,
  onSelectTender,
  onNavigate,
  onUpdateTenderBoq,
  onUpdateTenderAnalysis,
}) => {
  const [boqItems, setBoqItems] = useState<BoQItem[]>(currentTender.boqItems || []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'boq-table' | 'agent-consilium' | 'pricing-strategy'>('agent-consilium');

  // Trigger Multi-Agent AI Consilium
  const handleRunMultiAgentAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/tenderai/multi-agent-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderTitle: currentTender.title,
          budget: currentTender.budgetUah,
          boqItems: boqItems,
          projectScope: currentTender.tenderText,
          specifications: currentTender.specifications,
        }),
      });
      const data = await res.json();
      onUpdateTenderAnalysis(currentTender.id, data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add new BoQ line item
  const handleAddBoqItem = () => {
    const newItem: BoQItem = {
      id: `boq-new-${Date.now()}`,
      code: 'ДБН Р-0-000',
      description: 'Нова будівельно-монтажна позиція',
      unit: 'м²',
      quantity: 100,
      standardPriceUah: 1500,
      marketPriceUah: 1350,
      laborHours: 50,
      anomaly: 'NORMAL',
    };
    const updated = [...boqItems, newItem];
    setBoqItems(updated);
    onUpdateTenderBoq(currentTender.id, updated);
  };

  // Remove BoQ line item
  const handleRemoveBoqItem = (id: string) => {
    const updated = boqItems.filter(item => item.id !== id);
    setBoqItems(updated);
    onUpdateTenderBoq(currentTender.id, updated);
  };

  // Update BoQ item field
  const handleUpdateBoqItem = (id: string, field: keyof BoQItem, value: any) => {
    const updated = boqItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setBoqItems(updated);
    onUpdateTenderBoq(currentTender.id, updated);
  };

  const totalBoqCost = boqItems.reduce((acc, item) => acc + (item.quantity * item.marketPriceUah), 0);
  const analysis = currentTender.multiAgentAnalysis;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Module Header */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-900/50 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>TenderAI Construction SaaS • Multi-Agent Estimator & Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Мультиагентна підготовка будівельного тендеру
          </h1>
          <p className="text-sm text-slate-300">
            Кошторисний аналіз BoQ, ДБН технологічний графік ГІПа, кваліфікаційний комплаєнс та цінова стратегія
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center space-x-2">
          <select
            aria-label="Виберіть будівельний проєкт"
            value={currentTender.id}
            onChange={(e) => {
              const found = allTenders.find(t => t.id === e.target.value);
              if (found) {
                onSelectTender(found);
                setBoqItems(found.boqItems || []);
              }
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
          >
            {allTenders.map(t => (
              <option key={t.id} value={t.id}>
                {t.tenderNumber}: {t.title.slice(0, 45)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('agent-consilium')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'agent-consilium'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Мультиагентний консиліум (5 Агентів)</span>
          </button>

          <button
            onClick={() => setActiveTab('boq-table')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'boq-table'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Відомість робіт BoQ ({boqItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing-strategy')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'pricing-strategy'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Цінова стратегія & Аукціон</span>
          </button>
        </div>

        {/* Consilium action button */}
        <button
          id="run-multiagent-consilium-btn"
          disabled={isAnalyzing}
          onClick={handleRunMultiAgentAnalysis}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/30 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Мультиагенти проводять розрахунок...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Запустити консиліум ШІ</span>
            </>
          )}
        </button>
      </div>

      {/* TAB 1: Multi-Agent Consilium View */}
      {activeTab === 'agent-consilium' && (
        <div className="space-y-6">
          
          {/* Executive Decision Banner */}
          {analysis && (
            <div className={`border rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              analysis.overallDecision === 'GO'
                ? 'bg-emerald-950/40 border-emerald-800/80'
                : analysis.overallDecision === 'GO_WITH_CONDITIONS'
                ? 'bg-blue-950/40 border-blue-800/80'
                : 'bg-red-950/40 border-red-800/80'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Рішення мультиагентного консиліуму:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase ${
                    analysis.overallDecision === 'GO'
                      ? 'bg-emerald-500 text-slate-950'
                      : analysis.overallDecision === 'GO_WITH_CONDITIONS'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-red-500 text-white'
                  }`}>
                    {analysis.overallDecision === 'GO' ? 'УЧАСТЬ РЕКОМЕНДОВАНА' : analysis.overallDecision === 'GO_WITH_CONDITIONS' ? 'УЧАСТЬ З УМОВАМИ' : 'ВІДХИЛИТИ ПРОЄКТ'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Прорахована собівартість: <span className="text-emerald-400 font-mono">{(analysis.totalCalculatedCost).toLocaleString()} ₴</span> • Очікувана маржа: <span className="text-emerald-400 font-mono">{analysis.expectedMarginPercent}%</span>
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('bid-packages')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Сформувати тендерний пакет</span>
                </button>
              </div>
            </div>
          )}

          {/* 5 Specialized Agent Reports */}
          {analysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Agent 1: Estimator */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{analysis.agents.estimator.avatar}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{analysis.agents.estimator.agentName}</h4>
                        <div className="text-[11px] text-emerald-400 font-medium">Кошторис & BoQ (АВК-5)</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {analysis.agents.estimator.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                    {analysis.agents.estimator.summary}
                  </p>

                  {analysis.agents.estimator.costBreakdown && (
                    <div className="space-y-1 text-[11px] pt-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Матеріали:</span>
                        <strong className="text-slate-200 font-mono">{(analysis.agents.estimator.costBreakdown.materialsCost).toLocaleString()} ₴</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Оплата праці:</span>
                        <strong className="text-slate-200 font-mono">{(analysis.agents.estimator.costBreakdown.laborCost).toLocaleString()} ₴</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Техніка та машини:</span>
                        <strong className="text-slate-200 font-mono">{(analysis.agents.estimator.costBreakdown.machineryCost).toLocaleString()} ₴</strong>
                      </div>
                    </div>
                  )}
                </div>

                {analysis.agents.estimator.recommendations && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300/90">
                    💡 <strong>Порада кошторисника:</strong> {analysis.agents.estimator.recommendations[0]}
                  </div>
                )}
              </div>

              {/* Agent 2: Tech Lead */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{analysis.agents.techLead.avatar}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{analysis.agents.techLead.agentName}</h4>
                        <div className="text-[11px] text-blue-400 font-medium">Технологія & ДБН</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {analysis.agents.techLead.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                    {analysis.agents.techLead.summary}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Технологічний строк:</span>
                    <strong className="text-blue-400 font-bold">{analysis.agents.techLead.timelineWeeks || 12} тижнів</strong>
                  </div>
                </div>

                {analysis.agents.techLead.keyRisks && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300/90">
                    ⚠️ <strong>Інженерний ризик:</strong> {analysis.agents.techLead.keyRisks[0]}
                  </div>
                )}
              </div>

              {/* Agent 3: Legal Counsel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{analysis.agents.legalCounsel.avatar}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{analysis.agents.legalCounsel.agentName}</h4>
                        <div className="text-[11px] text-amber-400 font-medium">Кваліфікація ст. 16</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {analysis.agents.legalCounsel.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                    {analysis.agents.legalCounsel.summary}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Комплаєнс відповідності:</span>
                    <strong className="text-emerald-400 font-bold">{analysis.agents.legalCounsel.complianceScore || 95}%</strong>
                  </div>
                </div>

                {analysis.agents.legalCounsel.requiredCertificates && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    📜 <strong>Потрібно:</strong> {analysis.agents.legalCounsel.requiredCertificates.join(', ')}
                  </div>
                )}
              </div>

              {/* Agent 4: FoulTender Guardian */}
              <div className="bg-slate-900 border border-red-900/40 rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{analysis.agents.antiFraud.avatar}</span>
                      <div>
                        <h4 className="font-bold text-sm text-red-300">{analysis.agents.antiFraud.agentName}</h4>
                        <div className="text-[11px] text-red-400 font-medium">FoulTender Guard</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                      Foul Score: {analysis.agents.antiFraud.corruptionRiskScore || currentTender.foulScore}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                    {analysis.agents.antiFraud.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Перевірка ризику:</span>
                  <button
                    onClick={() => onNavigate('foultender')}
                    className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center space-x-1"
                  >
                    <span>Аудит порушень</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Agent 5: Bid Manager */}
              <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between md:col-span-2 lg:col-span-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{analysis.agents.bidManager.avatar}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{analysis.agents.bidManager.agentName}</h4>
                        <div className="text-[11px] text-indigo-400 font-medium">Цінова стратегія редукціону</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {analysis.agents.bidManager.readinessScore ? `Оцінка готовності: ${analysis.agents.bidManager.readinessScore}%` : 'Недостатньо історичних даних'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                    {analysis.agents.bidManager.summary}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                      <div className="text-[11px] text-slate-400">Рекомендована ставка на аукціоні</div>
                      <div className="text-lg font-bold text-emerald-400 font-mono">
                        {(analysis.agents.bidManager.recommendedBidPrice || analysis.totalCalculatedCost * 1.15).toLocaleString()} ₴
                      </div>
                    </div>

                    <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                      <div className="text-[11px] text-slate-400">Очікуваний чистий прибуток</div>
                      <div className="text-lg font-bold text-indigo-300 font-mono">
                        {((analysis.agents.bidManager.recommendedBidPrice || analysis.totalCalculatedCost * 1.15) - analysis.totalCalculatedCost).toLocaleString()} ₴
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Потрібна деталізація з агентом?</span>
                  <button
                    onClick={() => onNavigate('multiagent-chat')}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <span>Задати питання агентам у чаті</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <Bot className="w-12 h-12 text-emerald-400 mx-auto" />
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-white">Мультиагентний аналіз ще не запущено</h3>
                <p className="text-xs text-slate-400">
                  Натисніть кнопку «Запустити консиліум ШІ» зверху, щоб отримати повний розрахунок від 5 спеціалізованих агентів.
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: BoQ Table View */}
      {activeTab === 'boq-table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Відомість обсягів робіт (Bill of Quantities / BoQ)</span>
              </h2>
              <p className="text-xs text-slate-400">Редагуйте розцінки, обсяги або додавайте нові позиції для перерахунку</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-xs text-slate-300">
                Загальна кошторисна вартість: <strong className="text-emerald-400 font-mono text-sm">{totalBoqCost.toLocaleString()} ₴</strong>
              </div>

              <button
                id="add-boq-item-btn"
                onClick={handleAddBoqItem}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Додати позицію</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Шифр ДБН</th>
                  <th className="p-3">Найменування робіт та витрат</th>
                  <th className="p-3">Од.</th>
                  <th className="p-3">Кількість</th>
                  <th className="p-3">Ціна ТД (₴)</th>
                  <th className="p-3">Ринкова ціна (₴)</th>
                  <th className="p-3">Разом (₴)</th>
                  <th className="p-3">Статус ціни</th>
                  <th className="p-3 text-right">Дія</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {boqItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-3 font-mono font-medium text-slate-400">
                      <input
                        type="text"
                        value={item.code}
                        onChange={(e) => handleUpdateBoqItem(item.id, 'code', e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-slate-600 focus:outline-none w-20"
                      />
                    </td>
                    <td className="p-3 font-medium text-white max-w-xs">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateBoqItem(item.id, 'description', e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-slate-600 focus:outline-none w-full"
                      />
                    </td>
                    <td className="p-3 text-slate-400">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateBoqItem(item.id, 'unit', e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-slate-600 focus:outline-none w-10 text-center"
                      />
                    </td>
                    <td className="p-3 font-mono text-slate-200">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateBoqItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-20 font-mono text-white text-right"
                      />
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      <input
                        type="number"
                        value={item.standardPriceUah}
                        onChange={(e) => handleUpdateBoqItem(item.id, 'standardPriceUah', parseFloat(e.target.value) || 0)}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-24 font-mono text-slate-300 text-right"
                      />
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">
                      <input
                        type="number"
                        value={item.marketPriceUah}
                        onChange={(e) => handleUpdateBoqItem(item.id, 'marketPriceUah', parseFloat(e.target.value) || 0)}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-24 font-mono text-emerald-400 text-right"
                      />
                    </td>
                    <td className="p-3 font-mono font-bold text-white">
                      {(item.quantity * item.marketPriceUah).toLocaleString()}
                    </td>
                    <td className="p-3">
                      {item.anomaly === 'OVERPRICED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          Завищено в ТД
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          В ринку
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRemoveBoqItem(item.id)}
                        className="text-slate-500 hover:text-red-400 p-1 transition-all"
                        title="Видалити"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Pricing Strategy */}
      {activeTab === 'pricing-strategy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>3-Раундова тактика аукціону та оптимізація прибутку</span>
            </h2>
            <p className="text-xs text-slate-400">ШІ-рекомендації для максимальної ймовірності перемоги без втрати рентабельності</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Round 1 */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Раунд 1 • Початкова ставка</div>
              <div className="text-xl font-bold text-white font-mono">
                {((currentTender.budgetUah * 0.94)).toLocaleString()} ₴
              </div>
              <p className="text-xs text-slate-300">
                Знижка 6% від очікуваної вартості. Дозволяє зафіксувати позицію в середині списку учасників.
              </p>
            </div>

            {/* Round 2 */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Раунд 2 • Контроль демпінгу</div>
              <div className="text-xl font-bold text-white font-mono">
                {((currentTender.budgetUah * 0.89)).toLocaleString()} ₴
              </div>
              <p className="text-xs text-slate-300">
                Знижка 11%. Відсікання конкурентів без прямого доступу до виробників матеріалів.
              </p>
            </div>

            {/* Round 3 */}
            <div className="bg-emerald-950/50 border border-emerald-800 rounded-xl p-4 space-y-2">
              <div className="text-[11px] font-bold text-emerald-400 uppercase">Раунд 3 • Фінальна перемога</div>
              <div className="text-xl font-bold text-emerald-300 font-mono">
                {(analysis?.agents.bidManager.recommendedBidPrice || (currentTender.budgetUah * 0.85)).toLocaleString()} ₴
              </div>
              <p className="text-xs text-slate-200">
                Оптимальна ціна перемоги. Гарантована маржа 18.5% після покриття всіх прямих та непрямих витрат.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
