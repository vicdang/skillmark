# Free Backend Hosting Comparison for FastAPI

Choose the best free platform for SkillMark.

---

## 📊 Comparison Table

| Platform | Free Tier | RAM | Cold Start | Always-On | Setup | Cost to Upgrade |
|----------|-----------|-----|-----------|-----------|-------|-----------------|
| **Render** | ✅ Yes | 0.5GB | ~30s | ❌ Spins down | ⭐⭐⭐ Easy | $7/mo (Starter) |
| **Fly.io** | ✅ Yes + $5 credit | 256MB | ~2s | ✅ Yes | ⭐⭐ Medium | Auto-scale |
| **Railway** | ✅ Yes + $5 credit | Variable | ~5s | ⭐ Limited | ⭐⭐⭐ Easy | $5+/mo |
| **Google Cloud Run** | ✅ Yes (serverless) | 256MB | ~1s | ✅ Yes | ⭐⭐⭐⭐ Complex | ~$0.01/req |
| **Replit** | ✅ Yes | 512MB | ~5s | ❌ Spins down | ⭐⭐ Medium | $7/mo |

---

## ✅ Recommended for SkillMark

### **1️⃣ Render (BEST for FREE tier)**

**Why:**
- ✅ Simplest setup (3 clicks)
- ✅ Best for beginners
- ✅ Generous free tier (0.5GB RAM)
- ✅ Auto-deploys on GitHub push
- ⭐ Most popular for FastAPI

**Best for:** Quick free deployments, testing

**Cost:** Free (with spin-down) → $7/mo for always-on

**Setup Time:** 5 minutes

---

### **2️⃣ Fly.io (BEST for production)**

**Why:**
- ✅ Free tier + $5 monthly credit
- ✅ Always-on for free tier apps
- ✅ Global deployment near users
- ✅ Fast cold starts (~2s)
- ⭐ Great uptime SLA

**Best for:** Production-ready apps

**Cost:** Free for small apps (~$0/mo with credit)

**Setup Time:** 10 minutes (CLI required)

---

### **3️⃣ Railway (GOOD middle ground)**

**Why:**
- ✅ GitHub auto-deploy
- ✅ $5/month free credit
- ✅ Web dashboard
- ✅ Good for hobbyists

**Best for:** Easy GitHub integration

**Cost:** Free credits run out quickly, then paid

**Setup Time:** 5 minutes

---

### **4️⃣ Google Cloud Run (BEST for scalability)**

**Why:**
- ✅ Serverless (auto-scale to 0)
- ✅ Only pay for requests
- ✅ Free tier generous ($0.40/mo worth)
- ✅ Global infrastructure
- ⚠️ Complex to set up

**Best for:** Variable traffic, cost optimization

**Cost:** ~$0-5/mo depending on usage

**Setup Time:** 20+ minutes

---

## 🎯 Recommendation for You

Since you want **FREE and easy**, here's the path:

```
Start with Render (free tier)
    ↓
    ├─ Works great? → Upgrade to Starter ($7/mo)
    │
    └─ Want free always-on? → Switch to Fly.io
```

---

## 📋 Quick Start Guides

- **[Render (Recommended)](DEPLOYMENT_RENDER.md)** ← START HERE
- [Fly.io Setup](#fly-io-setup) (below)
- [Railway Setup](#railway-setup) (below)
- [Google Cloud Run Setup](#google-cloud-run-setup) (below)

---

## Fly.io Setup

### Quick Deploy

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Deploy
cd /Users/vic/Personal/skillmark
flyctl launch  # Creates fly.toml

# Add environment variables
flyctl secrets set \
  APP_ENV=production \
  SUPABASE_URL=... \
  ANTHROPIC_API_KEY=...

# Deploy
flyctl deploy
```

**Result:** `https://skillmark-backend.fly.dev`

---

## Railway Setup

### Quick Deploy

1. Go to **[Railway](https://railway.app)**
2. **New Project** → **Deploy from GitHub**
3. Select `skillmark` repo
4. **Add Service** → **Empty Service**
5. **Settings:**
   - Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add env variables from `.env.production`
7. Deploy

**Result:** `https://<project>.railway.app`

---

## Google Cloud Run Setup

### Quick Deploy

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

gcloud auth login
gcloud config set project <your-project-id>

# Deploy
cd /Users/vic/Personal/skillmark/backend
gcloud run deploy skillmark-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "SUPABASE_URL=...,ANTHROPIC_API_KEY=..."
```

**Result:** `https://skillmark-backend-xxxxx.a.run.app`

---

## Cost Comparison (Annual)

| Platform | Scenario | Cost |
|----------|----------|------|
| **Render Free** | Testing | $0 |
| **Render Starter** | Small production | $84/year |
| **Fly.io** | Small app | $0-60/year |
| **Railway** | Small app | $60-120/year |
| **Google Cloud Run** | Variable traffic | $10-100/year |

---

## 🚀 Final Recommendation

**For your use case (SkillMark):**

1. **Start:** Render Free (this guide) → 5 min setup ✅
2. **If spins down bothers you:** Upgrade Render Starter ($7/mo)
3. **Or switch to:** Fly.io (always-on, free tier)

**Go with [DEPLOYMENT_RENDER.md](DEPLOYMENT_RENDER.md) to get started!**

---

## 📞 Support Links

- **Render Docs:** https://render.com/docs
- **Fly.io Docs:** https://fly.io/docs/
- **Railway Docs:** https://docs.railway.app/
- **Cloud Run Docs:** https://cloud.google.com/run/docs

---

**Choose Render and deploy in 5 minutes! 🚀**
