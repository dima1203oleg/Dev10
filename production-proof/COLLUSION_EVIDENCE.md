# Collusion Detection Proof of Work

## 1. Zero-Fallback Policy
As of Commit `3aa9b8a+`, the Collusion Engine (`src/utils/collusionEngine.ts`) strictly forbids synthetic fallback scores.
- **Removed**: `|| 8`, `|| 2`, and default pairing assumptions.
- **New Logic**: Risk score is strictly proportional to `jointBidsCount` from real historical data.

## 2. Evidence Structure
Every anomaly detected must now report:
- `title`: Type of suspicion (e.g., Stable Pair).
- `description`: Human-readable explanation.
- `evidence`: Quantitative proof (e.g., "14 shared tenders found in UA-2026-* data").

## 3. Score Calculation
```ts
riskScore += Math.min(45, sharedTenders * 5);
```
Risk grows with the number of confirmed shared participations. Zero shared tenders = Zero pairing risk score.

## 4. Verification
Tested via `detectCollusionRisk` unit tests and live data mapping. If the source API does not provide historical pairings, the system reports **"INSUFFICIENT DATA"** rather than a high risk score.
