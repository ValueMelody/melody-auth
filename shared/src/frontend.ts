import { StorageKey } from './enum.js'
import {
  RefreshTokenStorage, AccessTokenStorage, IdTokenStorage,
} from './clientInterface.js'
import { AuthStorage, CookieOptions, CookieStorage, StorageType } from './storage.js'

/**
 * Checks for stored authentication tokens in the specified storage mechanism.
 * @param storageKey - The type of storage to use (sessionStorage, localStorage, or cookieStorage)
 * @param options - Cookie options (only applicable when storageKey is 'cookieStorage')
 * @returns An object containing the stored refresh token and ID token (if any)
 */
export const checkStorage = <T extends StorageType>(storageKey?: T, options?: T extends 'cookieStorage' ? Partial<CookieOptions> : undefined) => {
  let storage: AuthStorage;
  switch (storageKey) {
    case 'sessionStorage':
      storage = window.sessionStorage;
      break; // FIX: Add break to prevent fall-through
    case 'localStorage':
      storage = window.localStorage;
      break; // FIX: Add break to prevent fall-through
    case 'cookieStorage':
      storage = new CookieStorage(options);
      break; // FIX: Add break to prevent fall-through
    default:
      storage = window.localStorage;
  }
  const storedRefreshToken = storage.getItem(StorageKey.RefreshToken)
  const storedIdToken = storage.getItem(StorageKey.IdToken)

  return {
    storedRefreshToken,
    storedIdToken,
  }
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
    storage.removeItem(StorageKey.IdToken)

    return refreshTokenStorage
  }

  return null
}

export const isValidTokens = (
  accessTokenStorage: AccessTokenStorage | null,
  refreshTokenStorage: RefreshTokenStorage | null,
  idTokenStorage: IdTokenStorage | null,
) => {
  const currentTimeStamp = new Date().getTime() / 1000
  const expectedTimestamp = currentTimeStamp + 5

  const hasValidAccessToken = !!accessTokenStorage?.accessToken &&
    accessTokenStorage.expiresOn &&
    expectedTimestamp < accessTokenStorage.expiresOn

  const hasValidRefreshToken = !!refreshTokenStorage?.refreshToken &&
    refreshTokenStorage.expiresOn &&
    expectedTimestamp < refreshTokenStorage.expiresOn

  const hasValidIdToken = !!idTokenStorage?.idToken &&
    idTokenStorage.account &&
    idTokenStorage.account.exp &&
    expectedTimestamp < idTokenStorage.account.exp

  return {
    hasValidAccessToken,
    hasValidRefreshToken,
    hasValidIdToken,
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
