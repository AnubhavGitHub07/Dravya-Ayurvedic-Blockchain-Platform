# Notifications & Alerts System

The Dravya Notifications system is an in-app, database-backed notification engine designed to alert users of important state changes across the supply chain.

## Architecture

Notifications are managed via:
1. **Database Schema**: A `Notification` model in Prisma with unique constraints on `(userId, eventKey)` to prevent duplicates.
2. **NotificationService**: A central service (`src/services/notification.service.ts`) for creating notifications.
3. **API Controllers**: `NotificationController` exposes endpoints for retrieving, reading, and clearing notifications.

## Key Features

- **Idempotency**: Uses an `eventKey` to ensure duplicate notifications are not created for the same event.
- **In-App Only**: No external push, email, or SMS integration.
- **Role-Based Deliveries**: Notifications are strictly tied to the relevant user's ID via `req.user.id` or related entity lookups.
- **Pagination**: Read/unread endpoints support `page` and `limit` queries.
- **Status Management**: Supports "Mark as Read", "Mark All as Read", "Delete", and "Clear All".

## Workflows Integrated

- **Producer Verification**: Submitted, Approved, Rejected.
- **Lot Inspection**: Requested, Approved, Rejected.
- **Lab Testing**: Assigned (to Lab), Sample Received, Started, Completed, Passed/Failed.
- **Distributor & Supply Chain**: Assigned (to Distributor), Received, Dispatched, Delivered.
- **Blockchain**: Anchor Confirmed, Anchor Failed, Integrity Alert.
- **Public QR**: QR Generated, QR Revoked.

## Endpoints

- `GET /api/notifications` (Fetch paginated)
- `GET /api/notifications/unread-count` (Get count of unread notifications)
- `PATCH /api/notifications/:id/read` (Mark specific notification as read)
- `PATCH /api/notifications/read-all` (Mark all as read)
- `DELETE /api/notifications/:id` (Delete a notification)
- `DELETE /api/notifications` (Clear all notifications for the user)
