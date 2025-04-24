# Admin Panel

Follow these instructions to set up and run the admin panel locally or in production.

## 1. Prerequisites
Complete the auth server setup first.

## 2. Get Started

```
cd melody-auth/admin-panel
cp .env.example .env
```

## 3. Update the .env file with the following variables:
```
NEXT_PUBLIC_CLIENT_URI: Set this to the host url of your admin panel app
NEXT_PUBLIC_SERVER_URI: Set this to the host url of your auth server.
NEXT_PUBLIC_CLIENT_ID: Client ID for the Admin Panel (SPA) app
SERVER_CLIENT_ID: Client ID for the Admin Panel (S2S) app
SERVER_CLIENT_SECRET: Client secret for the Admin Panel (S2S) app
```

- For Cloudflare remote/production environment, you can find the necessary information in the Cloudflare dashboard under "Workers & Pages" -> D1 -> Melody Auth database -> app table.
- For Cloudflare local/development environment, use the following command to retrieve app information:
  ```
  cd melody-auth/server
  wrangler d1 execute melody-auth --command="select * from app"
  ```
- For NodeJS environment, check your Postgres melody-auth database -> app table

## 4. Start the admin panel app

Start the admin panel app
```
cd melody-auth/admin-panel
npm install
npm run dev
```

### First-time Setup

1. When you first access the admin panel, you'll be redirected to the auth server login screen. Create a new account.
2. After creating an account, you'll be redirected back to the admin panel with an "super_admin role required" alert. This is expected for new accounts.
3. To grant super admin access:
    - For Cloudflare remote/production environment:
      1. Go to the Cloudflare dashboard
      2. Navigate to "Workers & Pages" -> D1 -> Melody Auth database -> user_role table
      3. Add a new record with userId = 1 and roleId = 1 (assuming you just created the first user)
    - For Cloudflare local/development environment:
      ```
      cd melody-auth/server
      wrangler d1 execute melody-auth --command="insert into user_role (userId, roleId) values (1, 1)"
      ```
    - For NodeJS environment, insert following record to your Postgres melody-auth database:
      ```
      insert into user_role (userId, roleId) values (1, 1)
      ```
4. Logout (Required after update user role) and login again. You should now have full access.

### Deploy Admin Panel to Cloudflare Workers
The Admin Panel is a full-stack Next.js application typically deployed in a Node.js environment. Deployment to Cloudflare Workers is now supported via the opennextjs-cloudflare package.

**Note**: Cloudflare Workers cannot call other Workers within the same Cloudflare account, so if you plan to deploy both the Admin Panel and the Auth Server on Cloudflare, you must either assign each Worker a custom domain (e.g., admin.example.com and auth.example.com), or deploy the two Workers under separate Cloudflare accounts to avoid the restriction.
  
Steps to Deploy:  
1. Create a new worker named "melody-auth-admin-panel"
2. Go to "melody-auth-admin-panel" Cloudflare Dashboard -> Settings -> Variables and Secrets, add following secrets
    ```
    SERVER_CLIENT_ID=[Client ID for the Admin Panel (S2S) app]
    SERVER_CLIENT_SECRET=[Client secret for the Admin Panel (S2S) app]
    ```
3. In your project directory, under the /admin-panel folder, create an .env file:
    ```
    NEXT_PUBLIC_CLIENT_URI=[The host url of this admin panel worker]
    NEXT_PUBLIC_SERVER_URI=[The host url of your auth server]
    NEXT_PUBLIC_CLIENT_ID=[Client ID for the Admin Panel (SPA) app]
    ```
4. Navigate to "Workers & Pages" -> D1 -> Melody Auth database -> app table 
    - Update the redirectUris values in Admin Panel (SPA)	entry with the cloudflare  (e.g., https://melody-auth-admin.[your-account-name].workers.dev)

5. Build the project
    ```
    npm run cf:build
    ```
6. Deploy
    ```
    npm run cf:deploy
    ```

## Custom Role Access for the Admin Panel
By default, the admin panel only accepts logins from the super_admin role. To enable login using a custom role with limited permissions, follow these steps:
1. Add your custom role to the **AllowedRoles** array in /admin-panel/tools/access.
2. Define the access permissions for your custom role within **RoleAccesses** in /admin-panel/tools/access.