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
  weightsVersion: string;
  coverage: number;
  breakdown: Record<string, { score: number | null; weight: number; evidence: string }>;
} {
  const calculatedAt = new Date().toISOString();
  const vault = profile?.vaultData && typeof profile.vaultData === 'object' ? profile.vaultData : {};
  const reasons: { title: string; description: string; type: 'POSITIVE' | 'NEUTRAL' | 'WARNING' }[] = [];
  const weightsVersion = 'FIT_SCORE_V1';
  const defaults = { cpv: 0.30, region: 0.15, financial: 0.25, licenses: 0.15, documents: 0.15 };
  const candidateWeights = vault.fitWeights || {};
  const weights = Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => {
    const value = Number(candidateWeights[key]);
    return [key, Number.isFinite(value) && value >= 0 && value <= 1 ? value : fallback];
  })) as typeof defaults;
  const weightTotal = Object.values(weights).reduce((sum, value) => sum + value, 0);
  for (const key of Object.keys(weights) as Array<keyof typeof weights>) weights[key] /= weightTotal;

  const breakdown: Record<string, { score: number | null; weight: number; evidence: string }> = {
    cpv: { score: null, weight: weights.cpv, evidence: 'CPV data unavailable' },
    region: { score: null, weight: weights.region, evidence: 'Region data unavailable' },
    financial: { score: null, weight: weights.financial, evidence: 'Financial capacity unavailable' },
    licenses: { score: null, weight: weights.licenses, evidence: 'Tender license requirements unavailable' },
    documents: { score: null, weight: weights.documents, evidence: 'Vault document inventory unavailable' },
  };

  const tenderCpv = (tender.items?.[0]?.classification?.id || tender.category || "").trim();
  const companyCpvs = Array.isArray(vault.cpvCodes) ? vault.cpvCodes : [];
  if (companyCpvs.length > 0 && tenderCpv) {
    let maxCpvEvalScore = 0;
    for (const c of companyCpvs) {
      const evalRes = evaluateCpvHierarchy(tenderCpv, c);
      maxCpvEvalScore = Math.max(maxCpvEvalScore, evalRes.score);
    }
    breakdown.cpv = { score: maxCpvEvalScore, weight: weights.cpv, evidence: `${tenderCpv} vs ${companyCpvs.join(', ')}` };
    reasons.push({ title: `CPV-відповідність ${maxCpvEvalScore}%`, description: breakdown.cpv.evidence, type: maxCpvEvalScore >= 80 ? 'POSITIVE' : maxCpvEvalScore >= 30 ? 'NEUTRAL' : 'WARNING' });
  }

  const budget = typeof tender.budgetUah === 'number' ? tender.budgetUah : (parseFloat(tender.budgetUah) || 0);
  const minBudget = Number(vault.minTenderBudget);
  const maxBudget = Number(vault.maxTenderBudget);
  if (budget > 0 && Number.isFinite(maxBudget) && maxBudget > 0) {
    const score = budget > maxBudget ? 0 : Number.isFinite(minBudget) && minBudget > 0 && budget < minBudget ? 40 : 100;
    breakdown.financial = { score, weight: weights.financial, evidence: `${budget} UAH; capacity ${Number.isFinite(minBudget) ? minBudget : 0}-${maxBudget} UAH` };
  }

  const tenderRegion = (tender.region || tender.customerCity || "").toLowerCase();
  const regionsOfWork = [...(Array.isArray(vault.regionsOfWork) ? vault.regionsOfWork : []), vault.preferredRegion].filter(Boolean).map((value: string) => value.toLowerCase());
  if (tenderRegion && regionsOfWork.length) {
    const matched = regionsOfWork.some((region: string) => tenderRegion.includes(region) || region.includes(tenderRegion));
    breakdown.region = { score: matched ? 100 : 0, weight: weights.region, evidence: `${tenderRegion} vs ${regionsOfWork.join(', ')}` };
  }

  const requiredLicenses = Array.isArray(tender.requiredLicenses) ? tender.requiredLicenses.map((value: unknown) => String(value).toLowerCase()) : [];
  const companyLicenses = Array.isArray(vault.licenses) ? vault.licenses.map((value: unknown) => String(typeof value === 'string' ? value : (value as any)?.name || '').toLowerCase()) : [];
  if (requiredLicenses.length) {
    const matched = requiredLicenses.filter((required: string) => companyLicenses.some((owned: string) => owned && matchUkrainianText(owned, required).matched));
    breakdown.licenses = { score: Math.round(matched.length / requiredLicenses.length * 100), weight: weights.licenses, evidence: `${matched.length}/${requiredLicenses.length} requirements matched` };
  }

  const documents = Array.isArray(vault.vaultDocuments) ? vault.vaultDocuments : null;
  if (documents) breakdown.documents = { score: documents.length ? 100 : 0, weight: weights.documents, evidence: `${documents.length} verified vault documents` };
  const available = Object.values(breakdown).filter(component => component.score !== null);
  const coverage = available.reduce((sum, component) => sum + component.weight, 0);
  const finalFitScore = coverage >= 0.6 ? Math.round(available.reduce((sum, component) => sum + (component.score! * component.weight), 0) / coverage) : null;
  const docScore = breakdown.documents.score || 0;
  const executionScore = Array.isArray(vault.staff) && vault.staff.length > 0 ? 100 : 0;
  const regionScore = breakdown.region.score || 0;
  const budgetScore = breakdown.financial.score || 0;
  const licenseScore = breakdown.licenses.score || 0;

  return {
    fitScore: finalFitScore,
    status: finalFitScore === null ? 'INSUFFICIENT_DATA' : 'AVAILABLE',
    factors: {
      companyFit: finalFitScore || 0,
      legalFit: licenseScore,
      docReadiness: docScore,
      executionFeasibility: executionScore,
      regionFit: regionScore,
      budgetFit: budgetScore
    },
    reasons,
    method: "DETERMINISTIC_WEIGHTED_EVIDENCE_ONLY",
    calculatedAt,
    weightsVersion,
    coverage: Math.round(coverage * 100) / 100,
    breakdown,
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
