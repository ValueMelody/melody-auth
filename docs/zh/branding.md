# 品牌化

自定义托管授权（身份）页面和邮件模板的外观和样式。

## 可自定义内容
- Logo 和邮件 logo：`COMPANY_LOGO_URL`、`COMPANY_EMAIL_LOGO_URL`
- 字体：`fontFamily`、`fontUrl`
- 颜色：
  - `layoutColor`、`labelColor`
  - `primaryButtonColor`、`primaryButtonLabelColor`、`primaryButtonBorderColor`
  - `secondaryButtonColor`、`secondaryButtonLabelColor`、`secondaryButtonBorderColor`
  - `criticalIndicatorColor`
- 页脚链接：`termsLink`、`privacyPolicyLink`

这些值会被身份页面布局和组件使用。例如，`layoutColor` 控制页面背景，`labelColor` 控制文字颜色，按钮颜色决定了主要/次要操作的样式。

## 全局默认（所有客户端）
有两个位置可以配置全局品牌化：

1) 在代码中编辑默认值
- 文件：`server/src/configs/variable.ts`
- 更新 `DefaultBranding` 枚举的值，以设置字体和颜色的全局默认。

2) 通过环境变量设置 logo 和法律链接
- 文件：`server/wrangler.toml` → `[vars]`
- 设置：
  - `COMPANY_LOGO_URL`
  - `COMPANY_EMAIL_LOGO_URL`
  - `TERMS_LINK`
  - `PRIVACY_POLICY_LINK`

更改后，重新部署或重启服务器。

## 按组织定制品牌化
为特定组织（tenants/clients）覆盖品牌化配置：

1) 启用组织功能
- 在 `server/wrangler.toml` 中的 `[vars]` 下，将 `ENABLE_ORG = true`。

2) 创建组织并设置品牌化
- 打开 Admin Panel。
- 转到 `Orgs` 标签页。
- 创建一个具有唯一 slug 的新组织。
- 配置该组织的品牌化（logo、颜色、字体、链接）。

3) 将用户路由到该组织的品牌页面
- 在授权重定向 URL 中将组织 slug 作为查询参数添加：`org=<slug>`
- 示例：`https://your-auth-server/identity/v1/authorize?client_id=...&redirect_uri=...&response_type=code&org=acme`

### 前端 SDK 示例

如果你使用的是前端 SDK，将 `org` 参数传递给 `loginRedirect`（或 `loginPopup`）：

```tsx
import { useAuth } from '@melody-auth/react'

export default function SignInButton() {
  const { isAuthenticated, loginRedirect } = useAuth()

  const signInAcme = () => {
    loginRedirect({ org: 'acme' })
  }

  if (isAuthenticated) return null
  return <button onClick={signInAcme}>Sign in to Acme</button>
}
```

如果指定了组织（org）并且允许使用该组织进行公共注册，则你为该组织设置的值会覆盖身份页面和邮件中的全局默认值。
