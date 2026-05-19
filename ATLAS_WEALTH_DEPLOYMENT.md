# Atlas Wealth SaaS - Vercel Deployment Guide

**New Project Setup:** atlaswealth-app (separate from existing projects)  
**Date:** 2026-05-19  
**Status:** Ready for Independent Production Deployment  

---

## Project Structure Overview

You have:
1. **ahmed-allazim-portfolio** (existing - personal portfolio)
2. **lavish-morocco** (existing - luxury concierge site)
3. **atlaswealth-app** (NEW - SaaS platform) ← WE'RE DEPLOYING THIS

---

## Quick Deployment (10 minutes)

### Step 1: Create New Vercel Project

**Via CLI (Recommended):**
```bash
cd /Users/ahmeda/Cowork\ Playground/Portfolio
vercel projects add atlaswealth-app
# When prompted: 
# - Create new project: YES
# - Project name: atlaswealth-app
# - Framework: Next.js
# - Root directory: ./
```

**Via Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select GitHub repo: `AllazimA/lavish-morocco`
4. Name: `atlaswealth-app`
5. Framework: Next.js (auto-detected)
6. Click "Create Project"

### Step 2: Configure Environment Variables

In Vercel dashboard for `atlaswealth-app` project:
Settings → Environment Variables → Add the following for **Production**:

**Firebase Configuration:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=[your-api-key]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=wealthos-cac68.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=wealthos-cac68
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=[your-storage-bucket]
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[your-sender-id]
NEXT_PUBLIC_FIREBASE_APP_ID=[your-app-id]
FIREBASE_ADMIN_SDK_KEY=[service-account-json]
```

**Market Data APIs:**
```
VITE_TWELVEDATA_KEY=7e2ae56d4b034a6687c4bd85b1414f4d
VITE_ALPHA_VANTAGE_KEY=MOK79T51OC9S9NH1
```

**Build Configuration:**
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://atlaswealth-app.vercel.app
```

### Step 3: Deploy

**Via Vercel Dashboard:**
1. Settings configured ✓
2. Click "Deployments" tab
3. Click "Deploy" on latest commit
4. Wait 3-5 minutes for build

**Via CLI:**
```bash
vercel deploy --prod --project=atlaswealth-app
```

### Step 4: Verify Live

**Live URL:** https://atlaswealth-app.vercel.app

Test:
- [ ] Landing page loads
- [ ] Login page accessible
- [ ] Dashboard pages (after login) working
- [ ] No console errors
- [ ] Mobile responsive

---

## Environment Variables - Getting Firebase Credentials

### Step 1: Firebase Console
1. Go to https://console.firebase.google.com
2. Select project: **wealthos-cac68**
3. Click ⚙️ (Settings) → **Project Settings**

### Step 2: Web App Configuration
In the "General" tab, under "Your apps" → Web app section:
```javascript
{
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID"
}
```

### Step 3: Admin SDK Key
1. Click **Service Accounts** tab
2. Select **Node.js** (already selected by default)
3. Click **Generate new private key**
4. Download JSON file
5. Copy entire JSON content as `FIREBASE_ADMIN_SDK_KEY`

---

## CLI Command Reference

### Create Project
```bash
# If not already created
vercel projects add atlaswealth-app
```

### Deploy to Production
```bash
vercel deploy --prod --project=atlaswealth-app
```

### View Environment Variables
```bash
vercel env list --project=atlaswealth-app
```

### View Build Logs
```bash
vercel logs --project=atlaswealth-app --prod
```

### Switch Project (when in repo root)
```bash
vercel project switch
# Select: atlaswealth-app
```

---

## Project Separation Benefits

✅ **Independent from other projects:**
- Separate analytics
- Separate environment variables
- Separate team access control
- Separate custom domain (if needed)
- Separate rollback history

✅ **Production isolation:**
- No risk to ahmed-allazim-portfolio
- No risk to lavish-morocco
- Own deployment pipeline

---

## Post-Deployment Checklist

### Within 1 Hour:
- [ ] Visit https://atlaswealth-app.vercel.app
- [ ] Check for 404/500 errors
- [ ] Test login with Firebase
- [ ] Verify dashboard loads
- [ ] Check Vercel Logs for errors

### Within 24 Hours:
- [ ] Monitor Vercel Analytics
- [ ] Check Core Web Vitals
- [ ] Test on mobile/tablet
- [ ] Verify API endpoints work
- [ ] Monitor error rate

### Weekly:
- [ ] Review Vercel Analytics
- [ ] Monitor performance trends
- [ ] Check for unhandled errors
- [ ] Review deployment frequency

---

## If Issues Occur

### Rollback to Previous Build
```bash
vercel rollback --project=atlaswealth-app
```

### View Deployment History
```bash
vercel deployments --project=atlaswealth-app
```

### Check Current Production
```bash
vercel status --project=atlaswealth-app
```

---

## Project Credentials Summary

After deployment, your Vercel projects will be:

| Project | URL | Type | Purpose |
|---------|-----|------|---------|
| ahmed-allazim-portfolio | https://ahmed-allazim-portfolio.vercel.app | Portfolio | Personal portfolio |
| lavish-morocco | https://lavish-morocco.vercel.app | Concierge | Luxury concierge site |
| **atlaswealth-app** | **https://atlaswealth-app.vercel.app** | **SaaS** | **Wealth management app** |

---

## Custom Domain (Optional)

If you want to use a custom domain for Atlas Wealth:
1. Vercel Dashboard → atlaswealth-app → Settings → Domains
2. Add custom domain (e.g., `atlas-wealth.com`, `wealthapp.com`)
3. Follow DNS setup instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## Documentation Files

- **Main Deployment Guide:** `/VERCEL_DEPLOYMENT_GUIDE.md`
- **Testing Results:** `/TEST_RESULTS.md`
- **Deployment Readiness:** `/DEPLOYMENT_READINESS.md`
- **Phase 7 Summary:** `/PHASE_7_SUMMARY.md`
- **This Guide:** `/ATLAS_WEALTH_DEPLOYMENT.md`

---

## Success Criteria

✅ New project created in Vercel  
✅ Environment variables configured  
✅ Build completes successfully  
✅ Live URL responds  
✅ No authentication/API errors  
✅ Dashboard pages load after login  
✅ Independent from other projects  

---

## Timeline

| Step | Time | Action |
|------|------|--------|
| 1 | 2 min | Create new Vercel project |
| 2 | 5 min | Configure environment variables |
| 3 | 5 min | Deploy (build takes 3-5 min) |
| 4 | 5 min | Verify live deployment |
| **Total** | **~20 minutes** | **Live Production** |

---

## Support

For any issues:
- **Vercel Docs:** https://vercel.com/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Project Docs:** All .md files in repo

---

**Status:** 🟢 READY FOR INDEPENDENT DEPLOYMENT  
**Date Prepared:** 2026-05-19  
**Project Name:** atlaswealth-app  
**Expected Live:** Within 20 minutes

