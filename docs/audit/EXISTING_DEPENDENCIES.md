# TenderAI OS — EXISTING_DEPENDENCIES.md
## Comprehensive Registry, Licensing & Security Audit of Package Dependencies

**Document ID:** TA-DEP-001  
**Version:** 3.1.0  
**Timestamp:** 2026-08-28T10:50:10Z  
**Classification:** Proprietary Security & Dependency Audit  

---

## 1. Dependency Management Overview

**TenderAI OS** uses a modern, strictly version-pinned TypeScript dependency model. All external components, libraries, and frameworks are evaluated under a 5-step gating pipeline to ensure:
1. **License Safety:** Permissive licenses (MIT, Apache-2.0, BSD-3-Clause, PostgreSQL) are pre-approved.
2. **SaaS Risk Elimination:** Any library utilizing a copyleft license (GPL, AGPL) is either rejected or strictly isolated within isolated virtual container sandboxes (e.g., PyMuPDF) to protect the proprietary nature of TenderAI.
3. **Security Health:** Zero critical or high CVE vulnerabilities are permitted in production build packages.

---

## 2. Core Operational Dependencies (`package.json`)

Below is the complete audit registry of all primary project dependencies.

| Package Name | Pinned Version | License Type | SaaS Risk | Core Role in TenderAI OS |
|---|---|---|---|---|
| **`@google/genai`** | `^2.4.0` | Apache-2.0 | None | Main model connector for Google Gemini AI. |
| **`@google/generative-ai`** | `^0.24.1` | Apache-2.0 | None | Legacy Google AI SDK wrapper (retained for backward compatibility). |
| **`@tailwindcss/vite`** | `^4.1.14` | MIT | None | Vite plugin for compiling Tailwind CSS atomic utilities. |
| **`@vitejs/plugin-react`**| `^5.0.4` | MIT | None | React support wrapper for Vite bundling. |
| **`dotenv`** | `^17.2.3` | BSD-2-Clause | None | Local environment variable management (`.env` variables). |
| **`drizzle-orm`** | `^0.45.2` | Apache-2.0 | None | Next-generation TypeScript SQL mapping engine for PostgreSQL. |
| **`express`** | `^4.21.2` | MIT | None | Core web-framework and API REST endpoint router. |
| **`firebase`** | `^12.18.0` | Apache-2.0 | None | Client-side user login and identity token provider. |
| **`firebase-admin`** | `^14.3.0` | Apache-2.0 | None | Server-side identity claims decoding and verification. |
| **`html2canvas`** | `^1.4.1` | MIT | None | Capture and render page visual frames to image assets. |
| **`jspdf`** | `^4.2.1` | MIT | None | Client-side PDF generation for compiled tender bids. |
| **`lucide-react`** | `^0.546.0` | ISC | None | Standardized icon pack for UI dashboard components. |
| **`motion`** | `^12.23.24` | MIT | None | High-performance React animation and state transition library. |
| **`pg`** | `^8.23.0` | MIT | None | Relational database client interface driver for PostgreSQL. |
| **`react`** | `^19.0.1` | MIT | None | Main client view-rendering library. |
| **`react-dom`** | `^19.0.1` | MIT | None | DOM renderer for React. |
| **`recharts`** | `^3.10.1` | MIT | None | Data visualization and charts rendering. |
| **`vite`** | `^6.2.3` | MIT | None | Frontend development server and build engine. |
| **`vitest`** | `^4.1.11` | MIT | None | Testing and assertion execution engine. |

---

## 3. Developer Dependencies & Build Tools

The platform maintains a decoupled group of dev-dependencies to govern formatting, types validation, and production CJS bundling.

- **`typescript` (`~5.8.2`):** Direct type-safety checker. Used at build and linting gates (`tsc --noEmit`).
- **`esbuild` (`^0.25.0`):** Fast bundler used during production build script compilation to compile the `server.ts` Express application into a clean, standalone, unified, startup-optimized commonJS output file: `dist/server.cjs`.
- **`tsx` (`^4.21.0`):** Execution wrapper that transpiles TypeScript files dynamically in development mode.
- **`drizzle-kit` (`^0.31.10`):** CLI tool for managing migrations, schema diffing, and database scaffolding.

---

## 4. Verification Framework

Dependency audits are triggered automatically during CI/CD gates. No package can be modified or updated without confirming compliance with license risks, CVE statuses, and native support across Vite/Node runtimes.
