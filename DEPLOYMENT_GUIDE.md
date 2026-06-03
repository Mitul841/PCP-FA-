# Production Deployment Guide

## Quick Summary

Backend running on **Render**: `https://your-app.onrender.com`  
Frontend running on **Vercel**: `https://your-domain.vercel.app`  

---

## Phase 1: Deploy Backend to Render

### Step 1: Prepare Backend

1. Push your code to GitHub repository:
```bash
cd "c:\Users\mitulanand\Downloads\PCP FA"
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. Verify `package.json` has correct scripts:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

3. Verify `Procfile` exists in root:
```
web: node index.js
```

### Step 2: Deploy to Render

1. Go to https://render.com (create account if needed)

2. Create new **Web Service**:
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Select the repo containing your code

3. Configure deployment:
   - **Name**: `pcp-recruitment-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free (or paid if needed)
   - **Region**: Select closest to your users

4. Add Environment Variables (click "Environment"):
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: (see MongoDB setup below)
   - `JWT_SECRET`: Generate a strong random string
   - `FRONTEND_URL`: (will set after Vercel deployment)

5. Click "Deploy"

6. Wait for deployment to complete (typically 5-10 minutes)

7. Note your deployment URL: `https://your-app.onrender.com`

### Step 3: MongoDB Setup (if not already done)

1. Go to https://www.mongodb.com/cloud/atlas

2. Create MongoDB Atlas cluster:
   - Create account/login
   - Create new project
   - Build database cluster
   - Select cloud provider and region
   - Complete cluster setup

3. Create database user:
   - Click "Database Access"
   - Create user with strong password
   - Note username and password

4. Get connection string:
   - Click "Drivers" 
   - Select Node.js
   - Copy connection string
   - Replace `<username>` and `<password>`

5. Add IP Whitelist:
   - Click "Network Access"
   - Add IP address (or 0.0.0.0/0 for public access - not recommended for production)

6. Set `MONGODB_URI` in Render with this connection string

### Render Environment Variables Setup

In Render dashboard, set these variables:

```
NODE_ENV = production
PORT = 10000
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/pcp_recruitment?retryWrites=true&w=majority
JWT_SECRET = (generate a strong random string)
FRONTEND_URL = (will update after Vercel deployment)
```

Generate JWT_SECRET:
```bash
# On Windows PowerShell
$bytes = New-Object Byte[] 32
$rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
$rng.GetBytes($bytes)
$jwt = [Convert]::ToBase64String($bytes)
Write-Host $jwt
```

---

## Phase 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend

1. Navigate to frontend:
```bash
cd frontend
```

2. Update `.env.production`:
```
VITE_API_BASE_URL=https://your-render-app.onrender.com
VITE_API_TIMEOUT=10000
```

3. Verify `vercel.json` exists with correct configuration

4. Commit changes:
```bash
git add .
git commit -m "Update production API URL"
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard** (Recommended)

1. Go to https://vercel.com (create account if needed)

2. Click "Add New..." → "Project"

3. Import your GitHub repository

4. Select repository

5. Configure project:
   - **Project Name**: `pcp-recruitment-frontend`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Set environment variables:
   - `VITE_API_BASE_URL`: `https://your-render-app.onrender.com`
   - `VITE_API_TIMEOUT`: `10000`

7. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# For production
vercel --prod
```

### Step 3: Get Vercel URL

1. Deployment completes
2. Note your Vercel URL: `https://your-project.vercel.app`

---

## Phase 3: Connect Backend & Frontend

### Update Render Backend with Frontend URL

1. Go to Render dashboard

2. Select your backend service

3. Go to "Environment"

4. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-project.vercel.app
   ```

5. Click "Save" (this will trigger re-deployment)

### Verify Backend CORS

The backend should have CORS configured for your frontend:

```javascript
// Check index.js - should have:
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourdomain.vercel.app'
    : ['http://localhost:3000', 'http://localhost:5000'],
  // ...
};
```

---

## Phase 4: Testing Production Deployment

### Test Backend API

1. Open browser and go to:
   ```
   https://your-render-app.onrender.com/api/health
   ```
   Should return: `{"status": "healthy"}`

2. Test register endpoint:
   ```bash
   curl -X POST https://your-render-app.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "Test",
       "lastName": "User",
       "email": "test@example.com",
       "password": "TestPass123",
       "role": "student"
     }'
   ```

3. Should get JWT token in response

### Test Frontend Application

1. Go to your Vercel URL: `https://your-project.vercel.app`

2. Test authentication:
   - Register new account
   - Login with credentials
   - See dashboard

3. Test protected routes:
   - Access `/dashboard` (should work after login)
   - Access `/login` (should redirect to dashboard if already logged in)

4. If Admin/Officer, test sync:
   - Go to `/sync`
   - Click "Test with Mock Data"
   - Should see sync results

### Test API Integration

Open browser Developer Tools (F12):

1. Go to Console tab
2. Try API call:
   ```javascript
   const response = await fetch('https://your-render-app.onrender.com/api/auth/profile', {
     headers: {
       'Authorization': 'Bearer YOUR_TOKEN_HERE'
     }
   });
   console.log(await response.json());
   ```

---

## Common Issues & Solutions

### Issue: CORS Error
**Error**: "Access to XMLHttpRequest at 'https://backend.com' from origin 'https://frontend.com' has been blocked"

**Solutions**:
1. Verify `FRONTEND_URL` is set in Render environment
2. Verify backend CORS includes your Vercel URL
3. Redeploy backend after changing env vars
4. Check that URLs match exactly (https vs http, domain spelling)

### Issue: "Cannot GET /" on Render
**Error**: 404 when visiting root URL

**Solution**: This is normal - API has no root route. Test `/api/health` instead

### Issue: MongoDB Connection Error
**Error**: "MongoNetworkError" or "authentication failed"

**Solutions**:
1. Verify `MONGODB_URI` is correct format
2. Check MongoDB username/password (especially special characters)
3. Verify IP whitelist includes Render's IP (0.0.0.0/0 for testing)
4. Test connection string locally first

### Issue: Frontend Shows "Failed to fetch"
**Error**: Network error when trying to login

**Solutions**:
1. Check `VITE_API_BASE_URL` matches your Render URL exactly
2. Verify backend is running (check Render logs)
3. Verify CORS settings on backend
4. Check browser Network tab for actual error

### Issue: Render App Goes to Sleep
**Problem**: First request after inactivity takes 30+ seconds

**Solution**: 
- This is normal on free tier
- Use paid tier to keep app always running
- Or upgrade to paid plan

---

## Monitoring & Maintenance

### View Render Logs
1. Render dashboard → Select service
2. Click "Logs" tab
3. See real-time logs

### View Vercel Logs
1. Vercel dashboard → Select project
2. Click "Deployments"
3. Click on deployment → "View Logs"

### Monitor Errors
1. Backend errors: Check Render logs
2. Frontend errors: Check Vercel logs or browser console

### Update Production Code

**Backend:**
1. Make changes locally
2. Commit and push to GitHub
3. Render automatically redeploys

**Frontend:**
1. Make changes locally
2. Commit and push to GitHub
3. Vercel automatically redeploys

---

## Security Checklist

✅ Change JWT_SECRET to unique, strong value  
✅ Use MongoDB Atlas with secure passwords  
✅ Restrict MongoDB IP whitelist (don't use 0.0.0.0/0 in production)  
✅ Use HTTPS only (both Render and Vercel use HTTPS by default)  
✅ Set strong passwords for all accounts  
✅ Monitor logs regularly for suspicious activity  
✅ Keep dependencies updated  
✅ Use environment variables for all secrets (never commit secrets)  

---

## Redeploying After Changes

### Backend Changes
```bash
# Make changes
git add .
git commit -m "Your message"
git push origin main

# Render automatically detects changes and redeploys
```

### Frontend Changes
```bash
# In frontend directory
git add .
git commit -m "Your message"
git push origin main

# Vercel automatically detects changes and redeploys
```

---

## Scale Up from Free Tier

### Render Paid Tier
- Render dashboard → Select service
- Settings tab → Change plan
- Choose paid tier for always-on service

### Vercel Pro
- Vercel dashboard → Settings → Billing
- Upgrade to Pro plan
- Higher bandwidth and deployment limits

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Connect frontend & backend
4. ✅ Test all functionality
5. ⏳ Monitor logs and performance
6. ⏳ Gather user feedback
7. ⏳ Implement additional features
8. ⏳ Scale as needed

