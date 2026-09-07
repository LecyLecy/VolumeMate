# API And Data Contract

## Backend Base

Default backend URL: `http://localhost:3000`.

Frontend base config: `VITE_API_BASE_URL` or default from `frontend/src/services/api.ts`.

## Authentication

| Endpoint | Method | Auth | Shape |
|---|---:|---|---|
| `/auth/register` | POST | No | `{ name, email, password, role? }` |
| `/auth/login` | POST | No | `{ email, password }` |
| `/auth/me` | GET | Bearer JWT | returns user without password |

Login/register response includes:

```text
{ user, access_token }
```

Current registration behavior:

- `role: supplier` or `SUPPLIER` creates a `Supplier` and `User.role = SUPPLIER`.
- Otherwise creates a `Koperasi` and `User.role = ADMIN_KOPERASI`.
- No admin approval status is stored or enforced.

## Orders, Pools, Audit

| Endpoint | Method | Auth | Notes |
|---|---:|---|---|
| `/orders` | POST | No | Creates order from raw Prisma-like input. |
| `/orders/manual` | POST | Bearer JWT | Creates delivered incoming procurement order and audit log. |
| `/orders/distribution` | POST | Bearer JWT | Creates outgoing distribution record and audit log. |
| `/orders/:id/confirm` | POST | No | Sets order to `CONFIRMED` unless already confirmed. |
| `/orders/pools` | POST | No | Creates active pool for existing product. |
| `/orders/pools/active` | GET | No | Lists active pools with product, supplier, tiers, orders. |
| `/orders/pools/:poolId/join` | POST | No | Attaches existing order to pool and recalculates price tier. |
| `/orders/pools/:poolId/finalize` | POST | No | Completes if total volume >= 10000kg, else extends deadline 2 days. |
| `/orders/audit-logs` | GET | No | Returns audit logs newest first. |
| `/orders/export-csv?token=...` | GET | Bearer JWT or query token | Exports current user's orders as CSV. |
| `/orders/products` | GET | No | Lists products with supplier and tiers. |

Important request shapes from frontend:

```text
POST /orders/manual
{ jenisPupuk, quantity, supplierName, tanggal, totalPrice }

POST /orders/distribution
{ jenisPupuk, quantity, buyerName, tanggal, pricePerKg, notes? }

POST /orders/pools/:poolId/join
{ orderId }
```

## Suppliers And Users

| Endpoint | Method | Auth | Notes |
|---|---:|---|---|
| `/users` | POST | No | Basic user create; raw Prisma input. |
| `/users` | GET | No | Lists users. |
| `/users/:id` | GET | No | Gets one user. |
| `/suppliers` | POST | No | Creates supplier. |
| `/suppliers` | GET | No | Lists suppliers with products. |
| `/suppliers/:id` | GET | No | Supplier with products and price tiers. |
| `/suppliers/products` | POST | No | Creates product. |
| `/suppliers/price-tiers` | POST | No | Creates price tier. |

## Dashboard And VolumeMind

| Endpoint | Method | Auth | Notes |
|---|---:|---|---|
| `/dashboard` | GET | Bearer JWT | Koperasi dashboard data. |
| `/dashboard/volumemind-summary` | GET | Bearer JWT | Query-driven VolumeMind recommendation. |
| `/volumemind/recommendation` | POST | No | Backend proxy to Python `/predict` and `/recommend`. |

Python VolumeMind service, default `http://localhost:8000`:

| Endpoint | Method | Shape |
|---|---:|---|
| `/` | GET | health/status |
| `/predict` | POST | `{ tanggal, id_koperasi, jenis_pupuk, curah_hujan_mm, musim_tanam, luas_lahan_hektar }` |
| `/recommend` | POST | `{ predicted_demand_kg, suppliers, target_date? }` |

`suppliers` shape:

```text
[
  {
    name,
    tiers: [
      { min_volume, max_volume?, price_per_kg }
    ]
  }
]
```

## Current Database Models

Use `backend/prisma/schema.prisma` as source of truth.

Key relationships:

- `Koperasi` has many `User`, `Order`, and `Distribution`.
- `User` optionally belongs to `Koperasi` or `Supplier`.
- `Supplier` has many `Product`.
- `Product` has many `PriceTier`, `OrderItem`, `CollectivePool`, and `Distribution`.
- `Order` has many `OrderItem` and may belong to `CollectivePool`.
- `AuditLog` optionally belongs to `User`.

## Known Contract Mismatch Risks

- Frontend `CreatePoolPayload` includes `targetVolumeKg`, but current Prisma `CollectivePool` does not have `targetVolumeKg`. Backend ignores it.
- Frontend supplier proposal fields are mostly saved in `localStorage`, not backend.
- Frontend admin fake token does not pass real protected backend routes.
- Old docs specify account approval fields and document uploads; current API does not.
- Several mutating endpoints are unauthenticated and should be reviewed before production.


## Review Findings - 2026-09-07

Static inspection confirms public /users responses return complete User objects, including password; /orders/audit-logs includes complete related users. Public POST /users passes raw Prisma input directly to create, bypassing auth registration hashing/role restrictions. No global auth guard or validation pipe was found. These are unresolved production blockers, not runtime exploit tests.

Pool join does not validate order-product compatibility or ownership, performs sequential writes without a database transaction, and returns the order captured before repricing. Pool finalization uses a fixed 10000 kg target. Registration still accepts only name/email/password/role; organization, document upload, OTP and reset contracts are absent.

## Portfolio Demo Auth Contract - 2026-09-07

`POST /auth/demo-login`

Request:

```json
{ "role": "koperasi" }
```

Allowed role values are `koperasi` and `supplier`. The response matches `/auth/login`: `{ user, access_token }`, with the password removed. Koperasi prefers the oldest `ADMIN_KOPERASI` user and falls back to the oldest `ANGGOTA`; Supplier uses the oldest `SUPPLIER` user. Invalid roles or missing matching accounts return HTTP 400.

This endpoint performs no credential check. It exists solely for a local portfolio demo and is a production security blocker.

## Portfolio Data Contract - 2026-09-07

`backend/prisma/portfolio-demo-data.ts` adds three named ACTIVE pools with one PENDING participation order each, matching products and price tiers, plus audit logs whose JSON `details` contain `portfolioDemo: true` and a unique `demoKey`. Idempotency is based on pool names, existing pool/Koperasi orders, exact product/Supplier pairs, and audit `demoKey` markers.

The pending proposal remains a frontend-local contract under `volumemate_proposals`; Admin Koperasi login adds a PENDING NPK proposal matching `user.koperasi.name` when one is not already present.
