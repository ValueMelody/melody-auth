# 多重认证（MFA）设置

MFA 在你的主要登录方式上增加了一层额外的安全保护。Melody Auth 支持 Email、OTP（TOTP）和 SMS MFA，以及相关功能，例如 Passkey、Recovery Codes 和 Remember Device。

## 在服务器层面配置 MFA

在 `server/wrangler.toml` 中配置以下环境变量：

```toml
# 在登录时强制使用特定的 MFA 方式
OTP_MFA_IS_REQUIRED=false
EMAIL_MFA_IS_REQUIRED=false # 需要已配置邮箱服务提供商
SMS_MFA_IS_REQUIRED=false   # 需要已配置短信服务提供商

# 当所有 *_IS_REQUIRED=false 时，强制至少注册一个允许的 MFA 方式
ENFORCE_ONE_MFA_ENROLLMENT=['otp', 'email'] # 选项: 'email', 'otp', 'sms'

# 当主 MFA 方式不可用时，允许 Email MFA 作为备用方式
ALLOW_EMAIL_MFA_AS_BACKUP=true

# 相关功能
ALLOW_PASSKEY_ENROLLMENT=false   # 启用 passkey 注册流程
ENABLE_RECOVERY_CODE=false       # 启用恢复代码
ENABLE_MFA_REMEMBER_DEVICE=false # 允许用户记住设备 30 天
```

- 如果 OTP_MFA_IS_REQUIRED、EMAIL_MFA_IS_REQUIRED 或 SMS_MFA_IS_REQUIRED 中的任何一个为 true，则该 MFA 方式在登录时是必需的。
- 当三者都为 false 时，ENFORCE_ONE_MFA_ENROLLMENT 可以要求用户至少注册一个允许列表中的 MFA 方式。
- 在启用相应的 MFA 类型之前，请先配置 Email/SMS 服务提供商。

## 注册方式

- Admin Panel：管理员可以注册或取消注册 MFA，并管理恢复选项。
- S2S API：从后端以编程方式驱动注册流程。
- Embedded Auth API：从前端以编程方式驱动注册流程。

## Passkey

Passkey 提供安全、防钓鱼的无密码登录，并允许用户跳过 MFA。启用方式：

- 将 ALLOW_PASSKEY_ENROLLMENT 设置为 true

## Recovery codes

Recovery codes 允许用户在忘记密码或无法完成 MFA 时重新获得访问权限。

- 将 ENABLE_RECOVERY_CODE 设置为 true

## 记住此设备（30 天）

用户可以选择在受信任设备上跳过 30 天的 MFA 验证。

- 将 ENABLE_MFA_REMEMBER_DEVICE 设置为 true

## 应用层面的 MFA 配置

可以针对每个应用（client）单独配置 MFA 行为，而不是全局配置。

- Admin Panel：打开目标应用并配置 MFA 要求（例如必需因子、Email 作为备份）。
- S2S API：以编程方式更新应用的 MFA 配置。

当不同应用需要不同的安全等级时（例如，内部管理应用需要更严格的 MFA）非常有用。然而，这项设置与 ENFORCE_ONE_MFA_ENROLLMENT 设置冲突，因此你需要仔细考虑其影响。
![App-level MFA](https://raw.githubusercontent.com/ValueMelody/melody-auth/main/docs/images/app_level_mfa.jpg)

## 相关 policy（快捷方式）

你可以通过 policy 直接跳转到特定流程：

- `reset_mfa`：重置已注册的 MFA
- `manage_recovery_code`：管理恢复代码
- `manage_passkey`：管理 passkey
