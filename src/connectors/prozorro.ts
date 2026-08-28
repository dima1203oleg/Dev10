/**
 * Prozorro Public API Connector & Matching Engine
 * Connects directly to Prozorro open procurement REST API:
 * https://public.api.openprocurement.org/api/2.5/tenders
 */

import crypto from 'crypto';

export interface ProzorroTenderItem {
  id: string;
  tenderId: string; // The official UA-XXXX ID
  title: string;
  customer: string | 'NOT_AVAILABLE';
  customerEdrpou: string | 'NOT_AVAILABLE';
  customerCity: string | 'NOT_AVAILABLE';
  budgetUah: number | null;
  currency: string;
  deadline: string | 'NOT_AVAILABLE';
  status: string;
  category: string | 'NOT_AVAILABLE';
  cpvCode: string | 'NOT_AVAILABLE';
  region: string | 'NOT_AVAILABLE';
  source: {
    name: 'Prozorro';
    url: string;
    retrievedAt: string;
    sourceRecordHash?: string;
  };
  foulScore: number | null;
  riskLevel: 'NOT_ANALYZED' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  boqItems: any[];
  violations: any[];
  requirements: any[];
  fitScore?: number;
  fitFactors?: {
    companyFit: number;
    legalReadiness: number;
    capacityFit: number;
    budgetFeasibility: number;
    deadlineScore?: number;
  };
}

export interface SearchTelemetry {
  searchId: string;
  durationMs: number;
  pagesFetched: number;
  recordsFetched: number;
  recordsReturned: number;
  sourceStatus: 'SUCCESS' | 'ERROR' | 'PARTIAL';
  nextOffset?: string;
}

const PROZORRO_BASE_URL = "https://public.api.openprocurement.org/api/2.5/tenders";

/**
 * PRODUCTION READY: Multi-page search for Prozorro tenders
 * Implements deep crawling and strict filtering.
 */
export async function searchProzorroTenders(
  query: any, // StructuredTenderQuery
  options: { maxPages?: number; limit?: number; offset?: string } = {}
): Promise<{ tenders: ProzorroTenderItem[]; telemetry: SearchTelemetry }> {
  const startTime = Date.now();
  const tenders: ProzorroTenderItem[] = [];
  const maxPages = options.maxPages || 5; 
  const targetLimit = options.limit || 20;
  
  let pagesFetched = 0;
  let recordsFetched = 0;
  let currentOffset = options.offset || ""; 

  try {
    while (pagesFetched < maxPages && tenders.length < targetLimit) {
      const url = `${PROZORRO_BASE_URL}?descending=1&limit=100${currentOffset ? `&offset=${currentOffset}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) break;

      const json = await response.json();
      pagesFetched++;
      
      if (!json.data || !Array.isArray(json.data) || json.data.length === 0) break;
      
      recordsFetched += json.data.length;
      currentOffset = json.next_page?.offset || "";

      // Fetch details and filter strictly
      const detailPromises = json.data.map(async (item: any) => {
        try {
          const dRes = await fetch(`${PROZORRO_BASE_URL}/${item.id}`);
          if (!dRes.ok) return null;
          const dJson = await dRes.json();
          return dJson.data;
        } catch {
          return null;
        }
      });

      const details = await Promise.all(detailPromises);

      for (const data of details) {
        if (!data) continue;
        if (tenders.length >= targetLimit) break;

        // --- PRODUCTION FILTERING ENGINE ---
        const title = (data.title || "").toLowerCase();
        const description = (data.description || "").toLowerCase();
        const customerName = (data.procuringEntity?.name || "").toLowerCase();
        const regionName = (data.procuringEntity?.address?.region || "").toLowerCase();
        const localityName = (data.procuringEntity?.address?.locality || "").toLowerCase();
        
        // 1. Keyword/Synonym Match (Recall Enhancement)
        const qKeywords = (query.keywords || []).map((k: string) => k.toLowerCase());
        const keywordMatch = qKeywords.length === 0 || qKeywords.some((k: string) => 
          title.includes(k) || description.includes(k) || customerName.includes(k)
        );
        if (!keywordMatch) continue;

        // 2. Budget Bounds
        const amount = data.value?.amount || null;
        if (query.minBudget && (amount === null || amount < query.minBudget)) continue;
        if (query.maxBudget && (amount === null || amount > query.maxBudget)) continue;

        // 3. Precise Location (Improved with Kyiv Normalization)
        const qLoc = (query.location?.region || query.location?.city || "").toLowerCase();
        let locationMatch = !qLoc;
        
        if (qLoc) {
          const isKyivQuery = qLoc.includes("київ") || qLoc.includes("киев");
          if (isKyivQuery) {
            // Kyiv can be in regionName (Київська обл) or localityName (Київ)
            locationMatch = regionName.includes("київ") || localityName.includes("київ") || 
                           regionName.includes("киев") || localityName.includes("киев");
          } else {
            locationMatch = regionName.includes(qLoc) || localityName.includes(qLoc);
          }
        }
        
        if (!locationMatch) continue;

        // 4. CPV Classification Filter
        const cpv = data.items?.[0]?.classification?.id;
        if (query.cpvCandidates?.length > 0 && cpv) {
          const cpvMatch = query.cpvCandidates.some((c: string) => cpv.startsWith(c.substring(0, 4)));
          if (!cpvMatch) continue;
        }

        // --- NORMALIZATION (Zero Fake Data) ---
        tenders.push({
          id: data.id,
          tenderId: data.tenderID || "NOT_AVAILABLE",
          title: data.title || "NOT_AVAILABLE",
          customer: data.procuringEntity?.name || "NOT_AVAILABLE",
          customerEdrpou: data.procuringEntity?.identifier?.id || "NOT_AVAILABLE",
          customerCity: data.procuringEntity?.address?.locality || "NOT_AVAILABLE",
          budgetUah: amount,
          currency: data.value?.currency || "UAH",
          deadline: data.tenderPeriod?.endDate || "NOT_AVAILABLE",
          status: data.status || "NOT_AVAILABLE",
          category: data.mainProcurementCategory || "NOT_AVAILABLE",
          cpvCode: cpv || "NOT_AVAILABLE",
          region: data.procuringEntity?.address?.region || "NOT_AVAILABLE",
          source: {
            name: 'Prozorro',
            url: `https://prozorro.gov.ua/tender/${data.tenderID || data.id}`,
            retrievedAt: new Date().toISOString(),
            sourceRecordHash: crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
          },
          foulScore: null,
          riskLevel: "NOT_ANALYZED",
          summary: data.description || "Отримано з Prozorro API. Очікує на аудит.",
          boqItems: [],
          violations: [],
          requirements: []
        });
      }

      if (!currentOffset) break;
    }

    return {
      tenders,
      telemetry: {
        searchId: crypto.randomUUID(),
        durationMs: Date.now() - startTime,
        pagesFetched,
        recordsFetched,
        recordsReturned: tenders.length,
        sourceStatus: 'SUCCESS',
        nextOffset: currentOffset
      }
    };
  } catch (error) {
    console.error("Prozorro Search Error:", error);
    return {
      tenders: [],
      telemetry: {
        searchId: crypto.randomUUID(),
        durationMs: Date.now() - startTime,
        pagesFetched,
        recordsFetched,
        recordsReturned: 0,
        sourceStatus: 'ERROR'
      }
    };
  }
}

/**
 * Fetch list of recent tenders (Legacy, updated for production safety)
 */
export async function fetchProzorroRecentTenders(
  limit: number = 10,
  query?: string
): Promise<ProzorroTenderItem[]> {
  const { tenders } = await searchProzorroTenders({ keywords: query ? [query] : [] }, { limit, maxPages: 2 });
  return tenders;
}

/**
 * Calculate Personal Tender Radar Match Score based on evidence
 */
export function calculatePersonalRadarMatch(
  tender: ProzorroTenderItem,
  companyProfile: any
): {
  fitScore: number;
  factors: {
    companyFit: number;
    legalReadiness: number;
    capacityFit: number;
    budgetFeasibility: number;
  };
  reasons: string[];
} {
  if (!companyProfile) {
    return {
      fitScore: 0,
      factors: { companyFit: 0, legalReadiness: 0, capacityFit: 0, budgetFeasibility: 0 },
      reasons: ["Профіль компанії не знайдено"]
    };
  }

  const reasons: string[] = [];
  const vault = (companyProfile.vaultData as any) || {};
  
  // 1. CPV / Industry Match (Improved Semantic Mapping)
  let companyFit = 0;
  const companyKveds = companyProfile.kvedCodes || vault.kveds || [];
  
  if (tender.cpvCode !== 'NOT_AVAILABLE' && companyKveds.length > 0) {
    const tenderPrefix = tender.cpvCode.substring(0, 2);
    const tenderPrefix4 = tender.cpvCode.substring(0, 4);
    
    // Semantic Mapping Matrix (Simplified version of Industry Standard)
    const compatibilityMatrix: Record<string, string[]> = {
      "45": ["41", "42", "43", "71"], // Construction CPV -> Construction/Engineering KVED
      "72": ["62", "63", "58"],       // IT CPV -> IT Services/Software KVED
      "33": ["21", "32", "46"],       // Medical CPV -> Pharma/MedTech/Wholesale KVED
      "15": ["10", "11", "46"],       // Food CPV -> Food Production/Wholesale KVED
      "09": ["35", "06", "46"],       // Energy/Fuel CPV -> Energy/Extraction KVED
      "60": ["49", "50", "52"]        // Transport CPV -> Land Transport/Storage KVED
    };

    const isDirectMatch = companyKveds.some((k: string) => k.toString().startsWith(tenderPrefix));
    const isSemanticMatch = compatibilityMatrix[tenderPrefix]?.some(prefix => 
      companyKveds.some((k: string) => k.toString().startsWith(prefix))
    );

    if (isDirectMatch) {
      companyFit = 100;
      reasons.push(`Індустріальна відповідність: Прямий збіг CPV ${tender.cpvCode} з вашим КВЕД`);
    } else if (isSemanticMatch) {
      companyFit = 85;
      reasons.push(`Висока суміжність: Ваш профіль підходить для робіт за CPV ${tenderPrefix4}`);
    } else {
      companyFit = 20;
      reasons.push(`Низька відповідність спеціалізації (CPV: ${tender.cpvCode})`);
    }
  } else {
    companyFit = 40;
    reasons.push("Спеціалізацію не верифіковано (Заповніть КВЕД у Vault)");
  }

  // 2. Budget Feasibility
  let budgetFeasibility = 0;
  const userMax = companyProfile.maxTenderBudget || vault.maxTenderBudget || 100000000;
  if (tender.budgetUah) {
    if (tender.budgetUah <= userMax) {
      budgetFeasibility = 100;
    } else {
      budgetFeasibility = Math.max(20, Math.round(100 - (tender.budgetUah / userMax) * 10));
      reasons.push(`Бюджет перевищує ваш звичний ліміт (${(userMax / 1000000).toFixed(1)} млн)`);
    }
  } else {
    budgetFeasibility = 100;
  }

  // 3. Region Match
  let regionScore = 50;
  const preferredRegion = companyProfile.preferredRegion || vault.preferredRegion || "Всі регіони";
  if (tender.region !== 'NOT_AVAILABLE') {
    if (preferredRegion === "Всі регіони" || tender.region.includes(preferredRegion)) {
      regionScore = 100;
      reasons.push(`Локація: ${tender.region} (В межах інтересів)`);
    } else {
      regionScore = 40;
      reasons.push(`Локація: ${tender.region} (Поза основним регіоном)`);
    }
  }

  // 4. Deadline Feasibility
  let deadlineScore = 100;
  if (tender.deadline !== 'NOT_AVAILABLE') {
    const deadlineDate = new Date(tender.deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 3) {
      deadlineScore = 30;
      reasons.push(`⚠ Дедлайн критично близько: залишилось ${daysLeft} дн.`);
    } else if (daysLeft < 7) {
      deadlineScore = 70;
      reasons.push(`Стислий термін: залишилось ${daysLeft} дн.`);
    } else {
      reasons.push(`Комфортний дедлайн: ${daysLeft} дн. до подачі`);
    }
  }

  // 5. Operational Capacity Match
  const staffCount = vault.staffCount || 0;
  let capacityFit = staffCount > 0 ? 80 : 50;
  if (staffCount > 0) reasons.push(`Кадрова спроможність: ${staffCount} працівників`);

  const finalScore = Math.round(
    (companyFit * 0.35) + 
    (budgetFeasibility * 0.25) + 
    (regionScore * 0.20) + 
    (deadlineScore * 0.10) +
    (capacityFit * 0.10)
  );

  return {
    fitScore: finalScore,
    factors: {
      companyFit,
      legalReadiness: vault.taxCleanStatus ? 100 : 80,
      capacityFit,
      budgetFeasibility,
      deadlineScore
    },
    reasons
  };
}


/**
 * Fetch complete live tender details directly from Prozorro REST API including documents, timeline & items
 */
export async function fetchProzorroTenderFullDetail(tenderId: string): Promise<any> {
  const detailRes = await fetch(`${PROZORRO_BASE_URL}/${tenderId}`);
  if (!detailRes.ok) {
    throw new Error(`Prozorro API returned status ${detailRes.status} for tender ${tenderId}`);
  }
  const json = await detailRes.json();
  const data = json.data;
  if (!data) {
    throw new Error(`No data returned from Prozorro for tender ${tenderId}`);
  }

  // Extract structured documents
  const documents = (data.documents || []).map((doc: any) => ({
    id: doc.id,
    title: doc.title || "Документ ТД",
    format: doc.format || "application/pdf",
    url: doc.url || null,
    datePublished: doc.datePublished || null,
    documentType: doc.documentType || "tenderDocumentation"
  }));

  // Extract procurement items (BoQ / Goods / Services)
  const items = (data.items || []).map((item: any, idx: number) => ({
    id: item.id || `item-${idx + 1}`,
    description: item.description || "Предмет закупівлі",
    quantity: item.quantity || 1,
    unit: item.unit?.name || item.unit?.code || "од",
    cpvCode: item.classification?.id || "NOT_AVAILABLE",
    cpvName: item.classification?.description || "NOT_AVAILABLE",
    deliveryAddress: item.deliveryAddress ? `${item.deliveryAddress.locality || ''}, ${item.deliveryAddress.streetAddress || ''}` : "NOT_AVAILABLE"
  }));

  // Extract timeline periods
  const timeline = {
    tenderPeriod: data.tenderPeriod,
    enquiryPeriod: data.enquiryPeriod,
    clarificationPeriod: data.clarificationPeriod,
    auctionPeriod: data.auctionPeriod
  };

  return {
    raw: data,
    structured: {
      id: data.id,
        tenderNumber: data.tenderID || "NOT_AVAILABLE",
        title: data.title || "NOT_AVAILABLE",
        description: data.description || "",
        procurementMethod: data.procurementMethodType || "open",
        value: {
          amount: data.value?.amount || null,
          currency: data.value?.currency || "UAH",
          valueAddedTaxIncluded: data.value?.valueAddedTaxIncluded ?? true
        },
        customer: {
          name: data.procuringEntity?.name || "NOT_AVAILABLE",
          edrpou: data.procuringEntity?.identifier?.id || "NOT_AVAILABLE",
          address: data.procuringEntity?.address?.streetAddress || "NOT_AVAILABLE",
          locality: data.procuringEntity?.address?.locality || "NOT_AVAILABLE",
          region: data.procuringEntity?.address?.region || "NOT_AVAILABLE",
        contactPerson: data.procuringEntity?.contactPoint?.name || "",
        contactEmail: data.procuringEntity?.contactPoint?.email || "",
        contactPhone: data.procuringEntity?.contactPoint?.telephone || ""
      },
      documents,
      items,
      timeline,
      status: data.status || "active",
      numberOfBids: data.bids?.length || 0,
      bidders: (data.bids || []).map((bid: any) => ({
        id: bid.id,
        name: bid.tenderers?.[0]?.name || "Учасник",
        edrpou: bid.tenderers?.[0]?.identifier?.id || "",
        status: bid.status || "active"
      }))
    }
  };
}
