# GoAuth.me - Local Development

## Quick Start

### 1. Start Auth Server (port 8788)
```bash
cd server
npm run dev:start
```

### 2. Start Admin Panel (port 3000)
```bash
cd admin-panel
npm run dev
```

### 3. Access
- **Admin Panel:** http://localhost:3000
- **Auth Server:** http://localhost:8788

## First Time Setup

After signing up, grant yourself super_admin role:

```bash
cd server

# Find your user ID
npx wrangler d1 execute goauth-me --local --command "SELECT id, email FROM user"

# Grant super_admin (replace YOUR_ID with actual ID)
npx wrangler d1 execute goauth-me --local --command "INSERT INTO user_role (userId, roleId) VALUES (YOUR_ID, 1)"
```

Then logout and login again.

## Configuration Files

| File | Purpose |
|------|---------|
| `server/wrangler.toml` | Server config (features, branding, etc.) |
| `server/.dev.vars` | Local secrets (AUTH_SERVER_URL, API keys) |
| `admin-panel/.env` | Admin panel config (server URI, client IDs) |

## Port Configuration

If port 8787 is in use, server runs on 8788. Update these files:

- `server/.dev.vars`: `AUTH_SERVER_URL="http://localhost:8788"`
- `admin-panel/.env`: `NEXT_PUBLIC_SERVER_URI=http://localhost:8788`

## Multi-Tenant Setup

Organizations are enabled. Each org has isolated branding.

Create orgs in Admin Panel → Orgs with:
- Name, Slug (URL identifier)
- Custom logo, colors, fonts

Client apps access via: `?org=<slug>` or SDK `loginRedirect({ org: 'slug' })`

## Translations

Supported locales: `en`, `pt`, `fr`

Files:
- Server: `server/src/configs/locale.ts`, `server/src/pages/tools/locale.ts`
- Admin: `admin-panel/translations/*.json`

## Database Commands

```bash
cd server

# Query users
npx wrangler d1 execute goauth-me --local --command "SELECT * FROM user"

# Query apps
npx wrangler d1 execute goauth-me --local --command "SELECT * FROM app"

# Query orgs
npx wrangler d1 execute goauth-me --local --command "SELECT * FROM org"
```
