# Firebase Setup Guide

## Prerequisites

- A Firebase Project (Console: https://console.firebase.google.com/)
- Admin Access

## Steps

1. **Generate Private Key**:
   - Go to **Project Settings** > **Service Accounts**.
   - Click **Generate New Private Key**.
   - Download the JSON file.

2. **Environment Configuration**:
   - Do NOT commit the JSON file.
   - Extract values and set in `.env`:

```bash
FIREBASE_PROJECT_ID=onevault-123
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@onevault-123.iam.gserviceaccount.com
# For the key, replace newlines with \n if strictly needed, or use a quoted string
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv..."
```

3. **Client-Side (Mobile)**:
   - Ensure the mobile app registers the FCM token.
   - Send this token to backend via `POST /security/device/register`.

## Debugging

- If you see `error:0909006C:PEM routines:get_name:no start line`, check how `FIREBASE_PRIVATE_KEY` is formatted in `.env`. accessing newline characters correctly is crucial.
