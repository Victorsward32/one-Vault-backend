# Email (SMTP) Architecture

## Overview

Transactional emails are sent using SMTP via `nodemailer`. We use a shared provider pattern to allow easy switching of SMTP services (e.g., from Gmail to AWS SES).

## Architecture

```
src/shared/providers/email/
├── email.provider.ts   # Nodemailer wrapper
├── email.module.ts     # NestJS Module
└── templates/          # Handlebars (.hbs) HTML templates
```

## Templates

Templates are stored as `.hbs` files. We use `handlebars` to inject dynamic context (e.g., `{{name}}`) into the HTML before sending.

## Data Flow

1. **Trigger**: Event `auth.welcome`.
2. **Service**: `NotificationsService` calls `EmailProvider.sendEmail()`.
3. **Provider**:
   - Reads `.hbs` template from disk.
   - Compiles with context.
   - Sends via SMTP.
4. **Logging**: Message ID is logged to `NotificationLog`.

## Configuration

- `SMTP_SECURE`: Controls TLS/SSL usage.
- `SMTP_HOST`: The mail server address.
