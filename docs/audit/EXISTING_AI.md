# TenderAI OS — EXISTING_AI.md
## Technical Audit of Artificial Intelligence Implementations, Fallbacks & Safety Guardrails

**Document ID:** TA-AI-002  
**Version:** 3.1.0  
**Timestamp:** 2026-08-28T10:49:10Z  
**Classification:** Proprietary AI Integration Audit  

---

## 1. High-Performance LLM Client Infrastructure

**TenderAI OS** implements the latest **@google/genai** SDK for all server-side generative artificial intelligence workflows. The AI infrastructure is designed strictly to avoid public API exposure, prevent single-point failures, and guarantee high availability even under upstream model degradation.

### 1.1 SDK Initialization Engine
The LLM context client is lazily initialized via the `getGeminiClient()` function:
```typescript
import { GoogleGenAI } from "@google/genai";

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}
```

---

## 2. Dynamic Model Fallback Pipeline

To protect the production ecosystem against API quota exhaustion (HTTP 429) and transient service unavailability (HTTP 503), TenderAI implements a **sequential multi-model recovery pipeline** (`generateContentWithFallback`):

```
       [ Request Received ]
                │
                ▼
      Try Primary Model: 
      [ gemini-2.5-flash ] ───(Success)───► [ Return Response ]
                │
             (Fail / 429 / 503)
                ▼
      Try Secondary Model:
      [ gemini-2.0-flash ] ───(Success)───► [ Return Response ]
                │
             (Fail / 429 / 503)
                ▼
      Try Tertiary Model:
      [ gemini-1.5-flash ] ───(Success)───► [ Return Response ]
                │
             (Fail)
                ▼
     [ Bubble up Exception ]
```

### Fallback Implementation Code
The engine catches `RESOURCE_EXHAUSTED` (Quota exceeded) and immediately skips to the next model. For transient 503 errors (`UNAVAILABLE` or `overloaded`), it implements a brief jitter delay (800ms) before retrying or switching.

---

## 3. Custom Error Categorization & UX Localization

When all fallback options are exhausted, raw technical errors are filtered and categorized through `handleAiError()` to display safe, localized, actionable directions to the user:

- **AI_UNAVAILABLE (HTTP 503):** "ШІ-сервіс тимчасово перевантажений. Будь ласка, спробуйте ще раз через кілька секунд."
- **AI_QUOTA_EXCEEDED (HTTP 429):** "Вичерпано поточну квоту запитів до ШІ. Спробуйте пізніше або зверніться до налаштувань ключів."

---

## 4. Multi-Agent AI Consilium Architecture

The flagship AI feature in TenderAI is the **Multi-Agent Consilium** (/api/tenderai/multi-agent-analyze). It routes the tender specification and Bill of Quantities (BoQ) items through five specialized AI roles:

| Agent Role | Title | Scope of Work | Main Output Schema |
|---|---|---|---|
| **ESTIMATOR** | Orest Koshtorysnyi | Analyzes BoQ, material units, labor hours, and market rate variance. | `costBreakdown` (materials, labor, machinery, overheads) |
| **TECH_LEAD** | Vitaliy Inzhenernyi | Assesses technical schedules, DBN structural regulations, machinery fit. | `timelineWeeks`, `keyRisks` |
| **LEGAL** | Yulia Pravova | Audits Art 16 qualification criteria, ISO compliance, required work permits. | `complianceScore`, `requiredCertificates` |
| **ANTI_FRAUD** | FoulTender Guardian | Exposes payment risks, hidden legal traps, bad client ratings. | `corruptionRiskScore` |
| **BID_MANAGER** | Maksym Strateg | Formulates optimized auction bidding price and preparedness scoring. | `recommendedBidPrice`, `readinessScore` |

---

## 5. Evidence-First Constraints & AI Safety

All analytical prompts running within FoulTender are structurally restricted to prevent AI Hallucinations:
1. **Verification-First Rule:** Every identified violation must contain an `exactQuote` extracted verbatim from the target document, complete with a `pageReference`.
2. **Regulatory Grounding:** No risk is flagged without mapping back to an official article of the Ukrainian Procurement Law (ЗУ "Про публічні закупівлі") or documented AMCU legal precedents.
