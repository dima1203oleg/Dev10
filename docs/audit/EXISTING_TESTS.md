# TenderAI OS — EXISTING_TESTS.md
## Deep-Dive Audit of Active Software Test Suites, Runners & Compliance Assertions

**Document ID:** TA-TST-001  
**Version:** 3.1.0  
**Timestamp:** 2026-08-28T10:50:00Z  
**Classification:** Proprietary Test Suite Audit  

---

## 1. Test Architecture Overview

**TenderAI OS** places extreme priority on operational correctness and validation. Rather than relying on simple mock assertions, the platform implements **fully automated, runtime-executable diagnostic and verification test suites** directly embedded within its service adapters.

These tests are accessible via secure backend diagnostic API endpoints and evaluate components on natural Cyrillic processing, hierarchy traversal, query logic, and live connection integrity.

---

## 2. Active Test Suite Catalog

### 2.1 The Prozorro Connector Test Suite (`/src/connectors/prozorroTestRunner.ts`)
This suite evaluates six core structural areas of search and scoring. It can be triggered at runtime via `GET /api/connectors/prozorro/test` and returns an exhaustive, assertion-mapped audit report.

#### Verified Categories & Tests:

1. **TEST-01-STEMMING (Cyrillic Morphology Normalization):**
   - **Assertions:** Validates that `stemUkrainianWord()` correctly reduces inflected Ukrainian nouns and adjectives to their base semantic root stem.
   - **Checks:** Verified that inflected forms (e.g., "ноутбуків" -> "ноутбук", "укриттях" -> "укрит") resolve correctly. Verifies that `extractAndExpandKeywords()` successfully expands Ukrainian search strings (e.g., "укриття" is augmented to synonyms like "сховище", "вкритт").
   
2. **TEST-02-SCORING (Relevance Separator):**
   - **Assertions:** Asserts that relevance scores correctly distinguish between direct subject matches (e.g., "ноутбуки") and context mentions (e.g., catering services for schools mentioning laptops in annex text).
   - **Checks:** A high-score match is calculated for direct matches, while context-only tenders are ranked low or automatically excluded.

3. **TEST-03-CPV (Hierarchical CPV Traversal):**
   - **Assertions:** Asserts that the Hierarchical CPV Classifier (`cpvMatcher.ts`) maps semantic distances correctly down the tree of the Ukrainian State CPV Standard (ДК 021:2015).
   - **Checks:** Exact matches score 100%; Category matches (5 digits) score 90%; Class matches (4 digits) score 80%; Division matches (2 digits) score 30%; Unrelated codes score 0%.

4. **TEST-04-NEGATIVE (Negative Keywords Filter):**
   - **Assertions:** Verifies that when a search query defines `negativeKeywords` (minus-words), any tender containing those words is strictly excluded from results.
   - **Checks:** Excludes construction tenders containing unwanted phrases like "побутове прибирання".

5. **TEST-05-RADAR (Company Profile Radar Score):**
   - **Assertions:** Asserts the correctness of the personal fit scoring mathematical formula.
   - **Checks:** Verifies match scoring weights (CPV codes: 35%, Regions: 15%, Budgets: 25%, Vault Documents: 15%, Staff Registry: 10%) on mock company profiles against real tenders.

6. **TEST-06-LIVE_API (Live Connection & Deduplication):**
   - **Assertions:** Run active connectivity checks to Prozorro.
   - **Checks:** Fetches page 1, stores cursor, fetches page 2. Asserts that there are exactly **0 duplicate records** between consecutive pages, verifying cursor pagination stability.

---

### 2.2 Multi-Platform Aggregator Test Suite (`/src/connectors/multiPlatformTestRunner.ts`)
Triggerable via `GET /api/connectors/multiplatform/test`. 
- **Assertions:** Evaluates the adapters mapped to all 13 external procurement channels.
- **Checks:** Verifies format parsing, field normalization, region conversions, currency consistency, and structural stability across every integrated private and public source feed.

---

## 3. Production Verify Gate (`/api/production/verify`)

The platform features a **Production-Grade Self-Test & Diagnostic Gate** route. On-demand, it conducts live, multi-module verification across all critical systems:

- **Database:** Connects and performs quick transactions to verify schema health.
- **Auth:** Verifies user claims session decoding.
- **Prozorro API:** Ping tests responsiveness.
- **Tenant Isolation:** Executes a mock database query attempting to leak cross-tenant user records. Asserts that data leakage is exactly **0%**.
- **No-Fake Data Scanner:** Recursively crawls the search output and parses it against suspicious string regex patterns (e.g., `/fake/i`, `/mock/i`, `/demo/i`). If mock data patterns are detected, it blocks production deployment.
- **Aggregator Suite:** Runs the multi-platform test runner suite dynamically.
- **Compilation/Lint Status:** Checks server health and version parameters.
- **Output:** Returns `PRODUCTION_READY` or `BLOCKED` status with detailed diagnostic logs.
