import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  verify, decode,
} from 'hono/jwt'
import { JWTPayload } from 'hono/utils/jwt/types'
import {
  ClientType, IdTokenBody,
} from '@melody-auth/shared'
import { SignatureKey } from 'hono/utils/jwt/jws'
import { encodeBase64Url } from 'hono/utils/encode'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import { kvService } from 'services'
import {
  cryptoUtil, loggerUtil,
} from 'utils'

export const base64UrlEncode = (data: string) => {
  return btoa(data)
    .replace(
      /\+/g,
      '-',
    )
    .replace(
      /\//g,
      '_',
    )
    .replace(
      /=+$/,
      '',
    )
}

const encodeJwtPart = (part: unknown): string => {
  const utf8Encoder: TextEncoder = new TextEncoder()
  return encodeBase64Url(utf8Encoder.encode(JSON.stringify(part)).buffer).replace(
    /=/g,
    '',
  )
}

export const decodeBase64 = (str: string): Uint8Array => {
  const binary = atob(str)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  const half = binary.length / 2
  for (let i = 0, j = binary.length - 1; i <= half; i++, j--) {
    bytes[i] = binary.charCodeAt(i)
    bytes[j] = binary.charCodeAt(j)
  }
  return bytes
}

export const pemToBinary = (pem: string): Uint8Array => {
  return decodeBase64(pem.replace(
    /-+(BEGIN|END).*/g,
    '',
  ).replace(
    /\s/g,
    '',
  ))
}

export const signWithKid = async (
  c: Context<typeConfig.Context>, payload: object,
) => {
  const privateKey = await kvService.getJwtPrivateSecret(c)
  const publicKey = await kvService.getJwtPublicSecret(c)
  const jwk = await cryptoUtil.secretToJwk(publicKey)

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToBinary(privateKey),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign'],
  )

  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: jwk.kid,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = encodeJwtPart(payload)
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const encoder = new TextEncoder()
  const signingInputBytes = encoder.encode(signingInput)

  const signature = await crypto.subtle.sign(
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    key,
    signingInputBytes,
  )

  const signatureArray = new Uint8Array(signature)
  const signatureBase64Url = base64UrlEncode(String.fromCharCode(...signatureArray))

  const jwt = `${signingInput}.${signatureBase64Url}`
  return jwt
}

export const getAccessTokenBody = async (
  context: Context<typeConfig.Context>,
  accessToken: string,
) => {
  const decoded = decode(accessToken)
  const header = decoded.header as unknown as { kid: string }

  const publicSecret = await kvService.getJwtPublicSecret(context)
  const publicJwk = await cryptoUtil.secretToJwk(publicSecret)
  let key = ''
  if (publicJwk.kid === header.kid) key = publicSecret

  if (!key) {
    const deprecatedPublicSecret = await kvService.getDeprecatedPublicSecret(context.env.KV)
    if (deprecatedPublicSecret) {
      const deprecatedPublicJwk = await cryptoUtil.secretToJwk(deprecatedPublicSecret)
      if (deprecatedPublicJwk.kid === header.kid) key = deprecatedPublicSecret
    }
  }

  let accessTokenBody: typeConfig.AccessTokenBody
  try {
    accessTokenBody = await verify(
      accessToken,
      key,
      'RS256',
    ) as unknown as typeConfig.AccessTokenBody
  } catch (e) {
    loggerUtil.triggerLogger(
      context,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAccessToken,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.WrongAccessToken)
  }

  return accessTokenBody
}

export const genAccessToken = async (
  c: Context<typeConfig.Context>,
  type: ClientType,
  currentTimestamp: number,
  sub: string,
  azp: string,
  scope: string,
  roles?: string[] | null,
  impersonatedBy?: string | null,
) => {
  const {
    SPA_ACCESS_TOKEN_EXPIRES_IN,
    S2S_ACCESS_TOKEN_EXPIRES_IN,
    AUTH_SERVER_URL: serverUrl,
  } = env(c)

  const isSpa = type === ClientType.SPA
  const accessTokenExpiresIn = isSpa
    ? SPA_ACCESS_TOKEN_EXPIRES_IN
    : S2S_ACCESS_TOKEN_EXPIRES_IN
  const accessTokenExpiresAt = currentTimestamp + accessTokenExpiresIn
  const accessTokenBody: typeConfig.AccessTokenBody = {
    sub,
    azp,
    iss: serverUrl,
    scope,
    iat: currentTimestamp,
    exp: accessTokenExpiresAt,
  }
  if (roles) accessTokenBody.roles = roles
  if (impersonatedBy) accessTokenBody.impersonatedBy = impersonatedBy
  const accessToken = await signWithKid(
    c,
    accessTokenBody as unknown as JWTPayload,
  )
  return {
    accessToken,
    accessTokenExpiresIn,
    accessTokenExpiresAt,
  }
}

export const genIdToken = async (
  c: Context<typeConfig.Context>,
  currentTimestamp: number,
  authInfo: typeConfig.AuthCodeBody,
  roles: string[],
  attributes: Record<string, string> | undefined,
) => {
  const {
    ID_TOKEN_EXPIRES_IN: idTokenExpiresIn,
    AUTH_SERVER_URL: authServerUrl,
  } = env(c)
  const idTokenExpiresAt = currentTimestamp + idTokenExpiresIn
  const body: IdTokenBody = {
    iss: authServerUrl,
    sub: authInfo.user.authId,
    azp: authInfo.request.clientId,
    aud: authInfo.request.clientId,
    exp: idTokenExpiresAt,
    iat: currentTimestamp,
    email: authInfo.user.email,
    locale: authInfo.user.locale,
    first_name: authInfo.user.firstName,
    last_name: authInfo.user.lastName,
    attributes,
    roles,
  }

  const idToken = await signWithKid(
    c,
    body as unknown as JWTPayload,
  )
  return { idToken }
}

export interface GoogleUser {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  id: string;
}

export const verifyGoogleCredential = async (credential: string) => {
  const decoded = decode(credential)
  const header = decoded.header as unknown as { kid: string }

  const response = await fetch('https://www.googleapis.com/oauth2/v3/certs')
  const certs = await response.json() as { keys: { kid: string }[] }
  const publicKey = certs.keys.find((key) => key.kid === header.kid)
  const result = await verify(
    credential,
    publicKey as unknown as SignatureKey,
    'RS256',
  )
  if ('iss' in result && result.iss === 'https://accounts.google.com' && 'email' in result) {
    const user = {
      firstName: result.given_name,
      lastName: result.family_name,
      email: result.email,
      emailVerified: result.email_verified,
      id: result.sub,
    } as GoogleUser
    return user
  }

  return undefined
}

export interface FacebookUser {
  firstName: string;
  lastName: string;
  id: string;
}

export const verifyFacebookCredential = async (
  clientId: string, clientSecret: string, credential: string,
) => {
  const graphBase = 'https://graph.facebook.com'
  const tokenRes = await fetch(`${graphBase}/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`)
  if (tokenRes.ok) {
    const tokenBody = await tokenRes.json() as object
    if ('access_token' in tokenBody) {
      const verifyRes = await fetch(`${graphBase}/debug_token?input_token=${credential}&access_token=${tokenBody.access_token}`)
      if (verifyRes.ok) {
        const verifyBody = await verifyRes.json() as object
        const data = 'data' in verifyBody ? verifyBody.data as object : null
        if (data && 'is_valid' in data && data.is_valid && 'user_id' in data) {
          const userRes = await fetch(`${graphBase}/v20.0/${data.user_id}?access_token=${tokenBody.access_token}`)
          if (userRes.ok) {
            const userBody = await userRes.json() as { name: string; id: string }
            const user = {
              firstName: userBody.name.split(' ')[0] ?? '',
              lastName: userBody.name.split(' ')[2] ?? '',
              id: userBody.id,
            } as FacebookUser
            return user
          }
        }
      }
    }
  }
  return undefined
}

export interface GithubUser {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
}

export const verifyGithubCredential = async (
  clientId: string,
  clientSecret: string,
  appName: string,
  credential: string,
) => {
  const tokenRes = await fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: credential,
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  )
  if (tokenRes.ok) {
    const tokenBody = await tokenRes.json() as Object
    if ('access_token' in tokenBody) {
      const userRes = await fetch(
        'https://api.github.com/user',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${tokenBody.access_token}`,
            'Content-Type': 'application/json',
            'User-Agent': appName,
            Accept: 'application/json',
          },
        },
      )
      if (userRes.ok) {
        const userBody = await userRes.json() as { name: string; id: string; email: string }
        const names = userBody.name.split(' ')
        const user = {
          firstName: names.length === 2 ? names[0] : '',
          lastName: names.length === 2 ? names[1] : '',
          email: userBody.email,
          id: userBody.id,
        } as GithubUser
        return user
      }
    }
  }
  return undefined
}

export interface DiscordUser {
  firstName: string;
  lastName: string;
  id: string;
  email: string;
  emailVerified: boolean;
}

export const verifyDiscordCredential = async (
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  credential: string,
) => {
  const params = new URLSearchParams()
  params.append(
    'grant_type',
    'authorization_code',
  )
  params.append(
    'code',
    credential,
  )
  params.append(
    'redirect_uri',
    redirectUri,
  )

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const tokenRes = await fetch(
    'https://discord.com/api/v10/oauth2/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: params,
    },
  )
  if (tokenRes.ok) {
    const tokenBody = await tokenRes.json() as object
    if ('access_token' in tokenBody) {
      const userRes = await fetch(
        'https://discord.com/api/v10/users/@me',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${tokenBody.access_token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      )
      if (userRes.ok) {
        const userBody = await userRes.json() as {
          username: string;
          id: string;
          email: string;
          verified: boolean;
        }
        const names = userBody.username.split(' ')
        const user = {
          firstName: names.length === 2 ? names[0] : '',
          lastName: names.length === 2 ? names[1] : '',
          email: userBody.email ?? null,
          emailVerified: userBody.verified ?? false,
          id: userBody.id,
        } as DiscordUser
        return user
      }
    }
  }
  return undefined
}

export interface AppleUser {
  email: string;
  id: string;
}

export const verifyAppleCredential = async (
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  credential: string,
) => {
  const params = new URLSearchParams()
  params.append(
    'grant_type',
    'authorization_code',
  )
  params.append(
    'code',
    credential,
  )
  params.append(
    'client_id',
    clientId,
  )
  params.append(
    'client_secret',
    clientSecret,
  )
  params.append(
    'redirect_uri',
    redirectUri,
  )

  const tokenRes = await fetch(
    'https://appleid.apple.com/auth/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    },
  )

  if (tokenRes.ok) {
    const tokenBody = await tokenRes.json() as object
    if ('id_token' in tokenBody) {
      const decoded = decode(String(tokenBody.id_token))
      const user = {
        id: decoded.payload.sub,
        email: decoded.payload.email,
      } as AppleUser
      return user
    }
  }
  return undefined
}

export interface OidcUser {
  id: string;
}

/**
 * According to the OIDC provider, the implementation of this function might need to be adjusted.
 */
export const verifyOidcCredential = async (
  clientId: string,
  tokenEndpoint: string,
  jwksEndpoint: string,
  redirectUri: string,
  credential: string,
  codeVerifier: string,
) => {
  const payload = new URLSearchParams()
  payload.append(
    'grant_type',
    'authorization_code',
  )
  payload.append(
    'client_id',
    clientId,
  )
  payload.append(
    'code',
    credential,
  )
  payload.append(
    'code_verifier',
    codeVerifier,
  )
  payload.append(
    'redirect_uri',
    redirectUri,
  )

  const tokenRes = await fetch(
    tokenEndpoint,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString(),
    },
  )

  if (tokenRes.ok) {
    const tokenBody = await tokenRes.json() as object
    if ('id_token' in tokenBody) {
      const decoded = decode(String(tokenBody.id_token))
      const jwks = await fetch(jwksEndpoint)
      const certs = await jwks.json() as { keys: { kid: string }[] }
      const publicKey = certs.keys.find((key) => key.kid === decoded.header.kid)
      const result = await verify(
        String(tokenBody.id_token),
        publicKey as unknown as SignatureKey,
        'RS256',
      )

      if (result && result.sub) {
        const user = { id: result.sub } as OidcUser
        return user
      }
    }
  }

  return undefined
}
