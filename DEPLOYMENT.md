# Deployment Guide: a402 Studio

Deploy your frontend to **Vercel** and backend to **Railway**.

---

## 🔧 Pre-Deployment: Code Changes Made

I've fixed hardcoded localhost URLs in your codebase:

### Changes Made:
1. **`apps/web/src/components/modes/test-endpoint-mode.tsx`**
   - Now uses `NEXT_PUBLIC_API_URL` environment variable instead of hardcoded `localhost:3001`

2. **`apps/api/src/index.ts`**
   - CORS now uses `CORS_ORIGINS` environment variable
   - Supports comma-separated list of allowed origins

**Commit these changes before deploying:**
```bash
git add .
git commit -m "fix: use environment variables for API URL and CORS"
git push origin main
```

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click **"Login"** (top right)
3. Select **"Login with GitHub"**
4. Authorize Railway to access your GitHub

### Step 2: Create New Project
1. In Railway dashboard, click **"+ New Project"**
2. Select **"Deploy from GitHub repo"**
3. If you don't see your repo, click **"Configure GitHub App"**
   - Select your account
   - Choose **"Only select repositories"**
   - Select **`a402-studio`**
   - Click **"Install"**
4. Back in Railway, select **`a402-studio`** from the list

### Step 3: Configure the Service
Railway will detect a monorepo. You need to configure it to only build the API:

1. Click on the service that was created
2. Go to **Settings** tab
3. Under **Build**:
   - **Root Directory**: `apps/api`
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `node dist/index.js`

### Step 4: Set Environment Variables
1. Go to **Variables** tab
2. Click **"+ New Variable"** and add:

| Variable | Value |
|----------|-------|
| `PORT` | `3001` |
| `CORS_ORIGINS` | `https://your-app-name.vercel.app` (you'll update this after Vercel deploy) |
| `BEEP_SERVER_URL` | `https://api.justbeep.it` |

> ⚠️ **Note**: Leave `CORS_ORIGINS` empty for now. We'll add the Vercel URL after deploying frontend.

### Step 5: Deploy
1. Go to **Deployments** tab
2. Railway should auto-deploy, or click **"Deploy"**
3. Wait for deployment to complete (2-3 minutes)
4. Once deployed, click **"Generate Domain"** or go to **Settings → Networking → Generate Domain**
5. Copy your Railway URL (e.g., `https://a402-studio-api-production.up.railway.app`)

### Step 6: Test Your Backend
Open in browser:
```
https://your-railway-url.up.railway.app/health
```

You should see:
```json
{"status":"ok","timestamp":"..."}
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Select **"Continue with GitHub"**
4. Authorize Vercel

### Step 2: Import Project
1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find **`a402-studio`** in your GitHub repos
3. Click **"Import"**

### Step 3: Configure Build Settings
Vercel should auto-detect Next.js. Configure:

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: Click "Edit" → Select `apps/web` → Click "Continue"
3. **Build Command**: Leave as default (`yarn build` or `next build`)
4. **Output Directory**: Leave as default (`.next`)

### Step 4: Set Environment Variables
Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUI_NETWORK` | `testnet` (or `mainnet`) |
| `NEXT_PUBLIC_API_URL` | `https://your-railway-url.up.railway.app` (from Railway Step 5) |
| `NEXT_PUBLIC_BEEP_SERVER_URL` | `https://api.justbeep.it` |

> Optional: Add `NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY` if you have one

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for deployment (2-4 minutes)
3. Once complete, note your Vercel URL (e.g., `https://a402-studio.vercel.app`)

---

## Part 3: Connect Frontend and Backend

### Update Railway CORS
Now that you have your Vercel URL, update Railway:

1. Go to Railway dashboard → your project
2. Click on your service → **Variables** tab
3. Add/Update the `CORS_ORIGINS` variable:
   ```
   https://a402-studio.vercel.app,https://your-app-name.vercel.app
   ```
   (Include both the custom domain and any preview URLs)

4. Railway will auto-redeploy with the new variable

### Test the Full Flow
1. Open your Vercel URL
2. Connect a Sui wallet
3. Go to **Test Endpoint** mode and verify the proxy works
4. Try **Demo Mode** → **Beep Live** to test payments

---

## Troubleshooting

### "CORS Error" in browser console
- Make sure `CORS_ORIGINS` includes your exact Vercel URL (with `https://`)
- No trailing slash!
- Railway may take 1-2 minutes to redeploy after variable change

### "Cannot connect to API server"
- Check that `NEXT_PUBLIC_API_URL` in Vercel matches your Railway URL exactly
- Make sure Railway deployment is running (check Deployments tab)

### Build fails on Railway
- Make sure Root Directory is set to `apps/api`
- Check that the Build Command includes `yarn install`

### Build fails on Vercel
- Make sure Root Directory is set to `apps/web`
- Check for TypeScript errors: `yarn typecheck`

---

## Quick Reference: Environment Variables

### Vercel (Frontend)
| Variable | Example Value |
|----------|---------------|
| `NEXT_PUBLIC_SUI_NETWORK` | `testnet` or `mainnet` |
| `NEXT_PUBLIC_API_URL` | `https://a402-api.railway.app` |
| `NEXT_PUBLIC_BEEP_SERVER_URL` | `https://api.justbeep.it` |

### Railway (Backend)
| Variable | Example Value |
|----------|---------------|
| `PORT` | `3001` |
| `CORS_ORIGINS` | `https://a402-studio.vercel.app` |
| `BEEP_SERVER_URL` | `https://api.justbeep.it` |

---

## Post-Deployment Checklist

- [ ] Backend `/health` endpoint works
- [ ] Frontend loads without errors
- [ ] Wallet connection works
- [ ] Test Endpoint mode proxy works
- [ ] Demo Mode presets load
- [ ] Beep Live payment modal opens
