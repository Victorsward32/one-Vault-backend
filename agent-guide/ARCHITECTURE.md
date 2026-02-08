# 📘 OneVault Backend – FULL SYSTEM SPEC (AGENT SOURCE OF TRUTH)

> [!IMPORTANT]
> **CRITICAL INSTRUCTIONS FOR AI AGENT**
> This file MUST be stored in: `onevault-backend/agent-guide/ARCHITECTURE.md`
>
> - ❌ DO NOT place markdown files inside `src/`
> - ❌ DO NOT invent features
> - ❌ DO NOT skip endpoints
> - ❌ DO NOT simplify flows
> - ✅ Generate ALL modules + ALL routes at once
> - ✅ Code must be production-ready, readable, refactor-friendly

---

## 1️⃣ WHAT IS ONEVAULT (NO ASSUMPTIONS)

OneVault is a secure digital locker system inspired by DigiLocker, but:

- **Personal + Family scoped**
- **Emergency-access aware**
- **Strong authentication (JWT + PIN)**
- **Audit-friendly**
- **Designed for mobile apps**

### Core Use Cases

- Store personal documents
- Share access with family members
- Define emergency access rules
- Secure everything behind PIN + JWT
- Track ownership and permissions

---

## 2️⃣ TECH STACK (FIXED)

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase-hosted or self-hosted)
- **ORM:** Prisma
- **Auth:** JWT (Access + Refresh Tokens) + PIN-based verification
- **Supporting Libraries:**
  - `@nestjs/config` – environment management
  - `@nestjs/jwt` – JWT handling
  - `passport`, `passport-jwt`
  - `bcrypt` – password & PIN hashing
  - `class-validator`, `class-transformer`
  - `prisma`
  - `winston` OR `pino` – structured logging
  - `chalk` – colored console logs (**IMPORTANT**)
  - `helmet`, `cors`, `dotenv`

---

## 3️⃣ GLOBAL BACKEND RULES

### Security

- All sensitive fields hashed
- PIN never stored in plain text
- Refresh tokens stored hashed
- Role & ownership checks everywhere

### Engineering

- **SOLID Principles:** SRP, OCP, LSP, ISP, DIP
- **DRY:** No duplicate logic; shared utilities for responses, logging, errors
- **KISS:** Simple logic, readable code, debug-friendly
- One controller = one domain
- One service = one responsibility
- No business logic in controllers
- No fat services

---

## 4️⃣ FOLDER ARCHITECTURE (APPROVED)

```text
src/
├── app.module.ts
├── main.ts
├── config/
│   ├── env.config.ts
│   ├── prisma.config.ts
│   └── jwt.config.ts
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── logger/
│   └── utils/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── family/
│   ├── vault/
│   ├── documents/
│   └── emergency/
└── prisma/
    ├── schema.prisma
    └── migrations/
```

### Module Structure

Each module MUST follow:

```text
module-name/
├── dto/
├── entities/
├── module-name.controller.ts
├── module-name.service.ts
├── module-name.module.ts
```

---

## 5️⃣ COMPLETE API CONTRACT (65+ ENDPOINTS)

### 🔐 AUTH MODULE (12 APIs)

_Purpose: identity, session, security_

- `POST   /auth/register`
- `POST   /auth/login`
- `POST   /auth/logout`
- `POST   /auth/refresh-token`
- `POST   /auth/verify-pin`
- `POST   /auth/set-pin`
- `POST   /auth/reset-pin`
- `POST   /auth/forgot-password`
- `POST   /auth/reset-password`
- `GET    /auth/me`
- `GET    /auth/sessions`
- `DELETE /auth/sessions/:id`

### 👤 USERS MODULE (6 APIs)

_Purpose: profile & preferences_

- `GET    /users/profile`
- `PATCH  /users/profile`
- `PATCH  /users/email`
- `PATCH  /users/mobile`
- `PATCH  /users/preferences`
- `DELETE /users/account`

### 🔐 SECURITY MODULE (5 APIs)

_Purpose: secondary protection & device trust_

- `POST   /security/pin/verify`
- `POST   /security/device/register`
- `GET    /security/devices`
- `DELETE /security/devices/:id`
- `GET    /security/activity`

### 👨‍👩‍👧 FAMILY MODULE (8 APIs)

_Purpose: family graph & relationships_

- `POST   /family/invite`
- `POST   /family/accept`
- `GET    /family`
- `GET    /family/:id`
- `PATCH  /family/:id`
- `DELETE /family/:id`
- `GET    /family/:id/permissions`
- `PATCH  /family/:id/permissions`

### 🛂 ROLES & PERMISSIONS MODULE (5 APIs)

_Purpose: fine-grained access_

- `GET    /roles`
- `POST   /roles`
- `PATCH  /roles/:id`
- `DELETE /roles/:id`
- `GET    /permissions`

### 🗄️ VAULT MODULE (8 APIs)

_Purpose: logical vault entries (NO FILES)_

- `POST   /vault`
- `GET    /vault`
- `GET    /vault/:id`
- `PATCH  /vault/:id`
- `DELETE /vault/:id`
- `POST   /vault/:id/share`
- `GET    /vault/:id/access`
- `DELETE /vault/:id/access/:userId`

### 🗂️ VAULT CATEGORIES MODULE (4 APIs)

- `POST   /vault-categories`
- `GET    /vault-categories`
- `PATCH  /vault-categories/:id`
- `DELETE /vault-categories/:id`

### 📄 DOCUMENTS MODULE (7 APIs)

_Purpose: document metadata (NOT storage logic)_

- `POST   /documents`
- `GET    /documents`
- `GET    /documents/:id`
- `PATCH  /documents/:id`
- `DELETE /documents/:id`
- `GET    /documents/:id/access`
- `POST   /documents/:id/share`

### 🧾 DOCUMENT VERSIONING (4 APIs)

- `POST   /documents/:id/version`
- `GET    /documents/:id/versions`
- `GET    /documents/versions/:versionId`
- `DELETE /documents/versions/:versionId`

### 🚨 EMERGENCY MODULE (5 APIs)

_Purpose: emergency contacts & rules_

- `POST   /emergency/profile`
- `GET    /emergency/profile`
- `POST   /emergency/contacts`
- `GET    /emergency/contacts`
- `POST   /emergency/request-access`

### 🔔 NOTIFICATIONS MODULE (3 APIs)

- `GET    /notifications`
- `PATCH  /notifications/:id/read`
- `DELETE /notifications/:id`

### 📜 AUDIT LOGS MODULE (3 APIs)

- `GET    /audit`
- `GET    /audit/:id`
- `GET    /audit/user/:userId`

### ⚙️ SYSTEM MODULE (4 APIs)

- `GET    /health`
- `GET    /metrics`
- `GET    /config`
- `POST   /feedback`

**✅ TOTAL API COUNT: ~68 REST APIs**

---

## 6️⃣ DATABASE DESIGN RULES (FOR PRISMA)

- UUID primary keys
- Soft deletes where applicable
- Strong foreign keys
- Ownership enforced at DB + service layer
- **Entities include:** User, Session, Device, FamilyMember, Role, Permission, Vault, VaultAccess, Document, DocumentVersion, EmergencyProfile, EmergencyContact, AuditLog, Notification.

---

## 7️⃣ STORAGE (INTENTION ONLY)

> [!WARNING]
> **DO NOT IMPLEMENT S3**
> Only create: `StorageService` interface, `StorageProvider` abstraction, and Method signatures ONLY.

---

## 8️⃣ LOGGING & DEBUGGING (MANDATORY)

- Use colored logs (chalk)
- 🟢 Success, 🔵 Info, 🟡 Warning, 🔴 Error
- Each request logs: `requestId`, `userId`, `module`, `action`
- Errors must be structured

---

## 9️⃣ AGENT FINAL DIRECTIVE

You are a Principal Backend Engineer. Generate the entire backend in one pass, clean, readable, test-ready. This code will be reviewed by humans.

🚀 **Final Goal:**
When backend generation finishes, `npm install` and `npm run start:dev` must work. App should boot, Prisma should connect, and all routes should be registered.

🏁 **END OF SPEC**
