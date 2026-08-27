# AI AGENT SPECIFICATION

**Project:** TenderAI OS (dima1203oleg/Dev10)  
**Core Model:** Gemini API / `@google/genai` TypeScript SDK  
**Architecture:** Multi-Agent Orchestrator with Structured JSON Validation  

---

## 1. Multi-Agent Orchestrator Pipeline

To ensure rigorous validation and maintain high evidence standards, the platform employs a centralized parallel-execution Orchestrator:

```
                  Tender Documentation Ingestion
                                ↓
                      [Document Agent]
                                ↓
                     [Requirement Agent]
                                ↓
        ┌───────────────────────┼───────────────────────┐
        ↓                       ↓                       ↓
[Legal Agent]            [Company-Fit Agent]       [Cost Agent]
        ↓                       ↓                       ↓
[Collusion Agent]     [Competition Agent]      [Capacity Agent]
        └───────────────────────┼───────────────────────┘
                                ↓
                         [QA Agent]
                                ↓
                  Validated Structured Report
```

---

## 2. Agent Definitions & Schema Contracts

Each agent runs as a specialized sub-module under the orchestrator. They are forbidden from hallucinating or inserting facts not supported by input references.

### 2.1. Document Agent
- **Role**: Extract layout-agnostic raw textual facts from parsed PDF, DOCX, and scanned image (OCR) inputs.
- **Contract**: Maps bounding-box coordinates or page indexes to extracted paragraphs.

### 2.2. Requirement Agent
- **Role**: Parse the raw text of a tender into structured conditions.
- **Contract**: Maps conditions to distinct classes: `LEGAL`, `FINANCIAL`, `TECHNICAL`, `EXPERIENCE`, `DOCUMENT`.

### 2.3. Legal Agent
- **Role**: Analyze compliance against national legislation (e.g. Article 16 of Ukrainian Public Procurement Law).
- **Contract**: Correlates facts to specific statutory references inside the Legal Registry.

### 2.4. Company-Fit Agent
- **Role**: Conduct a deterministic comparison of required tender parameters against the registered Digital Twin attributes.
- **Contract**: Evaluates gaps in KVED matching, personnel thresholds, and equipment certifications.

### 2.5. Cost Agent & Cost Validator
- **Role**: Break down XLSX bills of materials to check math formulas and compare estimated numbers with current market averages.
- **Contract**: Detects pricing threshold risks, incorrect VAT math, and reports arithmetic discrepancies.

### 2.6. Collusion & Competition Agents
- **Role**: Review competitor behaviors, bidding frequencies, and mutual registrations to flag anti-competitive indicators.
- **Contract**: Maps price variations, co-participation metrics, and scores them as `LOW`, `MEDIUM`, or `HIGH` risk factors.

### 2.7. QA Agent
- **Role**: Act as the final reviewer to enforce the *AI Evidence Rule* (denies any claims without valid source indexes).
- **Contract**: Evaluates all findings, validates JSON structure validity, and returns the final unified, structured Tender Report.
