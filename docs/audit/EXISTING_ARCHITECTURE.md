# TenderAI OS — EXISTING_ARCHITECTURE.md
## Technical Audit & Structural Blueprint of TenderAI System Architecture

**Document ID:** TA-ARC-001  
**Version:** 3.1.0  
**Timestamp:** 2026-08-28T10:48:00Z  
**Classification:** Proprietary Technical Architecture Review  

---

## 1. Executive Summary

This document provides a comprehensive technical audit of the current software architecture of **TenderAI OS**, a production-grade SaaS platform built for procurement automation, tender analysis, and compliance management within the Ukrainian Prozorro ecosystem.

The system is architected as a **full-stack (Node.js/Express + React/Vite) application** using **PostgreSQL** as the primary transactional datastore, accessed via **Drizzle ORM**. It features deep integrations with Firebase Authentication, Google Gemini LLMs (via the `@google/genai` SDK), and a highly optimized Multi-Platform Procurement Aggregator.

---

## 2. Core Architectural Model

TenderAI OS employs a **decoupled, server-side-secured, single-page application (SPA)** architecture. The core tenet of the architecture is that **no sensitive keys, API tokens, or raw proprietary intelligence ever reach the browser**.

### High-Level Structural Topography

```
                    ┌──────────────────────────────────────────────┐
                    │               Client-Side UI                 │
                    │         React 18.x + Vite + Tailwind         │
                    │   Interactive Dashboards & Chat Interfaces   │
                    └──────────────────────┬───────────────────────┘
                                           │
                                  HTTPS / JSON (JSON Web Tokens)
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │            Express REST Server               │
                    │          Node.js 20.x + TS Runtime           │
                    │        CORS, Rate-Limiting & Security        │
                    └──────┬───────────────┬────────────────┬──────┘
                           │               │                │
                           ▼               ▼                ▼
                     Drizzle ORM       Firebase Auth    Google GenAI SDK
                           │               │                │
                           ▼               ▼                ▼
                    ┌─────────────┐ ┌─────────────┐ ┌──────────────┐
                    │ PostgreSQL  │ │  Firebase   │ │  Gemini API  │
                    │ Transaction │ │ Auth Service│ │ Pro/Flash   │
                    └─────────────┘ └─────────────┘ └──────────────┘
```

---

## 3. Tiered System Decomposition

### 3.1 Frontend Layer (Vite + React)
- **Framework:** React 18.x with TypeScript type-safety.
- **Build System:** Vite, configured with PostCSS, Tailwind CSS, and ESBuild transpilation.
- **Styling Paradigm:** Atomic utility classes via **Tailwind CSS**. No inline CSS or external stylesheet dependencies, except `@import "tailwindcss";` in `/src/index.css`.
- **Icons:** Standardized on `lucide-react`. Custom inline SVG injection is strictly prohibited.
- **State Management:** Functional React components using state hooks (`useState`, `useEffect`, `useMemo`) combined with localized contexts. Statically typed data models loaded from `/src/types.ts`.
- **Entry Points:** 
  - Main HTML wrapper: `/index.html`
  - React application bundle mount: `/src/main.tsx`
  - Core controller component: `/src/App.tsx`
  - Key business logic modules (e.g., `TenderAIConstructionModule.tsx`).

### 3.2 Backend Layer (Express.js)
- **Framework:** Node.js (v18+) and Express.js (v4.x/5.x), running as a full-stack developer server over port `3000`.
- **Runtime transpiler:** `tsx` for high-fidelity native TypeScript execution in development; `esbuild` for bundling into a self-contained CommonJS (`dist/server.cjs`) file in production.
- **Authentication Gateway:** Handled via custom Firebase Auth middleware `/src/middleware/auth.ts`, validating incoming `Authorization: Bearer <JWT>` headers.
- **Multi-Tenant Security Enforcement:** Row-level isolation checked imperatively at the controller level using Drizzle ORM selectors query-scoped by `userId`.

---

## 4. Architectural Safeguards & Quality Mandates

1. **Zero-Mock Policy:** Hardcoded dummy arrays, mock JSON loops, or delayed simulated outputs (`setTimeout`) are structurally eliminated from the main execution pathways.
2. **Deterministic Fallbacks:** When LLMs fail due to transient errors (HTTP 503) or rate limits (HTTP 429), the architecture routes execution to deterministic scoring engines (e.g., `calculatePersonalRadarMatch`, `detectCollusionRisk`).
3. **No HMR Client-Side Flickering:** Hot Module Replacement (HMR) is programmatically disabled in developer settings (`DISABLE_HMR=true`) to preserve the purity of intermediate application states during multi-stage refactoring.
4. **Strict Absolute Path Avoidance:** All backend filesystem interactions use relative pathing resolved via `process.cwd()` to prevent container sandbox path-traversal anomalies.

---

## 5. Architectural Quality Matrix

| Architectural Metric | Status | Implementation Detail |
|---|---|---|
| **Multi-Tenancy** | Excellent | Multi-tenant filtering at SQL level via `userId` queries. |
| **Fault Tolerance** | High | LLM fallback layers between Pro/Flash models and deterministic code. |
| **Code Modularity** | Clean | Decoupled connectors (`/src/connectors/`) and schemas (`/src/db/`). |
| **Performance Ingress** | High | Single CJS bundle compilation for fast server start. |
| **API Gateways** | Standardized | Uniform Express routes matching `/api/*`. |
