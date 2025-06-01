# 管理面板

按照以下说明在本地或生产环境中设置并运行管理面板。

## 1. 先决条件
首先完成认证服务器的设置。

## 2. 开始使用

```
cd melody-auth/admin-panel
cp .env.example .env
```

## 3. 在 .env 文件中更新以下变量：
```
NEXT_PUBLIC_CLIENT_URI: 设置为你的管理面板应用的主机 URL
NEXT_PUBLIC_SERVER_URI: 设置为你的认证服务器的主机 URL
NEXT_PUBLIC_CLIENT_ID: "Admin Panel (SPA)" 应用的 Client ID
SERVER_CLIENT_ID: "Admin Panel (S2S)" 应用的 Client ID
SERVER_CLIENT_SECRET: "Admin Panel (S2S)" 应用的 Client Secret
```

- **Cloudflare 远程/生产环境**：在 Cloudflare 控制台的 “Workers & Pages” -> D1 -> Melody Auth database -> app 表中可以找到所需信息。  
- **Cloudflare 本地/开发环境**：使用以下命令获取应用信息：
  ```
  cd melody-auth/server
  wrangler d1 execute melody-auth --command="select * from app"
  ```
- **NodeJS 环境**：在你的 Postgres melody-auth 数据库的 app 表中查看

## 4. 启动管理面板应用

启动管理面板应用
```
cd melody-auth/admin-panel
npm install
npm run dev
```

### 初次设置

1. 第一次访问管理面板时，你将被重定向到 auth 服务器登录页面。创建一个新账户。  
2. 创建账户后，你会被重定向回管理面板，并看到 “需要 super_admin 角色” 的提示。对于新账户来说这是正常的。  
3. 为了授予 super admin 访问权限：  
    - **Cloudflare 远程/生产环境**：  
      1. 进入 Cloudflare 控制台  
      2. 打开 “Workers & Pages” -> D1 -> Melody Auth database -> user_role 表  
      3. 新增记录，设置 userId = 1 且 roleId = 1（假设你刚创建的是第一个用户）  
    - **Cloudflare 本地/开发环境**：  
      ```
      cd melody-auth/server
      wrangler d1 execute melody-auth --command="insert into user_role (userId, roleId) values (1, 1)"
      ```
    - **NodeJS 环境**：在你的 Postgres melody-auth 数据库中插入以下记录：  
      ```
      insert into user_role (userId, roleId) values (1, 1)
      ```
4. 登出（更新用户角色后必须）并重新登录。此时你应该拥有完整访问权限。

### 将管理面板部署到 Cloudflare Workers
管理面板是一个全栈 Next.js 应用，通常部署在 Node.js 环境。现在通过 opennextjs-cloudflare 包支持部署到 Cloudflare Workers。

**注意**：Cloudflare Workers 不能调用同一 Cloudflare 账户中的其他 Worker。因此，如果你计划同时在 Cloudflare 上部署管理面板和认证服务器，则必须为每个 Worker 分配一个自定义域名（例如 admin.example.com 与 auth.example.com），或将两个 Worker 部署到不同的 Cloudflare 账户，以避免此限制。

部署步骤：  
1. 创建一个名为 “melody-auth-admin-panel” 的新 Worker  
2. 在 Cloudflare 控制台中进入 “melody-auth-admin-panel” -> Settings -> Variables and Secrets，添加以下 secrets  
    ```
    SERVER_CLIENT_ID=["Admin Panel (S2S)" 应用的 Client ID]
    SERVER_CLIENT_SECRET=["Admin Panel (S2S)" 应用的 Client Secret]
    ```
3. 在项目根目录的 /admin-panel 文件夹下创建 .env 文件：  
    ```
    NEXT_PUBLIC_CLIENT_URI=[此管理面板 Worker 的主机 URL]
    NEXT_PUBLIC_SERVER_URI=[你的认证服务器的主机 URL]
    NEXT_PUBLIC_CLIENT_ID=["Admin Panel (SPA)" 应用的 Client ID]
    ```
4. 进入 “Workers & Pages” -> D1 -> Melody Auth database -> app 表  
    - 在 "Admin Panel (SPA)" 条目中，将 redirectUris 更新为 Cloudflare 地址（例如 https://melody-auth-admin.[your-account-name].workers.dev）  

5. 构建项目  
    ```
    npm run cf:build
    ```
6. 部署  
    ```
    npm run cf:deploy
    ```

## 为管理面板配置自定义角色访问
默认情况下，管理面板只接受 super_admin 角色登录。若要使用具有受限权限的自定义角色登录，请执行以下步骤：  
1. 在 /admin-panel/tools/access 中，将你的自定义角色添加到 **AllowedRoles** 数组。  
2. 在 **RoleAccesses** 中为你的自定义角色定义访问权限，文件位置同上 (/admin-panel/tools/access)。
