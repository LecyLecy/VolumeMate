# Folder And File Map

## Repository Map

| Path | Purpose |
|---|---|
| `README.md` | Human project overview and local setup guide. Some details may lag code. |
| `frontend/` | Vite React + React Native Web application. |
| `frontend/src/App.tsx` | Hash routing, role redirects, high-level screen orchestration. |
| `frontend/src/services/api.ts` | All frontend API calls and token handling. |
| `frontend/src/screens/` | Screen-level UI for auth, dashboard, pools, transactions, audit, supplier, admin. |
| `frontend/src/components/` | Shared headers, nav, brand, pool card. |
| `frontend/src/data/pools.ts` | Local fallback/sample pool data. |
| `frontend/src/theme.ts` | Color and font tokens. |
| `backend/` | NestJS API. |
| `backend/src/auth/` | Register/login/JWT guard. |
| `backend/src/order/` | Orders, manual transactions, distribution, pools, audit logs, CSV export. |
| `backend/src/dashboard/` | Koperasi dashboard metrics and VolumeMind dashboard integration. |
| `backend/src/volumemind/` | Backend proxy/service for Python AI API. |
| `backend/src/supplier/` | Supplier, product, and price-tier CRUD. |
| `backend/src/users/` | Basic user CRUD. |
| `backend/src/prisma/` | Prisma service/module. |
| `backend/prisma/schema.prisma` | Current database contract. |
| `backend/prisma/seed.ts` | Destructive seed script that clears and creates demo data. |
| `backend/prisma/migrations/` | Database migrations. |
| `VolumeMind/` | Python AI service, training script, datasets, model artifact. |
| `docs/` | Current AI-continuity documentation. |
| `docs/old/` | Archived historical docs. |

## Feature To File Map

| Feature | Frontend files | Backend files | Database/API files |
|---|---|---|---|
| Login/register | `LoginScreen.tsx`, `RegisterScreen.tsx`, `App.tsx`, `services/api.ts` | `auth.controller.ts`, `auth.service.ts`, `auth.guard.ts` | `User`, `Role`, `/auth/*` |
| Koperasi dashboard | `KoperasiDashboardScreen.tsx` | `dashboard.controller.ts`, `dashboard.service.ts` | `/dashboard`, `/orders/pools/active`, `/orders/audit-logs` |
| VolumeMind recommendation | `KoperasiDashboardScreen.tsx` | `dashboard.service.ts`, `volumemind.service.ts`, `volumemind.controller.ts` | `VolumeMind/api.py`, `/predict`, `/recommend` |
| Manual incoming transaction | `RecordTransactionScreen.tsx` | `order.controller.ts`, `order.service.ts` | `Order`, `OrderItem`, `AuditLog`, `/orders/manual` |
| Outgoing distribution | `RecordTransactionScreen.tsx` | `order.controller.ts`, `order.service.ts` | `Distribution`, `AuditLog`, `/orders/distribution` |
| Collective pool list/join | `CollectiveBuyScreen.tsx`, `JoinPoolScreen.tsx`, `data/pools.ts` | `order.controller.ts`, `order.service.ts` | `CollectivePool`, `Order`, `/orders/pools/*` |
| Supplier proposal UI | `MenuScreen.tsx` | Mostly not implemented for proposals | Browser `localStorage`, `/orders/pools/active`, `/orders/audit-logs` |
| Admin approval UI | `AdminApprovalScreen.tsx` | Not implemented | Static frontend data only |
| Audit log/export | `AuditLogScreen.tsx`, `MenuScreen.tsx` | `order.controller.ts`, `order.service.ts` | `AuditLog`, `/orders/audit-logs`, `/orders/export-csv` |
| Suppliers/products/tiers | `CollectiveBuyScreen.tsx`, `RecordTransactionScreen.tsx` | `supplier.controller.ts`, `supplier.service.ts`, `order.service.ts` | `Supplier`, `Product`, `PriceTier`, `/suppliers`, `/orders/products` |

## Bug Symptom To Likely Files

| Bug symptom | Likely area | Likely files | What to ask the user for |
|---|---|---|---|
| App redirects to login unexpectedly | Frontend session/routing | `App.tsx`, `services/api.ts`, `LoginScreen.tsx` | URL hash, `localStorage` keys, browser console, screenshot. |
| 401 token errors | Auth/JWT | `auth.guard.ts`, `auth.service.ts`, `services/api.ts` | Network response, backend log, whether token is fake admin token. |
| Dashboard shows fallback/wrong AI data | Dashboard/VolumeMind | `dashboard.service.ts`, `volumemind.service.ts`, `VolumeMind/api.py` | Python service log, backend log, `VOLUMEMIND_URL` name only, request payload. |
| Manual transaction not saved | Order API/database | `RecordTransactionScreen.tsx`, `order.service.ts`, `schema.prisma` | Network request/response, backend stack trace, DB connection status. |
| Join pool changes price incorrectly | Pool join logic | `JoinPoolScreen.tsx`, `CollectiveBuyScreen.tsx`, `order.service.ts`, `PriceTier` data | Pool ID, order ID, product tiers, screenshot before/after. |
| Proposal appears on supplier but not after refresh/device change | Browser-local state | `CollectiveBuyScreen.tsx`, `MenuScreen.tsx` | `localStorage` values and exact browser/device. |
| Admin approvals do not affect login | Mock admin screen | `AdminApprovalScreen.tsx`, `auth.service.ts`, `schema.prisma` | Screenshot and expectation; current DB has no status field. |
| CSV export fails | Auth/export route | `AuditLogScreen.tsx`, `api.ts`, `order.controller.ts`, `auth.guard.ts` | Export URL, response body, token source. |
| Backend crashes on startup | Env/Prisma | `prisma.service.ts`, `backend/.env.example`, `schema.prisma` | Terminal log, environment variable names, database availability. |


## Review Additions - 2026-09-07

| Bug Symptom | Likely Area | Likely Files | What To Ask User For |
|---|---|---|---|
| OTP accepts arbitrary input; password reset has no effect | Demo frontend flows | frontend/src/components/OtpVerificationCard.tsx, frontend/src/screens/LoginScreen.tsx, frontend/src/screens/RegisterScreen.tsx | Steps and sanitized network request list |
| User/audit API exposes password fields | Public controllers and unrestricted Prisma result | backend/src/users/users.controller.ts, backend/src/users/users.service.ts, backend/src/order/order.service.ts | Response field names and status only; redact credentials |
| Pool prices partially updated or wrong product accepted | Non-atomic join/repricing | backend/src/order/order.service.ts | Pool/product/order IDs and sanitized before/after values |

Historical correction: docs/old does not exist in this checkout. Historical docs may be retrieved from Git history. .review-build/frontend contains generated review build output, not application source.

## Portfolio Demo Access - 2026-09-07

| Feature | Frontend Files | Backend Files | Database/API Files | Notes |
|---|---|---|---|---|
| Three-role demo gateway | `frontend/src/screens/LoginScreen.tsx`, `frontend/src/App.tsx`, `frontend/src/services/api.ts` | `backend/src/auth/auth.controller.ts`, `backend/src/auth/auth.service.ts` | `User`, `Role`, `POST /auth/demo-login` | Koperasi/Supplier use the first existing matching user; Admin is frontend-only/static. |

| Bug Symptom | Likely Area | Likely Files | What To Ask User For |
|---|---|---|---|
| Demo button says matching account is unavailable | Demo auth/database | `auth.service.ts`, `schema.prisma` | Sanitized role counts from the database; do not request passwords. |
| Demo button fails to open | Local services/API | `LoginScreen.tsx`, `api.ts`, `auth.controller.ts` | Browser Network response and backend log. |

## Portfolio Dummy Data - 2026-09-07

| Feature | Frontend Files | Backend Files | Database/API Files | Notes |
|---|---|---|---|---|
| Portfolio data population | `LoginScreen.tsx`, `KoperasiDashboardScreen.tsx` | `backend/prisma/portfolio-demo-data.ts`, `backend/package.json` | `Product`, `PriceTier`, `CollectivePool`, `Order`, `OrderItem`, `AuditLog`; browser `volumemate_proposals` | Additive and idempotent; run `npm run demo:data` from `backend/`. |

| Bug Symptom | Likely Area | Likely Files | What To Ask User For |
|---|---|---|---|
| Portfolio pool/audit cards are empty | Demo database state | `portfolio-demo-data.ts`, `schema.prisma`, relevant screen | Output of `npm run demo:data`, backend log, screenshot after reload. |
| Dashboard proposal remains empty | Browser demo state | `LoginScreen.tsx`, `KoperasiDashboardScreen.tsx` | Whether Admin Koperasi button was used after logout; `volumemate_proposals` presence, not uploaded PDF data. |

## Supplier Audit Display Fix - 2026-09-07

| Bug Symptom | Likely Area | Likely Files | What To Ask User For |
|---|---|---|---|
| Supplier audit displays raw JSON or technical action names | Frontend audit mapping/demo metadata | `frontend/src/screens/MenuScreen.tsx`, `backend/prisma/portfolio-demo-data.ts` | Screenshot of the card, action name, and sanitized `details` field structure. |

## Supplier Bottom Navigation - 2026-09-07

| Feature | Frontend Files | Backend Files | Database/API Files | Notes |
|---|---|---|---|---|
| Supplier Proposal/Audit navigation | `frontend/src/screens/MenuScreen.tsx`; visual reference: `frontend/src/components/KoperasiBottomNav.tsx` | None | None | Two icon-only actions using the same floating capsule design as Admin Koperasi. |

| Bug Symptom | Likely Area | Likely Files | What To Ask User For |
|---|---|---|---|
| Supplier bottom bar looks flat, touches screen edges, or has extra actions | Supplier navigation markup/styles | `frontend/src/screens/MenuScreen.tsx`, compare with `frontend/src/components/KoperasiBottomNav.tsx` | Mobile-width screenshot showing the full bottom bar and active tab. |
