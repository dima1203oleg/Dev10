# TENDERAI OS v3.0 — MASTER IMPLEMENTATION SPECIFICATION

Цей документ є майстер-специфікацією для AI-асистента. Він визначає архітектуру, принципи та поетапний план переходу від прототипу (Dev10) до production-ready системи (TenderAI OS v3.0).

## 1. CORE PRINCIPLES (ЗАЛІЗНІ ПРАВИЛА РОЗРОБКИ)

1. **NO MOCK DATA**: Жодних `INITIAL_TENDERS`, `tender-1`, або локальних заглушок. Дані надходять виключно з API/Бази даних.
2. **NO LOCALSTORAGE FOR BUSINESS DATA**: Тендери, компанії, скарги зберігаються у PostgreSQL. LocalStorage допускається ЛИШЕ для UI-налаштувань (тема, токен авторизації).
3. **FAIL-CLOSED AI**: ШІ не повинен генерувати "заглушки" у разі помилки. Якщо сталася помилка, система показує `UNKNOWN` або `ERROR`. Ніяких захардкоджених `Foul Score: 78`.
4. **EVIDENCE-FIRST**: Жоден юридичний або фінансовий висновок не робиться без прив'язки до доказу (Evidence).
5. **NO FAKE PROBABILITIES**: Якщо даних для розрахунку шансу перемоги недостатньо, виводити `Insufficient data`.

## 2. ARCHITECTURE STACK

* **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion (існуючий стек).
* **Backend**: Node.js (Express/Fastify) в межах `server.ts` (або виділеної структури).
* **Database**: PostgreSQL (доступ через ORM - Drizzle або Prisma).
* **State Management**: React Query / SWR для роботи з API (замість локальних стейтів).
* **AI Orchestration**: @google/genai SDK з використанням інструментів функціонального виклику (Function Calling) для отримання структурованих JSON-відповідей.

## 3. CORE DATA MODELS (Додати у `src/types.ts` та DB Schema)

### 3.1. Tender Lifecycle State
Єдина модель стану тендера (замість розрізнених модулів):
`DISCOVERED` -> `ANALYZING` -> `BID_DECISION` -> `PREPARING` -> `LEGAL_REVIEW` -> `COST_REVIEW` -> `FINAL_QA` -> `READY_TO_SUBMIT` -> `SUBMITTED` -> `RESULT` -> `POST_TENDER`

### 3.2. Evidence Model
Центральна сутність для всіх ШІ-висновків:
```typescript
interface Evidence {
  id: string;
  sourceType: 'LAW' | 'AMCU_DECISION' | 'TENDER_DOC' | 'COMPANY_VAULT';
  sourceId/Url: string;
  textExcerpt: string;
  confidenceScore: number;
}
```

### 3.3. Requirement Model
```typescript
interface Requirement {
  id: string;
  tenderId: string;
  category: 'LEGAL' | 'FINANCIAL' | 'TECHNICAL' | 'PERSONNEL' | 'EQUIPMENT';
  text: string;
  documentaryStatus: 'CONFIRMED' | 'MISSING' | 'UNKNOWN';
  factualStatus: 'AVAILABLE' | 'ACQUIRABLE' | 'UNAVAILABLE';
}
```

## 4. IMPLEMENTATION STAGES (ПЛАН ДІЙ ДЛЯ AI)

### Stage 1: Reality Check & Cleanup (Очищення)
* Видалити `mockTenders.ts` та всі пов'язані імпорти.
* Вичистити `localStorage` логіку збереження бізнес-даних в `App.tsx`.
* Видалити всі fake fallbacks із `server.ts` (заглушки для API).
* Замінити захардкоджені відсотки в UI на змінні, що підтягуються з об'єкта.

### Stage 2: Data Foundation (Схема та БД)
* Налаштувати підключення до PostgreSQL (наприклад, через Drizzle ORM).
* Створити схеми для `Tenders`, `Companies`, `Requirements`, `Evidence`.
* Створити базові CRUD API-роути в `server.ts`.

### Stage 3: Real Procurement Connector
* Реалізувати сервіс для отримання даних.
* В UI (Catalog) замінити форму ручного створення тендера на поле вводу `Prozorro ID` або `URL` з автоматичним парсингом.

### Stage 4: AI Agents Orchestration
Переписати AI-взаємодію на сервері. Замість одного загального промпту створити пайплайн:
1. `TenderParserAgent`: розбиває ТД на масив `Requirement`.
2. `CompanyMatcherAgent`: порівнює `Requirement` з `Company Vault`.
3. `LegalAgent`: шукає дискримінації та підтягує `Evidence`.
4. `RiskAgent`: формує фінальний Score на основі агрегованих даних.

### Stage 5: Unified UI Integration
* Підключити Frontend-компоненти (Radar, War Room, Matrix) до нових API ендпоінтів.
* Реалізувати відображення `TenderState` у War Room.
* Додати UI для відображення `Evidence` (джерела) при наведенні або кліку на будь-який AI-висновок.

---
**Інструкція для AI:** При отриманні команди на виконання, діяти СУВОРО за етапами. Не переходити до Stage 2, доки повністю не завершено Stage 1. Кожна зміна коду повинна відповідати Core Principles.
