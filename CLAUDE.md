# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Social-app is a full-stack platform with NestJS API + Next.js 14 frontend + PostgreSQL, built from a stripped-down version of a larger e-commerce project. It provides authentication (with email 2FA in production), user management, and an admin dashboard. All UI text is in **French**.

## Development Commands

### Prerequisites
- Docker running (for PostgreSQL on port 5434)
- Node.js 20+

### Start services
When the user asks to start/restart the servers, run **all 3 steps** from the project root (`social-app/`):

```bash
# 1. Start PostgreSQL (idempotent)
docker-compose up -d postgres

# 2. Kill any existing processes on ports 3004/3005 before starting
# (prevents EADDRINUSE errors from previous sessions)
# On Windows (Git Bash):
for port in 3004 3005; do pid=$(netstat -ano 2>/dev/null | grep ":$port " | grep LISTENING | awk '{print $5}' | head -1); [ -n "$pid" ] && taskkill //F //PID "$pid" 2>/dev/null; done; true

# 3. Start API and Web in background (use run_in_background for both)
cd api && npm run start:dev   # API on port 3004
cd web && npm run dev         # Web on port 3005
```

**Important for Claude Code:**
- Always kill ports 3004 and 3005 before starting API/Web to avoid EADDRINUSE errors
- Run API and Web with `run_in_background: true` so they don't block the conversation
- Wait a few seconds then check the background task output to confirm startup succeeded
- The app is ready when both servers are running at http://localhost:3005

### Database
```bash
cd api
npx prisma migrate dev          # Run migrations
npx prisma db seed              # Seed admin user (admin@social-app.com / changeme12345)
npx prisma generate             # Regenerate Prisma client after schema changes
npx prisma studio               # Open Prisma GUI
```

### Build
```bash
cd api && npm run build          # NestJS build
cd web && npm run build          # Next.js standalone build
```

### Docker (full stack)
```bash
docker-compose up --build        # Dev: postgres + api(3003) + web(3004) + nginx(8080)
docker-compose -f docker-compose.prod.yml up --build  # Prod: with SSL/certbot
```

## Architecture

### Monorepo layout
```
social-app/
├── api/          NestJS 10 backend (port 3004 local, 3001 in Docker)
├── web/          Next.js 14 App Router frontend (port 3005 local, 3000 in Docker)
├── nginx/        Reverse proxy: /api/* → api, /* → web
└── docker-compose.yml
```

### Port mapping (local dev vs Docker)

| Service    | Local dev | Docker internal | Docker exposed |
|------------|-----------|-----------------|----------------|
| PostgreSQL | 5434      | 5432            | 5434           |
| API        | 3004      | 3001            | 3003           |
| Web        | 3005      | 3000            | 3004           |
| Nginx      | —         | 80              | 8080           |

The Next.js dev proxy (`next.config.mjs` rewrites) forwards `/api/*` to `http://localhost:3004` in development.

### Backend modules (api/src/)

| Module   | Purpose |
|----------|---------|
| `auth/`  | Registration, login, 2FA, JWT refresh tokens, password reset, email verification, profile, addresses |
| `admin/` | Dashboard stats, user CRUD, shop settings, SMTP test — all `@Roles(Role.ADMIN)` |
| `users/` | Simple `findByEmail` / `findById` service |
| `mail/`  | Nodemailer with dynamic SMTP config from ShopSettings (cached 60s) |
| `upload/`| Multer file uploads (images/videos/docs) to `./uploads/` |
| `prisma/`| Global PrismaService |

### Database (Prisma + PostgreSQL)

6 models: `User`, `RefreshToken`, `AuthLog`, `Address`, `ShopSettings`, `ShopImage`
2 enums: `Role` (USER, ADMIN), `AddressType` (BILLING, SHIPPING)

Schema at `api/prisma/schema.prisma`.

### Frontend structure (web/src/)

- `lib/api.ts` — fetch wrapper with in-memory access token + auto-refresh on 401
- `lib/auth.tsx` — AuthContext provider (login, register, logout, refreshUser)
- `components/AuthDialog.tsx` — modal with 4 views: login, register, forgot-password, 2FA code
- `components/admin/AdminGuard.tsx` — redirects non-ADMIN users
- `components/admin/AdminSidebar.tsx` — 3 links: Dashboard, Utilisateurs, Réglages
- `components/ui/` — shadcn/ui components (Button, Card, Input, Label, Badge, etc.)
- `app/admin/` — admin pages (dashboard, users CRUD, settings with tabs)
- `app/dashboard/` — user pages (profile view, edit profile, change password)

## Key Patterns

### Authentication flow
- **Dev** (`NODE_ENV=development`): 2FA skipped, tokens issued immediately on login
- **Prod**: login sends 6-digit code via email → user calls `/auth/verify-login-code`
- Access token: 15min JWT in memory (never localStorage). Refresh token: 30-day, SHA256-hashed in DB, httpOnly cookie
- Token rotation: each refresh issues new pair, reuse detection revokes all tokens
- Frontend `apiFetch()` auto-retries on 401 after silent refresh

### Soft deletes
Users have a `deleted` boolean flag. Soft-deleted users have all refresh tokens revoked. Admin can restore.

### SMTP from database
Mail config lives in `ShopSettings` (not .env). The `MailService` caches SMTP config for 60s and rebuilds the transporter when config fingerprint changes. Admin can test SMTP from the settings page.

### Validation
All DTOs use `class-validator`. Global ValidationPipe with `whitelist: true` and `forbidNonWhitelisted: true` strips/rejects unknown fields.

### Rate limiting
Global ThrottlerGuard: 30 requests per 60 seconds. Login and verify-login-code have tighter limits: 5 per 60 seconds.

### File uploads
Stored in `api/uploads/`, served at `/api/uploads/`. UUID filenames. MIME validation: images (5MB), videos (50MB), docs (20MB).

## Roles
Only two roles: `USER` and `ADMIN`. All admin endpoints require `@Roles(Role.ADMIN)`. No other role-based access patterns.
