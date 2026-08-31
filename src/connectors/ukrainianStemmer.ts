/**
 * High-Precision Ukrainian Morphological Stemmer & NLP Normalizer
 * Designed specifically for Ukrainian Public Procurement (Prozorro) terminology.
 */

// Ukrainian Vowels & Consonants
const VOWELS = /[аеєиіїоуюя]/gi;
const PERFECTIVE_GROUND = /(ив|ивши|ившись|ыв|ывши|ывшись|в|вши|вшись)$/i;
const REFLEXIVE = /(ся|сь)$/i;
const ADJECTIVE = /(ими|іми|их|іх|ому|ему|йому|єму|ої|еї|єї|ую|єю|ою|ею|єю|ий|ій|ий|ій|им|ім|им|ім|их|іх|ої|еї|єї|ими|іми|ого|его|ього|єго|ому|ему|йому|єму|им|ім|их|іх|а|я|е|є|і|и|ий|ій|ний|на|не|ні|ного|ному|ним|них|ська|ське|ські|ського|ському|ських)$/i;
const PARTICIPLE = /(ий|ій|ем|ім|им|ім|ем|ім|ов|ев|єв|ив|ів|ув|яв|ню|ний|на|не|ні|ного|ному|ним|них)$/i;
const VERB = /(ила|ена|єте|єш|ейте|іть|й|йте|ам|ем|еймы|ім|ите|ить|ены|ть|ти|ла|ли|ло|ны|ем|нно|ло|ли|тиму|тимеш|тиме|тимуть)$/i;
const NOUN = /(а|ев|ов|е|г|е|и|і|ї|іе|ие|ем|нам|ам|ами|ями|ах|ях|зем|ею|ою|єю|ией|ию|ей|ои|ией|ий|ій|иям|ям|ием|ем|иями|ями|иях|ях|ов|ев|еми|ем|ей|и|і|ї|о|у|ах|ях|ен|ят|нок|ка|ками|ках|ам|ом|ем|ів|їв|ей|ям|ями|ях)$/i;
const DERIVATIONAL = /(ост|ость)$/i;

// Ukrainian Prozorro Procurement Synonyms & Domain Expansions
const PROCURMENT_SYNONYMS: Record<string, string[]> = {
  "укриття": [
    "вкриття", "бомбосховище", "сховище", "протирадіаційне", "прсп", "захисна споруда",
    "найпростіше укриття", "модульне укриття", "споруда цивільного захисту", "захисне укриття"
  ],
  "бомбосховище": ["укриття", "сховище", "протирадіаційне", "захисна споруда", "прсп", "найпростіше укриття"],
  "будівництво": [
    "новому будівництву", "зведення", "спорудження", "будівельні роботи", "будівництва",
    "влаштування", "монтаж", "реконструкція", "капітальне будівництво", "підрядні роботи"
  ],
  "ремонт": [
    "ремонтні роботи", "реконструювання", "капітальний ремонт", "поточний ремонт",
    "відновлення", "термомодернізація", "реставрація", "усунення аварійного стану", "реновація"
  ],
  "ноутбук": [
    "комп'ютер", "портативний комп'ютер", "лептоп", "персональний комп'ютер", "пк",
    "техніка", "обчислювальна техніка", "монітор", "системний блок", "планшет"
  ],
  "комп'ютер": [
    "ноутбук", "пк", "персональний комп'ютер", "системний блок", "монітор", "робоча станція",
    "сервер", "обчислювальна техніка", "оргтехніка"
  ],
  "дрон": [
    "бпла", "квадрокоптер", "fpv", "мавік", "mavic", "безпілотник", "авіаційний комплекс",
    "безпілотний літальний апарат", "matrix", "autel", "дрони", "коптер"
  ],
  "бпла": [
    "дрон", "квадрокоптер", "fpv", "безпілотник", "безпілотний літальний апарат", "мавік", "mavic"
  ],
  "реб": [
    "радіоелектронна боротьба", "глушилка", "купол", "окопний реб", "антидрон",
    "засіб радіоелектронної боротьби", "детектор бпла"
  ],
  "генератор": [
    "дизель-генератор", "генераторна установка", "джерело живлення", "електрогенератор",
    "бензогенератор", "інвертор", "зарядна станція", "екофлоу", "ecoflow", "дбж", "ups"
  ],
  "школа": [
    "заклад загальної середньої освіти", "ззсо", "гімназія", "ліцей", "навчальний заклад",
    "школи", "шкіл", "опорний заклад", "освітній заклад", "дитячий садок", "здо"
  ],
  "лікарня": [
    "заклад охорони здоров'я", "зоз", "кнп", "госпіталь", "амбулаторія", "поліклініка",
    "медичний заклад", "лікарні", "медико-санітарна", "диспансер"
  ],
  "медикаменти": [
    "лікарські засоби", "ліки", "фармацевтична продукція", "препарати", "вакцини",
    "медвироби", "шприци", "рукавички", "перев'язувальні", "інфузійні"
  ],
  "автомобіль": [
    "автотранспортний засіб", "транспортний засіб", "авто", "спецавтомобіль", "легковий",
    "вантажний", "автобус", "мікроавтобус", "пікап", "позашляховик", "санітарний автомобіль"
  ],
  "паливо": [
    "бензин", "дизельне паливо", "дп", "газ", "пально-мастильні", "пмм", "нафтопродукти",
    "а-95", "а-92", "скраплений газ", "автогаз"
  ],
  "харчування": [
    "продукти харчування", "харчові продукти", "послуги з харчування", "кейтеринг",
    "годування", "гаряче харчування", "овочі", "м'ясо", "молочні продукти", "хлібобулочні"
  ],
  "освітлення": [
    "вуличне освітлення", "світлодіодні", "led", "світильники", "освітлювальне", "ліхтарі",
    "зовнішнє освітлення", "електромонтаж освітлення"
  ],
  "дорога": [
    "автомобільна дорога", "шляхи", "дорожнє покриття", "автодорога", "бруківка", "асфальт",
    "ямковий ремонт", "асфальтобетон", "дорожні роботи", "проїжджа частина", "вулично-дорожня"
  ],
  "проектування": [
    "проєктні роботи", "проєктно-кошторисна документація", "пкд", "авторський нагляд",
    "технічний нагляд", "експертиза проекту", "інженерні вишукування", "розробка документації"
  ],
  "охорона": [
    "послуги охорони", "відеоспостереження", "пожежна сигналізація", "охоронна сигналізація",
    "пультова охорона", "система контролю доступу", "скд", "пожежогасіння"
  ]
};

// Common procurement stop words that pollute search scores
const UA_STOP_WORDS = new Set([
  "та", "і", "в", "у", "на", "по", "про", "за", "від", "до", "грн", "uah", "млн", "тис", 
  "з", "із", "зі", "як", "що", "це", "або", "чи", "під", "над", "біля", "тендер", 
  "закупівля", "пошук", "знайти", "послуги", "роботи", "товари", "код", "дк", "021:2015",
  "для", "щодо", "через", "при", "без", "після", "перед", "шляхом", "згідно"
]);

/**
 * Stems a single Ukrainian word down to its semantic root.
 */
export function stemUkrainianWord(word: string): string {
  let clean = word.toLowerCase().trim().replace(/[^а-щьюяїієґa-z0-9]/gi, '');
  if (clean.length <= 3) return clean;

  // Sound mutation handling (e.g., шкіл -> школ)
  if (clean.includes('шкіл')) clean = clean.replace('шкіл', 'школ');
  if (clean.includes('будівельн')) clean = clean.replace('будівельн', 'будівн');

  const match = VOWELS.exec(clean);
  if (!match) return clean;

  const startIdx = match.index;
  const RV = clean.slice(startIdx + 1);

  if (!RV) return clean;

  let temp = RV;
  // Step 1: Remove perfective gerund / reflexive
  temp = temp.replace(PERFECTIVE_GROUND, '');
  temp = temp.replace(REFLEXIVE, '');

  // Step 2: Remove adjective / participle / verb / noun endings
  if (ADJECTIVE.test(temp)) {
    temp = temp.replace(ADJECTIVE, '');
    temp = temp.replace(PARTICIPLE, '');
  } else if (VERB.test(temp)) {
    temp = temp.replace(VERB, '');
  } else {
    temp = temp.replace(NOUN, '');
  }

  // Step 3: Remove derivational suffixes
  temp = temp.replace(DERIVATIONAL, '');

  const root = clean.slice(0, startIdx + 1) + temp;
  return root.length >= 2 ? root : clean;
}

/**
 * Extracts normalized keyword roots and performs domain synonym expansion.
 */
export function extractAndExpandKeywords(prompt: string): {
  originalKeywords: string[];
  stemmedRoots: string[];
  expandedTerms: string[];
} {
  const words = prompt
    .toLowerCase()
    .split(/[\s,.;:!?()"\-]+/)
    .map(w => w.replace(/[^а-щьюяїієґa-z0-9]/gi, '').trim())
    .filter(w => w.length >= 2 && !UA_STOP_WORDS.has(w));

  const originalKeywords = Array.from(new Set(words));
  const stemmedRoots: string[] = [];
  const expandedTermsSet = new Set<string>();

  for (const word of originalKeywords) {
    const stem = stemUkrainianWord(word);
    if (stem) {
      stemmedRoots.push(stem);
      expandedTermsSet.add(stem);
    }

    // Check domain synonyms
    for (const [key, synonyms] of Object.entries(PROCURMENT_SYNONYMS)) {
      const keyStem = stemUkrainianWord(key);
      if (word.includes(key) || (stem && stem === keyStem)) {
        synonyms.forEach(syn => {
          expandedTermsSet.add(syn.toLowerCase());
          const synStem = stemUkrainianWord(syn);
          if (synStem) expandedTermsSet.add(synStem);
        });
      }
    }
  }

  return {
    originalKeywords,
    stemmedRoots: Array.from(new Set(stemmedRoots)),
    expandedTerms: Array.from(expandedTermsSet)
  };
}

/**
 * Checks if a target text matches a given keyword root using stem matching,
 * prefix matching, or exact substring matching.
 */
export function matchUkrainianText(text: string, keywordOrRoot: string): {
  matched: boolean;
  scoreBonus: number;
  matchType: 'EXACT' | 'STEM' | 'PREFIX' | 'NONE';
} {
  if (!text || !keywordOrRoot) return { matched: false, scoreBonus: 0, matchType: 'NONE' };

  const lowerText = text.toLowerCase();
  const lowerKw = keywordOrRoot.toLowerCase().trim();

  // 1. Exact Substring Match
  if (lowerText.includes(lowerKw)) {
    return { matched: true, scoreBonus: 30, matchType: 'EXACT' };
  }

  // 2. Stem-based Root Match
  const kwStem = stemUkrainianWord(lowerKw);
  if (kwStem.length >= 3 && lowerText.includes(kwStem)) {
    return { matched: true, scoreBonus: 20, matchType: 'STEM' };
  }

  // 3. Prefix Match for longer words
  if (lowerKw.length >= 5) {
    const prefix = lowerKw.slice(0, 4);
    if (lowerText.includes(prefix)) {
      return { matched: true, scoreBonus: 10, matchType: 'PREFIX' };
    }
  }

  return { matched: false, scoreBonus: 0, matchType: 'NONE' };
}
