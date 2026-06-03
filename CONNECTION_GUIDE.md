# Connection Guide: Frontend ↔ Backend ↔ Database

Complete guide to connecting your Vercel frontend with Render backend and MongoDB.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  User Browser                            │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ HTTPS Requests
                    ▼
        ┌───────────────────────────┐
        │  Vercel Frontend (React)  │
        │  https://your-app.vercel  │
        │  - Login/Register UI       │
        │  - Dashboard               │
        │  - Sync Manager            │
        └───────────┬───────────────┘
                    │
                    │ API Calls with JWT
                    ▼
        ┌───────────────────────────┐
        │  Render Backend (Express) │
        │  https://your-api.onrend  │
        │  - Authentication          │
        │  - Data Sync               │
        │  - User Management         │
        └───────────┬───────────────┘
                    │
                    │ MongoDB Queries
                    ▼
        ┌───────────────────────────┐
        │   MongoDB Atlas Cloud      │
        │  - Users Collection        │
        │  - SyncLog Collection      │
        └───────────────────────────┘
```

## Step 1: Database - MongoDB Atlas Setup

### Create MongoDB Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create organization and project

### Create Database Cluster

1. Click "Build a Database"
2. Select **Free Tier** (M0 - Sandbox)
3. Select cloud provider (AWS, Google Cloud, Azure)
4. Select region closest to your users
5. Enter cluster name: `pcp-recruitment`
6. Click "Create Cluster"

Wait 5-10 minutes for cluster creation.

### Create Database User

1. In MongoDB Atlas, click "Database Access"
2. Click "Add New Database User"
3. Set username: `pcp_admin`
4. Set password: Generate secure random password (save this!)
5. Set permissions: `Atlas Admin` (for development)
6. Click "Add User"

### Get Connection String

1. Click "Drivers" in main dashboard
2. Select **Node.js** and version **5.x or later**
3. Copy connection string
4. Replace `<username>` with your username
5. Replace `<password>` with your password
6. Example:
   ```
   mongodb+srv://pcp_admin:PASSWORD@pcp-recruitment.xxxx.mongodb.net/pcp_recruitment?retryWrites=true&w=majority
   ```

### Add IP Whitelist

1. Click "Network Access"
2. Click "Add IP Address"
3. For development: Add your home IP
4. For production: Use Render's IP (you'll get this later)
5. Or click "Allow Access from Anywhere" (0.0.0.0/0) - NOT recommended for production

**Connection String is ready!** Save it for Render deployment.

---

## Step 2: Backend - Deploy to Render

### Create Render Account

1. Go to https://render.com
2. Sign up with GitHub account
3. Authorize Render to access your GitHub

### Push Backend Code to GitHub

1. In your project folder:
```bash
cd "c:\Users\mitulanand\Downloads\PCP FA"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial backend deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/your-repo.git

# Push to GitHub
git push -u origin main
```

### Create Render Service

1. Go to https://render.com/dashboard
2. Click "New +"
3. Select "Web Service"
4. Connect GitHub repository
5. Select your repository
6. Authorize if needed

### Configure Render Service

**Basic Settings:**
- **Name**: `pcp-recruitment-api`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Plan**: Free (select Free tier)

**Environment Variables** (Click "Advanced" then "Add Environment Variable"):

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | (Your MongoDB connection string) |
| `JWT_SECRET` | (Generate random string - see below) |
| `FRONTEND_URL` | (Will update after Vercel deployment) |

**Generate JWT_SECRET** (on PowerShell):
```powershell
$bytes = New-Object Byte[] 32
$rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Copy the output and paste as JWT_SECRET.

### Deploy Backend

1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Your backend URL: `https://your-service-name.onrender.com`
4. Test: Visit `https://your-service-name.onrender.com/api/health`
   - Should return: `{"status": "healthy"}`

**Save your backend URL!** Example: `https://pcp-recruitment-api.onrender.com`

---

## Step 3: Frontend - Deploy to Vercel

### Prepare Frontend for Deployment

1. Update frontend environment:
```bash
cd frontend
```

2. Edit `.env.production`:
```
VITE_API_BASE_URL=https://pcp-recruitment-api.onrender.com
VITE_API_TIMEOUT=10000
```

3. Commit changes:
```bash
git add .env.production
git commit -m "Update production API URL"
git push
```

### Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel

### Deploy to Vercel

1. Click "Add New..." → "Project"
2. Select your GitHub repository
3. Click "Import"

**Configure Project:**
- **Project Name**: `pcp-recruitment-frontend`
- **Framework Preset**: `Vite`
- **Root Directory**: `./frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

**Environment Variables:**
- `VITE_API_BASE_URL`: `https://your-render-service.onrender.com`
- `VITE_API_TIMEOUT`: `10000`

4. Click "Deploy"
5. Wait for deployment (2-5 minutes)
6. Your frontend URL: `https://your-project.vercel.app`

**Test Frontend:**
- Visit your Vercel URL
- Should see login page
- Try register → Login → Dashboard

---

## Step 4: Connect Backend & Frontend

### Update Render FRONTEND_URL

1. Go to Render dashboard
2. Select your backend service
3. Click "Environment"
4. Find `FRONTEND_URL`
5. Update value: `https://your-project.vercel.app`
6. Click "Save"
7. Render will automatically redeploy (5 minutes)

### Test CORS Connection

Backend should now accept requests from your Vercel frontend.

Test in browser console:
```javascript
fetch('https://your-render-service.onrender.com/api/health')
  .then(r => r.json())
  .then(data => console.log(data))
```

Should return: `{status: "healthy"}`

---

## Step 5: Update MongoDB IP Whitelist (Production)

### Get Render IP Address

1. Go to Render service logs
2. You'll see requests - note the IP addresses
3. Or use dynamic IP whitelist: `0.0.0.0/0` (temporary)

### Update MongoDB Whitelist

1. MongoDB Atlas → Network Access
2. Click "Edit" on existing entry
3. Add Render IP address
4. Click "Confirm"

---

## Step 6: Complete Testing

### Test Authentication Flow

1. **Register**: Go to `https://your-vercel-url.vercel.app`
   - Create account
   - Should see dashboard

2. **Login**: Logout and login again
   - Verify token stored
   - Verify JWT works

3. **Protected Routes**:
   - Verify `/dashboard` requires login
   - Verify `/sync` requires admin/officer role

### Test API Integration

1. **Backend Health**:
```bash
curl https://your-render-service.onrender.com/api/health
```

2. **Register**:
```bash
curl -X POST https://your-render-service.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Test",
    "lastName":"User",
    "email":"test@example.com",
    "password":"TestPass123",
    "role":"student"
  }'
```

3. **Login**:
```bash
curl -X POST https://your-render-service.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

### Test Data Sync (Admin Only)

1. Login as admin user
2. Go to `/sync` page
3. Click "Test with Mock Data"
4. Should see sync results
5. Check MongoDB Atlas - new users should appear

---

## Environment Variable Reference

### Frontend (.env.production)
```
VITE_API_BASE_URL=https://your-render-service.onrender.com
VITE_API_TIMEOUT=10000
```

### Backend (Render Environment Variables)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pcp_recruitment?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=https://your-vercel-project.vercel.app
```

---

## Monitoring & Logs

### View Backend Logs (Render)
1. Render dashboard → Select service
2. Click "Logs" tab
3. See real-time activity

### View Frontend Logs (Vercel)
1. Vercel dashboard → Select project
2. Click "Deployments"
3. Select latest → "View Logs"

### View Application Logs
- Browser Developer Tools (F12)
- Network tab: See API requests/responses
- Console tab: See JavaScript errors

---

## Auto-Deployment Workflow

### Backend Changes
```
1. Make changes locally
2. Commit: git commit -m "message"
3. Push: git push
4. Render auto-deploys (5 min)
5. Check Render logs to verify
```

### Frontend Changes
```
1. Make changes locally (in frontend/ folder)
2. Commit: git commit -m "message"
3. Push: git push
4. Vercel auto-deploys (2-5 min)
5. Check Vercel logs to verify
```

---

## Troubleshooting

### Frontend Can't Connect to Backend
**Error**: Network error in console

**Check:**
1. Is Render backend running? (Check Render logs)
2. Is VITE_API_BASE_URL correct?
3. Is FRONTEND_URL set in Render?
4. Is CORS enabled? (Backend should allow Vercel URL)

**Solution:**
```bash
# Verify backend is running
curl https://your-render-service.onrender.com/api/health

# Check environment variables in Render
# Redeploy Render if changed
```

### Login Fails with CORS Error
**Error**: "Access to XMLHttpRequest... has been blocked by CORS policy"

**Solution:**
1. Check Render `FRONTEND_URL` matches Vercel URL exactly
2. Redeploy Render: Render dashboard → Service → Manual Deploy
3. Wait 5 minutes for deployment
4. Clear browser cache and retry

### MongoDB Connection Error
**Error**: "MongoNetworkError" in logs

**Check:**
1. Is MONGODB_URI correct? (Check for typos)
2. Is username/password correct?
3. Is Render IP whitelisted in MongoDB?
4. Is cluster running? (Check MongoDB Atlas)

### First Request Takes 30+ Seconds
**Normal on free tier** - Render spins down unused services.

**Solution:**
- Keep-alive requests every 14 minutes
- Upgrade to paid Render plan
- Or accept longer startup time

---

## Security Checklist

- ✅ JWT_SECRET is unique and strong
- ✅ MongoDB password is strong
- ✅ MongoDB restricted to known IPs (or 0.0.0.0/0 only for testing)
- ✅ Both apps use HTTPS
- ✅ FRONTEND_URL set correctly in backend
- ✅ No secrets committed to Git
- ✅ Environment variables configured
- ✅ CORS restricted to frontend origin

---

## Files Reference

### Backend Files
- `index.js` - Express server
- `.env.production` - Production env template
- `Procfile` - Render deployment config
- `package.json` - Dependencies

### Frontend Files
- `src/App.jsx` - Main component
- `.env.production` - Production API URL
- `vite.config.js` - Build config
- `vercel.json` - Vercel config
- `package.json` - Dependencies

---

## URLs After Deployment

- **Frontend**: https://your-project.vercel.app
- **Backend**: https://your-service.onrender.com
- **API**: https://your-service.onrender.com/api
- **MongoDB**: Atlas cloud (not directly accessible)

---

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Docs: https://docs.mongodb.com/
- React Docs: https://react.dev
- Express Docs: https://expressjs.com

