import {
  genCodeChallenge, genRandomString,
} from '@melody-auth/shared'
// eslint-disable-next-line import/default
import bcrypt from 'bcryptjs'
import base32Encode from 'base32-encode'
import base32Decode from 'base32-decode'
import { env } from 'hono/adapter'
import { Context } from 'hono'
import { AuthorizeCodeChallengeMethod } from 'dtos/oauth'
import { typeConfig } from 'configs'
import { cryptoUtil } from 'utils'

export const genRandom6DigitString = (): string => {
  return (Math.floor(100000 + Math.random() * 900000)).toString()
}

const genRandomBytes = (length: number) => {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return array
}

export const genOtpSecret = () => {
  const secret = genRandomBytes(20)
  const base32Secret = base32Encode(
    secret,
    'RFC4648',
  )
  return base32Secret
}

export const genRecoveryCode = async () => {
  const recoveryCode = genRandomString(24)
  const recoveryHash = cryptoUtil.bcryptText(recoveryCode)
  return {
    recoveryCode,
    recoveryHash,
  }
}

export const genTotp = async (secret: string): Promise<string> => {
  const decodedSecret = base32Decode(
    secret,
    'RFC4648',
  )
  const timeStep = Math.floor(Date.now() / 1000 / 30)
  const timeBuffer = new ArrayBuffer(8)
  const timeView = new DataView(timeBuffer)
  timeView.setUint32(
    4,
    timeStep,
  )

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    decodedSecret,
    {
      name: 'HMAC', hash: 'SHA-1',
    },
    false,
    ['sign'],
  )

  const hash = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    timeBuffer,
  )

  const hashArray = new Uint8Array(hash)
  const offset = hashArray[hashArray.length - 1] & 0xf

  const otp = ((
    (hashArray[offset] & 0x7f) << 24 |
    (hashArray[offset + 1] & 0xff) << 16 |
    (hashArray[offset + 2] & 0xff) << 8 |
    (hashArray[offset + 3] & 0xff)
  ) % 1e6).toString().padStart(
    6,
    '0',
  )
  return otp
}

export const bcryptText = (text: string) => {
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(
    text,
    salt,
  )
  return hash
}

export const bcryptCompare = (
  text: string, hash: string,
) => {
  const isMatch = bcrypt.compareSync(
    text,
    hash,
  )
  return isMatch
}

export const isValidCodeChallenge = async (
  codeVerifier: string,
  codeChallenge: string,
  codeChallengeMethod: string,
) => {
  if (codeChallengeMethod === AuthorizeCodeChallengeMethod.Plain) {
    return codeVerifier === codeChallenge
  } else {
    const calculatedValue = await genCodeChallenge(codeVerifier)
    return calculatedValue === codeChallenge
  }
}

const pemToArrayBuffer = (pem: string): ArrayBuffer => {
  const base64 = pem
    .replace(
      /-----BEGIN PUBLIC KEY-----/,
      '',
    )
    .replace(
      /-----END PUBLIC KEY-----/,
      '',
    )
    .replace(
      /\n/g,
      '',
    )
  const binary = atob(base64)
  const buffer = new ArrayBuffer(binary.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i)
  }
  return buffer
}

const genJwkKeyId = async (keyData: ArrayBuffer): Promise<string> => {
  const hash = await crypto.subtle.digest(
    'SHA-256',
    keyData,
  )
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(
      2,
      '0',
    ))
    .join('')
}

export const secretToJwk = async (key: string) => {
  const keyData = pemToArrayBuffer(key)
  const publicKey = await crypto.subtle.importKey(
    'spki',
    keyData,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    true,
    ['verify'],
  )

  const jwk = await crypto.subtle.exportKey(
    'jwk',
    publicKey,
  ) as JsonWebKey

  return {
    kty: jwk.kty,
    n: jwk.n,
    e: jwk.e,
    alg: 'RS256',
    use: 'sig',
    kid: await genJwkKeyId(keyData),
  }
}

export const uint8ArrayToBase64 = (u8: Uint8Array) => {
  let binary = ''
  for (let i = 0; i < u8.length; i++) {
    binary += String.fromCharCode(u8[i])
  }
  return btoa(binary)
}

export const base64ToUint8Array = (base64: string) => {
  const binary = atob(base64)
  const buffer = new ArrayBuffer(binary.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i)
  }
  return view
}

export const getPasskeyRpId = (c: Context<typeConfig.Context>) => {
  const { AUTH_SERVER_URL: authServerUrl } = env(c)
  const url = new URL(authServerUrl)
  return url.hostname
}
