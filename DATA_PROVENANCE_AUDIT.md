# TENDERAI OS — DATA PROVENANCE AUDIT
## DATA TRUTH ENGINE & CITATION COORDINATE MAPPING AUDIT
**Document ID:** TA-DPA-001  
**Status:** PARTIAL / NOT FULLY COMPLIANT

> **Current verification override — 2026-08-31:** Schema and document-job contracts now require SHA-256, page citations and `bbox`, and the processor refuses synthesized OCR output. A live public Prozorro PDF has not yet passed ClamAV → object storage → OCR → citation/bbox validation, so the provenance gate is `BLOCKED`.

**Latest implementation evidence:** the Docling adapter now requests JSON OCR output through the documented multipart endpoint and rejects results without pages and at least one provenance `bbox`. This is code-level evidence only; the live PDF gate remains blocked.

**Version provenance update:** `line-diff-v1` returns SHA-256 for both source versions and only exact added/removed lines. It deliberately records risk as `UNKNOWN` rather than inferring legal intent from text changes.

**2026-09-01 execution note:** bid-package manifests are SHA-256 persisted; live OCR page/bbox evidence remains `BLOCKED`.

---

## 1. Ground Truth Provenance Engine

To prevent AI hallucinations and establish absolute transparency, TenderAI OS implements a structured provenance framework. Every data point, requirement, or evaluation score presented in our UI must map directly to its verified source file, complete with page coordinates and cryptographic hashes.

```
                  ┌────────────────────────────────────────┐
                  │       UI CARD REQUIREMENT CARD         │
                  │   Requirement: ISO 9001 Certificate    │
                  └───────────────────┬────────────────────┘
                                      │ Provenance Request
                                      ▼
                  ┌────────────────────────────────────────┐
                  │     DATA PROVENANCE PAYLOAD CONTRACT   │
                  │  file: "Technical_Specifications.pdf"  │
                  │  sha256: "bf82d9a1..."                 │
                  │  coordinates: [120, 450, 200, 470]     │
                  │  page: 14                              │
                  └───────────────────┬────────────────────┘
                                      │ Dynamic Rendering
                                      ▼
                  ┌────────────────────────────────────────┐
                  │        IFRAME SPATIAL VIEWPORT         │
                  │   Highlighter automatically overlays   │
                  │   red box over targeted text on p.14   │
                  └────────────────────────────────────────┘
```

---

## 2. Verified Data Provenance Schema

Our canonical database enforces strict provenance checks using standard JSON columns. No requirement extraction can be saved without verified source metadata:

```typescript
export interface DataProvenance {
  source_url: string;         // Prozorro public attachment link
  source_type: "prozorro" | "vault" | "registry";
  document_id: string;        // UUID of internal database file
  document_hash: string;      // SHA-256 of downloaded file
  page: number;               // 1-indexed page containing citation
  section: string;            // Name of the section parsed (e.g. "Додаток 1")
  bbox: [number, number, number, number]; // [x0, y0, x1, y1] bounding box normalized 0-1000
  extracted_at: string;       // ISO Timestamp
  extractor_version: string;  // SemVer tracking for parsing model
  confidence: number;         // Layout extraction probability
}
```

---

## 3. Target Coordinate Highlighting Verification

When a user reviews an extracted requirement, our PDF viewer loads the matching document from the Smart Vault and renders a highlighting bounding box over the source coordinates:

```tsx
// src/components/ProvenanceViewer.tsx
import React from "react";
import { DataProvenance } from "../types";

interface ProvenanceViewerProps {
  provenance: DataProvenance;
}

export const ProvenanceViewer: React.FC<ProvenanceViewerProps> = ({ provenance }) => {
  const [x0, y0, x1, y1] = provenance.bbox;
  
  return (
    <div className="relative border border-neutral-200 rounded p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-neutral-900">Provenance Citation Verified</span>
        <span className="text-xs bg-neutral-100 px-2 py-1 text-neutral-600 rounded">
          Confidence: {(provenance.confidence * 100).toFixed(1)}%
        </span>
      </div>
      
      <p className="text-xs text-neutral-500 mb-2">
        Document SHA256: <code className="text-neutral-800">{provenance.document_hash.slice(0, 12)}...</code>
      </p>
      
      <div className="text-xs text-neutral-700 bg-neutral-50 p-2 rounded border border-neutral-100">
        Located in <strong className="text-neutral-900">{provenance.section}</strong> on Page <strong className="text-neutral-900">{provenance.page}</strong>
      </div>
    </div>
  );
};
```
# Independent re-audit (2026-08-31)

**Status: FAIL.** End-to-end cryptographic document hash → page/section → bbox → extracted requirement → UI highlight verification was not demonstrated against real documents.
