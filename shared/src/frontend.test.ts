import {
  describe, it, expect, beforeEach, afterEach,
} from 'vitest'
import {
  ErrorType, handleError, checkStorage, isValidTokens, getParams,
  loadRefreshTokenStorageFromParams,
} from './frontend'
import { StorageKey } from './enum.js'
import {
  AccessTokenStorage, IdTokenStorage, RefreshTokenStorage,
} from './clientInterface.js'

describe(
  'handleError',
  () => {
    it(
      'should return Unauthorized if error message includes "Unauthorized"',
      () => {
        const error = new Error('Unauthorized access detected')
        const result = handleError(error)
        expect(result).toBe(ErrorType.Unauthorized)
      },
    )

    it(
      'should return the provided fallback when error does not include "Unauthorized"',
      () => {
        const error = new Error('Some other error occurred')
        const fallback = 'Custom fallback error'
        const result = handleError(
          error,
          fallback,
        )
        expect(result).toBe(fallback)
      },
    )

    it(
      'should return Unknown if no fallback is provided and error does not include "Unauthorized"',
      () => {
        const error = new Error('Non-unauthorized error')
        const result = handleError(error)
        expect(result).toBe(ErrorType.Unknown)
      },
    )

    it(
      'should handle error as a string',
      () => {
        const error = 'Error: Unauthorized'
        const result = handleError(error)
        expect(result).toBe(ErrorType.Unauthorized)
      },
    )
  },
)

describe(
  'checkStorage',
  () => {
    beforeEach(() => {
      window.localStorage.clear()
      window.sessionStorage.clear()
    })

    it(
      'should return stored tokens from localStorage when no storageKey is provided',
      () => {
        window.localStorage.setItem(
          StorageKey.RefreshToken,
          'dummyRefreshToken',
        )
        window.localStorage.setItem(
          StorageKey.IdToken,
          JSON.stringify({
            idToken: 'dummyIdToken',
            account: 'dummyAccount',
          }),
        )
        const result = checkStorage()
        expect(result).toEqual({
          storedRefreshToken: 'dummyRefreshToken',
          storedIdToken: JSON.stringify({
            idToken: 'dummyIdToken',
            account: 'dummyAccount',
          }),
        })
      },
    )

    it(
      'should return stored tokens from sessionStorage when "sessionStorage" is provided',
      () => {
        window.sessionStorage.setItem(
          StorageKey.RefreshToken,
          'sessionRefresh',
        )
        window.sessionStorage.setItem(
          StorageKey.IdToken,
          JSON.stringify({
            idToken: 'dummyIdToken',
            account: 'dummyAccount',
          }),
        )
        const result = checkStorage('sessionStorage')
        expect(result).toEqual({
          storedRefreshToken: 'sessionRefresh',
          storedIdToken: JSON.stringify({
            idToken: 'dummyIdToken',
            account: 'dummyAccount',
          }),
        })
      },
    )

    it(
      'should return null values when keys are not present',
      () => {
        const result = checkStorage()
        expect(result).toEqual({
          storedRefreshToken: null,
          storedIdToken: null,
        })
      },
    )
  },
)

describe(
  'isValidTokens',
  () => {
    it(
      'should return true for both valid tokens',
      () => {
        const currentTimestamp = new Date().getTime() / 1000
        const validAccess = {
          accessToken: 'valid-access', expiresOn: currentTimestamp + 10,
        } as AccessTokenStorage
        const validRefresh = {
          refreshToken: 'valid-refresh', expiresOn: currentTimestamp + 10, expiresIn: 10,
        } as RefreshTokenStorage
        const validIdToken = {
          idToken: 'valid-id-token',
          account: { exp: currentTimestamp + 10 },
        } as IdTokenStorage
        expect(isValidTokens(
          validAccess,
          validRefresh,
          validIdToken,
        )).toEqual({
          hasValidAccessToken: true, hasValidRefreshToken: true, hasValidIdToken: true,
        })
      },
    )
    it(
      'should return false for expired access token',
      () => {
        const currentTimestamp = new Date().getTime() / 1000
        const expiredAccess = {
          accessToken: 'expired', expiresOn: currentTimestamp + 2,
        } as AccessTokenStorage
        const validRefresh = {
          refreshToken: 'valid-refresh', expiresOn: currentTimestamp + 10, expiresIn: 10,
        }
        const validIdToken = {
          idToken: 'valid-id-token',
          account: { exp: currentTimestamp + 10 },
        } as IdTokenStorage
        expect(isValidTokens(
          expiredAccess,
          validRefresh,
          validIdToken,
        )).toEqual({
          hasValidAccessToken: false, hasValidRefreshToken: true, hasValidIdToken: true,
        })
      },
    )
    it(
      'should return false for expired refresh token',
      () => {
        const currentTimestamp = new Date().getTime() / 1000
        const validAccess = {
          accessToken: 'valid-access', expiresOn: currentTimestamp + 10,
        } as AccessTokenStorage
        const expiredRefresh = {
          refreshToken: 'expired', expiresOn: currentTimestamp + 2, expiresIn: 10,
        }
        const validIdToken = {
          idToken: 'valid-id-token',
          account: { exp: currentTimestamp + 10 },
        } as IdTokenStorage
        expect(isValidTokens(
          validAccess,
          expiredRefresh,
          validIdToken,
        )).toEqual({
          hasValidAccessToken: true, hasValidRefreshToken: false, hasValidIdToken: true,
        })
      },
    )

    it(
      'should return false for expired id token',
      () => {
        const currentTimestamp = new Date().getTime() / 1000
        const validAccess = {
          accessToken: 'valid-access', expiresOn: currentTimestamp + 10,
        } as AccessTokenStorage
        const validRefresh = {
          refreshToken: 'valid-refresh', expiresOn: currentTimestamp + 10, expiresIn: 10,
        }
        const expiredIdToken = {
          idToken: 'expired-id-token',
          account: { exp: currentTimestamp + 2 },
        } as IdTokenStorage
        expect(isValidTokens(
          validAccess,
          validRefresh,
          expiredIdToken,
        )).toEqual({
          hasValidAccessToken: true, hasValidRefreshToken: true, hasValidIdToken: false,
        })
      },
    )

    it(
      'should return false for both tokens null',
      () => {
        expect(isValidTokens(
          null,
          null,
          null,
        )).toEqual({
          hasValidAccessToken: false, hasValidRefreshToken: false, hasValidIdToken: false,
        })
      },
    )
  },
)

describe(
  'getParams',
  () => {
    const originalLocation = window.location
    afterEach(() => {
      Object.defineProperty(
        window,
        'location',
        {
          value: originalLocation, configurable: true,
        },
      )
    })
    it(
      'should parse query parameters correctly',
      () => {
        Object.defineProperty(
          window,
          'location',
          {
            value: { search: '?foo=bar&baz=qux' }, writable: true, configurable: true,
          },
        )
        expect(getParams()).toEqual({
          foo: 'bar', baz: 'qux',
        })
      },
    )
    it(
      'should return empty object when no query parameters',
      () => {
        Object.defineProperty(
          window,
          'location',
          {
            value: { search: '' }, writable: true, configurable: true,
          },
        )
        expect(getParams()).toEqual({})
      },
    )
    it(
      'should return empty object when search is "?"',
      () => {
        Object.defineProperty(
          window,
          'location',
          {
            value: { search: '?' }, writable: true, configurable: true,
          },
        )
        expect(getParams()).toEqual({})
      },
    )
    it(
      'should handle a parameter without a value',
      () => {
        Object.defineProperty(
          window,
          'location',
          {
            value: { search: '?key' }, writable: true, configurable: true,
          },
        )
        expect(getParams()).toEqual({ key: undefined })
      },
    )
  },
)

describe(
  'loadRefreshTokenStorageFromParams',
  () => {
    const originalLocation = window.location

    afterEach(() => {
      Object.defineProperty(
        window,
        'location',
        {
          value: originalLocation,
          configurable: true,
        },
      )
      window.localStorage.clear()
      window.sessionStorage.clear()
    })

    it(
      'should load refresh token from params and store it in localStorage when no storageKey is provided',
      () => {
        Object.defineProperty(
          window,
          'location',
          {
            value: { search: '?refresh_token=my-token&refresh_token_expires_on=10000&refresh_token_expires_in=360' },
            configurable: true,
          },
        )
        const result = loadRefreshTokenStorageFromParams()
        expect(result).toEqual({
          refreshToken: 'my-token', expiresOn: 10000, expiresIn: 360,
        })
        expect(window.localStorage.getItem(StorageKey.RefreshToken)).toEqual(JSON.stringify(result))
      },
    )

    it(
      'should load refresh token from params and store it in sessionStorage when "sessionStorage" is provided',
      () => {
        Object.defineProperty(
          window,
          'location',
          {
            value: { search: '?refresh_token=token123&refresh_token_expires_on=20000&refresh_token_expires_in=720' },
            configurable: true,
          },
        )
        const result = loadRefreshTokenStorageFromParams('sessionStorage')
        expect(result).toEqual({
          refreshToken: 'token123', expiresOn: 20000, expiresIn: 720,
        })
        expect(window.sessionStorage.getItem(StorageKey.RefreshToken)).toEqual(JSON.stringify(result))
      },
    )

    it(
      'should return null and not store anything when the required params are missing',
      () => {
        Object.defineProperty(
          window,
          'location',
          {
            value: { search: '?foo=bar' },
            configurable: true,
          },
        )
        const result = loadRefreshTokenStorageFromParams()
        expect(result).toBeNull()
        expect(window.localStorage.getItem(StorageKey.RefreshToken)).toBeNull()
      },
    )

    it(
      'should remove StorageKey.IdToken from storage after loading token',
      () => {
        window.localStorage.setItem(
          StorageKey.IdToken,
          JSON.stringify({
            idToken: 'dummyIdToken',
            account: 'dummyAccount',
          }),
        )
        Object.defineProperty(
          window,
          'location',
          {
            value: { search: '?refresh_token=my-token&refresh_token_expires_on=10000&refresh_token_expires_in=360' },
            configurable: true,
          },
        )
        const result = loadRefreshTokenStorageFromParams()
        expect(result).toEqual({
          refreshToken: 'my-token', expiresOn: 10000, expiresIn: 360,
        })
        expect(window.localStorage.getItem(StorageKey.IdToken)).toBeNull()
      },
    )
  },
)
