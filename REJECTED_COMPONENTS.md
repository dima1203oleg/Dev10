# TENDERAI OS — REJECTED COMPONENTS
## ARCHIVED REJECTED OPEN-SOURCE CANDIDATES REGISTER
**Document ID:** TA-RCR-001  
**Standard:** Strict Licensing • Security • Abandoned Code Vetting

---

## 1. Component Vetting and Rejection Pipeline

To keep TenderAI OS clean, secure, and compliant, we reject open-source packages that introduce licensing risks, security vulnerabilities, or have been abandoned by their maintainers.

```
                  ┌────────────────────────────────────────┐
                  │          VETTING PIPELINE GATE         │
                  ├────────────────────┬───────────────────┤
                  │ Viral licensing?   | Abandoned status? │
                  │ Security risks?    | Low code quality? │
                  └────────────────────┬───────────────────┘
                                       │ Mapped Violation
                                       ▼
                  ┌────────────────────────────────────────┐
                  │      REJECTED COMPONENTS ARCHIVE       │
                  │   Banned from inclusion in codebase    │
                  └────────────────────────────────────────┘
```

---

## 2. Rejected Components Register

Below is the list of vetted packages that have been rejected from direct inclusion in TenderAI OS, alongside their technical justifications:

### neo4j (Graph Database)
*   **Repository:** [github.com/neo4j/neo4j](https://github.com/neo4j/neo4j)
*   **License Type:** GPL-3.0
*   **Technical Reason:** Strong copyleft restrictions. Direct integration risks viral license contamination of our transactional core.
*   **Alternative:** We use `NetworkX` (BSD-3 licensed) inside our Python workers, which are isolated behind secure microservice APIs.

### igraph (C-Compiled Graphing)
*   **Repository:** [github.com/igraph/python-igraph](https://github.com/igraph/python-igraph)
*   **License Type:** GPL-2.0
*   **Technical Reason:** Strong copyleft GPL-2.0 restrictions pose critical compliance risks for multi-tenant commercial SaaS architectures.
*   **Alternative:** **rustworkx** (Apache-2.0 licensed) provides faster graph operations compiled directly in Rust.

### elasticsearch (Search Engine)
*   **Repository:** [github.com/elastic/elasticsearch](https://github.com/elastic/elasticsearch)
*   **License Type:** Elastic License v2 (ELv2) / Server Side Public License (SSPL)
*   **Technical Reason:** The ELv2 and SSPL licenses carry restrictive SaaS provisions that prevent hosting the search engine as a managed service without releasing the hosting platform's code.
*   **Alternative:** **OpenSearch** (Apache-2.0 licensed) or **Meilisearch** (MIT licensed).

### crewAI (AI Multi-Agent Framework)
*   **Repository:** [github.com/crewAIInc/crewAI](https://github.com/crewAIInc/crewAI)
*   **License Type:** MIT
*   **Technical Reason:** High rate of non-deterministic agent loops, leading to excessive LLM token consumption and unpredictable execution paths that fail compliance regulations.
*   **Alternative:** **LangGraph** (MIT licensed) enforces structured state machine execution.

### redis (In-Memory Broker)
*   **Repository:** [github.com/redis/redis](https://github.com/redis/redis)
*   **License Type:** Redis Source Available License v2 (RSALv2)
*   **Technical Reason:** The license transition away from BSD-3 restrictions limits usage inside multi-tenant SaaS environments.
*   **Alternative:** **Valkey** (BSD-3 licensed), the official community-driven fork.
