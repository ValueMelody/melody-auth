import {
  beforeAll, describe, expect, it,
} from 'vitest'
import {
  exportSPKI, generateKeyPair, JWTPayload, KeyLike, SignJWT,
} from 'jose'
import {
  ResolvedTokenVerifierConfig, resolveTokenVerifierConfig, verifyAccessToken, verifyIdToken,
} from './tokenVerifier'

const ISSUER = 'https://auth.example.com'
const CLIENT_ID = 'client-a'
const SUBJECT = 'user-1'

let privateKey: KeyLike
let otherPrivateKey: KeyLike
let verifierConfig: ResolvedTokenVerifierConfig

const now = () => Math.floor(Date.now() / 1000)

const sign = (
  payload: JWTPayload, key = privateKey,
) => new SignJWT(payload)
  .setProtectedHeader({
    alg: 'RS256', kid: 'test-key',
  })
  .sign(key)

const validAccessPayload = (): JWTPayload => ({
  sub: SUBJECT,
  iss: ISSUER,
  azp: CLIENT_ID,
  scope: 'openid profile',
  exp: now() + 60,
})

const validIdPayload = (): JWTPayload => ({
  sub: SUBJECT,
  iss: ISSUER,
  azp: CLIENT_ID,
  aud: CLIENT_ID,
  exp: now() + 60,
})

const withoutClaim = (
  payload: JWTPayload, claim: string,
): JWTPayload => {
  const result = { ...payload }
  delete result[claim]
  return result
}

beforeAll(async () => {
  const signingKeys = await generateKeyPair('RS256')
  const otherSigningKeys = await generateKeyPair('RS256')
  privateKey = signingKeys.privateKey
  otherPrivateKey = otherSigningKeys.privateKey
  verifierConfig = resolveTokenVerifierConfig({
    serverUrl: ISSUER,
    clientId: CLIENT_ID,
    publicKey: await exportSPKI(signingKeys.publicKey),
    clockTolerance: 0,
  })
})

describe(
  'resolveTokenVerifierConfig',
  () => {
    it(
      'requires an issuer and client ID',
      () => {
        expect(() => resolveTokenVerifierConfig({
          serverUrl: '', clientId: CLIENT_ID,
        })).toThrow('"serverUrl" is required')
        expect(() => resolveTokenVerifierConfig({
          serverUrl: ISSUER, clientId: '',
        })).toThrow('"clientId" is required')
      },
    )

    it(
      'derives the JWKS URI from the issuer',
      () => {
        expect(resolveTokenVerifierConfig({
          serverUrl: `${ISSUER}/`, clientId: CLIENT_ID,
        })).toMatchObject({
          clientId: CLIENT_ID,
          jwksUri: `${ISSUER}/.well-known/jwks.json`,
          publicKey: null,
        })
      },
    )
  },
)

describe(
  'verifyAccessToken',
  () => {
    it(
      'accepts a valid Melody Auth access token',
      async () => {
        await expect(verifyAccessToken(
          await sign(validAccessPayload()),
          verifierConfig,
        )).resolves.toMatchObject({
          sub: SUBJECT,
          azp: CLIENT_ID,
          scope: 'openid profile',
        })
      },
    )

    it(
      'rejects a token signed by another key',
      async () => {
        await expect(verifyAccessToken(
          await sign(
            validAccessPayload(),
            otherPrivateKey,
          ),
          verifierConfig,
        )).rejects.toMatchObject({ code: 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED' })
      },
    )

    it(
      'rejects an algorithm other than RS256',
      async () => {
        const token = await new SignJWT(validAccessPayload())
          .setProtectedHeader({ alg: 'HS256' })
          .sign(new TextEncoder().encode('a-secret-long-enough-for-hs256'))

        await expect(verifyAccessToken(
          token,
          verifierConfig,
        )).rejects.toMatchObject({ code: 'ERR_JOSE_ALG_NOT_ALLOWED' })
      },
    )

    it(
      'rejects a token from another issuer',
      async () => {
        await expect(verifyAccessToken(
          await sign({
            ...validAccessPayload(), iss: 'https://other.example.com',
          }),
          verifierConfig,
        )).rejects.toMatchObject({ code: 'ERR_JWT_CLAIM_VALIDATION_FAILED' })
      },
    )

    it(
      'requires azp and binds it to the configured client',
      async () => {
        const withoutAzp = withoutClaim(
          validAccessPayload(),
          'azp',
        )

        await expect(verifyAccessToken(
          await sign({
            ...withoutAzp, aud: CLIENT_ID,
          }),
          verifierConfig,
        )).rejects.toMatchObject({ code: 'ERR_JWT_CLAIM_VALIDATION_FAILED' })

        await expect(verifyAccessToken(
          await sign({
            ...validAccessPayload(), azp: 'client-b',
          }),
          verifierConfig,
        )).rejects.toThrow('Token "azp" claim does not match')
      },
    )

    it(
      'rejects a mismatched audience when one is present',
      async () => {
        await expect(verifyAccessToken(
          await sign({
            ...validAccessPayload(), aud: 'client-b',
          }),
          verifierConfig,
        )).rejects.toThrow('Token "aud" claim does not match')

        await expect(verifyAccessToken(
          await sign({
            ...validAccessPayload(), aud: [CLIENT_ID, 42],
          }),
          verifierConfig,
        )).rejects.toThrow('Token "aud" claim does not match')
      },
    )

    it(
      'requires a string scope so an ID token cannot substitute for an access token',
      async () => {
        await expect(verifyAccessToken(
          await sign(validIdPayload()),
          verifierConfig,
        )).rejects.toMatchObject({ code: 'ERR_JWT_CLAIM_VALIDATION_FAILED' })

        await expect(verifyAccessToken(
          await sign({
            ...validAccessPayload(), scope: ['openid'],
          }),
          verifierConfig,
        )).rejects.toThrow('Access token "scope" claim must be a string')
      },
    )

    it(
      'requires expiry and rejects expired tokens',
      async () => {
        const withoutExp = withoutClaim(
          validAccessPayload(),
          'exp',
        )

        await expect(verifyAccessToken(
          await sign(withoutExp),
          verifierConfig,
        )).rejects.toMatchObject({ code: 'ERR_JWT_CLAIM_VALIDATION_FAILED' })

        await expect(verifyAccessToken(
          await sign({
            ...validAccessPayload(), exp: now() - 1,
          }),
          verifierConfig,
        )).rejects.toMatchObject({ code: 'ERR_JWT_EXPIRED' })
      },
    )

    it(
      'rejects a token before its nbf time',
      async () => {
        await expect(verifyAccessToken(
          await sign({
            ...validAccessPayload(), nbf: now() + 60,
          }),
          verifierConfig,
        )).rejects.toMatchObject({ code: 'ERR_JWT_CLAIM_VALIDATION_FAILED' })
      },
    )
  },
)

describe(
  'verifyIdToken',
  () => {
    it(
      'accepts a valid ID token for the access token subject',
      async () => {
        await expect(verifyIdToken(
          await sign(validIdPayload()),
          verifierConfig,
          SUBJECT,
        )).resolves.toMatchObject({
          sub: SUBJECT,
          azp: CLIENT_ID,
          aud: CLIENT_ID,
        })
      },
    )

    it(
      'requires azp and binds it to the configured client',
      async () => {
        const withoutAzp = withoutClaim(
          validIdPayload(),
          'azp',
        )

        await expect(verifyIdToken(
          await sign(withoutAzp),
          verifierConfig,
          SUBJECT,
        )).rejects.toMatchObject({ code: 'ERR_JWT_CLAIM_VALIDATION_FAILED' })

        await expect(verifyIdToken(
          await sign({
            ...validIdPayload(), azp: 'client-b',
          }),
          verifierConfig,
          SUBJECT,
        )).rejects.toThrow('Token "azp" claim does not match')
      },
    )

    it(
      'requires the configured audience',
      async () => {
        const withoutAud = withoutClaim(
          validIdPayload(),
          'aud',
        )

        await expect(verifyIdToken(
          await sign(withoutAud),
          verifierConfig,
          SUBJECT,
        )).rejects.toMatchObject({ code: 'ERR_JWT_CLAIM_VALIDATION_FAILED' })

        await expect(verifyIdToken(
          await sign({
            ...validIdPayload(), aud: 'client-b',
          }),
          verifierConfig,
          SUBJECT,
        )).rejects.toMatchObject({ code: 'ERR_JWT_CLAIM_VALIDATION_FAILED' })

        await expect(verifyIdToken(
          await sign({
            ...validIdPayload(), aud: [CLIENT_ID, 42],
          }),
          verifierConfig,
          SUBJECT,
        )).rejects.toThrow('Token "aud" claim does not match')
      },
    )

    it(
      'rejects tokens from another issuer or outside their valid time window',
      async () => {
        await expect(verifyIdToken(
          await sign({
            ...validIdPayload(), iss: 'https://other.example.com',
          }),
          verifierConfig,
          SUBJECT,
        )).rejects.toMatchObject({ code: 'ERR_JWT_CLAIM_VALIDATION_FAILED' })

        await expect(verifyIdToken(
          await sign({
            ...validIdPayload(), exp: now() - 1,
          }),
          verifierConfig,
          SUBJECT,
        )).rejects.toMatchObject({ code: 'ERR_JWT_EXPIRED' })

        await expect(verifyIdToken(
          await sign({
            ...validIdPayload(), nbf: now() + 60,
          }),
          verifierConfig,
          SUBJECT,
        )).rejects.toMatchObject({ code: 'ERR_JWT_CLAIM_VALIDATION_FAILED' })
      },
    )

    it(
      'rejects an ID token for a different access token subject',
      async () => {
        await expect(verifyIdToken(
          await sign({
            ...validIdPayload(), sub: 'user-2',
          }),
          verifierConfig,
          SUBJECT,
        )).rejects.toThrow('ID token "sub" claim does not match')
      },
    )
  },
)
