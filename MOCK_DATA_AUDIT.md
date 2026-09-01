# TENDERAI OS — MOCK DATA AUDIT
## ZERO MOCK DATA COMPLIANCE & VERIFICATION SYSTEM STATEMENT
**Document ID:** TA-MDA-001  
**Compliance Standard:** Strict Real-Data Enforcement Rule

> **Current verification override — 2026-08-31:** `PARTIAL`. Generated corporate/social feeds, dev-mock authentication, synthetic BoQ/Gantt data, random calculations and artificial parsing delays were removed from the modified runtime paths. A repository-wide control-by-control scan and authenticated E2E are still required before `PASS`.

**Latest implementation evidence:** the fabricated Prozorro tender-detail fallback and sample legal/AI request defaults were removed; incomplete official records now retain `null/UNKNOWN`, and missing source inputs return validation errors. Further runtime paths still require review, so status remains `PARTIAL`.

**Zero-mock gate update:** known fabricated tender records, UI notifications, fallback CPV/keywords, default Fit Score and random business values are now rejected by `src/tests/zeroMock.test.ts`. The audited runtime routes return `UNKNOWN`, empty collections or validation errors when evidence is missing.

**2026-08-31 runtime recheck:** multi-agent numeric analysis and AI tender ingestion now fail closed until persisted, source-cited data exists; bid/round/package views render `UNKNOWN` instead of synthetic price, margin, or timeline fallbacks. Offline tests/build pass; authenticated E2E remains pending.

**2026-09-01 runtime recheck:** null Prozorro budgets, FoulTender scores and bid-package values are rendered as `UNKNOWN`; the former construction pricing discount and null-unsafe package/audit formatting were removed. Browser smoke used live Prozorro records and intentionally left unverified AI/OCR outputs blocked.

**2026-09-01 follow-up:** Construction BoQ aggregate and price-status cells now remain `UNKNOWN` until every row has a confirmed market price; persisted rows are loaded from PostgreSQL.

**Estimate runner correction:** the synthetic estimate test runner and generated report path were removed from runtime diagnostics; no fallback prices or Go/No-Go numbers are emitted by production verification.

---

## 1. Zero Mock Data Policy

Operating as a production-ready enterprise SaaS, TenderAI OS implements a strict policy against any placeholder stats, simulated lists, or mock data structures.

```
                              ┌──────────────────────────┐
                              │     MOCK-CHECK LINTER    │
                              ├──────────────────────────┤
                              │ Detect: 'fakeData'       │
                              │ Detect: 'mockData'       │
                              │ Detect: 'dummyData'      │
                              └────────────┬─────────────┘
                                           │ Scan Results
                                           ▼
                              ┌──────────────────────────┐
                              │   PRODUCTION DEPLOYMENT  │
                              │   Approved: 100% Real    │
                              └──────────────────────────┘
```

---

## 2. Audited Banned Code Patterns

The following patterns are strictly banned in our codebase. Any occurrence will instantly fail CI/CD build pipelines:

```tsx
// ❌ BANNED CRITICAL FAILURE: Banned placeholder statistics
const dummyTenders = [
  { id: 1, title: "Mock Reconstruction Tender 1", price_uah: 15000000.00 },
  { id: 2, title: "Mock Reconstruction Tender 2", price_uah: 42000000.00 }
];

// ❌ BANNED CRITICAL FAILURE: Simulate network loading using mock delays
const handleLoading = () => {
  setLoading(true);
  setTimeout(() => {
    setLoading(false); // Simulated callback placeholder
  }, 2000);
};
```

---

## 3. Approved Real-Data Code Architecture

All UI components must bind directly to active API routes connected to verified databases:

```tsx
// ✅ APPROVED: Dynamically fetch real datasets from API endpoints
import React, { useEffect, useState } from "react";
import { Tender } from "../types";

export const TenderList: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tenders/active")
      .then((res) => res.json())
      .then((data) => {
        setTenders(data.dataset);
        setIsLoading(false);
      })
      .catch((err) => console.error("Database connection lost:", err));
  }, []);

  return (
    <div className="p-4 bg-neutral-50 rounded border border-neutral-200">
      <h3 className="font-semibold text-neutral-900 mb-3">Live Audited Tenders</h3>
      {isLoading ? (
        <span className="text-sm text-neutral-500">Connecting to database...</span>
      ) : (
        <ul className="space-y-2">
          {tenders.map((item) => (
            <li key={item.id} className="text-sm bg-white p-2 rounded border border-neutral-100">
              {item.title} — <strong className="text-neutral-900">{item.price_uah.toLocaleString()} UAH</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```
# Independent re-audit (2026-08-31)

**Status: FAIL.** Synthetic production paths remain in `CostEstimateAnalysisModule.tsx` (sample AVK/Excel reports, invented suppliers/URLs, random financial calculations and simulated parsing). Generated corporate/social tender results and fabricated `/api/data` seeding were identified and disabled. This section supersedes any earlier PASS claim.

## Re-audit 2026-09-01

Removed remaining runtime fallback values from Company Profile, Dashboard and Pre-Submission gauges; absent persisted evidence is rendered as `UNKNOWN`. Test-only fixtures remain isolated under test files. Production release remains NOT READY pending live service gates.

The connector self-test no longer embeds a mock company/tender Radar fixture; it reports an explicit non-production failure when no live tenant context is supplied.

War Room QA no longer embeds sanctions, staffing, bank-guarantee or certificate claims; it renders only the persisted readiness checklist.

War Room progress and pipeline statuses no longer claim completion without corresponding persisted evidence.
