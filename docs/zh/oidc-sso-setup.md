# OIDC 认证提供商登录

Melody Auth 支持通过外部 OpenID Connect (OIDC) 身份提供商登录用户，这些提供商需要实现带有 PKCE 的 OAuth 2.0 授权码流程，并返回使用 RS256 签名且通过 JWKS 端点发布的 ID token。

本指南介绍如何启用 OIDC 提供商、显示登录按钮，以及在前端触发重定向。

## 1. 启用一个或多个 OIDC 提供商

1) 在 `server/wrangler.toml` 中，设置要启用的提供商名称列表：

```toml
[vars]
OIDC_AUTH_PROVIDERS = ["Auth0", "Azure"]
```

2) 对于该列表中的每个提供商名称，在 `server/src/configs/variable.ts` 的 `OIDCProviderConfigs` 中定义其配置：

```ts
export const OIDCProviderConfigs = Object.freeze({
  Auth0: {
    clientId: 'YOUR_AUTH0_CLIENT_ID',
    authorizeEndpoint: 'https://YOUR_DOMAIN.auth0.com/authorize',
    tokenEndpoint: 'https://YOUR_DOMAIN.auth0.com/oauth/token',
    jwksEndpoint: 'https://YOUR_DOMAIN.auth0.com/.well-known/jwks.json',
    enableSignInButton: true,
    enableSignInRedirect: true,
  },
  Azure: {
    clientId: 'YOUR_AZURE_AD_APP_CLIENT_ID',
    authorizeEndpoint: 'https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/token',
    jwksEndpoint: 'https://login.microsoftonline.com/YOUR_TENANT_ID/discovery/v2.0/keys',
    enableSignInButton: true,
    enableSignInRedirect: true,
  },
})
```

- `clientId`：你在提供商处的 OIDC 应用/客户端 ID。
- `authorizeEndpoint`：提供商授权端点。
- `tokenEndpoint`：提供商 token 端点，在交换授权码时必须返回 `id_token`。
- `jwksEndpoint`：提供商 JWKS URL，用于公开 ID token 的签名密钥。
- `enableSignInButton`：若为 true，则在 Melody Auth 页面上为此提供商显示登录按钮。
- `enableSignInRedirect`：若为 true，则可以通过前端策略触发 OIDC 重定向（见下文）。

注意：提供商名称区分大小写，配置后应保持不变，因为它们会用于路由和策略。

## 2. 在登录页面显示 OIDC 登录按钮

当 `OIDC_AUTH_PROVIDERS` 中包含某个提供商且其 `enableSignInButton` 为 true 时，Melody Auth 会渲染一个按钮，将用户重定向到提供商的授权端点，并带上 PKCE challenge。  
成功在提供商处登录后，用户将被重定向回：

```
[YOUR_AUTH_SERVER_URL]/identity/v1/authorize-oidc/[provider_name]
```

确保将该回调/重定向 URL 添加到提供商控制台的允许列表中（每个提供商都需要添加）。例如，对于本地开发环境下名为 `Auth0` 的提供商：

```
http://localhost:8787/identity/v1/authorize-oidc/Auth0
```

## 3. 在前端触发 OIDC 重定向（策略）

如果某个提供商的 `enableSignInRedirect` 为 true，则可以在前端 SDK 中传入策略名 `oidc_sso_[provider_name]` 来触发 OIDC 登录重定向。

使用 React SDK 的示例：

```ts
import { useAuth } from '@melody-auth/react'

export default function SignIn() {
  const { loginRedirect } = useAuth()

  const signInWithAuth0 = () => {
    loginRedirect({
      policy: 'oidc_sso_Auth0',
    })
  }

  return <button onClick={signInWithAuth0}>Sign in with Auth0</button>
}
```

更多详情可参考 Q&A：“如何在前端通过策略触发 OIDC SSO 登录重定向”。

## 4. 要求与注意事项

- 提供商必须支持带有 PKCE 的授权码模式，并在 token 端点返回 `id_token`。
- ID token 必须使用 RS256 签名，并可通过配置的 `jwksEndpoint` 验证。
- 服务器会通过 KV 验证 PKCE 的 `code_verifier` 以防篡改。
- 如果你的提供商的 token 响应与标准不同（例如缺少 `id_token`），可能需要在 `server/src/services/jwt.ts` 中调整验证逻辑。
