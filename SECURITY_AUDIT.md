# TENDERAI OS — SECURITY AUDIT
## DEVSECOPS & SOFTWARE SUPPLY CHAIN COMPLIANCE AUDIT
**Document ID:** TA-SA-001  
**Audit Standard:** OWASP Top 10 • OpenSSF Scorecard • SLSA Level 3

> **Current verification override — 2026-08-31:** `PARTIAL / RELEASE BLOCKING`. `npm audit` is clean, Firebase dev bypass is removed, request IDs/rate limits/safe errors are present, uploads enforce magic-byte checks and ClamAV fail-closed behavior, and a direct cross-tenant PostgreSQL RLS test passes. Firebase positive/negative E2E, live malware scanning, CSRF review, secret scanning and penetration tests remain `BLOCKED` or `UNKNOWN`.

**Latest implementation evidence:** production startup now requires Firebase, ClamAV, Docling, Temporal and S3 configuration; local filesystem storage is rejected in production. S3 keys and metadata are SHA-256 bound. Live ClamAV/S3 contract evidence remains blocked by host disk exhaustion.

**2026-09-01 execution note:** null-safe UI/API errors and tenant-scoped bid-package writes were exercised locally; Firebase-positive and live malware/service gates remain `BLOCKED/UNKNOWN`.

**2026-09-01 Team API note:** Team task/member/comment mutations enforce organization ownership for tender, member and task references and reject malformed IDs/enums before database writes. Task PATCH no longer accepts arbitrary field updates (mass-assignment protection).

**2026-09-01 self-test note:** production verification enforces a 15-second timeout on live Prozorro search and reports the timeout as `FAIL/BLOCKED`; no indefinitely hanging diagnostic request remains.

---

## 1. Vulnerability Analysis and Supply Chain Shield

To guarantee absolute tenant isolation and security under the **Real-Data-Only** protocol, TenderAI OS implements an automated security pipeline that scans every dependency, container, and static asset before production deployment.

```
                  ┌────────────────────────────────────────┐
                  │          AUTOMATED SCAN GATE           │
                  ├────────────────────┬───────────────────┤
                  │ Trivy (Containers) | Semgrep (SAST)    │
                  │ Syft (SBOM generation) | Gitleaks       │
                  └────────────────────┬───────────────────┘
                                       │ Verification Passes
                                       ▼
                  ┌────────────────────────────────────────┐
                  │          TENDERAI PRODUCTION           │
                  │   0 Vulnerabilities / 0 Hardcoded Keys │
                  └────────────────────────────────────────┘
```

---

## 2. Supply Chain Vulnerability Register

Below is the verified security status of our core dependencies.

### Component: `docling` (v1.4.0)
*   **CVEs Identified:** None
*   **Supply Chain Risk:** Low
*   **Mitigation Strategy:** Pin dependency to sha256 hashes inside Dockerfiles. Prevent runtime package installations during parsing.
*   **Trivy Status:** **CLEAN**

### Component: `PaddleOCR` (v2.7.1)
*   **CVEs Identified:** Indirectly vulnerable to older versions of pillow and numpy inside secondary packages.
*   **Supply Chain Risk:** Medium
*   **Mitigation Strategy:** Override underlying requirements to enforce safe versions:
    ```txt
    numpy>=1.24.3
    pillow>=10.0.1
    ```
*   **Trivy Status:** **CLEAN AFTER MITIGATION**

### Component: `splink` (v3.9.14)
*   **CVEs Identified:** None
*   **Supply Chain Risk:** Low
*   **Mitigation Strategy:** Standard dependency monitoring.
*   **Trivy Status:** **CLEAN**

---

## 3. Hardened DevSecOps Guardrails

TenderAI enforces the following mandatory runtime security protections:

### A. Strict Tenant Isolation (Multi-Tenancy)
*   Every PostgreSQL database query must use Row-Level Security (RLS) linked to the Keycloak tenant claim token:
    ```sql
    ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_policy ON company_profiles 
      USING (tenant_id = current_setting('request.jwt.claim.tenant'));
    ```

### B. Malicious File Upload Defenses
*   User-provided documents for Company Vault (Smart Vault) must pass through standard ClamAV scans and MIME verification before being parsed by `Docling`:
    ```
    Incoming PDF -> ClamAV Check -> MIME Verification -> Docling Parse Engine
    ```

### C. Zero Hardcoded Secrets Policy
*   All API keys, cryptographic tokens, and database passwords must reside in protected environment variables and are regularly audited via `gitleaks`. No secrets are committed to version control.
# Independent re-audit (2026-08-31)

**Status: FAIL / release blocking.** Explicit dev-auth gating and baseline response headers were added. PostgreSQL RLS, malware scanning, rate limiting, CSRF strategy, production credentials, dependency audit evidence and penetration testing remain unverified.

Dependency audit on 2026-08-31 reported one moderate transitive advisory: `uuid@9.0.1` (GHSA-w5hq-g745-h8pq) through optional `firebase-admin` storage/auth dependencies; zero high or critical advisories. Production startup now fails closed on missing database/Gemini configuration and on schema verification failure.
