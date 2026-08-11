# Security & Audit Guidelines

## 1. Audit Logging

The Dravya backend uses a centralized `AuditService` to log important business and security events without breaking the core business flows.

### 1.1 Philosophy
- **Append-only:** Audit logs are never deleted or updated.
- **Fail-safe:** If an audit log insertion fails, it logs an error to the console but DOES NOT throw an exception that would halt the ongoing business transaction. This ensures reliability of the core API.
- **No Secrets:** Audit logs MUST NOT contain passwords, JWTs, private keys, or any other sensitive secrets.
- **Structured Data:** Metadata and state changes are stored as JSON for easy querying.

### 1.2 Audit Actions
Common audit actions include:
- `USER_REGISTERED`, `USER_LOGIN_SUCCESS`, `USER_LOGIN_FAILED`
- `PRODUCER_VERIFICATION_REQUESTED`, `PRODUCER_VERIFICATION_APPROVED`, `PRODUCER_VERIFICATION_REJECTED`
- `BATCH_CREATED`, `INSPECTION_REQUESTED`, `LAB_TEST_ASSIGNED`, `LAB_TEST_COMPLETED`
- `DISTRIBUTOR_ASSIGNED`, `BATCH_RECEIVED`, `BATCH_DISPATCHED`, `BATCH_DELIVERED`
- `BLOCKCHAIN_ANCHORED`, `QR_GENERATED`, `QR_REVOKED`

### 1.3 Usage
To record a state change:
```typescript
import { AuditService } from '../services/audit.service';

await AuditService.recordStateChange({
  action: 'BATCH_STATUS_UPDATED',
  actorId: req.user.id,
  entityType: 'Batch',
  entityId: batch.id,
  oldState: { status: 'DRAFT' },
  newState: { status: 'PENDING_VERIFICATION' }
});
```

## 2. API Security Headers & Config

- **Helmet:** Used to enforce secure HTTP headers globally (HSTS, NoSniff, X-Frame-Options).
- **CORS:** Strictly configured using `CORS_ORIGINS` environment variables.
- **Rate Limiting:**
  - Global limiter: 100 requests per 15 minutes.
  - Auth limiter: 20 requests per hour on `/auth/login` and `/auth/register`.
  - Public limiter: 50 requests per 15 minutes on public verification endpoints to prevent scraping.
- **Payload Limits:** JSON payload limits are restricted to `1mb` to prevent DOS attacks.

## 3. Global Error Handling
The application uses a centralized global error handler.
- **Production Mode:** Stack traces are stripped before sending the response to the client.
- **Internal Server Errors:** Logged using `console.error` (which can be piped to external logging tools).

## 4. Input Hardening
All writes (POST/PUT/PATCH) use Zod schemas for validation. The validators ensure that no extra fields can be mass-assigned (e.g., trying to set `role="ADMIN"` on registration).
