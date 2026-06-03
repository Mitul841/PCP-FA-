# PCP Recruitment Frontend

React frontend for the PCP Recruitment System with authentication, role-based access control, and data synchronization management.

## Features

✅ User Authentication (Register/Login)  
✅ JWT Token Management  
✅ Role-Based Access Control (Admin, Placement Officer, Student)  
✅ Protected Routes  
✅ Dashboard for Authenticated Users  
✅ Data Sync Management (Admin/Officer only)  
✅ Responsive Design  
✅ Environment-Based Configuration  

## Tech Stack

- **Frontend**: React 18.2.0
- **Routing**: React Router 6.14.0
- **State Management**: Zustand 4.3.9
- **HTTP Client**: Axios 1.4.0
- **Build Tool**: Vite 4.4.0
- **Styling**: CSS3

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   │   ├── Login.jsx       # Login page
│   │   ├── Register.jsx    # Registration page
│   │   ├── Dashboard.jsx   # User dashboard
│   │   └── Sync.jsx        # Data sync manager
│   ├── services/           # API integration
│   │   ├── api.js          # Axios instance
│   │   └── authService.js  # API methods
│   ├── context/            # State management
│   │   └── authStore.js    # Zustand auth store
│   ├── styles/             # CSS files
│   │   ├── Auth.css        # Auth pages styling
│   │   ├── Dashboard.css   # Dashboard styling
│   │   └── Sync.css        # Sync page styling
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── vercel.json             # Vercel deployment config
├── .env.local              # Local environment
├── .env.production         # Production environment
└── README.md               # This file
```

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file with your backend URL:
```
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=10000
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building for Production

Build the application:
```bash
npm run build
```

Output files will be in the `dist/` directory.

Preview production build:
```bash
npm run preview
```

## Environment Variables

### Development (.env.local)
```
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=10000
```

### Production (.env.production)
```
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
VITE_API_TIMEOUT=10000
```

## Pages & Features

### 1. Login Page (`/login`)
- Email and password authentication
- JWT token retrieval and storage
- Redirect to dashboard on success
- Register link for new users

### 2. Register Page (`/register`)
- Create new user account
- Select user role
- Email verification
- Auto-login after registration

### 3. Dashboard (`/dashboard`)
- User profile display
- Role-based admin controls
- Links to admin features
- Logout functionality

### 4. Sync Manager (`/sync`)
- Test sync with mock data
- Sync students from private API
- View sync history
- Detailed sync reports
- Error tracking and viewing

## API Integration

### Authentication Service
```javascript
import { authService } from './services/authService';

// Register
await authService.register({ firstName, lastName, email, password, role });

// Login
await authService.login(email, password);

// Get current user
await authService.getCurrentUser();

// Get all users
await authService.getAllUsers(page, limit, search);

// Logout
authService.logout();
```

### Sync Service
```javascript
import { syncService } from './services/authService';

// Test sync
await syncService.testSync();

// Sync students
await syncService.syncStudents(apiUrl, apiKey);

// Get sync history
await syncService.getSyncHistory(page, limit, syncType);

// Get sync details
await syncService.getSyncDetails(syncId);
```

## Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token automatically sent in Authorization header
5. Protected routes check for valid token
6. Expired token triggers re-login

## State Management (Zustand)

```javascript
import { useAuthStore } from './context/authStore';

function MyComponent() {
  const { user, token, isAdmin } = useAuthStore();
  
  // Component logic
}
```

## Deployment to Vercel

### Option 1: Connect GitHub Repository

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Configure project settings:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Set environment variables:
   - `VITE_API_BASE_URL`: Your Render backend URL
   - `VITE_API_TIMEOUT`: `10000`
6. Click Deploy

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# For production
vercel --prod
```

### Option 3: Manual Build & Deploy

```bash
# Build
npm run build

# Deploy dist folder to Vercel
vercel deploy dist
```

## Connecting to Render Backend

1. Deploy backend to Render (see backend README)
2. Get your Render backend URL: `https://your-app.onrender.com`
3. Update `.env.production`:
   ```
   VITE_API_BASE_URL=https://your-app.onrender.com
   ```
4. Redeploy to Vercel
5. Backend CORS must include your Vercel URL

## CORS Configuration

The backend must have your Vercel URL in CORS configuration:

```javascript
// Backend index.js
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourdomain.vercel.app'
    : ['http://localhost:3000', 'http://localhost:5000'],
  // ... other options
};
```

Set on Render:
```
FRONTEND_URL=https://your-vercel-url.vercel.app
```

## Troubleshooting

### CORS Error
- **Issue**: Requests blocked by CORS policy
- **Solution**: Check backend CORS configuration with your Vercel URL

### Token Not Persisting
- **Issue**: Login successful but localStorage empty
- **Solution**: Check browser cookie/storage settings

### API Requests Failing
- **Issue**: 404 or 500 errors from API
- **Solution**: 
  - Verify VITE_API_BASE_URL is correct
  - Check if backend is running
  - Review browser console for error details

### Blank Page on Vercel
- **Issue**: White screen after deployment
- **Solution**: Check Vercel deployment logs for build errors

## Performance Optimization

- Lazy loading for routes
- Code splitting with React Router
- Minified production builds
- Vite's fast HMR during development

## Security Best Practices

✅ JWT token stored in localStorage  
✅ Token sent only in Authorization header  
✅ Protected routes check token validity  
✅ Expired tokens trigger logout  
✅ API requests use HTTPS in production  
✅ Sensitive data not stored in localStorage  

## Development Workflow

1. Create feature branch
2. Make changes locally (`npm run dev`)
3. Test authentication & protected routes
4. Build for production (`npm run build`)
5. Test production build (`npm run preview`)
6. Commit and push to GitHub
7. Vercel automatically deploys on push

## Support

For issues or questions:
- Check the backend README.md
- Review Vercel documentation: https://vercel.com/docs
- Check Vite documentation: https://vitejs.dev/

