# DISASTER RECOVERY SPECIFICATION

**Project:** TenderAI OS (dima1203oleg/Dev10)  
**System Class:** Enterprise SaaS  

---

## 1. Objectives (RTO & RPO)

- **Recovery Time Objective (RTO)**: `< 4 Hours` (Maximum tolerated duration of system downtime after database or network failure).
- **Recovery Point Objective (RPO)**: `< 24 Hours` (Maximum duration of tolerable data loss from last available state restore point).

---

## 2. Backup & Retention Procedures

### 2.1. PostgreSQL Backups
- **Frequency**: Automatic snapshot execution every 24 hours at 01:00 UTC.
- **Retention**: Keep historical daily snapshots for 30 days.
- **Storage**: Snapshots are replicated in multi-region secure bucket endpoints independent from active instances.

### 2.2. Restoring PostgreSQL Instance
To verify or restore target states, execution operations must deploy:
```bash
# Decompress and apply snapshot target to production DB
pg_restore -h pg-host-endpoint -U db_user -d tenderai_db /backups/snapshot_YYYY_MM_DD.dump
```

---

## 3. High Availability Fallback Strategies

If connected cloud services experience outage or network failures, TenderAI OS implements safe-fallback behaviors:

### 3.1. Prozorro API Degradation
- **Status**: Prozorro returns 502/504 or times out.
- **Mitigation**: System automatically leverages cached dynamic tender data previously synchronized in PostgreSQL. The UI will explicitly display a status notification: *"Viewing cached Prozorro information retrieved on YYYY-MM-DD. Real-time updates temporarily degraded."*

### 3.2. Gemini API Downtime
- **Status**: Gemini quota exceeded or endpoint unavailable.
- **Mitigation**: Implements Fail-Closed behavior. The analysis is safely marked as `ANALYSIS_FAILED` rather than generating legacy mock data or hallucinating metrics. The UI informs the user: *"AI audit unavailable. Please retry shortly."*
