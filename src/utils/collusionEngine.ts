/**
 * FoulTender Cartel & Collusion Risk Detection Engine
 * Deterministic analysis based on market data, co-bidding patterns, EDRPOU relations, and bidding behaviors.
 */

import { CompetitorProfile, CollusionAnalysis } from '../types';

export interface CollusionScanInput {
  tenderId: string;
  tenderTitle: string;
  competitors: CompetitorProfile[];
  history?: {
    commonIPs?: boolean;
    sharedAddresses?: boolean;
    zeroPriceDropBids?: number;
    jointBidsCount?: number;
  };
}

export function detectCollusionRisk(input: CollusionScanInput): CollusionAnalysis {
  const { tenderId, competitors = [], history = {} } = input;
  let riskScore = 0;
  const anomaliesDetected: { title: string; description: string; evidence: string }[] = [];
  const primarySuspects: string[] = [];
  const coBiddingGraph: { source: string; target: string; sharedTenders: number; winDistribution: string }[] = [];

  if (competitors.length < 2) {
    return {
      tenderId,
      collusionRiskScore: 0,
      riskLevel: 'LOW',
      primarySuspects: [],
      anomaliesDetected: [],
      coBiddingGraph: []
    };
  }

  // 1. Zero Price Drop / Nominal Bidding Pattern
  const zeroDropCompetitors = competitors.filter(c => c.avgPriceDropPercent <= 1);
  if (zeroDropCompetitors.length >= 2) {
    riskScore += 35;
    zeroDropCompetitors.forEach(c => primarySuspects.push(c.name));
    anomaliesDetected.push({
      title: "Номінальні пропозиції без зниження ціни (Спаринг-партнери)",
      description: `Учасники ${zeroDropCompetitors.map(c => c.name).join(', ')} регулярно подають пропозиції зі зниженням < 1%, виконуючи роль статистів для створення видимості конкуренції.`,
      evidence: `Аналіз торгів: середнє зниження ціни становить ${zeroDropCompetitors.map(c => `${c.name} (~${c.avgPriceDropPercent}%)`).join(', ')}.`
    });
  }

  // 2. High Pairwise Co-bidding Frequency
  for (let i = 0; i < competitors.length; i++) {
    for (let j = i + 1; j < competitors.length; j++) {
      const compA = competitors[i];
      const compB = competitors[j];
      const sharedTenders = history.jointBidsCount || 0;

      if (sharedTenders >= 3) {
        riskScore += Math.min(45, sharedTenders * 5);
        if (!primarySuspects.includes(compA.name)) primarySuspects.push(compA.name);
        if (!primarySuspects.includes(compB.name)) primarySuspects.push(compB.name);

        coBiddingGraph.push({
          source: compA.name,
          target: compB.name,
          sharedTenders,
          winDistribution: `${compA.winRatePercent}% / ${compB.winRatePercent}%`
        });

        anomaliesDetected.push({
          title: "Стійка пара учасників у торгах замовника",
          description: `Виявлено аномальну частоту спільної участі компаній ${compA.name} та ${compB.name} у закупівлях.`,
          evidence: `Спільних торгів: ${sharedTenders}. Розподіл перемог: ${compA.name} (${compA.winRatePercent}%), ${compB.name} (${compB.winRatePercent}%).`
        });
      }
    }
  }

  // 3. Shared Metadata or IP / Address Marker
  if (history.commonIPs || history.sharedAddresses) {
    riskScore += 30;
    anomaliesDetected.push({
      title: "Збіг технічних метаданих / IP / Адреси реєстрації",
      description: "Заявки подані з одного ІР-діапазону або учасники мають спільну фізичну адресу / номер телефону.",
      evidence: "Мережевий аналіз Prozorro API & PDF EXIF Metadata."
    });
  }

  // Cap risk score at 100
  const finalScore = Math.min(100, Math.max(0, riskScore));
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (finalScore >= 70) riskLevel = 'CRITICAL';
  else if (finalScore >= 50) riskLevel = 'HIGH';
  else if (finalScore >= 30) riskLevel = 'MEDIUM';

  return {
    tenderId,
    collusionRiskScore: finalScore,
    riskLevel,
    primarySuspects: Array.from(new Set(primarySuspects)),
    anomaliesDetected,
    coBiddingGraph
  };
}
