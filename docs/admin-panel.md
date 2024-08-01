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
NEXT_PUBLIC_SERVER_URI: Set this to your Cloudflare worker URL where you hosted the auth server, or use http://localhost:8787 for local development.
NEXT_PUBLIC_CLIENT_ID: Client ID for the Admin Panel (SPA) app
SERVER_CLIENT_ID: Client ID for the Admin Panel (S2S) app
SERVER_CLIENT_SECRET: Client secret for the Admin Panel (S2S) app
```

- For production, you can find the necessary information in the Cloudflare dashboard under "Workers & Pages" -> D1 -> Melody Auth database -> app table.
- For local development, use the following command to retrieve app information:
  ```
  cd melody-auth/server
  wrangler d1 execute melody-auth --command="select * from app"
  ```

## 4. Start the admin panel app

Start the admin panel app
```
cd melody-auth/admin-panel
npm run dev
```

### First-time Setup

1. When you first access the admin panel, you'll be redirected to the Melody Auth screen. Create a new account.
2. After creating an account, you'll be redirected back to the admin panel with an "super_admin role required" alert. This is expected for new accounts.
3. To grant super admin access:
  - For production:
    1. Go to the Cloudflare dashboard
    2. Navigate to "Workers & Pages" -> D1 -> Melody Auth database -> user_role table
    3. Add a new record with userId = 1 and roleId = 1 (assuming you just created the first user)
  - For local environment:
    ```
    cd melody-auth/server
    wrangler d1 execute melody-auth --command="insert into user_role (userId, roleId) values (1, 1)"
    ```
4. Logout and login again. You should now have full access.