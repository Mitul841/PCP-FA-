# Sync API Quick Start Guide

## Testing the Sync API

### 1. Test Sync with Mock Data (No Authentication Required)

Start with a simple test to verify the sync system is working:

```bash
curl -X POST http://localhost:5000/api/sync/test \
  -H "Content-Type: application/json"
```

**Expected Output**:
- 5 total records
- 3 synced successfully
- 1 duplicate (email already exists)
- 1 invalid (missing required field)

### 2. Login as Admin to Get Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123"
  }'
```

Save the returned `token` for use in subsequent requests.

### 3. Sync from Real Private API

```bash
curl -X POST http://localhost:5000/api/sync/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "apiUrl": "https://your-api.com/students",
    "apiKey": "optional_api_key",
    "page": 1,
    "limit": 100
  }'
```

### 4. View Sync History

```bash
curl -X GET "http://localhost:5000/api/sync/history?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 5. Get Specific Sync Details

```bash
curl -X GET http://localhost:5000/api/sync/607f1f77bcf86cd799439099 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

Replace `607f1f77bcf86cd799439099` with the actual syncLogId from your sync response.

---

## Sync API Requirements - Status

| Requirement | Status | Details |
|------------|--------|---------|
| Fetch dataset from private API | ✅ | Axios-based HTTP client with timeout |
| Validate records | ✅ | Email, names, role validation |
| Normalize values | ✅ | Trim, lowercase, standardize format |
| Reject invalid entries | ✅ | Detailed error tracking |
| Prevent duplicate insertion | ✅ | Email and externalId checks |
| Persist valid records | ✅ | MongoDB User model |
| Return sync summary | ✅ | Statistics with success rate |

---

## Example: Complete Sync Workflow

### Step 1: Register Admin User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "AdminPass123",
    "role": "Admin"
  }'
```

Save the token from response.

### Step 2: Test Sync with Mock Data

```bash
curl -X POST http://localhost:5000/api/sync/test \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "success": true,
  "message": "Test sync completed successfully",
  "data": {
    "syncLogId": "...",
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
    "errors": [...]
  }
}
```

### Step 3: View Sync History

```bash
curl -X GET "http://localhost:5000/api/sync/history?syncType=students" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Step 4: Get Detailed Sync Report

```bash
curl -X GET http://localhost:5000/api/sync/SYNC_LOG_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Using Postman

1. Create new request collection for Sync
2. Set environment variables:
   - `{{BASE_URL}}` = http://localhost:5000
   - `{{admin_token}}` = (from login response)

3. Create requests:
   - **POST** {{BASE_URL}}/api/sync/test
   - **POST** {{BASE_URL}}/api/sync/students
     - Headers: Authorization: Bearer {{admin_token}}
     - Body: { "apiUrl": "..." }
   - **GET** {{BASE_URL}}/api/sync/history
     - Headers: Authorization: Bearer {{admin_token}}

---

## Troubleshooting

### API Connection Failed

**Error**: "Failed to fetch from API: Connect ECONNREFUSED"

**Solutions**:
- Verify API URL is correct and accessible
- Check if API server is running
- Verify firewall/network settings
- Test URL in browser first

### No Records Synced

**Cause**: All records might be duplicates or invalid

**Check**:
- View errors in sync response
- Verify API data format matches expected schema
- Run test sync to compare

### Validation Errors

**Common Issues**:
- Email already exists (check duplicates count)
- Missing required fields (firstName, lastName, email)
- Invalid email format
- Role not in enum list

---

## Production Deployment

When deploying to Render:

1. Set `FRONTEND_URL` environment variable to your Vercel URL
2. Ensure API URL in sync requests is accessible from Render
3. Store API keys securely in environment variables
4. Enable rate limiting for sync endpoint
5. Monitor sync job durations
6. Set up alerts for failed syncs

---

## Next Steps

- [ ] Implement scheduled sync jobs (cron)
- [ ] Add retry mechanism for failed records
- [ ] Implement bulk update functionality
- [ ] Add data transformation rules
- [ ] Create sync webhook notifications
- [ ] Implement data reconciliation
