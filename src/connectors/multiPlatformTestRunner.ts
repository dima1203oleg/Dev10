/**
 * Multi-Platform Procurement Aggregator Test Runner
 * Validates cross-platform coverage across all 13 tender sources:
 * Prozorro, Prozorro.Sale, DOT Defense, SmartTender B2B, E-Tender Commercial, Prom.ua B2B,
 * DTEK Procurement, Metinvest B2B, Ukrnafta/Naftogaz, MHP, Facebook B2B, Telegram, LinkedIn.
 */

import { searchMultiPlatformTenders, PLATFORM_SOURCES_DIRECTORY, PlatformSourceId } from './multiPlatformAggregator';

export interface MultiPlatformTestResultItem {
  testId: string;
  category: 'PLATFORM_REGISTRY' | 'STATE_AGGREGATION' | 'DEFENSE_PROCUREMENT' | 'CORPORATE_B2B' | 'SOCIAL_FEEDS' | 'CROSS_SEARCH';
  title: string;
  status: 'PASS' | 'FAIL';
  details: string;
  metrics?: Record<string, any>;
}

export interface MultiPlatformTestSuiteReport {
  overallStatus: 'PASS' | 'FAIL';
  totalTests: number;
  passCount: number;
  failCount: number;
  durationMs: number;
  timestamp: string;
  results: MultiPlatformTestResultItem[];
}

export async function runMultiPlatformTestSuite(): Promise<MultiPlatformTestSuiteReport> {
  const startTime = Date.now();
  const results: MultiPlatformTestResultItem[] = [];

  // 1. TEST: Platform Directory Registry Completeness
  const registeredPlatforms = Object.keys(PLATFORM_SOURCES_DIRECTORY) as PlatformSourceId[];
  const hasAll13Platforms = registeredPlatforms.length === 13;
  const categoriesPresent = new Set(Object.values(PLATFORM_SOURCES_DIRECTORY).map(p => p.category));

  results.push({
    testId: 'MP-TEST-01-REGISTRY',
    category: 'PLATFORM_REGISTRY',
    title: 'Реєстр 13 майданчиків державних, корпоративних та соціальних закупівель',
    status: hasAll13Platforms && categoriesPresent.size === 4 ? 'PASS' : 'FAIL',
    details: `Знайдено ${registeredPlatforms.length}/13 зареєстрованих майданчиків у 4 категоріях (STATE, DEFENSE, CORPORATE, SOCIAL).`,
    metrics: { count: registeredPlatforms.length, categories: Array.from(categoriesPresent) }
  });

  // 2. TEST: Corporate B2B Platforms Search (DTEK, Metinvest, SmartTender, Prom.ua, Ukrnafta, MHP)
  try {
    const corporateResult = await searchMultiPlatformTenders(
      { keywords: ["кабель", "ремонт", "трансформатор"] },
      { selectedPlatforms: ['DTEK_ENTERPRISE', 'METINVEST_B2B', 'SMARTTENDER_B2B', 'PROM_B2B', 'NAFTOGAZ_UKRNAFTA', 'MHP_B2B'] }
    );

    const corporateCount = corporateResult.tenders.filter(t => t.platformCategory === 'CORPORATE').length;
    const passCorporate = corporateCount > 0;

    results.push({
      testId: 'MP-TEST-02-CORPORATE',
      category: 'CORPORATE_B2B',
      title: 'Агрегація корпоративних майданчиків (DTEK, Метінвест, SmartTender, Prom.ua, Нафтогаз, МХП)',
      status: passCorporate ? 'PASS' : 'FAIL',
      details: passCorporate 
        ? `Успішно агреговано ${corporateCount} корпоративних закупівлі з бізнес-порталів.`
        : 'Не вдалося завантажити корпоративні закупівлі.',
      metrics: { count: corporateCount, sample: corporateResult.tenders.slice(0, 2).map(t => ({ title: t.title, source: t.platformName })) }
    });
  } catch (err: any) {
    results.push({
      testId: 'MP-TEST-02-CORPORATE',
      category: 'CORPORATE_B2B',
      title: 'Агрегація корпоративних майданчиків',
      status: 'FAIL',
      details: `Помилка: ${err.message}`
    });
  }

  // 3. TEST: Defense & State Auctions (DOT Defense & Prozorro.Sale)
  try {
    const defenseResult = await searchMultiPlatformTenders(
      { keywords: ["БПЛА", "РЕБ", "харчування", "оренда"] },
      { selectedPlatforms: ['DEFENSE_DOT', 'PROZORRO_SALE'] }
    );

    const defenseCount = defenseResult.tenders.filter(t => t.platformSource === 'DEFENSE_DOT' || t.platformSource === 'PROZORRO_SALE').length;
    const passDefense = defenseCount > 0;

    results.push({
      testId: 'MP-TEST-03-DEFENSE-AUCTION',
      category: 'DEFENSE_PROCUREMENT',
      title: 'Оборонні закупівлі (ДП ДОТ МОУ) та аукціони Прозорро.Продажі',
      status: passDefense ? 'PASS' : 'FAIL',
      details: passDefense 
        ? `Знайдено ${defenseCount} спеціалізованих оборонних закупівель та майнових аукціонів.`
        : 'Не знайдено оборонних чи аукціонних закупівель.',
      metrics: { count: defenseCount }
    });
  } catch (err: any) {
    results.push({
      testId: 'MP-TEST-03-DEFENSE-AUCTION',
      category: 'DEFENSE_PROCUREMENT',
      title: 'Оборонні закупівлі та аукціони',
      status: 'FAIL',
      details: `Помилка: ${err.message}`
    });
  }

  // 4. TEST: Social Media & Messaging B2B Feeds (Facebook, Telegram, LinkedIn)
  try {
    const socialResult = await searchMultiPlatformTenders(
      { keywords: ["субпідряд", "ноутбук", "укриття"] },
      { selectedPlatforms: ['FACEBOOK_B2B_FEEDS', 'TELEGRAM_TENDER_CHANNELS', 'LINKEDIN_RFP'] }
    );

    const socialCount = socialResult.tenders.filter(t => t.platformCategory === 'SOCIAL').length;
    const passSocial = socialCount > 0;

    results.push({
      testId: 'MP-TEST-04-SOCIAL-FEEDS',
      category: 'SOCIAL_FEEDS',
      title: 'Стрічка закупівель з Facebook B2B, Telegram каналів та LinkedIn RFP',
      status: passSocial ? 'PASS' : 'FAIL',
      details: passSocial 
        ? `Успішно зчитано ${socialCount} прямих B2B замовлень та субпідрядів із соцмереж та месенджерів.`
        : 'Не вдалося агрегувати соціальні стрічки.',
      metrics: { count: socialCount, sampleContacts: socialResult.tenders.map(t => ({ person: t.contactPerson, phone: t.contactPhone })) }
    });
  } catch (err: any) {
    results.push({
      testId: 'MP-TEST-04-SOCIAL-FEEDS',
      category: 'SOCIAL_FEEDS',
      title: 'Стрічка закупівель із соцмереж',
      status: 'FAIL',
      details: `Помилка: ${err.message}`
    });
  }

  // 5. TEST: Cross-Platform Full Search & Scoring
  try {
    const fullResult = await searchMultiPlatformTenders(
      { keywords: ["укриття"] },
      { limit: 30 }
    );

    const total = fullResult.tenders.length;
    const hasMultipleCategories = new Set(fullResult.tenders.map(t => t.platformCategory)).size >= 3;

    results.push({
      testId: 'MP-TEST-05-CROSS-SEARCH',
      category: 'CROSS_SEARCH',
      title: 'Наскрізний мульти-майданчиковий пошук з ранжуванням релевантності',
      status: total > 0 && hasMultipleCategories ? 'PASS' : 'FAIL',
      details: `Успішно виконано об'єднаний пошук. Повернуто ${total} результатів із різних категорій майданчиків.`,
      metrics: fullResult.telemetry
    });
  } catch (err: any) {
    results.push({
      testId: 'MP-TEST-05-CROSS-SEARCH',
      category: 'CROSS_SEARCH',
      title: 'Наскрізний мульти-майданчиковий пошук',
      status: 'FAIL',
      details: `Помилка: ${err.message}`
    });
  }

  const failCount = results.filter(r => r.status === 'FAIL').length;
  const passCount = results.filter(r => r.status === 'PASS').length;
  const durationMs = Date.now() - startTime;

  return {
    overallStatus: failCount === 0 ? 'PASS' : 'FAIL',
    totalTests: results.length,
    passCount,
    failCount,
    durationMs,
    timestamp: new Date().toISOString(),
    results
  };
}
