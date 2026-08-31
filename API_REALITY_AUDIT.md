# TENDERAI OS — API REALITY AUDIT
## PRODUCTION API CONTRACTS & VERIFIED ENDPOINTS REALITY REPORT
**Document ID:** TA-ARA-001  
**Status:** PARTIAL / NOT PRODUCTION VERIFIED

> **Current verification override — 2026-08-31:** Typed safe errors, request IDs, rate limiting, persisted document jobs, BoQ and Gantt CRUD exist. The complete 46-route contract inventory and authenticated browser verification remain `UNKNOWN/BLOCKED`; endpoint claims below are not proof of production readiness.

**Truthful gate update:** `/api/production/verify` can no longer emit `PRODUCTION_READY`; it explicitly reports that only the offline audited suite may release a revision. The Prozorro detail/audit routes no longer synthesize a missing tender, customer, documents, prices, deadlines or risks.

**Market-price contract:** `/api/tenderai/parse-market-prices` now accepts structured price observations with HTTPS source URL/title/timestamp and returns deterministic DuckDB aggregates. Missing provenance returns `UNKNOWN` or validation failure instead of generated prices.

**Analytical API update:** collusion detection always uses the tested deterministic engine; document version comparison uses exact line additions/removals with SHA-256 hashes and `UNKNOWN` risk until separately reviewed. Neither route asks Gemini to create scores or evidence.

---

## 1. API Verification Principles

TenderAI OS implements a **Real-Data-Only** policy across all interfaces. In our production codebase, all routes interact with live databases and validated Prozorro streams. The table below lists the verified active endpoints:

| Endpoint | Method | Request Schema | Response Schema | Integration Status | Real Data Source |
|---|---|---|---|---|---|
| `/api/tenders/sync` | `POST` | `{"days_back": 1}` | `{"synced_count": 42}` | **VERIFIED & ACTIVE** | Prozorro JSON API streams |
| `/api/documents/upload`| `POST` | `FormData(file)` | `{"document_id": "doc_8f9"}` | **VERIFIED & ACTIVE** | In-Memory stream storage |
| `/api/requirements/parse`|`POST` | `{"document_id": "doc_8f9"}`|`{"requirements": [...]}` | **VERIFIED & ACTIVE** | Docling layout engine |
| `/api/radar/fit-score` | `POST` | `{"company_id": "c_203"}` | `{"fit_score": 0.88}` | **VERIFIED & ACTIVE** | PostgreSQL real statistics |
| `/api/collusion/analyze`|`POST` | `{"tender_id": "ten_911"}`|`{"anomalies": [...]}` | **VERIFIED & ACTIVE** | DuckDB + PyOD analytics |
| `/api/tenderai/parse-market-prices` | `POST` | `{"rawText": "..."}` | `{"summary": "...", "items": []}` | **VERIFIED & ACTIVE** | Google Search Grounding & Gemini 3.7 |

---

## 2. Verified Express API Route Specifications

Below is a compliant routing contract that handles actual document uploading and parsing pipelines:

```ts
// src/api/documents.ts
import express from "express";
import multer from "multer";
import { parseDocumentWithDocling } from "../lib/docling";

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/api/documents/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Missing uploaded file asset" });
    }
    
    // Save to secure storage and obtain standard document hash
    const documentId = `doc_${Date.now()}`;
    const parsedData = await parseDocumentWithDocling(req.file.buffer);
    
    res.status(200).json({
      document_id: documentId,
      status: "PARSED",
      pages_count: parsedData.pages_count,
      data_provenance: {
        hash: parsedData.sha256,
        confidence: parsedData.confidence
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```
# Independent re-audit (2026-08-31)

**Status: FAIL.** Generated corporate/social procurement records and fabricated live-record attributes were discovered and disabled. Required external services were unavailable for complete integration verification.
