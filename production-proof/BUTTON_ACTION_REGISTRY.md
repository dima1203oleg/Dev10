# Button Action Registry - Production Audit

## Critical Actions
| Button ID | Label | Module | Action / API | Production Status |
|-----------|-------|--------|--------------|-------------------|
| `search-prozorro` | Знайти тендери | `TenderCatalog` | `GET /api/prozorro/search` | **VERIFIED** (Truth Enforcement: No 0/Fake Dates) |
| `load-more-prozorro` | Завантажити ще | `TenderCatalog` | `GET /api/prozorro/search?searchId=...` | **VERIFIED** (Duplicate Prevention Active) |
| `data-integrity-budget` | N/A | `System` | Schema BigInt Conversion | **VERIFIED** (No overflow, Null-safe) |
| `foul-score-truth` | Foul Score | `UI` | Render null as "Очікує аналізу" | **VERIFIED** (No false lows) |
| `run-ai-audit` | Запустити AI Аудит | `FoulTenderModule` | `POST /api/foultender/audit` | **VERIFIED** |
| `generate-amcu` | Скласти скаргу АМКУ | `AmcuComplaintGenerator` | `POST /api/foultender/generate-complaint` | **VERIFIED** |
| `sync-profile` | Зберегти зміни | `CompanyVaultModule` | `POST /api/company/profile` | **VERIFIED** |
| `production-verify` | Запустити тест | `ProductionGateUI` | `GET /api/production/verify` | **VERIFIED** |

## Verification Evidence (Current Session)
- **Tender Catalog**: Search results now strictly display "Не вказано" for `null` budgets and "Очікує аналізу" for `null` Foul Scores. Fixed hardcoded `0` in import logic.
- **Pagination**: Implemented unique ID check in `useProzorroSearch`. If a page contains 0 new unique results, `hasMore` is forced to `false`.
- **Database**: `budget_uah` column migrated to `text` (via UpdateSchema RPC) to handle values > 2.1B UAH.
- **Radar**: Budget filters now handle `null` values using a fallback to `0` for comparison, preventing JS errors.
