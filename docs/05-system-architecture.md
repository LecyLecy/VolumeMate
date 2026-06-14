# System Architecture

## Tech Stack

| Layer | Technology | Location |
|---|---|---|
| Frontend | React 18, Vite, TypeScript, React Native Web | `frontend/` |
| Backend | NestJS 11, TypeScript | `backend/` |
| ORM/database | Prisma 7 with PostgreSQL adapter | `backend/prisma/`, `backend/src/prisma/` |
| Auth | JWT through `@nestjs/jwt`, passwords hashed by `bcryptjs` | `backend/src/auth/` |
| AI service | FastAPI, pandas, joblib, scikit-learn | `VolumeMind/` |
| ML model | `demand_forecasting_model.joblib` | `VolumeMind/` |

## Frontend Architecture

The frontend is not using `react-router-dom` despite the dependency. Navigation is controlled by URL hash and local React state in `frontend/src/App.tsx`.

Session state is stored in browser `localStorage`:

- `volumemate_token`
- `volumemate_user`
- `volumemate_proposals`
- `volumemate_approved_pools`

API calls are centralized in `frontend/src/services/api.ts`. Base URL comes from `VITE_API_BASE_URL` or defaults to `http://localhost:3000`.

## Backend Architecture

`backend/src/app.module.ts` imports:

- `PrismaModule`
- `UsersModule`
- `SupplierModule`
- `OrderModule`
- `AuthModule`
- `DashboardModule`
- `VolumemindModule`

The API is mostly REST-style controllers. CORS is enabled globally in `backend/src/main.ts`.

## Database Architecture

Current Prisma models:

- `Koperasi`
- `User`
- `Supplier`
- `Product`
- `PriceTier`
- `Order`
- `OrderItem`
- `CollectivePool`
- `AuditLog`
- `Distribution`

Current enums:

- `Role`: `ADMIN_KOPERASI`, `ANGGOTA`, `SUPPLIER`, `ADMIN`
- `OrderStatus`: `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`
- `PoolStatus`: `ACTIVE`, `CLOSED`, `COMPLETED`, `CANCELLED`

## Main Data Flow

1. User logs in through frontend.
2. Backend returns JWT and user object.
3. Frontend stores token/user in `localStorage`.
4. Authenticated frontend calls include `Authorization: Bearer <token>`.
5. Backend `AuthGuard` verifies JWT.
6. Prisma reads/writes PostgreSQL.
7. Dashboard calls may trigger backend calls to VolumeMind.
8. Audit log entries are written by `OrderService.writeAuditLog`.

## VolumeMind Flow

Dashboard service builds a recommendation request using:

- target date,
- koperasi name,
- fertilizer type,
- inferred rainfall and season,
- fixed land-area assumption,
- suppliers and price tiers from DB.

Backend `VolumemindService`:

1. POSTs to `VOLUMEMIND_URL/predict`.
2. POSTs predicted demand and supplier tiers to `VOLUMEMIND_URL/recommend`.
3. Returns combined prediction/recommendation.

Default `VOLUMEMIND_URL` is `http://localhost:8000`.

## Integrations

| Integration | Current status |
|---|---|
| PostgreSQL | Required by backend via `DATABASE_URL`. |
| VolumeMind FastAPI | Optional for dashboard quality; backend has fallback if dashboard call fails. |
| Weather API/BMKG | Mentioned in old docs only; not actually integrated. |
| Payment gateway | Not implemented. |
| File storage | Not implemented. |
| Supabase | Historical old-doc mention only. |

## Risks And Unclear Parts

- Some endpoints are protected, but several order/supplier endpoints are public or accept optional `userId`; this is risky if moving toward production.
- Admin shortcut login sets a fake token, so protected backend endpoints will reject it.
- Proposal approval is not database-backed yet.
- Schema does not match the richer lifecycle described in old docs.
- `JWT_SECRET` default exists in code but is not shown in `.env.example`.

