# TenderAI & FoulTender Suite

Procurement analysis application built with React/Vite, Express, PostgreSQL,
Firebase Authentication, Gemini and the official Prozorro public API.

## Release status

Current candidate: `0.1.0-rc.1` — **not approved for production deployment**.
See [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) for verified blockers and
acceptance criteria. In particular, synthetic estimate workflows remain in the UI
and PostgreSQL RLS has not been implemented or verified.

## Local verification

Requires Node.js 22+ and a lockfile-based install.

```sh
npm ci
npm run verify
```

The verified build outputs are `dist/`, `server.cjs`, and `server.cjs.map`.

## Configuration

Copy `.env.example` to `.env` and provide real credentials. Production startup
fails closed unless `SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME`, and
`GEMINI_API_KEY` are present. Never enable `ALLOW_DEV_AUTH` or
`VITE_ALLOW_DEV_AUTH` in production.

```sh
NODE_ENV=production npm start
```

Readiness endpoint: `GET /api/health`. It returns HTTP 503 when mandatory
dependencies are degraded.
