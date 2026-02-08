# OneVault Notifications Architecture

## Overview

The Notifications module is a dedicated, decoupled system responsible for delivering outbound messages to users via Push (FCM) and Email. It follows a service-oriented architecture where channels (Push, Email) are isolated providers.

## Tech Stack

- **Framework**: NestJS
- **Push**: Firebase Admin SDK (FCM)
- **Email**: Nodemailer + Handlebars (Templates)
- **DB**: Prisma (PostgreSQL)
- **Logging**: Chalk (Structured, Color-coded)

## Directory Structure

```
src/modules/notifications/
├── notifications.module.ts       # Module definition & imports
├── notifications.controller.ts   # Restricted API endpoints
├── notifications.service.ts      # Orchestrator service
├── push/
│   ├── fcm.service.ts            # Firebase logic
│   └── fcm.interface.ts          # Payload definitions
├── email/
│   ├── email.service.ts          # SMTP logic
│   └── templates/                # HTML templates
├── dto/                          # Validation DTOs
└── enums/                        # NotificationType, etc.
```

## Data Flow

1. **Trigger**: Event (e.g., "User Login") or API Call (`POST /send`).
2. **Orchestrator**: `NotificationsService` receives the request.
3. **Persist**: Saves record to `Notification` table (in-app view).
4. **Dispatch**:
   - Finds User's FCM tokens.
   - Calls `FcmService` for Push.
   - Calls `EmailService` for Email.
5. **Log**: Updates `NotificationLog` with success/failure and provider-specific response ID.

## Resilience

- **Fail-safe**: Failure in one channel does not block the other.
- **Async**: Sending is awaited but handled gracefully to prevent request blocking.
- **Retry**: Basic retry logic implemented in services.

## Security

- **Endpoints**: Protected by `JwtAuthGuard`.
- **Keys**: Firebase credentials and SMTP secrets stored in ENV only.
