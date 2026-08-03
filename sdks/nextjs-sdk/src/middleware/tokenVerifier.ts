import {
  createRemoteJWKSet, importSPKI, jwtVerify, JWTPayload, JWTVerifyGetKey, KeyLike,
} from 'jose'

/**
 * Melody Auth only ever signs tokens with RS256. Pinning the algorithm prevents
 * algorithm confusion attacks (e.g. a token forged with "none", or an HS256 token
 * signed with the public key used as the HMAC secret).
 */
const SIGNING_ALGORITHM = 'RS256'

/** Clock skew (in seconds) tolerated when validating exp/nbf */
const DEFAULT_CLOCK_TOLERANCE = 5

/**
 * Configuration required to cryptographically verify Melody Auth tokens.
 *
 * `serverUrl` and `clientId` are mandatory: without them a token can be validly
 * signed by the auth server yet still belong to a different issuer or a different
 * application, which would allow cross-client token substitution.
 */
export interface TokenVerifierConfig {
  /** Melody Auth server URL. Used as the expected `iss` claim and to derive the JWKS URI. */
  serverUrl: string;
  /** OAuth client ID. Tokens must be issued to this client (`azp`, and `aud` when present). */
  clientId: string;
  /** Overrides the JWKS URI derived from `serverUrl` (`${serverUrl}/.well-known/jwks.json`) */
  jwksUri?: string;
  /** PEM-encoded RSA public key, used instead of a JWKS URI for offline verification */
  publicKey?: string;
  /** Clock skew tolerance in seconds when validating `exp`/`nbf` (default: 5) */
  clockTolerance?: number;
}

/**
 * A validated {@link TokenVerifierConfig}. Produced by {@link resolveTokenVerifierConfig}
 * so that misconfiguration fails loudly at startup instead of silently skipping verification.
 */
export interface ResolvedTokenVerifierConfig {
  /** Accepted `iss` claim values (with and without a trailing slash) */
  issuers: string[];
  clientId: string;
  /** JWKS URI to fetch signing keys from, or null when a static public key is configured */
  jwksUri: string | null;
  /** PEM-encoded RSA public key, or null when signing keys come from the JWKS URI */
  publicKey: string | null;
  clockTolerance: number;
}

// Signing keys are cached per configuration value so that a second config cannot
// pick up keys resolved for a different auth server.
const remoteKeySets = new Map<string, JWTVerifyGetKey>()
const localKeys = new Map<string, Promise<KeyLike>>()

const trimTrailingSlash = (value: string) => value.replace(
  /\/+$/,
  '',
)

/**
 * Validates the verification configuration and fills in the derived defaults.
 *
 * @throws Error when the issuer, client or key configuration is missing or malformed
 */
export const resolveTokenVerifierConfig = (config: TokenVerifierConfig): ResolvedTokenVerifierConfig => {
  const serverUrl = typeof config?.serverUrl === 'string' ? trimTrailingSlash(config.serverUrl.trim()) : ''
  if (!serverUrl) {
    throw new Error('Melody Auth: "serverUrl" is required, it is the issuer every token is verified against.')
  }

  try {
    new URL(serverUrl) // eslint-disable-line no-new -- validation only
  } catch {
    throw new Error(`Melody Auth: "serverUrl" must be an absolute URL, received "${config.serverUrl}".`)
  }

  const clientId = typeof config?.clientId === 'string' ? config.clientId.trim() : ''
  if (!clientId) {
    throw new Error('Melody Auth: "clientId" is required, tokens issued to other clients must be rejected.')
  }

  const publicKey = typeof config.publicKey === 'string' && config.publicKey.trim()
    ? config.publicKey.trim()
    : null

  let jwksUri: string | null = null
  if (!publicKey) {
    jwksUri = typeof config.jwksUri === 'string' && config.jwksUri.trim()
      ? config.jwksUri.trim()
      : `${serverUrl}/.well-known/jwks.json`

    try {
      new URL(jwksUri) // eslint-disable-line no-new -- validation only
    } catch {
      throw new Error(`Melody Auth: "jwksUri" must be an absolute URL, received "${jwksUri}".`)
    }
  }

  const clockTolerance = typeof config.clockTolerance === 'number' && config.clockTolerance >= 0
    ? config.clockTolerance
    : DEFAULT_CLOCK_TOLERANCE

  return {
    issuers: [serverUrl, `${serverUrl}/`],
    clientId,
    jwksUri,
    publicKey,
    clockTolerance,
  }
}

/**
 * Resolves the signing keys for a configuration.
 * JWKS sets are resolved through jose so that the token header `kid` selects the key,
 * which keeps verification working across auth server key rotations.
 */
const getVerificationKey = async (config: ResolvedTokenVerifierConfig): Promise<JWTVerifyGetKey> => {
  if (config.publicKey) {
    const cacheKey = config.publicKey
    let keyPromise = localKeys.get(cacheKey)
    if (!keyPromise) {
      keyPromise = importSPKI(
        cacheKey,
        SIGNING_ALGORITHM,
      ).catch((error) => {
        // Do not cache a failed import, the next request should retry it
        localKeys.delete(cacheKey)
        throw error
      })
      localKeys.set(
        cacheKey,
        keyPromise,
      )
    }
    const key = await keyPromise
    return async () => key
  }

  const jwksUri = config.jwksUri as string
  let keySet = remoteKeySets.get(jwksUri)
  if (!keySet) {
    keySet = createRemoteJWKSet(new URL(jwksUri))
    remoteKeySets.set(
      jwksUri,
      keySet,
    )
  }
  return keySet
}

/**
 * Rejects tokens that were issued to a different application.
 * Melody Auth access tokens carry the client in `azp`, ID tokens carry it in both `azp` and `aud`.
 */
const assertTokenClient = (
  payload: JWTPayload, clientId: string,
) => {
  const { azp } = payload as { azp?: unknown }
  if (typeof azp !== 'string' || azp !== clientId) {
    throw new Error('Token "azp" claim does not match the configured clientId')
  }

  const { aud } = payload as { aud?: unknown }
  if (aud !== undefined) {
    const audiences = typeof aud === 'string'
      ? [aud]
      : Array.isArray(aud) && aud.every((value) => typeof value === 'string')
        ? aud
        : null
    if (!audiences?.includes(clientId)) {
      throw new Error('Token "aud" claim does not match the configured clientId')
    }
  }
}

/**
 * Verifies an access token: signature, algorithm, issuer, client binding, token shape,
 * `exp` and `nbf`. The required string `scope` claim distinguishes Melody Auth access
 * tokens from ID tokens signed by the same issuer.
 *
 * @returns The verified JWT payload. Only claims from this payload can be trusted.
 * @throws Error when the token is missing, malformed, expired or fails any check
 */
export const verifyAccessToken = async (
  accessToken: string, config: ResolvedTokenVerifierConfig,
): Promise<JWTPayload> => {
  if (typeof accessToken !== 'string' || !accessToken) {
    throw new Error('Access token is missing')
  }

  const key = await getVerificationKey(config)
  const { payload } = await jwtVerify(
    accessToken,
    key,
    {
      algorithms: [SIGNING_ALGORITHM],
      issuer: config.issuers,
      clockTolerance: config.clockTolerance,
      requiredClaims: ['sub', 'exp', 'iss', 'azp', 'scope'],
    },
  )

  assertTokenClient(
    payload,
    config.clientId,
  )

  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('Access token "sub" claim is missing')
  }

  const { scope } = payload as { scope?: unknown }
  if (typeof scope !== 'string') {
    throw new Error('Access token "scope" claim must be a string')
  }

  return payload
}

/**
 * Verifies an ID token: signature, algorithm, issuer, audience, client binding, `exp` and `nbf`.
 * The token is additionally bound to the access token subject so an ID token belonging to
 * another user cannot be paired with a valid access token.
 *
 * @returns The verified JWT payload. Only claims from this payload can be trusted.
 * @throws Error when the token is malformed, expired or fails any check
 */
export const verifyIdToken = async (
  idToken: string, config: ResolvedTokenVerifierConfig, expectedSub: string,
): Promise<JWTPayload> => {
  if (typeof idToken !== 'string' || !idToken) {
    throw new Error('ID token is missing')
  }

  const key = await getVerificationKey(config)
  const { payload } = await jwtVerify(
    idToken,
    key,
    {
      algorithms: [SIGNING_ALGORITHM],
      issuer: config.issuers,
      audience: config.clientId,
      clockTolerance: config.clockTolerance,
      requiredClaims: ['sub', 'exp', 'iss', 'aud', 'azp'],
    },
  )

  assertTokenClient(
    payload,
    config.clientId,
  )

  if (payload.sub !== expectedSub) {
    throw new Error('ID token "sub" claim does not match the access token subject')
  }

  return payload
}

/**
 * Whether a verification error was caused purely by expiry.
 *
 * An expired token is an ordinary part of the session lifecycle, while any other
 * verification failure means the token was tampered with and the session must be dropped.
 */
export const isExpiredTokenError = (error: unknown): boolean =>
  (error as { code?: string } | null)?.code === 'ERR_JWT_EXPIRED'
