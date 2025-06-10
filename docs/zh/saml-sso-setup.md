# SAML SSO 设置

SAML SSO 当前仅在 Melody Auth 的 Node.js 环境中支持。

## 1. 在 wrangler.toml 中启用 SAML SSO
确保在服务器的 server/wrangler.toml 配置文件中启用了作为服务提供方（SP）的 SAML SSO：

```toml
ENABLE_SAML_SSO_AS_SP=true
```

## 2. 通过管理面板注册一个 SAML 身份提供商（IdP）

- 进入管理面板
- 点击 “管理 SAML”
- 点击 “创建” 按钮
- 为 IDP 定义一个唯一名称，并填写必要信息
- 点击 “保存” 按钮

## 3. 在前端触发 SAML SSO 登录

使用 Melody Auth 前端 SDK（例如 @melody-auth/react）提供的 loginRedirect 函数来发起登录流程：

```
  const {
    loginRedirect
  } = useAuth()

  loginRedirect({
    locale: locale || undefined, org: 'default',
    policy: 'saml_sso_[idp_name]' # 将 [idp_name] 替换为你在管理面板中创建的 IDP 名称
  })
```
