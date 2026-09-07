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


## Static Review Findings - 2026-09-07 (Unfixed)

- Public user reads and audit logs return password fields through unrestricted Prisma results. Public user creation also accepts raw Prisma input, bypassing normal registration hashing/role restrictions. Inspect users.controller.ts, users.service.ts and order.service.ts. No global guard found. Ask only for sanitized response field names/status, not secret values.
- Pool join lacks ownership and matching-product checks; reprices multiple records without a transaction and returns a pre-repricing object. Concurrent joins/failures can leave inconsistent state. Inspect order.service.ts; reproduce later with isolated test data, not production orders.
- Manual product lookup matches name without supplier filtering, so an existing product from another supplier can be selected. Inspect findOrCreateProduct in order.service.ts.
- OTP accepts any nonempty input; password reset only shows a demo notice. Registration organization/documents are not submitted. Repro: follow these forms and inspect the network request list; no OTP/reset request exists. Inspect LoginScreen.tsx, RegisterScreen.tsx, OtpVerificationCard.tsx.
- Lint baseline: frontend 36 errors/3 warnings, backend 13 errors; builds and one starter unit test pass. No fixes attempted; do not treat passing builds as integration validation.
- docs/old is absent locally and untracked on dev despite old documentation claims; retrieve historical material from Git history if needed.
- Generated .review-build/frontend remains after command-policy rejection of cleanup. No application source changes made.

## Portfolio Demo Security Warning - 2026-09-07

- `POST /auth/demo-login` intentionally issues a valid JWT without checking a password. This is acceptable only for the requested local portfolio walkthrough.
- Do not deploy or expose the current backend to a public network. Before any public deployment, remove this endpoint or protect it behind an explicit, disabled-by-default demo environment flag and non-sensitive demo-only data.
- The Admin button still uses a fake local token and the Admin approval page remains static; it cannot call protected backend endpoints.
- If a Koperasi or Supplier demo button reports that no account exists, create only disposable demo data or inspect role counts. Do not reset, reseed, or delete an existing database without explicit approval.
- Current lint baseline is frontend 35 errors/3 warnings and backend 13 errors; none are in the changed demo-login files.

## Portfolio Dummy-Data Notes - 2026-09-07

- The database dummy-data command is idempotent but depends on at least one existing Koperasi-linked user and Supplier-linked user.
- Proposal dummy data is browser-local. Clearing site storage removes it; choosing Admin Koperasi again restores one matching pending proposal.
- Pool target volume is still not stored in Prisma; portfolio cards consistently use a 10,000 kg frontend fallback.
- If content is empty, run `backend/npm run demo:data`, check for its success message, log out/in through Admin Koperasi, and reload. Do not run the destructive legacy seed against a database containing data worth preserving.

## Supplier Audit Raw JSON - Resolved 2026-09-07

- Cause: `mapDbAuditLogToSupplierAuditLog` had no `JOIN_POOL` branch and its generic fallback assigned raw `log.details` to the visible note.
- Fix: explicit `JOIN_POOL` mapping, human-readable generic fallback, success-note styling, and synchronized dummy metadata.
- Verified: refreshed Supplier Audit shows product/cooperative/volume/value/tier information with no `portfolioDemo` or `demoKey` JSON visible.

## Supplier Bottom Bar Mismatch - Resolved 2026-09-07

- Cause: `MenuScreen.tsx` used a separate full-width, labeled bottom bar instead of the established floating Admin Koperasi navigation treatment.
- Fix: copied the `KoperasiBottomNav` container and active-state design into the existing two-action Supplier navigation while preserving Proposal/Audit behavior.
- Verified: frontend production build passed and live mobile-width rendering shows the floating two-icon capsule. Browser automation timed out while attempting the Audit Log click, so re-check both active states manually if future navigation behavior changes.
