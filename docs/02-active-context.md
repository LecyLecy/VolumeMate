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

