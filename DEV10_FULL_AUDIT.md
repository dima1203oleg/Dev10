# Розширений аудит кодової бази Dev10 (TenderAI OS v2.0 -> v3.0)

Цей документ містить пофайловий аналіз поточного прототипу з конкретними вказівками щодо подальшого рефакторингу, видалення або заміни для переходу до production-ready системи (v3.0).

## 1. DATA LAYER & STATE MANAGEMENT

| Файл / Сутність | Дія | Опис проблеми та план дій |
| :--- | :---: | :--- |
| `src/data/mockTenders.ts` | **DELETE** | Повністю видалити. Система не повинна мати захардкоджених тендерів, компаній чи скарг. Замінити на звернення до бекенду (API). |
| `src/App.tsx` (State) | **REPLACE** | Видалити логіку `localStorage` для тендерів, компаній та рішень. Замінити на React Query / SWR або Redux Toolkit для роботи з реальними API-ендпоінтами. |
| `src/types.ts` | **REFACTOR** | Перебудувати модель даних. Додати нові сутності: `Evidence`, `Requirement`, `TenderState` (від DISCOVERED до POST_TENDER), `TenderParticipant`. Прибрати жорстко задані поля для mock-даних. |

## 2. BACKEND & API (server.ts)

| Файл / Сутність | Дія | Опис проблеми та план дій |
| :--- | :---: | :--- |
| `server.ts` | **REFACTOR** | Поточний Express-сервер є рудиментарним. Потрібно підключити ORM (Prisma/Drizzle), налаштувати підключення до PostgreSQL. |
| `/api/foultender/audit` | **REPLACE** | **КРИТИЧНО:** Видалити fake fallback. Якщо Gemini API недоступний або сталася помилка — повертати `500 Internal Server Error`, а не згенерований `foulScore: 78`. |
| `/api/tenders/*` | **ADD** | Створити CRUD ендпоінти для тендерів, які будуть тягнути дані з бази (куди вони потрапляють через парсер Prozorro). |
| `/api/agents/*` | **ADD** | Створити ендпоінти для виклику конкретних AI-агентів (Legal Agent, Cost Agent, QA Agent). |

## 3. UI COMPONENTS (src/components/*)

| Файл / Сутність | Дія | Опис проблеми та план дій |
| :--- | :---: | :--- |
| `TenderRadarModule.tsx` | **REFACTOR** | Видалити логіку `if (prompt.includes('школ'))`. Радар повинен відправляти запит на бекенд (Semantic Search API), де LLM розбирає інтент і шукає по базі. Видалити fallback `overallScore \|\| 94` — замінити на статус "Недостатньо даних". |
| `FoulTenderModule.tsx` | **REFACTOR** | Видалити генерацію вільних думок ШІ. Вимоги повинні базуватись на структурованій базі доказів (Evidence). Висновок = Факт + Юридична норма + Доказ. |
| `TenderWarRoomModule.tsx` | **KEEP** | UI/UX залишається. Логіку (Gantt, Price Scenarios) потрібно прив'язати до реальних розрахунків Cost Engine, а не статичних масивів. |
| `PreSubmissionAuditModule.tsx`| **REFACTOR**| Повинен стати реальним фінальним бар'єром. Замінити статичні чеклісти на динамічні перевірки, що базуються на стані `TenderState`. |
| `PostTenderModule.tsx` | **REFACTOR** | `winProbabilityPercent` та суми зборів АМКУ не можуть бути захардкоджені. Збір АМКУ повинен розраховуватися за формулою (відсоток від бюджету лоту), а ймовірність — показувати "Insufficient data", поки немає реальної історії. |
| `CompetitorCollusionModule` | **REPLACE** | Замість `INITIAL_COMPETITORS` модуль має робити запит до бекенду, де Graph DB (або реляційна з рекурсією) аналізує реальні історичні перетини учасників на торгах. |

## 4. НОВІ СТРУКТУРНІ МОДУЛІ (Backend/Services)

| Сутність | Дія | Опис |
| :--- | :---: | :--- |
| `services/prozorro.ts` | **ADD** | Конектор для інтеграції з Prozorro API (пошук за ID, парсинг документів). |
| `services/ai/orchestrator.ts`| **ADD** | Центральний контролер, який отримує тендер і запускає послідовно/паралельно агентів (Legal, Cost, Risk). |
| `services/db/schema.ts` | **ADD** | Схема бази даних для PostgreSQL. |

## ВИСНОВОК

**UI та компонентна база** — **KEEP** (відмінний рівень, потребує лише підключення до реальних даних).
**State Management та Backend** — **REPLACE / REBUILD** (перехід від mock/localStorage до PostgreSQL + Node.js API + Real AI Orchestration).
