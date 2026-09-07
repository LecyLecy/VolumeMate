# UI Routes And Components

## Routing

Frontend routing is hash-based in `frontend/src/App.tsx`.

| Hash | Screen | Access behavior |
|---|---|---|
| empty / `#` | Splash or role default | Depends on token/user. |
| `#login` | `LoginScreen` | Public. |
| `#register` | `RegisterScreen` | Public. |
| `#koperasi` | `KoperasiDashboardScreen` | Koperasi roles. |
| `#kolektif` | `CollectiveBuyScreen` | Koperasi roles. |
| `#gabung-pool` | `JoinPoolScreen` | Koperasi roles. |
| `#catat` | `RecordTransactionScreen` | Koperasi roles. |
| `#log` | `AuditLogScreen` | Koperasi roles. |
| `#supplier` | `SupplierMenuScreen` | Supplier role. |
| `#admin` | `AdminApprovalScreen` | Admin role. |

Role routing:

- `SUPPLIER` goes to supplier screen.
- `ADMIN` goes to admin screen.
- Anything else logged in goes to Koperasi dashboard.

## Main Screens

| Screen | Purpose | Data source |
|---|---|---|
| `SplashScreen` | Start screen. | Local only. |
| `LoginScreen` | Email/password login plus local shortcuts `1`, `2`, `3`, `4`. | Backend auth except shortcut `3`. |
| `RegisterScreen` | Basic registration. | Backend auth register. |
| `KoperasiDashboardScreen` | Metrics, VolumeMind card, active pool, pending proposal card. | Backend plus `localStorage`. |
| `CollectiveBuyScreen` | Pool search/list, tabs, propose modal, PDF attachment in browser storage. | Backend plus `localStorage`. |
| `JoinPoolScreen` | Contribution form and estimate. | Local selected pool, then backend via parent. |
| `RecordTransactionScreen` | Incoming procurement and outgoing distribution forms. | Backend. |
| `AuditLogScreen` | Manual/pool audit tabs and CSV export. | Backend audit logs/export. |
| `SupplierMenuScreen` | Pending/running supplier proposals and audit. | Backend for pools/logs plus local/static data. |
| `AdminApprovalScreen` | Review pending accounts. | Static frontend data only. |

## Main Components

| Component | Purpose |
|---|---|
| `MainHeader` | Shared top bar/logout. |
| `KoperasiBottomNav` | Koperasi bottom navigation. |
| Supplier inline bottom navigation | `MenuScreen.tsx` two-action Proposal/Audit bar; visually matches `KoperasiBottomNav`. |
| `BrandMark` | VolumeMate brand mark. |
| `PoolCard` | Pool card component. |

## Form Behavior

| Form | Current behavior |
|---|---|
| Login | Requires email/password unless using numeric shortcuts. Saves token/user to localStorage on backend login. |
| Register | Requires name, email, password >= 8 chars, terms accepted; role is `koperasi` or `supplier`. |
| Record incoming | Requires quantity, supplier, date, total price; posts `/orders/manual`. |
| Record outgoing | Requires quantity, buyer name, date, price/kg; posts `/orders/distribution`. |
| Join pool | Caps contribution to remaining target in UI, creates manual order then joins pool. |
| Propose pool | Validates supplier email, volume, optional PDF <= 2MB; stores proposal in `localStorage`. |
| Supplier approve/reject | Updates `localStorage` and local UI, not backend proposal tables. |
| Admin approve/reject | Shows notice only; does not update backend. |

## UI States

| State | Current examples |
|---|---|
| Loading | Dashboard, collective buy, audit log, supplier data show loading text. |
| Error | API catch blocks show notice/error text. |
| Empty | No active pools, no pending proposals, no audit logs. |
| Success | Transaction save modal, proposal success modal, join notice, admin notice. |

## Design Consistency Rules From Code

- Mobile shell: max width around 430px.
- Colors and fonts come from `frontend/src/theme.ts`.
- User-facing text is mostly Bahasa Indonesia.
- UI uses custom icon drawings plus SVG assets from `frontend/src/assets/`.
- Cards commonly use white surfaces, green accents, 8-16px radius, and light shadows.

## Screenshots To Ask For During UI Bugs

| UI bug | Ask for screenshots |
|---|---|
| Routing/login issue | Full browser viewport with URL hash visible. |
| Mobile layout overflow | 360px-ish mobile viewport screenshot and desktop screenshot if different. |
| Dashboard wrong | Dashboard top, VolumeMind card, active pool card. |
| Collective buy wrong | Open tab, Mine tab, proposal modal, browser console. |
| Supplier flow wrong | Pending tab, review modal, running tab. |
| Admin flow wrong | Approval list and review sheet. |
| Audit/export wrong | Manual tab, pool tab, network response for export. |


## Current Auth UI Additions - 2026-09-07

RegisterScreen now has account, OTP, organization and document steps. OtpVerificationCard.tsx is shared with the forgot-password flow in LoginScreen. Any nonempty OTP is accepted locally. Organization/contact/document selections are not included in the registration API request. Forgot-password shows a demo success notice but makes no reset API call. These screens do not establish email verification or persist a changed password.

## Portfolio Login UI - 2026-09-07

The current `#login` page supersedes the older auth UI note above. It contains exactly three primary actions:

| Button | Destination | Session Type |
|---|---|---|
| Admin Koperasi | `#koperasi` | Real JWT from `POST /auth/demo-login` |
| Supplier | `#supplier` | Real JWT from `POST /auth/demo-login` |
| Admin | `#admin` | Local static demo session |

Credential entry, forgot-password, and registration navigation are no longer rendered on `LoginScreen`. `RegisterScreen` and `OtpVerificationCard` remain in the repository but are not linked from the current login gateway.

## Populated Portfolio States - 2026-09-07

- `#koperasi`: first active pool displays 6.5/10.0 tons (65%); pending supplier section displays a 10,000 kg NPK proposal valued at Rp85,000,000.
- `#kolektif`: Pool Terbuka displays NPK, Urea, and SP-36 pool cards with 65%, 42%, and 78% progress.
- `#log` → Transaksi Manual: two incoming transactions and one outgoing distribution render.
- `#log` → Riwayat Pool: two successful join-pool records render.

## Supplier Audit Card Rules - 2026-09-07

- Never render the raw backend `AuditLog.details` JSON in a card.
- `JOIN_POOL` renders product and cooperative names, formatted volume/total, short pool ID, and tier price.
- Successful explanatory notes use a pale-green background and green text; declined/error notes use the existing red treatment.
- Unknown actions use a title-cased action name and generic “Aktivitas tercatat” message.

## Supplier Navigation Rules - 2026-09-07

- The Supplier screen has exactly two bottom actions: Proposal and Audit Log.
- Its bar uses the same inset floating capsule, green border, shadow, and circular active state as `KoperasiBottomNav`.
- Visible text labels are omitted to match the Koperasi bar; `accessibilityLabel` remains present for both actions.
