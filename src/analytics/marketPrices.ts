import { DuckDBConnection } from '@duckdb/node-api';

export interface PriceObservation {
  priceUah: number;
  sourceUrl: string;
  sourceTitle: string;
  retrievedAt: string;
}

export interface MarketPriceItem {
  code: string;
  name: string;
  unit: string;
  quantity: number;
  estimatePriceUah: number | null;
  observations: PriceObservation[];
}

export async function aggregateMarketPrices(items: MarketPriceItem[]) {
  const connection = await DuckDBConnection.create();
  const results = [];
  try {
    for (const item of items) {
    if (!item.code?.trim() || !item.name?.trim() || !item.unit?.trim() || !Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new Error('INVALID_MARKET_PRICE_ITEM');
    }
    const observations = item.observations.filter((observation) => {
      if (!Number.isFinite(observation.priceUah) || observation.priceUah <= 0) return false;
      if (!observation.sourceTitle?.trim() || !Number.isFinite(Date.parse(observation.retrievedAt))) return false;
      try { return new URL(observation.sourceUrl).protocol === 'https:'; } catch { return false; }
    });
    if (observations.length < 2) {
      results.push({ ...item, observations, status: 'UNKNOWN', marketAvgPriceUah: null, marketMedianPriceUah: null, variancePercent: null, anomalyRisk: 'UNKNOWN' });
      continue;
    }
    const reader = await connection.runAndReadAll(
      'SELECT avg(CAST(value AS DOUBLE)) AS avg_price, median(CAST(value AS DOUBLE)) AS median_price, min(CAST(value AS DOUBLE)) AS min_price, max(CAST(value AS DOUBLE)) AS max_price FROM json_each(?)',
      [JSON.stringify(observations.map((observation) => observation.priceUah))],
    );
    const [stats] = reader.getRowObjectsJS() as Array<Record<string, number>>;
    const average = stats.avg_price;
    const variancePercent = item.estimatePriceUah == null || !Number.isFinite(item.estimatePriceUah)
      ? null
      : Number((((item.estimatePriceUah - average) / average) * 100).toFixed(2));
    const anomalyRisk = variancePercent == null ? 'UNKNOWN' : variancePercent > 15 ? 'OVERPRICED' : variancePercent < -15 ? 'UNDERESTIMATED' : 'NORMAL';
    results.push({
      ...item,
      observations,
      status: 'VERIFIED',
      marketAvgPriceUah: Number(average.toFixed(2)),
      marketMedianPriceUah: Number(stats.median_price.toFixed(2)),
      priceRangeUah: { min: stats.min_price, max: stats.max_price },
      variancePercent,
      anomalyRisk,
      aggregationEngine: 'duckdb',
    });
    }
    return { formulaVersion: 'market-price-v1', items: results };
  } finally {
    connection.closeSync();
  }
}
