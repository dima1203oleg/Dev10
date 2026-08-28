# TenderAI OS — INTEGRATION_GAPS.md
## Gap Analysis, Open-Source Mapping & Architectural Integration Specifications

**Document ID:** TA-GAP-001  
**Version:** 3.1.0  
**Timestamp:** 2026-08-28T10:50:30Z  
**Classification:** Proprietary Integration Specification  

---

## 1. Executive Summary

This document performs a deep gap analysis contrasting the current capabilities of **TenderAI OS** against the target architecture for automated construction cost calculations and deep Prozorro compliance automation. It maps out the exact integration points for the 15 selected open-source components, noting their licensing, security, and architectural boundaries.

---

## 2. Gap Identification & Pipeline Alignment

Our target pipeline is broken down into four distinct, highly synchronized processing stages.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: Ingestion & CAD Extraction                                      │
│ Gap: CAD (.dxf, .ifc) and Scanned specifications parsing limitations.    │
│ Stack: ezdxf, IfcOpenShell, Docling.                                     │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: High-Fidelity OCR & Tabular Decomposition                       │
│ Gap: Inability to parse dense, multi-page tables (BoQ sheets).           │
│ Stack: Camelot, Docling layout engine, PaddleOCR.                        │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: Deterministic Costing & Anomaly Engine                          │
│ Gap: Arbitrary formula execution risks & slow analytical aggregations.   │
│ Stack: DuckDB, cel-python (Common Expression Language).                  │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: Automated Bid Package Assembly                                  │
│ Gap: Unstable client-side PDF rendering of 100+ page documents.          │
│ Stack: WeasyPrint, docxtpl.                                              │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Integration Specifications

The table below outlines the integration strategy for each of the core open-source gaps identified.

### 3.1 Document AI & Structural Layout OCR
- **Target Components:** `Docling`, `PaddleOCR` (via Paddle), `Camelot` (PDF Table Parser).
- **Current Gap:** Standard text-matching OCR misses complex, multi-page layout structures and fails to extract nested tables (e.g., Bill of Quantities nested rows).
- **Integration Plan:**
  - **Docling (MIT):** Adopted as the primary parser for technical specification PDFs. Integrates at `/src/connectors/documentParser.ts` (new connector boundary).
  - **PaddleOCR (Apache-2.0):** Deployed as an isolated, container-wrapped API service (`WRAP` strategy) communicating over JSON. Decouples OCR computation from the Node runtime.
  - **Camelot (BSD-3-Clause):** Used as a secondary tabular grid extractor specifically for scanned PDF tables containing pricing matrices.

### 3.2 CAD & BIM Data Extraction
- **Target Components:** `ezdxf` (dxf Parser), `IfcOpenShell` (BIM model reader).
- **Current Gap:** TenderAI cannot verify quantities specified in tenders against architectural drawings or BIM layouts, forcing users to manually input construction volume parameters.
- **Integration Plan:**
  - **ezdxf (MIT):** Parsed inside a Python microservice to extract building dimensions and perimeter specs from vector `.dxf` blueprints.
  - **IfcOpenShell (LGPL-3.0):** Wrapped securely (`WRAP` strategy) to parse building models (`.ifc`). Connects quantities directly to BoQ items. Integrates geometry fallback mechanics to verify bills of materials for low LOD models.

### 3.3 Analytics, Links, & Formula Processing
- **Target Components:** `DuckDB`, `cel-python`, `Splink`.
- **Current Gap:** Core database queries lack the sub-second column aggregation needed for live bid-rigging risk models and lack secure, customizable formula engines.
- **Integration Plan:**
  - **DuckDB (MIT):** Integrated as an analytical layer running over database storage buffers to compute bidder margin drops and co-bidding frequencies instantly.
  - **cel-python (Apache-2.0):** Google's Common Expression Language (CEL) is adopted as the mathematical formula parser. This eliminates arbitrary code execution risks (Remote Code Execution - RCE) by replacing Python `eval()` or JS `Function` calls with sandboxed, safe expressions for cost estimations.
  - **Splink (MIT):** Employed inside FoulTender's deduplication module to link varying spelling layouts of Ukrainian company names to a single EDRPOU code.

### 3.4 Multi-Page Compliant Generation
- **Target Components:** `WeasyPrint`, `docxtpl`.
- **Current Gap:** Client-side generation using `jspdf` is prone to memory leaks and fails to render professional paged-media elements (margins, custom page counters, indices) for complex bid packages.
- **Integration Plan:**
  - **WeasyPrint (BSD-3-Clause):** Deployed on the backend server to compile finalized procurement documents into print-ready PDFs using HTML templates and custom CSS paged-media styling rules.
  - **docxtpl (LGPL-2.1):** Adopted to dynamically compile compliant contract drafts into DOCX format using pre-approved legal templates.

---

## 4. Gating & Compliance Roadmap

All new open-source components must pass the active self-testing gates (`/api/production/verify`) and be registered inside `/OPEN_SOURCE_REGISTRY.yaml` before entering production.
This guarantees compliance with licenses, limits system vulnerability, and maintains absolute compatibility with the Ukrainian procurement ecosystem.
