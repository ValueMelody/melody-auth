# 部署流水线

本项目提供三条可供使用的 **GitHub Actions** 部署流水线：

- **Auth Server** 部署到 **Cloudflare Workers**
- **Admin Panel** 部署到 **Cloudflare Workers**
- **Admin Panel** 部署到 **Vercel**

在继续之前，请确保已完成 [Auth Server 安装](https://auth.valuemelody.com/zh/auth-server-setup.html) 和 [Admin Panel 安装](https://auth.valuemelody.com/zh/admin-panel-setup.html) 的步骤。

## 将 Auth Server 部署到 Cloudflare Workers

- 查看 `.github/workflows/server-deploy.yml` 文件。
- 在你的仓库中依次进入 **Settings → Secrets and variables → Actions → New repository secret**，添加以下 **secrets**：
  - `CLOUDFLARE_API_TOKEN` — 在 Cloudflare 仪表盘新建一个拥有以下权限的 Token：  
    - `Account - D1 - Edit`  
    - `Account - Workers KV Storage - Edit`  
    - `Account - Workers Scripts - Edit`
  - `CLOUDFLARE_ACCOUNT_ID` — 你的 Cloudflare **Account ID**
- 在你的仓库中依次进入 **Settings → Secrets and variables → Variables → New variable**，添加以下 **variables**：
  - `DATABASE_URL` — D1 数据库的连接字符串  
  - `EMBEDDED_AUTH_ORIGINS` — 允许发起嵌入式认证请求的前端应用源（用逗号分隔）  
  - `SERVER_SESSION_SALT` — 用于加密会话的随机字符串  
  - `WORKERS_ENV` — Cloudflare Workers 运行环境，例如 `production`

## 将 Admin Panel 部署到 Cloudflare Workers

- 查看 `.github/workflows/admin-panel-deploy.yml` 文件。
- 在你的仓库中依次进入 **Settings → Secrets and variables → Actions → New repository secret**，添加以下 **secrets**：
  - `CLOUDFLARE_API_TOKEN` — 在 Cloudflare 仪表盘新建一个拥有以下权限的 Token：  
    - `Account - D1 - Edit`  
    - `Account - Workers KV Storage - Edit`  
    - `Account - Workers Scripts - Edit`
  - `CLOUDFLARE_ACCOUNT_ID` — 你的 Cloudflare **Account ID**
- 在你的仓库中依次进入 **Settings → Secrets and variables → Variables → New variable**，添加以下 **variables**：
  - `NEXT_PUBLIC_CLIENT_URI` — Admin Panel 的访问 URI  
  - `NEXT_PUBLIC_SERVER_URI` — Auth Server 的访问 URI  
  - `NEXT_PUBLIC_CLIENT_ID` — Admin Panel 的 `clientId`

## 将 Admin Panel 部署到 Vercel

- 查看 `.github/workflows/admin-panel-vercel-deploy.yml` 文件。
- 在你的仓库中依次进入 **Settings → Secrets and variables → Actions → New repository secret**，添加以下 **secrets**：
  - `VERCEL_TOKEN` — 在 Vercel 仪表盘生成的 Token  
  - `VERCEL_ORG_ID` — 你的 Vercel **Organization ID**  
  - `VERCEL_PROJECT_ID` — 你的 Vercel **Project ID**
