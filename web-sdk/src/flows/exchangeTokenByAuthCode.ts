import { ProviderConfig } from '../../../global'
import {
  AccessTokenStorage, RefreshTokenStorage, SessionStorageKey, StorageKey,
} from '../definitions'
import { postTokenByAuthCode } from '../requests'

export const exchangeTokenByAuthCode = async (config: ProviderConfig) => {
  const params = window.location.search.substring(1).split('&')
    .map((param) => param.split('='))
  const codeParam = params.find(([key]) => key === 'code')
  const stateParam = params.find(([key]) => key === 'state')

  if (!codeParam || !stateParam) return

  const state = window.sessionStorage.getItem(SessionStorageKey.State)
  if (!state) return

  window.sessionStorage.removeItem(SessionStorageKey.State)

  if (state !== stateParam[1]) throw new Error('Invalid state')

  const codeVerifier = window.sessionStorage.getItem(SessionStorageKey.CodeVerifier)
  window.sessionStorage.removeItem(SessionStorageKey.CodeVerifier)

  try {
    const result = await postTokenByAuthCode(
      config,
      {
        code: codeParam[1], codeVerifier,
      },
    )
    const accessTokenStorage: AccessTokenStorage = {
      accessToken: result.access_token,
      expiresIn: result.expires_in,
      expiresOn: result.expires_on,
    }

    const storage = config.storage === 'localStorage' ? window.localStorage : window.sessionStorage
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

    const response: {
      accessTokenStorage: AccessTokenStorage;
      refreshTokenStorage: RefreshTokenStorage | null;
    } = {
      accessTokenStorage,
      refreshTokenStorage,
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
