import { GoogleGenAI } from "@google/genai";

export interface StructuredTenderQuery {
  intent: 'TENDER_SEARCH' | 'COMPANY_ANALYSIS' | 'MARKET_OVERVIEW' | 'OTHER';
  keywords: string[];
  negativeKeywords: string[];
  searchVariants?: string[];
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

const REGION_MAP: Record<string, string> = {
  "київ": "м. Київ",
  "київська": "Київська область",
  "львів": "Львівська область",
  "львівська": "Львівська область",
  "харків": "Харківська область",
  "харківська": "Харківська область",
  "дніпро": "Дніпропетровська область",
  "дніпропетровська": "Дніпропетровська область",
  "одеса": "Одеська область",
  "одеська": "Одеська область",
  "запоріжжя": "Запорізька область",
  "запорізька": "Запорізька область",
  "вінниця": "Вінницька область",
  "вінницька": "Вінницька область",
  "полтава": "Полтавська область",
  "полтавська": "Полтавська область",
  "черкаси": "Черкаська область",
  "черкаська": "Черкаська область",
  "чернігів": "Чернігівська область",
  "чернігівська": "Чернігівська область",
  "суми": "Сумська область",
  "сумська": "Сумська область",
  "житомир": "Житомирська область",
  "житомирська": "Житомирська область",
  "хмельницький": "Хмельницька область",
  "хмельницька": "Хмельницька область",
  "рівне": "Рівненська область",
  "рівненська": "Рівненська область",
  "івано-франківськ": "Івано-Франківська область",
  "івано-франківська": "Івано-Франківська область",
  "тернопіль": "Тернопільська область",
  "тернопільська": "Тернопільська область",
  "волинь": "Волинська область",
  "луцьк": "Волинська область",
  "волинська": "Волинська область",
  "закарпаття": "Закарпатська область",
  "ужгород": "Закарпатська область",
  "закарпатська": "Закарпатська область",
  "миколаїв": "Миколаївська область",
  "миколаївська": "Миколаївська область",
  "херсон": "Херсонська область",
  "херсонська": "Херсонська область",
  "кропивницький": "Кіровоградська область",
  "кіровоградська": "Кіровоградська область",
  "чернівці": "Чернівецька область",
  "чернівецька": "Чернівецька область"
};

const CPV_KEYWORD_MAP: Array<{ cpv: string; terms: string[] }> = [
  { cpv: "45", terms: ["будівництв", "ремонт", "реконструкці", "покрівл", "утепленн", "асфальт", "дорог", "бруківк", "монтаж", "демонтаж", "споруд", "укритт", "вікн", "двер", "фасад", "сховищ", "бомбосховищ"] },
  { cpv: "35", terms: ["дрон", "бпла", "квадрокоптер", "fpv", "мавік", "mavic", "реб", "радіоелектронн", "глушилк", "бронежилет", "шолом", "каск", "військов", "захисн", "охорон"] },
  { cpv: "31", terms: ["генератор", "дизель-генератор", "інвертор", "акумулятор", "дбж", "ups", "електростанці", "кабель", "провід", "трансформатор", "освітленн", "світильник", "led"] },
  { cpv: "30", terms: ["комп'ютер", "ноутбук", "сервер", "принтер", "сканер", "картридж", "оргтехнік", "монітор", "пк", "планшет", "бфп"] },
  { cpv: "48", terms: ["програмн", "софт", "пз", "ліцензі", "microsoft", "антивірус", "операційн систем"] },
  { cpv: "72", terms: ["it", "розробк", "технічн підтримк", "хостинг", "веб", "сайт", "тестуванн", "кібербезпек"] },
  { cpv: "33", terms: ["медичн", "лік", "фармацевт", "препарат", "шприц", "бинт", "вакцин", "рентген", "узд", "томограф", "рукавичк", "дезінфекці", "медвироб"] },
  { cpv: "09", terms: ["бензин", "дизель", "палив", "газ", "нафтопродукт", "дров", "вугілл", "електроенергі", "електричн енергі", "пелет", "мастил"] },
  { cpv: "15", terms: ["продукт", "харчуванн", "хліб", "м'яс", "молок", "овоч", "фрукт", "риб", "цукор", "масл", "борошн", "круп", "кейтеринг"] },
  { cpv: "60", terms: ["перевезенн", "транспорт", "доставк", "логістик", "автобус", "вантаж", "пасажирськ"] },
  { cpv: "71", terms: ["проектуванн", "проєктн", "пкд", "авторськ нагляд", "технічн нагляд", "геодезі", "інженерн послуг", "експертиз проект", "вишукуванн"] },
  { cpv: "90", terms: ["смітт", "відход", "прибиранн", "клінінг", "дезінфекці", "благоустрі", "озелененн", "вивіз"] },
  { cpv: "34", terms: ["автомобіл", "транспортн засоб", "спецтехнік", "екскаватор", "трактор", "запчастин", "самоскид", "тягач", "навантажувач"] },
  { cpv: "39", terms: ["мебл", "стіл", "стільц", "шаф", "посуд", "покритт для підлог", "парти", "ліжк"] }
];

const STOPWORDS = new Set([
  "для", "та", "і", "в", "у", "на", "по", "про", "за", "від", "до", "грн", "uah", "млн", "тис", "з", "із", "зі", "як", "що", "це", "або", "чи", "під", "над", "біля", "тендер", "закупівля", "пошук", "знайти"
]);

/**
 * Intelligent deterministic heuristic parser for Ukrainian procurement queries.
 * Operates offline or as a zero-latency fallback when AI rate limits are reached.
 */
export function heuristicParseQuery(prompt: string): StructuredTenderQuery {
  const lower = prompt.toLowerCase();
  const tokens = lower.split(/[\s,.;:!?()"\-]+/).filter((w) => w.length > 1);

  // Extract location
  let detectedCity: string | null = null;
  let detectedRegion: string | null = null;
  for (const [key, regionName] of Object.entries(REGION_MAP)) {
    if (lower.includes(key)) {
      if (key === "київ") {
        detectedCity = "Київ";
        detectedRegion = "м. Київ";
      } else {
        detectedRegion = regionName;
      }
      break;
    }
  }

  // Extract Budget
  let minBudget: number | null = null;
  let maxBudget: number | null = null;

  // Pattern: "до 5 млн", "< 5 млн", "5 млн грн"
  const mlnMatch = lower.match(/(?:до|менше|<|\s|^)(\d+(?:[.,]\d+)?)\s*(?:млн|мільйон)/i);
  if (mlnMatch) {
    maxBudget = parseFloat(mlnMatch[1].replace(",", ".")) * 1_000_000;
  }

  const tysMatch = lower.match(/(?:до|менше|<|\s|^)(\d+(?:[.,]\d+)?)\s*(?:тис|тисяч)/i);
  if (tysMatch && !maxBudget) {
    maxBudget = parseFloat(tysMatch[1].replace(",", ".")) * 1_000;
  }

  // Pattern: "від 1 млн"
  const fromMlnMatch = lower.match(/(?:від|більше|>)\s*(\d+(?:[.,]\d+)?)\s*(?:млн|мільйон)/i);
  if (fromMlnMatch) {
    minBudget = parseFloat(fromMlnMatch[1].replace(",", ".")) * 1_000_000;
  }

  // Extract CPV Family Candidates
  const cpvCandidates: string[] = [];
  for (const entry of CPV_KEYWORD_MAP) {
    if (entry.terms.some((term) => lower.includes(term))) {
      if (!cpvCandidates.includes(entry.cpv)) {
        cpvCandidates.push(entry.cpv);
      }
    }
  }

  // Meaningful keywords (filtering out stopwords & budget numbers)
  const keywords = tokens.filter((word) => {
    if (STOPWORDS.has(word)) return false;
    if (/^\d+$/.test(word)) return false;
    if (detectedRegion && word.length <= 3) return false;
    return word.length >= 3;
  });

  return {
    intent: 'TENDER_SEARCH',
    keywords: keywords.length > 0 ? Array.from(new Set(keywords)) : [prompt.trim()],
    negativeKeywords: [],
    searchVariants: keywords,
    location: {
      city: detectedCity,
      region: detectedRegion
    },
    cpvCandidates,
    minBudget,
    maxBudget,
    procedureTypes: [],
    status: 'active',
    dateRange: null,
    rawPrompt: prompt
  };
}

/**
 * AI Natural Language Query Parser
 * Uses Gemini with multi-model cascade (lite first for quota efficiency) and automatic heuristic fallback.
 */
export async function parseTenderQuery(prompt: string, apiKey?: string): Promise<StructuredTenderQuery> {
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return {
      intent: 'TENDER_SEARCH',
      keywords: [],
      negativeKeywords: [],
      location: { city: null, region: null },
      cpvCandidates: [],
      minBudget: null,
      maxBudget: null,
      procedureTypes: [],
      status: 'active',
      dateRange: null,
      rawPrompt: ""
    };
  }

  // If no API key is provided, seamlessly use the intelligent heuristic parser
  if (!apiKey) {
    return heuristicParseQuery(prompt);
  }

  let ai: GoogleGenAI;
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch {
    return heuristicParseQuery(prompt);
  }

  const systemInstruction = `
    You are a specialized Procurement Query Parser for the Ukrainian Prozorro market.
    Your task is to transform a natural language user prompt into a structured JSON search object.
    
    CRITICAL: YOU MUST DISTINGUISH BETWEEN THE SUBJECT AND THE CONTEXT.
    If the user asks for "shelter for schools", the subject is "SHELTER/CONSTRUCTION", and "SCHOOL" is the context/location.
    Do NOT return tenders for "school food" or "school cleaning" for a "shelter for schools" query.
    
    RULES:
    1. EXTRACT intent: 'TENDER_SEARCH' (looking for active tenders), 'COMPANY_ANALYSIS' (researching a specific company), etc.
    2. KEYWORDS: Extract 3-5 high-impact POSITIVE keywords related to the actual subject of procurement in Ukrainian.
    3. NEGATIVE KEYWORDS: Extract terms that should NOT be in the results.
    4. SEARCH VARIANTS: Generate 3-5 synonyms or related procurement terms in Ukrainian.
    5. LOCATION: Extract city or region if mentioned.
    6. BUDGET: Extract min/max budget if specified in UAH (detect "млн", "тис").
    7. CPV: Identify the most likely CPV family 2-digit code (e.g. 45 for construction, 33 for medical, 09 for fuel, 30 for IT).
    
    OUTPUT JSON FORMAT ONLY:
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

  // Start with lightweight high-throughput model to preserve quota, then fallbacks
  const modelsToTry = [
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.7-flash"
  ];

  let responseText = "";

  for (const modelName of modelsToTry) {
    try {
      const result = await ai.models.generateContent({
        model: modelName,
        contents: [
          systemInstruction,
          `User Prompt: "${prompt}"`
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });
      responseText = result.text || "";
      if (responseText.trim()) {
        break;
      }
    } catch {
      // If 429 quota or 503 unavailable, silently continue to next model in cascade
      continue;
    }
  }

  try {
    if (!responseText) {
      return heuristicParseQuery(prompt);
    }
    const parsed = JSON.parse(responseText);

    const allKeywords = Array.from(new Set([
      ...(parsed.keywords || []),
      ...(parsed.searchVariants || [])
    ])).filter(k => typeof k === 'string' && k.length > 1);

    const heuristicFallback = heuristicParseQuery(prompt);

    return {
      intent: parsed.intent || 'TENDER_SEARCH',
      keywords: allKeywords.length > 0 ? allKeywords : heuristicFallback.keywords,
      negativeKeywords: Array.isArray(parsed.negativeKeywords) ? parsed.negativeKeywords : [],
      searchVariants: Array.isArray(parsed.searchVariants) ? parsed.searchVariants : [],
      location: {
        city: parsed.location?.city || heuristicFallback.location.city,
        region: parsed.location?.region || heuristicFallback.location.region
      },
      cpvCandidates: (Array.isArray(parsed.cpvCandidates) && parsed.cpvCandidates.length > 0)
        ? parsed.cpvCandidates
        : heuristicFallback.cpvCandidates,
      minBudget: parsed.minBudget ?? heuristicFallback.minBudget,
      maxBudget: parsed.maxBudget ?? heuristicFallback.maxBudget,
      procedureTypes: Array.isArray(parsed.procedureTypes) ? parsed.procedureTypes : [],
      status: parsed.status || 'active',
      dateRange: parsed.dateRange || null,
      rawPrompt: prompt
    };
  } catch {
    return heuristicParseQuery(prompt);
  }
}

