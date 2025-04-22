import {
  describe, it, expect, beforeEach, afterEach,
} from 'vitest'
import {
  ErrorType, handleError, checkStorage, isValidStorage, isValidTokens, getParams,
  loadRefreshTokenStorageFromParams,
} from './frontend'
import { StorageKey } from './enum.js'

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
          StorageKey.Account,
          'dummyAccount',
        )
        const result = checkStorage()
        expect(result).toEqual({
          storedRefreshToken: 'dummyRefreshToken',
          storedAccount: 'dummyAccount',
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
          StorageKey.Account,
          'sessionAccount',
        )
        const result = checkStorage('sessionStorage')
        expect(result).toEqual({
          storedRefreshToken: 'sessionRefresh',
          storedAccount: 'sessionAccount',
        })
      },
    )

    it(
      'should return null values when keys are not present',
      () => {
        const result = checkStorage()
        expect(result).toEqual({
          storedRefreshToken: null,
          storedAccount: null,
        })
      },
    )
  },
)

describe(
  'isValidStorage',
  () => {
    it(
      'should return true when refresh token is valid',
      () => {
        const currentTimestamp = new Date().getTime() / 1000
        const validToken = {
          refreshToken: 'valid-token', expiresOn: currentTimestamp + 10,
        }
        expect(isValidStorage(validToken)).toBe(true)
      },
    )
    it(
      'should return false when refresh token expires too soon',
      () => {
        const currentTimestamp = new Date().getTime() / 1000
        const invalidToken = {
          refreshToken: 'valid-token', expiresOn: currentTimestamp + 2,
        }
        expect(isValidStorage(invalidToken)).toBe(false)
      },
    )
    it(
      'should return false when refreshToken is empty',
      () => {
        const currentTimestamp = new Date().getTime() / 1000
        const missingToken = {
          refreshToken: '', expiresOn: currentTimestamp + 10,
        }
        expect(Boolean(isValidStorage(missingToken))).toBe(false)
      },
    )
    it(
      'should return false when expiresOn is zero',
      () => {
        const tokenMissingExpires = {
          refreshToken: 'valid-token', expiresOn: 0,
        }
        expect(Boolean(isValidStorage(tokenMissingExpires))).toBe(false)
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
        }
        const validRefresh = {
          refreshToken: 'valid-refresh', expiresOn: currentTimestamp + 10, expiresIn: 10,
        }
        expect(isValidTokens(
          validAccess,
          validRefresh,
        )).toEqual({
          hasValidAccessToken: true, hasValidRefreshToken: true,
        })
      },
    )
    it(
      'should return false for expired access token',
      () => {
        const currentTimestamp = new Date().getTime() / 1000
        const expiredAccess = {
          accessToken: 'expired', expiresOn: currentTimestamp + 2,
        }
        const validRefresh = {
          refreshToken: 'valid-refresh', expiresOn: currentTimestamp + 10, expiresIn: 10,
        }
        expect(isValidTokens(
          expiredAccess,
          validRefresh,
        )).toEqual({
          hasValidAccessToken: false, hasValidRefreshToken: true,
        })
      },
    )
    it(
      'should return false for expired refresh token',
      () => {
        const currentTimestamp = new Date().getTime() / 1000
        const validAccess = {
          accessToken: 'valid-access', expiresOn: currentTimestamp + 10,
        }
        const expiredRefresh = {
          refreshToken: 'expired', expiresOn: currentTimestamp + 2, expiresIn: 10,
        }
        expect(isValidTokens(
          validAccess,
          expiredRefresh,
        )).toEqual({
          hasValidAccessToken: true, hasValidRefreshToken: false,
        })
      },
    )
    it(
      'should return false for both tokens null',
      () => {
        expect(isValidTokens(
          null,
          null,
        )).toEqual({
          hasValidAccessToken: false, hasValidRefreshToken: false,
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
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
      })
      window.localStorage.clear()
      window.sessionStorage.clear()
    })

    it(
      'should load refresh token from params and store it in localStorage when no storageKey is provided',
      () => {
        Object.defineProperty(window, 'location', {
          value: { search: '?refresh_token=my-token&refresh_token_expires_on=10000&refresh_token_expires_in=360' },
          configurable: true,
        })
        const result = loadRefreshTokenStorageFromParams()
        expect(result).toEqual({ refreshToken: 'my-token', expiresOn: 10000, expiresIn: 360 })
        expect(window.localStorage.getItem(StorageKey.RefreshToken)).toEqual(JSON.stringify(result))
      },
    )

    it(
      'should load refresh token from params and store it in sessionStorage when "sessionStorage" is provided',
      () => {
        Object.defineProperty(window, 'location', {
          value: { search: '?refresh_token=token123&refresh_token_expires_on=20000&refresh_token_expires_in=720' },
          configurable: true,
        })
        const result = loadRefreshTokenStorageFromParams('sessionStorage')
        expect(result).toEqual({ refreshToken: 'token123', expiresOn: 20000, expiresIn: 720 })
        expect(window.sessionStorage.getItem(StorageKey.RefreshToken)).toEqual(JSON.stringify(result))
      },
    )

    it(
      'should return null and not store anything when the required params are missing',
      () => {
        Object.defineProperty(window, 'location', {
          value: { search: '?foo=bar' },
          configurable: true,
        })
        const result = loadRefreshTokenStorageFromParams()
        expect(result).toBeNull()
        expect(window.localStorage.getItem(StorageKey.RefreshToken)).toBeNull()
      },
    )
  },
)
