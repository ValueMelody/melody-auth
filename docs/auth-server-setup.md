# Auth Server Setup
This guide will walk you through setting up Melody Auth in both Cloudflare (remote/production or local/development) and Node.js environments.

## Cloudflare Remote/Production Environment

### 1. Cloudflare Account Setup
1. Sign up for a Cloudflare account if you don't have one already.
2. Install Wrangler CLI and Authenticate:
    ```
    npx wrangler
    wrangler login
    ```

### 2. Cloudflare Resource Creation
In your Cloudflare dashboard:
1. Create a Worker:
    - Go to "Compute(Workers)" -> "Workers & Pages" -> Click "Create" button
    - Name the worker "melody-auth"
    - After creation, open the worker -> "Settings" -> "Variables and Secrets"
    - Add a variable named "AUTH_SERVER_URL" with the value set to your worker's URL 
      (e.g., https://melody-auth.[your-account-name].workers.dev)
2. Create a D1 Database:
    - Go to "Storage & Databases" -> "D1 SQL Database"
    - Click "Create" button
3. Create a KV Storage:
    - Go to "Storage & Databases" -> "KV"
    - Click "Create" button

### 3. Cloudflare Worker Secrets Setup
In your Cloudflare dashboard:
1. Go to "Compute(Workers)" -> "Workers & Pages"
2. Select your "melody-auth" worker
3. Click on "Settings" -> "Variables and Secrets"
4. Include the required environment variables for any email, SMS, or social sign-in providers you plan to use.
    - [Email Provider Setup](https://auth.valuemelody.com/email-provider-setup.html)
    - [SMS Provider Setup](https://auth.valuemelody.com/sms-provider-setup.html)
    - [Social Sign-In Provider Setup](https://auth.valuemelody.com/social-sign-in-provider-setup.html)

### 4. Project Setup
1. Clone the Repository:
    ```
    git clone git@github.com:ValueMelody/melody-auth.git
    cd melody-auth
    npm install
    npm run build
    ```

2. Configure `server/wrangler.toml`: Replace the KV and D1 IDs with the resources you created:
    ```toml
    [[kv_namespaces]]
    binding = "KV"
    id = "your_kv_namespace_id"

    [[d1_databases]]
    binding = "DB"
    database_name = "melody-auth"
    database_id = "your_d1_database_id"
    ```

### 5. Initial Deployment
Run the following commands
```
cd server
npm run prod:secret:generate
npm run prod:migration:apply
npm run prod:deploy
```
**Now you are all set**, you can verify your deployment by accessing: `[your_worker_url]/.well-known/openid-configuration`

### 6.Future Deployments
To pull the latest code and redeploy:
```
git pull origin main
cd server
npm run prod:migration:apply # If there are new migrations
npm run prod:deploy
```

## Cloudflare Local/Development Environment
To set up your local development environment, follow these steps:
```
git clone git@github.com:ValueMelody/melody-auth.git
cd melody-auth
npm install
npm run build

cd server
cp .dev.vars.example .dev.vars
# Include the required environment variables for any email, SMS, or social sign-in providers you plan to use.

npm run dev:secret:generate
npm run dev:migration:apply
npm run dev:start
```

## Node Environment Setup

### 1. Node, Postgres and Redis setup
Begin by setting up your PostgreSQL and Redis servers, and ensure you have the connection strings ready for integration. Please also ensure you are using <b>Node.js version 20.05 or higher</b> for compatibility.

### 2. Project setup
```
git clone git@github.com:ValueMelody/melody-auth.git
cd melody-auth
npm install
npm run build

cd server
cp .dev.vars.example .dev.vars
# Fill in PostgreSQL & Redis connection strings
# Include the required environment variables for any email, SMS, or social sign-in providers you plan to use.

npm run node:secret:generate
npm run node:migration:apply
npm run node:dev
```
This starts the server in development mode using Node.js, connected to your local or remote databases.

### 3. Production Build
To build and run in production:
```
cd server
npm run node:build
npm run node:start
```

### 4.Future Deployments
To pull the latest code and redeploy:
```
git pull origin main
cd server
npm run node:migration:apply # If there are new migrations
npm run node:build
npm run node:start
```
