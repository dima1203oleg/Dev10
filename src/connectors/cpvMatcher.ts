/**
 * CPV (Common Procurement Vocabulary ДК 021:2015) Hierarchical Matcher & Classifier
 */

export interface CPVMatchResult {
  cpvCode: string;
  matchedCpvCode: string;
  depth: 'EXACT_8_DIGIT' | 'CATEGORY_5_DIGIT' | 'CLASS_4_DIGIT' | 'GROUP_3_DIGIT' | 'DIVISION_2_DIGIT' | 'NONE';
  score: number; // 0 to 100
  description?: string;
}

// Major CPV Divisions and Classes with Ukrainian labels
export const COMMON_CPV_DIRECTORY: Record<string, string> = {
  "45000000": "Будівельні роботи та поточний ремонт",
  "45200000": "Роботи з зведення будівель та цивільного будівництва",
  "45210000": "Будівництво будівель",
  "45214000": "Будівництво навчальних та дослідницьких закладів",
  "45214200": "Будівництво шкіл та навчальних закладів",
  "45215000": "Будівництво закладів охорони здоров'я та лікарень",
  "45220000": "Інженерні та будівельні роботи",
  "45230000": "Будівництво трубопроводів, ліній зв'язку та електропередач, шосе, доріг",
  "45260000": "Покрівельні роботи та інші спеціалізовані будівельні роботи",
  "45300000": "Будівельно-монтажні роботи",
  "45310000": "Електромонтажні роботи",
  "45330000": "Водопровідні та санітарно-технічні роботи",
  "45400000": "Завершальні будівельні роботи (оздоблення)",
  "45450000": "Інші завершальні будівельні роботи",
  "30200000": "Комп'ютерне обладнання та приладдя",
  "30210000": "Машини для обробки даних (апаратна частина)",
  "30213000": "Персональні комп'ютери та ноутбуки",
  "30213100": "Портативні комп'ютери (ноутбуки)",
  "33100000": "Медичне обладнання",
  "33600000": "Фармацевтична продукція (лікарські засоби)",
  "09100000": "Палива",
  "09130000": "Нафта і дистиляти (бензин, дизель)",
  "09310000": "Електрична енергія",
  "09320000": "Пара, гаряча вода та пов'язана продукція",
  "15800000": "Різні продукти харчування",
  "60100000": "Послуги автомобільного транспорту",
  "71200000": "Архітектурні та пов'язані послуги (проектування)",
  "71300000": "Інженерні послуги (технагляд, авторський нагляд)",
  "72200000": "Послуги з розробки програмного забезпечення",
  "90500000": "Послуги, пов'язані з відходами та сміттям",
  "90900000": "Послуги з прибирання та санітарного очищення"
};

/**
 * Normalizes a CPV code string into a clean 8-digit numeric string.
 * Example: "45214200-2" -> "45214200"
 */
export function normalizeCpvCode(rawCpv: string): string {
  if (!rawCpv) return "";
  const cleaned = rawCpv.split("-")[0].replace(/\D/g, "");
  return cleaned.padEnd(8, "0").substring(0, 8);
}

/**
 * Evaluates the hierarchical match between a tender CPV and a candidate/company CPV.
 */
export function evaluateCpvHierarchy(tenderCpvRaw: string, targetCpvRaw: string): CPVMatchResult {
  const tenderCpv = normalizeCpvCode(tenderCpvRaw);
  const targetCpv = normalizeCpvCode(targetCpvRaw);

  if (!tenderCpv || !targetCpv) {
    return { cpvCode: tenderCpvRaw, matchedCpvCode: targetCpvRaw, depth: 'NONE', score: 0 };
  }

  // Exact 8-digit match
  if (tenderCpv === targetCpv) {
    return {
      cpvCode: tenderCpv,
      matchedCpvCode: targetCpv,
      depth: 'EXACT_8_DIGIT',
      score: 100,
      description: COMMON_CPV_DIRECTORY[tenderCpv] || "Точний збіг коду ДК 021:2015"
    };
  }

  // 5-digit Category match
  if (tenderCpv.substring(0, 5) === targetCpv.substring(0, 5)) {
    return {
      cpvCode: tenderCpv,
      matchedCpvCode: targetCpv,
      depth: 'CATEGORY_5_DIGIT',
      score: 90,
      description: "Збіг на рівні категорії закупівлі"
    };
  }

  // 4-digit Class match
  if (tenderCpv.substring(0, 4) === targetCpv.substring(0, 4)) {
    return {
      cpvCode: tenderCpv,
      matchedCpvCode: targetCpv,
      depth: 'CLASS_4_DIGIT',
      score: 80,
      description: "Збіг на рівні класу закупівлі"
    };
  }

  // 3-digit Group match
  if (tenderCpv.substring(0, 3) === targetCpv.substring(0, 3)) {
    return {
      cpvCode: tenderCpv,
      matchedCpvCode: targetCpv,
      depth: 'GROUP_3_DIGIT',
      score: 50,
      description: "Збіг на рівні групи закупівлі"
    };
  }

  // 2-digit Division match
  if (tenderCpv.substring(0, 2) === targetCpv.substring(0, 2)) {
    return {
      cpvCode: tenderCpv,
      matchedCpvCode: targetCpv,
      depth: 'DIVISION_2_DIGIT',
      score: 30,
      description: "Збіг на рівні розділу закупівлі"
    };
  }

  return { cpvCode: tenderCpv, matchedCpvCode: targetCpv, depth: 'NONE', score: 0 };
}
