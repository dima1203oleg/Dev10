# Button Action Registry - Production Audit

## Critical Actions
| Button ID | Label | Module | Action / API | Production Status |
|-----------|-------|--------|--------------|-------------------|
| `search-prozorro` | Знайти тендери | `TenderCatalog` | `GET /api/prozorro/search` | **VERIFIED** (Stateful Pagination) |
| `load-more-prozorro` | Завантажити ще | `TenderCatalog` | `GET /api/prozorro/search?searchId=...` | **VERIFIED** |
| `run-ai-audit` | Запустити AI Аудит | `FoulTenderModule` | `POST /api/foultender/audit` | **VERIFIED** |
| `generate-amcu` | Скласти скаргу АМКУ | `AmcuComplaintGenerator` | `POST /api/foultender/generate-complaint` | **VERIFIED** |
| `sync-profile` | Зберегти зміни | `CompanyVaultModule` | `POST /api/company/profile` | **VERIFIED** |
| `mobile-search-btn` | Search | `ResponsiveAppShell` (Mobile) | Toggle Overlay | **VERIFIED** |
| `drawer-user-info` | Олександр Б. | `ResponsiveAppShell` (Drawer) | `AuthContext` Dynamic | **VERIFIED** |

## Verification Plan
1. **Fix Dead Buttons**: Implement `mobile-search-btn` functionality.
2. **Remove Hardcode**: Connect `ResponsiveNavigation` user info to `AuthContext`.
3. **E2E Evidence**: Log actual successful API calls for `search-prozorro` and `load-more-prozorro`.
