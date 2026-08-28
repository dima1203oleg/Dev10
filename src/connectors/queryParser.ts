import { GoogleGenerativeAI } from "@google/generative-ai";

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

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
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

  try {
    const result = await model.generateContent([
      systemInstruction,
      `User Prompt: "${prompt}"`
    ]);
    const responseText = result.response.text();
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
