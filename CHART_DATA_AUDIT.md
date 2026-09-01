# TENDERAI OS — CHART DATA AUDIT
## ANALYTICAL VISUALIZATION CONTRACTS & VERIFIED GRAPH QUERIES
**Document ID:** TA-CDA-001  
**Standard:** No Mock Data • DuckDB/PostgreSQL Sourced Analytics

> **Current verification override — 2026-08-31:** `FAIL / BLOCKED`. No complete chart-to-independent-SQL/DuckDB reconciliation has been executed. Any statement below claiming every chart is verified is superseded until each number, empty-data state, filter and export has reproducible evidence.

**Deterministic score update:** pre-submission readiness is now computed by versioned formula `pre-submission-v1` from document hashes/statuses, requirement statuses, persisted BoQ values and source hashes. Missing evidence scores zero and blocks submission; Gemini is not involved. The wider chart/DuckDB gate remains blocked.

**DuckDB evidence update:** market-price averages, medians, ranges and variance are now calculated by DuckDB formula `market-price-v1` only from validated HTTPS observations with retrieval timestamps. Fewer than two valid observations produce `UNKNOWN`; Gemini no longer creates prices or source links.

**Risk engine update:** collusion numbers are produced only by the deterministic evidence engine covered by unit tests; the former Gemini-generated score path was removed.

**2026-09-01 execution note:** UI smoke confirmed empty/unknown states for unverified scores and prices; complete chart reconciliation remains `BLOCKED`.

---

## 1. Verified Analytics Visualization Framework

In accordance with our strict **No Mock Data** rule, all charts, graphs, and network visualizations displayed on the TenderAI dashboard are dynamically populated from real-time database queries. 

```
┌────────────────────────────────────────────────────────┐
│               VISUAL CHART DATAFLOW                    │
├────────────────────────────────────────────────────────┤
│ 1. Frontend Recharts Component requests metrics        │
│ 2. Backend Endpoint handles request                    │
│ 3. DuckDB / PostgreSQL executes verified query         │
│ 4. Metrics aggregated and returned as dynamic JSON     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Dynamic Charts Audit Register

| Chart ID | Target UI Layout | SQL / Columnar Query | Data Source | Aggregation | Timezone | Update Frequency |
|---|---|---|---|---|---|---|
| `ch_price_trends` | Procurement Dashboard | `SELECT DATE_TRUNC('month', date) AS month, AVG(price) AS avg_price FROM tenders GROUP BY month` | PostgreSQL | Monthly Average Price | EET (UTC+2) | Hourly |
| `ch_bidder_margins`| Cartel / Collusion Page | `SELECT margin, COUNT(*) AS bids_count FROM competitor_bids GROUP BY margin` | DuckDB Memory | Margin Deviation count | EET (UTC+2) | On-Demand |
| `ch_win_ratio_kv` | Supplier Profile Card | `SELECT status, COUNT(*) AS count FROM history WHERE kved = ? GROUP BY status` | PostgreSQL | Success vs Failure ratio | EET (UTC+2) | Real-time |

---

## 3. Production API Data Routing Verification

Below is the verified code template that powers the `/api/analytics/prices` route, connecting our database directly to our Recharts frontend without any hardcoded mock matrices:

```ts
// src/api/analytics.ts
import express from "express";
import { runQueryOnDuckDB } from "../lib/duckdb";

const router = express.Router();

router.get("/api/analytics/prices", async (req, res) => {
  try {
    const query = `
      SELECT 
        strftime('%Y-%m', bid_date) AS month, 
        ROUND(AVG(price_uah), 2) AS average_price,
        COUNT(*) AS total_bids
      FROM raw_procurements
      WHERE bid_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `;
    
    const aggregatedResults = await runQueryOnDuckDB(query);
    
    res.status(200).json({
      chart_id: "ch_price_trends",
      currency: "UAH",
      timezone: "EET",
      last_updated: new Date().toISOString(),
      dataset: aggregatedResults
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```
# Independent re-audit (2026-08-31)

**Status: FAIL.** Cost-estimate and supplier figures include synthetic constants and random calculations; charts derived from them are not production evidence.

Fit Score component values now preserve missing evidence as `null`; UI consumers must render UNKNOWN rather than plotting absent evidence as zero. Live chart acceptance remains blocked until independent DuckDB/SQL reconciliation is demonstrated.

Portfolio analytics now shows `Немає даних` when no numeric budgets exist and exports missing Foul Score as `UNKNOWN`; zero is no longer used as a placeholder for absent values.
