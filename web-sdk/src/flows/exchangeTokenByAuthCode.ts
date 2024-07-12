import {
  AccessTokenStorage, RefreshTokenStorage, SessionStorageKey, StorageKey,
} from 'definitions'
import {
  CommonProps,
  postTokenByAuthCode,
} from 'requests'

export const exchangeTokenByAuthCode = async (common: CommonProps) => {
  const params = window.location.search.substring(1).split('&')
    .map((param) => param.split('='))
  const stateParam = params.find(([key]) => key === 'state')
  const state = window.sessionStorage.getItem(SessionStorageKey.State)
  window.sessionStorage.removeItem(SessionStorageKey.State)
  if (state !== stateParam[1]) throw new Error('Invalid state')

  const codeParam = params.find(([key]) => key === 'code')

  const codeVerifier = window.sessionStorage.getItem(SessionStorageKey.CodeVerifier)
  window.sessionStorage.removeItem(SessionStorageKey.CodeVerifier)

  try {
    const result = await postTokenByAuthCode(
      common,
      {
        code: codeParam[1], codeVerifier,
      },
    )
    const accessTokenStorage: AccessTokenStorage = {
      accessToken: result.access_token,
      expiresIn: result.expires_in,
      expiresOn: result.expires_on,
    }

    const storage = common.storage === 'localStorage' ? window.localStorage : window.sessionStorage
    storage.setItem(
      StorageKey.AccessToken,
      JSON.stringify(accessTokenStorage),
    )

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
      accessToken: AccessTokenStorage;
      refreshToken: RefreshTokenStorage | null;
    } = {
      accessToken: accessTokenStorage,
      refreshToken: refreshTokenStorage,
    }

    return response
  } catch (e) {
    throw new Error('Failed to exchange token by auth code.')
  }
}
