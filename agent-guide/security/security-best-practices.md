# Security Best Practices

## General

- **Secrets Management**: All API keys, secrets, and sensitive configs are stored in `.env` and never committed.
- **Input Validation**: All DTOs are validated using `class-validator`.
- **Authentication**: JWT Access and Refresh tokens are required for all protected routes.
- **Authorization**: Role-based access control (RBAC) and resource ownership checks are enforced.

## Storage Security

- **Cloudinary**: We use `secure_url` (HTTPS) for all assets.
- **Optimization**: Cloudinary automatically strips metadata (EXIF) from images for privacy.

## Notification Security

- **Keys**: Firebase Admin SDK keys are loaded from environment variables.
- **Rate Limiting**: Notification endpoints should be rate-limited to prevent spam.
- **Content**: No sensitive PII (Passwords, PINs) is ever sent in the notification body.

## Logging

- **Sanitization**: Logs must never contain passwords, tokens, or full PII.
- **Structure**: Logs are JSON-structured (or clear text in dev) for easy parsing by observability tools.
