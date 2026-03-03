# Deployment

## System Overview

```
Browser → nginx (SSL, port 443) → Next.js (port 3000) → PostgreSQL
```

- **Domain:** eventig.app
- **Server:** Ubuntu, systemd-managed
- **SSL:** Let's Encrypt via nginx
- **Database:** PostgreSQL (vmpostgres → webscraper schema)

## Service Management

Next.js runs as a systemd service:

```bash
# Check status
sudo systemctl status frontend

# Restart (after code changes + build)
sudo systemctl restart frontend

# View logs
sudo journalctl -u frontend -f
```

Service file: `/etc/systemd/system/frontend.service`

## Deploy Workflow

```bash
cd /home/vscode/projects/Frontend

# 1. Build
npm run build

# 2. Restart service
sudo systemctl restart frontend

# 3. Verify
sudo systemctl status frontend
```

The build compiles to `.next/`. The systemd service runs `npm start` which serves the built output on port 3000.

## Nginx

Nginx reverse-proxies to localhost:3000. Config: `/etc/nginx/sites-enabled/eventig.app`

```nginx
server {
    server_name eventig.app www.eventig.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    # SSL managed by certbot
}
```

Nginx does **not** need reloading for code changes — only for config/SSL changes:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Environment Variables

File: `/home/vscode/projects/Frontend/.env.local`

```env
# OAuth Credentials
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# NextAuth Configuration
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://eventig.app

# PostgreSQL Database Configuration
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=vmpostgres
PG_USER=jobsearch_readonly
PG_PASSWORD=...
PG_SCHEMA=webscraper
```

Generate a new secret: `openssl rand -base64 32`

**For production builds**, also create `.env.production` with the same variables (Next.js loads both `.env.local` and `.env.production`).

## Verification

```bash
# Service running?
sudo systemctl status frontend

# App responding?
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# Check all routes
curl http://localhost:3000           # Calendar
curl http://localhost:3000/calendar   # Gallery
curl http://localhost:3000/analytics  # Analytics
curl http://localhost:3000/status     # Status
```

Live: https://eventig.app

## Rollback

```bash
git log --oneline -5                    # Find previous good commit
git checkout <commit-hash> .            # Restore files
npm run build && sudo systemctl restart frontend
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 3000 in use | `lsof -i :3000` then `kill -9 <PID>` |
| Build errors | `rm -rf .next && npm run build` |
| Service won't start | `sudo journalctl -u frontend -n 50` |
| 404 after deploy | Verify route exists in `src/app/`, rebuild, restart |
| Stale content | Restart service + clear browser cache |
