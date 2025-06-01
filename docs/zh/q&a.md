# 常见问题

## 如何验证 SPA 访问令牌
在验证使用 **RSA256** 算法的 SPA 访问令牌时，你可以通过访问 `[你的 Auth Server 地址]/.well-known/jwks.json` 获取 **JWKS (JSON Web Key Set)** 来获得公钥。下面的示例展示了如何使用 **jwks‑rsa** 库来验证令牌：

```ts
import { verify } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa' 

// 初始化 JWKS 客户端，用于获取签名密钥
const client = jwksClient({ jwksUri: `${process.env.NEXT_PUBLIC_SERVER_URI}/.well-known/jwks.json` })

// 从 JWKS 端点检索签名密钥
const getKey = (header, callback) => {
  return client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err)
    } else {
      const signingKey = key.publicKey || key.rsaPublicKey
      callback(null, signingKey)
    }
  })
}

// 验证 JWT 的函数
const verifyJwtToken = (token: string) => {
  return new Promise((resolve, reject) => {
    verify(token, getKey, {}, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}

// 从请求头中验证访问令牌
export const verifyAccessToken = async () => {
  const headersList = headers()
  const authHeader = headersList.get('authorization')
  const accessToken = authHeader?.split(' ')[1]

  if (!accessToken) return false

  const tokenBody = await verifyJwtToken(accessToken)

  if (!tokenBody) return false

  return true
}
```

## 如何支持新的语言环境
该项目默认支持 **英语 (EN)** 和 **法语 (FR)**。若要添加其他语言环境，请执行以下步骤：
- 更新 `server/src/configs/locale.ts` 文件，并为新的语言环境提供翻译。
- 在 **SUPPORTED_LOCALES** 环境变量数组中加入新的语言代码。

## 如何轮换 JWT 密钥
如需轮换 JWT 密钥，请执行以下步骤：
1. **生成新的 JWT 密钥**  
   根据你的运行环境执行密钥生成脚本。  
   脚本执行完毕后，一对新的 JWT 密钥将立即生效；旧密钥会被标记为弃用——这意味着旧密钥将不再用于签名新的令牌，但仍可用于验证已签名的旧令牌。
    ```bash
    cd server
    npm run node:secret:generate # Node 环境
    npm run dev:secret:generate  # Cloudflare 本地环境
    npm run prod:secret:generate # Cloudflare 远程环境
    ```

2. **清理旧密钥**  
   当你希望停止验证由旧密钥签名的令牌时，运行清理脚本。脚本执行完毕后，旧密钥将被移除，所有由旧密钥签名的令牌将失效。
    ```bash
    cd server
    npm run node:secret:clean # Node 环境
    npm run dev:secret:clean  # Cloudflare 本地环境
    npm run prod:secret:clean # Cloudflare 远程环境
    ```

## 如何配置 MFA
- **强制指定的 MFA 类型**：将 `OTP_MFA_IS_REQUIRED`、`SMS_MFA_IS_REQUIRED` 或 `EMAIL_MFA_IS_REQUIRED` 设置为 `true`，即可在登录时强制要求对应的 MFA。
- **让用户在多种 MFA 中任选其一**：当 `OTP_MFA_IS_REQUIRED`、`SMS_MFA_IS_REQUIRED` 和 `EMAIL_MFA_IS_REQUIRED` 均为 `false` 时，可将 `ENFORCE_ONE_MFA_ENROLLMENT` 设置为要支持的 MFA 类型数组，用户必须在这些类型中至少注册一种。
- 你也可以通过 **管理后台** 或 **S2S API** 提供的 MFA 注册功能，自定义 MFA 注册流程。

## 如何触发不同的策略 (policy)
- 在将用户重定向到授权页面时，只需在查询字符串中添加 `policy=[policy]` 即可触发不同策略：
    ```ts
      const url = serverUri +
        '/oauth2/v1/authorize?' +
        'response_type=code' +
        '&state=' + state +
        '&client_id=' + clientId +
        '&redirect_uri=' + redirectUri +
        '&code_challenge=' + codeChallenge +
        '&code_challenge_method=S256' +
        '&policy=' + policy +
        '&scope=' + scope +
        '&locale=' + locale
      window.location.href = url
    ```
- 在 **React SDK** 中，可通过 `loginRedirect` 并传入 `policy` 参数来触发：
    ```ts
    const { loginRedirect } = useAuth()

    loginRedirect({
      policy: 'change_password',
    })
    ```
- **支持的策略**
  - `sign_in_or_sign_up`：默认策略
  - `update_info`：允许用户更新信息
  - `change_password`：允许用户修改密码（仅限密码登录用户）。需要将 `ENABLE_PASSWORD_RESET` 设置为 `true`
  - `change_email`：允许用户修改邮箱（仅限密码登录用户）。需要将 `ENABLE_EMAIL_VERIFICATION` 设置为 `true`
  - `reset_mfa`：允许用户重置已注册的 MFA
  - `manage_passkey`：允许用户管理 Passkey。需要将 `ALLOW_PASSKEY_ENROLLMENT` 设置为 `true`

## 如何更改授权页的主题 / 品牌
- 通过修改 `server/src/configs/variable.ts` 中的 `DefaultBranding` 变量即可更改默认主题 / 品牌。
- 若想针对不同客户端使用不同的主题 / 品牌，请按以下步骤操作：
  1. 在 `server/wrangler.toml` 中将 `ENABLE_ORG` 设置为 `true`
  2. 在管理后台创建新的 **组织 (org)**，并设置唯一的 slug
  3. 在管理后台为该组织配置主题 / 品牌
  4. 在重定向到授权页面时，添加查询字符串 `org=[slug]`

## 如何让自定义角色拥有模拟登录 (impersonation) 权限
默认仅 `super_admin` 角色能模拟登录其他账号。若要让自定义角色也能执行模拟登录：
- 在 `server/src/configs/variable.ts` 中，将该角色添加到 `impersonationRoles` 数组（S2S API 权限）
- 在 `admin-panel/tools/access.ts` 中，将 `Access.Impersonation` 添加到该角色的 `allowedAccesses` 数组（管理后台权限）
