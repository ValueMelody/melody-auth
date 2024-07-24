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
