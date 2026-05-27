# SkillMark Setup Guide

## Step 1: Configure Environment Variables

Edit [.env](.env) and fill in these values:

### Required: Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings → API**
4. Copy and paste:
   - `SUPABASE_URL` → Project URL
   - `SUPABASE_ANON_KEY` → Anon public key
   - `SUPABASE_SERVICE_KEY` → Service role key (marked as secret)
   - `VITE_SUPABASE_URL` → same as SUPABASE_URL
   - `VITE_SUPABASE_ANON_KEY` → same as SUPABASE_ANON_KEY

### Required: Anthropic API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Navigate to **API Keys**
3. Create or copy an existing key
4. Paste into `ANTHROPIC_API_KEY`

### Optional: Frontend URL
- If deploying to a different domain, update `FRONTEND_URL`

### Optional: OAuth (Google & GitHub)
- Configure in Supabase Dashboard under **Authentication → Providers**
- The frontend already supports Google and GitHub OAuth

---

## Step 2: Set Up Database Schema

Once `.env` is filled in, run SQL migrations:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run each migration file in order:
   ```
   backend/migrations/001_initial_schema.sql
   backend/migrations/002_...sql
   ```
3. Then seed the skill catalog:
   ```
   backend/seed/skills.sql
   ```

Alternatively, if using Python + CLI:
```bash
cd backend
python -m supabase.cli db push
```

---

## Step 3: Run Locally

### Option A: Docker (Recommended for first-time setup)
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1
- API Docs: http://localhost:8000/docs

### Option B: Manual (Frontend + Backend)

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend (separate terminal):**
```bash
cd frontend
npm install
npm run dev
```

---

## Step 4: Test & Deploy

### Local Testing
1. Open http://localhost:3000
2. Sign up with email or OAuth (Google/GitHub)
3. Profile auto-creates on first sign-in
4. Try uploading an RFP or creating a project

### Cloud Deployment
- **Frontend:** Deploy to Vercel (`npm run build` → push)
- **Backend:** Deploy to Koyeb, Railway, or Heroku
- Update `FRONTEND_URL` and `VITE_API_URL` to production URLs

---

## Troubleshooting

**Supabase Storage Error?**
- Create the `rfp-files` bucket manually in Supabase Dashboard → Storage

**PostgREST FK Join Errors?**
- These are fixed in the code, but ensure all migrations ran in order

**Axios Request Hangs?**
- The code wraps `getSession()` in a 3-second timeout; check CORS settings

---

For full project details, see [CLAUDE.md](CLAUDE.md) and [spec/SKILLMARK_PROJECT_SPEC.md](spec/SKILLMARK_PROJECT_SPEC.md).
