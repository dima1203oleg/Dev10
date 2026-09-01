# Production Readiness — Independent Gate

Date: 2026-09-01

## Decision: **NOT READY / DO NOT DEPLOY**

The repository cannot truthfully be submitted as a tested production release yet. This decision supersedes earlier PASS/READY claims in repository reports.

Latest offline gate: TypeScript lint, 18 tests (1 skipped), production build, and moderate dependency audit pass. Release remains `NOT READY` because live service and authenticated browser evidence are unavailable.

Latest UI smoke gate: local developer session passed Radar live-data rendering, tender selection, BoQ/Gantt persistence, bid-package persistence and all 14 primary navigation sections. This does not change the release decision because Firebase/Gemini and production-like OCR, Temporal, ClamAV, S3 and pgvector gates remain blocked.

Latest BoQ truthfulness gate: construction BoQ reloads persisted rows and refuses to display a zero total or “В ринку” when source prices are absent. Release remains `NOT READY`.

Latest hidden-workflow gate: War Room navigation and Multi-Agent Chat entry render successfully with unknown-source data. This is local smoke evidence only; external service and Firebase gates remain blocked.

Clean-install reproducibility gate: `npm ci --ignore-scripts && npm run verify` passed on 2026-09-01. Release is still `NOT READY` until external production-like services and authenticated E2E are proven.

Production self-test: completed with database/direct Prozorro/Gemini/multiplatform checks passing, but live authenticated search timing out at the safety boundary. The endpoint correctly returned `BLOCKED`, not `READY`.

Estimate integrity: synthetic estimate fixtures were removed from production diagnostics; source-bound BoQ/OCR evidence is required before automatic price compilation can be accepted.

## Verified blockers

1. Git provenance is now available on `Dev10/main`; the current verified implementation commit is recorded in Git, but no release tag or rollback rehearsal exists.
2. Local PostgreSQL and enforced RLS are available. Acceptance infrastructure/credentials remain incomplete: Firebase browser login fails, Gemini is not configured, and Temporal, ClamAV, Docling/PaddleOCR, pgvector, DuckDB and S3-compatible storage have not passed live gates.
3. The local Docker acceptance stack cannot finish pulling images while the Mac has only about 116 MiB free. No cache or user data was deleted without explicit authorization.
4. Docker later reported about 2.6 GiB free, but its image store remains unhealthy after the earlier disk I/O failure and Docker Desktop could not restart cleanly. Container gates remain `BLOCKED`, not `PASS`.
3. The UI cost-estimate module contains synthetic reports, suppliers, prices, random calculations and simulated uploads.
4. The multi-platform connector contained generated corporate/social tenders presented as results. Its runtime use was disabled on 2026-08-31; only the verified Prozorro connector may now return records.
5. `/api/data` fabricated statuses/categories/regions while seeding live Prozorro records. Automatic seeding was removed on 2026-08-31.
6. Database tenant isolation is implemented mainly in application queries, not PostgreSQL Row-Level Security as required.
7. No malware scanner, durable workflow engine, verified OCR coordinate provenance, or production object storage is wired end-to-end.
8. A local build artifact exists, but it has no source revision, container digest, signature, staging validation or rollback proof.

## Remediations completed in this audit

- Development authentication now requires non-production mode and explicit `ALLOW_DEV_AUTH=true`; the client separately requires `VITE_ALLOW_DEV_AUTH=true`.
- Production refuses `ALLOW_DEV_AUTH=true`.
- Added baseline HTTP hardening headers and disabled Express disclosure.
- Health returns HTTP 503 when mandatory checks fail.
- `PORT` is configurable and validated.
- Startup migrations run before the listener accepts traffic.
- Synthetic cross-platform results and fabricated database seeding are disabled.
- TypeScript passed, 2/2 unit tests passed, and Vite/server production bundles built on 2026-08-31.
- Production startup was verified to fail closed when required configuration is missing.

## Verification results (2026-08-31)

- TypeScript `tsc --noEmit`: **PASS**
- Vitest: **PASS**, 3 files passed / 1 skipped; 6 tests passed / 1 skipped
- PostgreSQL cross-tenant RLS integration: **PASS**, 1 file / 1 test
- Vite production build: **PASS**, 2,965 modules; route-level chunks, largest emitted JS chunk about 404 kB
- Express server bundle: **PASS**, `server.cjs` about 330 kB
- npm dependency audit: **PASS**, 0 known vulnerabilities
- Browser Node-core externalization: **FIXED** (`randomUUID` now uses Web Crypto)
- Dependency audit: **FAIL**, one moderate transitive advisory in optional `uuid@9.0.1` through `firebase-admin`
- Bundle performance: **WARN**, main JS 1,525.01 kB (388.68 kB gzip)
- Live database/auth/AI/E2E: **BLOCKED**, production services and credentials not supplied

## Required acceptance evidence

- clean lockfile install, typecheck, unit tests, production build and dependency audit;
- disposable PostgreSQL migration test plus enforced RLS cross-tenant tests;
- Firebase token positive/negative integration tests;
- real Prozorro contract tests with recorded source identifiers and timestamps;
- malware/OCR/hash/bbox document pipeline tests;
- browser E2E for every active control and accessibility scan;
- container image/SBOM/signature, staging soak, backup/restore and rollback drill.

Until all items pass, the only accurate release status is **NOT READY**.

## Re-audit 2026-09-01

Status remains **NOT READY**. BoQ mutation persistence and UI unknown-state handling were hardened and verified with `npm run verify`; live Firebase/Gemini, Temporal, OCR, ClamAV, S3/pgvector and complete 237-control E2E evidence are still outstanding.

Team Workspace contract hardening also passed the local type/build gate; external service and authenticated Firebase acceptance gates remain outstanding.

Additional browser smoke evidence confirms profile placeholders are absent and BoQ add/delete works against the authenticated local API. This does not change the release decision because required external integration gates remain unavailable.

Earlier `/api/production/verify` sample (2026-09-01) was `BLOCKED`: database/authentication/Prozorro connectivity/multiplatform checks PASS; AI credentials were `UNKNOWN` until a live model call succeeds; one transient live search timeout was observed, pagination and tenant-isolation evidence were unresolved, and the source-bound estimate engine was BLOCKED.

Re-run 2026-09-01 after the official API self-test hardening: database, authentication, Prozorro connectivity/search (5 live tenders), and multiplatform integrity PASS; pagination is `UNKNOWN`; AI live call, external RLS, document pipeline and source-bound estimate evidence remain `UNKNOWN`/`BLOCKED`. Release status correctly remains **NOT READY**.

Clean reproducibility run 2026-09-01: `npm ci --ignore-scripts && npm run verify` PASS; 694 packages installed, 0 dependency vulnerabilities, typecheck/tests/build/audit green. This validates the local gate only and does not satisfy the outstanding external production gates.

Local production-like component probe 2026-09-01: Docker daemon is available. Compose PostgreSQL (pgvector), ClamAV and SeaweedFS/S3 containers are healthy; Temporal PostgreSQL is healthy and Temporal server is running while its legacy `tctl` healthcheck remains `starting`. Docling image has not been pulled yet; host PaddleOCR and DuckDB binaries are absent. Remaining components are not claimed healthy without evidence.
