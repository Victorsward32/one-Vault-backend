# Firebase Push Architecture

## Overview

We use Firebase Cloud Messaging (FCM) to send push notifications to user devices (iOS/Android/Web). We rely on `firebase-admin` SDK for backend operations.

## Architecture

```
src/modules/notifications/push/
├── fcm.service.ts      # Direct wrapper around admin.messaging()
```

## Data Flow

1. **Device Registration**: When a user logs in on a mobile device, the app implements `POST /security/device/register` with the FCM Token.
2. **Notification Trigger**:
   - Application Event (e.g., `vault.shared`)
   - `NotificationsService` listener catches event.
3. **Dispatch**:
   - Service looks up `Device` table for `userId`.
   - Calls `FcmService.sendToDevice(token, ...)`.
4. **Logging**: Result is logged to `NotificationLog` table.

## Key Decisions

- **Topic Messaging**: Supported but currently we focus on direct device messaging for security and privacy.
- **Failures**: Invalid tokens are automatically cleaned up (TODO: Implement explicit cleanup job).

## Security

- `FIREBASE_PRIVATE_KEY` is loaded from ENV and never hardcoded.
- We utilize `admin.credential.cert()` for authentication with Google.
