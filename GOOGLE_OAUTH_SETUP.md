# Google OAuth Implementation - Complete Setup & Testing Guide

## Overview

This guide provides comprehensive instructions for setting up and testing Google OAuth authentication with Calendar API integration for the Events Gallery application.

## What Was Implemented

✅ **Google OAuth Login** - Complete authentication system with NextAuth.js  
✅ **Persistent Tokens** - Access and refresh tokens stored for long-term access  
✅ **App Protection** - Middleware protects all routes except login  
✅ **User Management** - Sign in, sign out, user profile display  
✅ **Calendar Scope** - Pre-configured with `calendar.events` scope for future use  
✅ **Automatic Token Refresh** - Refreshes expired tokens automatically  

## File Structure Created

```
src/
├── app/
│   ├── (protected)/              # Protected route group
│   │   ├── layout.tsx           # Layout with user menu header
│   │   ├── page.tsx             # Events gallery (moved here)
│   │   └── status/
│   │       └── page.tsx         # Status page (moved here)
│   ├── api/auth/
│   │   └── [...nextauth]/
│   │       └── route.ts         # NextAuth API handlers
│   └── login/
│       └── page.tsx             # Custom login page
├── components/
│   ├── auth/
│   │   ├── google-signin-button.tsx  # Sign in button
│   │   └── user-menu.tsx              # User avatar + sign out
│   └── providers/
│       └── session-provider.tsx         # Session context provider
├── lib/
│   └── auth.ts                 # NextAuth configuration
└── middleware.ts               # Route protection
```

---

## Part 1: Local Development Testing (Recommended First Step)

Google OAuth **SUPPORTS localhost for development and testing**. This is the fastest way to verify your implementation works.

### Step 1: Create Google Cloud Project

**1.1 Access Google Cloud Console**
- URL: https://console.cloud.google.com
- Sign in with your Google account

**1.2 Create New Project**
- Click project selector (top-left dropdown)
- Click "New Project"
- Fill in:
  - **Project name:** `Events Gallery Test`
  - **Location:** No organization (or select if applicable)
- Click "Create"
- Wait 30-60 seconds for project to be created
- Select the new project from the dropdown

**1.3 Enable Google Calendar API**
- Navigate to: **APIs & Services** → **Library** (left sidebar)
- Search for: "Google Calendar API"
- Click on "Google Calendar API"
- Click blue "Enable" button
- Wait for confirmation

### Step 2: Configure OAuth Consent Screen

**2.1 Create Consent Screen**
- Navigate to: **APIs & Services** → **OAuth consent screen**
- Choose: **External** (for testing/development)
- Click "Create"

**2.2 Fill Required Fields**
- **App name:** `Events Gallery`
- **User support email:** your email address
- **Developer contact email:** your email address
- Click "Save and Continue" (through all subsequent screens)

**2.3 Add Scopes (CRITICAL!)**
In the "Scopes" section:
- Click "Add/Remove Scopes"
- Add these scopes (comma-separated or individually):
  - `openid` - for user ID
  - `email` - for user email
  - `profile` - for user name and avatar
  - `https://www.googleapis.com/auth/calendar.events` - for adding events to calendar
- Click "Add"
- Click "Save and Continue"

**2.4 Add Test Users (Optional but Recommended)**
In the "Test users" section:
- Click "+ Add users"
- Add your test email addresses (e.g., for testing with others)
- Click "Add"
- Click "Save and Continue" (through all remaining sections)

### Step 3: Create OAuth Client ID for Local Testing

**3.1 Create Credentials**
- Navigate to: **APIs & Services** → **Credentials**
- Click "+ Create Credentials" → **OAuth client ID**

**3.2 Configure Client**
- **Application type:** **Web application**
- **Name:** `Events Gallery Local`

**3.3 Add Authorized Redirect URIs**
Click "Add URI" at the bottom and add:
```
http://localhost:3000/api/auth/callback/google
```

⚠️ **IMPORTANT:**
- No trailing `/` at the end
- Must include `/api/auth/callback/google` path
- Must be exactly `http://localhost:3000` (not `https://` for local)

**3.4 Create and Save Credentials**
- Click "Create"
- **SAVE THESE CREDENTIALS IMMEDIATELY:**
  - **Client ID** (starts with numbers, ends with `.apps.googleusercontent.com`)
  - **Client Secret** (random string of characters, starts with `GOCSPX-`)
- Copy both values and save them securely (Notepad, text file, etc.)

⚠️ **NOTE:** Google usually only shows the Client Secret once. If you close the page, you won't see it again and will need to create new credentials.

### Step 4: Configure Environment Variables

**4.1 Create `.env.local` File**
In the `/home/vscode/projects/Frontend/` directory, create a file named `.env.local`:

**Using terminal:**
```bash
cd /home/vscode/projects/Frontend
nano .env.local
# or
vim .env.local
# or
code .env.local
```

**4.2 Add Configuration**
Copy and paste the following content, replacing with your actual credentials:

```env
# Copy from Google Cloud Console - Step 3.4
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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45pqr678

# NextAuth Configuration
NEXTAUTH_SECRET=djJ8ePbCwol2U0aM3CaR47YEo60fpcCmOnFIPK4opiI=
NEXTAUTH_URL=http://localhost:3000

# Optional: Session configuration
NEXTAUTH_SESSION_MAX_AGE=604800
```

**4.3 Save File**
- Nano: `Ctrl+O`, `Enter`, `Ctrl+X`
- Vim: `:wq`, `Enter`

**4.4 Verify File Contents**
```bash
cat /home/vscode/projects/Frontend/.env.local
```
Should show your actual Client ID and Secret, not placeholder values.

### Step 5: Start Development Server

**5.1 Stop Any Existing Server**
```bash
# If server is running, stop it:
# Press Ctrl+C in the terminal where `npm run dev` is running
```

**5.2 Clear Next.js Cache (Optional but Recommended)**
```bash
cd /home/vscode/projects/Frontend
rm -rf .next
```

**5.3 Start Server**
```bash
cd /home/vscode/projects/Frontend
npm run dev
```

**5.4 Verify Server Started**
Terminal should show:
```
✓ Ready in XXXms
- Local:         http://localhost:3000
- Network:       http://46.225.61.27:3000
```

### Step 6: Test OAuth Flow

**6.1 Open Application**
- Browser: `http://localhost:3000`

**6.2 Expected Initial Behavior**
- ✅ Automatic redirect to: `http://localhost:3000/login`
- ✅ Login page displays with "Sign in with Google" button

**6.3 Start Google Sign-In**
1. Click the "Sign in with Google" button
2. Browser redirects to Google OAuth page
3. Select your Google account
4. **OAuth Consent Screen appears** showing:
   - "Events Gallery would like to:"
   - "Sign in with your Google account"
   - "See your email addresses and profile information"
   - "Add events to your primary calendar"
5. Click "Continue" or "Allow"

**6.4 Verify Success**
- ✅ Redirect back to: `http://localhost:3000`
- ✅ Events Gallery displays
- ✅ Your name and avatar appear in the top-right header
- ✅ No errors in browser console (F12 → Console tab)

**6.5 Test Session Persistence**
1. Refresh the page (F5 or Ctrl+R)
2. Verify you stay logged in
3. Close and reopen browser
4. Verify session persists (for 7 days by default)

---

## Part 2: Production Setup (For Deployed Application)

When ready to deploy to production with real users:

### Step 1: Purchase Domain

Google OAuth **REQUIRES a domain name** with a top-level domain (.com, .org, .net, etc.). IP addresses are **NOT supported**.

**Recommended Providers:**
- Namecheap (~$10/year)
- GoDaddy (~$12/year)
- Strato (~€12/year)
- Netcup (~€8/year)
- 1&1 Ionos (~€10/year)

**Domain Suggestions:**
- `events-gallery.de`
- `events-calendar.net`
- `my-events-app.com`

### Step 2: Configure DNS

**2.1 Add A-Record**
- Login to your domain provider
- Navigate to "DNS Management" or "DNS Settings"
- Add A-Record:
  - Type: `A`
  - Host/Name: `@` (for root domain) or `www`
  - Value: `46.225.61.27` (your server IP)
  - TTL: `3600` (default)

**2.3 Wait for DNS Propagation**
DNS changes typically take 5-60 minutes to propagate worldwide.

**2.3 Verify DNS**
```bash
ping yourdomain.com
# Should resolve to 46.225.61.27
```

### Step 3: Update Google Cloud Console

**3.1 Update OAuth Client ID**
- Navigate to: Google Cloud Console → Credentials
- Edit your OAuth Client ID
- Update **Authorized redirect URIs:**
  ```
  https://yourdomain.com/api/auth/callback/google
  ```
- Save

**3.2 Update Environment Variables**
On your server:
```bash
nano /home/vscode/projects/Frontend/.env.local
```

Update:
```env
NEXTAUTH_URL=https://yourdomain.com
```

**3.3 Restart Server**
```bash
npm run dev
# or for production:
npm run build
npm start
```

---

## How It Works

### Authentication Flow

1. **User clicks "Sign in with Google"** button
2. **Redirects to Google OAuth consent screen**
3. **User grants permissions** (including calendar access)
4. **Google redirects back** with authorization code
5. **NextAuth exchanges code** for access + refresh tokens
6. **Session created** with user info and tokens
7. **User redirected** to protected pages

### Token Management

- **Access Token:**
  - Valid for 1 hour
  - Used for Google Calendar API calls
  - Automatically refreshed when expired

- **Refresh Token:**
  - Long-lived token
  - Used to obtain new access tokens
  - Stored securely in JWT

- **Automatic Refresh:**
  - NextAuth checks token expiration
  - Automatically requests new access token when needed
  - No user intervention required

- **Persistent Sessions:**
  - Tokens stored in JWT cookies
  - Configurable session duration (default: 7 days)

### Route Protection

- **Middleware** intercepts all requests
- **Authentication check** on every protected route
- **Unauthenticated users:** Redirected to `/login`
- **Authenticated users:** Allowed access to protected pages
- **Public routes:** `/login` stays accessible

---

## Troubleshooting

### Error 1: "OAuth client was not found" (Error 401)

**Cause:**
- Google hasn't activated the OAuth Client yet
- Requires 15-30 minutes for propagation

**Solution:**
1. Wait 15-30 minutes after creating OAuth Client ID
2. Then retry authentication flow

### Error 2: "redirect_uri_mismatch"

**Cause:**
- Redirect URI in Google Cloud Console doesn't match exactly
- Typo in URI
- Missing `/api/auth/callback/google` path

**Solution:**
1. Check browser console (F12 → Network tab → request details)
2. Compare `redirect_uri` parameter with Google Console
3. Ensure exact match, no trailing slashes or missing paths

**Valid format:**
```
http://localhost:3000/api/auth/callback/google
```

**Invalid formats:**
```
http://localhost:3000/          # Missing path
http://localhost:3000/callback   # Missing /api/auth
http://localhost:3000/api/auth/callback/google/   # Trailing slash
https://localhost:3000/api/auth/callback/google     # https without SSL
```

### Error 3: ".env.local not found" or "GOOGLE_CLIENT_ID undefined"

**Cause:**
- `.env.local` file doesn't exist
- File is in wrong location
- Values not loaded correctly

**Solution:**
```bash
# Verify file exists
ls -la /home/vscode/projects/Frontend/.env.local

# Check file contents
cat /home/vscode/projects/Frontend/.env.local

# Ensure no extra spaces or quotes
```

### Error 4: Port 3000 already in use

**Cause:**
- Another process is using port 3000
- Previous server instance didn't shut down cleanly

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000
# or
netstat -tlnp | grep 3000

# Kill the process
kill -9 <PID>

# Restart server
npm run dev
```

### Error 5: Pages not protected / Can access without login

**Cause:**
- Middleware not loaded
- Server needs restart after creating `.env.local`

**Solution:**
```bash
# Kill server
# Stop with Ctrl+C

# Clear cache
rm -rf .next

# Restart server
npm run dev
```

### Error 6: Google Consent Screen missing "Add events to calendar" permission

**Cause:**
- `calendar.events` scope not added to OAuth Client
- Scope added incorrectly

**Solution:**
1. Go to Google Cloud Console → OAuth Consent Screen
2. In "Scopes" section, verify:
   - `https://www.googleapis.com/auth/calendar.events` is present
3. If missing, add it and save
4. Restart server

### Issue 7: Build warning: "middleware" file deprecated

**Note:** This is informational only, functionality still works.

**Solution:**
- Will be addressed in future Next.js update
- Can be safely ignored for now

---

## Security Notes

### Environment Variables

✅ **Never commit** `.env.local` to version control  
✅ **Never share** Client Secret publicly  
✅ **Use environment-specific** credentials (dev vs production)  
✅ **Rotate secrets** if compromised  

### Token Storage

✅ **Tokens stored** in httpOnly cookies (not accessible to JavaScript)  
✅ **JWT strategy** (stateless, scalable)  
✅ **Session timeout** configurable (default: 7 days)  
✅ **Automatic refresh** when tokens expire  

### Google Security

✅ **HTTPS required** for production domains  
✅ **Domain verification** required for external users  
✅ **Consent screen** shows requested permissions  
✅ **User can revoke** access from Google Account settings  

---

## Testing Checklist

### Local Development

- [ ] Google Cloud Project created
- [ ] Calendar API enabled
- [ ] OAuth Consent Screen configured
- [ ] Scopes added (openid, email, profile, calendar.events)
- [ ] OAuth Client ID created
- [ ] Redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Client ID and Secret copied and saved
- [ ] `.env.local` created with real credentials
- [ ] `NEXTAUTH_URL=http://localhost:3000`
- [ ] Development server running (`npm run dev`)
- [ ] Can navigate to `http://localhost:3000`
- [ ] Automatically redirected to `/login`
- [ ] "Sign in with Google" button works
- [ ] Google OAuth Consent Screen appears
- [ ] Consent includes calendar permission
- [ ] After allowing: Redirected to events gallery
- [ ] User name and avatar displayed in header
- [ ] Can view events gallery
- [ ] Can view status page
- [ ] Session persists after page refresh
- [ ] "Sign out" button works
- [ ] Redirected to `/login` after sign out

### Production Deployment

- [ ] Domain purchased and configured
- [ ] DNS A-record pointing to server IP
- [ ] DNS propagated (ping works)
- [ ] Google OAuth Client updated with production redirect URI
- [ ] `.env.local` updated with production `NEXTAUTH_URL`
- [ ] Server running on production URL
- [ ] SSL/TLS certificate configured (HTTPS)
- [ ] Application accessible via domain
- [ ] OAuth flow works with real users

---

## Features Ready for Future Calendar Integration

When ready to implement "Add to Calendar" feature:

### Access Token Usage

The access token is available in the session:
```typescript
import { useSession } from "next-auth/react"

function MyComponent() {
  const { data: session } = useSession()
  
  const addToCalendar = async () => {
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: "Event Name",
          description: "Event Description",
          location: "Event Location",
          start: {
            dateTime: "2026-02-10T10:00:00",
          },
          end: {
            dateTime: "2026-02-10T11:00:00",
          },
        }),
      }
    );
    
    if (response.ok) {
      // Success
      const data = await response.json()
      console.log("Event added:", data.id)
    } else {
      // Error handling
      console.error("Failed to add event")
    }
  }
}
```

### Calendar Scopes Granted

- `https://www.googleapis.com/auth/calendar.events`
- Allows adding events to user's primary calendar
- Does NOT allow reading, editing, or deleting existing events
- Perfect for your requirement: "only ADD events, no edit/delete"

### Token Refresh

- Automatic token refresh built-in
- When access token expires (1 hour), NextAuth automatically requests new one
- No user intervention needed
- Seamless experience for users

---

## Support and Resources

### For Issues:

1. **Check browser console** (F12) for JavaScript errors
2. **Check network tab** (F12) for failed requests and responses
3. **Verify environment variables** are set correctly
4. **Ensure Google Cloud Console** has correct redirect URIs
5. **Check NextAuth debug mode** (enabled in development)

### Documentation:

- **NextAuth.js:** https://authjs.dev/
- **Google OAuth 2.0:** https://developers.google.com/identity/protocols/oauth2
- **Google Calendar API:** https://developers.google.com/calendar/api/v3/reference

### Debug Mode:

NextAuth debug mode is enabled in development (see `src/lib/auth.ts`).
This provides detailed logging in the terminal:
- OAuth flow steps
- Token refresh attempts
- Session creation/verification

---

## Time and Cost Estimates

### Local Development Setup

| Step | Time | Cost |
|-------|-------|-------|
| Create Google Cloud Project | 5-10 min | Free |
| Enable Calendar API | 2 min | Free |
| Configure OAuth Consent Screen | 5-10 min | Free |
| Create OAuth Client ID | 3-5 min | Free |
| Setup .env.local | 1 min | Free |
| Start server & test | 5-10 min | Free |
| **Total** | **20-40 min** | **$0** |

### Production Deployment

| Step | Time | Cost |
|-------|-------|-------|
| Purchase domain | 5-15 min | $10-15/year |
| Configure DNS | 5-10 min | Free |
| Wait for DNS propagation | 5-60 min | Free |
| Update OAuth credentials | 2-5 min | Free |
| Configure SSL/TLS | 10-30 min | Free (Let's Encrypt) |
| Test production deployment | 5-10 min | Free |
| **Total** | **30-120 min** | **$10-15/year** |

---

## Summary

### What You Have Now

✅ **Complete OAuth implementation** with NextAuth.js  
✅ **Google Calendar API integration** ready for "Add to Calendar" feature  
✅ **Persistent authentication** with automatic token refresh  
✅ **Protected application** with middleware  
✅ **User-friendly login/logout** flow  
✅ **Development setup** for local testing  
✅ **Production-ready** architecture for domain deployment  
✅ **Comprehensive documentation** for setup and troubleshooting  

### What You Can Do Now

1. **Test locally** with `http://localhost:3000`
2. **Verify OAuth flow** works correctly
3. **Test session persistence** and user menu
4. **Prepare for calendar integration** when ready

### What You Need for Production

1. **Domain name** (10-15€/year)
2. **DNS configuration** pointing to your server
3. **Update OAuth redirect URI** in Google Cloud Console
4. **Configure SSL/TLS** for HTTPS (recommended)

### Next Steps for Calendar Feature

When ready to implement "Add to Calendar":

1. Create API route: `/api/calendar/add-event`
2. Add "Add to Calendar" button to event cards
3. Implement calendar API calls using `session.accessToken`
4. Display success/error feedback to user
5. Optionally track added events in database

---

**Google OAuth implementation complete and ready for testing!** 🎉

For questions or issues, refer to the Troubleshooting section or check browser/server logs.
