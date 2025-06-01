# SMS 服务商配置
Melody Auth 支持基于短信的多因素认证 (MFA)。要启用该功能，您需要将 **Twilio** 配置为短信服务商。

## 支持的短信服务商
- Twilio

## 环境变量
使用下表配置 Twilio 作为您的短信服务商。

| 变量名 | 说明 | 示例值 |
|---------------|-------------|---------------|
| ENVIRONMENT | 决定短信发送行为 | "prod" 或 "dev" |
| DEV_SMS_RECEIVER | 当 ENVIRONMENT ≠ "prod" 时，用于测试的接收号码 | "+16471231234" |
| TWILIO_ACCOUNT_ID | 您的 Twilio account id |  |
| TWILIO_AUTH_TOKEN | 您的 Twilio auth token |  |
| TWILIO_SENDER_NUMBER | 您的 Twilio 发送号码 |  |

## 生产环境与开发环境差异
- **生产环境（ENVIRONMENT = "prod"）**
  - 短信将发送到真实用户手机号。
  - 适用于正式部署。

- **开发环境（ENVIRONMENT ≠ "prod"）**
  - 所有短信都会被重定向到 `DEV_SMS_RECEIVER` 指定的号码。
  - 适用于测试阶段，避免向真实用户发送短信。

## Cloudflare 远程 / 生产环境配置
1. 进入 Cloudflare Dashboard → **Workers & Pages**。
2. 选择您的 **melody-auth** Worker → **Settings** → **Variables**。
3. 添加适用于您场景的环境变量。
4. 点击 **Save and deploy** 使改动立即生效。

## Cloudflare 本地 / 开发或 Node.js 环境
1. 在 `melody-auth/server` 目录中，找到或创建 `.dev.vars` 文件（如有需要，可复制 `.dev.vars.example`）。
2. 将适用的环境变量写入 `.dev.vars`。

## SMS MFA 默认国家码
SMS MFA 默认国家码为 **+1**。您可以在 `server/src/configs/variable.ts` 的 `SmsMfaConfig` 中修改 `defaultCountryCode`。
