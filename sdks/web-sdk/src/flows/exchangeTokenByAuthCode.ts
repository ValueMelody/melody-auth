import {
  ProviderConfig, AccessTokenStorage, RefreshTokenStorage, SessionStorageKey, StorageKey,
  IdTokenBody,
} from '@melody-auth/shared'
import { postTokenByAuthCode } from '../requests'

const base64UrlDecode = (str: string) => {
  str = str.replace(
    /-/g,
    '+',
  ).replace(
    /_/g,
    '/',
  )
  while (str.length % 4) {
    str += '='
  }
  return atob(str)
}

export const loadCodeAndStateFromUrl = () => {
  const params = window.location.search.substring(1).split('&')
    .map((param) => param.split('='))
  const codeParam = params.find(([key]) => key === 'code')
  const stateParam = params.find(([key]) => key === 'state')

  if (!codeParam || !stateParam) {
    return {
      code: '', state: '',
    }
  }

  return {
    code: codeParam[1],
    state: stateParam[1],
  }
}

export const exchangeTokenByAuthCode = async (
  code: string, state: string, config: ProviderConfig,
) => {
  if (!code || !state) return

  const storedState = window.sessionStorage.getItem(SessionStorageKey.State)
  if (!storedState) return

  window.sessionStorage.removeItem(SessionStorageKey.State)

  if (state !== storedState) {
    throw new Error('Invalid state')
  }

  const codeVerifier = window.sessionStorage.getItem(SessionStorageKey.CodeVerifier)
  window.sessionStorage.removeItem(SessionStorageKey.CodeVerifier)

  try {
    const result = await postTokenByAuthCode(
      config,
      {
        code, codeVerifier,
      },
    )
    const accessTokenStorage: AccessTokenStorage = {
      accessToken: result.access_token,
      expiresIn: result.expires_in,
      expiresOn: result.expires_on,
    }

    const storage = config.storage === 'sessionStorage' ? window.sessionStorage : window.localStorage
    let refreshTokenStorage: RefreshTokenStorage | null = null
    if (result.refresh_token) {
      refreshTokenStorage = {
        refreshToken: result.refresh_token,
        expiresIn: result.refresh_token_expires_in,
        expiresOn: result.refresh_token_expires_on,
      }

      storage.setItem(
        StorageKey.RefreshToken,
        JSON.stringify(refreshTokenStorage),
      )
    }

    let idTokenBody: IdTokenBody | null = null
    if (result.id_token) {
      const payloadRaw = result.id_token.split('.')[1]
      const payload = base64UrlDecode(payloadRaw)
      idTokenBody = JSON.parse(payload)

      storage.setItem(
        StorageKey.Account,
        payload,
      )
    }

    const response: {
      accessTokenStorage: AccessTokenStorage;
      refreshTokenStorage: RefreshTokenStorage | null;
      idTokenBody: IdTokenBody | null;
    } = {
      accessTokenStorage,
      refreshTokenStorage,
      idTokenBody,
    }

    const url = new URL(window.location.href)
    url.search = ''
    window.history.replaceState(
      {},
      document.title,
      url,
    )

    return response
  } catch (e) {
    throw new Error(`Failed to exchange token by auth code: ${e}`)
  }
}
