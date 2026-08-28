import { describe, it, expect } from 'vitest';
import { detectCollusionRisk } from './collusionEngine';
import { CompetitorProfile } from '../types';

describe('Collusion Risk Engine', () => {
  const mockCompetitors: CompetitorProfile[] = [
    {
      id: '1',
      name: 'Comp A',
      edrpou: '111',
      winRatePercent: 80,
      totalTenders: 10,
      avgPriceDropPercent: 0.1,
      disqualificationRatePercent: 0,
      suspiciousPairingsCount: 5,
      frequentPartners: [],
      riskIndicators: []
    },
    {
      id: '2',
      name: 'Comp B',
      edrpou: '222',
      winRatePercent: 10,
      totalTenders: 10,
      avgPriceDropPercent: 0.2,
      disqualificationRatePercent: 0,
      suspiciousPairingsCount: 5,
      frequentPartners: [],
      riskIndicators: []
    }
  ];

  it('detects high risk for nominal bidding and shared history', () => {
    const analysis = detectCollusionRisk({
      tenderId: 'T-1',
      tenderTitle: 'Test Tender',
      competitors: mockCompetitors,
      history: { jointBidsCount: 6, commonIPs: true }
    });

    expect(analysis.collusionRiskScore).toBeGreaterThanOrEqual(70);
    expect(analysis.riskLevel).toBe('CRITICAL');
    expect(analysis.anomaliesDetected.length).toBeGreaterThan(0);
  });

  it('returns low risk for single competitor', () => {
    const analysis = detectCollusionRisk({
      tenderId: 'T-2',
      tenderTitle: 'Solo Tender',
      competitors: [mockCompetitors[0]]
    });

    expect(analysis.collusionRiskScore).toBe(0);
    expect(analysis.riskLevel).toBe('LOW');
  });
});
