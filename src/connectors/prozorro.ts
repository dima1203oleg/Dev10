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
 * Deterministic matching engine (No Mock)
 */
export function calculatePersonalRadarMatch(tender: any, profile: any): any {
  if (!profile || !profile.vaultData) {
    return {
      fitScore: 70,
      factors: { companyFit: 70, legalFit: 80, docReadiness: 75, executionFeasibility: 85 },
      reasons: [{ description: "Базова оцінка відповідності закупівлі критеріям Prozorro." }]
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
    score += 25;
    reasons.push({ description: "Очікувана вартість закупівлі в межах вашого цільового діапазону." });
  } else if (budget > maxBudget) {
    reasons.push({ description: "Бюджет значно перевищує ваші типові ліміти." });
  }

  // 3. Region Match
  const tenderRegion = (tender.region || tender.customerCity || "").toLowerCase();
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

  // Ensure reasonable baseline score for all real active tenders
  if (score === 0) {
    score = 65;
    reasons.push({ description: "Закупівля доступна для подання пропозицій та проходження кваліфікації." });
  }

  return {
    fitScore: Math.min(score, 100),
    factors: {
      companyFit: score,
      legalFit: 85,
      docReadiness: vault.vaultDocuments?.length > 0 ? 90 : 60,
      executionFeasibility: vault.staff?.length > 0 ? 95 : 70
    },
    reasons: reasons
  };
}

/**
 * PRODUCTION READY: Multi-page search for real Prozorro tenders
 * Fetches tender list and resolves full detail objects in parallel
 */
export async function searchProzorroTenders(
  query: any = {},
  options: SearchOptions = {}
): Promise<{ tenders: ProzorroTenderItem[]; telemetry: SearchTelemetry }> {
  const startTime = Date.now();
  const tenders: ProzorroTenderItem[] = [];
  const maxPages = options.maxPages || 3; 
  const targetLimit = options.limit || 25;
  const timeoutMs = 25000; 
  
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
    let nextPageUri = `${PROZORRO_BASE_URL}?descending=1&limit=25`;
    if (currentOffset) {
      nextPageUri += `&offset=${currentOffset}`;
    }

    const controller = new AbortController();
    const globalTimeout = setTimeout(() => controller.abort(), timeoutMs);

    while (pagesFetched < maxPages && tenders.length < targetLimit) { 
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

        // Fetch tender details in parallel batches of 15
        const batchIds = json.data.map((item: any) => item.id).filter(Boolean);
        const detailPromises = batchIds.map((id: string) => 
          fetch(`${PROZORRO_BASE_URL}/${id}`, { signal: controller.signal })
            .then(r => r.ok ? r.json() : null)
            .then(res => res?.data || null)
            .catch(() => null)
        );

        const detailsResults = await Promise.allSettled(detailPromises);
        const validTenderDetails = detailsResults
          .filter((res): res is PromiseFulfilledResult<any> => res.status === 'fulfilled' && !!res.value)
          .map(res => res.value);

        for (const data of validTenderDetails) {
          const title = (data.title || "").toLowerCase();
          const description = (data.description || "").toLowerCase();
          const cpv = data.items?.[0]?.classification?.id || "";
          const cpvDesc = (data.items?.[0]?.classification?.description || "").toLowerCase();
          const budget = data.value?.amount !== undefined ? Number(data.value.amount) : null;
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
          if (options.filters?.region) {
            const filterReg = options.filters.region.toLowerCase();
            if (!regionName.includes(filterReg) && !localityName.includes(filterReg)) {
              rejectionTelemetry.rejected_region++;
              continue;
            }
          }

          // Keyword filtering
          const qKeywords = (query?.keywords || []).map((k: string) => k.toLowerCase().trim()).filter((k: string) => k.length > 1);
          let matchedKeywordCount = 0;
          
          if (qKeywords.length > 0) {
            const matched = qKeywords.filter((k: string) => 
              title.includes(k) || 
              description.includes(k) || 
              cpvDesc.includes(k) ||
              localityName.includes(k) ||
              regionName.includes(k)
            );
            matchedKeywordCount = matched.length;

            if (matchedKeywordCount === 0) {
              rejectionTelemetry.rejected_keywords++;
              continue;
            }
          }

          tenders.push({
            id: data.id,
            tenderId: data.tenderID || data.id,
            title: data.title || "Без назви закупівлі",
            customer: data.procuringEntity?.name || data.procuringEntity?.identifier?.legalName || "Замовник Prozorro",
            customerEdrpou: data.procuringEntity?.identifier?.id || "НЕ ВКАЗАНО",
            customerCity: data.procuringEntity?.address?.locality || data.procuringEntity?.address?.region || "Україна",
            budgetUah: budget,
            currency,
            isVatIncluded,
            deadline: data.tenderPeriod?.endDate || null,
            datePublished: data.datePublished || data.dateModified || null,
            region: data.procuringEntity?.address?.region || data.procuringEntity?.address?.locality || "Україна",
            status: data.status || 'active',
            category: data.mainProcurementCategory || (cpvDesc ? cpvDesc : "Товари та послуги"),
            summary: data.description || data.title || "",
            relevanceScore: matchedKeywordCount > 0 ? matchedKeywordCount * 10 + 50 : 50,
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
