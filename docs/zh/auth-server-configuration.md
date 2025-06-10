# 认证服务器配置
Melody Auth 提供了一系列可自定义选项，以便您根据实际需求对认证服务器进行个性化设置。您可以通过修改 `server/wrangler.toml` 文件中 `[vars]` 段的值来调整这些配置。

## 应用配置变更:
1. 在您喜欢的文本编辑器中打开 `server/wrangler.toml`。
2. 找到 `[vars]` 段。
3. 根据需要修改其中的值。
4. 保存文件。
5. 重新部署或重启服务器

## 信息类配置

### COMPANY_LOGO_URL
- **默认值：** https://valuemelody.com/logo.svg
- **说明：** 身份验证页面上显示的 Logo 地址。

### COMPANY_EMAIL_LOGO_URL
- **默认值：** https://valuemelody.com/logo.jpg
- **说明：** 邮件中显示的 Logo 地址。请注意，部分邮件客户端可能不支持 SVG 格式。

### EMAIL_SENDER_NAME
- **默认值：** "Melody Auth"
- **说明：** 发送给用户的邮件中的发件人显示名称。

### TERMS_LINK
- **默认值：** ""
- **说明：** 您的服务条款链接。如果设置，则在注册页面会显示该链接。

### PRIVACY_POLICY_LINK
- **默认值：** ""
- **说明：** 您的隐私政策链接。如果设置，则在注册页面会显示该链接。


## 语言相关配置

### SUPPORTED_LOCALES
- **默认值：** ['en', 'fr']
- **说明：** 身份验证页面及邮件模板可用的语言列表。

### ENABLE_LOCALE_SELECTOR
- **默认值：** true
- **说明：** 是否允许用户在身份验证页面切换语言。如果 `SUPPORTED_LOCALES` 只包含一种语言，则语言选择器会被隐藏。


## 功能开关配置

### ENABLE_SIGN_UP
- **默认值：** true
- **说明：** 是否允许新用户注册。如果设为 `false`，登录页面将隐藏注册按钮。

### ENABLE_PASSWORD_SIGN_IN
- **默认值：** true
- **说明：** 是否启用密码登录。若您想仅允许社交登录，请同时将 `ENABLE_SIGN_UP`、`ENABLE_PASSWORD_SIGN_IN` 与 `ENABLE_PASSWORD_RESET` 设为 `false`。

### ENABLE_PASSWORDLESS_SIGN_IN
- **默认值：** false
- **说明：** 是否启用无密码登录。设置为 `true` 时，将自动把以下参数设为 `false`：ENABLE_SIGN_UP、ENABLE_PASSWORD_SIGN_IN、ENABLE_PASSWORD_RESET、ALLOW_PASSKEY_ENROLLMENT。请注意，当同时启用无密码登录和邮件 MFA 时，体验可能并不理想。

### ENABLE_PASSWORD_RESET
- **默认值：** true
- **说明：** 是否启用密码重置功能。如果设为 `false`，则隐藏“忘记密码”入口。  
- 需要先完成 [邮件服务商配置](https://auth.valuemelody.com/zh/email-provider-setup.html)

### ENABLE_NAMES
- **默认值：** true
- **说明：** 注册时是否显示名字与姓氏字段。如果设为 `false`，则隐藏该字段。

### NAMES_IS_REQUIRED
- **默认值：** false
- **说明：** 在启用 `ENABLE_NAMES` 时，是否要求用户必须填写名字与姓氏。

### ENABLE_USER_APP_CONSENT
- **默认值：** true
- **说明：** 用户在认证后是否需要为每个应用授权。

### ENABLE_EMAIL_VERIFICATION
- **默认值：** true
- **说明：** 注册后向用户发送验证邮件。  
- 需要先完成 [邮件服务商配置](https://auth.valuemelody.com/zh/email-provider-setup.html)

### REPLACE_EMAIL_VERIFICATION_WITH_WELCOME_EMAIL
- **默认值：** false
- **说明：** 当 `ENABLE_EMAIL_VERIFICATION` 和 `REPLACE_EMAIL_VERIFICATION_WITH_WELCOME_EMAIL` 同时为 `true` 时，注册后的验证邮件将被欢迎邮件替代。

### ENABLE_ORG
- **默认值：** false
- **说明：** 是否启用组织功能。若设为 `true`，用户可通过 S2S API 和管理面板创建及管理组织。

### ENABLE_USER_ATTRIBUTE
- **默认值：** false
- **说明：** 是否启用用户属性功能。若设为 `true`，用户可通过 S2S API 和管理面板创建及管理用户属性。

### BLOCKED_POLICIES
- **默认值：** []
- **说明：** 阻止指定策略（change_password、change_email、reset_mfa、manage_passkey、update_info）的触发，防止终端用户执行相应操作。

### EMBEDDED_AUTH_ORIGINS
- **默认值：** []
- **说明：** 允许使用嵌入式认证 API 的前端应用源列表。

### ENABLE_SAML_SSO_AS_SP
- **默认值：** false
- **说明：** 是否启用 SAML SSO 作为服务提供方（SP）功能。若设为 `true`，用户可通过配置的 SAML SSO 登录。

## 认证相关配置

### AUTHORIZATION_CODE_EXPIRES_IN
- **默认值：** 300（5 分钟）  
- **说明：** 授权码的有效期（秒）。

### SPA_ACCESS_TOKEN_EXPIRES_IN
- **默认值：** 1800（30 分钟）  
- **说明：** 单页应用（SPA）获取的 Access Token 有效期。

### SPA_REFRESH_TOKEN_EXPIRES_IN
- **默认值：** 604800（7 天）
- **说明：** SPA 获取的 Refresh Token 有效期。

### S2S_ACCESS_TOKEN_EXPIRES_IN
- **默认值：** 3600（1 小时）
- **说明：** 服务到服务（S2S）应用获取的 Access Token 有效期。

### ID_TOKEN_EXPIRES_IN
- **默认值：** 1800（30 分钟）
- **说明：** ID Token 的有效期。

### SERVER_SESSION_EXPIRES_IN
- **默认值：** 1800（30 分钟）
- **说明：** 服务端会话过期时间。若设为 0，则禁用服务端会话。


## 多因素认证 (MFA) 配置

### OTP_MFA_IS_REQUIRED
- **默认值：** false
- **说明：** 若设为 `true`，用户必须在登录时设置基于 TOTP 的 MFA（如 Google Authenticator）。

### SMS_MFA_IS_REQUIRED
- **默认值：** false
- **说明：** 若设为 `true`，用户必须通过短信验证码确认登录。  
- 需要先完成 [短信服务商配置](https://auth.valuemelody.com/zh/sms-provider-setup.html)

### EMAIL_MFA_IS_REQUIRED
- **默认值：** false
- **说明：** 若设为 `true`，用户必须通过邮件验证码确认登录。  
- 需要先完成 [邮件服务商配置](https://auth.valuemelody.com/zh/email-provider-setup.html)

### ENFORCE_ONE_MFA_ENROLLMENT
- **默认值：** ['otp', 'email']
- **说明：** 当所有 *_MFA_IS_REQUIRED 均为 `false` 时，用此列表强制用户至少注册其中一种 MFA 类型：['otp', 'sms', 'email']。若为空数组，则不强制任何 MFA。  
- 若列表包含 'email'，需要先完成 [邮件服务商配置](https://auth.valuemelody.com/zh/email-provider-setup.html)  
- 若列表包含 'sms'，需要先完成 [短信服务商配置](https://auth.valuemelody.com/zh/sms-provider-setup.html)

### ALLOW_EMAIL_MFA_AS_BACKUP
- **默认值：** true
- **说明：** 允许已注册 OTP 或 SMS 但未注册邮件 MFA 的用户将邮件 MFA 作为备份。  
- 需要先完成 [邮件服务商配置](https://auth.valuemelody.com/zh/email-provider-setup.html)

### ALLOW_PASSKEY_ENROLLMENT
- **默认值：** false
- **说明：** 是否允许注册 Passkey。若设为 `true`，用户在注册时可设置 Passkey；使用 Passkey 登录时可以跳过密码与 MFA。


## 暴力破解防护配置

### ACCOUNT_LOCKOUT_EXPIRES_IN
- **默认值：** 86400（1 天）
- **说明：** 当登录失败次数过多导致账户被锁后，锁定持续时间（秒）。若设为 0，则账户将保持锁定直到手动重置。

### UNLOCK_ACCOUNT_VIA_PASSWORD_RESET
- **默认值：** true
- **说明：** 是否允许用户通过重置密码解锁账户。

### PASSWORD_RESET_EMAIL_THRESHOLD
- **默认值：** 5
- **说明：** 每邮箱/IP 每日可触发的密码重置邮件最大次数。设为 0 则不限制。

### EMAIL_MFA_EMAIL_THRESHOLD
- **默认值：** 10
- **说明：** 每账号/IP 在 30 分钟窗口内可触发的邮件 MFA 次数上限。设为 0 则不限制。

### CHANGE_EMAIL_EMAIL_THRESHOLD
- **默认值：** 5
- **说明：** 每账号在 30 分钟窗口内可触发的更换邮箱请求上限。设为 0 则不限制。

### SMS_MFA_MESSAGE_THRESHOLD
- **默认值：** 5
- **说明：** 每账号/IP 在 30 分钟窗口内可触发的短信 MFA 次数上限。设为 0 则不限制。

### ACCOUNT_LOCKOUT_THRESHOLD
- **默认值：** 5
- **说明：** 登录失败达到此次数后锁定账户。设为 0 则不锁定。


## 社交登录配置

### GOOGLE_AUTH_CLIENT_ID
- **默认值：** undefined
- **说明：** Google Client ID（来源于 Google Developer Console）。为空时隐藏 Google 登录按钮。

### FACEBOOK_AUTH_CLIENT_ID
- **默认值：** undefined
- **说明：** Facebook Client ID（来源于 Facebook Developer Console）。为空时隐藏 Facebook 登录按钮。  
- 注意：还需在 `.dev.vars` 或 Cloudflare Worker 环境变量中设置 `FACEBOOK_AUTH_CLIENT_SECRET`。

### GITHUB_AUTH_CLIENT_ID & GITHUB_AUTH_APP_NAME
- **默认值：** undefined
- **说明：** GitHub Client ID 与 App Name（来源于 GitHub Developer Console）。为空时隐藏 GitHub 登录按钮。  
  **在您的 GitHub App 设置中，将回调 URL 设置为 `[您的认证服务器域]/identity/v1/authorize-github`，例如 `http://localhost:8787/identity/v1/authorize-github`**  
- 注意：还需在 `.dev.vars` 或 Cloudflare Worker 环境变量中设置 `GITHUB_AUTH_CLIENT_SECRET`。

### DISCORD_AUTH_CLIENT_ID
- **默认值：** undefined
- **说明：** Discord Client ID（来源于 Discord Developer Console）。为空时隐藏 Discord 登录按钮。  
  **在您的 Discord App 设置中，将重定向 URI 设置为 `[您的认证服务器域]/identity/v1/authorize-discord`，例如 `http://localhost:8787/identity/v1/authorize-discord`**  
- 注意：还需在 `.dev.vars` 或 Cloudflare Worker 环境变量中设置 `DISCORD_AUTH_CLIENT_SECRET`。

### APPLE_AUTH_CLIENT_ID
- **默认值：** undefined
- **说明：** Apple Client ID（来源于 Apple Developer Console）。为空时隐藏 Apple 登录按钮。  
  **在您的 Apple App 设置中，将重定向 URI 设置为 `[您的认证服务器域]/identity/v1/authorize-apple`，例如 `http://localhost:8787/identity/v1/authorize-apple`**  
- 注意：还需在 `.dev.vars` 或 Cloudflare Worker 环境变量中设置 `APPLE_AUTH_CLIENT_SECRET`。该密钥具有有限有效期，需要定期更新。

### OIDC_AUTH_PROVIDERS
- **默认值：** undefined
- **说明：** OIDC 认证提供商列表。设置后名称不应再修改。该提供商需支持标准 OAuth 2.0 PKCE 及 JWKS 端点。示例：`['Auth0', 'Azure']`。您必须在 `src/configs/variable.ts` 文件中为每个 OIDC_AUTH_PROVIDER 提供相应配置。


## 日志配置

### LOG_LEVEL
- **默认值：** silent
- **说明：** 控制日志详细程度。有效值：  
  - silent：关闭所有日志  
  - info：输出信息级和错误级日志  
  - warn：输出警告级和错误级日志  
  - error：仅输出错误级日志  
- 注意：在 `dev` 环境下，将强制将日志级别设为 `info`，无论您的配置如何。

### ENABLE_EMAIL_LOG
- **默认值：** false
- **说明：** 若设为 `true`，记录发出的邮件日志。启用前请确保您有清理或保留策略。

### ENABLE_SMS_LOG
- **默认值：** false
- **说明：** 若设为 `true`，记录发出的短信日志。启用前请确保您有清理或保留策略。

### ENABLE_SIGN_IN_LOG
- **默认值：** false
- **说明：** 记录用户登录 IP（仅生产环境）及地理位置数据（仅 Cloudflare）。启用后您必须：  
  - 实现清理计划  
  - 在隐私政策中披露数据收集  
  - 遵守适用的隐私与数据法规。
