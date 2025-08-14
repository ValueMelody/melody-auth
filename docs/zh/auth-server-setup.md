# 认证服务器设置
本指南将指导你在 Cloudflare（远程/生产或本地/开发）和 Node.js 环境中部署 Melody Auth。

如果你使用 Windows，请通过 WSL 或 Docker 来配置环境。

## Cloudflare 远程/生产环境

### 1. Cloudflare 账户设置
1. 如果尚未拥有 Cloudflare 账户，请先注册。

### 2. 创建 Cloudflare 资源
在 Cloudflare 控制台：
1. 创建 Worker：
    - 进入 “Compute(Workers)” -> “Workers & Pages” -> 点击 “Create” 按钮
    - 将 Worker 命名为 `melody-auth`
    - 创建完成后，打开该 Worker -> “Settings” -> “Variables and Secrets”
    - 新增变量 `AUTH_SERVER_URL`，值设为你的 Worker URL（如 `https://melody-auth.[your-account-name].workers.dev`）
2. 创建 D1 数据库：
    - 转到 “Storage & Databases” -> “D1 SQL Database”
    - 点击 “Create” 按钮
3. 创建 KV 存储：
    - 转到 “Storage & Databases” -> “KV”
    - 点击 “Create” 按钮

### 3. Cloudflare Worker Secrets 设置
在 Cloudflare 控制台：
1. 转到 “Compute(Workers)” -> “Workers & Pages”
2. 选择你的 `melody-auth` Worker
3. 点击 “Settings” -> “Variables and Secrets”
4. 为你打算使用的邮件、短信或社交登录服务提供商添加必要的环境变量。
    - [Email Provider Setup](https://auth.valuemelody.com/zh/email-provider-setup.html)
    - [SMS Provider Setup](https://auth.valuemelody.com/zh/sms-provider-setup.html)
    - [Social Sign-In Provider Setup](https://auth.valuemelody.com/zh/social-sign-in-provider-setup.html)
5. 定义环境变量 `ENVIRONMENT`，并确保其值不为 `dev`。

### 4. 项目设置
1. 克隆仓库并登录 Cloudflare：
    ```
    git clone git@github.com:ValueMelody/melody-auth.git
    cd melody-auth/server
    npm install
    npx wrangler login
    ```

2. 配置 `server/wrangler.toml`：将 KV 和 D1 的 ID 替换为你刚创建的资源：
    ```toml
    [[kv_namespaces]]
    binding = "KV"
    id = "your_kv_namespace_id"

    [[d1_databases]]
    binding = "DB"
    database_name = "melody-auth"
    database_id = "your_d1_database_id"
    ```

### 5. 首次部署
运行以下命令
```
cd server
npm run prod:secret:generate
npm run prod:migration:apply
npm run prod:deploy
```
**现在一切准备就绪**，你可以访问 `[your_worker_url]/.well-known/openid-configuration` 来验证部署是否成功。

### 6. 后续部署
拉取最新代码并重新部署：
```
git pull origin main
cd server
npm run prod:migration:apply # 如果有新的数据库迁移
npm run prod:deploy
```

## Cloudflare 本地/开发环境
若要搭建本地开发环境，请按照以下步骤：
```
git clone git@github.com:ValueMelody/melody-auth.git
cd melody-auth/server
npm install

cp .dev.vars.example .dev.vars
# 为你打算使用的邮件、短信或社交登录服务提供商添加必要的环境变量。
# 确保环境变量 "ENVIRONMENT" 在本地环境中设置为 "dev"。

npm run dev:secret:generate
npm run dev:migration:apply
npm run dev:start
```

## Cloudflare 多远程环境
当你需要在 Cloudflare 上管理多个远程环境（如 dev、demo、QA、staging、production）时，可以按以下步骤操作：
1. 资源预配：  
  在 Cloudflare 控制台为新环境创建 Worker、D1 和 KV 资源。
2. 复制配置文件：  
  复制server/wrangler.toml文件，并重命名为类似 `[envName].wrangler.toml`。
3. 更新资源标识：  
  编辑新的 `[envName].wrangler.toml` 文件，将资源名称、KV ID 和 D1 ID 替换为新环境对应的值。
4. 生成 Secrets：  
  使用新的配置文件运行生成密钥脚本：
    ```
    node ./src/scripts/generate-secret.cjs prod [envName].wrangler.toml
    ```
5. 应用 D1 迁移：  
  针对新环境的 D1 资源执行迁移命令：
    ```
    wrangler d1 migrations apply [d1 name for your new environment] --remote --config [envName].wrangler.toml
    ```
6. 部署 Worker：  
  使用新环境名称构建并部署 Worker：
    ```
    npm run build && wrangler deploy --minify src/index.tsx --config [envName].wrangler.toml
    ```

## Node 环境设置

### 1. Node、PostgreSQL 与 Redis 设置
首先搭建 PostgreSQL 与 Redis 服务器，并准备好连接字符串。同时请确保你使用的 <b>Node.js 版本在 20.05 或更高</b>，以保证兼容性。

### 2. 项目设置
```
git clone git@github.com:ValueMelody/melody-auth.git
cd melody-auth/server
npm install

cp .dev.vars.example .dev.vars
# 填写 PostgreSQL 与 Redis 连接字符串
# 为你打算使用的邮件、短信或社交登录服务提供商添加必要的环境变量。
# 确保环境变量 "ENVIRONMENT" 在本地环境中设置为 "dev"。

npm run node:secret:generate
npm run node:saml:secret:generate
npm run node:migration:apply
npm run node:dev
```
这将在 Node.js 环境下以开发模式启动服务器，并连接到本地或远程数据库。

### 3. 生产构建

在生产环境下进行构建与运行：
```
# 确保环境变量 "ENVIRONMENT" 在生产构建时设置为非 "dev" 值。
cd server
npm run node:build
npm run node:start
```

### 4. 后续部署
拉取最新代码并重新部署：
```
git pull origin main
cd server
npm run node:migration:apply # 如果有新的数据库迁移
npm run node:build
npm run node:start
```

## Node 开发环境（Docker）
- 在 `server/.dev.vars` 中设置所需的环境变量
```
cd server

cp .dev.vars.example .dev.vars
# 为 Docker 启用 PostgreSQL 与 Redis 连接字符串
PG_CONNECTION_STRING=postgres://admin:admin@postgres:5432/melody-auth
REDIS_CONNECTION_STRING=redis://redis:6379

# 为你打算使用的邮件、短信或社交登录服务提供商添加必要的环境变量。
# 确保环境变量 "ENVIRONMENT" 在本地环境中设置为 "dev"。
```

- 运行 docker compose
```
cd devops/docker
docker-compose up --build
```
