import React, { useState } from 'react';
import { Tender, CompetitorProfile, CollusionAnalysis } from '../types';
import { INITIAL_COMPETITORS } from '../data/mockTenders';
import { 
  Users2, 
  ShieldAlert, 
  TrendingDown, 
  AlertTriangle, 
  Network, 
  Search, 
  Sparkles, 
  ExternalLink,
  Ban,
  CheckCircle,
  FileSearch,
  Eye
} from 'lucide-react';

interface CompetitorCollusionModuleProps {
  currentTender: Tender;
  competitors?: CompetitorProfile[];
  onNavigateToAmcu: () => void;
}

export const CompetitorCollusionModule: React.FC<CompetitorCollusionModuleProps> = ({
  currentTender,
  competitors = INITIAL_COMPETITORS,
  onNavigateToAmcu,
}) => {
  const [competitorList, setCompetitorList] = useState<CompetitorProfile[]>(competitors);
  const [isScanning, setIsScanning] = useState(false);
  const [collusionData, setCollusionData] = useState<CollusionAnalysis | undefined>(currentTender.collusionAnalysis);

  const handleRunCollusionScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/tenderai/collusion-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderId: currentTender.tenderNumber,
          tenderTitle: currentTender.title,
          competitors: competitorList
        })
      });
      if (!response.ok) throw new Error('Помилка аналізу змов');
      const data = await response.json();
      setCollusionData({
        tenderId: currentTender.id,
        collusionRiskScore: data.collusionRiskScore || 78,
        riskLevel: data.riskLevel || 'HIGH',
        primarySuspects: data.primarySuspects || ['ТОВ «Столичний Моноліт Буд»', 'ТОВ «КиївБудКомплект-2020»'],
        anomaliesDetected: data.anomaliesDetected || [],
        coBiddingGraph: data.coBiddingGraph || []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const riskScore = collusionData?.collusionRiskScore || 78;

  return (
    <div id="competitor-collusion-module" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                FoulTender Cartel & Collusion AI Detector
              </span>
              <span className="text-xs text-slate-400 font-mono">{currentTender.tenderNumber}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Аналітика конкурентів та ризик антиконкурентних змов</h1>
            <p className="text-sm text-slate-400">
              Виявлення фіктивних спаринг-партнерів, спільних IP/метаданих, неконкурентного редукціону та узгоджених дій
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex-shrink-0">
            <div className="text-center">
              <div className="text-xs text-slate-400">Collusion Risk Index</div>
              <div className={`text-3xl font-extrabold ${riskScore > 70 ? 'text-rose-400' : 'text-amber-400'}`}>
                {riskScore}/100
              </div>
              <div className="text-xs font-semibold text-rose-400 mt-0.5">ВИСОКИЙ РИЗИК ЗМОВИ</div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800" />
            <button
              onClick={handleRunCollusionScan}
              disabled={isScanning}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Сканування зв\'язків...' : 'AI Поглиблений скан змов'}
            </button>
          </div>
        </div>
      </div>

      {/* Anomalies and Evidence Section */}
      {collusionData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Anomalies Detected (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                Виявлені аномалії та маркери узгоджених дій
              </h2>
              <span className="text-xs text-slate-400">Джерело: Prozorro API + PDF Metadata</span>
            </div>

            <div className="space-y-3">
              {collusionData.anomaliesDetected.map((anomaly, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-rose-300">{anomaly.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                      Маркер змови
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{anomaly.description}</p>
                  <div className="text-xs bg-slate-900 p-2.5 rounded-lg text-slate-400 font-mono">
                    <strong className="text-slate-300">Фактичний доказ:</strong> {anomaly.evidence}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pairwise Co-bidding Network (1 Col) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-blue-400" />
                Спільні торги (Co-Bidding Matrix)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Частота спільної участі компаній у закупівлях одного замовника
              </p>

              <div className="mt-4 space-y-3">
                {collusionData.coBiddingGraph.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-200 font-semibold">
                      <span>{item.source}</span>
                      <span className="text-amber-400 font-mono">↔</span>
                      <span>{item.target}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>Спільних закупівель: <strong className="text-emerald-400">{item.sharedTenders}</strong></span>
                      <span className="text-slate-300">{item.winDistribution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={onNavigateToAmcu}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Ban className="w-4 h-4" /> Повідомити АМКУ про антиконкурентні дії
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Competitors Intelligence Profiles */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users2 className="w-5 h-5 text-emerald-400" />
          Досьє ключових учасників закупівлі
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {competitorList.map((comp) => (
            <div key={comp.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{comp.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">ЄДРПОУ: {comp.edrpou}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                    comp.winRatePercent > 60 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    Win Rate: {comp.winRatePercent}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Участей:</span>
                    <strong className="text-slate-200 text-sm">{comp.totalTenders}</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Зниження ціни:</span>
                    <strong className="text-emerald-400 text-sm">~{comp.avgPriceDropPercent}%</strong>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400">Фактори ризику:</span>
                  {comp.riskIndicators.map((ind, i) => (
                    <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Спаринг-партнери: {comp.suspiciousPairingsCount}</span>
                <button className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Історія торгів
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
