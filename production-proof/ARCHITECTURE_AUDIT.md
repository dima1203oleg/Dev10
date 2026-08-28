# Production Architecture Audit - TenderAI / FoulTender

## 1. System Overview
TenderAI is an enterprise-grade construction procurement platform integrating real-time Prozorro data, AI-driven risk assessment (FoulTender), and multi-agent compliance auditing.

## 2. Core Components
| Component | Technology | Responsibility |
|-----------|------------|----------------|
| **Frontend** | React 19 + Vite | Multi-device UI (Mobile to TV), State Management, Real-time Visualizations |
| **Backend** | Node.js + Express | API Layer, AI Orchestration, Prozorro Proxy, Auth Verification |
| **Database** | PostgreSQL (Drizzle ORM) | Persistence of Tenders, Profiles, Sessions, and User Data |
| **AI Engine** | Google Gemini SDK | Requirement Extraction, Risk Audit, Strategy Generation |
| **Connectors** | Prozorro API (REST) | Source of Truth for Ukrainian Government Procurement |
| **Auth** | Firebase Auth | Secure Multi-tenant Identity Management |

## 3. Responsive Strategy (useViewport)
- **Central Breakpoints**: Defined in `src/design-system/tokens.ts`.
- **Modes**: MOBILE, TABLET, LAPTOP, DESKTOP, TV.
- **Hook**: `useViewport.ts` currently provides width-based detection.
- **Refinement Required**: Add height, orientation, and capability (touch/pointer) detection.

## 4. Security Audit
- **API Keys**: Managed via `.env` (Server-side only).
- **Production Guard**: `ALLOW_DEV_AUTH` must be FALSE in production.
- **Data Isolation**: All database queries are scoped by `userId`.
- **XSS/CSRF**: standard React/Express protections enabled.

## 5. Known Issues / Gap Analysis (Current State)
- [x] `useViewport` now includes orientation, height tracking, and capability detection.
- [x] `ResponsiveAppShell` correctly handles Mobile, Tablet, Laptop, Desktop, and TV modes.
- [x] Mobile Header: Search overlay implemented and verified.
- [x] Mobile Drawer: User data connected to `AuthContext`.
- [x] Pagination: Stateful Prozorro search integrated into `TenderCatalog` and `TenderRadar`.
- [x] Production Guard: `ALLOW_DEV_AUTH` set to false, server strictly checks for `GEMINI_API_KEY`.
- [x] Evidence Engine: AI audits now require `exactQuote` and `pageReference`.
- [x] Production Gate: `/api/production/verify` implemented for self-testing.

## 6. Deployment Readiness
- **Build**: `npm run build` command exists.
- **Lint**: `tsc --noEmit` command exists.
- **Tests**: Vitest for unit tests; Playwright E2E planned.
