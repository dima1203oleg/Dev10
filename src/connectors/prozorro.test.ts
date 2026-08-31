import { describe, expect, it } from 'vitest';
import { calculatePersonalRadarMatch } from './prozorro';

describe('deterministic fit score', () => {
  it('returns insufficient data instead of fabricated defaults', () => {
    const result = calculatePersonalRadarMatch({ title: 'Закупівля без структурованих полів' }, { vaultData: {} });
    expect(result.status).toBe('INSUFFICIENT_DATA');
    expect(result.fitScore).toBeNull();
    expect(result.coverage).toBe(0);
  });

  it('returns a reproducible weighted breakdown from supplied evidence', () => {
    const tender = { category: '45210000-2', budgetUah: 2_000_000, region: 'Київська область', requiredLicenses: ['будівельна ліцензія'] };
    const profile = { vaultData: { cpvCodes: ['45210000-2'], minTenderBudget: 500_000, maxTenderBudget: 5_000_000, regionsOfWork: ['Київська область'], licenses: ['Будівельна ліцензія'], vaultDocuments: [{ id: 'verified-document' }], staff: [{ id: 'verified-person' }] } };
    const first = calculatePersonalRadarMatch(tender, profile);
    const second = calculatePersonalRadarMatch(tender, profile);
    expect(first.fitScore).toBe(100);
    expect(first.status).toBe('AVAILABLE');
    expect(first.breakdown).toEqual(second.breakdown);
    expect(first.weightsVersion).toBe('FIT_SCORE_V1');
  });
});
