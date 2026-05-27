# SkillMark Deployment Guide — Render + Vercel (FREE)

Deployment to **Vercel (Frontend)** + **Render (Backend)** + **Supabase (Database)**

All services have generous **free tiers**.

---

## 📋 Prerequisites

- [ ] GitHub account with repo pushed
- [ ] Vercel account (free)
- [ ] Render account (free)
- [ ] Supabase project with migrations complete
- [ ] Backend `.env.production` ready
- [ ] Frontend `.env.production` ready

---

## 🚀 Step 1: Prepare Production Environment

### 1.1 Backend `.env.production`

Create `/backend/.env.production`:

```bash
# --- App ---
APP_ENV=production
APP_PORT=8000
APP_SECRET_KEY=generate-a-secure-random-key-here
FRONTEND_URL=https://skillmark.vercel.app

# --- Supabase ---
SUPABASE_URL=https://hrjcxaaisjukllglbgcs.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyamN4YWFpc2p1a2xsZ2xiZ2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3OTQ1NTYsImV4cCI6MjA5NTM3MDU1Nn0.5evb9DYauY15LnMV1zxCcR2eHLcT3t-aqtoCA3r5EQU
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyamN4YWFpc2p1a2xsZ2xiZ2NzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc5NDU1NiwiZXhwIjoyMDk1MzcwNTU2fQ.Af3wUq000dDk7sqNTqp3N68mXjoeUM4fdgVfipeiXvk

# --- AI ---
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# --- Storage & Misc ---
STORAGE_PROVIDER=supabase
LOG_LEVEL=info
CORS_ORIGINS=https://skillmark.vercel.app
```

### 1.2 Frontend `.env.production`

Create `/frontend/.env.production`:

```bash
VITE_SUPABASE_URL=https://hrjcxaaisjukllglbgcs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyamN4YWFpc2p1a2xsZ2xiZ2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3OTQ1NTYsImV4cCI6MjA5NTM3MDU1Nn0.5evb9DYauY15LnMV1zxCcR2eHLcT3t-aqtoCA3r5EQU
VITE_API_URL=https://skillmark-backend.onrender.com/api/v1
```

---

## 🌐 Step 2: Deploy Backend to Render (FREE)

### 2.1 Push to GitHub

```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

### 2.2 Create Render Service

1. Go to **[Render Dashboard](https://dashboard.render.com)**
2. Click **New +** → **Web Service**
3. **Connect Repository:**
   - Click **Connect Account** (authorize GitHub)
   - Search for `skillmark`
   - Click **Connect**

### 2.3 Configure Service

| Setting | Value |
|---------|-------|
| **Name** | `skillmark-backend` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Docker` |
| **Auto-deploy** | Yes |

### 2.4 Add Environment Variables

Click **Advanced** → **Environment Variables**

Add each from your `.env.production`:

```
APP_ENV=production
APP_PORT=8000
APP_SECRET_KEY=<your-secure-key>
FRONTEND_URL=https://skillmark.vercel.app
SUPABASE_URL=https://hrjcxaaisjukllglbgcs.supabase.co
SUPABASE_ANON_KEY=<paste-from-.env>
SUPABASE_SERVICE_KEY=<paste-from-.env>
ANTHROPIC_API_KEY=<paste-from-.env>
STORAGE_PROVIDER=supabase
LOG_LEVEL=info
CORS_ORIGINS=https://skillmark.vercel.app
```

### 2.5 Select Plan

- **Plan:** Free (0.5GB RAM, $0/month)
- Click **Create Web Service**

**Wait 3-5 minutes for deployment** ⏳

Once deployed, Render provides a URL: `https://skillmark-backend.onrender.com`

### ⚠️ Note on Render Free Tier

Free tier services spin down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds.

**To keep it always-on:**
- Upgrade to **Starter** plan ($7/month)
- Or keep free tier (acceptable for testing)

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Import Project

1. Go to **[Vercel Dashboard](https://vercel.com)**
2. Click **Add New** → **Project**
3. **Import Git Repository**
   - Search for `skillmark`
   - Click **Import**

### 3.2 Configure

| Setting | Value |
|---------|-------|
| **Project Name** | `skillmark` |
| **Framework** | Vite |
| **Root Directory** | `./frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3.3 Environment Variables

Add these:

```
VITE_SUPABASE_URL=https://hrjcxaaisjukllglbgcs.supabase.co
VITE_SUPABASE_ANON_KEY=<paste-from-.env>
VITE_API_URL=https://skillmark-backend.onrender.com/api/v1
```

### 3.4 Deploy

Click **Deploy** and wait 2-3 minutes ⏳

Once done, Vercel provides URL: `https://skillmark.vercel.app`

---

## 🔄 Step 4: Final Configuration

### 4.1 Update Render Environment

On Render dashboard, update backend env vars with final URLs:

```
FRONTEND_URL=https://skillmark.vercel.app
CORS_ORIGINS=https://skillmark.vercel.app
```

**Render will auto-redeploy** with new vars.

### 4.2 Update Supabase Auth

In **[Supabase Dashboard](https://app.supabase.com)**:

1. **Authentication** → **URL Configuration**
2. **Redirect URLs** → Add:
   ```
   https://skillmark.vercel.app/**
   ```
3. **Save**

---

## 🧪 Test Deployment

### Test Backend

```bash
curl https://skillmark-backend.onrender.com/api/v1/auth/me \
  -H "Authorization: Bearer invalid"

# Expect: {"detail":"Invalid token"}
```

### Test Frontend

1. Open **https://skillmark.vercel.app**
2. Should see login page
3. Try signing up with email

---

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| **Vercel Frontend** | Free | $0 |
| **Render Backend** | Free | $0 (spins down) |
| **Supabase Database** | Free | $0 |
| **Anthropic API** | Pay-as-you-go | ~$0.01/1000 tokens |
| **Total** | | **$0-10/month** |

---

## ⚡ Render Free Tier Limits

- **Memory:** 0.5GB RAM
- **CPU:** Shared
- **Bandwidth:** 100GB/month
- **Inactivity:** Spins down after 15min idle
- **Cold Start:** ~30 seconds after spin-down

**For production use, upgrade to Starter ($7/month) for always-on.**

---

## 📊 Monitoring

### Render
- **Render Dashboard** → Service → **Logs**
- View real-time logs and errors

### Vercel
- **Vercel Dashboard** → Project → **Deployments**
- View build logs and errors

### Supabase
- **Supabase Dashboard** → **Logs**
- Monitor database activity

---

## 🚨 Troubleshooting

| Error | Solution |
|-------|----------|
| 503 Service Unavailable | Render service spinning up, wait 30 sec |
| 404 API endpoints | Check `VITE_API_URL` matches Render URL |
| CORS error | Update `CORS_ORIGINS` in Render env vars |
| OAuth not working | Add Redirect URL in Supabase |
| Build failed | Check Node/Python versions in logs |

---

## 🔄 Redeploy

### Render
1. **Dashboard** → Service → **Manual Deploy**
2. Click **Deploy latest commit**

### Vercel
1. **Dashboard** → Project → **Deployments**
2. Click **Redeploy** on any previous version

---

## 📝 Upgrade to Always-On

When ready for production:

1. On **Render Dashboard**
2. Go to Backend service
3. Click **Settings** → **Plan**
4. Change to **Starter** ($7/month)
5. Service stays always-on

---

**Ready to deploy? Follow steps above. 🚀**
