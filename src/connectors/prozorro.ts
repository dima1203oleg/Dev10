/**
 * Prozorro Public API Connector & Matching Engine
 * Connects directly to Prozorro open procurement REST API:
 * https://public.api.openprocurement.org/api/2.5/tenders
 */

import { executeAdvancedProzorroSearch, ScoredProzorroTender } from './prozorroSearchEngine';
import { evaluateCpvHierarchy } from './cpvMatcher';
import { matchUkrainianText } from './ukrainianStemmer';

export interface ProzorroTenderItem {
  id: string;
  tenderId: string;
  title: string;
  customer: string;
  customerEdrpou?: string;
  customerCity: string;
  budgetUah: number | null;
  currency: string;
  isVatIncluded: boolean;
  deadline: string | null;
  datePublished: string | null;
  region: string;
  status: string;
  category: string;
  summary: string;
  relevanceScore: number;
  riskLevel: 'NOT_ANALYZED' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  foulScore: number | null;
  retrievedAt: string;
  scoringBreakdown?: {
    titleScore: number;
    descriptionScore: number;
    cpvScore: number;
    exactPhraseBonus: number;
    matchedKeywordsList: string[];
    rawRelevance: number;
  };
}

export interface RejectionDetails {
  scanned: number;
  rejected_cpv: number;
  rejected_budget: number;
  rejected_region: number;
  rejected_keywords: number;
  rejected_negative: number;
}

export interface SearchTelemetry {
  searchId: string;
  durationMs: number;
  pagesFetched: number;
  recordsFetched: number;
  recordsReturned: number;
  sourceStatus: 'SUCCESS' | 'ERROR' | 'PARTIAL';
  nextOffset?: string;
  rejectionDetails: RejectionDetails;
}

export interface SearchOptions {
  maxPages?: number;
  limit?: number;
  offset?: string;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'deadline_asc' | 'deadline_desc';
  filters?: {
    region?: string;
    cpv?: string;
    minBudget?: number;
    maxBudget?: number;
    status?: string;
    customer?: string;
  };
}

const PROZORRO_BASE_URL = "https://public.api.openprocurement.org/api/2.5/tenders";

/**
 * Fetches full detail for a single tender from Prozorro by internal ID or tenderID
 */
export async function fetchProzorroTenderFullDetail(id: string): Promise<any> {
  let cleanId = id.trim();
  if (cleanId.includes('tenders/')) {
    const parts = cleanId.split('tenders/');
    cleanId = parts[parts.length - 1].split('?')[0];
  }

  // 1. Try direct fetch with provided ID
  try {
    const res = await fetch(`${PROZORRO_BASE_URL}/${cleanId}`);
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    // Continue to fallback lookup
  }

  // 2. If it's a UA-XXXX identifier or direct fetch failed, try resolving via opt_fields=tenderID
  try {
    const feedRes = await fetch(`${PROZORRO_BASE_URL}?descending=1&opt_fields=tenderID&limit=100`);
    if (feedRes.ok) {
      const feedJson = await feedRes.json();
      const match = feedJson.data?.find((d: any) => d.tenderID === cleanId || d.id === cleanId);
      if (match?.id) {
        const detailRes = await fetch(`${PROZORRO_BASE_URL}/${match.id}`);
        if (detailRes.ok) {
          const detailJson = await detailRes.json();
          return detailJson.data;
        }
      }
    }
  } catch (err) {
    console.error("Error resolving Prozorro tender ID:", err);
  }

  throw new Error(`Тендер '${id}' не знайдено у відкритій базі Prozorro.`);
}

/**
 * Calculates match score between a tender and a company profile (Radar Match)
 * STRICT DETERMINISTIC ENGINE WITH CPV HIERARCHY & MORPHOLOGICAL MATCHING
 */
export function calculatePersonalRadarMatch(tender: any, profile: any): {
  fitScore: number | null;
  status: 'AVAILABLE' | 'INSUFFICIENT_DATA';
  factors: {
    companyFit: number;
    legalFit: number;
    docReadiness: number;
    executionFeasibility: number;
    regionFit: number;
    budgetFit: number;
  };
  reasons: { title: string; description: string; type: 'POSITIVE' | 'NEUTRAL' | 'WARNING' }[];
  method: string;
  calculatedAt: string;
} {
  const calculatedAt = new Date().toISOString();

  if (!profile || !profile.vaultData || (typeof profile.vaultData === 'object' && Object.keys(profile.vaultData).length === 0)) {
    return {
      fitScore: null,
      status: 'INSUFFICIENT_DATA',
      factors: { companyFit: 0, legalFit: 0, docReadiness: 0, executionFeasibility: 0, regionFit: 0, budgetFit: 0 },
      reasons: [
        {
          title: "Профіль не налаштовано",
          description: "Профіль компанії або Vault не містить параметрів (CPV, регіон, бюджет). Заповніть дані компанії для персонального розрахунку відповідності.",
          type: "WARNING"
        }
      ],
      method: "PERSONAL_PROFILE_ABSENT",
      calculatedAt
    };
  }

  const vault = profile.vaultData;
  const reasons: { title: string; description: string; type: 'POSITIVE' | 'NEUTRAL' | 'WARNING' }[] = [];
  
  let cpvScore = 0;
  let budgetScore = 0;
  let regionScore = 0;
  let keywordScore = 0;
  let docScore = (vault.vaultDocuments && Array.isArray(vault.vaultDocuments) && vault.vaultDocuments.length > 0) ? 100 : 30;
  let executionScore = (vault.staff && Array.isArray(vault.staff) && vault.staff.length > 0) ? 100 : 40;

  // 1. CPV Code Match (35 max weight)
  const tenderCpv = (tender.items?.[0]?.classification?.id || tender.category || "").trim();
  const companyCpvs = Array.isArray(vault.cpvCodes) ? vault.cpvCodes : [];
  
  if (companyCpvs.length > 0 && tenderCpv) {
    let maxCpvEvalScore = 0;
    let bestMatchDesc = "";

    for (const c of companyCpvs) {
      const evalRes = evaluateCpvHierarchy(tenderCpv, c);
      if (evalRes.score > maxCpvEvalScore) {
        maxCpvEvalScore = evalRes.score;
        bestMatchDesc = evalRes.description || "";
      }
    }

    cpvScore = (maxCpvEvalScore / 100) * 35;

    if (maxCpvEvalScore >= 90) {
      reasons.push({
        title: `CPV-відповідність ${maxCpvEvalScore}%`,
        description: `Код закупівлі ${tenderCpv} напряму збігається з профілем компанії (${bestMatchDesc}).`,
        type: "POSITIVE"
      });
    } else if (maxCpvEvalScore >= 50) {
      reasons.push({
        title: `CPV-відповідність ${maxCpvEvalScore}% (суміжний клас)`,
        description: `Код закупівлі ${tenderCpv} належить до суміжної групи вашої спеціалізації.`,
        type: "NEUTRAL"
      });
    } else {
      reasons.push({
        title: "CPV розбіжність",
        description: `Код ${tenderCpv} відсутній у списку профільних кодів компанії (${companyCpvs.join(', ')}).`,
        type: "WARNING"
      });
    }
  } else if (companyCpvs.length === 0) {
    reasons.push({
      title: "CPV не вказано у профілі",
      description: "Додайте коди ДК 021:2015 до профілю компанії для точнішого зіставлення.",
      type: "NEUTRAL"
    });
  }

  // 2. Budget Range (25 max weight)
  const budget = typeof tender.budgetUah === 'number' ? tender.budgetUah : (parseFloat(tender.budgetUah) || 0);
  const minBudget = Number(vault.minTenderBudget) || 0;
  const maxBudget = Number(vault.maxTenderBudget) || Infinity;

  if (budget > 0) {
    if (budget >= minBudget && budget <= maxBudget) {
      budgetScore = 25;
      reasons.push({
        title: "Бюджетний оптимум",
        description: `Сума закупівлі (${budget.toLocaleString('uk-UA')} грн) знаходиться у цільовому діапазоні компанії (${minBudget.toLocaleString('uk-UA')} - ${maxBudget === Infinity ? 'без ліміту' : maxBudget.toLocaleString('uk-UA')} грн).`,
        type: "POSITIVE"
      });
    } else if (budget < minBudget) {
      budgetScore = 10;
      reasons.push({
        title: "Бюджет нижче цільового",
        description: `Сума закупівлі нижче вашого мінімального порогу (${minBudget.toLocaleString('uk-UA')} грн).`,
        type: "NEUTRAL"
      });
    } else {
      budgetScore = 0;
      reasons.push({
        title: "Бюджет перевищує ліміт",
        description: `Сума (${budget.toLocaleString('uk-UA')} грн) перевищує максимальний поріг можливостей компанії (${maxBudget.toLocaleString('uk-UA')} грн).`,
        type: "WARNING"
      });
    }
  }

  // 3. Region Match (20 max weight)
  const tenderRegion = (tender.region || tender.customerCity || "").toLowerCase();
  const preferredRegion = (vault.preferredRegion || "").toLowerCase();
  const regionsOfWork = Array.isArray(vault.regionsOfWork) ? vault.regionsOfWork.map((r: string) => r.toLowerCase()) : [];

  if (preferredRegion || regionsOfWork.length > 0) {
    const isPreferred = preferredRegion && tenderRegion.includes(preferredRegion);
    const isInRegions = regionsOfWork.some((r: string) => tenderRegion.includes(r));

    if (isPreferred || isInRegions) {
      regionScore = 20;
      reasons.push({
        title: "Цільовий регіон",
        description: `Закупівля оголошена в пріоритетному регіоні виконання (${tender.region || tender.customerCity || 'Україна'}).`,
        type: "POSITIVE"
      });
    } else {
      regionScore = 5;
      reasons.push({
        title: "Інший регіон",
        description: `Регіон закупівлі (${tender.region || 'Не вказано'}) не входить до списку пріоритетних регіонів компанії.`,
        type: "NEUTRAL"
      });
    }
  } else {
    regionScore = 15;
  }

  // 4. Keyword & Stem Match (20 max weight)
  const tenderText = `${tender.title || ""} ${tender.summary || ""}`.toLowerCase();
  const keywords = Array.isArray(vault.preferredKeywords) ? vault.preferredKeywords : [];
  
  if (keywords.length > 0) {
    const matched = keywords.filter((k: string) => matchUkrainianText(tenderText, k).matched);
    if (matched.length > 0) {
      keywordScore = Math.min(20, matched.length * 10);
      reasons.push({
        title: `Збіг ключових маркерів (${matched.length})`,
        description: `Знайдено ключові слова вашої спеціалізації: ${matched.join(", ")}.`,
        type: "POSITIVE"
      });
    }
  } else {
    keywordScore = 10;
  }

  const finalFitScore = Math.min(100, Math.round(cpvScore + budgetScore + regionScore + keywordScore));

  return {
    fitScore: finalFitScore,
    status: 'AVAILABLE',
    factors: {
      companyFit: finalFitScore,
      legalFit: 85,
      docReadiness: docScore,
      executionFeasibility: executionScore,
      regionFit: regionScore > 0 ? 100 : 0,
      budgetFit: budgetScore > 0 ? (budgetScore / 25) * 100 : 0
    },
    reasons,
    method: "DETERMINISTIC_MULTIFACTOR_PROZORRO_V3_STEMMED",
    calculatedAt
  };
}

/**
 * PRODUCTION READY: Multi-page search for real Prozorro tenders using Advanced Search Engine
 */
export async function searchProzorroTenders(
  query: any = {},
  options: SearchOptions = {}
): Promise<{ tenders: ProzorroTenderItem[]; telemetry: SearchTelemetry }> {
  return executeAdvancedProzorroSearch(query, options);
}
