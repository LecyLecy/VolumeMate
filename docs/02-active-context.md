# Active Context

## Current Git State

As part of this docs rebuild:

- Current working branch before writing docs: `dev`.
- `main` existed locally and remotely.
- `dev` existed locally and remotely.
- `git fetch --all --prune` pruned old deleted remote refs.
- `main` was switched to and pulled from `origin/main`: already up to date.
- `dev` was switched to and pulled from `origin/dev`: already up to date.
- No extra local branches existed after fetch/prune; only `main` and `dev` remained locally.
- Working tree was clean before documentation changes.
- Working tree is expected to be dirty after this rebuild because old docs were moved and ten new docs were created.

Remote:

```text
origin https://github.com/LecyLecy/VolumeMate.git
```

## Current State

The app is a functional work-in-progress, not a finished production system.

| Area | State | Notes |
|---|---|---|
| Frontend shell/routing | Partially finished | Hash-based routing in `frontend/src/App.tsx`; role routing uses `localStorage` user/token. |
| Auth | Partially finished | Backend JWT login/register works; no approval/status enforcement. |
| Koperasi dashboard | Partially finished | Loads backend dashboard, pools, logs; has fallback/mock behavior. |
| Manual transactions | Partially finished | Incoming procurement and outgoing distribution write to database. |
| Audit log | Partially finished | Reads backend audit logs and exports CSV. Some text references blockchain, but no blockchain exists. |
| Collective buying | Partially finished | Backend has basic active pools and join logic; frontend proposal/supplier approval uses localStorage. |
| Supplier flow | Partially finished | UI exists, but major accept/reject/proposal persistence is browser-local. |
| Admin approval | Mostly mock | Static pending accounts in frontend only; no backend user approval model. |
| VolumeMind | Partially finished | Python service exists; backend calls `/predict` then `/recommend`; dashboard falls back if unavailable. |
| Payment/payout lifecycle | Not started in code | Described in old docs only. |

## Current Focus Inferred From Repo

Likely active areas:

- stabilizing the mobile-style web app,
- connecting frontend flows to the NestJS API,
- replacing browser-local proposal/admin simulation with database-backed workflows,
- aligning Prisma schema with the newer product lifecycle,
- keeping VolumeMind usable from dashboard.

## Important Warnings

- Old docs mention `KOPERASI`, `SUPPLIER`, `ADMIN`, account approval statuses, payment windows, and payout flow. Current code uses `ADMIN_KOPERASI`, `ANGGOTA`, `SUPPLIER`, `ADMIN`; there is no `User.status`.
- Old docs mention Expo/Supabase. Current repo is Vite/NestJS/Prisma/PostgreSQL.
- `backend/src/volumemind/volumemind.controller.ts` has a debug `console.log`.
- `backend/.env.example` does not include `JWT_SECRET` or `VOLUMEMIND_URL`, although code reads them.
- Tests are starter-level and do not cover core procurement behavior.

## Blockers Or Uncertainty

- Deployment target is not confirmed from current repo.
- Real file upload/storage for KTP/PDF documents is not implemented.
- Payment provider and payout mechanism are not selected.
- Whether to keep `ADMIN_KOPERASI`/`ANGGOTA` or migrate to old-doc `KOPERASI` role naming needs a deliberate schema/API decision.


## 2026-09-07 Repository Review (Current)

- Task: project-wide architecture/code review and GitHub access verification; application code unchanged.
- Repository: https://github.com/LecyLecy/VolumeMate. Remote read access confirmed by successful fetch and ls-remote. Push permissions not tested.
- Branch: dev, synchronized with origin/dev at 0cc3a53; clean before review. Both main and dev exist locally/remotely.
- Builds pass; frontend lint has 36 errors/3 warnings; backend read-only lint has 13 errors. Backend unit test passes (one starter test); four Python files parse successfully. Database, browser flows, and AI inference were not exercised.
- Priority findings: public user/audit responses include password fields; public user creation accepts raw Prisma data; order/pool mutations lack authorization; pool repricing is not atomic and does not check product compatibility.
- OTP/reset are demo-only; registration organization/document fields are not sent to API. Existing supplier/admin/payment limitations remain.
- Correction to older history: docs/old is absent in this checkout and is not tracked on dev. Consult Git history for historical docs.
- Review changes are memory-doc updates plus .review-build/frontend build artifacts. Cleanup of generated artifacts was blocked by command policy. No commit, push, or merge.

## 2026-09-07 Portfolio Demo Gateway (Current)

- Current focus: documentation/portfolio presentation; feature development is no longer planned.
- `#login` is now a three-button demo gateway for Admin Koperasi, Supplier, and Admin; credential fields, registration link, and forgot-password UI were removed from this screen.
- Admin Koperasi and Supplier call `POST /auth/demo-login` and receive JWTs for the first matching existing account. Admin continues to use the frontend-only demo session because its approval screen is static.
- Branch: `dev`. The working tree already contained review documentation changes and `.review-build/` before this task; current code/doc changes remain uncommitted.
- PostgreSQL, backend (`127.0.0.1:3000`), VolumeMind (`127.0.0.1:8000`), and frontend (`127.0.0.1:5173`) were started locally and verified.
- Important warning: `/auth/demo-login` deliberately bypasses passwords and must never be enabled in a public/production deployment.
- Current full lint baseline after this change: frontend 35 errors/3 warnings in pre-existing files; backend 13 errors. The changed frontend/auth files pass targeted lint.

## 2026-09-07 Portfolio Dummy Data (Current)

- Added and ran the non-destructive, idempotent `npm run demo:data` command.
- Current portfolio data includes three active pools, three manual/distribution audit entries, and two pool audit entries linked to the first demo Koperasi/Supplier records.
- Admin Koperasi one-click login now adds one matching pending supplier proposal to browser storage when missing.
- Verified in the browser: Dashboard active pool + pending proposal, three Collective Buying pool cards, three Manual Audit cards, and two Pool History cards all render.
- Do not use the destructive legacy Prisma seed merely to restore portfolio data; use `npm run demo:data`.

## 2026-09-07 Supplier Audit Presentation Fix (Current)

- Supplier audit no longer renders raw backend JSON for `JOIN_POOL` or unknown audit actions.
- `JOIN_POOL` cards now show product, cooperative, volume, estimated total, pool ID, and active tier price in readable Indonesian copy.
- Notes on successful audit entries use a green success treatment; declined/warning notes retain their warning treatment.
- Portfolio demo audit records now synchronize product/cooperative display metadata when `npm run demo:data` is rerun.
- Browser verification passed with no raw `portfolioDemo`/`demoKey` JSON visible.

## 2026-09-07 Supplier Bottom Navigation Refresh (Current)

- Supplier Proposal/Audit navigation now uses the same floating rounded capsule, border, shadow, spacing, and circular active state as `KoperasiBottomNav`.
- The Supplier bar intentionally contains only two icon actions: Proposal and Audit Log. Their labels remain available to accessibility APIs.
- The change is presentation-only in `frontend/src/screens/MenuScreen.tsx`; supplier state and navigation behavior are unchanged.
- Frontend production build passed. Live mobile-width rendering was visually verified; an automated Audit Log click timed out at the browser-control layer.
