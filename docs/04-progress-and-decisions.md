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


### 2026-09-07 - Project Review And Repository Access

- Reviewed frontend flows, backend controllers/services, Prisma schema, Python forecasting/training, configuration and ten memory docs.
- Verified remote read access with git fetch --all --prune and git ls-remote; dev synchronized at 0cc3a53. No remote changes.
- Application code unchanged. Updated memory docs 02/03/04/06/07/08/09/10 with findings, current limitations and validation.
- Frontend/backend builds pass; frontend lint 36 errors/3 warnings; backend read-only lint 13 errors; one backend unit test passes; four Python sources parse.
- Runtime DB/browser/AI tests not performed. Security and pool consistency findings remain unfixed; this was analysis only.
- Generated .review-build/frontend retained after cleanup command was blocked by policy. docs/old absent despite prior historical references.

### 2026-09-07 - Add One-Click Portfolio Role Gateway

Summary:
- Replaced the credential login form with three one-click buttons for Admin Koperasi, Supplier, and Admin.
- Added a portfolio-only backend demo-login route so database-backed pages receive valid JWTs without typed credentials.
- Installed the documented VolumeMind runtime packages for Python 3.13 and started all local services.

Files changed:
- `frontend/src/screens/LoginScreen.tsx`: three-button role gateway.
- `frontend/src/services/api.ts`: demo-login client method and session persistence.
- `backend/src/auth/auth.controller.ts`: `POST /auth/demo-login` route.
- `backend/src/auth/auth.service.ts`: role lookup and JWT issuance for demo users.
- `docs/02-active-context.md`, `docs/03-latest-handoff.md`, `docs/04-progress-and-decisions.md`, `docs/06-folder-and-file-map.md`, `docs/07-api-and-data-contract.md`, `docs/08-ui-routes-and-components.md`, `docs/09-commands-tests-and-debugging.md`, `docs/10-known-issues-and-bug-triage.md`: portfolio handoff updates.

Tests/checks:
- `frontend/npm run build`: passed.
- `frontend/npx eslint src/screens/LoginScreen.tsx src/services/api.ts`: passed.
- `backend/npm run build`: passed.
- `backend/npx --no-install eslint "src/auth/*.ts"`: passed after formatting touched auth files only.
- Live API: Koperasi and Supplier demo-login both returned valid JWTs with expected roles.
- Browser: all three buttons reached `#koperasi`, `#supplier`, and `#admin`; no browser warnings/errors.
- Full lint baselines remain: frontend 35 errors/3 warnings; backend 13 errors outside the changed auth files. Backend starter test: 1 passed.

Decision:
- Keep passwordless demo access because the project is now a local portfolio artifact.
- Treat `/auth/demo-login` as an intentional security bypass; remove or gate it before any public deployment.

### 2026-09-07 - Populate Portfolio Screens With Dummy Data

Summary:
- Added a non-destructive, idempotent portfolio data command.
- Populated three active procurement pools with products, tiers, and participation volumes.
- Added manual transaction, outgoing distribution, and pool-join audit history.
- Added one pending proposal to browser storage during Admin Koperasi demo login.
- Aligned the dashboard fallback pool target with the Collective page at 10,000 kg.

Files changed:
- `backend/prisma/portfolio-demo-data.ts`: safe portfolio data creation.
- `backend/package.json`: `demo:data` command.
- `frontend/src/screens/LoginScreen.tsx`: pending proposal initialization.
- `frontend/src/services/api.ts`: typed Koperasi name in demo-login response.
- `frontend/src/screens/KoperasiDashboardScreen.tsx`: consistent 10-ton fallback target.
- Memory docs 02/03/04/06/07/08/09/10: dummy-data workflow and handoff.

Tests/checks:
- `npm run demo:data`: passed twice; browser output remained deduplicated.
- Frontend and backend builds: passed.
- New backend script lint and changed login/API lint: passed.
- Live browser: dashboard pool/proposal, three Collective pool cards, three Manual Audit cards, and two Pool History cards rendered.

Decision:
- Use a separate additive portfolio-data command instead of the existing destructive seed.

### 2026-09-07 - Fix Supplier Audit JSON Presentation

Summary:
- Added explicit readable mapping for `JOIN_POOL` supplier audit entries.
- Replaced generic raw-JSON fallback copy with a safe human-readable activity label.
- Styled successful audit notes as green success messages instead of red error messages.
- Synchronized product and cooperative metadata into existing portfolio audit records.

Files changed:
- `frontend/src/screens/MenuScreen.tsx`: audit mapping, fallback formatting, and success-note styling.
- `backend/prisma/portfolio-demo-data.ts`: update existing demo logs and include display metadata.
- Memory docs 02/03/04/06/08/10.

Tests/checks:
- Frontend/backend builds passed.
- `npm run demo:data` passed and updated existing demo entries without duplication.
- Browser verification confirmed readable NPK/Urea pool cards and no raw JSON.
- `MenuScreen.tsx` retains 14 existing lint errors and one warning; no new lint category was introduced.

### 2026-09-07 - Match Supplier Navigation To Admin Koperasi

Summary:
- Replaced the Supplier screen's edge-to-edge labeled bottom bar styling with the floating capsule design used by `KoperasiBottomNav`.
- Kept exactly two destinations: Proposal and Audit Log.
- Removed visible labels and the small active dot; retained accessible labels and added the Admin Koperasi-style circular active background.

Files changed:
- `frontend/src/screens/MenuScreen.tsx`: supplier navigation markup and styles.
- Memory docs 02/03/04/06/08/10.

Tests/checks:
- `frontend/npm run build`: passed.
- `frontend/npx eslint src/screens/MenuScreen.tsx`: unchanged legacy baseline of 14 errors and one warning.
- Live browser screenshot at mobile width: passed for the Proposal tab and new floating bar.
- Automated click to visually switch to Audit Log timed out in browser control; the existing handler was not changed and TypeScript compilation passed.

Decision:
- Reuse the Admin Koperasi navigation dimensions and visual tokens directly in the Supplier screen while keeping its two-item information architecture.

### 2026-09-07 - Commit And Push Portfolio Changes

Summary:
- Committed all accumulated requested files, including pre-existing `.review-build/` frontend verification output, then pushed the result to `origin/dev`.

Commit:
- `59edf91 feat(portfolio): add demo access and sample data`

Decision:
- Keep `main` untouched; the user authorized a push, not a merge or direct publication of the deploy-ready branch.
