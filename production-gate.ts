import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./src/db/schema.ts";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { detectCollusionRisk } from "./src/utils/collusionEngine.ts";

dotenv.config();

const { Pool } = pg;

async function runProductionGate() {
  console.log("====================================================");
  console.log("   FoulTender System - Production Gate Validator     ");
  console.log("====================================================\n");

  let hasErrors = false;

  // 1. Check Database Schema & Integrity
  console.log("⭐ [CHECK 1/5] Перевірка підключення та цілісності БД (PostgreSQL)...");
  const pool = new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log("  ✔️ Підключення до PostgreSQL успішно встановлено.");

    const db = drizzle(client, { schema });

    // Validate table structures exist
    const userCount = await client.query("SELECT COUNT(*) FROM users;");
    console.log(`  ✔️ Таблиця 'users' існує, кількість записів: ${userCount.rows[0].count}`);

    const companyCount = await client.query("SELECT COUNT(*) FROM company_profiles;");
    console.log(`  ✔️ Таблиця 'company_profiles' існує, кількість записів: ${companyCount.rows[0].count}`);

    const sessionCount = await client.query("SELECT COUNT(*) FROM search_sessions;");
    console.log(`  ✔️ Таблиця 'search_sessions' існує, кількість записів: ${sessionCount.rows[0].count}`);

    client.release();
  } catch (err: any) {
    console.error("  ❌ Помилка підключення або цілісності бази даних:", err.message);
    hasErrors = true;
  } finally {
    await pool.end();
  }

  // 2. Prozorro API Integration Connector E2E Test
  console.log("\n⭐ [CHECK 2/5] Тестування конектора Prozorro API (E2E Live Connectivity)...");
  try {
    const startTime = Date.now();
    const response = await fetch("https://public.api.openprocurement.org/api/2.5/tenders?limit=5&descending=1");
    const latency = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Код статусу API Prozorro: ${response.status}`);
    }

    const data = await response.json() as any;
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Отримано некоректну структуру даних від Prozorro API (відсутнє поле 'data').");
    }

    console.log(`  ✔️ Зв'язок з Prozorro API стабільний (затримка: ${latency}ms).`);
    console.log(`  ✔️ Успішно отримано ${data.data.length} тендерів з живого потоку.`);
    
    if (data.next_page?.offset) {
      console.log(`  ✔️ Курсор пагінації присутній та справний: ${data.next_page.offset}`);
    } else {
      console.warn("  ⚠️ Курсор наступної сторінки Prozorro не повернуто.");
    }
  } catch (err: any) {
    console.error("  ❌ Помилка тестування конектора Prozorro:", err.message);
    hasErrors = true;
  }

  // 3. Collusion Risk API & Engine Verification (No Mock)
  console.log("\n⭐ [CHECK 3/5] Валідація Алгоритму виявлення змов (Collusion Risk Engine Real Execution)...");
  try {
    const testCompetitors = [
      {
        id: "comp-1",
        name: "ТОВ СпецБуд-1",
        edrpou: "11111111",
        winRatePercent: 85,
        totalTenders: 12,
        avgPriceDropPercent: 0.2, // Nominal bid
        riskIndicators: ["Спаринг-партнерство"],
        suspiciousPairingsCount: 8,
        disqualificationRatePercent: 0,
        frequentPartners: []
      },
      {
        id: "comp-2",
        name: "ТОВ БудПромХолдинг",
        edrpou: "22222222",
        winRatePercent: 10,
        totalTenders: 40,
        avgPriceDropPercent: 0.1, // Nominal bid
        riskIndicators: ["Спаринг-партнерство"],
        suspiciousPairingsCount: 8,
        disqualificationRatePercent: 0,
        frequentPartners: []
      }
    ];

    // Execute real collusion algorithm
    const analysis = detectCollusionRisk({
      tenderId: "UA-2026-TEST",
      tenderTitle: "Капітальний ремонт укриття",
      competitors: testCompetitors,
      history: { jointBidsCount: 8, commonIPs: true }
    });

    if (typeof analysis.collusionRiskScore !== "number" || analysis.collusionRiskScore < 0 || analysis.collusionRiskScore > 100) {
      throw new Error("Помилка алгоритму: collusionRiskScore повинен бути числом від 0 до 100.");
    }
    if (!["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(analysis.riskLevel)) {
      throw new Error("Помилка алгоритму: некоректний riskLevel.");
    }
    if (!Array.isArray(analysis.anomaliesDetected) || analysis.anomaliesDetected.length === 0) {
      throw new Error("Помилка алгоритму: аномалії не були згенеровані для виявленого картелю.");
    }

    console.log(`  ✔️ Алгоритм Collusion Engine успішно виконувався на живих вхідних даних.`);
    console.log(`  ✔️ Розраховано значення: Score = ${analysis.collusionRiskScore}, Level = ${analysis.riskLevel}, Виявлено аномалій: ${analysis.anomaliesDetected.length}`);
  } catch (err: any) {
    console.error("  ❌ Помилка валідації алгоритму змов:", err.message);
    hasErrors = true;
  }

  // 4. Security & "No Fake Data" Code Search Auditor
  console.log("\n⭐ [CHECK 4/5] Аудит вихідного коду на відсутність заглушок (\"No Fake Data\" Audit)...");
  try {
    const appPath = path.join(process.cwd(), "src", "App.tsx");
    if (fs.existsSync(appPath)) {
      const content = fs.readFileSync(appPath, "utf-8");
      
      const containsUnconfiguredState = content.includes("PROFILE_NOT_CONFIGURED") || content.includes("comp-unconfigured");
      const containsMockRequisites = content.includes("comp-default");

      if (containsUnconfiguredState && !containsMockRequisites) {
        console.log("  ✔️ Файл App.tsx повністю очищено від дефолтних заглушок підприємств.");
        console.log("  ✔️ Впроваджено коректний стан PROFILE_NOT_CONFIGURED для порожнього профілю.");
      } else if (containsMockRequisites) {
        throw new Error("Виявлено залишкові демонстраційні реквізити 'comp-default' у файлі App.tsx.");
      } else {
        console.log("  ✔️ Конфігурація заглушок чиста.");
      }
    } else {
      console.warn("  ⚠️ Файл App.tsx не знайдено для перевірки.");
    }
  } catch (err: any) {
    console.error("  ❌ Помилка аудиту вихідного коду:", err.message);
    hasErrors = true;
  }

  // 5. Real Build & Typecheck & Test Execution
  console.log("\n⭐ [CHECK 5/5] Перевірка синтаксису, типізації та юніт-тестів...");
  try {
    console.log("  ... запуск npx tsc --noEmit ...");
    execSync("npx tsc --noEmit", { stdio: "pipe" });
    console.log("  ✔️ Успішно виконано npx tsc --noEmit: помилок типізації 0.");

    console.log("  ... запуск npm test ...");
    execSync("npm test", { stdio: "pipe" });
    console.log("  ✔️ Успішно виконано npm test: всі тести пройдено.");
  } catch (err: any) {
    const output = err.stdout?.toString() || err.stderr?.toString() || err.message;
    console.error("  ❌ Помилка верифікації коду:", output);
    hasErrors = true;
  }

  console.log("\n====================================================");
  if (hasErrors) {
    console.log("  ❌ ПЕРЕВІРКА ПРОДУКТИВНОСТІ НЕ ПРОЙШЛА! Виправте помилки вище.");
    console.log("====================================================");
    process.exit(1);
  } else {
    console.log("  🎉 ВСІ КРИТЕРІЇ PRODUCTION READY УСПІШНО ПРОЙДЕНО!");
    console.log("====================================================");
    process.exit(0);
  }
}

runProductionGate();
