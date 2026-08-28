# TenderAI OS — EXISTING_APIS.md
## Technical API Registry, Security Gateways & Endpoint Payload Catalog

**Document ID:** TA-API-001  
**Version:** 3.1.0  
**Timestamp:** 2026-08-28T10:48:50Z  
**Classification:** Proprietary API Specification Document  

---

## 1. Global API Design & Security

All API routes inside **TenderAI OS** are mounted under the `/api` prefix. 
- **Security Middleware:** Authenticated endpoints are guarded by the `requireAuth` middleware (`/src/middleware/auth.ts`). This middleware extracts the JWT from the `Authorization: Bearer <TOKEN>` header, validates it using Firebase Admin, and populates the `req.user` payload with the user's details.
- **Multitenancy Scope:** Database operations in all user-scoped routes strictly apply `eq(tenders.userId, dbUser.id)` filter boundaries, mathematically eliminating Cross-Tenant Data Leakage (OWASP API1:2023 Broken Object Level Authorization).

---

## 2. API Endpoint Directory

Below is the exhaustive catalog of active backend API endpoints.

### 2.1 Identity & Data Synchronization

#### POST `/api/auth/sync`
- **Authentication:** Required (Firebase Bearer Token).
- **Description:** Syncs the Firebase client-side login session with the server PostgreSQL instance. Retrieves or initializes the user record.
- **Response Shape (200 OK):**
```json
{
  "status": "ok",
  "user": {
    "id": 142,
    "uid": "fb-auth-uid-xyz123",
    "email": "user@tender.com.ua",
    "createdAt": "2026-08-28T09:12:00Z"
  }
}
```

#### GET `/api/data`
- **Authentication:** Required.
- **Description:** Scoped loading of the active company profile and all saved tenders. If the database is blank, it seeds 8 live public tenders from Prozorro automatically.
- **Response Shape (200 OK):**
```json
{
  "tenders": [...],
  "profile": { "id": 12, "userId": 142, "name": "ТОВ УкрБуд", "edrpou": "38291044", "vaultData": {} }
}
```

---

### 2.2 Interactive Team Workspace Services

#### GET `/api/team/members` & POST `/api/team/members`
- **Authentication:** Required.
- **Description:** Retrieves the tenant-scoped list of active bidding team members (Tender Director, Estimator, Lawyer), or adds a new member with audit logs creation.

#### GET `/api/team/tasks` & POST `/api/team/tasks` & PATCH `/api/team/tasks/:id`
- **Authentication:** Required.
- **Description:** Governs bidding preparation assignments. Tracks assignee roles (`SENIOR_LAWYER`, `LEAD_ESTIMATOR`), deadlines, priority indices (`CRITICAL`, `HIGH`), and execution status.

#### GET `/api/team/comments` & POST `/api/team/comments`
- **Authentication:** Required.
- **Description:** Collaborative comments on active tasks or tenders.

#### GET `/api/audit-logs` & POST `/api/audit-logs`
- **Authentication:** Required.
- **Description:** Provides full data provenance and tamper-evident tracing of user actions (`ADD_TEAM_MEMBER`, `CREATE_TASK`, etc.) mapped to the tenant identity.

---

### 2.3 Smart Vault & OCR Services

#### POST `/api/company/upload-document`
- **Authentication:** Required.
- **Description:** Uploads corporate documents (license, analogous contract, extract) in base64 format and performs layout classification and semantic OCR extraction via Gemini LLM.
- **Request Payload:**
```json
{
  "fileName": "License_DerzhPratsi.pdf",
  "mimeType": "application/pdf",
  "base64Data": "JVBERi0xLjQK..."
}
```
- **Response Shape (200 OK):**
```json
{
  "status": "ok",
  "data": {
    "category": "LICENSE",
    "documentName": "License_DerzhPratsi.pdf",
    "status": "VALID",
    "confidence": 98,
    "extractedText": "Ліцензія №48291 на виконання робіт підвищеної небезпеки...",
    "provenance": "USER_UPLOAD → OCR → AI_EXTRACTION",
    "entities": {
      "licenseNumber": "48291",
      "validUntil": "2029-12-31"
    },
    "aiComment": "Ліцензія дійсна, печатки присутні."
  }
}
```

---

### 2.4 Procurement Search & Diagnostics Gateway

#### GET `/api/connectors/prozorro/health`
- **Authentication:** Optional (No Auth Required).
- **Description:** Diagnostic ping testing real connectivity to `public.api.openprocurement.org/api/2.5/tenders`, tracking latency and pagination validity.

#### GET `/api/prozorro/search`
- **Authentication:** Required.
- **Description:** Comprehensive procurement search aggregating data from 13 platforms with stateful cursor-based pagination and AI Query parsing. Calculates personalized match scores on the fly.
- **Query Parameters:** `query`, `searchId`, `limit`, `region`, `cpv`, `minBudget`, `maxBudget`, `platforms`.

---

### 2.5 AI Consilium & FoulTender Risk Engines

#### POST `/api/tenderai/multi-agent-analyze`
- **Authentication:** Required.
- **Description:** Leverages a stateful 5-agent consortium to audit technical Bill of Quantities (BoQ) structures, estimate construction labor hours, compute target bid margins, and deliver a combined decision (`GO`, `GO_WITH_CONDITIONS`, `NO_GO`).

#### POST `/api/foultender/audit`
- **Authentication:** Required.
- **Description:** Scans technical parameters for anti-competitive traps, illegal clauses, and margin anomalies. Employs a strict **Evidence-First** validation protocol requiring verbatim Quotes and exact statutory bases.
- **Response Shape (200 OK):**
```json
{
  "foulScore": 75,
  "riskLevel": "HIGH",
  "summary": "Виявлено корупційні пастки та обмеження конкуренції в ТД.",
  "violations": [
    {
      "type": "DISCRIMINATORY_REQUIREMENT",
      "severity": "HIGH",
      "title": "Локаційне обмеження асфальтного заводу",
      "description": "Вимога щодо наявності АБЗ не далі ніж 15 км від місця виконання робіт.",
      "exactQuote": "Учасник повинен мати у своїй власності або користуванні асфальтобетонний завод... на відстані не більше 15 км від об'єкту будівництва.",
      "pageReference": "стор. 14, розділ 3",
      "legalBasis": "ст. 5 ч. 4, ст. 22 ч. 4 ЗУ 'Про публічні закупівлі'",
      "amcuPrecedent": "Колегія АМКУ неодноразово визначала вимогу щодо прив'язки кілометражу заводу як дискримінаційну (рішення № 4591-р/пк-пз).",
      "confidence": 0.98
    }
  ],
  "amcuAppealRecommendation": {
    "recommended": true,
    "prospectsText": "Високий потенціал виграшу в АМКУ",
    "appealGrounds": "Вимога порушує принцип недискримінації учасників та рівного ставлення.",
    "estimatedAmcuFeeUah": 15000
  }
}
```
