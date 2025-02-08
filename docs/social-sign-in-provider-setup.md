# Social Sign-In Configuration
Melody Auth supports the following social identity providers out of the box:
- Google
- Facebook
- GitHub

## Google Sign-In
1. Set `GOOGLE_AUTH_CLIENT_ID` in `server/wrangler.toml` vars section.

## Facebook Sign-In
1. Set `FACEBOOK_AUTH_CLIENT_ID` in `server/wrangler.toml` vars section.
2. Set `FACEBOOK_AUTH_CLIENT_SECRET` in `server/.dev.vars` section or in Cloudflare Worker environment variables.

## GitHub Sign-In
1. Set `GITHUB_AUTH_CLIENT_ID` in `server/wrangler.toml` vars section.
2. Set `GITHUB_AUTH_CLIENT_SECRET` in `server/.dev.vars` section or in Cloudflare Worker environment variables.
3. In your GitHub App settings, set the callback URL to [your auth server doamin]/identity/v1/authorize-github, e.g., http://localhost:8787/identity/v1/authorize-github