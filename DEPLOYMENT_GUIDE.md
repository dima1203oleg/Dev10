# DEPLOYMENT GUIDE

**Project:** TenderAI OS (dima1203oleg/Dev10)  
**Target Environments:** Development, Staging, Production  

---

## 1. Environment Configurations

All sensitive parameters are kept in `.env` files (never committed to repository history) and are set on target hosts.

### 1.1. Required Environment Variables
Declare these parameters in your local environment or hosting control panel:

```ini
# PostgreSQL Connection Uri
DATABASE_URL=postgresql://user:password@host:5432/tenderai_db

# Firebase Administration Settings
FIREBASE_PROJECT_ID=tenderai-os
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tenderai-os.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7...\n-----END PRIVATE KEY-----\n"

# Gemini API Integration
GEMINI_API_KEY=your_gemini_api_key

# Node Environment
NODE_ENV=production
```

---

## 2. Docker & Container Builds

To containerize the unified Express + Vite production-ready applet, utilize the following instructions:

### 2.1. Dockerfile Template
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## 3. Production Deployment Checks

Before declaring a build as fully released, execute:
1. **Schema Migrations**: Run `npm run db:push` to align target PostgreSQL database to current Drizzle schema boundaries.
2. **Observability Verification**: Ensure API request latency, database response times, and Prozorro REST errors are logged to centralized metrics.
3. **Secret Scan**: Run repository automated checks to ensure no staging/dev credentials remain in index files.
