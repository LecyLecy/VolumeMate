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

