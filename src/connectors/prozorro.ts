/**
 * Prozorro Public API Connector & Matching Engine
 * Connects directly to Prozorro open procurement REST API:
 * https://public.api.openprocurement.org/api/2.5/tenders
 */

export interface ProzorroTenderItem {
  id: string;
  tenderNumber: string;
  title: string;
  customer: string;
  customerEdrpou: string;
  customerCity: string;
  budgetUah: number;
  deadline: string;
  status: 'ACTIVE' | 'EVALUATION' | 'COMPLETE' | 'CANCELLED' | 'NOT_ANALYZED';
  category: string;
  foulScore: number | null; // null until FoulTender AI audit is explicitly requested
  riskLevel: 'NOT_ANALYZED' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  cpvCode?: string;
  region?: string;
  boqItems: any[];
  violations: any[];
  requirements: any[];
  fitScore?: number; // Calculated dynamically by Personal Tender Radar
  fitFactors?: {
    companyFit: number;
    legalReadiness: number;
    capacityFit: number;
    budgetFeasibility: number;
  };
}

const PROZORRO_BASE_URL = "https://public.api.openprocurement.org/api/2.5/tenders";

/**
 * Fetch list of recent tenders directly from Prozorro API
 */
export async function fetchProzorroRecentTenders(
  limit: number = 10,
  query?: string
): Promise<ProzorroTenderItem[]> {
  try {
    const response = await fetch(`${PROZORRO_BASE_URL}?descending=1&limit=${Math.min(limit * 3, 30)}`);
    if (!response.ok) {
      throw new Error(`Prozorro API returned status ${response.status}`);
    }

    const json = await response.json();
    if (!json.data || !Array.isArray(json.data)) {
      return [];
    }

    const tenders: ProzorroTenderItem[] = [];
    // Fetch details for up to limit items
    for (const item of json.data.slice(0, limit)) {
      try {
        const detailRes = await fetch(`${PROZORRO_BASE_URL}/${item.id}`);
        if (!detailRes.ok) continue;

        const detailJson = await detailRes.json();
        const data = detailJson.data;
        if (!data) continue;

        // Query filtering if provided
        if (query && typeof query === 'string' && query.trim().length > 0) {
          const q = query.toLowerCase().trim();
          const titleMatches = (data.title || "").toLowerCase().includes(q);
          const customerMatches = (data.procuringEntity?.name || "").toLowerCase().includes(q);
          const cpvMatches = (data.items?.[0]?.classification?.id || "").toLowerCase().includes(q);
          if (!titleMatches && !customerMatches && !cpvMatches) {
            continue;
          }
        }

        tenders.push({
          id: data.id,
          tenderNumber: data.tenderID || `UA-${data.id.substring(0, 8)}`,
          title: data.title || "Без назви",
          customer: data.procuringEntity?.name || "Невідомий замовник",
          customerEdrpou: data.procuringEntity?.identifier?.id || "00000000",
          customerCity: data.procuringEntity?.address?.locality || "Україна",
          budgetUah: data.value?.amount || 0,
          deadline: data.tenderPeriod?.endDate || new Date(Date.now() + 14 * 86400000).toISOString(),
          status: 'ACTIVE',
          category: data.mainProcurementCategory || data.items?.[0]?.classification?.description || "Загальні закупівлі",
          cpvCode: data.items?.[0]?.classification?.id || "45000000-7",
          region: data.procuringEntity?.address?.region || "Загальнонаціональний",
          foulScore: null, // Strictly null on import until FoulTender audit is run!
          riskLevel: "NOT_ANALYZED",
          summary: "Отримано безпосередньо з Prozorro REST API. Статус: НЕ АНАЛІЗОВАНО. Запустіть FoulTender або AI Аналіз для перевірки ризиків.",
          boqItems: [],
          violations: [],
          requirements: []
        });
      } catch (err) {
        console.error(`Failed to fetch Prozorro detail for ${item.id}:`, err);
      }
    }

    return tenders;
  } catch (error) {
    console.error("Prozorro API Fetch Error:", error);
    throw error;
  }
}

/**
 * Calculate Personal Tender Radar Match Score based on Company Profile
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
  let companyFit = 70;
  let legalReadiness = 80;
  let capacityFit = 75;
  let budgetFeasibility = 85;
  const reasons: string[] = ["Перевірено через Prozorro API"];

  if (companyProfile) {
    // Check EDRPOU / KVED / CPV
    if (companyProfile.edrpou) {
      companyFit += 10;
      reasons.push(`Профіль підприємства ЄДРПОУ ${companyProfile.edrpou} заповнено`);
    }

    // Budget check
    if (companyProfile.vaultData) {
      const vault = companyProfile.vaultData;
      if (vault.staffCount && vault.staffCount > 5) {
        capacityFit += 10;
      }
      if (vault.equipmentCount && vault.equipmentCount > 3) {
        capacityFit += 10;
      }
    }
  }

  const overallScore = Math.round(
    companyFit * 0.3 + legalReadiness * 0.25 + capacityFit * 0.25 + budgetFeasibility * 0.2
  );

  return {
    fitScore: Math.min(100, Math.max(10, overallScore)),
    factors: {
      companyFit: Math.min(100, companyFit),
      legalReadiness: Math.min(100, legalReadiness),
      capacityFit: Math.min(100, capacityFit),
      budgetFeasibility: Math.min(100, budgetFeasibility)
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
    url: doc.url || "#",
    datePublished: doc.datePublished || new Date().toISOString(),
    documentType: doc.documentType || "tenderDocumentation"
  }));

  // Extract procurement items (BoQ / Goods / Services)
  const items = (data.items || []).map((item: any, idx: number) => ({
    id: item.id || `item-${idx + 1}`,
    description: item.description || "Предмет закупівлі",
    quantity: item.quantity || 1,
    unit: item.unit?.name || item.unit?.code || "од",
    cpvCode: item.classification?.id || "45000000-7",
    cpvName: item.classification?.description || "Будівельні роботи",
    deliveryAddress: item.deliveryAddress ? `${item.deliveryAddress.locality || ''}, ${item.deliveryAddress.streetAddress || ''}` : "Україна"
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
      tenderNumber: data.tenderID || `UA-${data.id.substring(0, 8)}`,
      title: data.title || "Без назви",
      description: data.description || "",
      procurementMethod: data.procurementMethodType || "open",
      value: {
        amount: data.value?.amount || 0,
        currency: data.value?.currency || "UAH",
        valueAddedTaxIncluded: data.value?.valueAddedTaxIncluded ?? true
      },
      customer: {
        name: data.procuringEntity?.name || "Невідомий замовник",
        edrpou: data.procuringEntity?.identifier?.id || "00000000",
        address: data.procuringEntity?.address?.streetAddress || "",
        locality: data.procuringEntity?.address?.locality || "",
        region: data.procuringEntity?.address?.region || "Україна",
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
