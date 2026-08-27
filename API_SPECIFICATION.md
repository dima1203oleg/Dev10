# API SPECIFICATION (REST API v1.2)

**Project:** TenderAI OS (dima1203oleg/Dev10)  
**Host Context:** Runs on standard port `3000` (handled by Nginx reverse-proxy).

---

## 1. Authentication & Security Policy

All endpoints under `/api/` (excluding public `/api/health`) require an HTTP `Authorization` header with a valid Bearer token.
```http
Authorization: Bearer <firebase_jwt_token_or_dev_bypass>
```

---

## 2. Main API Endpoints

### 2.1. Authentication Sync
- **`POST /api/auth/sync`**
  - **Description**: Verifies the firebase session and synchronizes the active user into the local database.
  - **Response**: `200 OK` with user payload.

### 2.2. Company Vault
- **`GET /api/profile`**
  - **Description**: Returns the active company profile, KVED codes, experience metrics, available staff, and machinery list.
  - **Response**: JSON representation of the company.
- **`POST /api/profile`**
  - **Description**: Updates or initializes the company profile.

### 2.3. Prozorro Search & Management
- **`GET /api/tenders/search`**
  - **Query Parameters**: `query`, `page`
  - **Description**: Queries live Prozorro REST API, filters results, and normalizes them for matching.
- **`POST /api/tenders/import`**
  - **Description**: Persists a target Prozorro tender ID into the PostgreSQL database, initializing structural requirements tracking.

### 2.4. Smart Ingestion & Legal Auditing
- **`POST /api/foultender/audit`**
  - **Description**: Uses Gemini to audit tender documentation for illegal discriminatory requirements or restrictive terms.
- **`GET /api/collusion`**
  - **Description**: Analyzes historic relationships, price correlations, and mutual contacts between active participants of a tender.
- **`GET /api/readiness-audit`**
  - **Description**: Validates actual documents uploaded against required tender matrices to flag missing experience certificates, KVEDs, or budget criteria.

### 2.5. Tender Radar
- **`GET /api/radar`**
  - **Description**: Matches KVED, CPV codes, and budget settings against active tenders to fetch optimized high-match lists.

---

## 3. System Utilities
- **`GET /api/health`**
  - **Description**: Returns system component statuses. No authorization header required.
  - **Response**:
    ```json
    { "status": "ok", "timestamp": "..." }
    ```
