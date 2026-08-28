# TenderAI OS — EXISTING_DOCUMENT_PIPELINE.md
## Technical Audit of Document Ingestion, OCR Layout Extraction & Classification Pipelines

**Document ID:** TA-DOC-001  
**Version:** 3.1.0  
**Timestamp:** 2026-08-28T10:49:40Z  
**Classification:** Proprietary Ingestion Pipeline Audit  

---

## 1. Document Ingestion Overview

**TenderAI OS** implements a secure, asynchronous, server-side document ingestion and parsing pipeline. This pipeline converts raw, un-searchable document uploads (e.g., scanned PDFs, DOCX specifications, and contract drafts) into structured, highly queryable database records to power the **Evidence Layer** and the **Personal Smart Vault**.

---

## 2. Ingestion Stages & Execution Lifecycles

The document ingestion system is split into two primary operational pipelines based on context.

### 2.1 The Smart Vault Ingestion Pipeline (`/api/company/upload-document`)
Designed to ingest core corporate documents (Extracts from registers, licenses, labor registries, ISO compliance certificates, past analogous contracts).

```
   [ Upload Payload ] ──► [ Malware Sandbox Scan ] ──► [ Base64 Conversion ]
                                                              │
                                                              ▼
   [ JSON Extracted ] ◄── [ LLM Layout-Aware OCR ] ◄── [ PDF / Image Buffer ]
           │
           ▼
   [ Database Ingestion (company_profiles.vaultData) ]
```

- **Analysis Model:** Relies on structural multimodal inputs processed through Gemini LLMs.
- **Layout-Aware Parsing:** The engine parses both text and table cells, retaining spatial associations to avoid structure loss.
- **Auto-Classification Engine:** Automatically tags and categorizes documents:
  - `COMPANY_EXTRACT`: Resolves corporate entities (EDRPOU, full legal name, register address).
  - `LICENSE` / `CERTIFICATE`: Extracts license numbers, issuers, and exact expiration dates (`validUntil`).
  - `CONTRACT`: Parses contractor identifiers, amounts in UAH, contract dates, and completion status.

---

### 2.2 The Tender-Specific Specification Pipeline (`/api/tenders/:id/documents/:docId/analyze`)
Designed to parse and decompose massive Prozorro tender specifications, technical tasks, and draft agreements.

- **Phase 1: Session Isolation & Lock:** Updates the database record `status` column for the targeted document to `PROCESSING` to prevent duplicate parallel parsing calls.
- **Phase 2: Semantic Chunking & Prompt Synthesis:** Retrieves the tender metadata context (title, budget, customer, CPV class) and merges it with the document stream. 
- **Phase 3: Deep Compliance Extraction:** The LLM extracts:
  - `type`: Technical requirements, Bill of Quantities (BoQ) list, or Legal contracts.
  - `extractedRequirements`: Bulleted arrays of strict qualification and technical requirements.
  - `riskFlags`: Points of potential anti-competitive bias (e.g., brand-specific lock-ins, unrealistic timelines).
  - `summary`: Concise, human-readable summary of the document's content.
- **Phase 4: Database Synchronization:** Sets the document status to `EXTRACTED` and inserts the full rich payload into the `extractedData` `jsonb` column of the `tender_documents` table in PostgreSQL.

---

## 3. High-Fidelity Data Provenance Layer

Every document analyzed through these pipelines retains strict **Data Provenance**:
1. **Source Tracking:** Each requirement maintains a direct reference back to the originating file name (`documentId`) and exact page/clause coordinates.
2. **Confidence Metric:** Every LLM-extracted parameter is scored with a confidence index (0-100) to flag uncertain extractions for manual user review.
3. **Verbatim Sourcing:** All risk flags and requirement mappings require verbatim textual quotes (`exactQuote`) to protect against ШІ hallucinations.
