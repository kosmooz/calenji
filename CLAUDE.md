# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Calenji** is a social media management platform (SaaS) built with NestJS API + Next.js 14 frontend + PostgreSQL. It allows users to connect Instagram/Facebook accounts, compose posts and stories, schedule them on a visual calendar with drag & drop, and publish via the Meta Graph API. It also includes authentication (with email 2FA in production), user management, and an admin dashboard. All UI text is in **French**.

**GitHub:** https://github.com/kosmooz/calenji

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

### Cloudflare Tunnel (HTTPS for Meta API & OAuth)
Meta Graph API requires public HTTPS URLs to fetch uploaded media, and OAuth redirects need HTTPS. Use **Cloudflare quick tunnel** on the **frontend port (3005)** — Next.js proxies `/api/*` to the API automatically, so one tunnel covers everything.

```bash
# 4. Start Cloudflare tunnel (run_in_background: true)
cloudflared tunnel --url http://localhost:3005
```

After the tunnel starts, read its output to get the generated URL (e.g. `https://xxx-yyy-zzz.trycloudflare.com`), then update `api/.env`:
- `PUBLIC_URL=<tunnel-url>`
- `META_REDIRECT_URI=<tunnel-url>/dashboard/reseaux/callback`

The tunnel URL changes every time `cloudflared` restarts — always update both `.env` values and the **Meta Developers console** (Valid OAuth Redirect URIs) with the new URL.

**Startup sequence summary:**
1. `docker-compose up -d postgres`
2. Kill ports 3004/3005
3. Start API (`npm run start:dev`) + Web (`npm run dev`) in background
4. Start `cloudflared tunnel --url http://localhost:3005` in background
5. Read tunnel output, update `PUBLIC_URL` and `META_REDIRECT_URI` in `api/.env`

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
├── assets/       Reference projects (calenji landing, social-media-poster)
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

| Module | Purpose |
|--------|---------|
| `auth/` | Registration, login, 2FA, JWT refresh tokens, password reset, email verification, profile, addresses |
| `admin/` | Dashboard stats, user CRUD, shop settings, SMTP test — all `@Roles(Role.ADMIN)` |
| `users/` | Simple `findByEmail` / `findById` service |
| `mail/` | Nodemailer with dynamic SMTP config from ShopSettings (cached 60s) |
| `upload/` | Multer file uploads (images/videos/docs) to `./uploads/` — images 10MB, videos 50MB |
| `prisma/` | Global PrismaService |
| `social-auth/` | Meta OAuth flow, connect/disconnect IG/FB accounts, `MetaApiService` for Graph API calls |
| `posts/` | CRUD for posts (feed, reels, carousels). `POST /validate` endpoint for real-time frontend validation |
| `stories/` | CRUD for stories (single image/video). Duplicate endpoint with optional scheduledAt |
| `calendar/` | Aggregated calendar view (posts + stories), drag & drop reschedule with past-date validation |
| `publisher/` | `PublisherService` (cron polling), `PublisherWorkerService` (IG/FB publish flows), `MediaValidationService` (platform constraints) |
| `media-host/` | Public URL generation for local uploads (needed by Meta API) |
| `crypto/` | AES encryption for social account tokens at rest |

### Database (Prisma + PostgreSQL)

**Models:** `User`, `RefreshToken`, `AuthLog`, `Address`, `ShopSettings`, `ShopImage`, `SocialAccount`, `Post`, `PostMedia`, `PostAccount`, `Story`, `StoryMedia`, `StoryAccount`, `PublishLog`

**Enums:** `Role` (USER, ADMIN), `AddressType` (BILLING, SHIPPING), `SocialPlatform` (INSTAGRAM, FACEBOOK), `PostStatus` (DRAFT, SCHEDULED, PUBLISHING, PUBLISHED, FAILED), `ContentType` (FEED, REEL, STORY, CAROUSEL), `MediaType` (IMAGE, VIDEO)

Schema at `api/prisma/schema.prisma`.

### Frontend structure (web/src/)

**Lib:**
- `lib/api.ts` — fetch wrapper with in-memory access token + auto-refresh on 401
- `lib/auth.tsx` — AuthContext provider (login, register, logout, refreshUser)

**Components:**
- `components/AuthDialog.tsx` — modal with 4 views: login, register, forgot-password, 2FA code
- `components/admin/AdminGuard.tsx` — redirects non-ADMIN users
- `components/admin/AdminSidebar.tsx` — 3 links: Dashboard, Utilisateurs, Réglages
- `components/dashboard/DashboardSidebar.tsx` — user sidebar: Calendrier, Publications, Réseaux sociaux, Profil, etc.
- `components/ui/` — shadcn/ui components (Button, Card, Input, Label, Badge, Dialog, etc.)

**Composer components** (`components/composer/`):
- `PostComposer.tsx` — full post composer (caption, media, platforms, schedule, content type). Supports `editId`, `onSaved`, `initialScheduledAt` props for popup editing
- `StoryComposer.tsx` — story composer (single media, platforms, schedule). Same edit/popup props. Includes client-side dimension validation (portrait 9:16, min 500px width)
- `PostDetailDialog.tsx` / `StoryDetailDialog.tsx` — detail popups with status, media preview, actions (edit, publish, delete)
- `MediaUploadZone.tsx` — drag & drop file upload zone
- `MediaGrid.tsx` — multi-image grid display
- `PlatformSelector.tsx` — social account picker
- `SchedulePicker.tsx` — draft/schedule toggle with datetime picker and presets. Syncs mode via useEffect when value changes externally
- `PostPreview.tsx` / `StoryPreview.tsx` — platform-specific previews (IG/FB)

**Calendar components** (`components/calendar/`):
- `CalendarView.tsx` — main calendar container with month/week/day views, drag & drop rescheduling, cell click context menu (create post/story with pre-filled date), drop context menu (move/duplicate/cancel), post & story detail/edit dialogs, drafts sections
- `CalendarMonthView.tsx` / `CalendarWeekView.tsx` / `CalendarDayView.tsx` — view-specific layouts with `onCellClick` prop
- `CalendarItemChip.tsx` — draggable item chip with `data-calendar-item` attribute (prevents cell click conflict)
- `CalendarNavigation.tsx` / `CalendarViewToggle.tsx` — navigation controls

**Social components** (`components/social/`):
- `SocialAccountCard.tsx` — account card with connect/disconnect
- `AccountFilter.tsx` — filter by account
- `PublishStatusBadge.tsx` — status badge (draft, scheduled, published, failed)

**Pages:**
- `app/admin/` — admin pages (dashboard, users CRUD, settings with tabs)
- `app/dashboard/calendrier/` — calendar page with "+ Créer" dropdown (Publication/Story)
- `app/dashboard/publications/` — publications list with "+ Créer" dropdown
- `app/dashboard/nouvelle-publication/` — standalone post composer page
- `app/dashboard/nouvelle-story/` — standalone story composer page
- `app/dashboard/reseaux/` — social accounts management + OAuth callback
- `app/dashboard/` — profile view, edit profile, change password
- `app/(public)/` — landing page, blog, pricing, contact, legal pages

## Key Patterns

### Authentication flow
- **Dev** (`NODE_ENV=development`): 2FA skipped, tokens issued immediately on login
- **Prod**: login sends 6-digit code via email → user calls `/auth/verify-login-code`
- Access token: 15min JWT in memory (never localStorage). Refresh token: 30-day, SHA256-hashed in DB, httpOnly cookie
- Token rotation: each refresh issues new pair, reuse detection revokes all tokens
- Frontend `apiFetch()` auto-retries on 401 after silent refresh

### Social account management
- Meta OAuth: user clicks "Connect" → redirect to Facebook OAuth → callback saves access token (AES-encrypted) + IG business account ID
- Accounts stored in `SocialAccount` with platform, accessToken (encrypted), pageId, igUserId, etc.
- Token refresh handled before publish

### Post/Story publishing pipeline
- Posts & stories start as DRAFT or SCHEDULED
- `PublisherService` runs a cron job, picks SCHEDULED items where `scheduledAt <= now`
- `PublisherWorkerService` handles platform-specific flows:
  - **Instagram feed/carousel**: create container → poll status (10s intervals, 5min max) → publish with retry on error 9007 (30min max)
  - **Instagram reels**: same flow with `media_type=REELS` + optional `cover_url`
  - **Instagram stories**: container with `media_type=STORIES`
  - **Facebook feed**: direct post via `/{pageId}/photos` or `/{pageId}/videos`
  - **Facebook reels**: 3-phase upload (start → transfer file_url → finish) + polling
  - **Facebook stories**: separate endpoints for photo (`/photo_stories`) and video (`/video_stories`, 3-phase)
  - Carousel items use `is_carousel_item: true`
- `PublishLog` records every attempt with platform response

### Media validation (MediaValidationService)
Centralized platform-specific validation called in `posts.service.ts`, `stories.service.ts`, and exposed via `POST /api/posts/validate`:

| Constraint | Instagram | Facebook |
|---|---|---|
| Image formats | JPEG, PNG | JPEG, PNG, BMP, GIF, TIFF |
| Video formats | MP4 | MP4, MOV |
| Media required (post) | Yes | No |
| Carousel items | 2–10 | — |
| Video+image mix | OK | Forbidden |
| Max caption | 2200 | 63206 |
| Max hashtags | 30 | — |

Frontend StoryComposer also validates media dimensions client-side (portrait 9:16, min width 500px).

### Calendar drag & drop
- Items are draggable via `CalendarItemChip` with `data-calendar-item` attribute
- Drop shows a context menu: Déplacer / Dupliquer / Annuler
- "Dupliquer ici" preserves the original item's time, only changes the day
- Past dates are blocked (frontend toast + backend BadRequestException)
- Same-cell drops are ignored (no-op)

### Soft deletes
Users have a `deleted` boolean flag. Soft-deleted users have all refresh tokens revoked. Admin can restore.

### SMTP from database
Mail config lives in `ShopSettings` (not .env). The `MailService` caches SMTP config for 60s and rebuilds the transporter when config fingerprint changes. Admin can test SMTP from the settings page.

### Confirmation dialogs
Never use native `confirm()` / `alert()`. Always use the `ConfirmDialog` component (`components/ui/confirm-dialog.tsx`) for destructive actions (delete, etc.). Use `variant="danger"` with a red button for deletions. The component supports a `loading` state for async operations.

### Validation
All DTOs use `class-validator`. Global ValidationPipe with `whitelist: true` and `forbidNonWhitelisted: true` strips/rejects unknown fields. Past dates are rejected for scheduling (both create and update).

### Rate limiting
Global ThrottlerGuard: 30 requests per 60 seconds. Login and verify-login-code have tighter limits: 5 per 60 seconds.

### File uploads
Stored in `api/uploads/`, served at `/api/uploads/`. UUID filenames. MIME validation: images (10MB max), videos (50MB), docs (20MB).

## Roles
Only two roles: `USER` and `ADMIN`. All admin endpoints require `@Roles(Role.ADMIN)`. No other role-based access patterns.
