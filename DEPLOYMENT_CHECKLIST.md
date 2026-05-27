# SkillMark Deployment Checklist

Quick reference for deploying to production.

---

## ✅ Pre-Deployment

- [ ] All code committed and pushed to GitHub
- [ ] `.env.production` files created for backend and frontend
- [ ] Supabase database migrations completed
- [ ] Backend tested locally and working
- [ ] Frontend tested locally and working
- [ ] GitHub personal access token ready (if needed)
- [ ] Vercel account created and ready
- [ ] Koyeb account created and ready

---

## 🚀 Deployment Order

### 1. Deploy Backend to Koyeb (5-10 min)

```bash
# Make sure everything is committed
git status  # Should be clean
git log --oneline -5  # Verify commits

# No further action needed - Koyeb will auto-detect from GitHub
```

Then:
1. Go to **[Koyeb](https://app.koyeb.com)**
2. **Create App** → **Git** → Select `skillmark` repo
3. **Configure:**
   - Root: `/` (mono repo)
   - Buildpack: Docker
   - Instance: Select region
4. **Add environment variables** from `backend/.env.production`
5. **Deploy**
6. **Wait for deployment** → Get backend URL

**Example URL:** `https://skillmark-backend-abc123.koyeb.app`

---

### 2. Update Frontend Config

Update `frontend/.env.production`:

```bash
VITE_API_URL=https://skillmark-backend-abc123.koyeb.app/api/v1
```

---

### 3. Deploy Frontend to Vercel (3-5 min)

1. Go to **[Vercel](https://vercel.com/dashboard)**
2. **Add New** → **Project** → Import `skillmark`
3. **Configure:**
   - Framework: Vite
   - Root directory: `./frontend`
   - Build command: `npm run build`
   - Output: `dist`
4. **Environment variables** from `frontend/.env.production`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_API_URL=https://skillmark-backend-abc123.koyeb.app/api/v1
   ```
5. **Deploy**

**Example URL:** `https://skillmark-frontend.vercel.app`

---

### 4. Update Backend CORS

Update `backend/.env.production` and redeploy to Koyeb:

```bash
FRONTEND_URL=https://skillmark-frontend.vercel.app
CORS_ORIGINS=https://skillmark-frontend.vercel.app
```

Redeploy on Koyeb with updated vars.

---

### 5. Update Supabase Auth

In **[Supabase Dashboard](https://app.supabase.com)**:

1. Go to **Authentication** → **URL Configuration**
2. **Redirect URLs** → Add:
   ```
   https://skillmark-frontend.vercel.app/**
   ```
3. **Save**

---

## 🧪 Smoke Tests

After deployment:

```bash
# Test backend API
curl https://skillmark-backend-abc123.koyeb.app/api/v1/auth/me \
  -H "Authorization: Bearer invalid"
# Expect: {"detail":"Invalid token"}

# Test frontend
# Open: https://skillmark-frontend.vercel.app
# You should see login page
```

---

## 🔄 Redeploy/Rollback

**If something breaks:**

### Koyeb
1. **Koyeb Dashboard** → App
2. **Deployments** tab
3. Click previous version → **Redeploy**

### Vercel
1. **Vercel Dashboard** → Project
2. **Deployments** tab
3. Click previous version → **Redeploy**

---

## 📊 Monitor

**After successful deployment:**

- [ ] Backend logs: Koyeb Dashboard → Logs
- [ ] Frontend errors: Vercel Dashboard → Deployments
- [ ] Database: Supabase Dashboard → Database & Auth
- [ ] Test signup: Try creating a user account
- [ ] Test API: Create a project, upload RFP, run match

---

## ⏱️ Timeline

| Step | Time | Status |
|------|------|--------|
| 1. Backend to Koyeb | 5-10 min | ⏳ |
| 2. Frontend to Vercel | 3-5 min | ⏳ |
| 3. Update CORS | 2 min | ⏳ |
| 4. Smoke tests | 2 min | ⏳ |
| **Total** | **~15 min** | ⏳ |

---

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| 404 on API calls | Check `VITE_API_URL` matches backend URL |
| CORS error | Update `CORS_ORIGINS` in backend .env |
| OAuth not working | Add Redirect URL in Supabase Auth config |
| Build failed on Vercel | Check Node version, npm install |
| Docker build failed on Koyeb | Check Python version, requirements.txt |

---

## 📝 Docs

- [Full Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Architecture](CLAUDE.md)
- [Project Spec](spec/SKILLMARK_PROJECT_SPEC.md)

---

**Ready to deploy? Follow the order above. 🚀**
