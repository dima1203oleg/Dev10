import { PLATFORM_SOURCES_DIRECTORY, searchMultiPlatformTenders, type PlatformSourceId } from './multiPlatformAggregator';

export interface MultiPlatformTestResultItem { testId: string; category: 'PLATFORM_REGISTRY' | 'STATE_AGGREGATION' | 'DEFENSE_PROCUREMENT' | 'CORPORATE_B2B' | 'SOCIAL_FEEDS' | 'CROSS_SEARCH'; title: string; status: 'PASS' | 'FAIL'; details: string; metrics?: Record<string, any> }
export interface MultiPlatformTestSuiteReport { overallStatus: 'PASS' | 'FAIL'; totalTests: number; passCount: number; failCount: number; durationMs: number; timestamp: string; results: MultiPlatformTestResultItem[] }

export async function runMultiPlatformTestSuite(): Promise<MultiPlatformTestSuiteReport> {
  const startedAt = Date.now();
  const registered = Object.keys(PLATFORM_SOURCES_DIRECTORY) as PlatformSourceId[];
  const active = registered.filter(id => PLATFORM_SOURCES_DIRECTORY[id].availability === 'ACTIVE');
  const results: MultiPlatformTestResultItem[] = [{
    testId: 'MP-REGISTRY-01', category: 'PLATFORM_REGISTRY', title: 'Реєстр джерел не маскує неінтегровані API',
    status: active.length === 1 && active[0] === 'PROZORRO_STATE' ? 'PASS' : 'FAIL',
    details: `Активні джерела: ${active.join(', ') || 'немає'}; решта позначені NOT_INTEGRATED.`, metrics: { registered: registered.length, active },
  }];
  try {
    const unavailable = await searchMultiPlatformTenders({ keywords: ['будівництво'] }, { selectedPlatforms: ['SMARTTENDER_B2B', 'FACEBOOK_B2B_FEEDS'] });
    results.push({ testId: 'MP-NO-FABRICATION-02', category: 'CROSS_SEARCH', title: 'Неінтегровані джерела не генерують записи', status: unavailable.tenders.length === 0 ? 'PASS' : 'FAIL', details: `Повернуто ${unavailable.tenders.length} записів; очікується 0.`, metrics: unavailable.telemetry });
  } catch (error) {
    results.push({ testId: 'MP-NO-FABRICATION-02', category: 'CROSS_SEARCH', title: 'Неінтегровані джерела не генерують записи', status: 'FAIL', details: String(error) });
  }
  const failCount = results.filter(result => result.status === 'FAIL').length;
  return { overallStatus: failCount ? 'FAIL' : 'PASS', totalTests: results.length, passCount: results.length - failCount, failCount, durationMs: Date.now() - startedAt, timestamp: new Date().toISOString(), results };
}
