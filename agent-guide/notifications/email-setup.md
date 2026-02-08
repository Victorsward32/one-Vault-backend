# Email Setup Guide (SMTP)

OneVault uses `nodemailer` which supports almost any SMTP provider (AWS SES, SendGrid, Gmail, Mailgun, etc.).

## 1. Gmail (Development Only)

- Go to Google Account > Security.
- Enable 2FA.
- Create an **App Password**.
- Use that password in `SMTP_PASS`.

## 2. AWS SES / SendGrid (Production)

- Obtain SMTP Credientials from your provider dashboard.

## 3. Environment Variables

Update your `.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="OneVault <no-reply@onevault.com>"
```

## 4. Templates

Templates are stored in `src/modules/notifications/email/templates`.
They use **Handlebars** (`.hbs`) syntax.

**Example**: `welcome.hbs`

```html
<h1>Welcome, {{name}}!</h1>
<p>Your vault is ready.</p>
```
