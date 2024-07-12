const genRandomString = (length: number) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let randomString = ''
  const array = new Uint8Array(length)
  window.crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    randomString += charset[array[i] % charset.length]
  }
  return randomString
}

const base64UrlEncode = (buffer: ArrayBuffer) => {
  const base64 = btoa(String.fromCharCode.apply(
    null,
    new Uint8Array(buffer),
  ))
  return base64.replace(
    /\+/g,
    '-',
  ).replace(
    /\//g,
    '_',
  )
    .replace(
      /=+$/,
      '',
    )
}

const genCodeChallenge = async (codeVerifier: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const hash = await window.crypto.subtle.digest(
    'SHA-256',
    data,
  )
  return base64UrlEncode(hash)
}

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
