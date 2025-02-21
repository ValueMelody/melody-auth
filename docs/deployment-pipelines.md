# Deployment Pipelines
There are three deployment pipelines (Github Actions) you can take advantage of:
- Pipeline to deploy auth server to Cloudflare Workers
- Pipeline to deploy admin panel to Cloudflare Workers
- Pipeline to deploy admin panel to Vercel
  
Make sure you have completed the [Auth Server Setup](https://auth.valuemelody.com/auth-server-setup.html) and [Admin Panel Setup](https://auth.valuemelody.com/admin-panel-setup.html) before proceeding.

## Deploy Auth Server to Cloudflare Workers
- Check out the `.github/workflows/server-deploy.yml` file.
- In your repository, go to `Settings` -> `Secrets and Variables` -> `Actions` -> `New repository secret`. Add the following secrets:
  - `CLOUDFLARE_API_TOKEN` # Create a new token in your Cloudflare dashboard with the following permissions:
    - `Account - D1 - Edit`
    - `Account - Workers KV Storage - Edit`
    - `Account - Workers Scripts - Edit`
  - `CLOUDFLARE_ACCOUNT_ID` # The account ID of your Cloudflare account

## Deploy Admin Panel to Cloudflare Workers
- Check out the `.github/workflows/admin-panel-cloudflare-deploy.yml` file.
- In your repository, go to `Settings` -> `Secrets and Variables` -> `Actions` -> `New repository secret`. Add the following secrets:
  - `CLOUDFLARE_API_TOKEN` # Create a new token in your Cloudflare dashboard with the following permissions:
    - `Account - D1 - Edit`
    - `Account - Workers KV Storage - Edit`
    - `Account - Workers Scripts - Edit`
  - `CLOUDFLARE_ACCOUNT_ID` # The account ID of your Cloudflare account
- In your repository, go to `Settings` -> `Secrets and Variables` -> `Variables` -> `New variable`. Add the following variables:
  - `NEXT_PUBLIC_CLIENT_URI` # The URI of your admin panel
  - `NEXT_PUBLIC_SERVER_URI` # The URI of your auth server
  - `NEXT_PUBLIC_CLIENT_ID` # The client ID of your admin panel

## Deploy Admin Panel to Vercel
- Check out the `.github/workflows/admin-panel-vercel-deploy.yml` file.
- In your repository, go to `Settings` -> `Secrets and Variables` -> `Actions` -> `New repository secret`. Add the following secrets:
  - `VERCEL_TOKEN` # Create a new token in your Vercel dashboard
  - `VERCEL_ORG_ID` # The organization ID of your Vercel account
  - `VERCEL_PROJECT_ID` # The project ID of your Vercel project
