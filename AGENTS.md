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

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
