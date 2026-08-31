# TENDERAI OS — ARCHITECTURE REPORT
## PRINCIPAL ENTERPRISE SYSTEM ARCHITECTURE DIAGRAM & DATA-FLOW REPORT
**Document ID:** TA-AR-001  
**Target Architecture:** Full-Stack Enterprise SaaS (Multi-Tenant)

> **Current implementation status — 2026-08-31:** `PARTIAL`. Transaction-scoped tenant context, forced PostgreSQL RLS, persisted jobs, BoQ and Gantt APIs are implemented and tested locally. Temporal, production object storage, live OCR, pgvector and DuckDB remain target architecture, not deployed capability.

> **2026-09-01 execution note:** bid-package persistence is implemented within the tenant-scoped transaction plane; production-like external services remain unproven.

---

## 1. Enterprise System Blueprint

TenderAI OS separates untrusted document scraping from the main transaction plane to prevent security and stability issues. Below is the blueprint of our complete stack:

```
                            ┌──────────────────────────────────┐
                            │      WEB FRONTEND (Vite+React)   │
                            │      Port: 3000 (HTTPS Ingress)  │
                            └────────────────┬─────────────────┘
                                             │ WebSocket / REST API
                                             ▼
                            ┌──────────────────────────────────┐
                            │    TENDERAI API GATEWAY (Express)│
                            │    Port: 3000 (Auth & Multi-Ten) │
                            └───────┬──────────────────┬───────┘
                                    │                  │
        ┌───────────────────────────┘                  └──────────────────────────┐
        ▼                                                                         ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     DATA PLANE (PostgreSQL)     │                                     │     AI PLANE (LangGraph Core)   │
│ ├── Relational Schema Tables    │                                     │ ├── Stateful Compliance Audits │
│ ├── pgvector Search Indices    │                                     │ ├── PydanticAI Validation       │
│ └── Audit / Event Logging       │                                     │ └── RAG Citation Mapping        │
└───────────────┬─────────────────┘                                     └────────────────┬────────────────┘
                │ Columnar Aggregation                                                   │ Semantic Payloads
                ▼                                                                        ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     ANALYTICS ENGINE (DuckDB)   │                                     │    VECTOR STORAGE (Qdrant DB)   │
│ ├── Probabilistic Linkage       │                                     │ ├── HNSW Dense Vector Index     │
│ └── Bid Rigging outlier checks  │                                     │ └── Strict Tenant Payload Filters│
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 2. High-Performance Ingestion Pipeline

To process unstructured tender documents efficiently and securely, TenderAI implements a structured data parsing flow:

```
Tender Download ──► ClamAV / MIME Scan ──► Docling Serve (Port 8080) ──► Coordinate Matrix
                                                                                  │
                                                                                  ▼
PydanticAI Extraction Validation ◄── Embeddings Map ◄── pgvector Indexing ◄── Chunk Generation
```

1.  **Ingestion:** Scrapers retrieve files from the Prozorro API and pass them to standard Temporal Workflows.
2.  **Scanning & Parsing:** Scanned images or PDFs undergo malware scanning and are parsed by the `Docling` microservice to extract bounding-box coordinates for all table elements.
3.  **Validation:** `PydanticAI` validates the parsed JSON payload against our canonical database schema.
4.  **Vectorization:** Text chunks are vectorized using `FastEmbed` and stored in `pgvector` or `Qdrant` databases with strict tenant filters.
5.  **Audit:** Every AI-extracted requirement is indexed alongside its exact document hash and page coordinates to guarantee complete auditable provenance.
# As-built qualification (2026-08-31)

This is target architecture unless backed by code and passing tests. Mandatory RLS, Temporal, malware scanning, OCR bbox provenance and production object storage are not verified as deployed capabilities.
