# Google OAuth Setup

## Overview

The app uses NextAuth.js (beta) with Google OAuth for authentication. All routes except `/login` are protected by middleware.

**Scopes requested:** `openid`, `email`, `profile`, `calendar.events`

## Auth Flow

1. User visits protected page → middleware redirects to `/login`
2. User clicks "Sign in with Google" → redirects to Google consent screen
3. Google redirects back with auth code → NextAuth exchanges for tokens
4. JWT session created (httpOnly cookie, 7-day expiry)
5. Access token auto-refreshes when expired (1 hour lifetime)

## Setup: Google Cloud Console

### 1. Create Project

- Go to https://console.cloud.google.com
- Create new project (e.g., "Events Gallery")
- Enable **Google Calendar API** (APIs & Services > Library)

### 2. OAuth Consent Screen

- APIs & Services > OAuth consent screen
- Type: **External**
- App name: `Events Gallery`
- Add scopes: `openid`, `email`, `profile`, `calendar.events`
- Add test users if in testing mode

### 3. Create Credentials

- APIs & Services > Credentials > Create > OAuth client ID
- Type: **Web application**
- Authorized redirect URIs:
  - Local: `http://localhost:3000/api/auth/callback/google`
  - Production: `https://eventig.app/api/auth/callback/google`
- Save the **Client ID** and **Client Secret**

### 4. Configure Environment

In `/home/vscode/projects/Frontend/.env.local`:

```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://eventig.app    # or http://localhost:3000 for dev
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | NextAuth config (Google provider, JWT callbacks, token refresh) |
| `src/middleware.ts` | Route protection (checks session, redirects to /login) |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth API handlers |
| `src/app/login/page.tsx` | Login page with Google sign-in button |
| `src/components/auth/google-signin-button.tsx` | Sign-in button component |
| `src/components/auth/user-menu.tsx` | User avatar + sign-out dropdown |
| `src/components/providers/session-provider.tsx` | NextAuth SessionProvider wrapper |

## Session Details

- **Strategy:** JWT (stateless)
- **Duration:** 7 days
- **Token refresh:** Automatic when access token expires
- **Storage:** httpOnly cookies

## Calendar API (Future)

The `calendar.events` scope is pre-configured. To add events to Google Calendar:

```typescript
const { data: session } = useSession();

await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${session.accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    summary: 'Event Name',
    start: { dateTime: '2026-03-01T10:00:00' },
    end: { dateTime: '2026-03-01T11:00:00' },
  }),
});
```

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `OAuth client was not found` (401) | Propagation delay | Wait 15-30 min after creating credentials |
| `redirect_uri_mismatch` | URI doesn't match exactly | Check trailing slashes, http vs https, full path |
| `GOOGLE_CLIENT_ID undefined` | Missing `.env.local` | Verify file exists and has correct values |
| Pages not protected | Middleware not loaded | `rm -rf .next && npm run build` |
