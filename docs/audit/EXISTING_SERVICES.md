# TenderAI OS — EXISTING_SERVICES.md
## Deep-Dive Audit of Active Software Services, Connectors & Orchestrators

**Document ID:** TA-SRV-001  
**Version:** 3.1.0  
**Timestamp:** 2026-08-28T10:48:20Z  
**Classification:** Proprietary System Services Audit  

---

## 1. Directory of Operational Services & Engines

**TenderAI OS** relies on a series of autonomous, highly cohesive services integrated into the Express backend runtime. These services manage external API traffic, orchestrate state machines, perform deterministic risk computations, and govern database transactions.

---

## 2. Comprehensive Service Catalog

### 2.1 The Prozorro Connector Service (`/src/connectors/prozorro.ts`)
- **Purpose:** Acts as the primary interface to the official public openprocurement.org REST API (v2.5).
- **Core Methods:**
  - `searchProzorroTenders(params, options)`: Queries public tenders based on keywords, regions, CPV categories, and budget constraints. Handles live pagination via Prozorro's dynamic `next_page.offset` offset keys.
  - `fetchProzorroTenderFullDetail(id)`: Fetches a single tender payload from `https://public.api.openprocurement.org/api/2.5/tenders/{id}`, resolving child records such as item classifications (CPV codes), legal descriptors, and official annex URLs.
  - `calculatePersonalRadarMatch(tender, companyProfile)`: A highly optimized, 100% deterministic, mathematically explainable scoring engine that evaluates how well a specific tender fits a registered company's profile.
- **Diagnostics:** Connected to a live health checker at `/api/connectors/prozorro/health` verifying basic HTTP ping latency, JSON structure validity, and cursor pagination.

### 2.2 Multi-Platform Procurement Aggregator (`/src/connectors/multiPlatformAggregator.ts`)
- **Purpose:** Aggregates and uniformizes procurement data from 13 distinct public, private, and social channels into a canonical, unified Tender schema.
- **Coverage Index:**
  - **State Tenders:** Prozorro, Prozorro.Sale.
  - **Defense/Security:** Ministry of Defense (МОУ / ДП "Державний оператор тилу" - DOT).
  - **Private / Corporate B2B:** SmartTender, DTEK procurement space, Metinvest, Naftogaz, Ukrzaliznytsia.
  - **Social Feeds:** Facebook Procurement groups, Telegram channels, LinkedIn jobs, and local municipal bulletin boards.
- **Methodology:** Queries all platform indices in parallel, normalizes Varying formats using dedicated adapter wrappers, resolves EDRPOU codes, and applies high-efficiency deduplication.

### 2.3 Collusion & Fraud Detection Engine (`/src/utils/collusionEngine.ts`)
- **Purpose:** Powering the "FoulTender Risk Suite", this service performs mathematical and relational link analysis on participating bidders to expose cartel structures, bid-rigging anomalies, and coordinate submissions.
- **Analytic Models:**
  - Identifies repetitive partner groupings ("frequent co-bidding pairings").
  - Identifies margin drop pattern abnormalities (e.g., bidder A always drops price by <1% while bidder B drops by exactly 0%, acting as a decoy).
  - Calculates a global **FoulScore** (0 to 100) and outputs graph relations in the structured `coBiddingGraph` schema format.

### 2.4 User & Identity Sync Service (`/src/db/users.ts` + `/src/middleware/auth.ts`)
- **Purpose:** Synchronizes identity claims from Firebase Authentication client tokens to PostgreSQL.
- **Execution Lifecycle:**
  1. Client sends a request with an `Authorization: Bearer <idToken>` header.
  2. The custom middleware decodes and verifies the token.
  3. The `getOrCreateUser(uid, email)` service queries the `users` table; if the user record does not exist, it inserts it instantly, ensuring database transactions are seamlessly linked to the active Firebase Auth session.

---

## 3. Communication Patterns

All internal services communicate asynchronously or through inline transactional bindings. External requests use non-blocking HTTP requests with aggressive timeouts (typically 5000ms for public endpoints) and resilient retries to protect TenderAI against upstream microservice degradation.

---

## 4. Service Matrix Summary

| Service Name | Primary Endpoint | Dependencies | Fallback Layer | Status |
|---|---|---|---|---|
| **Prozorro API** | `openprocurement.org/api/2.5` | `node-fetch` | Inline Mock-Free Empty List | **ACTIVE** |
| **Aggregator** | `/api/prozorro/search` | Multi-Source Parsers | DB cache lookups | **ACTIVE** |
| **Collusion Risk** | `/api/tenderai/collusion-detect` | Standard Math Engine | Local Heuristics | **ACTIVE** |
| **User Identity** | `/api/auth/sync` | Firebase Client Library | Express rejection (401) | **ACTIVE** |
