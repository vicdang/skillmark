# SkillMark — Claude Code Context

## Project
SkillMark is a skill matrix management web service with AI-powered RFP analysis and resource matching.

## Stack
- Frontend: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui (Radix)
- Backend: Python FastAPI + Pydantic v2
- Database: Supabase (PostgreSQL + Auth + Storage + Realtime)
- AI: Anthropic Claude (primary), configurable fallback
- State: Zustand
- i18n: react-i18next (EN + VI)

## Monorepo Layout
- `/frontend` — React app (Vite, port 3000)
- `/backend` — FastAPI app (uvicorn, port 8000)
- `/backend/migrations` — SQL migration files (run in Supabase SQL editor or via Docker)
- `/backend/seed` — Seed SQL for skill catalog, tags, settings
- Root: docker-compose files, .env.example

## Key Commands
```bash
# Frontend dev
cd frontend && npm run dev

# Backend dev
cd backend && uvicorn app.main:app --reload

# Portable (Docker)
docker-compose up --build
```

## Conventions
- TypeScript strict mode — no `any`, no suppressed errors
- Pydantic v2 for all backend models (`model_dump`, not `.dict()`)
- Supabase client via `@supabase/supabase-js` (frontend) and `supabase-py` (backend)
- API versioning: `/api/v1/`
- i18n: all visible strings use `t('key')` — never hardcode English in JSX
- All dates: ISO 8601, TIMESTAMPTZ in DB
- UUID for all primary keys
- Path alias: `@/` maps to `frontend/src/`
- shadcn/ui components live in `frontend/src/components/ui/`

## Auth Flow
- Supabase Auth handles Google, GitHub, and email/password OAuth
- On new user sign-up, a DB trigger (`on_auth_user_created`) auto-creates the `users` row
- Backend reads the Supabase JWT from `Authorization: Bearer <token>` header
- `GET /api/v1/auth/me` returns the app user profile (not the Supabase auth object)

## Role System
- `admin` > `manager` > `employee` > `viewer`
- Backend enforces via `require_admin`, `require_manager_or_above`, etc. in `dependencies.py`
- Frontend enforces via role checks in the Zustand auth store

## Implementation Phases
See `spec/SKILLMARK_PROJECT_SPEC.md` Section 16 for the full phase plan.
Current: Phase 1 complete — foundation, auth, layout, profile, projects, matching, allocations, wish list, dashboard, notifications, settings, team management.
Released as `v0.1.0`.
Next: Phase 2 — Skill Matrix CRUD (employee self-service skill levels, gap analysis).

## Recent Fixes & Improvements (v0.1.0)
- **Auth bootstrap**: Fixed blank page after login by improving state management in `useAuth` hook and showing loading indicator in `AuthGuard`
- **i18n locales**: Added en-US and vi-VN locale directories to support browser-detected locale codes
- **Employee visibility**: Changed `/users` endpoint auth from `require_admin` to `require_employee_or_above` so employees can view the directory
- **Wishlist feature**: Fixed database column mapping (employee_id → user_id, notes → note) across frontend hooks and pages
- **AI explanations**: Added error handling and API key validation in matching engine
- **Wishlist UI**: Fixed star button state tracking by ensuring frontend field names match backend response schema
- **Team Management**: Added admin UI for granting/changing user roles (admin, manager, employee, guest, viewer)

## Known Issues / Gotchas
- PostgREST FK joins: `allocations` and `wish_list` both have two FKs to `users`. Always use explicit hints: `users!allocations_user_id_fkey` and `users!wish_list_user_id_fkey`.
- Supabase Storage: the `rfp-files` bucket must be created manually in the Supabase dashboard before RFP uploads will work.
- Axios interceptor: `supabase.auth.getSession()` can hang; it is wrapped in `Promise.race` with a 3-second timeout in `frontend/src/lib/api.ts`.
