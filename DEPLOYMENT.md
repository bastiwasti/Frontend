# Deployment Guide

This guide covers the deployment process for the Eventig application.

## System Architecture

- **Frontend:** Next.js 16 (React)
- **Backend:** Next.js API routes
- **Web Server:** Nginx (reverse proxy)
- **Database:** SQLite (via better-sqlite3)

## Directory Structure

```
/home/vscode/projects/Frontend/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   └── lib/                # Utilities
├── public/                 # Static files
├── package.json
└── .next/                  # Build output (generated)
```

## Development Workflow

### 1. Make Code Changes

Edit files in `/home/vscode/projects/Frontend/src/`

### 2. Test Locally (Development Server)

```bash
# From /home/vscode/projects/Frontend
npm run dev
```

The dev server runs on http://localhost:3000 with hot reload.

### 3. Build for Production

```bash
# From /home/vscode/projects/Frontend
npm run build
```

This compiles the Next.js application and generates the `.next` folder.

### 4. Lint and Type Check (Optional but Recommended)

```bash
npm run lint
```

## Deployment Process

### Option A: Quick Deploy (Recommended for Most Changes)

After making code changes:

```bash
cd /home/vscode/projects/Frontend

# 1. Build the application
npm run build

# 2. Restart the Next.js server
pkill -f "next-server"

# 3. Start the server in background
nohup npm start > /tmp/next.log 2>&1 &

# 4. Check server is running
tail /tmp/next.log
```

### Option B: Full Deploy (Clean Restart)

```bash
cd /home/vscode/projects/Frontend

# 1. Kill all Next.js processes
pkill -9 -f "next-server"
pkill -9 -f "next start"

# 2. Wait for cleanup
sleep 2

# 3. Build the application
npm run build

# 4. Start the server
nohup npm start > /tmp/next.log 2>&1 &

# 5. Verify server is running
sleep 3
ps aux | grep -E "next start|next-server" | grep -v grep
tail /tmp/next.log
```

## Verification

### Check Server Status

```bash
# Check if Next.js is running
ps aux | grep -E "next start|next-server" | grep -v grep

# Check server logs
tail -20 /tmp/next.log

# Test locally
curl http://localhost:3000
curl http://localhost:3000/analytics
```

### Check Application

Visit: https://eventig.app

Test all routes:
- https://eventig.app/ (Calendar)
- https://eventig.app/calendar (Events)
- https://eventig.app/analytics (Analytics)
- https://eventig.app/status (Status)

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or kill all Next.js processes
pkill -f "next-server"
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Server Not Starting

```bash
# Check logs
tail -50 /tmp/next.log

# Check for errors
npm start  # Run in foreground to see errors
```

### 404 Errors After Deploy

1. Check if the page exists in `src/app/`
2. Ensure `npm run build` completed successfully
3. Restart the server
4. Check browser console for client-side errors

### Stale Content / Caching

After deploying:
```bash
# Restart server
pkill -f "next-server"
nohup npm start > /tmp/next.log 2>&1 &

# Clear browser cache or try incognito mode
```

## Nginx Configuration

Nginx acts as a reverse proxy and does NOT need to be reloaded for code changes.

### When to Reload Nginx

- After changing `/etc/nginx/sites-enabled/eventig.app`
- After changing `/etc/nginx/nginx.conf`
- After SSL certificate updates

```bash
# Test configuration
sudo nginx -t

# Reload nginx (graceful, no downtime)
sudo systemctl reload nginx

# Or restart nginx (short downtime)
sudo systemctl restart nginx
```

### Current Nginx Config

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
    # SSL configuration...
}
```

## Git Workflow (Optional)

If using Git for version control:

```bash
# Add changes
git add .

# Commit
git commit -m "Description of changes"

# Push to remote
git push

# Deploy on server
cd /home/vscode/projects/Frontend
git pull origin main
npm run build
pkill -f "next-server"
nohup npm start > /tmp/next.log 2>&1 &
```

## Monitoring

### Server Logs

```bash
# Next.js logs
tail -f /tmp/next.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System Status

```bash
# Check nginx status
sudo systemctl status nginx

# Check Next.js process
ps aux | grep -E "next start|next-server" | grep -v grep

# Check available memory
free -h

# Check disk space
df -h
```

## Environment Variables

Application uses `.env.local` for configuration. Ensure these are set correctly:

```
# NextAuth.js
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://eventig.app

# Database (if applicable)
DATABASE_URL=file:./dev.db
```

## Security Notes

- Keep dependencies updated: `npm audit fix`
- Use HTTPS only (already configured)
- Regular backups of database files
- Monitor logs for suspicious activity
- Keep Node.js and nginx updated

## Rollback

If a deployment causes issues:

```bash
# Revert code changes
git checkout <previous-commit>

# Rebuild
npm run build

# Restart server
pkill -f "next-server"
nohup npm start > /tmp/next.log 2>&1 &
```

## Quick Reference

| Task | Command |
|------|---------|
| Build | `npm run build` |
| Start server | `npm start` |
| Stop server | `pkill -f "next-server"` |
| Check logs | `tail /tmp/next.log` |
| Restart server | `pkill -f "next-server" && nohup npm start > /tmp/next.log 2>&1 &` |
| Reload nginx | `sudo systemctl reload nginx` |
| Test app | `curl http://localhost:3000` |
