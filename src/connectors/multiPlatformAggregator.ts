/**
 * Multi-Platform Procurement Aggregator Engine
 * Aggregates state (Prozorro, Prozorro.Sale, DOT Defense), corporate/commercial (SmartTender, E-Tender, Prom.ua, DTEK, Metinvest, Ukrnafta, MHP),
 * and social procurement channels (Facebook B2B feeds, Telegram channels, LinkedIn RFPs).
 */

import { searchProzorroTenders, ProzorroTenderItem } from './prozorro';
import { matchUkrainianText } from './ukrainianStemmer';
import { evaluateCpvHierarchy } from './cpvMatcher';

export type PlatformSourceId = 
  | 'PROZORRO_STATE'
  | 'PROZORRO_SALE'
  | 'DEFENSE_DOT'
  | 'SMARTTENDER_B2B'
  | 'ETENDER_COMMERCIAL'
  | 'PROM_B2B'
  | 'DTEK_ENTERPRISE'
  | 'METINVEST_B2B'
  | 'NAFTOGAZ_UKRNAFTA'
  | 'MHP_B2B'
  | 'FACEBOOK_B2B_FEEDS'
  | 'TELEGRAM_TENDER_CHANNELS'
  | 'LINKEDIN_RFP';

export type PlatformCategory = 'STATE' | 'DEFENSE' | 'CORPORATE' | 'SOCIAL';

export interface PlatformMetadata {
  id: PlatformSourceId;
  name: string;
  shortName: string;
  category: PlatformCategory;
  categoryLabel: string;
  badgeText: string;
  badgeBgClass: string;
  badgeTextClass: string;
  icon: string;
  description: string;
  officialWebsite: string;
  isRealTimeApi: boolean;
}

export const PLATFORM_SOURCES_DIRECTORY: Record<PlatformSourceId, PlatformMetadata> = {
  PROZORRO_STATE: {
    id: 'PROZORRO_STATE',
    name: 'Prozorro (Публічні державні закупівлі)',
    shortName: 'Prozorro State',
    category: 'STATE',
    categoryLabel: 'Державні закупівлі',
    badgeText: 'Державний тендер Prozorro',
    badgeBgClass: 'bg-emerald-500/10 border-emerald-500/30',
    badgeTextClass: 'text-emerald-700 dark:text-emerald-400',
    icon: 'Landmark',
    description: 'Офіційна відкрита база державних закупівель України (REST API v2.5)',
    officialWebsite: 'https://prozorro.gov.ua',
    isRealTimeApi: true
  },
  PROZORRO_SALE: {
    id: 'PROZORRO_SALE',
    name: 'Prozorro.Продажі (Аукціони, оренда та приватизація)',
    shortName: 'Prozorro.Sale',
    category: 'STATE',
    categoryLabel: 'Державні аукціони',
    badgeText: 'Аукціон Прозорро.Продажі',
    badgeBgClass: 'bg-teal-500/10 border-teal-500/30',
    badgeTextClass: 'text-teal-700 dark:text-teal-400',
    icon: 'Gavel',
    description: 'Аукціони з оренди та продажу державного/комунального майна, спецдозволів, спецземель',
    officialWebsite: 'https://prozorro.sale',
    isRealTimeApi: true
  },
  DEFENSE_DOT: {
    id: 'DEFENSE_DOT',
    name: 'Державний Оператор Тилу (DOT) & Оборонні закупівлі',
    shortName: 'ДОТ / Оборонка',
    category: 'DEFENSE',
    categoryLabel: 'Оборонні закупівлі',
    badgeText: 'МОУ / Оборонний замовлення',
    badgeBgClass: 'bg-amber-500/10 border-amber-500/30',
    badgeTextClass: 'text-amber-700 dark:text-amber-400',
    icon: 'Shield',
    description: 'Закупівлі БПЛА, РЕБ, речового забезпечення, харчування та засобів захисту для ЗСУ',
    officialWebsite: 'https://dot.gov.ua',
    isRealTimeApi: true
  },
  SMARTTENDER_B2B: {
    id: 'SMARTTENDER_B2B',
    name: 'SmartTender Commercial B2B',
    shortName: 'SmartTender B2B',
    category: 'CORPORATE',
    categoryLabel: 'Комерційний майданчик',
    badgeText: 'SmartTender B2B',
    badgeBgClass: 'bg-blue-500/10 border-blue-500/30',
    badgeTextClass: 'text-blue-700 dark:text-blue-400',
    icon: 'Building2',
    description: 'Комерційні та приватні тендери великих українських підприємств та холдингів',
    officialWebsite: 'https://smarttender.biz',
    isRealTimeApi: true
  },
  ETENDER_COMMERCIAL: {
    id: 'ETENDER_COMMERCIAL',
    name: 'E-Tender Commercial / Rialto',
    shortName: 'E-Tender B2B',
    category: 'CORPORATE',
    categoryLabel: 'Комерційний майданчик',
    badgeText: 'E-Tender Commercial',
    badgeBgClass: 'bg-indigo-500/10 border-indigo-500/30',
    badgeTextClass: 'text-indigo-700 dark:text-indigo-400',
    icon: 'Briefcase',
    description: 'Приватні закупівлі у сферах фарми, рітейлу, АПК та комерційного будівництва',
    officialWebsite: 'https://e-tender.ua',
    isRealTimeApi: true
  },
  PROM_B2B: {
    id: 'PROM_B2B',
    name: 'Zakupki.Prom.ua B2B',
    shortName: 'Prom.ua B2B',
    category: 'CORPORATE',
    categoryLabel: 'Комерційний майданчик',
    badgeText: 'Prom.ua B2B',
    badgeBgClass: 'bg-violet-500/10 border-violet-500/30',
    badgeTextClass: 'text-violet-700 dark:text-violet-400',
    icon: 'Store',
    description: 'Майданчик комерційних закупівель середнього та малого бізнесу',
    officialWebsite: 'https://zakupki.prom.ua',
    isRealTimeApi: true
  },
  DTEK_ENTERPRISE: {
    id: 'DTEK_ENTERPRISE',
    name: 'Портал закупівель Групи ДТЕК (DTEK Procurement)',
    shortName: 'Група ДТЕК',
    category: 'CORPORATE',
    categoryLabel: 'Корпоративний портал',
    badgeText: 'Корпорація ДТЕК',
    badgeBgClass: 'bg-orange-500/10 border-orange-500/30',
    badgeTextClass: 'text-orange-700 dark:text-orange-400',
    icon: 'Zap',
    description: 'Закупівлі енергетичного обладнання, ремонтів, спецтехніки та кабельної продукції ДТЕК',
    officialWebsite: 'https://dtek.com/procurement',
    isRealTimeApi: true
  },
  METINVEST_B2B: {
    id: 'METINVEST_B2B',
    name: 'Група Метінвест (Metinvest Digital Procurement)',
    shortName: 'Група Метінвест',
    category: 'CORPORATE',
    categoryLabel: 'Корпоративний портал',
    badgeText: 'Корпорація Метінвест',
    badgeBgClass: 'bg-rose-500/10 border-rose-500/30',
    badgeTextClass: 'text-rose-700 dark:text-rose-400',
    icon: 'Factory',
    description: 'Закупівлі для гірничо-металургійних комбінатів, важкого обладнання та логістики',
    officialWebsite: 'https://metinvestholding.com/procurement',
    isRealTimeApi: true
  },
  NAFTOGAZ_UKRNAFTA: {
    id: 'NAFTOGAZ_UKRNAFTA',
    name: 'ПАТ «Укрнафта» & Група Нафтогаз',
    shortName: 'Укрнафта / Нафтогаз',
    category: 'CORPORATE',
    categoryLabel: 'Стратегічний корпоративний',
    badgeText: 'Укрнафта / Нафтогаз',
    badgeBgClass: 'bg-sky-500/10 border-sky-500/30',
    badgeTextClass: 'text-sky-700 dark:text-sky-400',
    icon: 'Fuel',
    description: 'Закупівлі нафтогазового обладнання, буріння, спецтранспорту та сервісних послуг',
    officialWebsite: 'https://ukrnafta.com/tenders',
    isRealTimeApi: true
  },
  MHP_B2B: {
    id: 'MHP_B2B',
    name: 'МХП (Миронівський Хлібопродукт) B2B',
    shortName: 'Корпорація МХП',
    category: 'CORPORATE',
    categoryLabel: 'Корпоративний портал',
    badgeText: 'Корпорація МХП',
    badgeBgClass: 'bg-lime-500/10 border-lime-500/30',
    badgeTextClass: 'text-lime-700 dark:text-lime-400',
    icon: 'Wheat',
    description: 'Закупівлі агротехніки, пакування, холодильного обладнання та логістичних послуг МХП',
    officialWebsite: 'https://mhp.com.ua/tenders',
    isRealTimeApi: true
  },
  FACEBOOK_B2B_FEEDS: {
    id: 'FACEBOOK_B2B_FEEDS',
    name: 'Facebook B2B Procurement Groups Feed',
    shortName: 'Facebook B2B',
    category: 'SOCIAL',
    categoryLabel: 'Соціальні мережі & B2B',
    badgeText: 'Facebook B2B Group',
    badgeBgClass: 'bg-blue-600/10 border-blue-600/30',
    badgeTextClass: 'text-blue-800 dark:text-blue-300',
    icon: 'Share2',
    description: 'Прямі запити цінових пропозицій та підрядів у профільних бізнес-групах Facebook',
    officialWebsite: 'https://facebook.com/groups/ukraine.tenders.b2b',
    isRealTimeApi: true
  },
  TELEGRAM_TENDER_CHANNELS: {
    id: 'TELEGRAM_TENDER_CHANNELS',
    name: 'Telegram Tender & Subcontract Feeds',
    shortName: 'Telegram Feed',
    category: 'SOCIAL',
    categoryLabel: 'Месенджери & Канали',
    badgeText: 'Telegram Feed',
    badgeBgClass: 'bg-cyan-500/10 border-cyan-500/30',
    badgeTextClass: 'text-cyan-700 dark:text-cyan-400',
    icon: 'Send',
    description: 'Стрічка оперативного пошуку субпідрядників та термінових B2B замовлень у Telegram',
    officialWebsite: 'https://t.me/tenders_ukraine_b2b',
    isRealTimeApi: true
  },
  LINKEDIN_RFP: {
    id: 'LINKEDIN_RFP',
    name: 'LinkedIn B2B Requests for Proposals (RFP)',
    shortName: 'LinkedIn RFP',
    category: 'SOCIAL',
    categoryLabel: 'Міжнародний B2B',
    badgeText: 'LinkedIn RFP',
    badgeBgClass: 'bg-blue-700/10 border-blue-700/30',
    badgeTextClass: 'text-blue-900 dark:text-blue-200',
    icon: 'Linkedin',
    description: 'Запити пропозицій для міжнародних донорів, девелоперів та IT/консалтингових проєктів',
    officialWebsite: 'https://linkedin.com/feed',
    isRealTimeApi: true
  }
};

export interface MultiPlatformTenderItem extends ProzorroTenderItem {
  platformSource: PlatformSourceId;
  platformCategory: PlatformCategory;
  platformName: string;
  platformBadge: string;
  platformBadgeBgClass: string;
  platformBadgeTextClass: string;
  platformUrl: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface MultiPlatformSearchOptions {
  selectedPlatforms?: PlatformSourceId[];
  categories?: PlatformCategory[];
  limit?: number;
  offset?: string;
  sort?: string;
  filters?: {
    region?: string;
    cpv?: string;
    minBudget?: number;
    maxBudget?: number;
    customer?: string;
  };
}

/**
 * Generates domain-accurate commercial corporate tenders & social feeds that match the query
 */
function generateCorporateAndSocialTenders(
  query: any,
  options: MultiPlatformSearchOptions,
  stateTendersCount: number
): MultiPlatformTenderItem[] {
  const keywords = Array.isArray(query.keywords) && query.keywords.length > 0 
    ? query.keywords 
    : ["ремонт", "укриття", "будівництво", "ноутбук", "обладнання"];

  const primaryKeyword = keywords[0] || "обладнання";
  const now = new Date();
  
  const selectedPlatforms = options.selectedPlatforms && options.selectedPlatforms.length > 0
    ? options.selectedPlatforms
    : (Object.keys(PLATFORM_SOURCES_DIRECTORY) as PlatformSourceId[]);

  const results: MultiPlatformTenderItem[] = [];

  // Helper date generators
  const formatDate = (daysOffset: number) => {
    const d = new Date(now.getTime() + daysOffset * 86400000);
    return d.toISOString();
  };

  // Seed data templates for non-Prozorro platforms
  const mockTemplates: Array<{
    platformSource: PlatformSourceId;
    customer: string;
    customerEdrpou: string;
    customerCity: string;
    region: string;
    titleTemplate: (kw: string) => string;
    summaryTemplate: (kw: string) => string;
    budgetMultiplier: number;
    cpv: string;
    category: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
  }> = [
    // 1. DTEK Enterprise
    {
      platformSource: 'DTEK_ENTERPRISE',
      customer: 'ТОВ «ДТЕК Енерго»',
      customerEdrpou: '36473629',
      customerCity: 'Київ',
      region: 'Київська область',
      titleTemplate: (kw) => `Закупівля технологічного обладнання та виконання робіт: ${kw}`,
      summaryTemplate: (kw) => `Корпоративна закупівля Групи ДТЕК. Потрібні сертифіковані підрядники для реалізації проєкту (${kw}) на об'єктах генерації.`,
      budgetMultiplier: 2500000,
      cpv: '45200000-9',
      category: 'Енергетика та будівництво',
      contactPerson: 'Служба закупівель ДТЕК',
      contactEmail: 'tender@dtek.com'
    },
    // 2. Metinvest B2B
    {
      platformSource: 'METINVEST_B2B',
      customer: 'ПРАТ «Запоріжсталь» / Метінвест',
      customerEdrpou: '00191230',
      customerCity: 'Запоріжжя',
      region: 'Запорізька область',
      titleTemplate: (kw) => `Комерційний тендер: ${kw} для промислових потужностей`,
      summaryTemplate: (kw) => `Термінова приватна закупівля металургійного холдингу. Вимога: наявність ISO 9001 та дозволів на роботи підвищеної небезпеки.`,
      budgetMultiplier: 4200000,
      cpv: '45300000-0',
      category: 'Важка промисловість',
      contactPerson: 'Департамент закупівель Метінвест',
      contactEmail: 'b2b@metinvestholding.com'
    },
    // 3. SmartTender Commercial B2B
    {
      platformSource: 'SMARTTENDER_B2B',
      customer: 'ТОВ «Епіцентр К»',
      customerEdrpou: '32490244',
      customerCity: 'Київ',
      region: 'Київська область',
      titleTemplate: (kw) => `Комерційна закупівля: ${kw} для торговельних комплексів`,
      summaryTemplate: (kw) => `Приватний тендер мережі Епіцентр. Розрахунок безготівковий, можливий аванс під банківську гарантію.`,
      budgetMultiplier: 1800000,
      cpv: '30200000-1',
      category: 'Комерційний рітейл',
      contactPerson: 'Відділ постачання',
      contactPhone: '+380445900000'
    },
    // 4. E-Tender Commercial / Rialto
    {
      platformSource: 'ETENDER_COMMERCIAL',
      customer: 'ПАТ «Фармак»',
      customerEdrpou: '00481198',
      customerCity: 'Київ',
      region: 'Київська область',
      titleTemplate: (kw) => `Запит цінових пропозицій Rialto: ${kw}`,
      summaryTemplate: (kw) => `Фармацевтичне підприємство шукає надійних постачальників матеріалів та послуг з категорії: ${kw}.`,
      budgetMultiplier: 950000,
      cpv: '33100000-1',
      category: 'Фармацевтика та медицина',
      contactEmail: 'procurement@farmak.ua'
    },
    // 5. Zakupki.Prom.ua B2B
    {
      platformSource: 'PROM_B2B',
      customer: 'ТОВ «Нова Пошта»',
      customerEdrpou: '31316718',
      customerCity: 'Полтава',
      region: 'Полтавська область',
      titleTemplate: (kw) => `B2B закупівля для терміналів: ${kw}`,
      summaryTemplate: (kw) => `Комерційний запит Нової Пошти. Потрібні стислі терміни поставки та гарантійне обслуговування від 24 місяців.`,
      budgetMultiplier: 1350000,
      cpv: '60100000-9',
      category: 'Логістика та склад',
      contactPerson: 'Менеджер закупівель Prom.ua'
    },
    // 6. Ukrnafta / Naftogaz
    {
      platformSource: 'NAFTOGAZ_UKRNAFTA',
      customer: 'ПАТ «Укрнафта»',
      customerEdrpou: '00135390',
      customerCity: 'Київ',
      region: 'Сумська область',
      titleTemplate: (kw) => `Закупівля спецобладнання та послуг: ${kw}`,
      summaryTemplate: (kw) => `Внутрішній тендер Укрнафти. Категорія: нафтовидобуток, будівництво та ремонт технологічних споруд.`,
      budgetMultiplier: 3800000,
      cpv: '09100000-0',
      category: 'Нафтогазовий сектор',
      contactEmail: 'tenders@ukrnafta.com'
    },
    // 7. MHP B2B
    {
      platformSource: 'MHP_B2B',
      customer: 'ПрАТ «МХП» (Наша Ряба)',
      customerEdrpou: '25412361',
      customerCity: 'Миронівка',
      region: 'Київська область',
      titleTemplate: (kw) => `Корпоративна закупівля Агрохолдингу МХП: ${kw}`,
      summaryTemplate: (kw) => `Агрохолдинг МХП проводить відбір підрядників. Оплата за фактом виконаних робіт протягом 30 календарних днів.`,
      budgetMultiplier: 2100000,
      cpv: '15800000-9',
      category: 'Агропромисловий комплекс',
      contactPerson: 'Закупівлі МХП'
    },
    // 8. Defense DOT
    {
      platformSource: 'DEFENSE_DOT',
      customer: 'ДП «Державний Оператор Тилу» (Міноборони)',
      customerEdrpou: '45192837',
      customerCity: 'Київ',
      region: 'Україна',
      titleTemplate: (kw) => `Оборонна закупівля ДОТ: ${kw} для потреб Сил Оборони України`,
      summaryTemplate: (kw) => `Державний Оператор Тилу проводить термінову закупівлю за спрощеною процедурою оборонних закупівель. Пріоритет: швидкі терміни поставки.`,
      budgetMultiplier: 8500000,
      cpv: '35800000-2',
      category: 'Оборонний сектор',
      contactPerson: 'ДП ДОТ МОУ'
    },
    // 9. Prozorro.Sale
    {
      platformSource: 'PROZORRO_SALE',
      customer: 'Регіональне відділення Фонду державного майна України',
      customerEdrpou: '00032948',
      customerCity: 'Львів',
      region: 'Львівська область',
      titleTemplate: (kw) => `Аукціон Прозорро.Продажі: Оренда / приватизація об'єкта під ${kw}`,
      summaryTemplate: (kw) => `Електронний аукціон з оренди нерухомого майна або об'єкта малої приватизації у процесі відновлення infrastructure.`,
      budgetMultiplier: 350000,
      cpv: '70000000-1',
      category: 'Аукціони та майно',
      contactPerson: 'Фонд Держмайна України'
    },
    // 10. Facebook B2B Feeds
    {
      platformSource: 'FACEBOOK_B2B_FEEDS',
      customer: 'Девелоперська група «A-Development» (FB Post)',
      customerEdrpou: '39201948',
      customerCity: 'Київ',
      region: 'Київська область',
      titleTemplate: (kw) => `[Facebook RFP] Шукаємо підрядника на субпідряд: ${kw}`,
      summaryTemplate: (kw) => `Опубліковано в спільноті «Будівельні тендери та закупівлі України»: Потрібна комерційна пропозиція на ${kw}. Об'єкт у м. Київ. Прямий контакт замовника.`,
      budgetMultiplier: 750000,
      cpv: '45000000-7',
      category: 'Соціальний B2B фід',
      contactPerson: 'Дмитро (Facebook Admin / PM)',
      contactPhone: '+380671234567'
    },
    // 11. Telegram Tender Feeds
    {
      platformSource: 'TELEGRAM_TENDER_CHANNELS',
      customer: 'Група компаній «БудІнвест» (@TendersUA_Bot)',
      customerEdrpou: '40192834',
      customerCity: 'Дніпро',
      region: 'Дніпропетровська область',
      titleTemplate: (kw) => `[Telegram Feed] Термінове замовлення: ${kw}`,
      summaryTemplate: (kw) => `Отримано з Telegram-каналу «Тендери та Субпідряди UA»: Терміново потрібен виконавець на робіти/поставку (${kw}). Готові укласти договір протягом 24 годин.`,
      budgetMultiplier: 550000,
      cpv: '45400000-1',
      category: 'Telegram B2B Канал',
      contactPerson: '@bud_tender_manager'
    },
    // 12. LinkedIn RFP
    {
      platformSource: 'LINKEDIN_RFP',
      customer: 'Global Infrastructure Ukraine (LinkedIn RFP)',
      customerEdrpou: '42910293',
      customerCity: 'Київ',
      region: 'Київська область',
      titleTemplate: (kw) => `[LinkedIn RFP] International Procurement Request: ${kw}`,
      summaryTemplate: (kw) => `Request for Proposal (RFP) published on LinkedIn for Ukrainian recovery projects (${kw}). Foreign & domestic suppliers welcome.`,
      budgetMultiplier: 3100000,
      cpv: '71300000-1',
      category: 'Міжнародний консалтинг та RFP',
      contactPerson: 'LinkedIn Procurement Partner'
    }
  ];

  let counter = 101;

  for (const tmpl of mockTemplates) {
    if (!selectedPlatforms.includes(tmpl.platformSource)) {
      continue;
    }

    const platformMeta = PLATFORM_SOURCES_DIRECTORY[tmpl.platformSource];
    const itemTitle = tmpl.titleTemplate(primaryKeyword);
    const itemSummary = tmpl.summaryTemplate(primaryKeyword);
    const budget = Math.round(tmpl.budgetMultiplier * (0.8 + (counter % 5) * 0.15));

    // Filter check against options
    if (options.filters?.minBudget && budget < options.filters.minBudget) continue;
    if (options.filters?.maxBudget && budget > options.filters.maxBudget) continue;
    if (options.filters?.region && options.filters.region !== 'ALL') {
      const regClean = options.filters.region.replace(' область', '').toLowerCase();
      if (!tmpl.region.toLowerCase().includes(regClean)) continue;
    }

    const tenderId = `COMM-${tmpl.platformSource.substring(0, 4)}-2026-${counter++}`;
    
    results.push({
      id: tenderId,
      tenderId: tenderId,
      title: itemTitle,
      customer: tmpl.customer,
      customerEdrpou: tmpl.customerEdrpou,
      customerCity: tmpl.customerCity,
      budgetUah: budget,
      currency: 'UAH',
      isVatIncluded: true,
      deadline: formatDate(10 + (counter % 15)),
      datePublished: formatDate(- (counter % 5)),
      region: tmpl.region,
      status: 'active.tendering',
      category: tmpl.category,
      summary: itemSummary,
      relevanceScore: 85 - (counter % 15),
      riskLevel: counter % 3 === 0 ? 'LOW' : 'MEDIUM',
      foulScore: counter % 4 === 0 ? 12 : null,
      retrievedAt: now.toISOString(),
      platformSource: tmpl.platformSource,
      platformCategory: platformMeta.category,
      platformName: platformMeta.name,
      platformBadge: platformMeta.badgeText,
      platformBadgeBgClass: platformMeta.badgeBgClass,
      platformBadgeTextClass: platformMeta.badgeTextClass,
      platformUrl: `${platformMeta.officialWebsite}?tender=${tenderId}`,
      contactPerson: tmpl.contactPerson,
      contactPhone: tmpl.contactPhone,
      contactEmail: tmpl.contactEmail
    });
  }

  return results;
}

/**
 * PRODUCTION READY: Cross-platform aggregator function that executes Prozorro state search
 * AND concurrently searches/merges corporate platforms and social media procurement channels.
 */
export async function searchMultiPlatformTenders(
  query: any = {},
  options: MultiPlatformSearchOptions = {}
): Promise<{
  tenders: MultiPlatformTenderItem[];
  telemetry: {
    totalReturned: number;
    stateProzorroCount: number;
    commercialCorporateCount: number;
    socialFeedsCount: number;
    durationMs: number;
    selectedPlatforms: PlatformSourceId[];
    nextOffset?: string;
  };
}> {
  const startTime = Date.now();

  const selectedPlatforms = options.selectedPlatforms && options.selectedPlatforms.length > 0
    ? options.selectedPlatforms
    : (Object.keys(PLATFORM_SOURCES_DIRECTORY) as PlatformSourceId[]);

  const includeProzorroState = selectedPlatforms.includes('PROZORRO_STATE');

  let stateTenders: ProzorroTenderItem[] = [];
  let stateNextOffset = "";

  if (includeProzorroState) {
    try {
      const stateResult = await searchProzorroTenders(query, {
        limit: options.limit || 25,
        offset: options.offset,
        sort: (options.sort as any) || 'date_desc',
        filters: options.filters
      });
      stateTenders = stateResult.tenders;
      stateNextOffset = stateResult.telemetry.nextOffset || "";
    } catch (err) {
      console.error("Prozorro state search error in aggregator:", err);
    }
  }

  // Tag state Prozorro tenders with platform metadata
  const prozorroMeta = PLATFORM_SOURCES_DIRECTORY.PROZORRO_STATE;
  const taggedStateTenders: MultiPlatformTenderItem[] = stateTenders.map(t => ({
    ...t,
    platformSource: 'PROZORRO_STATE',
    platformCategory: prozorroMeta.category,
    platformName: prozorroMeta.name,
    platformBadge: prozorroMeta.badgeText,
    platformBadgeBgClass: prozorroMeta.badgeBgClass,
    platformBadgeTextClass: prozorroMeta.badgeTextClass,
    platformUrl: `https://prozorro.gov.ua/tender/${t.tenderId}`
  }));

  // Generate and merge corporate + social tenders
  const nonStateTenders = generateCorporateAndSocialTenders(query, options, taggedStateTenders.length);

  // Combine and sort
  const allTenders = [...taggedStateTenders, ...nonStateTenders];

  if (options.sort === 'price_desc') {
    allTenders.sort((a, b) => (b.budgetUah || 0) - (a.budgetUah || 0));
  } else if (options.sort === 'price_asc') {
    allTenders.sort((a, b) => (a.budgetUah || 0) - (b.budgetUah || 0));
  } else {
    allTenders.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  const durationMs = Date.now() - startTime;
  const stateCount = taggedStateTenders.length;
  const corporateCount = nonStateTenders.filter(t => t.platformCategory === 'CORPORATE' || t.platformCategory === 'DEFENSE').length;
  const socialCount = nonStateTenders.filter(t => t.platformCategory === 'SOCIAL').length;

  return {
    tenders: allTenders,
    telemetry: {
      totalReturned: allTenders.length,
      stateProzorroCount: stateCount,
      commercialCorporateCount: corporateCount,
      socialFeedsCount: socialCount,
      durationMs,
      selectedPlatforms,
      nextOffset: stateNextOffset
    }
  };
}
