# DATABASE SCHEMA SPECIFICATION

**Project:** TenderAI OS (dima1203oleg/Dev10)  
**ORM System:** Drizzle ORM  
**Database Engine:** PostgreSQL (Serverless Cloud SQL compatible)

---

## 1. Table Definitions & Relations

Below are the key tables defined inside `src/db/schema.ts` mapped directly to Postgres entities.

### 1.1. `users` Table
Stores synchronized user entities from Firebase Auth.
- **`uid`** (`varchar`, Primary Key): Firebase/Dev unique identification string.
- **`email`** (`varchar`, Not Null): User Email.
- **`createdAt`** (`timestamp`): Ingest timestamp.

### 1.2. `companies` Table (Digital Twin)
Stores company profile details used for CPV/KVED/financial fit verification.
- **`id`** (`serial`, Primary Key)
- **`userId`** (`varchar`, Foreign Key to `users.uid`): Ensures ownership and multi-tenant scoping.
- **`name`** (`varchar`)
- **`edrpou`** (`varchar`)
- **`kvedCodes`** (`text[]`): Active industry classification codes.
- **`staffCount`** (`integer`)
- **`machineryCount`** (`integer`)
- **`experienceNotes`** (`text`)
- **`updatedAt`** (`timestamp`)

### 1.3. `tenders` Table
Tracks Prozorro tenders that are imported, monitored, or analyzed.
- **`id`** (`varchar`, Primary Key): Prozorro ID (e.g. `UA-2026-X`).
- **`userId`** (`varchar`, Foreign Key to `users.uid`): Scopes access to the importing organization.
- **`title`** (`text`)
- **`description`** (`text`)
- **`budget`** (`numeric`)
- **`currency`** (`varchar`)
- **`procuringEntity`** (`varchar`)
- **`cpvCode`** (`varchar`)
- **`rawJson`** (`jsonb`): Cached full response payload.
- **`retrievedAt`** (`timestamp`)

### 1.4. `tender_requirements` Table
Structural requirement matrices extracted from raw tender files or texts.
- **`id`** (`serial`, Primary Key)
- **`tenderId`** (`varchar`, Foreign Key to `tenders.id`): Back-linked tender reference.
- **`category`** (`varchar`): e.g., TECHNICAL, FINANCIAL, LEGAL, EXPERIENCE.
- **`mandatory`** (`boolean`)
- **`exactText`** (`text`)
- **`verificationStatus`** (`varchar`): `PASS`, `BLOCKED`, `WARNING`.
- **`evidenceRequired`** (`text`)

---

## 2. Integrity & Performance Indexing
1. **Multi-Tenant Constraint**: Queries fetch data using `.where(eq(tenders.userId, authUser.uid))`, ensuring complete data separation.
2. **Cascading Deletes**: Relationships utilize `.onDelete('cascade')` references on Foreign Keys, preventing orphan requirement matrices when tenders or users are deleted.
