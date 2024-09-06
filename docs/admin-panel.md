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

- For Cloudflare production, you can find the necessary information in the Cloudflare dashboard under "Workers & Pages" -> D1 -> Melody Auth database -> app table.
- For Cloudflare local development, use the following command to retrieve app information:
  ```
  cd melody-auth/server
  wrangler d1 execute melody-auth --command="select * from app"
  ```
- For Node version, check your Postgres melody-auth database -> app table

## 4. Start the admin panel app

Start the admin panel app
```
cd melody-auth/admin-panel
npm install
npm run dev
```

### First-time Setup

1. When you first access the admin panel, you'll be redirected to the Melody Auth screen. Create a new account.
2. After creating an account, you'll be redirected back to the admin panel with an "super_admin role required" alert. This is expected for new accounts.
3. To grant super admin access:
  - For Cloudflare production:
    1. Go to the Cloudflare dashboard
    2. Navigate to "Workers & Pages" -> D1 -> Melody Auth database -> user_role table
    3. Add a new record with userId = 1 and roleId = 1 (assuming you just created the first user)
  - For local environment:
    ```
    cd melody-auth/server
    wrangler d1 execute melody-auth --command="insert into user_role (userId, roleId) values (1, 1)"
    ```
  - For Node version, insert following record to your Postgres melody-auth database:
    ```
    insert into user_role (userId, roleId) values (1, 1)
    ```
4. Logout (Required after update user role) and login again. You should now have full access.