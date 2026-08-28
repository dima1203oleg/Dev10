# TenderAI OS — EXISTING_DATABASE.md
## Deep-Dive Audit of Database Schemas, Relationships & Storage Performance

**Document ID:** TA-DB-001  
**Version:** 3.1.0  
**Timestamp:** 2026-08-28T10:48:35Z  
**Classification:** Proprietary Database Schema Audit  

---

## 1. Architectural Database Blueprint

TenderAI OS is powered by a relational **PostgreSQL** database managed programmatically using **Drizzle ORM** (v0.30+). Database schemas are structured strictly around relational normalization, and use the powerful `jsonb` column data type to store structured document extractions, parsed BoQ items, and dynamic API responses efficiently.

---

## 2. Table-by-Table Architectural Catalog

### 2.1 Table: `users`
Represents individual authorized tender department specialists, managers, or company administrators. Linked directly to Firebase Authentication claims.

| Column Name | Data Type | Constraints | Purpose |
|---|---|---|---|
| `id` | `serial` | Primary Key | Local auto-increment identifier |
| `uid` | `text` | Unique, Not Null | Firebase Auth UID |
| `email` | `text` | Not Null | Synced user email address |
| `created_at` | `timestamp` | Default Now | Record initialization timestamp |

### 2.2 Table: `company_profiles`
Maintains the "Company Smart Vault" and metadata profile of bidding entities.

| Column Name | Data Type | Constraints | Purpose |
|---|---|---|---|
| `id` | `serial` | Primary Key | Local identifier |
| `user_id` | `integer` | Foreign Key (`users.id`) | Tenant/owner mapping |
| `name` | `text` | Not Null | Official legal entity name |
| `edrpou` | `text` | Not Null | Official Ukrainian 8-digit EDRPOU code |
| `legal_address` | `text` | Nullable | Legal address of corporate entity |
| `director_name`| `text` | Nullable | Director's full name |
| `email` | `text` | Nullable | Primary corporate email |
| `phone` | `text` | Nullable | Corporate phone number |
| `vault_data` | `jsonb` | Nullable | Stores equipment, staff, analogous contracts |
| `created_at` | `timestamp` | Default Now | Creation timestamp |
| `updated_at` | `timestamp` | Default Now | Modification track |

### 2.3 Table: `tenders`
Core table for active monitored public and private tenders, including parsed results.

| Column Name | Data Type | Constraints | Purpose |
|---|---|---|---|
| `id` | `serial` | Primary Key | Local identifier |
| `user_id` | `integer` | Foreign Key (`users.id`) | Tenant ownership scope |
| `tender_number`| `text` | Not Null | Prozorro ID (e.g., UA-2026-08-28-008794-a) |
| `title` | `text` | Not Null | Title of procurement |
| `customer` | `text` | Nullable | Procuring entity name |
| `budget_uah` | `text` | Nullable | Budget (stored as text for precision/bigint) |
| `status` | `text` | Nullable | Active status (ACTIVE, AUDIT_FLAGGED, etc.) |
| `foul_score` | `integer` | Nullable | FoulTender anti-corruption score (0-100) |
| `risk_level` | `text` | Nullable | Risk valuation (LOW, MEDIUM, HIGH, CRITICAL) |
| `summary` | `text` | Nullable | LLM-generated procurement summary |
| `detailed_data`| `jsonb` | Nullable | Rich JSON containing boqItems, requirement compliance |

### 2.4 Table: `tender_documents`
Contains metadata and extraction logs for documents attached to specific tenders.

| Column Name | Data Type | Constraints | Purpose |
|---|---|---|---|
| `id` | `text` | Primary Key | Unique UUID |
| `tender_id` | `integer` | Foreign Key (`tenders.id`) | Tender linkage |
| `name` | `text` | Not Null | Uploaded filename |
| `type` | `text` | Not Null | Classification: TECHNICAL, BOQ, LEGAL, OTHER |
| `status` | `text` | Not Null | Extraction status: IDLE, PROCESSING, EXTRACTED |
| `size` | `integer` | Nullable | File size in bytes |
| `extracted_data`| `jsonb` | Nullable | Extracted key requirements and risks |
| `uploaded_at` | `timestamp` | Default Now | Upload timestamp |

### 2.5 Table: `complaints`
Stores draft and submitted AMCU (Antimonopoly Committee) legal complaints.

| Column Name | Data Type | Constraints | Purpose |
|---|---|---|---|
| `id` | `serial` | Primary Key | Local identifier |
| `user_id` | `integer` | Foreign Key (`users.id`) | User association |
| `tender_id` | `integer` | Foreign Key (`tenders.id`) | Linked tender |
| `content` | `text` | Not Null | Full legal complaint text |
| `status` | `text` | Not Null | Status: DRAFT, SUBMITTED |
| `created_at` | `timestamp` | Default Now | Date created |

### 2.6 Table: `search_sessions`
Stateful search sessions to manage cursor-based pagination for multi-platform scans.

| Column Name | Data Type | Constraints | Purpose |
|---|---|---|---|
| `id` | `text` | Primary Key | UUID search session ID |
| `user_id` | `integer` | Foreign Key (`users.id`) | Scoped searcher |
| `raw_query` | `text` | Not Null | Original search string |
| `structured_query`| `jsonb`| Not Null | LLM-decomposed structured query components |
| `source` | `text` | Default 'Prozorro' | Search index source |
| `source_cursor`| `text` | Nullable | Offset token returned from multi-source indexes |
| `pages_scanned`| `integer` | Default 0 | Telemetry tracker |
| `records_scanned`| `integer`| Default 0 | Total raw records scanned |
| `records_matched`| `integer`| Default 0 | Total records matching filters |

---

## 3. Relationships Graph & Constraints

Drizzle Relations (`relations` helper) ensure strict referential integrity.
- **One-to-Many Relationships:**
  - One `user` can own multiple `company_profiles`, `tenders`, `complaints`, and `search_sessions`.
  - One `tender` can have multiple `tender_documents` and associated `complaints`.
- **Foreign Key Actions:** Enforces cascade-like consistency checks imperatively through backend middlewares to prevent data orphans while guaranteeing strict multi-tenant isolation.
