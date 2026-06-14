# Latest Handoff

## One-File Summary For Another LLM

VolumeMate is a solo-maintained smart fertilizer procurement app. Current code is a monorepo-style repo with:

- `frontend/`: Vite + React + React Native Web mobile-style app.
- `backend/`: NestJS REST API, Prisma, PostgreSQL.
- `VolumeMind/`: Python FastAPI AI service and trained demand forecasting model.
- `docs/old/`: archived historical docs from the hackathon/team phase.

Trust current code over old docs. Old docs are useful for product intent but contain outdated assumptions.

## Current State

The project is in active development. The Koperasi flow is the most real: login, dashboard, transaction recording, active pools, join pool, audit log, and CSV export. Supplier and admin flows have UI but rely heavily on local/static data. VolumeMind is implemented as a local Python API and the backend integrates with it, with fallback dashboard data if the AI service is unavailable.

## Most Important Files

| Need | Files |
|---|---|
| Frontend routing/session | `frontend/src/App.tsx`, `frontend/src/services/api.ts` |
| Dashboard | `frontend/src/screens/KoperasiDashboardScreen.tsx`, `backend/src/dashboard/*` |
| Transactions/audit | `frontend/src/screens/RecordTransactionScreen.tsx`, `frontend/src/screens/AuditLogScreen.tsx`, `backend/src/order/*` |
| Collective buy | `frontend/src/screens/CollectiveBuyScreen.tsx`, `frontend/src/screens/JoinPoolScreen.tsx`, `backend/src/order/*`, `frontend/src/data/pools.ts` |
| Supplier UI | `frontend/src/screens/MenuScreen.tsx` |
| Admin UI | `frontend/src/screens/AdminApprovalScreen.tsx` |
| Auth | `frontend/src/screens/LoginScreen.tsx`, `frontend/src/screens/RegisterScreen.tsx`, `backend/src/auth/*` |
| Database | `backend/prisma/schema.prisma`, `backend/prisma/seed.ts`, `backend/prisma/migrations/` |
| AI | `VolumeMind/api.py`, `VolumeMind/train.py`, `backend/src/volumemind/*` |
| Config/commands | `frontend/package.json`, `backend/package.json`, `backend/.env.example`, `backend/prisma.config.ts` |

## Recently Relevant Areas

- Branch cleanup: `main` and `dev` are up to date; old remote feature refs were pruned locally.
- Docs were rebuilt for AI continuity.
- Old markdown docs were archived into `docs/old/`.
- Current top-level `docs/` should contain exactly the ten current handoff docs.

## Likely Next Steps

1. Decide whether to align backend roles/statuses with old product spec or update product spec to match current code.
2. Implement real account approval if still required: add `User.status`, verification document storage, admin endpoints, and frontend API calls.
3. Replace `localStorage` supplier proposal/approval state with backend tables and endpoints.
4. Add target fund/payment lifecycle only after schema is designed.
5. Add integration tests for auth, manual transactions, pools, CSV export, and VolumeMind proxy behavior.

## Ask The User For These When Debugging

| Symptom | Ask for |
|---|---|
| Frontend blank or route problem | Browser console errors, current URL hash, screenshot, `frontend/src/App.tsx`, relevant screen file. |
| API request fails | Browser network tab request/response, backend terminal log, `frontend/src/services/api.ts`, relevant controller/service. |
| Login/register fails | Exact email/role used, backend log, response body, `backend/.env` variable names only, auth files. |
| Database error | Backend terminal stack trace, Prisma error code, current `DATABASE_URL` host/db name only, `schema.prisma`, latest migration. |
| VolumeMind card wrong | Backend log, Python service log, request payload, `VolumeMind/api.py`, `backend/src/dashboard/dashboard.service.ts`. |
| Pool join/pricing wrong | Screenshot, browser network response, pool data from DB, `backend/src/order/order.service.ts`, `CollectiveBuyScreen.tsx`, `JoinPoolScreen.tsx`. |
| Supplier/admin flow not persisting | Browser localStorage values for `volumemate_proposals` and `volumemate_approved_pools`, screenshots, `MenuScreen.tsx`, `AdminApprovalScreen.tsx`. |

## High-Risk Mismatches

- Old docs specify `PENDING_ADMIN_APPROVAL`; current DB has no status.
- Old docs specify payment statuses and payouts; current DB has no payment or payout tables.
- Old docs mention RandomForest; current `VolumeMind/train.py` uses `GradientBoostingRegressor`.
- Old docs mention Expo/Supabase; current repo uses Vite/NestJS/Prisma.

