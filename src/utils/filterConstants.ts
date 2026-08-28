/**
 * Filter Constants and Utilities for Tender Radar and Catalog
 * Provides exhaustive CPV categories, lifecycle stage matching, regions, and powerful filter helpers.
 */

import { Tender } from '../types';

export interface CpvCategory {
  code: string;
  prefix: string;
  name: string;
  shortName: string;
  icon?: string;
  keywords: string[];
}

export const CPV_CATEGORIES: CpvCategory[] = [
  {
    code: '45000000-7',
    prefix: '45',
    name: 'Будівельні роботи та поточний ремонт',
    shortName: 'Будівництво та ремонт',
    icon: 'Hammer',
    keywords: ['будівництво', 'капітальний ремонт', 'реконструкція', 'поточний ремонт', 'будівельні роботи', 'реставрація', 'покрівля', 'фасад']
  },
  {
    code: '71000000-8',
    prefix: '71',
    name: 'Архітектурні, будівельні, інженерні та інспекційні послуги',
    shortName: 'Проектування та інжиніринг',
    icon: 'Compass',
    keywords: ['проектування', 'проектно-кошторисна', 'технічний нагляд', 'авторський нагляд', 'експертиза', 'інженерні послуги', 'геодезія']
  },
  {
    code: '44000000-0',
    prefix: '44',
    name: 'Конструкції та будівельні матеріали; допоміжна будівельна продукція',
    shortName: 'Будівельні матеріали',
    icon: 'Layers',
    keywords: ['будівельні матеріали', 'бетон', 'цемент', 'арматура', 'металоконструкції', 'цегла', 'утеплювач', 'труби', 'кабель']
  },
  {
    code: '09000000-3',
    prefix: '09',
    name: 'Нафтопродукти, паливо, електроенергія та інші джерела енергії',
    shortName: 'Паливо та енергетика',
    icon: 'Zap',
    keywords: ['електроенергія', 'бензин', 'дизельне паливо', 'газ', 'дрова', 'пелети', 'паливо']
  },
  {
    code: '33000000-0',
    prefix: '33',
    name: 'Медичне обладнання, фармацевтична продукція та засоби особистої гігієни',
    shortName: 'Медицина та фармація',
    icon: 'Activity',
    keywords: ['медичне обладнання', 'лікарські засоби', 'фармацевтична', 'медикаменти', 'шприци', 'томограф', 'рентген']
  },
  {
    code: '30000000-9',
    prefix: '30',
    name: 'Офісна та комп’ютерна техніка, устаткування та приладдя',
    shortName: 'Комп’ютерна та оф. техніка',
    icon: 'Monitor',
    keywords: ['комп’ютери', 'ноутбуки', 'сервери', 'монітори', 'принтери', 'бфп', 'картриджі', 'канцтовари']
  },
  {
    code: '72000000-5',
    prefix: '72',
    name: 'Послуги у сфері інформаційних технологій: консультування, розробка, інтернет',
    shortName: 'IT-послуги та софт',
    icon: 'Code',
    keywords: ['програмне забезпечення', 'розробка', 'хостинг', 'підтримка', 'кібербезпека', 'ліцензії', 'it послуги']
  },
  {
    code: '60000000-8',
    prefix: '60',
    name: 'Транспортні послуги (крім транспортування відходів) та допоміжні послуги',
    shortName: 'Транспортні послуги',
    icon: 'Truck',
    keywords: ['перевезення', 'транспортування', 'пасажирські перевезення', 'вантажні перевезення', 'оренда техніки']
  },
  {
    code: '50000000-5',
    prefix: '50',
    name: 'Послуги з ремонту і технічного обслуговування',
    shortName: 'Ремонт та тех. обслуговування',
    icon: 'Wrench',
    keywords: ['технічне обслуговування', 'поточний ремонт обладнання', 'сервісне обслуговування', 'налагодження', 'діагностика']
  },
  {
    code: '34000000-7',
    prefix: '34',
    name: 'Транспортне обладнання та допоміжне приладдя до нього',
    shortName: 'Автотранспорт та спецтехніка',
    icon: 'Car',
    keywords: ['автомобілі', 'спецтехніка', 'трактори', 'екскаватори', 'автобуси', 'запчастини', 'шини']
  },
  {
    code: '35000000-4',
    prefix: '35',
    name: 'Обладнання для забезпечення безпеки, пожежне, військове та захисне',
    shortName: 'Безпека, пожежне, оборонне',
    icon: 'Shield',
    keywords: ['відеонагляд', 'пожежна сигналізація', 'вогнегасники', 'захисне спорядження', 'бронежилети', 'каски', 'укриття']
  },
  {
    code: '90000000-7',
    prefix: '90',
    name: 'Послуги у сфері поводження зі сміттям, каналізації та екології',
    shortName: 'Екологія, сміття, каналізація',
    icon: 'Trash2',
    keywords: ['вивезення сміття', 'утилізація відходів', 'прибирання', 'чищення каналізації', 'дезінфекція', 'дезінсекція']
  },
  {
    code: '80000000-4',
    prefix: '80',
    name: 'Освітні та навчальні послуги',
    shortName: 'Освіта та тренінги',
    icon: 'GraduationCap',
    keywords: ['навчання', 'підвищення кваліфікації', 'курси', 'тренінги', 'семінари']
  },
  {
    code: '55000000-0',
    prefix: '55',
    name: 'Послуги готелів та ресторанів, кейтеринг',
    shortName: 'Харчування та кейтеринг',
    icon: 'Utensils',
    keywords: ['гаряче харчування', 'кейтеринг', 'послуги їдалень', 'харчування учнів', 'проживання в готелі']
  },
  {
    code: '39000000-2',
    prefix: '39',
    name: 'Меблі, предмети інтер’єру, побутова техніка та засоби для чищення',
    shortName: 'Меблі та побутова техніка',
    icon: 'Armchair',
    keywords: ['меблі', 'парти', 'столи', 'шафи', 'побутова техніка', 'миючі засоби', 'пральні порошки']
  },
  {
    code: '31000000-6',
    prefix: '31',
    name: 'Електротехнічне устаткування, апаратура, генератори, акумулятори',
    shortName: 'Генератори та електрообладнання',
    icon: 'BatteryCharging',
    keywords: ['генератор', 'дизель-генератор', 'джерело безперебійного живлення', 'акумулятор', 'трансформатор', 'кабель', 'освітлення']
  },
  {
    code: '42000000-6',
    prefix: '42',
    name: 'Промислова техніка, котли, насоси та холодильне устаткування',
    shortName: 'Котли, насоси, промтехніка',
    icon: 'Cpu',
    keywords: ['котел', 'модульна котельня', 'насос', 'вентиляція', 'кондиціонер', 'холодильне обладнання']
  },
  {
    code: '18000000-9',
    prefix: '18',
    name: 'Одяг, взуття, спецодяг, текстильні вироби та аксесуари',
    shortName: 'Спецодяг та уніформа',
    icon: 'Shirt',
    keywords: ['спецодяг', 'робоче взуття', 'уніформа', 'текстиль', 'рукавиці', 'захисний одяг']
  },
  {
    code: '15000000-8',
    prefix: '15',
    name: 'Продукти харчування, напої, тютюн та супутня продукція',
    shortName: 'Продукти харчування',
    icon: 'Apple',
    keywords: ['м’ясо', 'молоко', 'хліб', 'овочі', 'фрукти', 'крупи', 'цукор', 'масло']
  },
  {
    code: '79000000-4',
    prefix: '79',
    name: 'Ділові послуги: юридичні, маркетингові, бухгалтерські, охоронні',
    shortName: 'Юридичні, охоронні, аудит',
    icon: 'Briefcase',
    keywords: ['охорона', 'послуги охорони', 'аудит', 'юридичні послуги', 'маркетинг', 'оцінка майна']
  }
];

export interface QuickClusterFilter {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  cpvPrefixes: string[];
  keywords: string[];
}

export const QUICK_CLUSTER_FILTERS: QuickClusterFilter[] = [
  {
    id: 'ALL',
    label: 'Всі напрямки',
    icon: 'Sparkles',
    cpvPrefixes: [],
    keywords: []
  },
  {
    id: 'SHELTERS',
    label: 'Укриття та захисні споруди',
    icon: 'Shield',
    badge: 'HOT',
    cpvPrefixes: ['45', '71', '35'],
    keywords: ['укриття', 'протирадіаційне', 'ппо', 'цивільний захист', 'сховище', 'захисна споруда', 'бомбосховище']
  },
  {
    id: 'CONSTRUCTION',
    label: 'Будівництво та капремонт',
    icon: 'Building2',
    cpvPrefixes: ['45'],
    keywords: ['будівництво', 'капітальний ремонт', 'реконструкція', 'будівельно-монтажні']
  },
  {
    id: 'ROADS',
    label: 'Дороги та штучні споруди',
    icon: 'Truck',
    cpvPrefixes: ['45'],
    keywords: ['дорожнє', 'асфальтобетон', 'поточний середній ремонт', 'міст', 'шляхопровід', 'автомобільна дорога', 'дорожнє покриття']
  },
  {
    id: 'DESIGN_ENGINEERING',
    label: 'Проектування та експертиза',
    icon: 'Compass',
    cpvPrefixes: ['71'],
    keywords: ['проектування', 'пкд', 'проектно-кошторисна', 'експертиза', 'технагляд', 'авторський нагляд']
  },
  {
    id: 'HOSPITALS',
    label: 'Лікарні та медичні заклади',
    icon: 'Activity',
    cpvPrefixes: ['45', '33', '71'],
    keywords: ['лікарня', 'амбулаторія', 'медичний', 'реабілітаційний центр', 'кнп', 'поліклініка', 'госпіталь']
  },
  {
    id: 'ENERGY_GENERATORS',
    label: 'Енергетика, генератори, СЕС',
    icon: 'Zap',
    badge: 'NEW',
    cpvPrefixes: ['09', '31', '42', '45'],
    keywords: ['генератор', 'сонячна електростанція', 'котельня', 'трансформатор', 'енергоефективність', 'електропостачання', 'дбж']
  },
  {
    id: 'IT_TELECOM',
    label: 'IT, софт та телеком',
    icon: 'Code',
    cpvPrefixes: ['72', '30', '48', '64'],
    keywords: ['програмне забезпечення', 'сервер', 'комп’ютер', 'відеонагляд', 'локальна мережа', 'зв’язок', 'іт-послуги']
  },
  {
    id: 'MATERIALS',
    label: 'Будівельні матеріали та вироби',
    icon: 'Layers',
    cpvPrefixes: ['44'],
    keywords: ['бетон', 'арматура', 'цемент', 'конструкції', 'матеріали', 'цегла', 'труби']
  },
  {
    id: 'SCHOOLS_KINDERGARTENS',
    label: 'Школи та садочки',
    icon: 'GraduationCap',
    cpvPrefixes: ['45', '71', '39'],
    keywords: ['школа', 'гімназія', 'ліцей', 'дитячий садок', 'здо', 'ззсо', 'освітній заклад']
  }
];

export const UKRAINE_REGIONS = [
  'Всі регіони України',
  'Київ (м. Київ)',
  'Київська область',
  'Львівська область',
  'Дніпропетровська область',
  'Одеська область',
  'Харківська область',
  'Полтавська область',
  'Вінницька область',
  'Запорізька область',
  'Івано-Франківська область',
  'Закарпатська область',
  'Волинська область',
  'Рівненська область',
  'Житомирська область',
  'Чернігівська область',
  'Сумська область',
  'Черкаська область',
  'Кіровоградська область',
  'Хмельницька область',
  'Тернопільська область',
  'Чернівецька область',
  'Миколаївська область',
  'Херсонська область',
  'Донецька область',
  'Луганська область'
];

/**
 * Tender Lifecycle Stages
 * Covers user requirement:
 * "має бути всі які старі які нові які вже виграні які переігруються"
 */
export type LifecycleStage = 
  | 'ALL'
  | 'NEW_ACTIVE'           // Нові та активні (подання пропозицій)
  | 'WON_AWARDED'          // Виграні / Кваліфікація переможця / Очікує підписання договору
  | 'RETENDERED_CANCELLED' // Переігруються / Відмінені / Неуспішні / Оскаржені в АМКУ
  | 'OLD_COMPLETED';       // Старі / Завершені процедури (архів, виконані договори)

export interface LifecycleTab {
  id: LifecycleStage;
  label: string;
  icon: string;
  badgeColor: string;
  description: string;
}

export const LIFECYCLE_TABS: LifecycleTab[] = [
  {
    id: 'ALL',
    label: 'Всі закупівлі',
    icon: 'Layers',
    badgeColor: 'bg-slate-800 text-slate-300',
    description: 'Всі наявні закупівлі без обмеження за стадією'
  },
  {
    id: 'NEW_ACTIVE',
    label: '🟢 Нові та активні',
    icon: 'Flame',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    description: 'Триває прийом пропозицій (активні торги)'
  },
  {
    id: 'WON_AWARDED',
    label: '🏆 Виграні / Кваліфікація',
    icon: 'Trophy',
    badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    description: 'Визначено переможця, очікує підписання договору'
  },
  {
    id: 'RETENDERED_CANCELLED',
    label: '🔄 Переігруються / Скасовані',
    icon: 'RefreshCw',
    badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    description: 'Скасовані замовником, неуспішні або на повторному розіграші'
  },
  {
    id: 'OLD_COMPLETED',
    label: '🕒 Старі / Завершені',
    icon: 'Archive',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    description: 'Успішно виконані архівні закупівлі'
  }
];

export const SUB_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Всі підстатуси' },
  { value: 'active.tendering', label: '🟢 Подання пропозицій (active.tendering)' },
  { value: 'active.enquiries', label: '💬 Період уточнень (active.enquiries)' },
  { value: 'active.auction', label: '⚡ Аукціон (active.auction)' },
  { value: 'active.qualification', label: '🏆 Кваліфікація переможця (active.qualification)' },
  { value: 'active.awarded', label: '📝 Очікує підписання договору (active.awarded)' },
  { value: 'complete', label: '✅ Успішно завершено / Договір діє (complete)' },
  { value: 'cancelled', label: '❌ Скасовано замовником (cancelled)' },
  { value: 'unsuccessful', label: '🔄 Не відбулися / Переігрується (unsuccessful)' },
  { value: 'AMCU_FILED', label: '⚖️ Оскаржено в АМКУ / Призупинено' }
];

export const BUDGET_PRESETS = [
  { label: 'Будь-який бюджет', min: 0, max: 1000000000 },
  { label: 'До 1 млн ₴', min: 0, max: 1000000 },
  { label: '1 млн - 5 млн ₴', min: 1000000, max: 5000000 },
  { label: '5 млн - 20 млн ₴', min: 5000000, max: 20000000 },
  { label: '20 млн - 50 млн ₴', min: 20000000, max: 50000000 },
  { label: '50 млн - 100 млн ₴', min: 50000000, max: 100000000 },
  { label: '100+ млн ₴ (Mega)', min: 100000000, max: 1000000000 }
];

export const DEADLINE_PRESETS = [
  { id: 'ALL', label: 'Будь-який дедлайн' },
  { id: 'URGENT_3D', label: '🔥 Гарячі (до 3 днів / 72 год)' },
  { id: 'THIS_WEEK', label: '⏳ Цього тижня (до 7 днів)' },
  { id: 'NEXT_2W', label: '📅 До 14 днів' },
  { id: 'MORE_14D', label: '🗓️ Більше 14 днів' },
  { id: 'NEW_RECENT', label: '🆕 Опубліковані за 3 дні' },
  { id: 'ARCHIVE_OLD', label: '🏛️ Архівні / Минулі' }
];

export const RISK_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Всі рівні ризику' },
  { value: 'CLEAN', label: '🟢 Чисті торги (Foul Score < 30)' },
  { value: 'MEDIUM_RISK', label: '🟡 Помірний ризик (Foul Score 30 - 59)' },
  { value: 'HIGH_RISK', label: '🔴 Високий ризик / Заточки ТД (Foul Score ≥ 60)' },
  { value: 'WITH_VIOLATIONS', label: '⚠️ Тільки з виявленими порушеннями' }
];

export const SORT_OPTIONS = [
  { value: 'match_desc', label: '🎯 За Match Score (Найвища відповідність)' },
  { value: 'date_desc', label: '⚡ За датою публікації (Новіші спочатку)' },
  { value: 'date_asc', label: '⌛ За датою публікації (Старіші спочатку)' },
  { value: 'deadline_asc', label: '⏰ За дедлайном (Найближчий спочатку)' },
  { value: 'price_desc', label: '💰 За бюджетом (Спочатку дорожчі)' },
  { value: 'price_asc', label: '💵 За бюджетом (Спочатку дешевші)' },
  { value: 'risk_asc', label: '🛡️ За безпекою (Найменший ризик)' },
  { value: 'risk_desc', label: '🚨 За ризиком (Найвищий Foul Score)' }
];

/**
 * Determines normalized lifecycle category for a tender
 */
export function getTenderLifecycleStage(tender: Tender): LifecycleStage {
  if (tender.stage) {
    if (tender.stage === 'NEW' || tender.stage === 'ACTIVE') return 'NEW_ACTIVE';
    if (tender.stage === 'WON') return 'WON_AWARDED';
    if (tender.stage === 'RETENDERED' || tender.stage === 'CANCELLED') return 'RETENDERED_CANCELLED';
    if (tender.stage === 'OLD') return 'OLD_COMPLETED';
  }

  const raw = (tender.rawStatus || tender.status || '').toLowerCase();

  // Re-tendered, Cancelled, Unsuccessful, AMCU disputes
  if (
    raw.includes('cancel') ||
    raw.includes('unsuccessful') ||
    raw.includes('retender') ||
    raw.includes('переігр') ||
    raw.includes('скасов') ||
    tender.status === 'CANCELLED' ||
    tender.status === 'UNSUCCESSFUL' ||
    tender.status === 'RETENDERED' ||
    tender.status === 'AMCU_FILED'
  ) {
    return 'RETENDERED_CANCELLED';
  }

  // Won / Qualification / Awarded
  if (
    raw.includes('qualification') ||
    raw.includes('awarded') ||
    raw.includes('award') ||
    raw.includes('перемож') ||
    raw.includes('кваліфікац') ||
    tender.status === 'WON' ||
    tender.status === 'AWARDED' ||
    tender.status === 'QUALIFICATION'
  ) {
    return 'WON_AWARDED';
  }

  // Old / Completed / Archived
  if (
    raw.includes('complete') ||
    raw.includes('archive') ||
    raw.includes('завершен') ||
    tender.status === 'COMPLETED' ||
    tender.status === 'OLD'
  ) {
    return 'OLD_COMPLETED';
  }

  // Active / New
  return 'NEW_ACTIVE';
}

/**
 * Check if a tender matches the lifecycle stage filter
 */
export function matchesLifecycleFilter(tender: Tender, stageFilter: LifecycleStage): boolean {
  if (stageFilter === 'ALL') return true;
  return getTenderLifecycleStage(tender) === stageFilter;
}

/**
 * Returns human-readable status badge info
 */
export function getTenderStatusBadge(tender: Tender): { label: string; bg: string; text: string; border: string; icon: string } {
  const stage = getTenderLifecycleStage(tender);
  const raw = (tender.rawStatus || tender.status || '').toLowerCase();

  if (stage === 'RETENDERED_CANCELLED') {
    if (tender.status === 'AMCU_FILED') {
      return {
        label: '⚖️ Оскаржено в АМКУ',
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        icon: 'Scale'
      };
    }
    if (raw.includes('cancel')) {
      return {
        label: '❌ Скасовано / Переграш',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        icon: 'XCircle'
      };
    }
    return {
      label: '🔄 Переігрується (Retender)',
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      icon: 'RefreshCw'
    };
  }

  if (stage === 'WON_AWARDED') {
    if (raw.includes('award') || tender.status === 'AWARDED') {
      return {
        label: '🏆 Виграно / Підписання',
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-300',
        border: 'border-emerald-500/30',
        icon: 'Trophy'
      };
    }
    return {
      label: '📋 Кваліфікація переможця',
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
      border: 'border-amber-500/30',
      icon: 'CheckCircle2'
    };
  }

  if (stage === 'OLD_COMPLETED') {
    return {
      label: '✅ Успішно завершено',
      bg: 'bg-slate-800',
      text: 'text-slate-400',
      border: 'border-slate-700',
      icon: 'Archive'
    };
  }

  // Active
  if (raw.includes('auction')) {
    return {
      label: '⚡ Аукціон',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: 'Zap'
    };
  }

  return {
    label: '🟢 Прийом пропозицій',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    icon: 'Flame'
  };
}
