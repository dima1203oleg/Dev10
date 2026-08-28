import { useState, useCallback } from 'react';
import { Tender } from '../types';
import { useAuth } from '../contexts/AuthContext';

export interface SearchFilters {
  region?: string;
  cpv?: string;
  minBudget?: number;
  maxBudget?: number;
  status?: string;
  customer?: string;
}

export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'deadline_asc' | 'deadline_desc';

interface SearchTelemetry {
  pagesFetched: number;
  recordsScanned: number;
  recordsMatched: number;
  retrievedAt?: string;
  durationMs?: number;
}

export function useProzorroSearch() {
  const { token } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [results, setResults] = useState<Tender[]>([]);
  const [telemetry, setTelemetry] = useState<SearchTelemetry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResults = useCallback(() => {
    setResults([]);
    setSearchId(null);
    setHasMore(false);
    setTelemetry(null);
    setError(null);
  }, []);

  const search = useCallback(async (
    query: string, 
    isAppend = false, 
    options: { 
      filters?: SearchFilters, 
      sort?: SortOption, 
      limit?: number 
    } = {}
  ) => {
    if (!token) return;
    
    setIsSearching(true);
    setError(null);

    if (!isAppend) {
      setResults([]);
      setSearchId(null);
      setHasMore(false);
      setTelemetry(null);
    }

    try {
      let url = isAppend && searchId
        ? `/api/prozorro/search?searchId=${searchId}`
        : `/api/prozorro/search?query=${encodeURIComponent(query)}`;
      
      if (options.limit) url += `&limit=${options.limit}`;
      if (options.sort) url += `&sort=${options.sort}`;
      if (options.filters?.region) url += `&region=${encodeURIComponent(options.filters.region)}`;
      if (options.filters?.cpv) url += `&cpv=${encodeURIComponent(options.filters.cpv)}`;
      if (options.filters?.minBudget) url += `&minBudget=${options.filters.minBudget}`;
      if (options.filters?.maxBudget) url += `&maxBudget=${options.filters.maxBudget}`;
        
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Не вдалося отримати дані з Prozorro.");
        setIsSearching(false);
        return;
      }

      if (data.searchId) setSearchId(data.searchId);
      
      if (data.pagination) {
        setHasMore(data.pagination.hasMore);
        setTelemetry({
          pagesFetched: data.pagination.pagesFetched,
          recordsScanned: data.pagination.recordsScanned,
          recordsMatched: data.pagination.recordsMatched,
          retrievedAt: data.source?.retrievedAt,
          durationMs: data.telemetry?.durationMs
        });
      }
      
      const tendersToMap = data.results || data.tenders;
      if (tendersToMap) {
        const mapped: Tender[] = tendersToMap.map((t: any) => ({
            id: t.id.toString(),
            tenderNumber: t.tenderId || t.tenderNumber || "НЕВІДОМО",
            title: t.title || "БЕЗ НАЗВИ",
            customer: t.customer || "НЕВІДОМИЙ ЗАМОВНИК",
            customerEdrpou: t.customerEdrpou || t.detailedData?.customerEdrpou || 'NOT_AVAILABLE',
            customerCity: t.customerCity || t.detailedData?.customerCity || 'НЕВІДОМО',
            budgetUah: t.budgetUah !== undefined && t.budgetUah !== null ? parseFloat(t.budgetUah) : null,
            deadline: t.deadline || t.detailedData?.deadline || 'НЕВІДОМО',
            region: t.region || t.customerCity || t.detailedData?.region || 'Україна',
            status: t.status === 'active' ? 'ACTIVE' : 'AUDIT_FLAGGED',
            category: t.category || t.detailedData?.category || 'Будівельні роботи',
            foulScore: t.foulScore !== undefined ? t.foulScore : null,
            riskLevel: t.riskLevel || 'NOT_ANALYZED',
            summary: t.summary || '',
            createdDate: t.datePublished || null,
            boqItems: [],
            violations: [],
            requirements: [],
            // Radar-specific scores if available
            opportunityScore: t.fitScore ? {
                overallScore: t.fitScore,
                bidDecision: t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL' ? 'BID_WITH_CONDITIONS' : 'BID',
                bidDecisionReason: (t.radarReasons?.[0]?.description || t.radarReasons?.[0] || "Аналіз за даними Vault"),
                factors: t.fitFactors || null,
                whyThisTender: (t.radarReasons || []).map((r: any) => ({
                  icon: "Shield",
                  title: "Відповідність",
                  description: typeof r === 'string' ? r : r.description,
                  type: "POSITIVE"
                }))
            } : undefined
        }));
        
        if (isAppend) {
          setResults(prev => {
            const existingIds = new Set(prev.map(t => t.id));
            const uniqueNew = mapped.filter(t => !existingIds.has(t.id));
            
            // PRODUCTION GATE: If no new unique results found, stop pagination
            if (uniqueNew.length === 0 && mapped.length > 0) {
              setHasMore(false);
            }
            
            return [...prev, ...uniqueNew];
          });
        } else {
          setResults(mapped);
        }
      }
    } catch (err) {
      console.error('Prozorro search error:', err);
      setError("Виникла критична помилка під час запиту до Prozorro.");
    } finally {
      setIsSearching(false);
    }
  }, [token, searchId]);

  return {
    isSearching,
    hasMore,
    results,
    telemetry,
    error,
    search,
    clearResults
  };
}
