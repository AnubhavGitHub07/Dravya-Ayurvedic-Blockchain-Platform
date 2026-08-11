# Dravya API Reference

## Authentication

### `POST /api/auth/register`
- **Auth Required:** No
- **Roles:** Anyone (Allowed roles to register: `PRODUCER`, `LAB`, `DISTRIBUTOR`)
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "StrongPassword123!",
    "role": "PRODUCER",
    "phone": "+919876543210",
    "organization": "Farm Co."
  }
  ```
- **Response:** Success message with User object and JWT Token.

### `POST /api/auth/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response:** User object and JWT Token.

### `GET /api/auth/me`
- **Auth Required:** Yes
- **Response:** The authenticated User's profile.

---

## Producer

### `GET /api/producers/me`
- **Auth Required:** Yes
- **Roles:** `PRODUCER`
- **Response:** The logged-in producer's full profile.

### `POST /api/producers/me` (or PUT)
- **Auth Required:** Yes
- **Roles:** `PRODUCER`
- **Request Body:** Farm and location details (see Zod schema).
- **Response:** Updated producer profile.

### `GET /api/producers/me/dashboard`
- **Auth Required:** Yes
- **Roles:** `PRODUCER`
- **Response:** Aggregated totals of batches by status and recent batches.

### `GET /api/producers/me/verification-status`
- **Auth Required:** Yes
- **Roles:** `PRODUCER`
- **Response:** Current government verification status.

---

## Batches

### `POST /api/batches`
- **Auth Required:** Yes
- **Roles:** `PRODUCER`
- **Request Body:**
  ```json
  {
    "herbId": "<uuid>",
    "farmLocation": "Nashik",
    "quantity": 100,
    "unit": "kg",
    "harvestDate": "2026-08-10T00:00:00Z",
    "cultivationMethod": "ORGANIC"
  }
  ```
- **Response:** Newly created DRAFT batch.

### `GET /api/batches`
- **Auth Required:** Yes
- **Roles:** `PRODUCER`, `ADMIN` (Producers only see their own batches)
- **Query Params:** `page`, `limit`, `status`
- **Response:** Paginated list of batches.

### `GET /api/batches/:id`
- **Auth Required:** Yes
- **Roles:** Any authenticated (Producers only see their own)
- **Response:** Full batch details.

### `PATCH /api/batches/:id`
- **Auth Required:** Yes
- **Roles:** `PRODUCER`
- **Request Body:** Partial batch updates (only allowed in DRAFT status).
- **Response:** Updated batch.

### `POST /api/batches/:id/submit`
- **Auth Required:** Yes
- **Roles:** `PRODUCER`
- **Response:** Changes batch status from DRAFT to PENDING_VERIFICATION.

### `GET /api/batches/:id/supply-chain`
- **Auth Required:** Yes
- **Response:** Full supply chain event timeline for the batch.

### `GET /api/producers/me/batches/:id/quality`
- **Auth Required:** Yes
- **Roles:** `PRODUCER`
- **Response:** Aggregated Lab Test and Inspection statuses.

---

## Verification & Inspections (Authorities)

### `GET /api/authority/verifications`
- **Auth Required:** Yes
- **Roles:** `VERIFICATION_AUTHORITY`
- **Response:** List of assigned producer verifications.

### `GET /api/authority/inspections`
- **Auth Required:** Yes
- **Roles:** `VERIFICATION_AUTHORITY`
- **Response:** List of assigned batch lot inspections.

*(There are also corresponding `approve` and `reject` POST endpoints for both verifications and inspections, accepting decisions and reasons).*

---

## Laboratories

### `GET /api/lab/dashboard`
- **Auth Required:** Yes
- **Roles:** `LAB`
- **Response:** Aggregated test counts and recent assignments.

### `GET /api/lab/tests`
- **Auth Required:** Yes
- **Roles:** `LAB`
- **Response:** List of assigned quality tests.

### `POST /api/lab/tests/:id/receive`
- **Auth Required:** Yes
- **Roles:** `LAB`
- **Response:** Acknowledges receipt of the physical batch sample.

### `POST /api/lab/tests/:id/start`
- **Auth Required:** Yes
- **Roles:** `LAB`
- **Response:** Marks test as UNDER_TESTING.

### `POST /api/lab/tests/:id/results`
- **Auth Required:** Yes
- **Roles:** `LAB`
- **Request Body:** Parameter testing results.

### `POST /api/lab/tests/:id/complete`
- **Auth Required:** Yes
- **Roles:** `LAB`
- **Response:** Completes testing and auto-calculates PASS/FAIL.

### `POST /api/lab/tests/:id/reports/generate`
- **Auth Required:** Yes
- **Roles:** `LAB`
- **Response:** Creates a draft lab report with a PDF/Document link.

### `POST /api/lab/reports/:id/finalize`
- **Auth Required:** Yes
- **Roles:** `LAB`
- **Response:** Anchors report to Blockchain and finalizes it.

---

## Distributors

### `GET /api/distributor/dashboard`
- **Auth Required:** Yes
- **Roles:** `DISTRIBUTOR`
- **Response:** Supply chain stats and recent assignments.

### `POST /api/distributor/receive/:batchId`
- **Auth Required:** Yes
- **Roles:** `DISTRIBUTOR`
- **Response:** Acknowledges receipt of batch from producer.

### `POST /api/distributor/dispatch/:batchId`
- **Auth Required:** Yes
- **Roles:** `DISTRIBUTOR`
- **Response:** Dispatches the batch to its next destination.

---

## Public & Traceability

### `GET /api/public/verify/:code`
- **Auth Required:** No
- **Response:** Consumer-safe traceability data spanning origin, lab tests, and supply chain journey. 
- **Rate Limit:** 50 requests per 15 minutes.

---

## Notifications

### `GET /api/notifications`
- **Auth Required:** Yes
- **Query Params:** `page`, `limit`
- **Response:** Paginated user notifications.

### `GET /api/notifications/unread-count`
- **Auth Required:** Yes
- **Response:** Count of unread notifications.

### `PATCH /api/notifications/:id/read`
- **Auth Required:** Yes
- **Response:** Marks a single notification as read.

### `PATCH /api/notifications/read-all`
- **Auth Required:** Yes
- **Response:** Marks all notifications as read.
