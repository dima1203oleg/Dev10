# Page Registry - TenderAI / FoulTender

## Core Application Modules
| Page ID | Component | Responsibility | Responsive Priority |
|---------|-----------|----------------|---------------------|
| `dashboard` | `DashboardView` | Project overview, recent activities, KPI highlights | High |
| `analytics` | `AnalyticsDashboard` | Data visualizations, trend analysis | High |
| `radar` | `TenderRadarModule` | AI-powered personalized opportunity feed | High |
| `war-room` | `TenderWarRoomModule` | Active tender command center | Critical |
| `post-tender` | `PostTenderModule` | Monitoring results, AMCU deadlines | Medium |
| `services` | `ServicesModelModule` | Subscription and platform services management | Low |
| `matrix` | `RequirementMatrixModule` | Compliance auditing vs Tender Documentation | Critical |
| `vault` | `CompanyVaultModule` | Intelligent document & qualification storage | High |
| `foultender` | `FoulTenderModule` | Corruption & discriminatory requirement detection | Critical |
| `construction` | `TenderAIConstructionModule` | BoQ analysis & cost estimation | High |
| `competitors` | `CompetitorCollusionModule` | Market behavior & collusion risk analysis | Medium |
| `diff` | `VersionDiffModule` | Tracking TD changes & impact assessment | Medium |
| `audit` | `PreSubmissionAuditModule` | Final compliance check before submission | Critical |
| `complaints` | `AmcuComplaintGenerator` | Automated AMCU complaint drafting | High |
| `bid-packages` | `BidPackageGenerator` | Assembly of the final submission package | High |
| `multiagent-chat` | `MultiAgentChat` | Contextual AI expert consultation | Medium |
| `catalog` | `TenderCatalog` | Prozorro search & manual tender import | High |

## Responsive Matrix (Target States)
- **War Room / Matrix / FoulTender**: Must transition to single-column priority-first view on Mobile.
- **Analytics / Dashboard**: Must use fluid charts that resize without clipping.
- **Catalog**: Must support stateful pagination and infinite scroll/load more on all devices.
- **Vault**: Must ensure heavy tables transform into searchable cards on Mobile.
