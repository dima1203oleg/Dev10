/**
 * Prozorro Connector & Search Technology Comprehensive Test Runner
 * Validates stemming, scoring, CPV hierarchy, subject-context separation, negative keywords,
 * company profile radar matching, and live API connection integrity.
 */

import { extractAndExpandKeywords, matchUkrainianText, stemUkrainianWord } from './ukrainianStemmer';
import { evaluateCpvHierarchy } from './cpvMatcher';
import { calculateTenderRelevanceScore, executeAdvancedProzorroSearch } from './prozorroSearchEngine';

export interface TestResultItem {
  testId: string;
  category: 'STEMMING' | 'SCORING' | 'CPV_MATCHING' | 'NEGATIVE_KEYWORDS' | 'RADAR_FIT' | 'LIVE_API_PAGINATION';
  title: string;
  status: 'PASS' | 'FAIL';
  details: string;
  metrics?: Record<string, any>;
}

export interface FullProzorroTestSuiteReport {
  overallStatus: 'PASS' | 'FAIL' | 'DEGRADED';
  totalTests: number;
  passCount: number;
  failCount: number;
  durationMs: number;
  timestamp: string;
  results: TestResultItem[];
}

export async function runProzorroConnectorTestSuite(): Promise<FullProzorroTestSuiteReport> {
  const startTime = Date.now();
  const results: TestResultItem[] = [];

  // 1. TEST: Stemming & Morphological Normalization
  try {
    const stemNoctbook = stemUkrainianWord("ноутбуків");
    const stemUkryttya = stemUkrainianWord("укриттях");
    const stemRemont = stemUkrainianWord("ремонтні");

    const expansion = extractAndExpandKeywords("укриття для шкіл");

    const hasInfectedMatch = matchUkrainianText("Закупівля портативних комп'ютерів та ноутбуків", "ноутбук");

    const passStem = 
      stemNoctbook.includes("ноутбук") &&
      stemUkryttya.includes("укрит") &&
      expansion.expandedTerms.some(t => t.includes("сховище") || t.includes("вкритт")) &&
      hasInfectedMatch.matched;

    results.push({
      testId: 'TEST-01-STEMMING',
      category: 'STEMMING',
      title: 'Український морфологічний стемінг та розширення синонімів',
      status: passStem ? 'PASS' : 'FAIL',
      details: passStem 
        ? `Успішно нормалізовано відмінки ('ноутбуків' -> '${stemNoctbook}', 'укриттях' -> '${stemUkryttya}') та розширено синоніми ('укриття' -> сховище/вкриття).`
        : `Помилка стемінгу: ноутбуків -> ${stemNoctbook}, укриттях -> ${stemUkryttya}`,
      metrics: { stemNoctbook, stemUkryttya, stemRemont, expandedTerms: expansion.expandedTerms }
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST-01-STEMMING',
      category: 'STEMMING',
      title: 'Український морфологічний стемінг та розширення синонімів',
      status: 'FAIL',
      details: `Виключення під час перевірки стемінгу: ${err.message}`
    });
  }

  // 2. TEST: Subject vs Context Scoring & Relevance Ranking
  try {
    const query = { keywords: ["ноутбук", "школа"] };

    // Item A: Direct Subject Match
    const tenderA = {
      title: "Закупівля ноутбуків для закладів загальної середньої освіти (шкіл)",
      description: "Персональні портативні комп'ютери для навчального процесу",
      items: [{ classification: { id: "30213100-6", description: "Портативні комп'ютери" } }]
    };

    // Item B: Wrong Subject, Context Match
    const tenderB = {
      title: "Послуги з кейтерингу та харчування для шкіл",
      description: "Гаряче харчування учнів молодших класів",
      items: [{ classification: { id: "55520000-1", description: "Кейтерингові послуги" } }]
    };

    const resA = calculateTenderRelevanceScore(tenderA, query);
    const resB = calculateTenderRelevanceScore(tenderB, query);

    const passScoring = !resA.isExcluded && resA.score >= 70 && (resB.isExcluded || resA.score > resB.score);

    results.push({
      testId: 'TEST-02-SCORING',
      category: 'SCORING',
      title: 'Релевантність пошуку та розділення Предмету і Контексту',
      status: passScoring ? 'PASS' : 'FAIL',
      details: passScoring
        ? `Закупівля предмету (ноутбуки) отримала бал ${resA.score}, а закупівля харчування для шкіл отримала ${resB.score} (або відфільтрована).`
        : `Помилка ранжування: Предмет = ${resA.score}, Не відповідний предмет = ${resB.score}`,
      metrics: { scoreTenderA: resA.score, scoreTenderB: resB.score, breakdownA: resA.breakdown }
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST-02-SCORING',
      category: 'SCORING',
      title: 'Релевантність пошуку та розділення Предмету і Контексту',
      status: 'FAIL',
      details: `Помилка тесту скорингу: ${err.message}`
    });
  }

  // 3. TEST: CPV Hierarchy Depth Matcher
  try {
    const cpvExact = evaluateCpvHierarchy("45214200-2", "45214200-2");
    const cpvCategory = evaluateCpvHierarchy("45214200-2", "45214000-0");
    const cpvClass = evaluateCpvHierarchy("45214200-2", "45210000-2");
    const cpvDivision = evaluateCpvHierarchy("45214200-2", "45000000-7");
    const cpvUnrelated = evaluateCpvHierarchy("45214200-2", "30210000-4");

    const passCpv = 
      cpvExact.score === 100 &&
      cpvCategory.score === 90 &&
      cpvClass.score === 80 &&
      cpvDivision.score === 30 &&
      cpvUnrelated.score === 0;

    results.push({
      testId: 'TEST-03-CPV',
      category: 'CPV_MATCHING',
      title: 'Ієрархічний CPV-класифікатор (ДК 021:2015)',
      status: passCpv ? 'PASS' : 'FAIL',
      details: passCpv
        ? "Точна перевірка глибини CPV: 8 цифр = 100%, Категорія (5 цифр) = 90%, Клас (4 цифри) = 80%, Розділ = 30%, Різні галузі = 0%."
        : `Помилка розрахунку CPV ієрархії: Exact=${cpvExact.score}, Category=${cpvCategory.score}, Class=${cpvClass.score}`,
      metrics: { exact: cpvExact.score, category: cpvCategory.score, classScore: cpvClass.score, division: cpvDivision.score, unrelated: cpvUnrelated.score }
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST-03-CPV',
      category: 'CPV_MATCHING',
      title: 'Ієрархічний CPV-класифікатор (ДК 021:2015)',
      status: 'FAIL',
      details: `Помилка перевірки CPV: ${err.message}`
    });
  }

  // 4. TEST: Negative Keywords Exclusion Filter
  try {
    const tender = {
      title: "Поточний ремонт приміщень та побутове прибирання укриття",
      description: "Послуги з генерального побутового дезінфікування",
      items: [{ classification: { id: "90910000-9", description: "Послуги з прибирання" } }]
    };

    const queryWithNeg = {
      keywords: ["укриття"],
      negativeKeywords: ["побутове"]
    };

    const resNeg = calculateTenderRelevanceScore(tender, queryWithNeg);
    const passNeg = resNeg.isExcluded && resNeg.exclusionReason?.includes("побутове");

    results.push({
      testId: 'TEST-04-NEGATIVE',
      category: 'NEGATIVE_KEYWORDS',
      title: 'Мінус-слова та виключення небажаних тендерів',
      status: passNeg ? 'PASS' : 'FAIL',
      details: passNeg
        ? "Тендер успішно відфільтровано через наявність мінус-слова 'побутове'."
        : "Помилка мінус-слів: тендер з мінус-словом не відфільтровано",
      metrics: { isExcluded: resNeg.isExcluded, reason: resNeg.exclusionReason }
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST-04-NEGATIVE',
      category: 'NEGATIVE_KEYWORDS',
      title: 'Мінус-слова та виключення небажаних тендерів',
      status: 'FAIL',
      details: `Помилка перевірки мінус-слів: ${err.message}`
    });
  }

  // 5. TEST: Company Radar Personal Fit Score
  // A fit score is only meaningful for an authenticated, persisted company profile
  // and a live tender. This connector self-test has no such context, so it must not
  // invent a profile/tender fixture or claim a production score.
  results.push({
    testId: 'TEST-05-RADAR',
    category: 'RADAR_FIT',
    title: 'Персональний скоринг відповідності компанії (Radar Match)',
    status: 'FAIL',
    details: 'Не виконано: self-test не має live company profile і tender context; запустіть Radar для збережених tenant-даних.',
  });

  // 6. TEST: Live Prozorro API Search, Pagination & Deduplication
  try {
    const searchRes = await executeAdvancedProzorroSearch(
      { keywords: ["послуги", "ремонт", "обладнання", "постачання", "укриття"] },
      { limit: 10, maxPages: 2 }
    );

    const isSuccess = searchRes.telemetry.sourceStatus === 'SUCCESS' || searchRes.telemetry.sourceStatus === 'PARTIAL';
    const returnedCount = searchRes.tenders.length;
    const hasNextOffset = !!searchRes.telemetry.nextOffset;

    let paginationPass = false;

    if (isSuccess && returnedCount > 0 && hasNextOffset) {
      // Test page 2 fetching with nextOffset cursor to verify deduplication
      const page2Res = await executeAdvancedProzorroSearch(
        { keywords: ["послуги", "ремонт", "обладнання", "постачання", "укриття"] },
        { limit: 10, offset: searchRes.telemetry.nextOffset, maxPages: 2 }
      );

      const p1Ids = new Set(searchRes.tenders.map(t => t.id));
      const duplicates = page2Res.tenders.filter(t => p1Ids.has(t.id));

      paginationPass = duplicates.length === 0;
    }

    const passLive = isSuccess && returnedCount > 0 && paginationPass;

    results.push({
      testId: 'TEST-06-LIVE_API',
      category: 'LIVE_API_PAGINATION',
      title: 'Живе Prozorro API: Пошук, Пагінація та Відсутність Дублікатів',
      status: passLive ? 'PASS' : 'FAIL',
      details: passLive
        ? `Отримано ${returnedCount} актуальних тендерів з Prozorro API за ${searchRes.telemetry.durationMs}мс. Курсорну пагінацію перевірено, 0 дублікатів між сторінками.`
        : `Проблема з Prozorro API: Статус ${searchRes.telemetry.sourceStatus}, знайдено ${returnedCount} записів, Пагінація без дублікатів = ${paginationPass}`,
      metrics: {
        latencyMs: searchRes.telemetry.durationMs,
        recordsFetched: searchRes.telemetry.recordsFetched,
        recordsReturned: returnedCount,
        nextOffset: searchRes.telemetry.nextOffset
      }
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST-06-LIVE_API',
      category: 'LIVE_API_PAGINATION',
      title: 'Живе Prozorro API: Пошук, Пагінація та Відсутність Дублікатів',
      status: 'FAIL',
      details: `Помилка підключення до Prozorro API: ${err.message}`
    });
  }

  const failCount = results.filter(r => r.status === 'FAIL').length;
  const passCount = results.filter(r => r.status === 'PASS').length;
  const totalTests = results.length;
  const durationMs = Date.now() - startTime;

  return {
    overallStatus: failCount === 0 ? 'PASS' : (passCount > 0 ? 'DEGRADED' : 'FAIL'),
    totalTests,
    passCount,
    failCount,
    durationMs,
    timestamp: new Date().toISOString(),
    results
  };
}
