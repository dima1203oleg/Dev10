/** Only audited live connectors may return procurement records. */
import { searchProzorroTenders, type ProzorroTenderItem } from './prozorro';

export type PlatformSourceId = 'PROZORRO_STATE' | 'PROZORRO_SALE' | 'DEFENSE_DOT' | 'SMARTTENDER_B2B' | 'ETENDER_COMMERCIAL' | 'PROM_B2B' | 'DTEK_ENTERPRISE' | 'METINVEST_B2B' | 'NAFTOGAZ_UKRNAFTA' | 'MHP_B2B' | 'FACEBOOK_B2B_FEEDS' | 'TELEGRAM_TENDER_CHANNELS' | 'LINKEDIN_RFP';
export type PlatformCategory = 'STATE' | 'DEFENSE' | 'CORPORATE' | 'SOCIAL';
export interface PlatformMetadata { id: PlatformSourceId; name: string; shortName: string; category: PlatformCategory; categoryLabel: string; badgeText: string; badgeBgClass: string; badgeTextClass: string; icon: string; description: string; officialWebsite: string; isRealTimeApi: boolean; availability: 'ACTIVE' | 'NOT_INTEGRATED' }

const unavailable = (id: PlatformSourceId, name: string, category: PlatformCategory, officialWebsite: string): PlatformMetadata => ({
  id, name, shortName: name, category,
  categoryLabel: category === 'STATE' ? 'Державні закупівлі' : category === 'DEFENSE' ? 'Оборонні закупівлі' : category === 'CORPORATE' ? 'Комерційні закупівлі' : 'Соціальні джерела',
  badgeText: 'Не інтегровано', badgeBgClass: 'bg-slate-500/10 border-slate-500/30', badgeTextClass: 'text-slate-500', icon: 'Lock',
  description: 'Джерело не повертає даних, доки офіційний connector і license/security gate не пройдуть перевірку.', officialWebsite, isRealTimeApi: false, availability: 'NOT_INTEGRATED',
});

export const PLATFORM_SOURCES_DIRECTORY: Record<PlatformSourceId, PlatformMetadata> = {
  PROZORRO_STATE: { id: 'PROZORRO_STATE', name: 'Prozorro (Публічні державні закупівлі)', shortName: 'Prozorro State', category: 'STATE', categoryLabel: 'Державні закупівлі', badgeText: 'Державний тендер Prozorro', badgeBgClass: 'bg-emerald-500/10 border-emerald-500/30', badgeTextClass: 'text-emerald-700 dark:text-emerald-400', icon: 'Landmark', description: 'Офіційна відкрита база державних закупівель України (REST API v2.5)', officialWebsite: 'https://prozorro.gov.ua', isRealTimeApi: true, availability: 'ACTIVE' },
  PROZORRO_SALE: unavailable('PROZORRO_SALE', 'Prozorro.Продажі', 'STATE', 'https://prozorro.sale'),
  DEFENSE_DOT: unavailable('DEFENSE_DOT', 'Державний Оператор Тилу', 'DEFENSE', 'https://dot.gov.ua'),
  SMARTTENDER_B2B: unavailable('SMARTTENDER_B2B', 'SmartTender Commercial B2B', 'CORPORATE', 'https://smarttender.biz'),
  ETENDER_COMMERCIAL: unavailable('ETENDER_COMMERCIAL', 'E-Tender Commercial', 'CORPORATE', 'https://e-tender.ua'),
  PROM_B2B: unavailable('PROM_B2B', 'Zakupki.Prom.ua B2B', 'CORPORATE', 'https://zakupki.prom.ua'),
  DTEK_ENTERPRISE: unavailable('DTEK_ENTERPRISE', 'DTEK Procurement', 'CORPORATE', 'https://dtek.com/procurement'),
  METINVEST_B2B: unavailable('METINVEST_B2B', 'Metinvest Procurement', 'CORPORATE', 'https://metinvestholding.com/procurement'),
  NAFTOGAZ_UKRNAFTA: unavailable('NAFTOGAZ_UKRNAFTA', 'Укрнафта / Нафтогаз', 'CORPORATE', 'https://ukrnafta.com/tenders'),
  MHP_B2B: unavailable('MHP_B2B', 'МХП B2B', 'CORPORATE', 'https://mhp.com.ua/tenders'),
  FACEBOOK_B2B_FEEDS: unavailable('FACEBOOK_B2B_FEEDS', 'Facebook B2B', 'SOCIAL', 'https://facebook.com'),
  TELEGRAM_TENDER_CHANNELS: unavailable('TELEGRAM_TENDER_CHANNELS', 'Telegram Tender Feeds', 'SOCIAL', 'https://telegram.org'),
  LINKEDIN_RFP: unavailable('LINKEDIN_RFP', 'LinkedIn RFP', 'SOCIAL', 'https://linkedin.com'),
};

export interface MultiPlatformTenderItem extends ProzorroTenderItem { platformSource: PlatformSourceId; platformCategory: PlatformCategory; platformName: string; platformBadge: string; platformBadgeBgClass: string; platformBadgeTextClass: string; platformUrl: string; contactPerson?: string; contactPhone?: string; contactEmail?: string }
export interface MultiPlatformSearchOptions { selectedPlatforms?: PlatformSourceId[]; categories?: PlatformCategory[]; limit?: number; offset?: string; sort?: string; filters?: { region?: string; cpv?: string; minBudget?: number; maxBudget?: number; customer?: string } }

export async function searchMultiPlatformTenders(query: any = {}, options: MultiPlatformSearchOptions = {}) {
  const startedAt = Date.now();
  const selectedPlatforms = options.selectedPlatforms?.length ? options.selectedPlatforms : ['PROZORRO_STATE'] as PlatformSourceId[];
  const unsupportedPlatforms = selectedPlatforms.filter(source => PLATFORM_SOURCES_DIRECTORY[source].availability !== 'ACTIVE');
  const result = selectedPlatforms.includes('PROZORRO_STATE')
    ? await searchProzorroTenders(query, { limit: options.limit || 25, offset: options.offset, sort: (options.sort as any) || 'date_desc', filters: options.filters })
    : { tenders: [] as ProzorroTenderItem[], telemetry: { nextOffset: '' } };
  const meta = PLATFORM_SOURCES_DIRECTORY.PROZORRO_STATE;
  const tenders: MultiPlatformTenderItem[] = result.tenders.map(tender => ({ ...tender, platformSource: 'PROZORRO_STATE', platformCategory: meta.category, platformName: meta.name, platformBadge: meta.badgeText, platformBadgeBgClass: meta.badgeBgClass, platformBadgeTextClass: meta.badgeTextClass, platformUrl: `https://prozorro.gov.ua/tender/${encodeURIComponent(tender.tenderId)}` }));
  if (options.sort === 'price_desc') tenders.sort((a, b) => (b.budgetUah || 0) - (a.budgetUah || 0));
  if (options.sort === 'price_asc') tenders.sort((a, b) => (a.budgetUah || 0) - (b.budgetUah || 0));
  return { tenders, telemetry: { totalReturned: tenders.length, stateProzorroCount: tenders.length, commercialCorporateCount: 0, socialFeedsCount: 0, durationMs: Date.now() - startedAt, selectedPlatforms, unsupportedPlatforms, nextOffset: result.telemetry.nextOffset || '' } };
}
