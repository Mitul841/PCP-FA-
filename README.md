# Placement Recruitment System - Authentication & Authorization

A secure authentication and authorization system built with Node.js, Express, and MongoDB for a placement recruitment platform.

## Features

- ✅ **User Registration** - Register new users with password hashing
- ✅ **Duplicate Email Prevention** - Validates unique email addresses
- ✅ **Password Hashing** - Bcrypt-based secure password hashing
- ✅ **Role-Based Access** - Support for Admin, placement_officer, and student roles
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Input Validation** - Comprehensive validation of user inputs
- ✅ **Error Handling** - Centralized error handling middleware

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Validation**: validator.js, express-validator

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd placement-recruitment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/placement-recruitment
   JWT_SECRET=your_secure_secret_key_here
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the server**
   ```bash
   # Development (with hot reload)
   npm run dev

   # Production
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Register User

**Endpoint**: `POST /api/auth/register`

**Description**: Register a new user with email, password, and role

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "role": "student"
}
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| firstName | String | Yes | First name (min 2 chars) |
| lastName | String | Yes | Last name (min 2 chars) |
| email | String | Yes | Valid email (must be unique) |
| password | String | Yes | Password (min 6 chars, must contain uppercase, lowercase, numbers) |
| role | String | No | User role - `Admin`, `placement_officer`, or `student` (default: `student`) |

**Success Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:

1. **Duplicate Email** (409):
```json
{
  "success": false,
  "message": "Email already registered",
  "error": "DUPLICATE_EMAIL"
}
```

2. **Validation Error** (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Password should contain uppercase, lowercase, and numbers"
  ]
}
```

3. **Invalid Role** (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Invalid role provided"
  ]
}
```

### 2. Login User

**Endpoint**: `POST /api/auth/login`

**Description**: Login existing user and get JWT token

**Requirements Met**:
- ✅ JWT token generation with 7-day expiration
- ✅ Invalid credential handling (401 status)
- ✅ Return authenticated user details
- ✅ Secure password verification using bcrypt

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | String | Yes | User email address (case-insensitive) |
| password | String | Yes | User password |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzE3NDEyNTAwLCJleHAiOjE3MTgwMTczMDB9.abc123..."
  }
}
```

**Error Responses**:

1. **Missing Email/Password** (400):
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

2. **Invalid Credentials** (401):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

3. **User Not Found** (401):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 3. Get Current User (Protected Route)

**Endpoint**: `GET /api/auth/profile`

**Description**: Get authenticated user details using JWT token (accessible by all authenticated users)

**Requirements Met**:
- ✅ Protected route - requires JWT authentication
- ✅ Returns current authenticated user details
- ✅ Accessible by all authenticated users (student, admin, placement_officer)

**Headers Required**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User details retrieved",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "student",
      "isActive": true,
      "createdAt": "2026-06-03T10:30:00.000Z",
      "updatedAt": "2026-06-03T10:30:00.000Z"
    }
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "message": "No token provided",
  "error": "NO_TOKEN"
}
```

### 4. Get All Users (Admin & Placement Officer Only)

**Endpoint**: `GET /api/auth/users`

**Description**: Get list of all users with filtering, search, and pagination (restricted to Admin and placement_officer)

**Requirements Met**:
- ✅ Protected route - requires JWT authentication
- ✅ Role-based access - only Admin and placement_officer
- ✅ Supports filtering, search, and pagination
- ✅ Returns user details without passwords

**Headers Required**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| role | String | - | Filter by role: `Admin`, `placement_officer`, `student` |
| isActive | Boolean | - | Filter by active status: `true` or `false` |
| search | String | - | Search by first name, last name, or email |
| page | Number | 1 | Page number for pagination |
| limit | Number | 10 | Results per page |

**Example Request**:
```bash
GET /api/auth/users?role=student&page=1&limit=10&search=john
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "student",
        "isActive": true,
        "createdAt": "2026-06-03T10:30:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@example.com",
        "role": "student",
        "isActive": true,
        "createdAt": "2026-06-03T10:35:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

**Error Response** (403):
```json
{
  "success": false,
  "message": "Access denied",
  "error": "INSUFFICIENT_PERMISSIONS",
  "requiredRoles": ["Admin", "placement_officer"],
  "userRole": "student"
}
```

### 5. Get User by ID (Admin & Placement Officer Only)

**Endpoint**: `GET /api/auth/users/:id`

**Description**: Get specific user details by ID (restricted to Admin and placement_officer)

**Requirements Met**:
- ✅ Protected route - requires JWT authentication
- ✅ Role-based access - only Admin and placement_officer
- ✅ Returns user details without password
- ✅ Validates MongoDB ID format

**Headers Required**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | MongoDB user ID (24-character hex string) |

**Success Response** (200):
```json
{
  "success": true,
  "message": "User details retrieved",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "student",
      "isActive": true,
      "createdAt": "2026-06-03T10:30:00.000Z",
      "updatedAt": "2026-06-03T10:30:00.000Z"
    }
  }
}
```

**Error Responses**:

1. **User Not Found** (404):
```json
{
  "success": false,
  "message": "User not found"
}
```

2. **Invalid ID Format** (400):
```json
{
  "success": false,
  "message": "Invalid user ID format"
}
```

3. **Access Denied** (403):
```json
{
  "success": false,
  "message": "Access denied",
  "error": "INSUFFICIENT_PERMISSIONS"
}
```

## Current User API - Key Features

### 1. **Protected Routes** ✅
- Requires JWT token in Authorization header
- Token verified and validated
- User information extracted from token

### 2. **Role-Based Access Control** ✅
- Admin can access all user data
- placement_officer can access all user data
- Students can only access their own profile via `/profile` endpoint
- Clear 403 error when unauthorized

### 3. **User Details Returned** ✅
- Never includes password (select: false)
- Includes all relevant user information
- Timestamps for audit trail
- Active status indicator

### 4. **Filtering & Pagination** ✅
- Filter by role (Admin, placement_officer, student)
- Filter by active status
- Search by name or email (case-insensitive)
- Pagination with total count and page info

## API Endpoints Summary

## Login API - Key Features

### 1. **JWT Token Generation** ✅
- Uses HMAC SHA256 algorithm
- 7-day expiration period
- Payload includes user ID and role
- Signed with JWT_SECRET

### 2. **Invalid Credential Handling** ✅
- Returns generic "Invalid credentials" message for security
- Does not reveal if email exists or password is wrong
- 401 Unauthorized status code
- Prevents user enumeration attacks

### 3. **Authenticated User Details** ✅
- Returns user profile without password
- Includes first name, last name, email, role
- User ID for future operations
- Role information for authorization

### 4. **Password Verification** ✅
- Uses bcrypt.compare() for secure comparison
- Time-constant comparison (prevents timing attacks)
- Handles wrong password gracefully

## Authentication Middleware

### JWT Authentication (`authenticate`)

Middleware to verify JWT tokens and authenticate requests:

```javascript
router.get('/protected-route', authenticate, (req, res) => {
  // req.user contains: id, email, role, firstName, lastName
  res.json({ user: req.user });
});
```

**Usage in routes**:
```javascript
const { authenticate, authorize } = require('../middleware/auth');

// Protected route - requires authentication
router.get('/profile', authenticate, getProfile);

// Protected route - requires specific role
router.delete('/user/:id', authenticate, authorize('Admin'), deleteUser);

// Multiple roles allowed
router.get('/reports', authenticate, authorize('Admin', 'placement_officer'), getReports);
```

**Token Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Payload**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "role": "student",
  "iat": 1717412500,
  "exp": 1718017300
}
```

### Role-Based Authorization (`authorize`)

Middleware to check user roles:

```javascript
// Only Admin can access
router.post('/admin/settings', authenticate, authorize('Admin'), updateSettings);

// Admin or placement_officer
router.get('/placements', authenticate, authorize('Admin', 'placement_officer'), getPlacements);
```

**Error Response (403)**:
```json
{
  "success": false,
  "message": "Access denied",
  "error": "INSUFFICIENT_PERMISSIONS",
  "requiredRoles": ["Admin"],
  "userRole": "student"
}
```

## Token Security

### JWT Expiration
- Tokens expire in **7 days**
- After expiration, user must login again
- Implement refresh tokens for extended sessions

### Token Storage
- **Do NOT store in localStorage** (XSS vulnerable)
- **Recommended**: Store in httpOnly cookie (set by server)
- **Alternative**: Store in sessionStorage for SPA apps

### Token Usage
```bash
# In cURL
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/auth/me

# In Fetch
fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})

# In Axios
axios.get('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

## Register API - Key Features

### 1. **Password Hashing** ✅
- Uses bcryptjs with salt rounds = 10
- Passwords are hashed before storage
- One-way encryption for security

### 2. **Duplicate Email Prevention** ✅
- MongoDB unique index on email field
- Case-insensitive email matching
- Returns 409 Conflict if email exists

### 3. **Role Assignment** ✅
- Supports three roles: Admin, placement_officer, student
- Default role: student
- Enum validation in schema

### 4. **Input Validation** ✅
- Email format validation
- Password strength requirements
- Name length validation
- Role enum validation

### 5. **Security Features** ✅
- JWT token generation
- Password never returned in responses
- Secure error messages

## Sync API - Question 4

### Overview

The Sync API allows Admin and placement_officer users to fetch student data from a private API, validate records, normalize values, prevent duplicates, and persist valid records to MongoDB with a comprehensive sync summary.

**Requirements Met**:
- ✅ Fetch dataset from private API
- ✅ Validate records
- ✅ Normalize values
- ✅ Reject invalid entries
- ✅ Prevent duplicate insertion
- ✅ Persist valid records into MongoDB
- ✅ Return sync summary with detailed statistics

### 1. Sync Students from Private API

**Endpoint**: `POST /api/sync/students`

**Description**: Sync student records from an external API with validation, deduplication, and MongoDB persistence

**Requirements Met**:
- ✅ Fetches data from private/external API
- ✅ Validates each record (email, names, role)
- ✅ Normalizes all values (trim, lowercase email)
- ✅ Rejects invalid entries
- ✅ Prevents duplicate insertion (by email and externalId)
- ✅ Persists valid records to MongoDB
- ✅ Returns comprehensive sync summary

**Headers Required**:
```
Authorization: Bearer <admin_or_officer_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "apiUrl": "https://your-api.com/students",
  "apiKey": "your_api_key_optional",
  "page": 1,
  "limit": 100
}
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| apiUrl | String | Yes | Full URL of the API endpoint |
| apiKey | String | No | API key if authentication is required |
| page | Number | No | Pagination page (default: 1) |
| limit | Number | No | Records per page (default: 100) |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Sync completed successfully",
  "data": {
    "syncLogId": "607f1f77bcf86cd799439099",
    "summary": {
      "total": 50,
      "synced": 45,
      "duplicates": 3,
      "invalid": 2,
      "failed": 0,
      "successRate": "90.00%"
    },
    "duration": "2345ms",
    "insertedRecords": 45,
    "errors": [
      {
        "recordIndex": 5,
        "message": "First name is required and must be at least 2 characters",
        "data": { "firstName": "", "lastName": "Doe", "email": "invalid@example.com" }
      },
      {
        "recordIndex": 12,
        "message": "Invalid email format",
        "data": { "firstName": "Jane", "lastName": "Smith", "email": "not-an-email" }
      }
    ],
    "totalErrors": 2
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Failed to fetch from API",
  "error": "Connect ECONNREFUSED 127.0.0.1:8000",
  "syncLogId": "607f1f77bcf86cd799439099"
}
```

### 2. Test Sync with Mock Data

**Endpoint**: `POST /api/sync/test`

**Description**: Test the sync functionality with mock data (no authentication required)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Test sync completed successfully",
  "data": {
    "syncLogId": "607f1f77bcf86cd799439100",
    "summary": {
      "total": 5,
      "synced": 3,
      "duplicates": 1,
      "invalid": 1,
      "failed": 0,
      "successRate": "60.00%"
    },
    "duration": "1234ms",
    "insertedRecords": 3,
    "errors": [
      {
        "recordIndex": 2,
        "message": "First name is required and must be at least 2 characters; Last name is required and must be at least 2 characters",
        "data": { "id": "ext-003", "firstName": "Invalid" }
      },
      {
        "message": "Duplicate email in same sync batch",
        "data": { "id": "ext-004", "email": "john.doe.sync@example.com" }
      }
    ],
    "note": "This is a test sync using mock data. Replace with actual API URL for production."
  }
}
```

### 3. Get Sync History

**Endpoint**: `GET /api/sync/history`

**Description**: Get history of all sync operations with pagination

**Headers Required**:
```
Authorization: Bearer <admin_or_officer_token>
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| syncType | String | students | Type of sync: `students`, `placements`, `companies` |
| page | Number | 1 | Page number for pagination |
| limit | Number | 10 | Results per page |

**Example Request**:
```bash
GET /api/sync/history?syncType=students&page=1&limit=10
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Sync history retrieved",
  "data": {
    "syncLogs": [
      {
        "id": "607f1f77bcf86cd799439099",
        "syncType": "students",
        "status": "completed",
        "sourceUrl": "https://api.example.com/students",
        "summary": {
          "total": 50,
          "synced": 45,
          "duplicates": 3,
          "invalid": 2,
          "failed": 0
        },
        "duration": "2345ms",
        "completedAt": "2026-06-03T10:45:00.000Z",
        "createdAt": "2026-06-03T10:42:30.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

### 4. Get Sync Log Details

**Endpoint**: `GET /api/sync/:id`

**Description**: Get detailed information about a specific sync operation including all errors

**Headers Required**:
```
Authorization: Bearer <admin_or_officer_token>
```

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | MongoDB SyncLog ID |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Sync log details retrieved",
  "data": {
    "id": "607f1f77bcf86cd799439099",
    "syncType": "students",
    "status": "completed",
    "sourceUrl": "https://api.example.com/students",
    "summary": {
      "total": 50,
      "synced": 45,
      "duplicates": 3,
      "invalid": 2,
      "failed": 0
    },
    "duration": "2345ms",
    "startedAt": "2026-06-03T10:42:30.000Z",
    "completedAt": "2026-06-03T10:45:00.000Z",
    "errors": [
      {
        "recordIndex": 5,
        "message": "First name is required",
        "data": { "firstName": "", "lastName": "Doe", "email": "invalid@example.com" }
      },
      {
        "recordIndex": 12,
        "message": "Invalid email format",
        "data": { "firstName": "Jane", "lastName": "Smith", "email": "not-an-email" }
      }
    ],
    "successRate": "90.00%"
  }
}
```

## Sync API - Key Features

### 1. **Data Validation** ✅
- Validates first name and last name (min 2 characters)
- Validates email format and uniqueness
- Validates role enum (Admin, placement_officer, student)
- Detailed error messages for each invalid record

### 2. **Data Normalization** ✅
- Trims whitespace from all string fields
- Converts emails to lowercase
- Standardizes role values
- Handles optional fields with defaults

### 3. **Duplicate Prevention** ✅
- Checks for duplicate emails in database
- Checks for duplicate externalId (original API ID)
- Prevents duplicate insertion during sync
- Increments duplicate counter in summary

### 4. **Error Handling** ✅
- Catches API connection errors
- Logs validation errors with record index
- Tracks failed insertions
- Returns detailed error array

### 5. **Comprehensive Audit Trail** ✅
- Creates SyncLog entry for each operation
- Tracks total, synced, duplicate, invalid, and failed counts
- Records sync duration in milliseconds
- Stores first 10 errors by default
- Calculates success rate percentage

### 6. **Role-Based Access** ✅
- Only Admin and placement_officer can sync data
- Protected endpoints require JWT authentication
- Test endpoint available for demonstration

### Expected API Data Format

The private API should return an array or object with data array:

```json
[
  {
    "id": "ext-001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "OptionalPassword",
    "role": "student"
  },
  {
    "id": "ext-002",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "role": "placement_officer"
  }
]
```

Or wrapped in data property:

```json
{
  "data": [
    { ... },
    { ... }
  ]
}
```

### Sync Workflow

1. **Fetch** - Retrieve data from external API
2. **Validate** - Check each record against schema rules
3. **Normalize** - Standardize data format and values
4. **Deduplicate** - Check for existing emails/externalIds
5. **Persist** - Save valid records to MongoDB
6. **Report** - Return detailed sync summary with statistics

## Database Schema

### SyncLog Schema
```javascript
{
  syncType: String (enum: students, placements, companies),
  status: String (enum: pending, in_progress, completed, failed),
  sourceUrl: String,
  summary: {
    total: Number,
    synced: Number,
    duplicates: Number,
    invalid: Number,
    failed: Number
  },
  errors: Array,
  startedAt: Date,
  completedAt: Date,
  duration: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Database Schema

### User Schema
```javascript
{
  firstName: String (required, min 2 chars),
  lastName: String (required, min 2 chars),
  email: String (required, unique, lowercase),
  password: String (required, hashed, not returned),
  role: String (enum: Admin, placement_officer, student),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## Project Structure

```
placement-recruitment-system/
├── config/
│   └── database.js           # MongoDB connection
├── models/
│   └── User.js               # User schema with password hashing
├── controllers/
│   └── authController.js     # Auth logic (register, login)
├── routes/
│   └── auth.js               # Auth routes
├── middleware/
│   └── errorHandler.js       # Error handling
├── utils/
│   └── validators.js         # Input validation functions
├── index.js                  # Server entry point
├── package.json              # Dependencies
├── .env.example              # Environment template
├── .gitignore                # Git ignore file
└── README.md                 # This file
```

## Testing the API

### Using cURL

**Register**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "Candidate"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Using Postman

1. Create a new request
2. Select POST method
3. Enter URL: `http://localhost:5000/api/auth/register`
4. Go to Body → raw → select JSON
5. Paste the request JSON
6. Click Send

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| MONGODB_URI | mongodb://localhost:27017/placement-recruitment | MongoDB connection string |
| JWT_SECRET | - | Secret key for JWT signing (set strong value in production) |
| NODE_ENV | development | Environment mode |

## Next Steps

- [ ] Implement middleware for JWT authentication
- [ ] Add role-based authorization middleware
- [ ] Create protected routes for different roles
- [ ] Implement password reset functionality
- [ ] Add email verification
- [ ] Implement refresh tokens
- [ ] Add rate limiting
- [ ] Create comprehensive tests

## Security Best Practices

1. **Always use HTTPS** in production
2. **Use strong JWT_SECRET** - at least 32 characters
3. **Never commit .env** file to version control
4. **Validate all inputs** on both client and server
5. **Use CORS** appropriately for production domains
6. **Implement rate limiting** for registration endpoint
7. **Add email verification** for new accounts
8. **Use secure session management** with refresh tokens

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env file
- Verify MongoDB is accessible on localhost:27017

### Password Hash Not Working
- Ensure bcryptjs is installed: `npm install bcryptjs`
- Check that pre-save middleware is properly configured

### Duplicate Email Error
- Clear existing users from database
- Verify email unique index: `db.users.getIndexes()`

## License

ISC
