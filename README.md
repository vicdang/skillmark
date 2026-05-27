# SkillMark

Skill matrix management platform with AI-powered RFP analysis and resource matching.

## What it does

- **Skill Matrix** — Employees self-manage skill levels; managers view and search across the org
- **Resource Matching** — Upload an RFP → AI extracts requirements → ranked candidate list with match scores
- **Allocation Tracking** — Assign employees to projects by month/percentage; employees confirm or reject
- **Wish List** — Shortlist candidates per project before finalising allocations
- **Dashboard & Analytics** — Skill coverage, availability, and gap analysis charts
- **Notifications** — Real-time in-app alerts via Supabase Realtime

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui |
| Backend | Python FastAPI + Pydantic v2 |
| Database | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| AI | Anthropic Claude (RFP extraction + match explanations) |
| State | Zustand |
| i18n | react-i18next (EN + VI) |

## Quick start

### Prerequisites

- Node 20+, Python 3.11+
- A Supabase project (free tier works)
- An Anthropic API key

### Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Dev (local)

```bash
# Backend
cd backend
python -m venv .venv && .venv/Scripts/activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Frontend → http://localhost:3000  
Backend API → http://localhost:8000/api/v1  
API docs → http://localhost:8000/docs

### Docker (portable mode)

```bash
docker-compose up --build
```

## Database setup

Run the migration files in order inside the Supabase SQL editor:

```
backend/migrations/001_initial_schema.sql
backend/migrations/...
```

Then seed the skill catalog:

```
backend/seed/skills.sql
```

## Role system

`admin` > `manager` > `employee` > `viewer`

- **admin** — full access, user management
- **manager** — create/edit projects, run matching, manage allocations
- **employee** — manage own skills and availability, confirm/reject allocations
- **viewer** — read-only

## Project layout

```
skillmark/
├── frontend/          React app (Vite)
├── backend/           FastAPI app
│   ├── app/
│   │   ├── routers/   API route handlers
│   │   ├── models/    Pydantic schemas
│   │   ├── services/  Matching engine, RFP extractor, AI
│   │   └── db/        Supabase client
│   ├── migrations/    SQL migration files
│   └── seed/          Seed data
├── spec/              Full product specification
├── e2e/               End-to-end tests
└── docker-compose.yml
```

## API

All endpoints live under `/api/v1/`. See `/docs` for the full OpenAPI spec.

Key endpoints:

| Method | Path | Description |
|---|---|---|
| GET | `/auth/me` | Current user profile |
| GET/POST | `/projects` | List / create projects |
| POST | `/projects/:id/upload-rfp` | Upload RFP file (PDF/DOCX) |
| POST | `/projects/:id/match` | Run AI resource matching |
| GET | `/projects/:id/wishlist` | Get shortlisted candidates |
| POST | `/allocations` | Allocate employee to project |
| GET | `/users` | Employee directory |
| GET | `/skills` | Skill catalog |
| GET | `/dashboard/stats` | Dashboard metrics |
