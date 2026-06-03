# Quick Start Guide - Register API

## Prerequisites
- Node.js installed
- MongoDB running on localhost:27017

## Setup (Already Done)
✅ Project created and dependencies installed

## Run the Server

```bash
# Navigate to project directory
cd "c:\Users\mitulanand\Downloads\PCP FA"

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on **http://localhost:5000**

## Test Register API

### Using cURL

**1. Register a Student:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**2. Register a Placement Officer:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "password": "OfficerPass123",
    "role": "placement_officer"
  }'
```

**3. Try Duplicate Email (Should fail):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Another",
    "lastName": "User",
    "email": "john@example.com",
    "password": "AnotherPass123"
  }'
```

Expected: 409 Conflict - Email already registered

**4. Try Weak Password (Should fail):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "weak"
  }'
```

Expected: 400 Bad Request - Password validation error

## Test Login API

### Using cURL

**1. Login with Valid Credentials:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**2. Login with Wrong Password (Should fail):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword123"
  }'
```

Expected: 401 Unauthorized - Invalid credentials

**3. Login with Non-existent Email (Should fail):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "SecurePass123"
  }'
```

Expected: 401 Unauthorized - Invalid credentials

## Test Current User API (Protected Routes)

### Current User Profile (Any Authenticated User)

**1. Get Current User Profile:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

Expected: 200 OK - Returns authenticated user details

### Get All Users (Admin & Placement Officer Only)

**2. Get All Users with Pagination:**
```bash
curl -X GET "http://localhost:5000/api/auth/users?page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_OR_OFFICER_TOKEN"
```

**3. Filter Users by Role:**
```bash
curl -X GET "http://localhost:5000/api/auth/users?role=student&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_OR_OFFICER_TOKEN"
```

**4. Search Users by Name or Email:**
```bash
curl -X GET "http://localhost:5000/api/auth/users?search=john" \
  -H "Authorization: Bearer ADMIN_OR_OFFICER_TOKEN"
```

Expected: 200 OK - Returns list of users with pagination info

### Get Specific User by ID (Admin & Placement Officer Only)

**5. Get User by ID:**
```bash
curl -X GET http://localhost:5000/api/auth/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer ADMIN_OR_OFFICER_TOKEN"
```

Expected: 200 OK - Returns specific user details

**6. Get User - Access Denied (Student Role):**
```bash
curl -X GET http://localhost:5000/api/auth/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

Expected: 403 Forbidden - Insufficient permissions

**7. Get User - Invalid ID:**
```bash
curl -X GET http://localhost:5000/api/auth/users/invalid-id \
  -H "Authorization: Bearer ADMIN_OR_OFFICER_TOKEN"
```

Expected: 400 Bad Request - Invalid user ID format

### Using Postman

1. Import **Placement_Recruitment_API.postman_collection.json** in Postman
2. Use pre-built requests to test all scenarios
3. Set {{token}} for student requests
4. Set {{admin_token}} for admin/officer requests

## Register API Requirements - Status

| Requirement | Status | Details |
|------------|--------|---------|
| New register user | ✅ | POST /api/auth/register |
| Password hashing (mandatory) | ✅ | bcryptjs with 10 salt rounds |
| Duplicate email prevention | ✅ | MongoDB unique index + validation |
| Store role | ✅ | Enum: Admin, Recruiter, Candidate |
| Input validation | ✅ | Email format, password strength, name length |
| JWT token | ✅ | Generated and returned on success |

## Response Examples

### Success (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "Candidate"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Duplicate Email (409)
```json
{
  "success": false,
  "message": "Email already registered",
  "error": "DUPLICATE_EMAIL"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Password should contain uppercase, lowercase, and numbers"
  ]
}
```

## File Structure Quick Reference

```
project/
├── index.js                      # Server entry point
├── config/database.js            # MongoDB connection
├── models/User.js                # User schema + password hashing
├── controllers/authController.js # Register/Login logic
├── routes/auth.js                # Route definitions
├── utils/validators.js           # Validation functions
└── middleware/errorHandler.js    # Error handling
```

## Database - User Document Example

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "$2a$10$...[hashed password]...",
  "role": "Candidate",
  "isActive": true,
  "createdAt": "2026-06-03T10:30:00.000Z",
  "updatedAt": "2026-06-03T10:30:00.000Z"
}
```

## Troubleshooting

**MongoDB Connection Failed:**
- Make sure MongoDB is running: `mongod`
- Check MONGODB_URI in .env

**Email unique index error after restart:**
- MongoDB auto-handles unique indexes, no manual action needed
- If issues persist, drop the collection and restart

**Password not hashing:**
- Pre-save middleware should automatically hash
- Check bcryptjs installation: `npm list bcryptjs`

## Next Features to Implement
1. JWT middleware for protected routes
2. Role-based authorization
3. Password reset functionality
4. Email verification
5. Refresh tokens
6. Rate limiting
