# SkillMark Deployment Guide

Deployment to **Vercel (Frontend)** + **Koyeb (Backend)** + **Supabase (Database)**

---

## 📋 Prerequisites

- [ ] GitHub account (for repo access)
- [ ] Vercel account (free tier works)
- [ ] Koyeb account (free tier works)
- [ ] Supabase project set up with migrations
- [ ] Production domain (optional)

---

## 🚀 Step 1: Prepare Production Environment

### 1.1 Create `.env.production` for Backend

Create `/backend/.env.production` with production values:

```bash
# Copy your current .env
cp backend/.env backend/.env.production

# Then edit to change:
# - FRONTEND_URL to production frontend URL
# - CORS_ORIGINS to production domain
# - APP_SECRET_KEY to a secure random key
# - Log level (info or error)
```

**Example:**
```
APP_ENV=production
APP_PORT=8000
APP_SECRET_KEY=your-secure-production-key-here
FRONTEND_URL=https://skillmark-frontend.vercel.app  # Will update after deploy

# Keep Supabase credentials the same
SUPABASE_URL=https://hrjcxaaisjukllglbgcs.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

ANTHROPIC_API_KEY=sk-ant-...
CORS_ORIGINS=https://skillmark-frontend.vercel.app
```

### 1.2 Create `.env.production` for Frontend

Create `/frontend/.env.production` with production values:

```bash
# Copy your current .env
cp frontend/.env frontend/.env.production

# Update API_URL to production backend (will get after Koyeb deploy)
```

**Example:**
```
VITE_SUPABASE_URL=https://hrjcxaaisjukllglbgcs.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=https://skillmark-backend-xxxxx.koyeb.app/api/v1  # Update after deploy
```

---

## 🌐 Step 2: Deploy Backend to Koyeb

### 2.1 Push to GitHub

```bash
cd /Users/vic/Personal/skillmark
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

### 2.2 Deploy Backend

1. Go to **[Koyeb Dashboard](https://app.koyeb.com)**
2. Click **Create App** → **Deploy a Git repository**
3. Connect your GitHub account and select the `skillmark` repo
4. **Configure deployment:**
   - Name: `skillmark-backend`
   - Region: Choose closest to your users
   - Buildpack: Docker (or auto-detect)
   - Build command: *(leave empty)*
   - Run command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment variables:** Add from `.env.production`
   - `APP_ENV=production`
   - `SUPABASE_URL=...`
   - `SUPABASE_ANON_KEY=...`
   - `SUPABASE_SERVICE_KEY=...`
   - `ANTHROPIC_API_KEY=...`
   - All other vars from `.env.production`
6. **Port:** 8000
7. Click **Deploy**

**Wait for deployment to complete (~5 min)**

Once deployed, you'll get a URL like: `https://skillmark-backend-xxxxx.koyeb.app`

### 2.3 Update Frontend .env.production

Update `VITE_API_URL` in `frontend/.env.production`:

```bash
VITE_API_URL=https://skillmark-backend-xxxxx.koyeb.app/api/v1
```

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Import Project to Vercel

1. Go to **[Vercel Dashboard](https://vercel.com/dashboard)**
2. Click **Add New** → **Project**
3. Select **Import Git Repository** → Choose `skillmark` repo
4. **Configure project:**
   - Framework: Vite
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
5. **Environment variables:** Add from `frontend/.env.production`
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
   - `VITE_API_URL=https://skillmark-backend-xxxxx.koyeb.app/api/v1`
6. Click **Deploy**

**Wait for deployment (~3 min)**

Once deployed, Vercel gives you a URL: `https://skillmark-frontend.vercel.app`

### 3.2 Update Backend CORS & Supabase

Update backend `.env.production` and redeploy to Koyeb:

```bash
# In backend/.env.production:
FRONTEND_URL=https://skillmark-frontend.vercel.app
CORS_ORIGINS=https://skillmark-frontend.vercel.app
```

Redeploy Koyeb app with the updated env vars.

Also update **Supabase Dashboard** → **Authentication → Redirect URLs**:
- Add: `https://skillmark-frontend.vercel.app/**`

---

## 🔄 Step 4: Verify Deployment

### 4.1 Test Backend

```bash
curl https://skillmark-backend-xxxxx.koyeb.app/api/v1/auth/me \
  -H "Authorization: Bearer invalid"

# Should return: {"detail":"Invalid token"}
```

### 4.2 Test Frontend

1. Open **https://skillmark-frontend.vercel.app**
2. You should see the login page
3. Try signing up with email or OAuth
4. After signup, you should see the dashboard

### 4.3 Test API Integration

1. Sign in
2. Create a project
3. Try any feature (allocations, skills, etc.)

---

## 🛠️ Step 5: Configure Custom Domain (Optional)

### For Frontend (Vercel)

1. Go to **Vercel Dashboard** → Your project
2. **Settings** → **Domains**
3. Add your domain
4. Follow DNS configuration steps

### For Backend (Koyeb)

1. Go to **Koyeb Dashboard** → Your app
2. **Settings** → **Custom domains**
3. Add domain
4. Follow DNS configuration

Then update all environment variables to use the custom domain.

---

## 🔒 Security Checklist

- [ ] `APP_SECRET_KEY` changed to a secure random value
- [ ] Supabase RLS policies enabled
- [ ] CORS origins set to production URLs only
- [ ] Environment secrets not in `.env` (use platform secrets)
- [ ] Anthropic API key kept secret
- [ ] Database backups enabled in Supabase
- [ ] HTTPS enforced (automatic with Vercel & Koyeb)

---

## 📊 Monitoring

### Koyeb Backend Logs
- **Koyeb Dashboard** → App → **Logs** tab
- Monitor for errors, crashes, slow requests

### Vercel Frontend Logs
- **Vercel Dashboard** → Project → **Deployments**
- View build logs and runtime errors

### Supabase Database
- **Supabase Dashboard** → **Database** → Monitor connections
- **Auth** → Check user signups
- **Realtime** → Test notifications

---

## 🚨 Rollback

If deployment fails:

### Koyeb
- **Koyeb Dashboard** → App → **Deployments**
- Click a previous deployment → **Redeploy**

### Vercel
- **Vercel Dashboard** → Project → **Deployments**
- Click a previous deployment → **Redeploy**

---

## 🔄 CI/CD Pipeline (Optional)

Both Vercel and Koyeb auto-deploy on `git push` to `main`. No additional setup needed.

To add tests before deployment, see `.github/workflows/` for GitHub Actions.

---

## 📝 Production Checklist

Before going live:

- [ ] Database migrations run on Supabase
- [ ] Backend deployed and responding
- [ ] Frontend deployed and connects to backend
- [ ] User signup/login working
- [ ] OAuth configured in Supabase (Google, GitHub)
- [ ] RFP storage bucket created in Supabase
- [ ] Email provider configured (optional)
- [ ] Monitoring/alerts set up
- [ ] Backups enabled
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)

---

## 📞 Support

- **Vercel Issues:** https://vercel.com/support
- **Koyeb Issues:** https://www.koyeb.com/docs
- **Supabase Issues:** https://supabase.com/docs
- **SkillMark Spec:** See [CLAUDE.md](CLAUDE.md)

---

**Ready to deploy! Follow the steps above. 🚀**
