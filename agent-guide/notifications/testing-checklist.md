# Testing Checklist

- [ ] **Environment**: `.env` has valid Firebase and SMTP credentials.
- [ ] **Dependencies**: `npm install` run successfully.
- [ ] **Database**: `npx prisma db push` run after schema update.
- [ ] **Email Test**:
  - Run `POST /notifications/test` with body `{"channel": "EMAIL", "target": "your@email.com"}`.
  - Verify email received.
- [ ] **Push Test**:
  - Register a dummy FCM token via `POST /security/device/register`.
  - Run `POST /notifications/test` with body `{"channel": "PUSH", "target": "device-uuid"}`.
  - Verify fake success response (or real if using real device).
- [ ] **Logs**: Check `GET /notifications/logs` to ensure audit trail is created.
