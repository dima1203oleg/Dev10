/**
 * Next-Generation Prozorro Search Engine & Scoring Technology
 * Multi-Factor Relevance Scoring, Morphological Stemming, CPV Hierarchy Matching & Resilient API Connector.
 */

import { extractAndExpandKeywords, matchUkrainianText, stemUkrainianWord } from './ukrainianStemmer';
import { evaluateCpvHierarchy, normalizeCpvCode } from './cpvMatcher';
import { ProzorroTenderItem, SearchTelemetry, SearchOptions, RejectionDetails } from './prozorro';

export interface ScoredProzorroTender extends ProzorroTenderItem {
  scoringBreakdown: {
    titleScore: number;
    descriptionScore: number;
    cpvScore: number;
    exactPhraseBonus: number;
    matchedKeywordsList: string[];
    rawRelevance: number;
  };
}

const PROZORRO_API_BASE = "https://public.api.openprocurement.org/api/2.5/tenders";

/**
 * Calculates high-precision relevance score (0 - 100) for a tender against a structured query.
 */
export function calculateTenderRelevanceScore(
  tenderData: any,
  query: {
    keywords?: string[];
    negativeKeywords?: string[];
    cpvCandidates?: string[];
    minBudget?: number;
    maxBudget?: number;
    region?: string;
  }
): { score: number; isExcluded: boolean; exclusionReason?: string; breakdown: ScoredProzorroTender['scoringBreakdown'] } {
  const title = (tenderData.title || "").toLowerCase();
  const description = (tenderData.description || "").toLowerCase();
  const cpvCode = tenderData.items?.[0]?.classification?.id || "";
  const cpvDesc = (tenderData.items?.[0]?.classification?.description || "").toLowerCase();
  const procuringName = (tenderData.procuringEntity?.name || "").toLowerCase();
  const region = (tenderData.procuringEntity?.address?.region || "").toLowerCase();
  const locality = (tenderData.procuringEntity?.address?.locality || "").toLowerCase();

  const fullText = `${title} ${description} ${cpvDesc} ${procuringName} ${locality} ${region}`;

  // 1. Negative Keyword Filtering
  const negativeKws = (query.negativeKeywords || []).map(k => k.toLowerCase().trim()).filter(Boolean);
  for (const negKw of negativeKws) {
    if (fullText.includes(negKw)) {
      return {
        score: 0,
        isExcluded: true,
        exclusionReason: `Закупівля містить мінус-слово: '${negKw}'`,
        breakdown: { titleScore: 0, descriptionScore: 0, cpvScore: 0, exactPhraseBonus: 0, matchedKeywordsList: [], rawRelevance: 0 }
      };
    }
  }

  // 2. Keyword Processing & Morphological Expansion
  const userQueryString = (query.keywords || []).join(' ');
  const { originalKeywords, stemmedRoots, expandedTerms } = extractAndExpandKeywords(userQueryString);

  let titleScore = 0;
  let descriptionScore = 0;
  let exactPhraseBonus = 0;
  const matchedKeywordsList = new Set<string>();

  if (originalKeywords.length > 0) {
    // Exact Phrase Bonus
    if (userQueryString.length > 3 && fullText.includes(userQueryString.toLowerCase())) {
      exactPhraseBonus += 25;
    }

    // Evaluate Title Matches (Weight x3.0)
    for (const kw of originalKeywords) {
      const titleMatch = matchUkrainianText(title, kw);
      if (titleMatch.matched) {
        titleScore += titleMatch.scoreBonus * 1.5;
        matchedKeywordsList.add(kw);
      }
    }

    // Evaluate Description Matches (Weight x1.5)
    for (const kw of originalKeywords) {
      const descMatch = matchUkrainianText(description + " " + cpvDesc, kw);
      if (descMatch.matched) {
        descriptionScore += descMatch.scoreBonus;
        matchedKeywordsList.add(kw);
      }
    }

    // Evaluate Expanded Synonyms / Stems
    for (const expanded of expandedTerms) {
      if (title.includes(expanded)) {
        titleScore += 10;
        matchedKeywordsList.add(expanded);
      } else if (description.includes(expanded)) {
        descriptionScore += 5;
      }
    }

    // If keywords were provided but none matched (neither exact nor stem nor expanded synonym)
    if (matchedKeywordsList.size === 0) {
      return {
        score: 0,
        isExcluded: true,
        exclusionReason: "Не знайдено збігів з ключовими словами або їх нормалізованими коренями",
        breakdown: { titleScore: 0, descriptionScore: 0, cpvScore: 0, exactPhraseBonus: 0, matchedKeywordsList: [], rawRelevance: 0 }
      };
    }
  } else {
    // General browse query without keyword filters
    titleScore = 40;
  }

  // 3. CPV Match Evaluation
  let maxCpvScore = 0;
  if (query.cpvCandidates && query.cpvCandidates.length > 0 && cpvCode) {
    for (const cand of query.cpvCandidates) {
      const matchRes = evaluateCpvHierarchy(cpvCode, cand);
      if (matchRes.score > maxCpvScore) {
        maxCpvScore = matchRes.score;
      }
    }
  } else if (cpvCode) {
    maxCpvScore = 30; // Baseline CPV score when CPV exists
  }

  const cpvWeightedScore = (maxCpvScore / 100) * 30;

  // 4. Calculate Final Composite Relevance (normalized to 0-100)
  const rawRelevance = titleScore + descriptionScore + exactPhraseBonus + cpvWeightedScore;
  const normalizedScore = Math.min(100, Math.max(10, Math.round(rawRelevance)));

  return {
    score: normalizedScore,
    isExcluded: false,
    breakdown: {
      titleScore: Math.round(titleScore),
      descriptionScore: Math.round(descriptionScore),
      cpvScore: Math.round(cpvWeightedScore),
      exactPhraseBonus: Math.round(exactPhraseBonus),
      matchedKeywordsList: Array.from(matchedKeywordsList),
      rawRelevance: Math.round(rawRelevance)
    }
  };
}

/**
 * Advanced Resilient Search Engine that queries Prozorro feed and ranks results using
 * morphological stemming, multi-factor scoring, and deduplicated page cursor pagination.
 */
export async function executeAdvancedProzorroSearch(
  query: any = {},
  options: SearchOptions = {}
): Promise<{ tenders: ScoredProzorroTender[]; telemetry: SearchTelemetry }> {
  const startTime = Date.now();
  const tendersMap = new Map<string, ScoredProzorroTender>();
  const maxPages = options.maxPages || 4;
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

  const searchId = globalThis.crypto.randomUUID();
  let sourceStatus: 'SUCCESS' | 'ERROR' | 'PARTIAL' = 'SUCCESS';

  try {
    let nextPageUri = `${PROZORRO_API_BASE}?descending=1&opt_fields=title,description,value,procuringEntity,items,status,datePublished,dateModified,tenderPeriod,tenderID&limit=50`;
    if (currentOffset) {
      nextPageUri += `&offset=${currentOffset}`;
    }

    const controller = new AbortController();
    const globalTimeout = setTimeout(() => controller.abort(), timeoutMs);

    while (pagesFetched < maxPages && tendersMap.size < targetLimit) {
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
          const tenderId = data.tenderID || data.id;
          if (!tenderId || tendersMap.has(tenderId) || tendersMap.has(data.id)) continue;

          const cpv = data.items?.[0]?.classification?.id || "";
          const budget = data.value?.amount !== undefined ? Number(data.value.amount) : null;
          const regionName = (data.procuringEntity?.address?.region || "").toLowerCase();
          const localityName = (data.procuringEntity?.address?.locality || "").toLowerCase();

          // Filter 1: CPV Filter
          if (options.filters?.cpv && cpv) {
            const cpvEval = evaluateCpvHierarchy(cpv, options.filters.cpv);
            if (cpvEval.score === 0) {
              rejectionTelemetry.rejected_cpv++;
              continue;
            }
          }

          // Filter 2: Budget Range
          if (options.filters?.minBudget && (budget === null || budget < options.filters.minBudget)) {
            rejectionTelemetry.rejected_budget++;
            continue;
          }
          if (options.filters?.maxBudget && (budget === null || budget > options.filters.maxBudget)) {
            rejectionTelemetry.rejected_budget++;
            continue;
          }

          // Filter 3: Region Filter
          if (options.filters?.region) {
            const filterReg = options.filters.region.toLowerCase();
            if (!regionName.includes(filterReg) && !localityName.includes(filterReg)) {
              rejectionTelemetry.rejected_region++;
              continue;
            }
          }

          // Relevance Scoring & Keyword/Stem Filtering
          const searchParams = {
            keywords: query.keywords || [],
            negativeKeywords: query.negativeKeywords || [],
            cpvCandidates: query.cpvCandidates || (options.filters?.cpv ? [options.filters.cpv] : []),
            minBudget: options.filters?.minBudget,
            maxBudget: options.filters?.maxBudget,
            region: options.filters?.region
          };

          const relResult = calculateTenderRelevanceScore(data, searchParams);

          if (relResult.isExcluded) {
            if (relResult.exclusionReason?.includes("мінус-слово")) {
              rejectionTelemetry.rejected_negative++;
            } else {
              rejectionTelemetry.rejected_keywords++;
            }
            continue;
          }

          const currency = data.value?.currency || "UAH";
          const isVatIncluded = data.value?.valueAddedTaxIncluded ?? true;

          const item: ScoredProzorroTender = {
            id: data.id,
            tenderId,
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
            category: data.mainProcurementCategory || (data.items?.[0]?.classification?.description ? data.items[0].classification.description : "Товари та послуги"),
            summary: data.description || data.title || "",
            relevanceScore: relResult.score,
            scoringBreakdown: relResult.breakdown,
            riskLevel: 'NOT_ANALYZED',
            foulScore: null,
            retrievedAt: new Date().toISOString()
          };

          tendersMap.set(tenderId, item);
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

    const tendersList = Array.from(tendersMap.values());

    // Apply Sorting
    tendersList.sort((a, b) => {
      switch (options.sort || 'relevance') {
        case 'price_asc': return (a.budgetUah || 0) - (b.budgetUah || 0);
        case 'price_desc': return (b.budgetUah || 0) - (a.budgetUah || 0);
        case 'date_desc': return (b.datePublished ? new Date(b.datePublished).getTime() : 0) - (a.datePublished ? new Date(a.datePublished).getTime() : 0);
        case 'date_asc': return (a.datePublished ? new Date(a.datePublished).getTime() : 0) - (b.datePublished ? new Date(b.datePublished).getTime() : 0);
        case 'deadline_asc': return (a.deadline ? new Date(a.deadline).getTime() : 0) - (b.deadline ? new Date(b.deadline).getTime() : 0);
        case 'relevance': default: return b.relevanceScore - a.relevanceScore;
      }
    });

    return {
      tenders: tendersList.slice(0, targetLimit),
      telemetry: {
        searchId,
        durationMs: Date.now() - startTime,
        pagesFetched,
        recordsFetched,
        recordsReturned: Math.min(tendersList.length, targetLimit),
        sourceStatus,
        nextOffset: currentOffset,
        rejectionDetails: rejectionTelemetry
      }
    };
  } catch (error) {
    console.error("Advanced Prozorro Search Error:", error);
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
