# VolumeMate Project Overview

## What This Project Is

VolumeMate is a smart fertilizer procurement application for Indonesian agricultural cooperatives. It combines procurement records, supplier price tiers, collective buying pools, and the VolumeMind AI recommendation service.

Current repository shape:

| Area | Current implementation |
|---|---|
| Frontend | Vite + React + React Native Web mobile-style web app in `frontend/` |
| Backend | NestJS REST API in `backend/` |
| Database | PostgreSQL through Prisma in `backend/prisma/` |
| AI | Python FastAPI service and trained model files in `VolumeMind/` |

This repo is now the source of truth. The previous hackathon repo and old team/role docs are historical context only.

## Problem It Solves

Cooperatives often buy fertilizer with incomplete demand, pricing, and timing information. VolumeMate helps them:

- record incoming procurement and outgoing distribution,
- understand stock and savings,
- use supplier volume price tiers,
- join or create collective-buy pools,
- view AI-assisted forecast and volume-buy recommendations,
- keep audit logs for procurement activity.

## Target Users

| User | Current code support |
|---|---|
| Koperasi users | Implemented as `ADMIN_KOPERASI` or `ANGGOTA` roles. Main app user flow. |
| Supplier users | Partially implemented. Login and supplier proposal UI exist; much proposal state is local/browser simulated. |
| Admin users | UI mock/static approval screen exists. Backend approval workflow is not implemented. |

This project is currently maintained by a solo developer. Old documentation that assumes a team structure is outdated unless useful as history.

## Core Features

Implemented or partially implemented:

- login/register with JWT backend auth,
- role-based initial screen routing,
- Koperasi dashboard summary,
- VolumeMind recommendation card on dashboard,
- manual incoming procurement transaction recording,
- outgoing distribution recording,
- active collective pool listing,
- join pool flow,
- supplier proposal/review screens using local browser storage for some state,
- audit log screen and CSV export,
- product, supplier, price tier, order, pool, distribution, and audit database models,
- Python `/predict` and `/recommend` endpoints for VolumeMind.

## In Scope Now

- Mobile-style web/PWA experience.
- NestJS + Prisma backend.
- PostgreSQL-backed orders, products, pools, suppliers, users, distributions, and audit logs.
- VolumeMind integration via backend calls to a local FastAPI service.
- AI handoff/debugging documentation in `docs/`.

## Out Of Scope Or Not Confirmed

- Native Expo app: old docs mention it, current repo does not contain `volumemate-mobile/`.
- Supabase client/RLS implementation: old docs mention it, current code uses Prisma/PostgreSQL.
- Full admin verification status model: old docs specify `PENDING_ADMIN_APPROVAL`, but current Prisma `User` has no account status field.
- Payment gateway, 24-hour payment window, supplier payout, and full final pool lifecycle: old docs specify these, current schema does not fully implement them.
- Separate desktop product experience: old docs and current UI favor a centered mobile shell.

