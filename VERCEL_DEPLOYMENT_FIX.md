# 🚀 Vercel Deployment Fix - PDF Download Issue

## Problem
When deployed on Vercel, PDF download returns: **"Failed to download PDF. Please try again."**

## Root Cause
Frontend on Vercel can't reach backend (Render) because:
- ❌ No Vite proxy in production
- ❌ VITE_API_BASE_URL environment variable not set in Vercel
- ❌ API requests going to `localhost:5000` or undefined URL

## Solution ✅

### Step 1: Set Environment Variable in Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your **dietplan** project
3. Click **Settings** → **Environment Variables**
4. Add this environment variable:

```
Name: VITE_API_BASE_URL
Value: https://dietplan-backend-4anu.onrender.com
```

5. Click **Save**
6. Click **Deployments** → Redeploy latest commit

### Step 2: Verify Backend URL

Make sure your backend is running on Render:
- ✅ https://dietplan-backend-4anu.onrender.com
- Test: Open browser and go to https://dietplan-backend-4anu.onrender.com/health
- Should return: `{"status":"healthy",...}`

### Step 3: How It Works Now

**Development (localhost:3000)**:
```
Frontend → [Vite Proxy] → Backend (localhost:5000)
```
- Vite proxy in `vite.config.ts` forwards `/api/*` to `localhost:5000`
- VITE_API_BASE_URL is left empty in `.env.development`

**Production (Vercel)**:
```
Frontend (vercel.com) → [Vercel Rewrites] → Backend (Render)
```
- Vercel rewrites `/api/*` to backend URL from environment variable
- vercel.json handles the rewrite configuration
- VITE_API_BASE_URL set in Vercel dashboard or `.env.production`

**Configuration Files:**

1. **vite.config.ts** - Proxy for local dev
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:5000',
       changeOrigin: true,
     },
   }
   ```

2. **vercel.json** - Rewrites for production
   ```json
   "rewrites": [
     {
       "source": "/api/:path*",
       "destination": "https://dietplan-backend-4anu.onrender.com/api/:path*"
     }
   ]
   ```

3. **src/lib/api.ts** - Dynamic base URL
   - Uses `VITE_API_BASE_URL` if set
   - Falls back to relative paths `/api/*`
   - Logs which method is being used

### Step 4: Test PDF Download

1. Redeploy on Vercel
2. Navigate to diet plan
3. Click "Download PDF"
4. ✅ Should work now!

---

## Troubleshooting 🔧

### Still Getting Error?

**Check 1**: Backend is running
```bash
curl https://dietplan-backend-4anu.onrender.com/health
# Should return: {"status":"healthy",...}
```

**Check 2**: Environment variable is set
- Go to Vercel → Settings → Environment Variables
- Confirm `VITE_API_BASE_URL` is set to backend URL

**Check 3**: Open browser console (F12)
- Look for console logs:
  - `"Using API base URL from env: https://..."`  ✅ Production
  - `"Using Vite proxy..."` ✅ Development
  - `"VITE_API_BASE_URL is not set"` ❌ Problem

**Check 4**: Check network tab (F12)
- API call to `/api/diet/xxx/pdf`
- Should show status 200 (or 4xx error with proper error message)
- Should NOT show 404 or connection refused

### Common Issues

| Issue | Solution |
|-------|----------|
| 404 Not Found | Verify backend URL and diet plan exists |
| 403 Unauthorized | Check JWT token, re-login if expired |
| 500 Server Error | Check backend logs on Render |
| CORS Error | Already handled, but check backend CORS config |
| 0 bytes PDF | Stream error - check browser console |

---

## Quick Checklist ✅

- [ ] Backend deployed on Render: https://dietplan-backend-4anu.onrender.com
- [ ] Backend returns 200 on `/health` endpoint
- [ ] Vercel environment variable set: `VITE_API_BASE_URL=https://...onrender.com`
- [ ] Frontend code updated with proper API configuration
- [ ] `vercel.json` has rewrites configured
- [ ] `src/lib/api.ts` handles empty baseURL (uses relative paths)
- [ ] Frontend redeployed on Vercel
- [ ] Test PDF download works

---

## Files Updated

1. ✅ `src/lib/api.ts` - Handles both dev and production API URLs
2. ✅ `.env.development` - Empty VITE_API_BASE_URL for Vite proxy
3. ✅ `.env.production` - Backend URL for production
4. ✅ `vercel.json` - Rewrites configuration for API proxying

---

## Links

- **Frontend**: https://dietplan-theta.vercel.app (or your Vercel URL)
- **Backend**: https://dietplan-backend-4anu.onrender.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com

---

**Quick Start**: Set `VITE_API_BASE_URL` in Vercel dashboard → Redeploy → Test PDF download!
