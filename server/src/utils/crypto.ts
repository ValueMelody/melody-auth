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

const base64UrlEncode = (buffer: ArrayBuffer) => {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
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

export const genCodeChallenger = async (verifier: string): Promise<string> => {
  const content = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest(
    { name: 'SHA-256' },
    content,
  )
  return base64UrlEncode(digest)
}

export const isValidCodeChallenge = async (
  codeVerifier: string,
  codeChallenge: string,
  codeChallengeMethod: string,
) => {
  if (codeChallengeMethod === AuthorizeCodeChallengeMethod.Plain) {
    return codeVerifier === codeChallenge
  } else {
    const calculatedValue = await genCodeChallenger(codeVerifier)
    return calculatedValue === codeChallenge
  }
}

export const genRandomString = (length: number) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    randomString += charset[array[i] % charset.length]
  }
  return randomString
}
