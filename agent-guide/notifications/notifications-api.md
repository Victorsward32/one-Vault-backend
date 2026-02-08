# Notifications API Contract

All endpoints are prefixed with `/notifications`.
**Auth Required**: Bearer Token (JWT).

## 1. Send Push Notification

**POST** `/notifications/push/send`

**Body**:

```json
{
  "userId": "uuid",
  "title": "Security Alert",
  "body": "New login detected.",
  "data": { "screen": "SecuritySettings" }
}
```

## 2. Send Email Notification

**POST** `/notifications/email/send`

**Body**:

```json
{
  "to": "user@example.com",
  "subject": "Welcome to OneVault",
  "template": "welcome",
  "context": { "name": "John" }
}
```

## 3. Get User Notifications

**GET** `/notifications/user`

**Query**: `?page=1&limit=20`

**Response**:

```json
[
  {
    "id": "uuid",
    "title": "Login Alert",
    "isRead": false,
    "createdAt": "2023-10-27T10:00:00Z"
  }
]
```

## 4. Get Notification Logs (Audit)

**GET** `/notifications/logs`

**Response**:

```json
[
  {
    "id": "uuid",
    "channel": "PUSH",
    "status": "SENT",
    "providerResponse": "projects/onevault/messages/..."
  }
]
```

## 5. Test Integration

**POST** `/notifications/test`

**Body**:

```json
{
  "channel": "EMAIL", // or "PUSH"
  "target": "user@test.com"
}
```
