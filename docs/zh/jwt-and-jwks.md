# JWT 与 JWKS

Melody Auth 使用 RS256 算法签署 JWT access tokens。你可以使用 Auth Server 发布的 JWKS 端点来验证这些 tokens。

## 概述

- Melody Auth 为 SPA 签发 RS256 签名的 JWT access tokens。
- 使用 Auth Server 的 JWKS 端点验证 tokens: `[AUTH_SERVER]/.well-known/jwks.json`。
- 始终验证 JWT 的签名、算法，以及关键声明（claims），例如 `aud`（audience）和 `iss`（issuer）。

## JWKS 端点与密钥轮换

- JWKS 端点按 `kid`（key ID）公开当前的公钥。
- 密钥可能会轮换。使用支持缓存和速率限制的 JWKS 客户端。
- 验证时，使用 token 头部的 `kid` 选择正确的公钥。

## Node.js 示例（TypeScript）

```ts
import { verify, JwtHeader } from 'jsonwebtoken'
import jwksClient, { SigningKey } from 'jwks-rsa'

// 必需的环境变量
// NEXT_PUBLIC_SERVER_URI: Auth Server 的基础 URL（例如 https://auth-server.example.com）
// EXPECTED_AUDIENCE: API 期望的 audience

const client = jwksClient({
  jwksUri: `${process.env.NEXT_PUBLIC_SERVER_URI}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
})

function getKey(header: JwtHeader, callback: (err: Error | null, key?: string) => void) {
  if (!header.kid) return callback(new Error('Missing kid in token header'))
  client.getSigningKey(header.kid, (err: Error | null, key?: SigningKey) => {
    if (err || !key) return callback(err || new Error('Signing key not found'))
    const signingKey = (key as any).publicKey || (key as any).rsaPublicKey
    callback(null, signingKey)
  })
}

export function verifyAccessTokenRaw(token: string): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    verify(
      token,
      getKey,
      {
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) return reject(err)
        resolve(decoded as Record<string, any>)
      },
    )
  })
}

// Express 中间件示例
export async function requireAuth(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers['authorization'] as string | undefined
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    if (!token) return res.status(401).json({ error: 'Missing access token' })
    const claims = await verifyAccessTokenRaw(token)
    // 可选：在此添加额外检查（例如 scopes/roles）
    req.user = claims
    next()
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired token', details: err?.message })
  }
}
```