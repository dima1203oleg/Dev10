# TENDERAI OS — INTEGRATION MATRIX
## OPEN-SOURCE SUBSYSTEMS COMPONENT GRAPH & INTEGRATION MATRIX
**Document ID:** TA-IM-001  
**Version:** 1.0.0  

> **Current verification override — 2026-08-31:** PostgreSQL/RLS is `USE/PASS`; official Prozorro connector code is `ADAPT/PARTIAL`; Docling, PaddleOCR, Temporal, ClamAV, DuckDB, pgvector and SeaweedFS are not accepted until their local contract gates pass. MinIO is `REJECT` for a new deployment.

**Latest implementation evidence:** a pinned Apple-Silicon compose stack and SDK boundaries for Temporal and S3-compatible SeaweedFS are present; Docling now targets the documented v1.21 `/v1/convert/file` API. Static build passes, but container startup is `BLOCKED` because the host disk has only about 116 MiB free. These components remain unaccepted.
---

## 1. Subsystem Integration Layout

To prevent chaotic cross-dependencies, TenderAI OS uses a structured pipeline where each open-source module operates in a dedicated, isolated scope:

```
[ Ingestion Layer (Temporal & Prozorro) ]
                    │
                    ▼
[ Document Parsing (Docling & PaddleOCR) ] ──► Extracted Bounding Boxes
                    │
                    ▼
[ Entity Resolution (Splink on DuckDB) ] ────► Deduped EDRПОУ Registry
                    │
                    ▼
[ Analytics & Reasoning (NetworkX & Qdrant) ] ► Collusion Anomaly Network
                    │
                    ▼
[ Bid Package Assembly (WeasyPrint / python-docx) ]
```

---

## 2. Dynamic Integration Matrix

| Target Module | Component | Strategy | Method / Interface | Real Data Validation Source |
|---|---|---|---|---|
| **Crawling Engine** | `Prozorro API Client` | **ADAPT** | Python HTTP stream (via Prozorro gateway) | Live JSON endpoints of Prozorro tenders |
| **Parsing Engine** | `Docling` + `PaddleOCR` | **WRAP** | REST Microservice / JSON response schemas | Real scanned PDF/DOCX Procurement Annexes |
| **Deduplication Engine** | `Splink` | **USE** | Embedded DuckDB SQL queries | Official Ukrainian EDR (ЄДР) registry dataset |
| **Risk Matrix Engine** | `PyOD` + `scikit-learn` | **USE** | In-Memory PyData analytics container | Historical bidder margin bids & submission times |
| **Reasoning Orchestration** | `LangGraph` + `PydanticAI` | **USE** | Structured Agent State loops | Specific legal qualifications & CPV categories |
| **Workflow Management** | `Temporal` | **USE** | Durable state machines (gRPC execution) | Hours-long procurement parsing workflows |
| **Smart BIM Takeoffs** | `IfcOpenShell` | **WRAP** | CLI worker microservice (via API) | Standard construction IFC models (IFC4 spec) |
| **Bid Package Generator** | `WeasyPrint` | **USE** | HTML-to-PDF compiler (CSS paged media) | Generated tender compliance sheets |

---

## 3. Communication Protocols

1.  **Temporal Workers to Temporal Server:** Communicates via gRPC over port `7233`.
2.  **State Machines to AI Models:** Calls Google GenAI SDK (Gemini) over HTTPS using server-only `GEMINI_API_KEY`.
3.  **TenderAI Core to Qdrant:** Communicates via gRPC over port `6334` using native payload filtering.
4.  **BIM Parsing Container:** Interacts via REST API using standard JSON-serialized geometric matrices.
# Independent re-audit (2026-08-31)

Treat every integration without a completed live contract test as `UNKNOWN`. Generated corporate/social feeds are disabled pending official connectors.
