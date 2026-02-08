# Events Gallery

A web application for browsing and filtering discovered events with Google OAuth authentication and calendar integration capabilities.

## Overview

Events Gallery is a Next.js application that displays scraped events from a SQLite database, with features for:
- 🎨 **Event Gallery** with advanced filtering
- 🔐 **Google OAuth Authentication** with persistent sessions
- 📅 **Calendar API Integration** (ready for future use)
- 👥 **User Management** with sign in/sign out

## Features

### Current Features

- ✅ **Events Display**: Browse events from database with smart date/time display
- ✅ **Advanced Filtering**: Filter by run, location, city, date range (calendar picker), category, source
- ✅ **Smart Date/Time Display**: Automatically handles single-day and multi-day events with clear formatting
- ✅ **Status Dashboard**: View run statistics and metadata
- ✅ **Google Authentication**: Sign in with Google account
- ✅ **Persistent Sessions**: 7-day session with automatic token refresh
- ✅ **User Profiles**: Display name and avatar
- ✅ **Route Protection**: Middleware protects all routes except login
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Dark Mode**: Supports dark/light theme

### Future Features

- 📅 **Add to Calendar**: Integrate with Google Calendar API
- 📊 **Analytics**: Track user interactions and event popularity
- 🔔 **Notifications**: Alert users about new events

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Authentication**: NextAuth.js (beta)
- **Database**: SQLite (via better-sqlite3)
- **Date Handling**: date-fns, react-day-picker
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ (tested with v24.13.0)
- npm 9+ (tested with v11.6.2)
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd /path/to/projects
   git clone <repository-url>
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add:
   ```env
   # Google OAuth Credentials (required for authentication)
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   
   # NextAuth Configuration
   NEXTAUTH_SECRET=your-generated-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

   Generate `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to: `http://localhost:3000`

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (protected)/               # Protected routes (require auth)
│   │   ├── layout.tsx           # Layout with user menu
│   │   ├── page.tsx             # Events gallery page
│   │   └── status/
│   │       └── page.tsx         # Status dashboard
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/ # NextAuth handlers
│   │   ├── events/              # Events data API
│   │   └── runs/                # Runs data API
│   ├── login/                   # Public login page
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── auth/                    # Authentication components
│   ├── providers/                # Context providers
│   └── ui/                     # UI component library
├── lib/                        # Utility functions
│   ├── auth.ts                 # NextAuth configuration
│   ├── db.ts                   # Database connection
│   └── utils.ts                # General utilities
└── middleware.ts               # Route protection middleware
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server on http://localhost:3000

# Production
npm run build            # Build for production
npm run start            # Start production server

# Quality
npm run lint             # Run ESLint
```

## Google OAuth Setup

### For Local Development

Google OAuth supports `localhost` for development testing. See [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md) for detailed instructions.

**Quick Start:**
1. Create Google Cloud Project
2. Enable Calendar API
3. Configure OAuth Consent Screen
4. Create OAuth Client ID with redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env.local`
6. Start server and test

### For Production

Google OAuth requires a domain name with TLD (.com, .org, etc.). IP addresses are not supported.

**Steps:**
1. Purchase domain (~$10-15/year)
2. Configure DNS A-record to server IP
3. Update Google OAuth Client with production redirect URI: `https://yourdomain.com/api/auth/callback/google`
4. Update `.env.local` with `NEXTAUTH_URL=https://yourdomain.com`
5. Deploy and test

## Database

The application uses SQLite with the following tables:

### Events Table
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  run_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  city TEXT,
  start_datetime DATETIME,
  end_datetime DATETIME,
  category TEXT,
  source TEXT,
  created_at TEXT
);
```

### Runs Table
```sql
CREATE TABLE runs (
  id INTEGER PRIMARY KEY,
  agent TEXT,
  location TEXT,
  cities TEXT,
  created_at TEXT,
  raw_summary_id INTEGER
);
```

### Status Table
```sql
CREATE TABLE status (
  id INTEGER PRIMARY KEY,
  run_id INTEGER,
  linked_run_id INTEGER,
  urls TEXT,
  start_time TEXT,
  end_time TEXT,
  duration REAL,
  events_found INTEGER,
  valid_events INTEGER,
  full_run INTEGER
);
```

## API Endpoints

### Events API
- **GET** `/api/events` - Retrieve all events
   - Query param: `run_id` (optional) - Filter by run ID
   - Returns: Array of event objects sorted by start_datetime (ascending)
   - Event fields: id, run_id, name, description, location, city, start_datetime, end_datetime, category, source, created_at

### Runs API
- **GET** `/api/runs` - Retrieve all runs with status
  - Returns: Array of run objects with statistics

### Auth API
- **GET/POST** `/api/auth/[...nextauth]` - NextAuth.js handlers
  - Handles: Sign in, sign out, session management, token refresh

## Authentication

### Flow

1. User navigates to protected page
2. Middleware checks for authentication
3. If not authenticated → redirect to `/login`
4. User clicks "Sign in with Google"
5. Redirects to Google OAuth consent screen
6. User grants permissions (including calendar access)
7. Google redirects back with authorization code
8. NextAuth exchanges code for access + refresh tokens
9. Session created with user info and tokens
10. User redirected to protected page

### Session Configuration

- **Strategy**: JWT (stateless, scalable)
- **Duration**: 7 days (604800 seconds)
- **Token Refresh**: Automatic when access token expires (1 hour)
- **Storage**: httpOnly cookies (secure)

### Permissions

The application requests the following Google OAuth scopes:

- `openid` - User identification
- `email` - User email address
- `profile` - User name and avatar
- `https://www.googleapis.com/auth/calendar.events` - Add events to calendar (future feature)

## Deployment

### Environment Variables Required

For production deployment, ensure these environment variables are set:

```env
GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-client-secret
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://yourdomain.com
```

### Deployment Steps

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Configure environment variables** on your server

3. **Start production server**
   ```bash
   npm start
   ```

4. **Configure reverse proxy** (nginx, Apache) for SSL/TLS

### Recommended Production Setup

- **Domain**: Purchase and configure DNS
- **SSL/TLS**: Use Let's Encrypt or purchased certificate
- **Database**: Ensure SQLite file is backed up regularly
- **Firewall**: Open port 3000 or configure reverse proxy
- **Monitoring**: Set up application monitoring and error tracking

## Troubleshooting

### Common Issues

**Issue: Port 3000 already in use**
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Issue: Environment variables not loading**
```bash
# Verify .env.local exists
cat .env.local

# Restart server
npm run dev
```

**Issue: OAuth redirect error**
- Check redirect URI in Google Cloud Console
- Ensure exact match with `NEXTAUTH_URL`
- Verify includes `/api/auth/callback/google` path

**Issue: Build errors**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

For more troubleshooting, see [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md).

## Development

### Adding New Features

1. Create new route in `src/app/`
2. Add API endpoints in `src/app/api/`
3. Create components in `src/components/`
4. Update types and interfaces

### Database Changes

Use `better-sqlite3` for database operations:

```typescript
import Database from 'better-sqlite3';
import { DB_PATH } from '@/config/db';

const db = new Database(DB_PATH, { readonly: false });

// Execute query
const result = db.prepare('SELECT * FROM events').all();

// Close connection
db.close();
```

### Testing

- Use browser DevTools (F12) for debugging
- Check Network tab for API requests
- Enable NextAuth debug mode (already enabled in `src/lib/auth.ts`)
- Monitor server logs for errors

## Security

### Best Practices

- ✅ Never commit `.env.local` or secrets to version control
- ✅ Use environment-specific credentials (dev vs production)
- ✅ Rotate secrets if compromised
- ✅ Keep dependencies updated
- ✅ Use HTTPS in production
- ✅ Implement rate limiting for API routes
- ✅ Validate and sanitize user inputs

### OAuth Security

- ✅ Tokens stored in httpOnly cookies
- ✅ Short-lived access tokens (1 hour)
- ✅ Automatic token refresh
- ✅ User can revoke access from Google Account settings
- ✅ Minimal scopes requested (only what's needed)

## Contributing

This is a private project. For questions or issues, refer to the documentation files.

## License

Private project - All rights reserved.

## Documentation

- [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md) - Complete Google OAuth setup guide with local development and production deployment instructions

## Support

For issues or questions:
1. Check browser console (F12) for errors
2. Check server terminal logs
3. Verify environment variables
4. Review troubleshooting sections in documentation

---

**Built with Next.js, TypeScript, and Tailwind CSS** 🚀
