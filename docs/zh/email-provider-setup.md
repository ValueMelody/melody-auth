# 邮件服务商配置
Melody Auth 依赖邮件服务商来发送密码重置链接、邮箱验证通知以及基于邮箱的 MFA 验证码。您可以根据需求选择并配置 SendGrid、Mailgun、Brevo、Resend、Postmark，或（仅限 Node.js 环境）SMTP。

## 支持的邮件服务商
- **Cloudflare Workers 或 Node.js**：SendGrid、Mailgun、Brevo、Resend 和 Postmark
- **仅限 Node.js**：SMTP 服务器（除以上服务商外的额外选项）

## 设置邮件服务商名称
在您的 `server/wrangler.toml` 文件中，设置 `EMAIL_PROVIDER_NAME` 变量为您的邮件服务商名称。可用选项为 'smtp', 'sendgrid', 'mailgun', 'brevo', 'resend', 'postmark'
```toml
EMAIL_PROVIDER_NAME="smtp"
```

## 环境变量
使用下表配置您选择的邮件服务商。某些变量仅在使用特定服务商时为必填（例如 SendGrid）。

| 变量名 | 说明 | 示例值 |
|---------------|-------------|---------------|
| ENVIRONMENT | 决定邮件路由行为 | "prod" 或 "dev" |
| DEV_EMAIL_RECEIVER | 当 ENVIRONMENT ≠ prod 时，所有邮件都会发送到此地址（仅用于测试） | "test@example.com" |
| SENDGRID_API_KEY | SendGrid API Key（使用 SendGrid 时必填） | "SG.xxxxxxxxxxxxxxxxxxxxxxxx" |
| SENDGRID_SENDER_ADDRESS | SendGrid 中已验证的发件人邮箱地址（使用 SendGrid 时必填） | "noreply@yourdomain.com" |
| MAILGUN_API_KEY | Mailgun API Key（使用 Mailgun 时必填） | "xxxxxxxxxxxxxxxxxx-xxxxxxxxx" |
| MAILGUN_SENDER_ADDRESS | Mailgun 中已验证的发件人邮箱地址（使用 Mailgun 时必填） | "noreply@yourdomain.com" |
| BREVO_API_KEY | Brevo API Key（使用 Brevo 时必填） | "xkeysib-xxxxxxxxxxxxxxxxxxxxxxxx" |
| BREVO_SENDER_ADDRESS | Brevo 中已验证的发件人地址（使用 Brevo 时必填） | "noreply@yourdomain.com" |
| RESEND_API_KEY | Resend.com API Key（使用 Resend.com 时必填） | "re_xxxxxxxxxxxxxxxxxxxxxxx" |
| RESEND_SENDER_ADDRESS | Resend.com 中已验证的发件人地址（使用 Resend.com 时必填） | "noreply@yourdomain.com" |
| POSTMARK_API_KEY | Postmark API Key（使用 Postmark 时必填） | "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" |
| POSTMARK_SENDER_ADDRESS | Postmark 中已验证的发件人地址（使用 Postmark 时必填） | "noreply@yourdomain.com" |
| SMTP_SENDER_ADDRESS | SMTP 发件人邮箱地址（仅限 Node.js） | "noreply@yourdomain.com" |
| SMTP_CONNECTION_STRING | SMTP 连接字符串（仅限 Node.js） | "smtp://username:password@smtp.mailserver.com:587" |

## 生产环境与开发环境差异
- **生产环境（ENVIRONMENT = "prod"）**
  - 邮件会发送到实际用户邮箱。
  - 适用于正式部署。

- **开发环境（ENVIRONMENT ≠ "prod"）**
  - 所有邮件都会被重定向到 `DEV_EMAIL_RECEIVER`。
  - 避免在测试时向真实用户发送邮件。

## 服务商优先级
- 如果 EMAIL_PROVIDER_NAME 设置为有效服务商名称，则使用该服务商发送邮件。

- 如果 EMAIL_PROVIDER_NAME 未设置或设置为无效服务商名称：
  - **Node.js 环境**
    - 如果定义了 `SMTP_CONNECTION_STRING`，则始终使用 SMTP 发送邮件，而不考虑 SendGrid、Mailgun、Brevo、Resend 或 Postmark 设置。
    - 否则，如果同时配置了多个 API Key 和发件人地址，将按 SendGrid → Mailgun → Brevo → Resend → Postmark 的顺序选择可用服务商。

  - **Cloudflare 环境**
    - 忽略所有 SMTP 设置。
    - 如果同时配置了多个服务商，将按 SendGrid → Mailgun → Brevo → Resend → Postmark 的顺序选择可用服务商。

## Cloudflare 远程 / 生产环境配置
1. 进入 Cloudflare Dashboard → **Workers & Pages**。
2. 选择您的 **melody-auth** Worker → **Settings** → **Variables**。
3. 添加适用于您场景的环境变量。
4. 点击 **Save and deploy** 使改动立即生效。

## Cloudflare 本地 / 开发或 Node.js 环境
1. 在 `melody-auth/server` 目录中，找到或创建 `.dev.vars` 文件（如有需要，可复制 `.dev.vars.example`）。
2. 将适用的环境变量写入 `.dev.vars`。
