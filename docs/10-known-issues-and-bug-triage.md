# Known Issues And Bug Triage

## Known Issues

| Issue | Suspected root cause | Likely files |
|---|---|---|
| Account approval is only UI/static | No `User.status`, verification documents, or admin approval endpoints | `schema.prisma`, `AdminApprovalScreen.tsx`, `auth.service.ts` |
| Supplier proposals are not persisted in DB | Proposal flow uses `localStorage` | `CollectiveBuyScreen.tsx`, `MenuScreen.tsx` |
| Admin shortcut token is fake | `LoginScreen` sets `admin_session_token`, not real JWT | `LoginScreen.tsx`, `auth.guard.ts` |
| Payment/payout lifecycle missing | No payment/payout models or endpoints | `schema.prisma`, `order.service.ts` |
| Old docs and code disagree on role names | Product spec changed or implementation lagged | `schema.prisma`, `auth.service.ts`, `docs/old/*` |
| Old docs say RandomForest but code uses GradientBoosting | Model implementation changed after pitch deck | `VolumeMind/train.py`, `docs/old/volumemate_pitch_deck.md` |
| `targetVolumeKg` frontend/backend mismatch | Frontend sends field that Prisma pool model lacks | `api.ts`, `CollectiveBuyScreen.tsx`, `schema.prisma`, `order.service.ts` |
| Several backend endpoints unauthenticated | Guards not applied broadly | `order.controller.ts`, `supplier.controller.ts`, `users.controller.ts` |
| Dashboard uses assumptions/fallbacks | Fixed land area, inferred weather, fallback product/supplier | `dashboard.service.ts` |
| Debug log in VolumeMind controller | `console.log('body received:', body)` remains | `backend/src/volumemind/volumemind.controller.ts` |
| Backend README is generic Nest starter | Not project-specific | `backend/README.md` |
| Tests are starter-level | Core flows not covered | `backend/src/app.controller.spec.ts`, `backend/test/app.e2e-spec.ts` |
| Audit UI mentions blockchain | No blockchain implementation exists | `AuditLogScreen.tsx` |

## Reproduction Notes

| Problem | Repro steps |
|---|---|
| Proposal persistence | Login as Koperasi, create proposal, inspect `localStorage`, open a different browser/profile. |
| Admin approval no effect | Login shortcut `3`, approve/reject account, then inspect backend users; no change occurs. |
| VolumeMind unavailable | Stop Python service, load dashboard; backend should log fallback warning and frontend shows fallback recommendation. |
| Pool price recalculation | Seed DB, login demo Koperasi, join pool, inspect `OrderItem.priceAtPurchase` updates. |
| CSV export auth | Login real Koperasi, open export; compare with fake admin token behavior. |

## What Another LLM Should Ask The User For

| Debug area | Ask for |
|---|---|
| UI | Screenshot, viewport size, URL hash, browser console errors. |
| API | Network tab request URL/method/status/body, backend terminal log. |
| Database | Prisma error text, migration status, relevant model rows, environment variable names only. |
| Auth | Exact role/email used, whether login shortcut or real credential, token presence not token value. |
| AI | Python terminal log, backend VolumeMind error, request payload without secrets. |
| Files | Relevant screen, service, controller, Prisma schema, and seed/migration files listed in `06-folder-and-file-map.md`. |

## Emergency LLM Debug Protocol

1. Read `docs/03-latest-handoff.md` first.
2. Ask the user for `git status --short`, current branch, and whether backend/frontend/VolumeMind are running.
3. Ask for the exact error text and the screen/API action that triggered it.
4. Identify whether the bug is frontend-only, backend/API, database, or VolumeMind.
5. Request the smallest file set from `docs/06-folder-and-file-map.md`.
6. If API-related, request browser Network response and backend terminal log.
7. If DB-related, request Prisma error and schema/migration context, never secret values.
8. If UI-related, request screenshots at mobile width and browser console output.
9. Compare current code to old docs only after confirming current implementation.
10. Update the docs after any meaningful fix or decision.

