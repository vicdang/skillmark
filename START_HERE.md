# SkillMark — Start Here 🚀

## ✅ Setup Complete!

### What's been done:
- ✅ `.env` configured with your Supabase & Anthropic keys
- ✅ Backend dependencies installed (`python -m pip install`)
- ✅ Frontend dependencies installed (`npm install`)
- ✅ Project ready to run

---

## 🔧 Next Steps (In Order)

### Step 1: Set Up Database (5 min)
Before running the servers, you need to **create the database schema in Supabase**.

📖 Follow: [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md)

**Quick summary:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste content from `backend/migrations/001_initial_schema.sql` → Run
3. Copy/paste content from `backend/migrations/002_notification_prefs.sql` → Run
4. ✅ Done! Tables are created

---

### Step 2: Start Backend Server (Terminal 1)
```bash
cd /Users/vic/Personal/skillmark/backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uvicorn app.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

API Docs: http://localhost:8000/docs

---

### Step 3: Start Frontend Server (Terminal 2)
```bash
cd /Users/vic/Personal/skillmark/frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

**Frontend:** http://localhost:3000

---

## 🔐 First-Time Login

1. Open http://localhost:3000
2. Click **Sign Up** (or use Google/GitHub OAuth if configured)
3. Enter email + password, or use OAuth
4. Your user profile is **auto-created** on first sign-in (via Supabase trigger)
5. Default role: `employee` (can be changed to `admin` in database)

---

## 🎯 Test the App

After signing in:

1. **My Skills** — Add skills to your profile
2. **Projects** → Create a new project
3. **Upload RFP** — Try uploading a sample PDF/DOCX (AI will extract requirements)
4. **Run Match** — See AI-powered resource matching
5. **Dashboard** — View skill coverage and allocations

---

## 📊 Making Yourself an Admin

To access all features, change your role to `admin`:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'vudnn.dl@gmail.com';
   ```
3. Refresh the app

**Admin superpowers:**
- ✅ Create/edit projects (without manager approval)
- ✅ Run resource matching
- ✅ View all employees
- ✅ Manage allocations
- ✅ Change org settings

---

## 🐳 Alternative: Docker (All-in-One)

If you prefer Docker (includes local Postgres instead of Supabase):

```bash
docker-compose up --build
```

Then:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1
- API Docs: http://localhost:8000/docs

(Docker setup includes a local database, so no Supabase migrations needed)

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| [.env](.env) | Environment variables (already filled) |
| [CLAUDE.md](CLAUDE.md) | Project architecture & conventions |
| [spec/SKILLMARK_PROJECT_SPEC.md](spec/SKILLMARK_PROJECT_SPEC.md) | Full product spec |
| [README.md](README.md) | Quick overview |
| [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md) | Database setup steps |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Detailed setup guide |

---

## 🆘 Troubleshooting

### "Connection refused" on backend startup
- Check `.env` has correct `SUPABASE_URL` and keys
- Verify Supabase project is accessible

### "No such table" errors
- Run migrations: [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md)

### Frontend won't connect to backend
- Check `VITE_API_URL=http://localhost:8000/api` in `.env`
- Backend must be running on port 8000
- CORS should allow localhost:3000

### RFP upload fails
- Create the `rfp-files` bucket in Supabase Dashboard → Storage
- Backend will auto-use it once created

---

## 🚀 You're Ready!

1. ✅ Run migrations (5 min)
2. ✅ Start backend: `uvicorn app.main:app --reload`
3. ✅ Start frontend: `npm run dev`
4. ✅ Open http://localhost:3000
5. ✅ Sign up and explore!

**Questions?** Check [CLAUDE.md](CLAUDE.md) or the spec document.

Happy coding! 🎉
