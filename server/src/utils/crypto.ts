import { genCodeChallenge } from 'shared'
import { AuthorizeCodeChallengeMethod } from 'dtos/oauth'

export const sha256 = async (text: string): Promise<string> => {
  const content = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest(
    { name: 'SHA-256' },
    content,
  )
  const hashArray = Array.from(new Uint8Array(digest))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(
    2,
    '0',
  )).join('')
  return hashHex
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
