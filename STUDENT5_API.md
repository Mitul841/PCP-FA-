# Student 5 API Documentation

## Student 5 Details
Student 5 has been successfully added to your system with the following information:

- **Name**: Question Five
- **Student ID**: 5
- **Email**: student5@university.edu
- **Department**: Computer Science
- **CGPA**: 8.5
- **Skills**: JavaScript, React, Node.js, MongoDB, Python
- **Graduation Year**: 2024
- **Phone**: 9876543210
- **Status**: active

---

## API Endpoints

### Get All Students
**Endpoint**: `GET /api/auth/students`

**Query Parameters**:
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 10): Number of students per page
- `search` (optional): Search by name, email, or student ID
- `department` (optional): Filter by department

**Example Request**:
```bash
curl "https://yourdomain.vercel.app/api/auth/students"
curl "https://yourdomain.vercel.app/api/auth/students?search=5"
```

**Response**:
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "students": [
      {
        "id": "6a1fad4c36e19c02638258a7",
        "firstName": "Question",
        "lastName": "Five",
        "email": "student5@university.edu",
        "studentId": "5",
        "department": "Computer Science",
        "cgpa": 8.5,
        "skills": ["JavaScript", "React", "Node.js", "MongoDB", "Python"],
        "graduationYear": 2024,
        "phone": "9876543210",
        "status": "active",
        "createdAt": "2026-06-03T04:27:57.005Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### Get Student by ID (Student ID: 5)
**Endpoint**: `GET /api/auth/students/:id`

**URL Parameters**:
- `id`: Student ID (e.g., "5") or MongoDB ID

**Example Requests**:
```bash
# By Student ID
curl "https://yourdomain.vercel.app/api/auth/students/5"

# By MongoDB ID
curl "https://yourdomain.vercel.app/api/auth/students/6a1fad4c36e19c02638258a7"
```

**Response**:
```json
{
  "success": true,
  "message": "Student details retrieved",
  "data": {
    "student": {
      "id": "6a1fad4c36e19c02638258a7",
      "firstName": "Question",
      "lastName": "Five",
      "email": "student5@university.edu",
      "studentId": "5",
      "department": "Computer Science",
      "cgpa": 8.5,
      "skills": ["JavaScript", "React", "Node.js", "MongoDB", "Python"],
      "graduationYear": 2024,
      "phone": "9876543210",
      "status": "active",
      "createdAt": "2026-06-03T04:27:57.005Z",
      "updatedAt": "2026-06-03T04:27:57.005Z"
    }
  }
}
```

---

## Deployment on Vercel

### Backend Deployment

1. **Push your code to GitHub** if not already done
2. **Go to [vercel.com](https://vercel.com)** and sign in
3. **Import your project**:
   - Click "New Project"
   - Select your GitHub repository
   - Set the root directory to the project folder (not `frontend/`)
   - Click "Deploy"

4. **Set Environment Variables** in Vercel project settings:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://pcp-fa-rhfz.vercel.app`)

### Frontend Deployment

1. The frontend is already configured in the `frontend/` folder
2. **Create a separate Vercel project for the frontend**:
   - Import your GitHub repository
   - Set root directory to `frontend/`
   - Set environment variable `VITE_API_BASE_URL` to your backend API URL

---

## Testing Locally

To test the endpoints locally before deploying:

```bash
# Start the backend server
npm run dev

# In another terminal, test the API
curl "http://localhost:5000/api/auth/students"
curl "http://localhost:5000/api/auth/students/5"
```

---

## Frontend Integration

The frontend can now display student 5 data. Example usage in React:

```javascript
import api from './services/api';

// Get all students
const response = await api.get('/auth/students');
console.log(response.data.data.students);

// Get specific student (Student 5)
const studentResponse = await api.get('/auth/students/5');
console.log(studentResponse.data.data.student);
```

---

## Additional Notes

- All student endpoints are public (no authentication required)
- Protected endpoints like adding students require Admin or Placement Officer role
- Passwords are hashed and never returned in API responses
- CGPA range: 0-10
- Phone must be a valid 10-digit number
