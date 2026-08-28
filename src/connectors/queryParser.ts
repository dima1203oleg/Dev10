import { GoogleGenAI } from "@google/genai";

export interface StructuredTenderQuery {
  intent: 'TENDER_SEARCH' | 'COMPANY_ANALYSIS' | 'MARKET_OVERVIEW' | 'OTHER';
  keywords: string[];
  negativeKeywords: string[];
  location: {
    city: string | null;
    region: string | null;
  };
  cpvCandidates: string[];
  minBudget: number | null;
  maxBudget: number | null;
  procedureTypes: string[];
  status: 'active' | 'complete' | 'all';
  dateRange: {
    start: string | null;
    end: string | null;
  } | null;
  rawPrompt: string;
}

/**
 * AI Natural Language Query Parser
 * Uses Gemini to extract structured search parameters from user input.
 */
export async function parseTenderQuery(prompt: string, apiKey: string): Promise<StructuredTenderQuery> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required for Query Parsing");
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const systemInstruction = `
    You are a specialized Procurement Query Parser for the Ukrainian Prozorro market.
    Your task is to transform a natural language user prompt into a structured JSON search object.
    
    CRITICAL: YOU MUST DISTINGUISH BETWEEN THE SUBJECT AND THE CONTEXT.
    If the user asks for "shelter for schools", the subject is "SHELTER/CONSTRUCTION", and "SCHOOL" is the context/location.
    Do NOT return tenders for "school food" or "school cleaning" for a "shelter for schools" query.
    
    RULES:
    1. EXTRACT intent: 'TENDER_SEARCH' (looking for active tenders), 'COMPANY_ANALYSIS' (researching a specific company), etc.
    2. KEYWORDS: Extract 3-5 high-impact POSITIVE keywords related to the actual subject of procurement.
    3. NEGATIVE KEYWORDS: Extract or generate a list of terms that should NOT be in the results (e.g. for construction, exclude food, cleaning, security if not requested).
    4. SEARCH VARIANTS: Generate a list of 5-8 synonyms or related procurement terms in Ukrainian to expand the search recall.
    5. LOCATION: Extract city or region if mentioned.
    6. BUDGET: Extract min/max budget if specified in UAH (detect "млн", "тис").
    7. CPV: Identify the most likely CPV family (first 2 digits) based on the subject (e.g., 45 for construction).
    
    OUTPUT SCHEMA:
    {
      "intent": "TENDER_SEARCH" | "COMPANY_ANALYSIS" | "MARKET_OVERVIEW" | "OTHER",
      "keywords": string[],
      "negativeKeywords": string[],
      "searchVariants": string[],
      "location": { "city": string | null, "region": string | null },
      "cpvCandidates": string[],
      "minBudget": number | null,
      "maxBudget": number | null,
      "procedureTypes": string[],
      "status": "active" | "complete" | "all",
      "dateRange": { "start": string | null, "end": string | null } | null
    }
  `;

  const modelsToTry = [
    "gemini-3.7-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
  ];

  let lastError: any = null;
  let responseText = "";

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await ai.models.generateContent({
          model: modelName,
          contents: [
            systemInstruction,
            `User Prompt: "${prompt}"`
          ],
          config: {
            responseMimeType: "application/json"
          }
        });
        responseText = result.text || "";
        break;
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || err || "");
        
        const isQuotaExceeded =
          err?.status === 429 ||
          err?.code === 429 ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("Quota exceeded") ||
          errMsg.includes("quota");

        const isTransient503 =
          err?.status === 503 ||
          err?.code === 503 ||
          errMsg.includes("503") ||
          errMsg.includes("high demand") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("overloaded");

        console.warn(`[Gemini QueryParser] Модель '${modelName}' (спроба ${attempt + 1}) не відповіла (${errMsg.slice(0, 100)}...). Перехід до наступної моделі.`);
        
        if (isQuotaExceeded) {
          break; // Immediately switch model on quota exhaustion
        }

        if (isTransient503 && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        } else {
          break;
        }
      }
    }
    if (responseText) {
      break;
    }
  }

  try {
    if (!responseText && lastError) {
      throw lastError;
    }
    const parsed = JSON.parse(responseText);

    // Merge keywords and variants for the search engine
    const allKeywords = Array.from(new Set([
      ...(parsed.keywords || []),
      ...(parsed.searchVariants || [])
    ]));

    return {
      ...parsed,
      keywords: allKeywords,
      rawPrompt: prompt
    };
  } catch (error) {
    console.error("AI Query Parsing Error:", error);
    // Fallback to basic keyword extraction if AI fails
    return {
      intent: 'TENDER_SEARCH',
      keywords: prompt.split(' ').filter(w => w.length > 3),
      negativeKeywords: [],
      location: { city: null, region: null },
      cpvCandidates: [],
      minBudget: null,
      maxBudget: null,
      procedureTypes: [],
      status: 'active',
      dateRange: null,
      rawPrompt: prompt
    };
  }
}
