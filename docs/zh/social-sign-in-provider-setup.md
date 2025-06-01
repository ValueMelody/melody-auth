# 社交登录配置
Melody Auth 内置支持以下社交身份提供商：
- Google
- Facebook
- GitHub
- Discord
- Apple

## Google 登录
1. 在 `server/wrangler.toml` 的 vars 段设置 `GOOGLE_AUTH_CLIENT_ID`。

## Facebook 登录
1. 在 `server/wrangler.toml` 的 vars 段设置 `FACEBOOK_AUTH_CLIENT_ID`。
2. 在 `server/.dev.vars` 文件中或 Cloudflare Worker 环境变量中设置 `FACEBOOK_AUTH_CLIENT_SECRET`。

## GitHub 登录
1. 在 `server/wrangler.toml` 的 vars 段设置 `GITHUB_AUTH_CLIENT_ID`。
2. 在 `server/.dev.vars` 文件中或 Cloudflare Worker 环境变量中设置 `GITHUB_AUTH_CLIENT_SECRET`。
3. 在 GitHub App 设置中，将回调 URL 设置为 [您的 auth 域名]/identity/v1/authorize-github，例如 `http://localhost:8787/identity/v1/authorize-github`。

## Discord 登录
1. 在 `server/wrangler.toml` 的 vars 段设置 `DISCORD_AUTH_CLIENT_ID`。
2. 在 `server/.dev.vars` 文件中或 Cloudflare Worker 环境变量中设置 `DISCORD_AUTH_CLIENT_SECRET`。
3. 在 Discord App 设置中，将重定向 URI 设置为 [您的 auth 域名]/identity/v1/authorize-discord，例如 `http://localhost:8787/identity/v1/authorize-discord`。

## Apple 登录
1. 在 `server/wrangler.toml` 的 vars 段设置 `APPLE_AUTH_CLIENT_ID`。
2. 在 `server/.dev.vars` 文件中或 Cloudflare Worker 环境变量中设置 `APPLE_AUTH_CLIENT_SECRET`（可参考 Apple 文档创建 client secret：<https://developer.apple.com/documentation/AccountOrganizationalDataSharing/creating-a-client-secret>）。
3. 在 Apple App 设置中，将重定向 URI 设置为 [您的 auth 域名]/identity/v1/authorize-apple，例如 `http://localhost:8787/identity/v1/authorize-apple`。
