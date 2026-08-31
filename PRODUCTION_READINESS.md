# Production Readiness — Independent Gate

Date: 2026-08-31

## Decision: **NOT READY / DO NOT DEPLOY**

The repository cannot truthfully be submitted as a tested production release yet. This decision supersedes earlier PASS/READY claims in repository reports.

## Verified blockers

1. No Git metadata is present, so source revision, release tag, provenance and rollback target are unidentifiable.
2. Required production secrets/infrastructure are absent: PostgreSQL credentials, Firebase Admin credentials and Gemini key.
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
- Vitest: **PASS**, 1 file / 2 tests
- Vite production build: **PASS**, 2,960 modules
- Express server bundle: **PASS**, `server.cjs` 320.6 kB
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
