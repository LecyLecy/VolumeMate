# Progress And Decisions

## Built So Far

| Area | Evidence | Status |
|---|---|---|
| Vite frontend | `frontend/package.json`, `frontend/src/main.tsx`, `frontend/src/App.tsx` | Built/active |
| Mobile-style UI shell | Screens use `react-native-web`, max width around 430px | Built/active |
| Backend API | `backend/src/app.module.ts` imports auth/users/suppliers/orders/dashboard/volumemind | Built/active |
| PostgreSQL schema | `backend/prisma/schema.prisma` and migrations | Built/active |
| Seed data | `backend/prisma/seed.ts` | Built/active |
| JWT auth | `backend/src/auth/*` | Partially built |
| Manual procurement | `POST /orders/manual` | Built |
| Outgoing distribution | `POST /orders/distribution` | Built |
| Basic pools | `CollectivePool`, `/orders/pools/*` | Partially built |
| Dashboard metrics | `backend/src/dashboard/dashboard.service.ts` | Partially built |
| VolumeMind API | `VolumeMind/api.py` | Built, local service required |
| Supplier/admin screens | `MenuScreen.tsx`, `AdminApprovalScreen.tsx` | Mostly UI/mock |

## Important Product Decisions

| Decision | Current truth | Notes |
|---|---|---|
| Solo developer maintenance | Current policy | Ignore old team role assumptions except as history. |
| Mobile-first web app | Current code and old docs agree | UI is centered and mobile-shell-like. |
| Current repo is source of truth | Current policy | Old hackathon repo is historical only. |
| VolumeMind belongs on dashboard | Current code and newer old docs agree | No separate active VolumeMind route exists in current app. |
| PostgreSQL + Prisma backend | Current code | Old Expo/Supabase doc is outdated. |
| AI model algorithm | Current `train.py` uses `GradientBoostingRegressor` | Old pitch deck says RandomForest; outdated. |
| Account approval required | Product intent in old docs | Not implemented in current backend schema. |
| Full payment lifecycle | Product intent in old docs | Not implemented in current code. |

## Outdated Old-Doc Assumptions

- `docs/old/expo_supabase_implementation.md` describes an Expo/Supabase app in `volumemate-mobile/`; that folder is not in this repo.
- `docs/old/design.md` mentions a separate VolumeMind menu; current app shows VolumeMind on the Koperasi dashboard.
- Old docs use role names `KOPERASI`, `SUPPLIER`, `ADMIN`; current Prisma roles are `ADMIN_KOPERASI`, `ANGGOTA`, `SUPPLIER`, `ADMIN`.
- Old docs define account statuses and verification document tables; current schema lacks those.
- Old docs define payment and payout tables/statuses; current schema lacks those.

## Future Append-Only Progress Log

Add new entries here instead of rewriting history.

| Date | Change | Files/areas | Notes |
|---|---|---|---|
| 2026-06-15 | Rebuilt docs for AI handoff | `docs/` | Archived old markdown docs and created ten compact handoff docs. |

## Future Decision Log

Add decisions here when product or architecture direction changes.

| Date | Decision | Reason | Follow-up |
|---|---|---|---|
| 2026-06-15 | Treat `dev` as active development branch and `main` as deploy-ready branch | Repository policy from user request | Do documentation work on `dev`; do not push unless explicitly asked. |

