# JWT & JWKS

Melody Auth sign JWT access tokens using RS256 algorithm. You can verify the tokens with the JWKS endpoint published by your Auth Server.

## Overview

- Melody Auth issues RS256-signed JWT access tokens for SPAs.
- Verify tokens with the Auth Server JWKS endpoint: `[AUTH_SERVER]/.well-known/jwks.json`.
- Always validate the JWT signature, algorithm, and critical claims like `aud` (audience) and `iss` (issuer).

## JWKS endpoint and key rotation

- The JWKS endpoint exposes the current public keys by `kid` (key ID).
- Keys may rotate. Use a JWKS client that supports caching and rate limiting.
- On verification, use the token header `kid` to select the correct public key.

## Node.js example (TypeScript)

```ts
import { verify, JwtHeader } from 'jsonwebtoken'
import jwksClient, { SigningKey } from 'jwks-rsa'

// Required environment variables
// NEXT_PUBLIC_SERVER_URI: base URL of your Auth Server (e.g. https://auth-server.example.com)
// EXPECTED_AUDIENCE: the audience your API expects

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

// Example Express middleware
export async function requireAuth(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers['authorization'] as string | undefined
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    if (!token) return res.status(401).json({ error: 'Missing access token' })
    const claims = await verifyAccessTokenRaw(token)
    // Optionally enforce additional checks (e.g., scopes/roles) here
    req.user = claims
    next()
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired token', details: err?.message })
  }
}
```
