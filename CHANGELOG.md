# Changelog

All notable changes to SkillMark are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [0.1.0] — 2026-05-27

Initial working release. Phase 1 (foundation) complete.

### Added

**Backend (FastAPI)**
- Auth endpoints: `/auth/me`, `/auth/upsert-profile` — JWT validation via Supabase
- Projects CRUD: list, create, update, soft-delete, bulk archive/status/delete
- RFP upload (`POST /projects/:id/upload-rfp`) — PDF/DOCX to Supabase Storage with background AI extraction
- Resource matching engine (`POST /projects/:id/match`) — skill, seniority, availability, and domain scoring
- AI match explanation (`GET /projects/:id/match/:employee_id/explain`) — Claude-generated narrative
- Wish list management: add, remove, list shortlisted candidates per project
- Allocations: create, list (per project + per user), confirm, reject; 100% cap enforcement per user/month
- Users: list employees, get/update profile, upload avatar, skill matrix CRUD
- Skills: catalog list, add/remove user skills with level tracking
- Dashboard: aggregated stats (headcount, allocations, skill coverage, top skills)
- Notifications: list, mark read, mark all read
- Settings: org-wide config read/write (admin only)
- Role-based access control: `admin`, `manager`, `employee`, `viewer` enforced on every route
- Supabase Storage adapter with graceful error handling for missing bucket

**Frontend (React + Vite)**
- Auth flow: Supabase OAuth (Google, GitHub, email/password), auto-profile upsert on first sign-in
- AuthGuard with bootstrapped-state tracking — no flash of unauthenticated content
- Axios interceptor with 3-second `getSession()` timeout via `Promise.race` (prevents indefinite hang)
- Projects page: filterable list, create project modal, bulk actions
- Project detail: RFP upload zone, matching tab, wish list tab, allocations tab
- Employees page: searchable directory with skill badges
- Employee detail: full skill matrix view
- My Skills page: self-managed skill levels
- My Allocations page: pending/confirmed/rejected allocations with confirm/reject actions
- Query Resources page: cross-project skill search
- Compare page: side-by-side employee skill comparison
- Dashboard: charts for skill coverage, availability heatmap, top skills
- Notifications: real-time badge via Supabase Realtime, in-app notification list
- Profile page: edit personal info, upload avatar
- Dark mode via Tailwind + Zustand theme store
- i18n: EN + VI via react-i18next

**Infrastructure**
- Docker Compose for local portable mode
- `docker-compose.dev.yml` for local development with hot reload
- `.env.example` with all required variables documented
- SQL migrations and seed data for skill catalog

### Fixed

- PostgREST PGRST201 (ambiguous FK): `allocations` and `wish_list` queries now use explicit FK hints (`users!allocations_user_id_fkey`, `users!wish_list_user_id_fkey`)
- Supabase Storage upload errors now surface a clear message when the `rfp-files` bucket is missing
- Axios request interceptor no longer hangs indefinitely when `supabase.auth.getSession()` stalls — wrapped in `Promise.race` with a 3-second timeout
- `useProject` hook now always clears `loading` state even when the API call fails
- `bootstrap()` in `useAuth` wrapped in try/finally so `setBootstrapped()` always fires regardless of error

---

[0.1.0]: https://github.com/vicdang/skillmark/releases/tag/v0.1.0
