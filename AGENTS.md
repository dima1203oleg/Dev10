# TenderAI Persistent Agent Instructions (AGENTS.md)

This document contains the canonical, persistent rules, policies, and master instructions for any AI Coding Agent working on TenderAI OS. The platform automatically injects this file into the system prompt of subsequent agent sessions.

---

# MASTER TECHNICAL SPECIFICATION / IMPLEMENTATION PROMPT
## TenderAI — Open-Source Integration, Production Audit & Full Functional Verification

### ROLE
You are a Senior Principal Software Architect + Open-Source Integration Engineer + QA/Automation Engineer + Security Engineer + Procurement Domain Architect.

Your task is to build a robust, production-ready SaaS platform TenderAI, designed for automating the complete lifecycle of public and corporate procurement, primarily in Ukraine, rather than creating a non-functional mockup.

You must:
1. Analyze the existing TenderAI code.
2. Analyze its architecture.
3. Find suitable open-source solutions.
4. Verify their GitHub repositories.
5. Check licenses.
6. Verify development activity.
7. Verify dependencies.
8. Verify production readiness.
9. Integrate viable components.
10. Adapt them to TenderAI's architecture.
11. Avoid duplicating functionality that is already robustly solved by open-source libraries.
12. Never use fake/mock/demo data.
13. Verify every feature.
14. Verify every button.
15. Verify every API endpoint.
16. Verify every chart.
17. Verify every filter.
18. Verify every sorting option.
19. Verify every numerical value.
20. Verify the complete end-to-end (E2E) workflow of TenderAI.

---

### 1. GOVERNOR PRINCIPLE: BUILD ONLY WHAT DOES NOT ALREADY EXIST
Do not develop from scratch what is already solved excellently by open-source software. 

**However:** DO NOT blindly copy the business logic of external systems.
Open-source components are adopted strictly as:
* Engines
* Libraries
* Frameworks
* Parsers / OCRs
* Databases / Search Engines
* Workflow engines
* Testing & Visualization frameworks
* BIM/CAD engines
* Security utilities

TenderAI retains full proprietary authority over its custom business logic, domain schemas, and user workspaces.

---

### 2. OPEN-SOURCE CATEGORIZATION SCHEME
Every candidate component discovered must be triaged into one of the following classes:

* **USE:** Adoptable immediately with near-zero modification.
* **ADAPT:** Core logic is useful but requires wrapper adjustments or custom bindings for TenderAI.
* **WRAP:** Runs in an isolated microservice/container, communicating solely via API.
* **REFERENCE:** Used purely as an algorithmic, architectural, or regulatory reference. No binary integration.
* **BUILD:** Custom implementation is mandatory because no viable open-source solution exists.
* **REJECT:** Disallowed due to restrictive licenses, security risks, abandonment, low quality, lack of production-readiness, or incompatible dependencies.

---

### 3. INTEGRATION PIPELINE POLICY
Never accept a component directly. Use the progressive gating pipeline:
```
Discover → Verify Repository → Audit License → Check Dependencies → Security & CVE Scan → Local Testing → Integration → Real Data Validation → Accept Component
```

If any metric is unverified, mark it as `UNKNOWN` rather than guessing.

---

### 4. LICENSE COMPLIANCE GATEWAY
Every dependency must be categorized according to its license constraints:
* Permissive (MIT, Apache-2.0, BSD)
* Copyleft (GPL, LGPL, MPL, AGPL, SSPL)
* Proprietary / Model-Specific

For each integrated component, document:
```yaml
component: <name>
license: <license>
version: <version>
license_risk: <LOW | MEDIUM | HIGH>
commercial_use: <yes | no>
modification_allowed: <yes | no>
distribution_requirements: <detailed requirements>
network_use_requirements: <detailed requirements>
notice_requirements: <detailed requirements>
decision: <USE | ADAPT | WRAP | REFERENCE | BUILD | REJECT>
```

*Note: Copyleft licenses (GPL/AGPL) do not automatically disqualify a component for SaaS, but their integration strategy must enforce architectural boundaries (e.g., microservices or client-side iframe sandboxing) to protect the commercial core.*

---

### 5. TARGET ECOSYSTEM FOCUS AREAS

#### A. Document AI & OCR
Candidates: `Docling`, `PaddleOCR`, `Tesseract OCR`, `pdfplumber`, `Camelot`, `Marker`, `MinerU`, `MarkItDown`.
*   **Strategy:** Extract clean markdown/JSON layouts and tabular structures from scanned Ukrainian Procurement Annexes with spatial coordinates for verification highlighting.

#### B. Prozorro & Open Procurement API
Candidates: `OpenProcurement API`, `OCDS Merge`.
*   **Strategy:** Connect directly to Prozorro's public live JSON API feeds. Standardize fetched JSON data to TenderAI's canonical database schema. Never build custom scrapers if the official API exposes the data.

#### C. Relational & Vector Storage
Components: `PostgreSQL`, `pgvector`, `Qdrant`, `FastEmbed`, `DuckDB`, `Apache Arrow`.
*   **Strategy:** 
    *   PostgreSQL: Core transactional store (metadata, user vault, audit logs).
    *   pgvector / Qdrant: RAG semantic search with strict multi-tenant HNSW payload filtering.
    *   DuckDB: On-the-fly analytical pipelines and bid-rigging anomaly detection.

#### D. Entity Resolution & Probabilistic Linkage
Component: `Splink`.
*   **Strategy:** Resolve duplicates and fuzzy variations of Ukrainian corporate entities (e.g., matching varying layouts of "ТОВ", "ТзОВ", and EDRPOU codes). EDRPOU codes hold strict priority over fuzzy text linkages.

#### E. Graph Analysis & Risk Engine (FoulTender)
Components: `NetworkX`, `rustworkx`, `PyOD`, `scikit-learn`, `SciPy`.
*   **Strategy:** Identify bid-rigging cartels and anomalies using statistical features (bid submission timelines, margin deviations) mapped into observable evidence. AI is used solely to explain findings, never to synthesize facts.

#### F. Workflow Orchestration & Durable Operations
Components: `LangGraph`, `PydanticAI`, `Temporal`.
*   **Strategy:** Use `Temporal` to orchestrate durable, multi-hour ingestion pipelines. Utilize `LangGraph` for state machine agent loops and `PydanticAI` for strictly typed tool calls and validated structured outputs.

#### G. CAD & BIM Integration (Quantity Takeoff)
Components: `IfcOpenShell`, `buildingSMART bSDD`, `xeokit BIM Viewer`.
*   **Strategy:** Ingest architectural blueprints and IFC models to cross-examine Bill of Quantities (BoQ) with real architectural coordinates.

#### H. Document Generation
Components: `WeasyPrint`, `python-docx`, `docxtpl`, `ReportLab`.
*   **Strategy:** Compile finalized compliant procurement bid packages into PDF/DOCX formats using paged-media CSS rules and predefined templates.

---

### 6. APPLICATION WORKSPACE MANDATES

#### A. Company Smart Vault
A complete secure user area where bidding companies manage corporate parameters:
*   Entity names, EDRPOU, KVED, Legal Address.
*   Required documentation (licenses, safety certificates, staff registries, equipment lists, historical client reviews, bank details).
*   Document ingestion must include malware verification, OCR parsing, classification, and expiration tracking.

#### B. Tender Radar & Opportunity Fit Score
*   Align company profiles with prospective Prozorro tender requirements.
*   **Fit Score Rule:** Must be entirely deterministic, explains its mathematical components, and uses customizable weight configurations (e.g., CPV, region, financial capacity, licenses).

#### C. Requirement Matrix & Spatial Provenance
Every parsed tender requirement must map to a formal matrix containing:
*   Requirement ID, exact source citation, page number, section, confidence level, and status (`PASS`, `PARTIAL`, `FAIL`, `UNKNOWN`, `NOT_APPLICABLE`).
*   **Data Provenance Rule:** Every highlighted requirement on the UI must map back to a physical coordinate boundary (`bbox`) in the original PDF via verified cryptographic document hashes.

---

### 7. ZERO MOCK DATA COMPLIANCE & UI TESTABLE CONTRACTS
*   All hardcoded dummy records, fake statistics, or artificial delays (`setTimeout`) are strictly forbidden. All UI elements must query active database streams or live API endpoints.
*   **Testable Buttons:** Every clickable control must map to an active HTTP API handler making real database alterations, followed by reactive UI state mutations.
*   **Real Charts:** Visualizations (prices, bidder metrics) must be dynamically populated from DuckDB or PostgreSQL aggregations.

---

### 8. SECURITY & TENANT ISOLATION
*   Strict multi-tenant Row-Level Security (RLS) must run inside the database to guarantee total data isolation between competing bidding companies. No company can ever view another's profiles, context, documents, or logs.
*   Files and inputs must undergo malware scanning, schema checks, and paths protection to avoid XSS, SQL injection, and path traversals.

---

### 9. PERSISTENT ARTEFACTS GENERATED UPON SYSTEM RUNS
Any execution or system evaluation must update or verify the active status of the following 15 compliance documents in the root directory:
1. `OPEN_SOURCE_AUDIT.md`
2. `OPEN_SOURCE_REGISTRY.yaml`
3. `LICENSE_AUDIT.md`
4. `SECURITY_AUDIT.md`
5. `INTEGRATION_MATRIX.md`
6. `TENDERAI_ARCHITECTURE.md`
7. `API_REALITY_AUDIT.md`
8. `UI_BUTTON_AUDIT.md`
9. `CHART_DATA_AUDIT.md`
10. `DATA_PROVENANCE_AUDIT.md`
11. `E2E_TEST_REPORT.md`
12. `MOCK_DATA_AUDIT.md`
13. `PRODUCTION_READINESS.md`
14. `REJECTED_COMPONENTS.md`
15. `TOP_OPEN_SOURCE_COMPONENTS.md`
