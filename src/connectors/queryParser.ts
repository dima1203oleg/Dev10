import { GoogleGenAI } from "@google/genai";

export interface StructuredTenderQuery {
  intent: 'TENDER_SEARCH' | 'COMPANY_ANALYSIS' | 'MARKET_OVERVIEW' | 'OTHER';
  keywords: string[];
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
    
    RULES:
    1. EXTRACT intent: 'TENDER_SEARCH' (looking for active tenders), 'COMPANY_ANALYSIS' (researching a specific company), etc.
    2. KEYWORDS: Extract 3-5 high-impact keywords.
    3. SEARCH VARIANTS: Generate a list of 5-8 synonyms or related procurement terms in Ukrainian to expand the search recall (e.g., if searching for "school", add "gymnasium", "lyceum", "education").
    4. LOCATION: Extract city or region if mentioned.
    5. BUDGET: Extract min/max budget if specified in UAH (detect "млн", "тис").
    6. CPV: DO NOT invent CPV codes.
    
    OUTPUT SCHEMA:
    {
      "intent": "TENDER_SEARCH" | "COMPANY_ANALYSIS" | "MARKET_OVERVIEW" | "OTHER",
      "keywords": string[],
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
        console.warn(`[Gemini QueryParser] Call to '${modelName}' (attempt ${attempt + 1}) failed (${errMsg})`);
        
        const isTransient =
          err?.status === 503 ||
          err?.code === 503 ||
          errMsg.includes("503") ||
          errMsg.includes("high demand") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("overloaded") ||
          err?.status === 429 ||
          err?.code === 429;

        if (isTransient && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
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
