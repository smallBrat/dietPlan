# 🔍 PDF Download Error - Advanced Debugging

## Quick Checklist ✅

Before debugging, verify:

1. **Backend is running** (on Render):
   ```bash
   curl https://dietplan-backend-4anu.onrender.com/health
   # Should return: {"status":"healthy",...}
   ```

2. **Check Vercel environment variable** is set:
   - Go to: https://vercel.com/dashboard
   - Select project → Settings → Environment Variables
   - Should have: `VITE_API_BASE_URL = https://dietplan-backend-4anu.onrender.com`
   - ⚠️ **If NOT set, add it now and redeploy!**

3. **Verify Vercel deployment is latest**:
   - Go to Deployments tab
   - Redeploy latest commit (click the three dots → Redeploy)

---

## 🧪 Debug Steps

### Step 1: Check Browser Console
1. Open your Vercel deployment in browser
2. Press **F12** to open Developer Console
3. Click **"Download PDF"**
4. Check the console for logs like:
   ```
   PDF Download - Starting request: {...}
   PDF Download - Response received: {...}
   PDF Download - Blob received: {...}
   PDF Download - Success!
   ```

### Step 2: What Each Log Tells You

| Log | Means |
|-----|-------|
| `Could not connect` | Backend unreachable |
| `status: 401` | Not authenticated |
| `status: 404` | Diet plan not found |
| `status: 500` | Backend error |
| `size: 0` | Empty response (stream error) |
| `Blob received: {size: 2056, type: 'application/pdf'}` | ✅ Success! |

### Step 3: Check Network Tab
1. Press **F12**, go to **Network** tab
2. Clear logs (trash icon)
3. Click **"Download PDF"**
4. Look for request to `/api/diet/xxx/pdf`
5. Check:
   - **Status**: Should be 200 (green)
   - **Response type**: Should show blob or document
   - **Size**: Should be > 0 bytes
   - **Headers**: Should include `Authorization: Bearer ...`

### Step 4: Test API Directly (Advanced)

In browser console, test the API:
```javascript
// Get your auth token
const token = localStorage.getItem('auth_token');
console.log('Token exists:', !!token);

// Test the API endpoint
fetch('/api/diet/YOUR_DIET_PLAN_ID_HERE/pdf', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => {
  console.log('Response status:', r.status);
  console.log('Response headers:', Object.fromEntries(r.headers));
  return r.blob();
})
.then(blob => {
  console.log('Blob size:', blob.size);
  console.log('Blob type:', blob.type);
})
.catch(err => console.error('Error:', err));
```

---

## 🔧 Common Causes & Fixes

### ❌ Problem: API calls going to wrong URL
**Signs**:
- Console shows: `Could not connect` or `ERR_CONNECTION_REFUSED`
- Network shows: `status: 0` or connection error

**Fixes**:
1. Check Vercel environment variables:
   ```
   VITE_API_BASE_URL = https://dietplan-backend-4anu.onrender.com
   ```
2. Make sure frontend is redeployed AFTER adding env var
3. Check browser console for: `"Using API base URL from env: https://..."`

---

### ❌ Problem: 401 Unauthorized
**Signs**:
- Console shows: `API Error: 401 Unauthorized`
- Token missing or expired

**Fixes**:
1. Log out completely:
   ```javascript
   localStorage.removeItem('auth_token');
   ```
2. Log back in
3. Try PDF download again

---

### ❌ Problem: 404 Not Found
**Signs**:
- Console shows: `API Error: 404 Diet plan not found`

**Fixes**:
1. Verify diet plan exists (open and view it first)
2. Make sure you own that diet plan
3. Check URL has correct diet plan ID

---

### ❌ Problem: 500 Server Error
**Signs**:
- Console shows: `API Error: 500`
- Backend issue

**Fixes**:
1. Check backend logs on Render:
   - https://dashboard.render.com
   - Select dietplan service
   - View logs
2. Restart backend service on Render

---

### ❌ Problem: Empty PDF (0 bytes)
**Signs**:
- Console shows: `Received empty PDF - Server may have encountered an error`

**Fixes**:
1. Check backend logs for PDF generation errors
2. Verify diet plan has valid data
3. Try generating a new diet plan

---

## 📊 What's Happening Behind the Scenes

### Development (localhost:3000)
```
Browser
  ↓
fetch('/api/diet/123/pdf')
  ↓
Vite Dev Proxy (defined in vite.config.ts)
  ↓
http://localhost:5000/api/diet/123/pdf ✅
```

### Production (Vercel)
```
Browser (vercel.com)
  ↓
fetch('/api/diet/123/pdf')
  ↓
Frontend receives request
  ↓
Check VITE_API_BASE_URL env variable
  ↓
https://dietplan-backend-4anu.onrender.com/api/diet/123/pdf ✅
```

---

## 🚨 Vercel Environment Variable Setup (WITH SCREENSHOTS)

### Method 1: Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Click your **dietplan** project
3. Click **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)
5. Click **Add New**
   - Name: `VITE_API_BASE_URL`
   - Value: `https://dietplan-backend-4anu.onrender.com`
   - Select "Production" (or all environments)
6. Click **Save**
7. Click **Deployments** → Find latest → Click **Redeploy**

### Method 2: Vercel CLI

```bash
vercel env add VITE_API_BASE_URL
# When prompted, enter: https://dietplan-backend-4anu.onrender.com

vercel redeploy
```

---

## ✅ Verify Setup is Correct

### In Vercel Console (F12), you should see:

**Development:**
```
Using Vite proxy for API calls
```

**Production:**
```
Using API base URL from env: https://dietplan-backend-4anu.onrender.com
```

If you see:
```
VITE_API_BASE_URL is not set. Using relative paths
```

❌ **PROBLEM**: Environment variable not set in Vercel!

---

## 🆘 Still Not Working?

### Get Help Info

Gather this info and include in bug report:

```javascript
// Run this in browser console (F12)
console.log('=== DEBUG INFO ===');
console.log('Environment:', import.meta.env.MODE);
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Current URL:', window.location.href);
console.log('Diet Plan ID:', 'YOUR_PLAN_ID_HERE');
console.log('Has Token:', !!localStorage.getItem('auth_token'));

// Test backend connectivity
fetch('https://dietplan-backend-4anu.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log('Backend status:', d))
  .catch(e => console.error('Backend unreachable:', e));
```

---

## 📞 Support

If still having issues:

1. **Check console logs** - Share the exact error message
2. **Network activity** - Share what request is being made
3. **Environment vars** - Confirm they're set in Vercel
4. **Backend logs** - Check https://dashboard.render.com for errors

---

## Quick Links 🔗

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **Your Frontend**: https://dietplan-theta.vercel.app
- **Your Backend**: https://dietplan-backend-4anu.onrender.com
