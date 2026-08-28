/**
 * Prozorro Public API Connector & Matching Engine
 * Connects directly to Prozorro open procurement REST API:
 * https://public.api.openprocurement.org/api/2.5/tenders
 */

import crypto from 'crypto';

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
 * Fetches full detail for a single tender from Prozorro
 */
export async function fetchProzorroTenderFullDetail(id: string): Promise<any> {
  const res = await fetch(`${PROZORRO_BASE_URL}/${id}`);
  if (!res.ok) throw new Error(`Prozorro API error: ${res.status}`);
  const json = await res.json();
  return json.data;
}

/**
 * Calculates match score between a tender and a company profile (Radar Match)
 * Deterministic matching engine (No Mock)
 */
export function calculatePersonalRadarMatch(tender: any, profile: any): any {
  if (!profile || !profile.vaultData) {
    return {
      fitScore: 0,
      factors: { companyFit: 0, legalFit: 0, docReadiness: 0, executionFeasibility: 0 },
      reasons: [{ description: "Профіль компанії не налаштовано. Налаштуйте Vault для активації Радару." }]
    };
  }

  const vault = profile.vaultData;
  const reasons: { description: string }[] = [];
  let score = 0;
  
  // 1. CPV Code Match (Strongest Signal)
  const tenderCpv = tender.items?.[0]?.classification?.id || tender.category || "";
  const companyCpvs = vault.cpvCodes || [];
  const cpvMatch = companyCpvs.some((c: string) => tenderCpv.startsWith(c.substring(0, 3)));
  
  if (cpvMatch) {
    score += 40;
    reasons.push({ description: "CPV код тендера відповідає спеціалізації вашої компанії." });
  }

  // 2. Budget Range
  const budget = tender.budgetUah || 0;
  const minBudget = vault.minTenderBudget || 0;
  const maxBudget = vault.maxTenderBudget || Infinity;
  
  if (budget >= minBudget && budget <= maxBudget) {
    score += 20;
    reasons.push({ description: "Очікувана вартість закупівлі в межах вашого цільового діапазону." });
  } else if (budget > maxBudget) {
    reasons.push({ description: "Бюджет значно перевищує ваші типові ліміти (Можливий ризик)." });
  }

  // 3. Region Match
  const tenderRegion = (tender.region || "").toLowerCase();
  const companyRegion = (vault.preferredRegion || "").toLowerCase();
  if (companyRegion && tenderRegion.includes(companyRegion)) {
    score += 20;
    reasons.push({ description: "Тендер проводиться у вашому пріоритетному регіоні." });
  }

  // 4. Keyword Match
  const title = (tender.title || "").toLowerCase();
  const keywords = vault.preferredKeywords || [];
  const matchedKeywords = keywords.filter((k: string) => title.includes(k.toLowerCase()));
  if (matchedKeywords.length > 0) {
    score += 20;
    reasons.push({ description: `Знайдено збіг за ключовими словами: ${matchedKeywords.join(", ")}.` });
  }

  // Ensure baseline score for relevant items
  if (score === 0 && (cpvMatch || matchedKeywords.length > 0)) score = 15;

  return {
    fitScore: Math.min(score, 100),
    factors: {
      companyFit: score,
      legalFit: 85, // Placeholder for future legal engine integration
      docReadiness: vault.vaultDocuments?.length > 0 ? 90 : 40,
      executionFeasibility: vault.staff?.length > 5 ? 95 : 60
    },
    reasons: reasons.length > 0 ? reasons : [{ description: "Низька відповідність за основними параметрами профілю." }]
  };
}

/**
 * PRODUCTION READY: Multi-page search for Prozorro tenders
 */
export async function searchProzorroTenders(
  query: any,
  options: SearchOptions = {}
): Promise<{ tenders: ProzorroTenderItem[]; telemetry: SearchTelemetry }> {
  const startTime = Date.now();
  const tenders: ProzorroTenderItem[] = [];
  const maxPages = options.maxPages || 3; 
  const targetLimit = options.limit || 25;
  const timeoutMs = 30000; 
  
  let pagesFetched = 0;
  let recordsFetched = 0;
  let currentOffset = options.offset || ""; 
  
  const rejectionTelemetry: RejectionDetails = {
    scanned: 0,
    rejected_cpv: 0,
    rejected_budget: 0,
    rejected_region: 0,
    rejected_keywords: 0,
    rejected_negative: 0
  };

  const searchId = crypto.randomUUID();
  let sourceStatus: 'SUCCESS' | 'ERROR' | 'PARTIAL' = 'SUCCESS';

  try {
    let nextPageUri = `${PROZORRO_BASE_URL}?descending=1&limit=50&opt_fields=title,description,value,procuringEntity,tenderID,status,tenderPeriod,items,mainProcurementCategory,datePublished,dateModified`;
    if (currentOffset) {
      nextPageUri += `&offset=${currentOffset}`;
    }

    const controller = new AbortController();
    const globalTimeout = setTimeout(() => controller.abort(), timeoutMs);

    while (pagesFetched < maxPages && tenders.length < targetLimit * 2) { 
      try {
        const response = await fetch(nextPageUri, { signal: controller.signal });
        if (!response.ok) {
          sourceStatus = pagesFetched === 0 ? 'ERROR' : 'PARTIAL';
          break;
        }

        const json = await response.json();
        pagesFetched++;
        
        if (!json.data || !Array.isArray(json.data) || json.data.length === 0) break;
        
        recordsFetched += json.data.length;
        rejectionTelemetry.scanned += json.data.length;
        nextPageUri = json.next_page?.uri || "";
        currentOffset = json.next_page?.offset || "";

        for (const data of json.data) {
          const title = (data.title || "").toLowerCase();
          const description = (data.description || "").toLowerCase();
          const cpv = data.items?.[0]?.classification?.id || "";
          const budget = data.value?.amount !== undefined ? data.value.amount : null;
          const currency = data.value?.currency || "UAH";
          const isVatIncluded = data.value?.valueAddedTaxIncluded ?? true;
          const regionName = (data.procuringEntity?.address?.region || "").toLowerCase();
          const localityName = (data.procuringEntity?.address?.locality || "").toLowerCase();
          
          // Apply Filters
          if (options.filters?.cpv && cpv && !cpv.startsWith(options.filters.cpv.substring(0, 2))) {
            rejectionTelemetry.rejected_cpv++;
            continue;
          }
          if (options.filters?.minBudget && (budget === null || budget < options.filters.minBudget)) {
            rejectionTelemetry.rejected_budget++;
            continue;
          }
          if (options.filters?.maxBudget && (budget === null || budget > options.filters.maxBudget)) {
            rejectionTelemetry.rejected_budget++;
            continue;
          }
          if (options.filters?.region && !regionName.includes(options.filters.region.toLowerCase()) && !localityName.includes(options.filters.region.toLowerCase())) {
            rejectionTelemetry.rejected_region++;
            continue;
          }

          const qKeywords = (query.keywords || []).map((k: string) => k.toLowerCase());
          const matchedKeywords = qKeywords.filter((k: string) => title.includes(k) || description.includes(k));
          if (matchedKeywords.length === 0 && qKeywords.length > 0) {
            rejectionTelemetry.rejected_keywords++;
            continue;
          }

          tenders.push({
            id: data.id,
            tenderId: data.tenderID,
            title: data.title,
            customer: data.procuringEntity?.name || "НЕВІДОМО",
            customerEdrpou: data.procuringEntity?.identifier?.id || "НЕВІДОМО",
            customerCity: localityName || "НЕВІДОМО",
            budgetUah: budget,
            currency,
            isVatIncluded,
            deadline: data.tenderPeriod?.endDate || null,
            datePublished: data.datePublished || data.dateModified || null,
            region: regionName || "НЕВІДОМО",
            status: data.status,
            category: data.mainProcurementCategory || "works",
            summary: data.description || "",
            relevanceScore: matchedKeywords.length,
            riskLevel: 'NOT_ANALYZED',
            foulScore: null,
            retrievedAt: new Date().toISOString()
          });
        }
      } catch (e: any) {
        if (e.name === 'AbortError') {
          sourceStatus = 'PARTIAL';
          break;
        }
        throw e;
      }
    }
    clearTimeout(globalTimeout);

    // Apply Sorting
    if (options.sort) {
      tenders.sort((a, b) => {
        switch (options.sort) {
          case 'price_asc': return (a.budgetUah || 0) - (b.budgetUah || 0);
          case 'price_desc': return (b.budgetUah || 0) - (a.budgetUah || 0);
          case 'date_desc': return (b.datePublished ? new Date(b.datePublished).getTime() : 0) - (a.datePublished ? new Date(a.datePublished).getTime() : 0);
          case 'date_asc': return (a.datePublished ? new Date(a.datePublished).getTime() : 0) - (b.datePublished ? new Date(b.datePublished).getTime() : 0);
          case 'deadline_asc': return (a.deadline ? new Date(a.deadline).getTime() : 0) - (b.deadline ? new Date(b.deadline).getTime() : 0);
          case 'relevance': return b.relevanceScore - a.relevanceScore;
          default: return 0;
        }
      });
    }

    return {
      tenders: tenders.slice(0, targetLimit),
      telemetry: {
        searchId,
        durationMs: Date.now() - startTime,
        pagesFetched,
        recordsFetched,
        recordsReturned: Math.min(tenders.length, targetLimit),
        sourceStatus,
        nextOffset: currentOffset,
        rejectionDetails: rejectionTelemetry
      }
    };
  } catch (error) {
    console.error("Prozorro Connector Error:", error);
    return {
      tenders: [],
      telemetry: {
        searchId,
        durationMs: Date.now() - startTime,
        pagesFetched,
        recordsFetched,
        recordsReturned: 0,
        sourceStatus: 'ERROR',
        rejectionDetails: rejectionTelemetry
      }
    };
  }
}
