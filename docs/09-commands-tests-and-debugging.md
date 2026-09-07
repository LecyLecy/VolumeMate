# Commands, Tests, And Debugging

## Install

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

VolumeMind:

```bash
cd VolumeMind
pip install fastapi uvicorn pandas joblib scikit-learn
```

## Environment Variables

Backend example file: `backend/.env.example`.

Known backend env names:

| Name | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. Do not expose secret value in docs or chat. |
| `PORT` | Optional | Defaults to `3000`. |
| `JWT_SECRET` | Recommended | Code has fallback default, but production should set it. Missing from `.env.example`. |
| `VOLUMEMIND_URL` | Optional | Defaults to `http://localhost:8000`. |

Frontend env names:

| Name | Required | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | Optional | Defaults to `http://localhost:3000`. |

## Database

Current README suggests `npx prisma db push`, but repo has migrations. Prefer deliberate migration workflow when preserving data.

Common local reset/seed flow for development only:

```bash
cd backend
npx prisma migrate dev
npm run seed
```

Warning: `backend/prisma/seed.ts` deletes existing rows before inserting demo data.

## Run

Backend:

```bash
cd backend
npm run start:dev
```

VolumeMind:

```bash
cd VolumeMind
python -m uvicorn api:app --port 8000 --reload
```

Frontend:

```bash
cd frontend
npm run dev
```

## Build, Lint, Test

Frontend:

```bash
cd frontend
npm run build
npm run lint
npm run preview
```

Backend:

```bash
cd backend
npm run build
npm run lint
npm run test
npm run test:e2e
npm run test:cov
```

VolumeMind training:

```bash
cd VolumeMind
python train.py
```

## Common Debugging Steps

1. Check `git status` and branch.
2. Start PostgreSQL and confirm `DATABASE_URL`.
3. Start backend and read terminal logs.
4. Start VolumeMind if dashboard recommendations are involved.
5. Start frontend and open browser console/network tab.
6. Reproduce with demo users from `backend/prisma/seed.ts`.
7. Check relevant API responses in Network tab.
8. Check DB records for `User`, `Order`, `OrderItem`, `CollectivePool`, `AuditLog`, `Distribution`.

## Common Errors

| Error | Likely cause |
|---|---|
| `DATABASE_URL is not set` | Missing `backend/.env`. |
| Frontend `Terjadi kesalahan pada server` | Backend returned non-OK response; inspect Network response body. |
| Dashboard AI fallback message in backend | VolumeMind service not running or `VOLUMEMIND_URL` wrong. |
| Admin screen can open but API calls 401 | Admin shortcut uses fake token. |
| Proposal disappears across browsers | Proposal stored in browser `localStorage`, not DB. |
| Prisma model/type mismatch | Need `npm install`/`prisma generate` or migration alignment. |

## Git Workflow Rules

- Do not push directly to `main` unless explicitly asked.
- Use feature branches for new features.
- Use fix branches for bug fixes.
- Use docs branches for documentation-only changes unless user says work on `dev`.
- `main` must represent deploy-ready state.
- `dev` is the active development branch.
- Do not force push unless explicitly asked.
- Before risky changes, check `git status` and current branch.
- Before ending a meaningful task, update the docs.
- Do not delete or modify remote branches without explicit approval.
- Do not push anything unless explicitly asked.


## Verified Review Commands - 2026-09-07

- frontend: npm run build -- --outDir ../.review-build/frontend passed (separate output avoids overwriting tracked dist).
- frontend: npm run lint failed: 36 errors, 3 warnings, including an unreachable duplicate branch in LoginScreen.tsx.
- backend: npm run build passed; npm test -- --runInBand passed one starter test.
- backend: npx --no-install eslint "{src,apps,libs,test}/**/*.ts" failed: 13 errors (test type resolution and formatting). Used read-only invocation because npm run lint includes --fix.
- Python AST parsing passed for all four .py files; model loading/inference and dependency compatibility not tested.
- No live database or browser end-to-end checks performed.
- Correction: backend/package.json has no scripts.seed. Seed is configured in prisma.config.ts; use npx prisma db seed only deliberately on a disposable/demo database. Not run during review.
- .review-build/frontend generated output remains because cleanup command was blocked by policy.

## Portfolio Demo Runtime - 2026-09-07

Verified local endpoints:

- Frontend: `http://127.0.0.1:5173/`
- Backend: `http://127.0.0.1:3000/`
- VolumeMind API docs: `http://127.0.0.1:8000/docs`

VolumeMind dependencies were installed for Python 3.13 with:

```powershell
py -3.13 -m pip install fastapi uvicorn pandas joblib scikit-learn
```

Run VolumeMind with Python 3.13 on this machine because the default `python` command points to Python 3.8 without the required packages:

```powershell
py -3.13 -m uvicorn api:app --host 127.0.0.1 --port 8000
```

The portfolio buttons require at least one existing Koperasi-role user and one Supplier-role user, but do not require their passwords.

Latest full checks: frontend lint reports 35 errors/3 warnings in existing non-login files; backend lint reports the same 13 pre-existing errors. Targeted lint for `LoginScreen.tsx`, `api.ts`, and `backend/src/auth/*.ts` passes. Both builds and the single backend starter unit test pass.

## Populate Portfolio Data - 2026-09-07

Use the additive portfolio command, not the destructive full seed:

```powershell
cd backend
npm run demo:data
```

The command requires existing Koperasi and Supplier demo accounts and may be safely rerun. It does not delete records. After running, log out, choose Admin Koperasi again so the browser-local pending proposal is initialized, then reload the target screen if it was already open.
