# Deployment

This application is deployed on the same machine (`<server-ip>:3000`) with nginx as a reverse proxy. There is no dev environment - all changes go directly to production.

## Deployment Process

After making any changes, follow these steps:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Restart the frontend service**
   ```bash
   sudo systemctl restart frontend.service
   ```

3. **Verify deployment**
   ```bash
   sudo systemctl status frontend.service
   ```

The production URL is: https://eventig.app

## Service Details

- **Service**: `frontend.service`
- **Port**: 3000
- **Command**: `npm start` (runs `next start`)
- **Location**: `/etc/systemd/system/frontend.service`
