# Notification Flows

## 1. User Registration -> Welcome Email

- **Event**: `auth.register.success`
- **Action**: Send "Welcome to OneVault" email.

## 2. New Device Login -> Security Alert

- **Event**: `auth.login.new_device`
- **Action**:
  - Send Push to _existing_ devices: "New login on iPhone 12".
  - Send Email: "Did you just login?".

## 3. Vault Share -> Access Notification

- **Event**: `vault.shared`
- **Action**:
  - Send Push to _Recipient_: "John shared 'Bank Login' with you.".
  - Store unread notification in DB.

## 4. Emergency Access Request -> High Priority Alert

- **Event**: `emergency.access_requested`
- **Action**:
  - Send Push (High Priority) to User.
  - Send Email to User and other Trusted Contacts.
