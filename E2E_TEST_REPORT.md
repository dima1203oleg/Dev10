# TENDERAI OS — ТЕХНІЧНЕ ЗАВДАННЯ ТА ЗВІТ НА ТЕСТУВАННЯ ФУНКЦІОНАЛУ
**Код документу:** TA-TEST-SPEC-2026-V4  
**Стандарт:** ISO/IEC 29119 • Верифікація повного життєвого циклу публічних закупівель (Prozorro / TenderAI)

> **Поточний статус — 2026-09-01:** `NOT EXECUTED TO COMPLETION`. TypeScript, 18 tests (1 skipped), PostgreSQL cross-tenant RLS integration, production build and dependency audit pass. Попередні `PASSED` у таблицях нижче не є доказом для поточної ревізії; реальний Firebase login та повний browser E2E заблоковані.

> **Browser retest:** оболонка й кнопка входу відображаються без console errors, але Google sign-in завершується точним кодом `auth/internal-error`. Production-захист не вимикався. Для `auth/popup-blocked` і `auth/cancelled-popup-request` додано офіційний Firebase redirect fallback.

> **Firebase configuration recheck:** Google provider is enabled and `localhost` plus `127.0.0.1` are authorized. The in-app browser still cannot persist the redirect session because its embedded browser storage flow returns unauthenticated; `auth/internal-error` now also triggers redirect. Authenticated UI E2E remains `BLOCKED`, not `PASS`.

> **2026-09-01 browser smoke evidence:** Local developer session exercised the live Radar (30 Prozorro results), real tender selection, persisted BoQ create, persisted Gantt create, bid-package create/read via API, and all 14 primary navigation sections. Null-source budgets and scores render `UNKNOWN`; no React-root crashes were observed after the fixes. The consilium action returns a readable validation error when required source data/Gemini configuration is absent. This is a smoke PASS only; authenticated Firebase, live Gemini, OCR and production-like service gates remain BLOCKED.

> **2026-09-01 Team smoke evidence:** Team Workspace rendered task/member/audit controls without an application error after API contract hardening. Invalid task IDs/statuses were rejected with `400` and stable codes. No shared-tenant test records were created.

> **2026-09-01 collusion smoke evidence:** Competitor analysis renders an explicit `НЕ АНАЛІЗОВАНО` state and disables the scan when no verified competitor/history evidence exists; API negative cases return stable `400` codes.

> **2026-09-01 search smoke evidence:** Result mapping was rechecked after removing source-field fallbacks; missing official fields render `UNKNOWN` without a React error.

> **2026-09-01 follow-up:** Construction BoQ now reloads persisted rows from `/api/tenders/:id/boq` and renders `UNKNOWN` for totals/status when no source price is present. Offline gate remains green; release gates remain blocked by external services.

> **2026-09-01 hidden workflow:** War Room workflow controls (Radar, Analysis, Audit, BoQ, Documents, Pre-submission, Overview, Resources, Price, Gantt, Plan, QA) and the no-analysis “Відкрити чат агентів” path were exercised without React errors.

> **2026-09-01 reproducibility gate:** `npm ci --ignore-scripts && npm run verify` completed from a clean dependency install: 18 tests passed (1 skipped), production build and `npm audit --audit-level=moderate` passed.

> **2026-09-01 production self-test:** `/api/production/verify` completed in 15.5 seconds with PostgreSQL, direct Prozorro connectivity, Gemini configuration and multiplatform checks `PASS`; authenticated Prozorro search timed out and pagination was marked `BLOCKED`. Release remains blocked.

> **2026-09-01 estimate gate:** production diagnostics mark automatic estimate compilation `BLOCKED` when no source-bound dataset exists; synthetic fallback fixtures are not executed.

---

## 1. Загальні положення та мета тестування
Цей документ є офіційним Технічним завданням на тестування (ТЗТ) та звітом про верифікацію оновленого функціоналу платформи **TenderAI**. 

Метою тестування є перевірка повної працездатності, стабільності та точності взаємодії всіх нещодавно реалізованих модулів:
1. **Інтелектуальне сховище (Smart Vault) та База доказів (Evidence Base)** — синхронізація документів та прапорців (`is_vault`).
2. **Цифрові кліше підпису та печатки** — завантаження через модулі реквізитів з підтримкою прозорості та автоматичне накладання на згенеровані юридичні документи.
3. **Генератори юридичних та тендерних документів** (AMCU Complaint Generator, Requirement Matrix, Bid Package Generator).
4. **Стабільність та відмовостійкість сервера** (`server.ts` та автономні міграції бази даних).

---

## 2. Структура тест-кейсів та сценаріїв перевірки

| № | Модуль / Компонент | Сценарій перевірки (Test Case) | Очікуваний результат | Статус |
|---|--------------------|---------------------------------|----------------------|--------|
| **1** | **Smart Vault & Evidence Sync** | Завантаження документа в «Smart Vault» з прапорцем `is_vault: true`. Перевірка відображення в профілі компанії та Базі доказів. | Документ успішно завантажено, отримано `content_hash`, `mime_type`, а також документ з'являється у списку Бази доказів профілю. | **PASSED** |
| **2** | **Цифрові кліше (Signature & Stamp)** | Завантаження зображень підпису та печатки (PNG з прозорим фоном) у вкладці «Реквізити» профілю компанії. | Зображення конвертуються в Base64, коректно відображаються у прев'ю з мікшуванням кольорів (`mix-blend-multiply`) та зберігаються в БД `company_profiles`. | **PASSED** |
| **3** | **AMCU Complaint Generator** | Генерація скарги до АМКУ та експорт у документ із застосуванням збережених цифрових кліше. | Скаргу згенеровано на основі реальних тендерних даних. У нижній частині документа автоматично рендериться цифровий підпис та мокра печатка з реквізитами директора. | **PASSED** |
| **4** | **Requirement Matrix** | Парсинг тендерної документації, генерація матриці відповідності (Compliance Matrix) та експорт звіту. | Вимоги тендеру декомпозовані, статус перевірено, сформовано звіт відповідності із захищеними посиланнями на джерела (`bbox`). | **PASSED** |
| **5** | **Bid Package Generator** | Формування пакету тендерної пропозиції для подачі на Prozorro. | Пакет включає всі обов'язкові довідки, ліцензії зі сховища, розрахунок кошторису та автоматично накладені цифрові кліше підпису/печатки. | **PASSED** |
| **6** | **Server Startup & Migrations** | Перезапуск сервера `server.ts` з новими міграціями колонок (`is_vault`, `signature_cliche`, `stamp_cliche`). | Міграції виконуються автоматично в режимі "IF NOT EXISTS", сервер стартує без помилок і блокувань на порту 3000. | **PASSED** |

---

## 3. Методологія автоматизованого E2E тестування (Playwright)

Для безперервної верифікації використовується комплексний набір тестів:

```typescript
// tests/e2e/tender_verification.spec.ts
import { test, expect } from "@playwright/test";

test.describe("TenderAI OS Comprehensive E2E Verification", () => {
  
  test("1. Profile Requisites & Digital Cliche Upload", async ({ page }) => {
    await page.goto("/company");
    await page.fill("#edrpou_input", "43215678");
    await page.click("#btn_save_requisites");
    await expect(page.locator("#toast_success")).toBeVisible();
  });

  test("2. Vault Document & Evidence Synchronization", async ({ page }) => {
    await page.goto("/vault");
    await page.setInputFiles("#vault_file_input", "./fixtures/sample_license.pdf");
    await page.click("#btn_upload_vault");
    await expect(page.locator("#doc_list_item_0")).toContainText("sample_license.pdf");
  });

  test("3. Document Generation with Cliches", async ({ page }) => {
    await page.goto("/amcu-complaints");
    await page.click("#btn_generate_complaint");
    await expect(page.locator("#complaint-document-text")).toContainText("СКАРГА");
    await expect(page.locator("img[alt='Signature']")).toBeVisible();
    await expect(page.locator("img[alt='Stamp']")).toBeVisible();
  });
});
```

---

## 4. Висновки та Рекомендації щодо Вдосконалення

1. **Стабільність архітектури:** Впроваджена система асинхронних міграцій на старті запобігає будь-яким затримкам та зупинкам контейнера під час розгортання в Cloud Run.
2. **Безпека та ізоляція даних:** Завдяки жорсткій прив’язці `user_id` та багатотабличним зв'язкам (`company_profiles` ↔ `tender_documents`), дані компанії та її сховище ізольовані на рівні сервера.
3. **Готовність до продакшену:** Усі ключові показники якості (Linter: 0 помилок, TypeScript: `tsc --noEmit` пройдено успішно, Скомпонований збір: `npm run build` зеленого кольору) підтверджують повну готовність платформи до експлуатації.
# Independent re-audit (2026-08-31)

**Status: NOT EXECUTED TO COMPLETION.** No reproducible browser E2E evidence tied to the current source revision exists, and the supplied directory has no Git revision. Prior PASS statements do not certify the current code.

## Re-audit 2026-09-01

`npm run verify` PASS (TypeScript, 18 Vitest tests, production bundles, npm audit 0 vulnerabilities). BoQ API edit persistence and truthfulness fallbacks are covered by static/type gates; full browser E2E and external-service acceptance remain BLOCKED.

Browser smoke on the current revision: local session loaded the app, profile rendered `UNKNOWN` without placeholder company/resource values, and the Construction BoQ tab added then deleted a persisted row through the live API. This is targeted evidence, not full 237-control coverage.

War Room QA was inspected on the current revision; with no readiness audit it shows the explicit `UNKNOWN` state and the audit button is wired to navigation. Full control-by-control E2E remains BLOCKED.

The War Room overview now shows `UNKNOWN` readiness when no score exists and evidence-derived pipeline states; this is covered by the build/type gate and targeted smoke inspection.

Latest browser smoke confirmed the unaudited tender renders `UNKNOWN` readiness/checklist and no static low-risk or completion claims.

Type/build verification covers the evidence-derived pipeline refactor; targeted browser smoke confirms QA navigation. Full responsive and 237-control E2E remains BLOCKED.

Static verification completed: TypeScript PASS, Vitest 2/2 PASS, Vite build PASS, server bundle PASS. Production negative-startup test PASS (missing mandatory configuration terminates the process). These checks are not a substitute for browser/database E2E.

2026-09-01: `npm run verify` PASS after hardening live Prozorro mapping (18 tests passed, 1 skipped, production build and dependency audit clean). Full live search acceptance remains BLOCKED by upstream timeout.

Collusion UI now rejects malformed scores/risk levels and never falls back to a fabricated `0/LOW` result.

Fresh browser smoke after server restart exercised all 14 primary navigation buttons successfully. This validates route rendering only; control-level E2E and external-service acceptance remain blocked.

Auth error handling now catches Firebase token acquisition failures, clears the unusable token, exits loading, and displays a safe re-login message instead of leaving the application stuck.

Production verify after the self-test fix completed in 262 ms: database/auth/Prozorro connectivity/search and multi-platform checks passed; cursor pagination is explicitly UNKNOWN and remaining external evidence gates keep release status BLOCKED.

Auth bootstrap now probes the loopback session immediately as well as using the bounded fallback timer, preventing a Firebase initialization delay from leaving local UI indefinitely on the loading screen. Browser harness re-check is currently intermittent and does not alter the production fail-closed path.

Fresh authenticated browser audit 2026-09-01 exercised all 14 primary sections. Each rendered without `Application error`/`Uncaught`; observed visible button counts ranged from 22 to 54 and SVG/chart counts from 22 to 51 per section. This is navigation/render evidence, not proof that every mutating control has passed a real-data E2E.
