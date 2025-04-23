import { StorageKey } from './enum.js'
import {
  RefreshTokenStorage, AccessTokenStorage,
} from './clientInterface.js'

export const checkStorage = (storageKey?: 'sessionStorage' | 'localStorage') => {
  const storage = storageKey === 'sessionStorage' ? window.sessionStorage : window.localStorage
  const storedRefreshToken = storage.getItem(StorageKey.RefreshToken)
  const storedAccount = storage.getItem(StorageKey.Account)

  return {
    storedRefreshToken,
    storedAccount,
  }
}

export const isValidStorage = (refreshTokenStorage: RefreshTokenStorage) => {
  const currentTimestamp = new Date().getTime() / 1000
  const isValid = refreshTokenStorage.refreshToken &&
    refreshTokenStorage.expiresOn &&
    refreshTokenStorage.expiresOn >= currentTimestamp + 5
  return isValid
}

export const loadRefreshTokenStorageFromParams = (storageType?: 'sessionStorage' | 'localStorage'): RefreshTokenStorage | null => {
  const params = getParams()
  if (params.refresh_token && params.refresh_token_expires_on && params.refresh_token_expires_in) {
    const refreshTokenStorage = {
      refreshToken: params.refresh_token,
      expiresOn: parseInt(params.refresh_token_expires_on),
      expiresIn: parseInt(params.refresh_token_expires_in),
    }
    const storage = storageType === 'sessionStorage' ? window.sessionStorage : window.localStorage
    storage.setItem(
      StorageKey.RefreshToken,
      JSON.stringify(refreshTokenStorage),
    )
    storage.removeItem(StorageKey.Account)

    return refreshTokenStorage
  }

  return null
}

export const isValidTokens = (
  accessTokenStorage: AccessTokenStorage | null,
  refreshTokenStorage: RefreshTokenStorage | null,
) => {
  const currentTimeStamp = new Date().getTime() / 1000

  const hasValidAccessToken = !!accessTokenStorage?.accessToken && currentTimeStamp < accessTokenStorage.expiresOn - 5

  const hasValidRefreshToken =
    !!refreshTokenStorage?.refreshToken &&
    currentTimeStamp < refreshTokenStorage.expiresOn - 5

  return {
    hasValidAccessToken,
    hasValidRefreshToken,
  }
}

export enum ErrorType {
  Unauthorized = 'Unauthorized',
  FetchUserInfo = 'Failed to fetch user info',
  ExchangeAccessToken = 'Failed to exchange access token',
  ObtainAccessToken = 'Can not obtain access token',
  InvalidRefreshToken = 'Invalid refresh token',
  LoginFailed = 'Unable to initial login flow',
  LogoutFailed = 'Unable to initial logout flow',
  Unknown = 'An error occurs.',
}

export const handleError = (
  e: any, fallback?: string,
) => {
  if (String(e).includes('Unauthorized')) return ErrorType.Unauthorized
  if (fallback) return fallback
  return ErrorType.Unknown
}

export const getParams = () => {
  const searchString = window.location.search.substring(1)
  const paramsString = searchString.split('&')
  const params = searchString
    ? paramsString.reduce(
      (
        params, paramString,
      ) => {
        const [key, value] = paramString.split('=')
        return {
          ...params,
          [key]: value,
        }
      },
      {} as { [key: string]: string },
    )
    : {}
  return params
}
