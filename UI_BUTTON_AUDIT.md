# TENDERAI OS — UI BUTTON AUDIT
## CORE UI COMPONENT BUTTON CONTRACTS & VERIFICATION REPORT
**Document ID:** TA-UBA-001  
**Status:** NOT VERIFIED FOR PRODUCTION

> **Current verification override — 2026-08-31:** Production build passes and BoQ/Gantt screens now use persisted APIs, but the required inventory of 237 controls and authenticated Playwright evidence does not exist. Firebase browser login currently fails with `auth/internal-error`; therefore the UI gate is `BLOCKED`.

> **2026-09-01 smoke update:** 14 primary navigation controls were exercised in the local developer session. Radar → War Room → BoQ/Gantt and bid-package creation paths completed with persisted API responses; previously crashing null-budget FoulTender and Bid Package screens now render safely. Full 237-control evidence and Firebase-authenticated E2E remain `BLOCKED`.

> **2026-09-01 follow-up:** Construction BoQ tab was opened after reload; persisted rows and source-missing UNKNOWN states rendered without runtime errors.

> **2026-09-01 hidden-control update:** War Room workflow controls and direct Multi-Agent Chat entry from the no-analysis state are reachable and rendered successfully; destructive controls were not invoked.

> **2026-09-01 Team update:** Team Workspace loaded through the live browser session with task/member/audit controls present and no runtime errors. Team task/comment payloads are aligned with backend contracts; destructive create flows were not executed against the shared tenant.

> **2026-09-01 shell update:** Notification badge now reflects the persisted notification list (empty state shows zero); user menu no longer presents invented identity fallbacks.

> **2026-09-01 catalog update:** Private-project form exposes an optional deadline and opens with empty budget/category/region fields; no generated deadline is displayed.

> **2026-09-01 detail-modal update:** «Продовжити аналіз»/«Беру участь» are disabled until official Prozorro details are loaded, preventing actions on unverified data.

> **2026-09-01 collusion update:** FoulTender scan is disabled until the selected tender contains at least two competitors and verified bidding-history evidence; the UI shows the exact missing prerequisite.

> **2026-09-01 search update:** Catalog/Radar result cards no longer infer active status or construction category when the official response omits those fields.

---

## 1. Interactive Button Verification Register

TenderAI OS implements a rigorous **Testable Contract** approach for all interactive elements. Every button on our user interface must correspond to an active API route and trigger an explicit backend operation.

```
                      [ User Clicks "Sync Tenders" Button ]
                                        │
                                        ▼ Button ID: btn_sync_prozorro
                      [ POST /api/tenders/sync API Call ]
                                        │
                                        ▼ Database Transaction
                      [ Add records to PostgreSQL DB & Update UI ]
```

---

## 2. Interactive Button Verification Specifications

| Button ID | UI Location | Expected Action | Backend API Endpoint | HTTP Method | DB Operation | Expected UI State Update |
|---|---|---|---|---|---|---|
| `btn_sync_prozorro` | Header Dashboard | Triggers Prozorro sync | `/api/tenders/sync` | `POST` | `INSERT/UPDATE tenders` | Re-fetch datasets, update counts, show alert toast. |
| `btn_upload_vault` | Company Vault Page | Uploads document to Vault | `/api/documents/upload` | `POST` | `INSERT INTO company_vault` | Add item to document list with scanning status. |
| `btn_run_compliance`| Tender Analysis Card | Launches compliance check | `/api/requirements/parse` | `POST` | `INSERT INTO compliance_matrices` | Transition progress bar to 100%, render results. |
| `btn_foultender_run`| Collusion Analysis | Computes bid outlier checks | `/api/collusion/analyze` | `POST` | `INSERT INTO risk_audits` | Draw NetworkX force-directed graph with bidders. |
| `btn_generate_bid` | Procurement Package | Compiles bid package | `/api/packages/generate` | `POST` | `INSERT INTO generated_packages` | Download generated file (.pdf) instantly. |
| `run-market-parser-btn` | Resource Analysis Card | Analyzes market pricing | `/api/tenderai/parse-market-prices` | `POST` | `AI Google Search Query` | Search real-time web prices, render analytical pricing table. |
| `add-parsed-items-btn` | Price Parser Footer | Appends items to active sheet | *Local UI Operation* | *N/A* | `UPDATE local report.items` | Adds all matched materials into active cost list, recomputes margins. |

---

## 3. High-Fidelity React Handler Example

The following code implements our testable contract pattern for the main synchronization control button:

```tsx
// src/components/SyncButton.tsx
import React, { useState } from "react";

export const SyncButton: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/tenders/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      setSyncedCount(data.synced_count);
    } catch (error) {
      console.error("Prozorro synchronization failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      id="btn_sync_prozorro"
      onClick={handleSync}
      disabled={isSyncing}
      className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:bg-neutral-400 transition"
    >
      {isSyncing ? "Syncing Prozorro..." : "Synchronize Prozorro Stream"}
    </button>
  );
};
```
# Independent re-audit (2026-08-31)

**Status: FAIL.** The estimate UI includes sample-loading controls, simulated upload/parsing and delayed local state changes. Not every control maps to a real API/database mutation.

## Re-audit 2026-09-01

Construction BoQ add/edit/delete controls now call tenant-scoped POST/PATCH/DELETE endpoints; dashboard, profile and pre-submission cards no longer render fabricated readiness/requirement values and show `UNKNOWN` when evidence is absent. Full 237-control browser coverage remains BLOCKED.

Targeted browser evidence 2026-09-01: `Додати позицію` increased the live BoQ row count and `Видалити` restored it, with the test row removed afterward.

War Room QA action now navigates to the real Pre-Submission Audit route; its checklist reads persisted readiness evidence and displays `UNKNOWN` when no audit exists.

War Room pipeline badges now derive from persisted analysis/BoQ/readiness state instead of hard-coded `COMPLETED`/`IN_PROGRESS` labels.

Document download controls now call the authenticated object-storage download endpoint; bulk action downloads each available document individually (ZIP bundling is not claimed).

War Room overview progress and pipeline status are now evidence-derived; QA shows persisted checklist data or `UNKNOWN`, and its audit action navigates to the real audit module.

Pipeline controls remain navigational but their completion badges are derived from the selected tender's persisted Radar, analysis, BoQ, collusion and readiness fields.

Search result cards now display explicit `UNKNOWN` source fields when Prozorro omits attributes; no UI control treats inferred customer/geography/status values as verified facts.

Collusion scan responses are schema-validated in the UI (bounded numeric score, known risk level, array evidence fields); malformed provider payloads surface an error instead of being rendered as low risk.

Browser smoke 2026-09-01 exercised all 14 primary navigation controls on a fresh loopback session; each rendered without an application error.

Extended browser audit 2026-09-01 visited every primary section and recorded visible controls/charts: Dashboard 46/50, Catalog 44/36, Radar 54/47, War Room 33/51, BoQ 26/27, Cost Analysis 28/28, Gantt 25/25, Profile 27/30, Bid Package 28/34, Audit 22/22, Competitors 22/22, FoulTender 23/26, Analytics 22/30, Team 26/25. No application errors were observed.

Authenticated WS user pass 2026-09-01 also exercised Catalog CPV/region filter changes and reset; no console errors or application error state appeared.

Unsupported ROI claims in the services view were replaced with explicit UNKNOWN states; scenario-only tender/hour calculations remain labeled as user-input projections.

Services plan CTA controls now have a real navigation effect: each opens the authenticated Multi-Agent support chat via the application navigation event. They do not claim to create a subscription without a billing backend.

Additional control audit 2026-09-01: legacy Sidebar settings/profile/company icons now navigate to the audit or company profile sections with accessible labels. Document upload's manual file button now triggers the real file input (the transparent overlay no longer intercepts it). The competitor “Історія торгів” control opens only a verified official source URL and is disabled when none exists.
> **2026-09-02 browser regression evidence:** authenticated local session loaded after tenant transaction hardening. All 14 primary navigation controls opened their sections without React errors. Radar quick prompt/search/reset, three Radar selectors, Catalog marketplace filters/search and all visible section controls were exercised; browser error log remained empty. Empty live result sets render an explicit “не знайдені” state.
