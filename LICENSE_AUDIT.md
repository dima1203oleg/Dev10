# TENDERAI OS — LICENSE AUDIT
## INTELLECTUAL PROPERTY & COMPLIANCE VERIFICATION REPORT
**Document ID:** TA-LA-001  
**Lead Auditor:** Principal Systems Integration & Compliance Attorney-Engineer  

> **Current verification override — 2026-08-31:** `PARTIAL`. npm production dependencies report zero known vulnerabilities, but notices and transitive-license inventory still require a reproducible generated artifact. MinIO is `REJECT` for this new integration because the upstream repository is archived and AGPL-3.0 raises boundary obligations; SeaweedFS remains a `WRAP` candidate.

---

## 1. Compliance Matrix and Risk Classifications

TenderAI OS is distributed as a multi-tenant commercial SaaS platform. Consequently, license compliance is monitored continuously to mitigate copyright leaks and the viral distribution effects of strong copyleft licenses.

We classify licenses into four structural categories:

```
[ Tier A: Permissive (MIT, Apache-2.0, BSD) ] ────────────────► Directly Integrated
[ Tier B: Weak Copyleft (LGPL-3.0, MPL-2.0) ] ─────────────────► Dynamically Linked
[ Tier C: Strong Copyleft (GPL-3.0) ] ─────────────────────────► Container Isolated (WRAP)
[ Tier D: Viral SaaS (AGPL-3.0, SSPL-1.0) ] ───────────────────► REST Endpoint Isolated (WRAP)
```

---

## 2. Component Compliance Triage

Every active software dependency must match these evaluated legal profiles:

### docling (IBM)
*   **License:** MIT
*   **Version:** 1.4.0
*   **Commercial Use:** Allowed
*   **Modification Allowed:** Allowed
*   **Distribution Requirements:** Include copyright notice and license text in distributions.
*   **SaaS Risk:** NONE
*   **Legal Action:** APPROVED for direct import and static integration.

### PaddleOCR (Baidu)
*   **License:** Apache-2.0
*   **Version:** 2.7.1
*   **Commercial Use:** Allowed
*   **Modification Allowed:** Allowed
*   **Distribution Requirements:** Retain copyright, license, and notice of modification.
*   **SaaS Risk:** NONE
*   **Legal Action:** APPROVED. Installed as an isolated backend container to separate large model checkpoints from core code.

### IfcOpenShell
*   **License:** LGPL-3.0
*   **Version:** 0.7.0
*   **Commercial Use:** Allowed
*   **Modification Allowed:** Allowed (Modifications to IfcOpenShell itself must be made public; application using it dynamically does not need to release its code)
*   **Distribution Requirements:** Standard dynamic linking boundaries.
*   **SaaS Risk:** LOW (Strictly dynamically link; do not compile statically with proprietary sources)
*   **Legal Action:** **WRAP** (Run inside a separate python worker container, interacting over a clean HTTP/gRPC API).

### xeokit-sdk
*   **License:** AGPL-3.0
*   **Version:** 2.4.0
*   **Commercial Use:** Restricted under SaaS provisions (If users interact with it over the network, source code of the entire linked application must be disclosed under AGPL-3.0)
*   **SaaS Risk:** EXTREMELY HIGH
*   **Legal Action:** **WRAP & ISOLATE**. We run xeokit purely client-side inside an isolated `<iframe>` element. The parent TenderAI application interacts with the renderer solely over browser postMessage protocols, creating an absolute security and legal barrier that prevents AGPL copyleft contamination.

---

## 3. License Audit Register

The table below lists the legal status of the audited dependencies:

| Component | License Type | Commercial Allowed? | Network Obligation? | SaaS Status |
|---|---|---|---|---|
| `temporal` | MIT | Yes | No | **APPROVED** |
| `qdrant` | Apache-2.0 | Yes | No | **APPROVED** |
| `splink` | MIT | Yes | No | **APPROVED** |
| `ezdxf` | MIT | Yes | No | **APPROVED** |
| `valkey` | BSD-3 | Yes | No | **APPROVED** |
| `minio` | AGPL-3.0 | Yes | Yes (Copyleft) | **ISOLATED WRAP** |
| `grafana` | AGPL-3.0 | Yes | Yes (Copyleft) | **ISOLATED WRAP** |
| `marker` | GPL-3.0 | Yes | Yes (Copyleft) | **CONTAINERIZED WRAP** |

---

## 4. Developer Guidelines

1.  **Never statically import AGPL or GPL modules** in the core TypeScript/Node backend.
2.  Use the **WRAP** strategy with independent container configurations.
3.  Include complete SBOM metadata in every automated build process.
# Independent re-audit (2026-08-31)

**Status: INCOMPLETE.** A release SBOM, exact resolved graph, bundled notices and legal review were not produced from a successful clean install.
