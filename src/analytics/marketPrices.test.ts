import { describe, expect, it } from 'vitest';
import { aggregateMarketPrices } from './marketPrices.ts';

describe('DuckDB market price aggregation', () => {
  it('computes reproducible aggregates from cited observations', async () => {
    const result = await aggregateMarketPrices([{
      code: 'verified-code', name: 'Verified item', unit: 'шт', quantity: 2, estimatePriceUah: 150,
      observations: [
        { priceUah: 100, sourceUrl: 'https://vendor.example/a', sourceTitle: 'Vendor A', retrievedAt: '2026-08-30T10:00:00Z' },
        { priceUah: 120, sourceUrl: 'https://vendor.example/b', sourceTitle: 'Vendor B', retrievedAt: '2026-08-30T11:00:00Z' },
      ],
    }]);
    expect(result.items[0]).toMatchObject({ marketAvgPriceUah: 110, marketMedianPriceUah: 110, variancePercent: 36.36, anomalyRisk: 'OVERPRICED', status: 'VERIFIED' });
  });

  it('returns UNKNOWN rather than inventing a price with insufficient provenance', async () => {
    const result = await aggregateMarketPrices([{ code: 'x', name: 'X', unit: 'шт', quantity: 1, estimatePriceUah: null, observations: [] }]);
    expect(result.items[0]).toMatchObject({ status: 'UNKNOWN', marketAvgPriceUah: null, anomalyRisk: 'UNKNOWN' });
  });
});
