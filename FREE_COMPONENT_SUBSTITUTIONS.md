# Безплатний production-like стек TenderAI

Щоб не блокувати розробку платними або недоступними сервісами, локальний стек використовує безплатні open-source заміни з API-адаптерами:

| Потреба | Компонент | Ліцензія | Рішення |
|---|---|---|---|
| Транзакційна БД і вектори | PostgreSQL 16 + pgvector | PostgreSQL / PostgreSQL License | USE |
| Durable jobs | Temporal OSS + PostgreSQL | MIT | USE |
| Антивірус | ClamAV | GPL-2.0 | WRAP (окремий контейнер) |
| PDF/OCR/layout | Docling Serve CPU | MIT | WRAP (окремий контейнер) |
| S3-сховище | SeaweedFS S3 gateway | Apache-2.0 | WRAP (окремий контейнер) |
| Аналітика | DuckDB Node API | MIT | USE |
| AI-пояснення | Gemini API | proprietary API | ADAPT (тільки пояснення підтверджених фактів) |

Запуск повного локального набору:

```sh
docker compose -f infra/compose.yaml --env-file infra/.env.example up -d
```

У production обов'язкові реальні секрети та зовнішні сервіси задаються через `.env`; локальна файлова система не використовується як storage driver. Якщо компонент недоступний, система fail-closed і повертає `UNKNOWN`/помилку, а не демонстраційні дані.

