# Dravya API Integration Guide

This document is intended for frontend and future mobile developers integrating with the Dravya Backend.

## 1. Base URL
All API requests must be prefixed with the correct base URL.
- **Local Development:** `http://localhost:8000/api`
- **Production:** `https://api.dravya.in/api`

## 2. Authentication Flow
The API uses stateless JWT authentication.
1. Authenticate via `POST /api/auth/login`.
2. Extract the `token` from the response `data`.
3. Include the token in the `Authorization` header of all protected requests:
   ```http
   Authorization: Bearer <your_jwt_token>
   ```

To test if your token is valid or fetch current user details, use `GET /api/auth/me`.

## 3. Standard Response Format
Every endpoint returns a consistent JSON object indicating success or failure.

### Success Response (HTTP 200/201)
```json
{
  "success": true,
  "message": "A human-readable success message.",
  "data": {
    "key": "value"
  }
}
```

### Error Response (HTTP 400/401/403/404/500)
```json
{
  "success": false,
  "message": "A human-readable error describing what went wrong.",
  "errors": {
    "field": ["Validation error detail"]
  }
}
```
*Note: The `errors` field is optional and usually only present for HTTP 400 Validation Errors.*

## 4. Standard Error Codes
- **400 Bad Request:** Missing fields, invalid data format, or business logic violations.
- **401 Unauthorized:** Missing or invalid JWT token.
- **403 Forbidden:** The user does not have the required role or does not own the requested resource.
- **404 Not Found:** The requested resource (ID) does not exist.
- **409 Conflict:** The resource already exists (e.g. email during registration).
- **429 Too Many Requests:** Rate limit exceeded.
- **500 Internal Server Error:** An unexpected server error. (Stack traces are hidden in production).

## 5. Pagination
Endpoints returning lists of data (e.g., Batches, Notifications, Users) support pagination via query parameters:
- `?page=1` (default: 1)
- `?limit=10` (default: 10, max: 50)

The response data will include a standard `pagination` block:
```json
{
  "success": true,
  "message": "Items retrieved successfully.",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 125,
      "totalPages": 13
    }
  }
}
```

## 6. Date & Time Format
All timestamps are returned as ISO-8601 UTC strings.
Example: `2026-08-10T12:30:00.000Z`
Frontend clients should parse these and convert them to the user's local timezone.

## 7. Role Handling
A user's role dictates their permissions. Ensure you only render UI components relevant to the user's role (returned in the login response or `/api/auth/me`).
Available Roles: `PRODUCER`, `VERIFICATION_AUTHORITY`, `LAB`, `DISTRIBUTOR`, `ADMIN`.

## 8. Dashboard APIs
Instead of making multiple requests to aggregate data on the frontend, each role has a dedicated dashboard endpoint that returns aggregated summary counts (e.g., `GET /api/producers/me/dashboard`). Always use these endpoints for summary screens.

## 9. QR Public Verification
The public QR verification endpoint `GET /api/public/verify/:code` is the ONLY endpoint that does not require an Authorization header (other than login/register/health). It is rate-limited more strictly (50 requests/15m) to prevent scraping.
