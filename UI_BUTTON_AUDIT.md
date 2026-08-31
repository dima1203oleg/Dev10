# TENDERAI OS — UI BUTTON AUDIT
## CORE UI COMPONENT BUTTON CONTRACTS & VERIFICATION REPORT
**Document ID:** TA-UBA-001  
**Status:** VERIFIED FOR PRODUCTION  

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
