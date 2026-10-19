import {
  createRemoteJWKSet, errors, importSPKI, jwtVerify, JWTPayload, JWTVerifyOptions,
} from 'jose'

export interface TokenVerificationOptions {
  /** PEM-encoded RSA public key. Either publicKey or jwksUri is required. */
  publicKey?: string;
  /** Trusted JWKS endpoint, never taken from a cookie or token. */
  jwksUri?: string;
  /** Expected token issuer. */
  issuer?: string;
  /** Expected authorized party, and audience for ID tokens. */
  clientId: string;
}

// Isolate cached keys by their trusted source, including across SDK instances.
const publicKeys = new Map<string, Awaited<ReturnType<typeof importSPKI>>>()
const remoteKeySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

async function verifySignedClaims (
  token: string,
  options: TokenVerificationOptions,
  verificationOptions: JWTVerifyOptions,
): Promise<JWTPayload> {
  if (options.publicKey) {
    let key = publicKeys.get(options.publicKey)
    if (!key) {
      key = await importSPKI(
        options.publicKey,
        'RS256',
      )
      publicKeys.set(
        options.publicKey,
        key,
      )
    }
    return (await jwtVerify(
      token,
      key,
      verificationOptions,
    )).payload
  }

  if (options.jwksUri) {
    let keySet = remoteKeySets.get(options.jwksUri)
    if (!keySet) {
      keySet = createRemoteJWKSet(new URL(options.jwksUri))
      remoteKeySets.set(
        options.jwksUri,
        keySet,
      )
    }
    return (await jwtVerify(
      token,
      keySet,
      verificationOptions,
    )).payload
  }

  throw new Error('Either publicKey or jwksUri must be provided')
}

/**
 * Verifies a token's signature and claims.
 * An expired ID token is accepted, because ID tokens are not reissued on refresh; callers must
 * bind it to a verified access token with assertMatchingIdentity.
 */
export async function verifyToken (
  token: unknown,
  options: TokenVerificationOptions,
  kind: 'access' | 'id',
): Promise<JWTPayload> {
  if (typeof token !== 'string' || !token) throw new Error('Missing token')
  if (typeof options.clientId !== 'string' || !options.clientId) throw new Error('clientId must be provided')

  let payload: JWTPayload
  try {
    payload = await verifySignedClaims(
      token,
      options,
      {
        algorithms: ['RS256'],
        requiredClaims: ['exp', 'sub', 'iss', 'azp'],
        issuer: options.issuer,
        audience: kind === 'id' ? options.clientId : undefined,
      },
    )
  } catch (error) {
    // jose raises JWTExpired for exp only after the signature, issuer, audience and nbf checks pass.
    if (kind !== 'id' || !(error instanceof errors.JWTExpired) || error.claim !== 'exp') throw error
    payload = error.payload
  }

  if (typeof payload.sub !== 'string' || !payload.sub ||
      typeof payload.azp !== 'string' || !payload.azp) {
    throw new Error('Invalid token identity')
  }
  if (payload.azp !== options.clientId) {
    throw new Error('Unexpected token client')
  }
  // Melody Auth access tokens have a scope claim; ID tokens cannot substitute for them.
  if (kind === 'access' && typeof payload.scope !== 'string') {
    throw new Error('Invalid access token scope')
  }
  return payload
}

export function assertMatchingIdentity (
  access: JWTPayload, account?: JWTPayload,
): void {
  if (account && (account.sub !== access.sub || account.iss !== access.iss || account.azp !== access.azp)) {
    throw new Error('Access and ID tokens do not belong to the same session identity')
  }
}
