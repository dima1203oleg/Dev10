import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser } from "./src/db/users.ts";
import { db } from "./src/db/index.ts";
import { tenders as tendersTable, companyProfiles, complaints } from "./src/db/schema.ts";
import { eq, and } from "drizzle-orm";
import { fetchProzorroRecentTenders, calculatePersonalRadarMatch, fetchProzorroTenderFullDetail } from "./src/connectors/prozorro.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Auth sync endpoint
app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user || !user.email) {
      return res.status(400).json({ error: "Missing user email" });
    }
    
    const dbUser = await getOrCreateUser(user.uid, user.email);
    res.json({ status: "ok", user: dbUser });
  } catch (error) {
    console.error("Auth sync error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API: Get Data (Tenders, Profile, etc)
app.get("/api/data", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    
    const dbUser = await getOrCreateUser(user.uid, user.email || "");
    
    // Fetch all user's tenders
    let userTenders = await db.select().from(tendersTable).where(eq(tendersTable.userId, dbUser.id));
    
    // Fetch company profile
    const userProfiles = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, dbUser.id));
    
    res.json({
      tenders: userTenders,
      profile: userProfiles.length > 0 ? userProfiles[0] : null
    });
  } catch (error) {
    console.error("Data fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API: Save Tender (Scoped by userId + tenderNumber)
app.post("/api/tenders", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const dbUser = await getOrCreateUser(user.uid, user.email || "");
    
    const { tenderNumber, title, customer, budgetUah, status, foulScore, riskLevel, summary, detailedData } = req.body;
    
    // Scoped check by both userId AND tenderNumber for multi-tenant isolation
    const existing = await db.select().from(tendersTable).where(
      and(
        eq(tendersTable.userId, dbUser.id),
        eq(tendersTable.tenderNumber, tenderNumber)
      )
    );
    if (existing.length > 0) {
      return res.json(existing[0]); // Return user's existing tender
    }
    
    const newTender = await db.insert(tendersTable).values({
      userId: dbUser.id,
      tenderNumber,
      title,
      customer,
      budgetUah,
      status: status || 'ACTIVE',
      foulScore: foulScore !== undefined ? foulScore : null, // null until analyzed
      riskLevel: riskLevel || 'NOT_ANALYZED',
      summary: summary || 'Імпортовано з Prozorro. Чкає аналізу.',
      detailedData
    }).returning();
    
    res.json(newTender[0]);
  } catch (error) {
    console.error("Save tender error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API: Real Prozorro Search Integration (Strictly No Fake FoulScore)
app.get("/api/prozorro/search", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { query } = req.query;
    const qString = query && typeof query === 'string' ? query : undefined;
    
    const tenders = await fetchProzorroRecentTenders(6, qString);
    res.json({ tenders });
  } catch (error) {
    console.error("Prozorro API error:", error);
    res.status(500).json({ error: "Failed to fetch from Prozorro API" });
  }
});

// API: Personal Tender Radar (Matches Prozorro Feed against User's Company Vault)
app.get("/api/prozorro/radar", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const dbUser = await getOrCreateUser(user.uid, user.email || "");

    const userProfiles = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, dbUser.id));
    const profile = userProfiles.length > 0 ? userProfiles[0] : null;

    const rawTenders = await fetchProzorroRecentTenders(8);

    const radarFeed = rawTenders.map((tender) => {
      const matchResult = calculatePersonalRadarMatch(tender, profile);
      return {
        ...tender,
        fitScore: matchResult.fitScore,
        fitFactors: matchResult.factors,
        radarReasons: matchResult.reasons
      };
    });

    // Sort feed by highest fit score first
    radarFeed.sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0));

    res.json({ radarFeed });
  } catch (error) {
    console.error("Personal Tender Radar error:", error);
    res.status(500).json({ error: "Failed to generate Tender Radar feed" });
  }
});

// API: Real Prozorro Deep Tender Details & Documentation Fetch
app.get("/api/prozorro/tender/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing tender ID" });
    }
    const fullDetail = await fetchProzorroTenderFullDetail(id);
    res.json(fullDetail);
  } catch (error) {
    console.error("Prozorro Tender Full Detail error:", error);
    res.status(500).json({ error: "Failed to fetch full tender details from Prozorro" });
  }
});


// Lazy Google GenAI initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to execute Gemini requests with model fallbacks & transient retry
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }
) {
  const modelsToTry = Array.from(
    new Set([
      params.primaryModel || "gemini-3.6-flash",
      "gemini-3.6-flash",
      "gemini-3.7-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest"
    ])
  );

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || err || "");
        const isTransient =
          err?.status === 503 ||
          err?.code === 503 ||
          errMsg.includes("503") ||
          errMsg.includes("high demand") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("overloaded") ||
          err?.status === 429 ||
          err?.code === 429;

        console.warn(
          `[Gemini] Call to '${modelName}' (attempt ${attempt + 1}) failed (${errMsg}). ${
            isTransient ? "Retrying or switching fallback..." : ""
          }`
        );

        if (isTransient && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
        } else {
          break;
        }
      }
    }
  }

  throw lastError;
}

function handleAiError(res: express.Response, error: any, defaultMsg: string) {
  const errMsg = String(error?.message || error || "");
  const is503 = error?.status === 503 || error?.code === 503 || errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE");
  
  if (is503) {
    return res.status(503).json({
      error: "ШІ-сервіс тимчасово перевантажений (503 UNAVAILABLE). Будь ласка, спробуйте ще раз через кілька секунд.",
      code: "AI_UNAVAILABLE"
    });
  }
  
  return res.status(500).json({ error: errMsg || defaultMsg });
}

// Health check endpoint with deep diagnostics
app.get("/api/health", async (_req, res) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  let dbCheck = "ok";
  let prozorroCheck = "reachable";

  try {
    await db.select().from(tendersTable).limit(1);
  } catch (err) {
    dbCheck = "error";
  }

  try {
    const pRes = await fetch("https://public.api.openprocurement.org/api/2.5/tenders?limit=1");
    if (!pRes.ok) prozorroCheck = "degraded";
  } catch (err) {
    prozorroCheck = "unreachable";
  }

  const isHealthy = dbCheck === "ok" && hasGeminiKey;

  res.status(200).json({
    status: isHealthy ? "ok" : "degraded",
    app: "TenderAI & FoulTender Suite v3.1",
    timestamp: new Date().toISOString(),
    checks: {
      database: dbCheck,
      gemini: hasGeminiKey ? "configured" : "missing_key",
      prozorro: prozorroCheck
    }
  });
});

// API: FoulTender - Anti-Corruption & Discriminatory Requirement Audit
app.post("/api/foultender/audit", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { tenderTitle, tenderId, customer, budget, tenderText, category } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini AI API key is missing. Analysis cannot be performed." });
    }

    const prompt = `Виступай у ролі експертного аудитора антикорупційної платформи "FoulTender" та провідного юриста з публічних закупівель України (Prozorro, АМКУ, ДАСУ).
Здійсни детальний юридичний та антикорупційний аудит тендеру на предмет дискримінаційних вимог, корупційних пасток, завищення цін та обмеження конкуренції.

ВИМОГИ ДО ДОКАЗОВОЇ БАЗИ (EVIDENCE-FIRST):
1. Кожне виявлене порушення повинно обов'язково містити цитату з тексту тендеру ("exactQuote") та посилання на конкретні статті закону (ЗУ "Про публічні закупівлі" ст. 5 "Принципи здійснення закупівель", ст. 16 "Кваліфікаційні критерії", ст. 22 "Тендерна документація").
2. Не вигадуй номерів рішень АМКУ, якщо немає точного підтвердження. Посилайся на узагальнену практику Колегії АМКУ.

Дані тендеру:
- Назва: ${tenderTitle || "Будівельно-монтажні роботи"}
- ID закупівлі: ${tenderId || "UA-2024-..."}
- Замовник: ${customer || "Орган місцевого самоврядування"}
- Очікувана вартість: ${budget || "50 000 000"} грн
- Категорія: ${category || "Будівництво / Реконструкція"}
- Текст ТД / Технічного завдання / Специфікації:
"""
${tenderText || "Вимоги до учасників: наявність власної акредитованої лабораторії не далі 15 км від об'єкта, наявність власного асфальтобетонного заводу, досвід аналогічних робіт за останні 6 місяців на суму не менше 100% очікуваної вартості, термін виконання робіт 10 робочих днів."}
"""

Поверни ТІЛЬКИ валідний JSON у наступному форматі:
{
  "foulScore": number (від 0 до 100, де 100 - критичний корупційний/дискримінаційний ризик),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "Короткий висновок аудитора українською мовою з підтвердженням за джерелами",
  "violations": [
    {
      "type": "DISCRIMINATORY_REQUIREMENT" | "UNREALISTIC_TIMELINE" | "PRICING_ANOMALY" | "COLLUSION_RISK" | "TECHNICAL_LOCKIN",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "title": "Назва порушення",
      "description": "Детальний опис у чому полягає дискримінація або порушення",
      "exactQuote": "Цитата або уривок з тексту ТД",
      "legalBasis": "Конкретна стаття та частина ЗУ 'Про публічні закупівлі' (наприклад ст. 5 ч. 4)",
      "amcuPrecedent": "Практика АМКУ з даного типу дискримінації"
    }
  ],
  "amcuAppealRecommendation": {
    "recommended": boolean,
    "prospectsText": "Високий юридичний потенціал (Потребує підтвердження документальними доказами)",
    "appealGrounds": "Чіткі підстави для подання скарги до Колегії АМКУ",
    "estimatedAmcuFeeUah": number (розрахункова плата за подання скарги)
  }
}`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Ти – бездоганний експерт з публічних закупівель України (FoulTender AI Auditor). Відповідай виключно у форматі JSON згідно наданої схеми.",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("FoulTender Audit Error:", error);
    return handleAiError(res, error, "Помилка аналізу тендеру");
  }
});

// API: FoulTender - Generate Formal AMCU Complaint
app.post("/api/foultender/generate-complaint", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { tenderId, tenderTitle, customer, complainantName, edrpou, violations, specificDemand } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini AI API key is missing. Analysis cannot be performed." });
    }

    const prompt = `Склади професійну юридичну Скаргу до Постійно діючої адміністративної колегії Антимонопольного комітету України (АМКУ) з розгляду скарг про порушення законодавства у сфері публічних закупівель.

Дані:
- Скаржник: ${complainantName || "ТОВ «БудТехніка-Сервіс»"} (ЄДРПОУ: ${edrpou || "40192831"})
- Замовник: ${customer || "КП Міськбуд"}
- ID закупівлі: ${tenderId}
- Назва: ${tenderTitle}
- Виявлені порушення: ${JSON.stringify(violations)}
- Специфічні вимоги/прохання: ${specificDemand || "Зобов'язати Замовника внести зміни до ТД та виключити дискримінаційні положення"}

Склади повний, бездоганно структурований текст скарги за офіційною формою АМКУ України, включаючи вступну частину, реквізити сторін, виклад фактичних обставин, посилання на норми ЗУ "Про публічні закупівлі" та прецеденти Колегії АМКУ, а також резолютивну (прохальну) частину.

Поверни JSON:
{
  "complaintText": "Повний текст скарги з усіма реквізитами та структурою",
  "legalReferences": ["список статей законів та нормативних актів"],
  "estimatedFee": number (розмір плати за подання скарги в грн)
}`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Generate Complaint Error:", error);
    return handleAiError(res, error, "Помилка генерації скарги");
  }
});

// API: TenderAI Construction SaaS - Multi-Agent Analysis & BoQ Evaluation
app.post("/api/tenderai/multi-agent-analyze", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { tenderTitle, budget, boqItems, projectScope, specifications } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini AI API key is missing. Analysis cannot be performed." });
    }

    const prompt = `Ти виступаєш як оркестратор мультиагентної системи "TenderAI Construction SaaS" у синергії з антикорупційним модулем "FoulTender".
Проведи мультиагентний аналіз будівельного тендеру за участю 5 спеціалізованих агентів:

1. **Кошторисник (Estimator)**: аналізує обсяги BoQ, матеріали, трудовитрати, ринкові розцінки та накладні витрати.
2. **Головний Інженер / ГІП (Tech Lead)**: перевіряє календарний графік, технологію будівництва, машини/механізми та будівельні норми (ДБН).
3. **Тендерний Юрист (Legal Counsel)**: кваліфікаційні вимоги ст. 16 ЗУ "Про публічні закупівлі", ліцензії, дозволи Держпраці, банківські гарантії.
4. **FoulTender Guardian (Anti-Fraud)**: перевіряє фінансову порядність замовника, ризики касових розривів, корупційні пастки в договорі.
5. **Тендерний Директор / Стратег (Bid Manager)**: підсумовує маржинальність, пропонує оптимальну ціну пропозиції та Go/No-Go рішення.

Дані проєкту:
- Назва тендеру: ${tenderTitle || "Капітальне будівництво / реконструкція"}
- Очікувана вартість: ${budget || "45000000"} грн
- Обсяг робіт / BoQ позиції: ${JSON.stringify(boqItems || [])}
- Технічні специфікації: ${specifications || "Стандартні вимоги ДБН"}
- Загальний опис: ${projectScope || "Будівництво монолітно-каркасної споруди з оздобленням та інженерними мережами"}

Поверни ТІЛЬКИ валідний JSON у наступному форматі:
{
  "overallDecision": "GO" | "GO_WITH_CONDITIONS" | "NO_GO",
  "totalCalculatedCost": number,
  "expectedMarginPercent": number,
  "agents": {
    "estimator": {
      "agentName": "Орест Кошторисний (Agent Estimator)",
      "avatar": "👷",
      "status": "APPROVED" | "PASSED_WITH_WARNINGS" | "REJECTED",
      "summary": "Аналіз кошторису та розцінок",
      "costBreakdown": {
        "materialsCost": number,
        "laborCost": number,
        "machineryCost": number,
        "overheadsAndTaxes": number
      },
      "recommendations": ["рекомендація 1", "рекомендація 2"]
    },
    "techLead": {
      "agentName": "Віталій Інженерний (Agent Tech / ГІП)",
      "avatar": "🏗️",
      "status": "APPROVED" | "PASSED_WITH_WARNINGS" | "REJECTED",
      "summary": "Аналіз технології та строків виконання",
      "timelineWeeks": number,
      "keyRisks": ["ризик 1", "ризик 2"]
    },
    "legalCounsel": {
      "agentName": "Юлія Правова (Agent Legal)",
      "avatar": "⚖️",
      "status": "APPROVED" | "PASSED_WITH_WARNINGS" | "REJECTED",
      "summary": "Юридична перевірка кваліфікації та договору",
      "complianceScore": number,
      "requiredCertificates": ["сертифікат 1", "дозвіл 2"]
    },
    "antiFraud": {
      "agentName": "FoulTender Guardian (Agent Anti-Fraud)",
      "avatar": "🛡️",
      "status": "APPROVED" | "PASSED_WITH_WARNINGS" | "REJECTED",
      "summary": "Антикорупційна оцінка замовника та прихованих пасток",
      "corruptionRiskScore": number
    },
    "bidManager": {
      "agentName": "Максим Стратег (Agent Bid Manager)",
      "avatar": "💼",
      "status": "RECOMMENDED" | "NOT_RECOMMENDED",
      "summary": "Фінальна цінова стратегія на аукціоні",
      "recommendedBidPrice": number,
      "readinessScore": number
    }
  }
}`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Multi-Agent Analyze Error:", error);
    return handleAiError(res, error, "Помилка мультиагентного аналізу");
  }
});

// API: Multi-Agent Interactive Chat
app.post("/api/tenderai/agent-chat", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { message, agentRole, tenderContext } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini AI API key is missing. Analysis cannot be performed." });
    }

    const systemPrompt = `Ти – спеціалізований ШІ-агент у команді платформи TenderAI & FoulTender Suite.
Твоя поточна роль: ${agentRole || "Команда експертів (Консиліум)"}.
Ролі в системі:
- ESTIMATOR (Кошторисник): відповідає за кошториси, ДБН, розцінки АВК-5, матеріали, машиногодини, прямі та непрямі витрати.
- TECH_LEAD (Головний Інженер): відповідає за технологію, графіки, безпеку, обладнання, ДБН А.3.1-5:2016.
- LEGAL (Тендерний Юрист): відповідає за ст. 16, 17, 22 ЗУ "Про публічні закупівлі", тендерні гарантії, оскарження.
- FOULTENDER (Антифрод & FoulTender): виявляє дискримінаційні пастки, корупційні схеми, аналізує рішення АМКУ.
- BID_MANAGER (Тендерний Директор): формує цінову стратегію на аукціоні, оцінює маржинальність.

Контекст активного проєкту: ${JSON.stringify(tenderContext || "Будівельний тендер Prozorro")}.
Давай точні, авторитетні, професійні відповіді українською мовою з практичними діями та посиланнями на нормативи.`;

    const response = await generateContentWithFallback(ai, {
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return res.json({
      reply: response.text || "Агент опрацював ваше звернення.",
      agentRole: agentRole || "ALL_AGENTS"
    });
  } catch (error: any) {
    console.error("Agent Chat Error:", error);
    return handleAiError(res, error, "Помилка зв'язку з агентом");
  }
});

// API: Match Company Vault with Tender Requirements (Gap Analysis)
app.post("/api/company/audit-vault-match", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { companyProfile, tenderTitle, tenderRequirements, tenderText } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "Gemini AI API key is missing. Analysis cannot be performed." });
    }

    const prompt = `Ти – AI аудитор відповідності тендерних документів (Tender Compliance & Gap Matching Engine).
Твоє завдання – перевірити наявні документи, техніку, персонал та досвід компанії на відповідність кваліфікаційним та технічним вимогам тендерної документації.

Профіль компанії та Vault:
${JSON.stringify(companyProfile, null, 2)}

Тендер: "${tenderTitle}"
Текст або вимоги тендеру:
${JSON.stringify(tenderRequirements || tenderText)}

Проаналізуй кожен пункт вимог та поверни JSON:
{
  "matchPercentage": number (0-100),
  "coveredCount": number,
  "warningCount": number,
  "gapCount": number,
  "requirements": [
    {
      "id": "string",
      "category": "QUALIFICATION_ART16" | "TECHNICAL_SPEC" | "LEGAL_CONTRACT" | "FINANCIAL_GUARANTEE" | "ANTI_CORRUPTION_ART17",
      "title": "Коротка назва вимоги",
      "clauseInTenderDoc": "Пункт ТД",
      "exactQuote": "Цитата з ТД",
      "status": "COVERED" | "WARNING" | "GAP_MISSING" | "UNKNOWN",
      "matchingDocName": "Назва документу з Vault, якщо знайдено",
      "matchingDocId": "id документу",
      "explanation": "Чому відповідає або чому виник розрив/GAP",
      "actionRequired": "Що конкретно зробити учаснику"
    }
  ]
}`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Ти – безкомпромісний юридичний аудитор тендерних пропозицій. Відповідай строго у форматі JSON."
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Vault Match Audit Error:", error);
    return handleAiError(res, error, "Помилка зіставлення документів");
  }
});

// API: Competitor Intelligence & Collusion Risk Engine
app.post("/api/tenderai/collusion-detect", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { tenderId, tenderTitle, competitors, history } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "Gemini AI API key is missing. Analysis cannot be performed." });
    }

    const prompt = `Ти – AI експерт антимонопольного аналізу та виявлення картельних змов у публічних закупівлях України (FoulTender Collusion Detector).
Проаналізуй конкурентів та патерни їхньої поведінки для тендеру: "${tenderTitle}" (ID: ${tenderId}).

Конкуренти:
${JSON.stringify(competitors || [])}
Історія та додаткові маркери:
${JSON.stringify(history || {})}

Поверни валідний JSON:
{
  "collusionRiskScore": number (0-100),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "primarySuspects": ["Назва 1", "Назва 2"],
  "anomaliesDetected": [
    {
      "title": "Назва аномалії",
      "description": "Детальний опис змови чи узгоджених дій",
      "evidence": "Фактичні докази / маркери"
    }
  ],
  "coBiddingGraph": [
    {
      "source": "Компанія А",
      "target": "Компанія Б",
      "sharedTenders": number,
      "winDistribution": "Розподіл перемог"
    }
  ]
}`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Collusion Detect Error:", error);
    return handleAiError(res, error, "Помилка аналізу змови");
  }
});

// API: Version Diff Analyzer for Tender Documentation
app.post("/api/tenderai/version-diff", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { tenderId, version1Text, version2Text } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "Gemini AI API key is missing. Analysis cannot be performed." });
    }

    const prompt = `Здійсни інтелектуальний AI Diff (порівняння змін) між двома редакціями тендерної документації.
Визнач додані, видалені та змінені вимоги, оціни рівень ризику кожної зміни (чи це прихована пастка для фаворита).

Редакція 1 (попередня):
"""
${version1Text || "Стандартні умови ТД з терміном виконання 60 днів"}
"""

Редакція 2 (нова):
"""
${version2Text || "Змінені умови: додано вимогу про завод не далі 12 км, строк виконання 18 днів"}
"""

Поверни JSON:
{
  "tenderId": "${tenderId || 'diff-tender'}",
  "previousVersion": "Редакція 1.0",
  "currentVersion": "Редакція 2.0",
  "changesCount": number,
  "summary": "Загальний висновок щодо ризику внесених змін",
  "changes": [
    {
      "id": "diff-1",
      "type": "ADDED" | "REMOVED" | "MODIFIED",
      "category": "Категорія",
      "clause": "Пункт ТД",
      "oldValue": "Старе значення",
      "newValue": "Нове значення",
      "riskImpact": "INCREASED_RISK" | "DECREASED_RISK" | "NEUTRAL" | "CRITICAL_TRAP",
      "aiCommentary": "AI аналіз наміру замовника"
    }
  ]
}`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Version Diff Error:", error);
    return handleAiError(res, error, "Помилка порівняння версій");
  }
});

// API: Pre-Submission Readiness Audit & Scorecard
app.post("/api/tenderai/readiness-audit", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { tender, companyProfile, bidPackage } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "Gemini AI API key is missing. Analysis cannot be performed." });
    }

    const prompt = `Ти – Головний Тендерний Контролер платформи TenderAI. Проведи фінальний Pre-Submission Compliance Audit перед поданням пропозиції на майданчик Prozorro.
Тендер: ${JSON.stringify(tender?.title || "Будівельний тендер")}
Бюджет: ${tender?.budgetUah || 30000000} грн
Дані пропозиції: ${JSON.stringify(bidPackage || {})}
Дані компанії: ${JSON.stringify(companyProfile?.shortName || "ТОВ УкрБуд")}

Оціни готовність за шкалою 0-100 та сформуй критичний стоп-лист перевірок.
Поверни JSON:
{
  "totalScore": number (0-100),
  "readyToSubmit": boolean,
  "categories": {
    "documentsVault": number,
    "qualificationArt16": number,
    "costAndBoQ": number,
    "legalDraftContract": number,
    "technicalSpecs": number
  },
  "criticalChecklist": [
    {
      "id": "chk-1",
      "title": "Назва контрольної точки",
      "passed": boolean,
      "severity": "BLOCKING" | "WARNING" | "INFO",
      "detail": "Пояснення та рекомендація для усунення ризику"
    }
  ]
}`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Readiness Audit Error:", error);
    return handleAiError(res, error, "Помилка Pre-Submission аудиту");
  }
});

// API: Ingest Tender (Prozorro URL / Text / Specification)
app.post("/api/tenderai/prozorro-ingest", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { urlOrId, tenderText, category } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "Gemini AI API key is missing. Analysis cannot be performed." });
    }

    const prompt = `Ти – Prozorro Ingestion & AI Decomposer Engine платформи TenderAI.
Твоє завдання – розібрати вхідний текст закупівлі (або посилання/ідентифікатор ${urlOrId}) та сформувати повну структуровану модель тендеру з BoQ позиціями, антикорупційними маркерами та вимогами.

Текст закупівлі / Специфікація:
"""
${tenderText || "Капітальний ремонт будівлі школи. Очікувана вартість: 35 млн грн. Роботи: утеплення фасадів 2500 м2, заміна віконних блоків 400 м2, влаштування покрівлі з ПВХ-мембрани 1200 м2."}
"""

Поверни валідний JSON у наступному форматі:
{
  "id": "tender-custom-id",
  "tenderNumber": "${urlOrId?.includes('UA-') ? urlOrId : 'UA-2026-03-994821-a'}",
  "title": "Повна назва предмету закупівлі",
  "customer": "Назва замовника",
  "customerEdrpou": "ЄДРПОУ замовника (8 цифр)",
  "customerCity": "Місто",
  "budgetUah": number,
  "deadline": "YYYY-MM-DD",
  "region": "Область або місто",
  "status": "ACTIVE",
  "category": "${category || 'Будівельні роботи'}",
  "foulScore": number (0-100),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "Короткий висновок декомпозиції",
  "boqItems": [
    {
      "id": "boq-1",
      "code": "Код ДБН/кошторису",
      "description": "Опис робіт",
      "unit": "м²" | "м³" | "т" | "шт" | "компл",
      "quantity": number,
      "standardPriceUah": number,
      "marketPriceUah": number,
      "laborHours": number,
      "anomaly": "NORMAL" | "OVERPRICED" | "UNDERESTIMATED"
    }
  ],
  "violations": [
    {
      "id": "viol-1",
      "type": "DISCRIMINATORY_REQUIREMENT" | "UNREALISTIC_TIMELINE" | "PRICING_ANOMALY" | "COLLUSION_RISK" | "TECHNICAL_LOCKIN",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "title": "Назва ризику",
      "description": "Суть порушення",
      "legalBasis": "Стаття закону",
      "amcuPrecedent": "Практика АМКУ"
    }
  ]
}`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Prozorro Ingest Error:", error);
    return handleAiError(res, error, "Помилка імпорту тендеру");
  }
});


// Vite middleware for development vs static build in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TenderAI & FoulTender Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
