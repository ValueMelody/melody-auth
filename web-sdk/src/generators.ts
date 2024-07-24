import {
  genRandomString, genCodeChallenge,
} from 'shared'

export const genCodeVerifierAndChallenge = async () => {
  const codeVerifier = genRandomString(128)
  const codeChallenge = await genCodeChallenge(codeVerifier)

  return {
    codeVerifier, codeChallenge,
  }
}

export const genAuthorizeState = (length: number) => {
  const array = new Uint8Array(length)
  window.crypto.getRandomValues(array)
  return Array.from(
    array,
    (byte) => ('0' + byte.toString(16)).slice(-2),
  ).join('')
}
