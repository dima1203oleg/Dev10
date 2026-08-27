import { Tender, AmcuComplaintDoc, BidPackage } from '../types';

export const INITIAL_TENDERS: Tender[] = [
  {
    id: 'tender-1',
    tenderNumber: 'UA-2024-10-18-004819-a',
    title: 'Капітальний ремонт захисної споруди цивільного захисту (укриття) ліцею №14 у м. Київ',
    customer: 'Управління освіти Оболонської районної в місті Києві державної адміністрації',
    customerEdrpou: '37394821',
    customerCity: 'м. Київ',
    budgetUah: 38500000,
    deadline: '2024-11-20',
    region: 'м. Київ',
    status: 'AUDIT_FLAGGED',
    category: 'Будівельні роботи та поточний ремонт',
    foulScore: 84,
    riskLevel: 'HIGH',
    summary: 'Виявлено 3 критичні дискримінаційні вимоги щодо територіального обмеження виробничих баз та завищення вартості гідроізоляційних сумішей на 34%.',
    tenderText: `Технічне завдання: Капітальний ремонт укриття на 600 осіб.
Вимоги до кваліфікації:
1. Учасник зобов'язаний надати довідку про наявність власного заводу з виготовлення залізобетонних конструкцій на відстані не більше 12 км від об'єкта будівництва (для оперативності).
2. Наявність в штаті не менше 40 працівників із сертифікатами європейського зразка EN 1090.
3. Досвід виконання аналогічних робіт за останні 12 місяців на суму не менше 100% вартості закупівлі.
4. Строк виконання всіх робіт: 18 календарних днів з моменту підписання договору.`,
    specifications: 'Влаштування залізобетонного монолітного перекриття товщиною 400 мм, гідроізоляція мембранна полімерна, системи вентиляції з фільтрами ФП-300.',
    boqItems: [
      {
        id: 'boq-1',
        code: 'ДБН Р-1-102',
        description: 'Влаштування монолітних залізобетонних перекриттів із суміші В25 W6 F150',
        unit: 'м³',
        quantity: 240,
        standardPriceUah: 4850,
        marketPriceUah: 4100,
        laborHours: 320,
        anomaly: 'OVERPRICED',
        notes: 'Ціна бетону у ТД завищена на 18% у порівнянні з ринковим моніторингом м. Києва'
      },
      {
        id: 'boq-2',
        code: 'ДБН Р-3-441',
        description: 'Монтаж арматурних каркасів та сіток з гарячекатаної сталі А500С Ø16-Ø22',
        unit: 'т',
        quantity: 38,
        standardPriceUah: 46200,
        marketPriceUah: 37500,
        laborHours: 190,
        anomaly: 'OVERPRICED',
        notes: 'Завищення вартості металопрокату на 23%'
      },
      {
        id: 'boq-3',
        code: 'ДБН Р-8-219',
        description: 'Нанесення двокомпонентної гідроізоляційної полімерної мембрани MasterSeal',
        unit: 'м²',
        quantity: 1450,
        standardPriceUah: 890,
        marketPriceUah: 640,
        laborHours: 240,
        anomaly: 'OVERPRICED',
        notes: 'Вказана конкретна торгова марка MasterSeal без виразу "або еквівалент"'
      },
      {
        id: 'boq-4',
        code: 'ДБН В-4-110',
        description: 'Монтаж противибухових захисних дверей та люків герметичних',
        unit: 'компл',
        quantity: 6,
        standardPriceUah: 145000,
        marketPriceUah: 142000,
        laborHours: 64,
        anomaly: 'NORMAL',
        notes: 'Відповідає ринковій вартості виробника'
      },
      {
        id: 'boq-5',
        code: 'ДБН Е-2-005',
        description: 'Монтаж припливно-витяжної вентиляційної установки з регенерацією та фільтрами',
        unit: 'компл',
        quantity: 2,
        standardPriceUah: 680000,
        marketPriceUah: 670000,
        laborHours: 110,
        anomaly: 'NORMAL'
      }
    ],
    violations: [
      {
        id: 'viol-1',
        type: 'DISCRIMINATORY_REQUIREMENT',
        severity: 'CRITICAL',
        title: 'Територіальне обмеження виробничої бази (не більше 12 км)',
        description: 'Вимога наявності виробничої бази на відстані не більше 12 км обмежує участь компаній з сусідніх районів та областей, створюючи перевагу для місцевого фаворита.',
        legalBasis: 'Порушення частини 4 статті 5 та частини 4 статті 22 Закону України «Про публічні закупівлі».',
        amcuPrecedent: 'Рішення Колегії АМКУ № 11842-р/пк-пз: вимоги щодо радіусу розташування виробничих потужностей визнано дискримінаційними.'
      },
      {
        id: 'viol-2',
        type: 'TECHNICAL_LOCKIN',
        severity: 'HIGH',
        title: 'Вказівка конкретної торгової марки без фрази «або еквівалент»',
        description: 'Замовник прямо вимагає нанесення матеріалу MasterSeal без зазначення технічних характеристик еквівалента.',
        legalBasis: 'Порушення частини 4 статті 23 Закону України «Про публічні закупівлі».',
        amcuPrecedent: 'Стандартна практика АМКУ: обов\'язкова наявність формулювання «або еквівалент» при згадці брендів.'
      },
      {
        id: 'viol-3',
        type: 'UNREALISTIC_TIMELINE',
        severity: 'HIGH',
        title: 'Штучно занижений термін виконання (18 днів на 38.5 млн грн)',
        description: 'Технологічний процес набору міцності монолітного бетону (28 діб) фізично унеможливлює виконання робіт за 18 днів без попереднього виконання робіт.',
        legalBasis: 'Ознака змови та можливої легалізації вже виконаних робіт.',
        amcuPrecedent: 'ДАСУ проводить обов\'язковий моніторинг щодо закупівель з нереалістичним строком.'
      }
    ],
    amcuAppealRecommendation: {
      recommended: true,
      winProbabilityPercent: 94,
      appealGrounds: 'Оскарження дискримінаційного радіусу розташування бази та відсутності приписки «або еквівалент» для матеріалу MasterSeal.',
      estimatedAmcuFeeUah: 85000
    },
    requirements: [
      {
        id: 'req-1',
        category: 'QUALIFICATION_ART16',
        title: 'Наявність обладнання та матеріально-технічної бази',
        clauseInTenderDoc: 'Додаток 1, п. 1.1',
        exactQuote: 'Довідка про наявність власного або орендованого автобетонозмішувача об\'ємом не менше 8 куб.м та крана 50т.',
        status: 'COVERED',
        matchingDocName: 'Автобетонозмішувач MAN TGS 33.360 (9м³) + Кран Liebherr 50т',
        matchingDocId: 'eq-1',
        explanation: 'Повністю перекрито чинними свідоцтвами та договором оренди спецтехніки № 12/ОР-24.',
        actionRequired: 'Згенерувати Довідку за формою Таблиці 1 Додатку 1 ТД.'
      },
      {
        id: 'req-2',
        category: 'QUALIFICATION_ART16',
        title: 'Територіальне обмеження заводу ЗБВ (12 км)',
        clauseInTenderDoc: 'Додаток 1, п. 1.3',
        exactQuote: 'Довідка про наявність власного заводу з виготовлення ЗБК на відстані не більше 12 км від об\'єкта.',
        status: 'GAP_MISSING',
        explanation: 'Дискримінаційна вимога! База підприємства розташована на відстані 16.5 км від ліцею №14.',
        actionRequired: 'Подати скаргу до АМКУ щодо скасування територіального обмеження (100% прецедентна перемога).'
      },
      {
        id: 'req-3',
        category: 'QUALIFICATION_ART16',
        title: 'Наявність працівників відповідної кваліфікації',
        clauseInTenderDoc: 'Додаток 1, п. 2.1',
        exactQuote: 'Наявність сертифікованого ГІПа, інженера-кошторисника з сертифікатом АР та не менше 2 зварників з атестацією.',
        status: 'COVERED',
        matchingDocName: 'ГІП Лисенко П.А. (АР № 019284) + Кошторисник Дмитренко О.В. (АР № 008472)',
        matchingDocId: 'st-1',
        explanation: 'Усі фахівці працевлаштовані за основним місцем роботи, сертифікати чинні.',
        actionRequired: 'Додати копії наказів про призначення та трудових книжок.'
      },
      {
        id: 'req-4',
        category: 'QUALIFICATION_ART16',
        title: 'Досвід виконання аналогічного договору',
        clauseInTenderDoc: 'Додаток 1, п. 3.1',
        exactQuote: 'Не менше 1 повністю виконаного договору на капітальний ремонт/будівництво укриття чи захисної споруди цивільного захисту на суму від 25 млн грн.',
        status: 'COVERED',
        matchingDocName: 'Договір № 44/КБ-23 (Укриття ліцею №291, 28.45 млн грн) + Акти КБ-2в + Відгук',
        matchingDocId: 'cnt-1',
        explanation: 'Аналогічний договір повністю відповідає предмету закупівлі (код ДК 021:2015 45453000-7) та вартісному критерію.',
        actionRequired: 'Прикріпити скан-копію позитивного листа-відгуку Замовника.'
      },
      {
        id: 'req-5',
        category: 'FINANCIAL_GUARANTEE',
        title: 'Електронна банківська гарантія забезпечення тендерної пропозиції',
        clauseInTenderDoc: 'Розділ 3, п. 2',
        exactQuote: 'Банківська гарантія на суму 192 500,00 грн (0.5% вартості) з обов\'язковим грошовим покриттям.',
        status: 'WARNING',
        explanation: 'Гарантію необхідно оформити у банку, що має рейтинг не нижче uaAA за національною шкалою з КЕП банку.',
        actionRequired: 'Подати заявку на оформлення банківської гарантії (орієнтовний строк 24 години).'
      },
      {
        id: 'req-6',
        category: 'ANTI_CORRUPTION_ART17',
        title: 'Відсутність підстав за ст. 17 ЗУ «Про публічні закупівлі»',
        clauseInTenderDoc: 'Додаток 3',
        exactQuote: 'Електронні довідки про відсутність судимості керівника, відсутність корупційних правопорушень та податкового боргу.',
        status: 'WARNING',
        matchingDocName: 'Довідка ДПС № 4920/10/26-15-12',
        matchingDocId: 'doc-v-7',
        explanation: 'Довідка ДПС діє до 10.11.2024. Строк подання пропозицій — 20.11.2024. Необхідно оновити довідку за 5 днів до дедлайну!',
        actionRequired: 'Замовити свіжу довідку про відсутність податкового боргу в електронному кабінеті платника податків.'
      }
    ],
    resourceAudit: [
      {
        id: 'res-1',
        resourceName: 'Бригада монолітників та арматурників (12 осіб)',
        category: 'STAFF',
        tenderRequirement: 'Мінімум 12 робітників на об\'єкті для одночасного бетонування перекриттів',
        deJureStatus: 'COMPLIANT',
        deJureNote: 'Документально подається 5 штатних робітників + гарантійний лист залучення субпідрядника',
        deFactoStatus: 'PARTIAL',
        deFactoNote: 'Фактично в компанії працює 5 арматурників (інші на об\'єкті у Дарниці)',
        acquirablePlan: 'Укласти договір ЦПХ з бригадою монолітників (7 осіб) за 3 дні до початку бетонування',
        costToAcquireUah: 180000,
        timeToAcquireDays: 4,
        evidenceStatus: 'VERIFIED'
      },
      {
        id: 'res-2',
        resourceName: 'Автобетононасос Putzmeister 36м',
        category: 'EQUIPMENT',
        tenderRequirement: 'Наявність стрілового автобетононасосу продуктивністю від 90 м³/год',
        deJureStatus: 'COMPLIANT',
        deJureNote: 'Чинний договір оренди спецтехніки № 18/24 від ТОВ «ТехноТрансБуд»',
        deFactoStatus: 'IN_HOUSE',
        deFactoNote: 'Техніка вільна від інших підрядів з 25.11.2024',
        acquirablePlan: 'Підтверджено диспетчером орендодавця',
        costToAcquireUah: 0,
        timeToAcquireDays: 1,
        evidenceStatus: 'VERIFIED'
      },
      {
        id: 'res-3',
        resourceName: 'Виробнича база ЗБК (12 км)',
        category: 'EQUIPMENT',
        tenderRequirement: 'Власний завод ЗБК у радіусі 12 км від ліцею',
        deJureStatus: 'NON_COMPLIANT',
        deJureNote: 'База в м. Бровари (24 км) — штучна дискримінація замовника',
        deFactoStatus: 'NOT_PRESENT',
        deFactoNote: 'У радіусі 12 км база лише у конкурента ТОВ «Столичний Моноліт Буд»',
        acquirablePlan: 'Оскарження в АМКУ (скасування дискримінації за прецедентом № 11842-р/пк-пз)',
        costToAcquireUah: 25000,
        timeToAcquireDays: 2,
        evidenceStatus: 'VERIFIED'
      }
    ],
    opportunityScore: {
      overallScore: 88,
      bidDecision: 'BID_WITH_CONDITIONS',
      bidDecisionReason: 'Висока маржинальність (21.4%) та ідеальний аналогічний досвід. Участь рекомендована за умови оскарження радіусу ЗБК в АМКУ.',
      factors: {
        companyFit: 94,
        legalFit: 78,
        docReadiness: 92,
        financialFeasibility: 95,
        competitionScore: 68,
        historicalWinProb: 84,
        executionFeasibility: 89,
        riskPenalty: 22
      },
      whyThisTender: [
        {
          icon: 'TrendingUp',
          title: 'Висока розрахункова маржинальність (21.4%)',
          description: 'Кошторисний аналіз BoQ виявив 3 завищені позиції замовника (бетон В25 та арматура), що дає запас маневру в редукціоні.',
          type: 'POSITIVE'
        },
        {
          icon: 'FileCheck2',
          title: 'Аналогічний досвід 100% покриває вимогу',
          description: 'Договір № 44/КБ-23 на 28.45 млн грн повністю підтверджує навички будівництва захисних споруд СС2.',
          type: 'POSITIVE'
        },
        {
          icon: 'ShieldAlert',
          title: 'Дискримінаційна вимога радіусу 12 км',
          description: 'Успіх скарги в АМКУ оцінюється у 92% (наявний прямий прецедент № 11842-р/пк-пз).',
          type: 'WARNING'
        }
      ]
    },
    priceScenarios: [
      {
        id: 'CONSERVATIVE',
        name: 'Консервативний (Максимальна маржа)',
        tagline: 'Мінімальне зниження в 1 раунді, збереження високого прибутку',
        priceUah: 37200000,
        discountPercent: 3.4,
        estimatedMarginUah: 8250000,
        estimatedMarginPercent: 22.1,
        winProbabilityPercent: 46,
        riskDescription: 'Ризик програти за наявності агресивного демпінгу від конкурента з сумнівною якістю матеріалів.',
        historicalDiscountContext: 'У 68% аналогічних торгів Оболонської РДА переможець дисконтував менше 4% через змову спаринг-партнерів.'
      },
      {
        id: 'COMPETITIVE',
        name: 'Оптимальний конкурентний',
        tagline: 'Збалансоване співвідношення перемоги та гарантованого прибутку',
        priceUah: 34800000,
        discountPercent: 9.6,
        estimatedMarginUah: 5850000,
        estimatedMarginPercent: 16.8,
        winProbabilityPercent: 78,
        riskDescription: 'Оптимальний поріг. Забезпечує перемогу над монопольним фаворитом без дефіциту фонду оплати праці.',
        historicalDiscountContext: 'Середній дисконт реальних конкурентів у схожих проектах цивільного захисту становить 8.5% - 11%.'
      },
      {
        id: 'AGGRESSIVE',
        name: 'Агресивний (Витіснення фаворита)',
        tagline: 'Максимальний тиск на редукціоні для гарантованого взяття контракту',
        priceUah: 32600000,
        discountPercent: 15.3,
        estimatedMarginUah: 3650000,
        estimatedMarginPercent: 11.2,
        winProbabilityPercent: 93,
        riskDescription: 'Знижена рентабельність, вимагатиме суворого контролю витрат палива та оптової закупівлі арматури.',
        historicalDiscountContext: 'Учасник «Столичний Моноліт» виходить з аукціону при падінні ціни нижче 33.5 млн ₴.'
      }
    ],
    ganttTasks: [
      {
        id: 'g-1',
        title: 'Демонтажні та підготовчі роботи, осушення підвалу',
        category: 'Підготовка',
        startWeek: 1,
        durationWeeks: 1,
        crewNeeded: 6,
        machineryNeeded: ['Компресорна станція', 'Відбійні молотки'],
        criticalPath: true,
        feasibleWithCurrentResources: true
      },
      {
        id: 'g-2',
        title: 'Влаштування залізобетонного монолітного перекриття 400 мм',
        category: 'Монолітні роботи',
        startWeek: 2,
        durationWeeks: 2,
        crewNeeded: 12,
        machineryNeeded: ['Автобетононасос 36м', 'Глибинні вібратори'],
        criticalPath: true,
        feasibleWithCurrentResources: false,
        gapSolution: 'Залучення додаткової бригади ЦПХ (7 монолітників)'
      },
      {
        id: 'g-3',
        title: 'Нанесення двокомпонентної полімерної гідроізоляції',
        category: 'Гідроізоляція',
        startWeek: 3,
        durationWeeks: 1,
        crewNeeded: 4,
        machineryNeeded: ['Агрегат безповітряного розпилення'],
        criticalPath: false,
        feasibleWithCurrentResources: true
      },
      {
        id: 'g-4',
        title: 'Монтаж вентиляційної фільтровентиляційної системи ФП-300',
        category: 'Інженерні мережі',
        startWeek: 4,
        durationWeeks: 2,
        crewNeeded: 4,
        machineryNeeded: ['Підйомники монтажні'],
        criticalPath: true,
        feasibleWithCurrentResources: true
      },
      {
        id: 'g-5',
        title: 'Встановлення герметичних противибухових дверей та пусконалагодження',
        category: 'Пусконалагодження',
        startWeek: 5,
        durationWeeks: 1,
        crewNeeded: 3,
        machineryNeeded: ['Монтажний інструмент'],
        criticalPath: true,
        feasibleWithCurrentResources: true
      }
    ],
    actionPlan: [
      {
        id: 'act-1',
        title: 'Сформувати та підписати КЕП скаргу до АМКУ щодо радіусу ЗБК',
        description: 'Подати скаргу через електронну систему Prozorro не пізніше ніж за 4 дні до кінцевого строку подання.',
        category: 'LEGAL',
        assigneeRole: 'LAWYER',
        priority: 'IMMEDIATE',
        deadlineHoursRemaining: 18,
        requiredDocumentName: 'Проєкт скарги АМКУ (ст. 18 Закону)',
        riskIfSkipped: 'Неможливість подання пропозиції через автоматичну дискваліфікацію замовником.',
        isCompleted: false
      },
      {
        id: 'act-2',
        title: 'Замовити оновлену довідку ДПС про відсутність податкового боргу',
        description: 'Попередня довідка закінчується 10.11, строк подачі 20.11. Отримати свіжу довідку з КЕП ДПС.',
        category: 'DOCUMENT',
        assigneeRole: 'ACCOUNTANT',
        priority: 'IMMEDIATE',
        deadlineHoursRemaining: 36,
        requiredDocumentName: 'Довідка ДПС про відсутність заборгованості',
        riskIfSkipped: 'Відхилення за статтею 17 (надання нечинного документа).',
        isCompleted: false
      },
      {
        id: 'act-3',
        title: 'Замовити банківську гарантію на 192 500 грн у банку АТ «Ощадбанк»',
        description: 'Подати заяву на отримання гарантії з обов\'язковим КЕП уповноваженої особи банку.',
        category: 'MANAGEMENT',
        assigneeRole: 'SOLO_USER',
        priority: 'HIGH',
        deadlineHoursRemaining: 48,
        requiredDocumentName: 'Електронна банківська гарантія (.p7s)',
        riskIfSkipped: 'Невідповідність умовам тендерної документації за ст. 16.',
        isCompleted: false
      },
      {
        id: 'act-4',
        title: 'Експорт та фінальна звірка кошторису BoQ в АВК-5',
        description: 'Перевірити розцінки на бетон В25 та арматуру А500С з урахуванням узгодженої знижки 9.6%.',
        category: 'ESTIMATE',
        assigneeRole: 'ESTIMATOR',
        priority: 'HIGH',
        deadlineHoursRemaining: 54,
        requiredDocumentName: 'Підсумкова відомість ресурсів та договірна ціна',
        riskIfSkipped: 'Арифметичні розбіжності та ризик АНЦ (аномально низької ціни).',
        isCompleted: true
      }
    ],
    postTenderAnalysis: {
      tenderId: 'tender-1',
      outcome: 'IN_REVIEW',
      bidDefenseScore: 92,
      rootCauseCategory: 'NONE',
      appealViability: {
        recommended: true,
        winChancePercent: 94,
        strongPoints: [
          'Пряма судова практика та рішення колегії АМКУ № 11842-р/пк-пз забороняють встановлювати обмеження радіусу розташування виробничих баз',
          'Повне документальне підтвердження досвіду аналогічного будівництва укриттів (договір № 44/КБ-23 на 28.4 млн грн)'
        ],
        weakPoints: [
          'Необхідно суворо витримати строк оновлення довідки ДПС перед фінальним завантаженням'
        ],
        neededEvidence: [
          'Рішення колегії АМКУ № 11842-р/пк-пз',
          'Витяг з реєстру сертифікованих лабораторій щодо перевірки міцності бетону на відстані до 50 км'
        ],
        amcuProjectDraftAvailable: true
      }
    },
    versionDiff: {
      tenderId: 'tender-1',
      previousVersion: 'Редакція 1.0 (від 10.10.2024)',
      currentVersion: 'Редакція 2.0 (від 18.10.2024)',
      changesCount: 3,
      summary: 'Замовник вніс зміни до Додатка 1 та скоротив термін подання пропозицій. Додано нову дискримінаційну вимогу щодо радіусу заводу ЗБК.',
      changes: [
        {
          id: 'diff-1',
          type: 'ADDED',
          category: 'Кваліфікаційні критерії (ст. 16)',
          clause: 'Додаток 1, новий пункт 1.3',
          newValue: 'Вимога про наявність заводу ЗБК не далі 12 км від об\'єкта',
          riskImpact: 'CRITICAL_TRAP',
          aiCommentary: 'Класична штучна пастка, додана під конкретного фаворита (ТОВ «Столичний Моноліт Буд»), завод якого знаходиться за 8 км.'
        },
        {
          id: 'diff-2',
          type: 'MODIFIED',
          category: 'Строки виконання робіт',
          clause: 'Проєкт договору, п. 4.2',
          oldValue: 'Строк виконання: 60 календарних днів',
          newValue: 'Строк виконання: 18 календарних днів',
          riskImpact: 'INCREASED_RISK',
          aiCommentary: 'Скорочення строків у 3.3 рази при незмінному обсязі робіт вказує на ймовірність частково вже виконаних прихованих робіт.'
        },
        {
          id: 'diff-3',
          type: 'MODIFIED',
          category: 'Забезпечення виконання договору',
          clause: 'Розділ 3, п. 6',
          oldValue: 'Забезпечення не вимагається',
          newValue: 'Забезпечення виконання договору: 5% (1 925 000 грн)',
          riskImpact: 'INCREASED_RISK',
          aiCommentary: 'Збільшено фінансове навантаження на переможця у формі безвідкличної банківської гарантії.'
        }
      ]
    },
    collusionAnalysis: {
      tenderId: 'tender-1',
      collusionRiskScore: 78,
      riskLevel: 'HIGH',
      primarySuspects: ['ТОВ «Столичний Моноліт Буд» (ЄДРПОУ 38192049)', 'ТОВ «КиївБудКомплект-2020» (ЄДРПОУ 43920194)'],
      anomaliesDetected: [
        {
          title: 'Спільна історія участі (18 спільних торгів)',
          description: 'У 18 попередніх закупівлях Оболонської РДА ці два учасники подавали пропозиції парою.',
          evidence: 'Час завантаження файлів на майданчик відрізнявся менше ніж на 14 хвилин у 80% випадків.'
        },
        {
          title: 'Ідентичні помилки у формах розрахунку кошторисів',
          description: 'У попередньому тендері UA-2024-06-11-001920 однакові друкарські помилки у назвах розцінок ДБН.',
          evidence: 'Аналіз метаданих PDF: однаковий автор файлу "Buhgalter_OS" та версія Word.'
        },
        {
          title: 'Фіктивна конкуренція (пасивний спаринг)',
          description: 'ТОВ «КиївБудКомплект-2020» жодного разу не знижувало ціну у 3 раундах аукціону, забезпечуючи перемогу фавориту з мінімальним дисконтом 0.4%.',
          evidence: 'Історія редукціонів Prozorro за 2023-2024 роки.'
        }
      ],
      coBiddingGraph: [
        {
          source: 'ТОВ «Столичний Моноліт Буд»',
          target: 'ТОВ «КиївБудКомплект-2020»',
          sharedTenders: 18,
          winDistribution: '16 перемог (89%) / 2 відхилення'
        },
        {
          source: 'ТОВ «Столичний Моноліт Буд»',
          target: 'ПП «СпецРемБудСервіс»',
          sharedTenders: 7,
          winDistribution: '7 перемог (100%)'
        }
      ]
    },
    readinessScore: {
      totalScore: 84,
      readyToSubmit: false,
      categories: {
        documentsVault: 92,
        qualificationArt16: 85,
        costAndBoQ: 90,
        legalDraftContract: 75,
        technicalSpecs: 80
      },
      criticalChecklist: [
        {
          id: 'chk-1',
          title: 'Кваліфікаційні довідки ст. 16',
          passed: true,
          severity: 'INFO',
          detail: 'Матеріально-технічна база та персонал повністю підтверджені документами зі сховища.'
        },
        {
          id: 'chk-2',
          title: 'Дискримінаційне обмеження 12 км',
          passed: false,
          severity: 'BLOCKING',
          detail: 'Без подання скарги до АМКУ пропозицію буде відхилено через відстань бази 16.5 км.'
        },
        {
          id: 'chk-3',
          title: 'Електронна банківська гарантія 192 500 грн',
          passed: false,
          severity: 'BLOCKING',
          detail: 'Необхідно отримати файл гарантії з КЕП банку та завантажити у пакет.'
        },
        {
          id: 'chk-4',
          title: 'Оновлення довідки ДПС про відсутність боргу',
          passed: true,
          severity: 'WARNING',
          detail: 'Чинна довідка закінчується 10.11.2024. Рекомендовано замовити оновлену.'
        },
        {
          id: 'chk-5',
          title: 'Аномально низька ціна (АНЦ / ALP Risk)',
          passed: true,
          severity: 'INFO',
          detail: 'Розрахункова ціна (34.2 млн грн) не підпадає під автоматичне визначення АНЦ електронною системою.'
        }
      ]
    },
    multiAgentAnalysis: {
      overallDecision: 'GO_WITH_CONDITIONS',
      totalCalculatedCost: 31200000,
      expectedMarginPercent: 18.9,
      agents: {
        estimator: {
          agentName: 'Орест Кошторисний',
          avatar: '👷',
          status: 'PASSED_WITH_WARNINGS',
          summary: 'Собівартість об’єкта за ринковими цінами складає 31.2 млн грн проти очікуваної 38.5 млн грн. Потенційна економія 7.3 млн грн.',
          costBreakdown: {
            materialsCost: 17800000,
            laborCost: 7900000,
            machineryCost: 3100000,
            overheadsAndTaxes: 2400000
          },
          recommendations: [
            'Закуповувати арматуру напряму у металотрейдерів (економія 23%).',
            'Запропонувати сертифікований український еквівалент гідроізоляції.'
          ]
        },
        techLead: {
          agentName: 'Віталій Інженерний (ГІП)',
          avatar: '🏗️',
          status: 'PASSED_WITH_WARNINGS',
          summary: 'Технологічний цикл вимагає мінімум 45 днів замість 18 днів. Необхідно подати запит на роз\'яснення / зміну умов договору.',
          timelineWeeks: 7,
          keyRisks: [
            'Ризик штрафних санкцій за прострочення у разі збереження 18-денного строку.'
          ]
        },
        legalCounsel: {
          agentName: 'Юлія Правова',
          avatar: '⚖️',
          status: 'PASSED_WITH_WARNINGS',
          summary: 'Потрібно оскаржити радіус 12 км в АМКУ перед поданням пропозиції. Імовірність задоволення скарги – понад 90%.',
          complianceScore: 92,
          requiredCertificates: [
            'Ліцензія ДІАМ (клас наслідків СС2/СС3)',
            'Дозвіл Держпраці на роботи на висоті',
            'Банківська гарантія 192 500 грн (0.5%)'
          ]
        },
        antiFraud: {
          agentName: 'FoulTender Guardian',
          avatar: '🛡️',
          status: 'APPROVED',
          summary: 'У замовника 12 попередніх скарг до АМКУ, з яких 9 задоволено. Замовник завжди виконує рішення Колегії АМКУ.',
          corruptionRiskScore: 78
        },
        bidManager: {
          agentName: 'Максим Стратег',
          avatar: '💼',
          status: 'RECOMMENDED',
          summary: 'Стратегія: Подати скаргу до АМКУ, домогтися збільшення строку до 45 днів і виключення вимоги про 12 км. Потім вийти на аукціон з ціною 34 200 000 грн.',
          recommendedBidPrice: 34200000,
          winProbability: 82
        }
      }
    },
    createdDate: '2024-10-18'
  },
  {
    id: 'tender-2',
    tenderNumber: 'UA-2024-09-29-001205-c',
    title: 'Реконструкція лікувального корпусу КНП «Міська клінічна лікарня швидкої допомоги» з утепленням фасадів',
    customer: 'Департамент регіонального розвитку та будівництва Львівської ОДА',
    customerEdrpou: '39481920',
    customerCity: 'м. Львів',
    budgetUah: 64200000,
    deadline: '2024-11-30',
    region: 'Львівська обл.',
    status: 'ACTIVE',
    category: 'Будівельні роботи',
    foulScore: 28,
    riskLevel: 'LOW',
    summary: 'Чиста та конкурентна закупівля. Відсутні штучні дискримінаційні бар\'єри. Збалансований кошторис та реальні строки (12 місяців).',
    tenderText: `Предмет закупівлі: Реконструкція лікувального корпусу.
Термін виконання: до 15.11.2025 р.
Кваліфікаційні вимоги згідно ст. 16 ЗУ:
- Наявність обладнання та МТБ (риштування, підйомники, тепловізори).
- Наявність кваліфікованих працівників з відповідними допусками.
- Досвід виконання робіт з утеплення та реконструкції будівель соціальної інфраструктури.`,
    specifications: 'Утеплення мінераловатними плитами 150 мм, заміна віконних блоків на енергозберігаючі 5-камерні, модернізація системи опалення.',
    boqItems: [
      {
        id: 'boq-201',
        code: 'ДБН Р-12-10',
        description: 'Утеплення фасадів мінераловатними плитами товщиною 150 мм з армуванням та короїдом',
        unit: 'м²',
        quantity: 5800,
        standardPriceUah: 1650,
        marketPriceUah: 1580,
        laborHours: 950,
        anomaly: 'NORMAL'
      },
      {
        id: 'boq-202',
        code: 'ДБН В-7-200',
        description: 'Встановлення металопластикових віконних блоків із двокамерним енергозберігаючим склопакетом',
        unit: 'м²',
        quantity: 1120,
        standardPriceUah: 5200,
        marketPriceUah: 5100,
        laborHours: 320,
        anomaly: 'NORMAL'
      },
      {
        id: 'boq-203',
        code: 'ДБН О-1-040',
        description: 'Монтаж радіаторів опалення сталевих панельних типу 22 з терморегуляторами',
        unit: 'шт',
        quantity: 280,
        standardPriceUah: 4100,
        marketPriceUah: 3950,
        laborHours: 140,
        anomaly: 'NORMAL'
      }
    ],
    violations: [],
    amcuAppealRecommendation: {
      recommended: false,
      winProbabilityPercent: 10,
      appealGrounds: 'Тендерна документація відповідає нормам законодавства.',
      estimatedAmcuFeeUah: 85000
    },
    multiAgentAnalysis: {
      overallDecision: 'GO',
      totalCalculatedCost: 52800000,
      expectedMarginPercent: 17.7,
      agents: {
        estimator: {
          agentName: 'Орест Кошторисний',
          avatar: '👷',
          status: 'APPROVED',
          summary: 'Кошторис реалістичний. Прорахована собівартість 52.8 млн грн дозволяє надати знижку 8% на аукціоні при збереженні маржі 17.7%.',
          costBreakdown: {
            materialsCost: 31200000,
            laborCost: 14100000,
            machineryCost: 3800000,
            overheadsAndTaxes: 3700000
          }
        },
        techLead: {
          agentName: 'Віталій Інженерний (ГІП)',
          avatar: '🏗️',
          status: 'APPROVED',
          summary: 'Графік 12 місяців достатній для якісного виконання робіт у теплий період.',
          timelineWeeks: 50,
          keyRisks: ['Необхідність координації робіт з діючим стаціонаром лікарні']
        },
        legalCounsel: {
          agentName: 'Юлія Правова',
          avatar: '⚖️',
          status: 'APPROVED',
          summary: 'Повний комплаєнс документів. Усі довідки стандартні.',
          complianceScore: 100
        },
        antiFraud: {
          agentName: 'FoulTender Guardian',
          avatar: '🛡️',
          status: 'APPROVED',
          summary: 'Замовник має високий рейтинг своєчасності розрахунків (середня затримка 4 дні).',
          corruptionRiskScore: 14
        },
        bidManager: {
          agentName: 'Максим Стратег',
          avatar: '💼',
          status: 'RECOMMENDED',
          summary: 'Рекомендовано брати участь. Стартова ставка 58 900 000 грн.',
          recommendedBidPrice: 58900000,
          winProbability: 88
        }
      }
    },
    createdDate: '2024-09-29'
  },
  {
    id: 'tender-3',
    tenderNumber: 'UA-2024-10-05-008912-b',
    title: 'Будівництво магістрального водогону та насосної станції 2-го підйому',
    customer: 'КП «Міськводоканал» Дніпровської міської ради',
    customerEdrpou: '38192034',
    customerCity: 'м. Дніпро',
    budgetUah: 112000000,
    deadline: '2024-12-15',
    region: 'Дніпропетровська обл.',
    status: 'BID_IN_PREPARATION',
    category: 'Будівництво інженерних споруд',
    foulScore: 62,
    riskLevel: 'MEDIUM',
    summary: 'Виявлено завищення розцінок на насосне обладнання європейського виробництва на 25% та завищені вимоги до статутного капіталу учасника.',
    tenderText: `Будівництво магістрального водопроводу Ø630 мм протяжністю 8.4 км.
Вимоги:
- Наявність статутного капіталу не менше 50 млн грн.
- Власна техніка для горизонтально-направленого буріння (ГНБ).
- Банківська гарантія забезпечення пропозиції 3%.`,
    specifications: 'Труби поліетиленові ПЕ 100 SDR 17 Ø630х37.4 мм, насоси Grundfos Hydro MPC або Wilo.',
    boqItems: [
      {
        id: 'boq-301',
        code: 'ДБН В-1-630',
        description: 'Прокладання трубопроводів з поліетиленових труб ПЕ-100 Ø630 мм у траншеях',
        unit: 'м.п.',
        quantity: 8400,
        standardPriceUah: 8200,
        marketPriceUah: 7100,
        laborHours: 1800,
        anomaly: 'OVERPRICED',
        notes: 'Ціна труби завищена на 15%'
      },
      {
        id: 'boq-302',
        code: 'ДБН Н-4-100',
        description: 'Монтаж насосної станції підвищення тиску Wilo Helix V 5204',
        unit: 'компл',
        quantity: 3,
        standardPriceUah: 4200000,
        marketPriceUah: 3300000,
        laborHours: 420,
        anomaly: 'OVERPRICED',
        notes: 'Маржинальна надбавка постачальника понад 27%'
      }
    ],
    violations: [
      {
        id: 'viol-301',
        type: 'DISCRIMINATORY_REQUIREMENT',
        severity: 'HIGH',
        title: 'Вимога щодо мінімального статутного капіталу 50 млн грн',
        description: 'Вимога щодо розміру статутного капіталу не передбачена ст. 16 Закону та є дискримінаційною.',
        legalBasis: 'Порушення ч. 2 ст. 16 ЗУ «Про публічні закупівлі».',
        amcuPrecedent: 'Рішення АМКУ № 7812-р/пк: заборонено вимагати певний розмір статутного капіталу від учасників.'
      }
    ],
    amcuAppealRecommendation: {
      recommended: true,
      winProbabilityPercent: 91,
      appealGrounds: 'Скасування незаконної вимоги до розміру статутного капіталу.',
      estimatedAmcuFeeUah: 85000
    },
    multiAgentAnalysis: {
      overallDecision: 'GO_WITH_CONDITIONS',
      totalCalculatedCost: 89400000,
      expectedMarginPercent: 20.1,
      agents: {
        estimator: {
          agentName: 'Орест Кошторисний',
          avatar: '👷',
          status: 'APPROVED',
          summary: 'За рахунок прямого імпорту труб ПЕ100 та насосів очікуваний дохід складе понад 18 млн грн.',
          costBreakdown: {
            materialsCost: 59000000,
            laborCost: 16200000,
            machineryCost: 9400000,
            overheadsAndTaxes: 4800000
          }
        },
        techLead: {
          agentName: 'Віталій Інженерний (ГІП)',
          avatar: '🏗️',
          status: 'APPROVED',
          summary: 'Потрібно 2 установки ГНБ та зварювальні апарати для стикового зварювання ПЕ труб Ø630.',
          timelineWeeks: 24,
          keyRisks: ['Перетин із залізничною колією вимагає окремого погодження з Укрзалізницею']
        },
        legalCounsel: {
          agentName: 'Юлія Правова',
          avatar: '⚖️',
          status: 'PASSED_WITH_WARNINGS',
          summary: 'Потрібно подати вимогу замовнику щодо виключення пункту про 50 млн статутного капіталу або скаргу в АМКУ.',
          complianceScore: 88
        },
        antiFraud: {
          agentName: 'FoulTender Guardian',
          avatar: '🛡️',
          status: 'PASSED_WITH_WARNINGS',
          summary: 'Середній рівень корупційного ризику. Замовник має зв\'язки з місцевими монополіями.',
          corruptionRiskScore: 62
        },
        bidManager: {
          agentName: 'Максим Стратег',
          avatar: '💼',
          status: 'RECOMMENDED',
          summary: 'Високомаржинальний проєкт. Рекомендована ставка на аукціоні: 98 500 000 грн.',
          recommendedBidPrice: 98500000,
          winProbability: 76
        }
      }
    },
    createdDate: '2024-10-05'
  }
];

export const INITIAL_COMPLAINTS: AmcuComplaintDoc[] = [
  {
    id: 'complaint-1',
    tenderId: 'tender-1',
    tenderNumber: 'UA-2024-10-18-004819-a',
    tenderTitle: 'Капітальний ремонт захисної споруди цивільного захисту (укриття) ліцею №14 у м. Київ',
    customer: 'Управління освіти Оболонської районної в місті Києві державної адміністрації',
    complainantName: 'ТОВ «УкрБудЕкспертиза»',
    complainantEdrpou: '41928374',
    status: 'READY_FOR_SUBMISSION',
    estimatedFee: 85000,
    legalReferences: [
      'Частина 4 статті 5 Закону України «Про публічні закупівлі»',
      'Частина 4 статті 22 Закону України «Про публічні закупівлі»',
      'Частина 4 статті 23 Закону України «Про публічні закупівлі»',
      'Рішення Колегії АМКУ № 11842-р/пк-пз'
    ],
    createdAt: '2024-10-19',
    content: `ПОСТІЙНО ДІЮЧІЙ АДМІНІСТРАТИВНІЙ КОЛЕГІЇ
АНТИМОНОПОЛЬНОГО КОМІТЕТУ УКРАЇНИ З РОЗГЛЯДУ СКАРГ
ПРО ПОРУШЕННЯ ЗАКОНОДАВСТВА У СФЕРІ ПУБЛІЧНИХ ЗАКУПІВЕЛЬ
03035, м. Київ, вул. Митрополита Василя Липківського, 45

Скаржник:
Товариство з обмеженою відповідальністю «УкрБудЕкспертиза»
Код ЄДРПОУ: 41928374
Адреса: 01033, м. Київ, вул. Саксаганського, 44, оф. 12
Email: legal@ukrbud-exp.com.ua, тел.: +38 (044) 390-12-88

Суб'єкт оскарження:
Управління освіти Оболонської районної в місті Києві державної адміністрації
Код ЄДРПОУ: 37394821
Адреса: 04205, м. Київ, вул. Йорданська, 11-А

Ідентифікатор закупівлі: UA-2024-10-18-004819-a
Предмет закупівлі: «Капітальний ремонт захисної споруди цивільного захисту (укриття) ліцею №14 у м. Київ»

СКАРГА
на дискримінаційні вимоги тендерної документації

Управлінням освіти Оболонської РДА було оголошено відкриті торги з особливостями за ідентифікатором UA-2024-10-18-004819-a.
Скаржник має намір взяти участь у зазначеній процедурі закупівлі, володіє всією необхідною матеріально-технічною базою та досвідом виконання аналогічних робіт. Проте Замовником у Тендерній документації (Додаток 1 та Додаток 2) встановлено дискримінаційні вимоги, які унеможливлюють участь Скаржника та порушують основні принципи публічних закупівель.

1. ЩОДО ВИМОГИ ПРО РОЗТАШУВАННЯ ВИРОБНИЧОЇ БАЗИ НЕ ДАЛІ 12 КМ:
Замовник встановив вимогу: "Учасник зобов'язаний надати довідку про наявність власного заводу з виготовлення залізобетонних конструкцій на відстані не більше 12 км від об'єкта будівництва".
Ця вимога прямо порушує ч. 4 ст. 5 та ч. 4 ст. 22 Закону, оскільки обмежує конкуренцію за територіальною ознакою. Колегія АМКУ неодноразово вказувала (зокрема у рішенні № 11842-р/пк-пз), що встановлення обмежень щодо відстані виробничих баз є дискримінаційним.

2. ЩОДО ВКАЗІВКИ КОНКРЕТНОЇ ТОРГОВОЇ МАРКИ БЕЗ СЛІВ «АБО ЕКВІВАЛЕНТ»:
У Технічній специфікації вказано матеріал "MasterSeal" без додавання слів «або еквівалент», що є прямим порушенням ч. 4 ст. 23 Закону.

ПРОСИМО:
1. Прийняти скаргу до розгляду.
2. Зобов’язати Управління освіти Оболонської РДА усунути зазначені дискримінаційні вимоги шляхом внесення відповідних змін до тендерної документації.`
  }
];

export const INITIAL_BID_PACKAGES: BidPackage[] = [
  {
    id: 'bid-1',
    tenderId: 'tender-1',
    tenderNumber: 'UA-2024-10-18-004819-a',
    tenderTitle: 'Капітальний ремонт захисної споруди цивільного захисту (укриття) ліцею №14 у м. Київ',
    companyName: 'ТОВ «УкрБудЕкспертиза»',
    calculatedPrice: 34200000,
    marginPercent: 18.9,
    timelineDays: 45,
    status: 'IN_PROGRESS',
    updatedAt: '2024-10-20',
    documents: [
      {
        name: 'Тендерна цінова пропозиція (Форма 1)',
        type: 'FINANCIAL',
        ready: true,
        contentPreview: 'Ціна пропозиції: 34 200 000,00 грн з ПДВ. Включає всі прямі витрати, накладні витрати та прибуток.'
      },
      {
        name: 'Локальний кошторис та Договірна ціна (АВК-5)',
        type: 'ESTIMATE',
        ready: true,
        contentPreview: 'Розраховано відповідно до Кошторисних норм України. Враховано розцінки на бетон В25 та арматуру А500С.'
      },
      {
        name: 'Довідка про наявність матеріально-технічної бази',
        type: 'QUALIFICATION',
        ready: true,
        contentPreview: 'Перелік будівельної техніки: автобетонозмішувачі (4 од.), автокран 25т, зварювальні пости, вібратори глибинні.'
      },
      {
        name: 'Календарний план виконання робіт (ГІП)',
        type: 'TECHNICAL',
        ready: true,
        contentPreview: 'Загальний строк будівництва: 45 календарних днів. 4 технологічні етапи.'
      },
      {
        name: 'Гарантійний лист про відповідність нормам ДБН',
        type: 'LEGAL',
        ready: true,
        contentPreview: 'Гарантуємо дотримання ДБН В.2.2-5:2023 "Захисні споруди цивільного захисту".'
      }
    ]
  }
];

export const INITIAL_COMPANY_PROFILE: import('../types').CompanyProfile = {
  id: 'company-default-1',
  name: 'ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ «УКРБУДСТАНДАРТ-ХОЛДИНГ»',
  shortName: 'ТОВ «УКРБУДСТАНДАРТ»',
  edrpou: '39482716',
  kved: '41.20 Будівництво житлових і нежитлових будівель (основний), 42.11 Будівництво доріг і автострад, 43.22 Монтаж водопровідних мереж',
  taxNumber: '394827126558',
  legalAddress: '01032, м. Київ, вул. Саксаганського, буд. 119, оф. 402',
  actualAddress: '03035, м. Київ, вул. Сурикова, буд. 3, корп. 2',
  directorName: 'Коваленко Сергій Володимирович',
  directorPosition: 'Генеральний директор',
  directorBasis: 'Статуту підприємства',
  iban: 'UA843052990000026004019283746',
  bankName: 'АТ КБ «ПРИВАТБАНК», м. Київ',
  mfo: '305299',
  email: 'tender@ukrbudstandart.ua',
  phone: '+38 (044) 390-48-22',
  isVatPayer: true,
  historicalStats: {
    totalParticipated: 12,
    wonCount: 4,
    lostCount: 5,
    disqualifiedCount: 3,
    totalWonAmountUah: 74650000
  },
  licenses: [
    'Ліцензія ДІАМ України № 2019062391: Будівництво об\'єктів із середніми (СС2) та значними (СС3) наслідками',
    'Дозвіл Держпраці № 482.21.32 на виконання робіт підвищеної небезпеки (верхолазні, газополум\'яні, земляні роботи глибиною понад 2м)',
    'Декларація відповідності матеріально-технічної бази вимогам законодавства з охорони праці № ДК-08/2023-11'
  ],
  equipment: [
    {
      id: 'eq-1',
      name: 'Автобетонозмішувач MAN TGS 33.360 6x4 BB-WW',
      model: 'Об\'єм 9.0 м³, держномер AA 4920 IK',
      ownership: 'OWNED',
      docNumber: 'Свідоцтво про реєстрацію СХЕ 918234 від 14.05.2021',
      status: 'VALID'
    },
    {
      id: 'eq-2',
      name: 'Автомобільний кран Liebherr LTM 1050-3.1',
      model: 'Вантажопідйомність 50 т, виліт стріли 38 м',
      ownership: 'RENTED',
      docNumber: 'Договір оренди спецтехніки № 12/ОР-24 від 15.01.2024 з ТОВ «БудКранСервіс»',
      expiryDate: '2027-12-31',
      status: 'VALID'
    },
    {
      id: 'eq-3',
      name: 'Екскаватор гусеничний JCB JS 220 LC',
      model: 'Об\'єм ковша 1.25 м³, глибина копання 6.6 м',
      ownership: 'OWNED',
      docNumber: 'Свідоцтво про реєстрацію ТЗ ВВ 304918 від 22.09.2020',
      status: 'VALID'
    },
    {
      id: 'eq-4',
      name: 'Станція штукатурна PFT G4 Smart',
      model: 'Продуктивність 22 л/хв, шланг 15 м (3 од.)',
      ownership: 'OWNED',
      docNumber: 'Інвентарні картки ОЗ № 104/1, 104/2, 104/3',
      status: 'VALID'
    },
    {
      id: 'eq-5',
      name: 'Асфальтоукладач Vogele Super 1800-3i',
      model: 'Ширина укладання 2.55-5.00 м',
      ownership: 'RENTED',
      docNumber: 'Договір оренди № 04/24-АС від 01.03.2024',
      expiryDate: '2026-09-30',
      status: 'EXPIRING_SOON'
    },
    {
      id: 'eq-6',
      name: 'Геодезичний тахеометр Leica FlexLine TS07',
      model: 'Кутова точність 2", метрологічна повірка № 891/24',
      ownership: 'OWNED',
      docNumber: 'Свідоцтво про повірку законодавчо регульованого ЗВТ № П-4920/24',
      expiryDate: '2027-04-18',
      status: 'VALID'
    }
  ],
  staff: [
    {
      id: 'st-1',
      fullName: 'Лисенко Петро Андрійович',
      position: 'Головний інженер проєкту (ГІП) / Сертифікований інженер-будівельник',
      education: 'Київський національний університет будівництва і архітектури (КНУБА), спеціальність ПЦБ',
      experienceYears: 18,
      certificates: [
        'Кваліфікаційний сертифікат провідного інженера технагляду АР № 019284',
        'Сертифікат з будівельного проєктування серія АР № 014820',
        'Посвідчення з безпечного ведення робіт на висоті та ОП № 1928-ОП'
      ],
      employmentType: 'PRIMARY',
      safetyCertExpiry: '2027-08-15',
      status: 'VALID'
    },
    {
      id: 'st-2',
      fullName: 'Дмитренко Ольга Василівна',
      position: 'Провідний інженер-кошторисник',
      education: 'Національний транспортний університет, Економіка підприємства',
      experienceYears: 12,
      certificates: [
        'Кваліфікаційний сертифікат інженера-кошторисника серія АР № 008472 (чинний)',
        'Свідоцтво володіння ПК АВК-5, Будівельні Технології-Кошторис'
      ],
      employmentType: 'PRIMARY',
      safetyCertExpiry: '2028-02-10',
      status: 'VALID'
    },
    {
      id: 'st-3',
      fullName: 'Григоренко Віталій Олександрович',
      position: 'Начальник дільниці / Виконроб (будівництво СС2/СС3)',
      education: 'Одеська державна академія будівництва та архітектури',
      experienceYears: 14,
      certificates: [
        'Посвідчення з охорони праці (НПАОП 0.00-1.15-07) № 4920-21',
        'Посвідчення IV група допуску з електробезпеки (до 1000В)'
      ],
      employmentType: 'PRIMARY',
      safetyCertExpiry: '2026-10-15',
      status: 'EXPIRING_SOON'
    },
    {
      id: 'st-4',
      fullName: 'Ковальчук Андрій Миколайович',
      position: 'Інженер з охорони праці та цивільного захисту',
      education: 'Національний університет цивільного захисту України',
      experienceYears: 9,
      certificates: [
        'Сертифікат аудитора з охорони праці ISO 45001',
        'Посвідчення відповідальної особи за протипожежну безпеку'
      ],
      employmentType: 'PRIMARY',
      safetyCertExpiry: '2027-11-20',
      status: 'VALID'
    },
    {
      id: 'st-5',
      fullName: 'Бондар Тарас Григорович',
      position: 'Електрозварник ручного зварювання 6-го розряду',
      education: 'Київський професійний будівельний ліцей',
      experienceYears: 11,
      certificates: [
        'Атестаційне посвідчення зварника згідно ДСТУ EN ISO 9606-1',
        'Допуск до робіт в замкнутих просторах та захисних спорудах'
      ],
      employmentType: 'PRIMARY',
      safetyCertExpiry: '2027-03-30',
      status: 'VALID'
    }
  ],
  contracts: [
    {
      id: 'cnt-1',
      customerName: 'Управління капітального будівництва Дарницької РДА м. Києва',
      subjectOfProcurement: 'Капітальний ремонт захисної споруди цивільного захисту ліцею №291 по вул. Тростянецька, 19 у Дарницькому районі м. Києва',
      contractNumber: '№ 44/КБ-23',
      contractDate: '2023-08-14',
      amountUah: 28450000,
      actsKb2vUploaded: true,
      feedbackLetterUploaded: true,
      contactPerson: 'Мельник Ігор Васильович (Начальник техвідділу)',
      phone: '+38 (044) 564-90-12'
    },
    {
      id: 'cnt-2',
      customerName: 'Департамент регіонального розвитку Київської ОДА',
      subjectOfProcurement: 'Будівництво монолітного протирадіаційного укриття опорного закладу освіти у м. Бориспіль',
      contractNumber: '№ 102/2023-ОДА',
      contractDate: '2023-11-02',
      amountUah: 46200000,
      actsKb2vUploaded: true,
      feedbackLetterUploaded: true,
      contactPerson: 'Сидоренко Ганна Павлівна',
      phone: '+38 (04595) 6-12-88'
    },
    {
      id: 'cnt-3',
      customerName: 'КНП «Київська міська клінічна лікарня швидкої медичної допомоги»',
      subjectOfProcurement: 'Реконструкція приймального відділення та операційного блоку з посиленням несучих конструкцій',
      contractNumber: '№ 78-Т/22',
      contractDate: '2022-09-18',
      amountUah: 31800000,
      actsKb2vUploaded: true,
      feedbackLetterUploaded: true,
      contactPerson: 'Ткаченко Володимир Сергійович',
      phone: '+38 (044) 518-42-10'
    }
  ],
  vaultDocuments: [
    {
      id: 'doc-v-1',
      title: 'Сертифікат ISO 9001:2015 (Система управління якістю у будівництві)',
      category: 'ISO_CERTIFICATES',
      fileNumber: 'ISO-UA.QMS.2023.0841',
      issueDate: '2023-04-10',
      expiryDate: '2026-04-09',
      issuer: 'Орган сертифікації «УКРСЕПРО-СТАНДАРТ» (Акредитація НААУ № 1О049)',
      status: 'VALID',
      tags: ['ISO 9001', 'Якість', 'Кваліфікація'],
      fileSize: '2.4 MB'
    },
    {
      id: 'doc-v-2',
      title: 'Сертифікат ISO 14001:2015 (Системи екологічного управління)',
      category: 'ISO_CERTIFICATES',
      fileNumber: 'ISO-UA.EMS.2023.0842',
      issueDate: '2023-04-10',
      expiryDate: '2026-04-09',
      issuer: 'Орган сертифікації «УКРСЕПРО-СТАНДАРТ»',
      status: 'VALID',
      tags: ['ISO 14001', 'Екологія', 'ДБН'],
      fileSize: '1.9 MB'
    },
    {
      id: 'doc-v-3',
      title: 'Сертифікат ISO 45001:2018 (Система охорони здоров\'я та безпеки праці)',
      category: 'ISO_CERTIFICATES',
      fileNumber: 'ISO-UA.OHS.2023.0843',
      issueDate: '2023-04-10',
      expiryDate: '2026-04-09',
      issuer: 'Орган сертифікації «УКРСЕПРО-СТАНДАРТ»',
      status: 'VALID',
      tags: ['ISO 45001', 'Охорона праці'],
      fileSize: '2.1 MB'
    },
    {
      id: 'doc-v-4',
      title: 'Ліцензія ДІАМ на будівництво об\'єктів СС2/СС3',
      category: 'LICENSES_PERMITS',
      fileNumber: '№ 2019062391',
      issueDate: '2021-06-15',
      issuer: 'Державна інспекція архітектури та містобудування України',
      status: 'VALID',
      tags: ['Ліцензія', 'СС2', 'СС3', 'ДІАМ'],
      fileSize: '3.8 MB'
    },
    {
      id: 'doc-v-5',
      title: 'Дозвіл Держпраці на експлуатацію машин/механізмів підвищеної небезпеки',
      category: 'LICENSES_PERMITS',
      fileNumber: '№ 482.21.32-ДП',
      issueDate: '2021-11-20',
      expiryDate: '2026-11-19',
      issuer: 'Головне управління Держпраці у Київській області',
      status: 'VALID',
      tags: ['Держпраці', 'Кранові роботи', 'Спецтехніка'],
      fileSize: '1.7 MB'
    },
    {
      id: 'doc-v-6',
      title: 'Фінансова звітність за 2023 рік (Баланс Форма 1-м, Звіт про фінрезультати Форма 2-м)',
      category: 'FINANCIAL_LEGAL',
      fileNumber: 'Квитанція № 2 від ДПС № 938491823',
      issueDate: '2024-02-15',
      issuer: 'Державна податкова служба України',
      status: 'VALID',
      tags: ['Баланс', 'Фінзвітність', 'Чистий дохід > 50 млн'],
      fileSize: '1.2 MB'
    },
    {
      id: 'doc-v-7',
      title: 'Довідка ДПС про відсутність заборгованості з платежів до бюджету',
      category: 'FINANCIAL_LEGAL',
      fileNumber: '№ 4920/10/26-15-12',
      issueDate: '2024-10-10',
      expiryDate: '2024-11-10',
      issuer: 'ГУ ДПС у м. Києві',
      status: 'EXPIRING_SOON',
      tags: ['ДПС', 'Без податкового боргу', 'Стаття 17'],
      fileSize: '0.8 MB'
    },
    {
      id: 'doc-v-8',
      title: 'Витяг з Єдиного державного реєстру (ЄДРПОУ)',
      category: 'FINANCIAL_LEGAL',
      fileNumber: 'Код доступу: 492019482716',
      issueDate: '2024-10-01',
      issuer: 'Міністерство юстиції України',
      status: 'VALID',
      tags: ['ЄДР', 'Статутні документи'],
      fileSize: '1.5 MB'
    }
  ]
};

export const INITIAL_COMPETITORS: import('../types').CompetitorProfile[] = [
  {
    id: 'comp-1',
    name: 'ТОВ «Столичний Моноліт Буд»',
    edrpou: '38192049',
    winRatePercent: 74.2,
    totalTenders: 42,
    avgPriceDropPercent: 3.4,
    disqualificationRatePercent: 4.8,
    suspiciousPairingsCount: 18,
    frequentPartners: ['ТОВ «КиївБудКомплект-2020»', 'ПП «СпецРемБудСервіс»'],
    riskIndicators: [
      'Спільні IP-адреси подання пропозицій з ТОВ «КиївБудКомплект-2020» у 14 закупівлях',
      'Мінімальне зниження ціни на аукціоні (0.5% - 2.0%) за наявності технічного спаринг-партнера',
      'Один і той самий контактний телефон в ЄДР з компанією-конкурентом'
    ]
  },
  {
    id: 'comp-2',
    name: 'ТОВ «КиївБудКомплект-2020»',
    edrpou: '43920194',
    winRatePercent: 12.5,
    totalTenders: 36,
    avgPriceDropPercent: 0.8,
    disqualificationRatePercent: 68.0,
    suspiciousPairingsCount: 18,
    frequentPartners: ['ТОВ «Столичний Моноліт Буд»'],
    riskIndicators: [
      'Ознаки «технічного учасника»: подання неповної довідки про персонал або ненадання банківської гарантії',
      'Повна відсутність цінової активності у раундах редукціону',
      'Накладення штрафу АМКУ у 2023 році за антиконкурентні узгоджені дії'
    ]
  },
  {
    id: 'comp-3',
    name: 'ПП «УкрІнжПроектБуд»',
    edrpou: '35481920',
    winRatePercent: 41.0,
    totalTenders: 29,
    avgPriceDropPercent: 11.2,
    disqualificationRatePercent: 13.8,
    suspiciousPairingsCount: 3,
    frequentPartners: [],
    riskIndicators: [
      'Регулярне оскарження дискримінаційних умов замовників в АМКУ (85% задоволених скарг)',
      'Реальний конкурент з потужною власною базою техніки'
    ]
  }
];

