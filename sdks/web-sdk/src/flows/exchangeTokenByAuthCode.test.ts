import {
  describe, it, beforeEach, afterEach, expect, vi,
} from 'vitest'
// Import any necessary types and key constants from your shared module
import type { ProviderConfig } from 'shared'
import {
  SessionStorageKey, StorageKey,
} from 'shared'
import { postTokenByAuthCode } from '../requests'
import {
  exchangeTokenByAuthCode, loadCodeAndStateFromUrl,
} from './exchangeTokenByAuthCode'

// ----------------------------------------------------------------------------
// Mock the external dependency that makes the HTTP call.
// ----------------------------------------------------------------------------
vi.mock(
  '../requests',
  () => ({ postTokenByAuthCode: vi.fn() }),
)
// Type assertion so we can use mock helper functions on postTokenByAuthCode
const mockedPostTokenByAuthCode = postTokenByAuthCode as unknown as ReturnType<typeof vi.fn>

describe(
  'exchangeTokenByAuthCode',
  () => {
    beforeEach(() => {
    // Clear storages and mocks between tests
      window.sessionStorage.clear()
      window.localStorage.clear()
      vi.clearAllMocks()
    })

    afterEach(() => {
    // Reset URL back to default after tests
      window.history.replaceState(
        {},
        '',
        '/',
      )
    })

    it(
      'should return undefined if no code or state in URL query',
      async () => {
        // Set URL with a query that does not include code or state
        window.history.pushState(
          {},
          'Test Title',
          '/?foo=bar',
        )

        const config: ProviderConfig = { storage: 'sessionStorage' } as any
        const result = await exchangeTokenByAuthCode(
          '',
          '',
          config,
        )
        expect(result).toBeUndefined()
      },
    )

    it(
      'should return undefined if state is not found in sessionStorage',
      async () => {
        // Set URL with code/state parameters but no state key saved in sessionStorage
        window.history.pushState(
          {},
          'Test Title',
          '/?code=authCode&state=someState',
        )
        const config: ProviderConfig = { storage: 'sessionStorage' } as any
        const result = await exchangeTokenByAuthCode(
          'authCode',
          'someState',
          config,
        )
        expect(result).toBeUndefined()
      },
    )

    it(
      'should throw error if state does not match',
      async () => {
        // Set URL with code/state parameters
        window.history.pushState(
          {},
          'Test Title',
          '/?code=authCode&state=stateFromQuery',
        )
        // Save a different state in sessionStorage than is in the URL
        window.sessionStorage.setItem(
          SessionStorageKey.State,
          'differentState',
        )
        const config: ProviderConfig = { storage: 'sessionStorage' } as any
        await expect(exchangeTokenByAuthCode(
          'authCode',
          'strateFromQuery',
          config,
        )).rejects.toThrow('Invalid state')
      },
    )

    it(
      'should exchange token successfully with refresh_token and id_token',
      async () => {
        // Set URL with valid code and state
        window.history.pushState(
          {},
          'Test Title',
          '/?code=authcode&state=validState',
        )
        window.sessionStorage.setItem(
          SessionStorageKey.State,
          'validState',
        )
        window.sessionStorage.setItem(
          SessionStorageKey.CodeVerifier,
          'verifierValue',
        )

        // Prepare fake token result with refresh_token and id_token
        const fakePayload = '{"sub":"12345"}'
        const encodedPayload = btoa(fakePayload) // creates a base64 string
        const fakeTokenResult = {
          access_token: 'access123',
          expires_in: 3600,
          expires_on: 'expiryTime',
          refresh_token: 'refresh123',
          refresh_token_expires_in: 7200,
          refresh_token_expires_on: 'refreshExpiry',
          id_token: `header.${encodedPayload}.signature`,
        }

        mockedPostTokenByAuthCode.mockResolvedValueOnce(fakeTokenResult)
        // Spy on history.replaceState so we verify URL cleaning later
        const replaceStateSpy = vi.spyOn(
          window.history,
          'replaceState',
        )

        const config: ProviderConfig = { storage: 'sessionStorage' } as any
        const result = await exchangeTokenByAuthCode(
          'authCode',
          'validState',
          config,
        )

        // Ensure the returned response has correct token properties
        expect(result).toEqual({
          accessTokenStorage: {
            accessToken: 'access123',
            expiresIn: 3600,
            expiresOn: 'expiryTime',
          },
          refreshTokenStorage: {
            refreshToken: 'refresh123',
            expiresIn: 7200,
            expiresOn: 'refreshExpiry',
          },
          idTokenBody: JSON.parse(fakePayload),
        })

        // Ensure state and code verifier keys are removed from sessionStorage
        expect(window.sessionStorage.getItem(SessionStorageKey.State)).toBeNull()
        expect(window.sessionStorage.getItem(SessionStorageKey.CodeVerifier)).toBeNull()

        // Verify that tokens are stored in the chosen storage (sessionStorage)
        const storedRefreshToken = window.sessionStorage.getItem(StorageKey.RefreshToken)
        expect(storedRefreshToken).toBe(JSON.stringify({
          refreshToken: 'refresh123',
          expiresIn: 7200,
          expiresOn: 'refreshExpiry',
        }))

        const storedAccount = window.sessionStorage.getItem(StorageKey.Account)
        expect(storedAccount).toBe(fakePayload) // The decoded id_token payload

        // Ensure postTokenByAuthCode is called with the correct parameters
        expect(mockedPostTokenByAuthCode).toHaveBeenCalledWith(
          config,
          {
            code: 'authCode',
            codeVerifier: 'verifierValue',
          },
        )

        // Check that the URL query string has been removed
        expect(replaceStateSpy).toHaveBeenCalled()
        const newUrl = new URL(window.location.href)
        expect(newUrl.search).toBe('')
      },
    )

    it(
      'should exchange token successfully without refresh_token and id_token',
      async () => {
        // Set URL with valid code and state
        window.history.pushState(
          {},
          'Test Title',
          '/?code=authcode&state=validState',
        )
        window.sessionStorage.setItem(
          SessionStorageKey.State,
          'validState',
        )
        window.sessionStorage.setItem(
          SessionStorageKey.CodeVerifier,
          'verifierValue',
        )

        // Prepare fake token result without refresh_token and id_token
        const fakeTokenResult = {
          access_token: 'access123',
          expires_in: 3600,
          expires_on: 'expiryTime',
          // No refresh_token and id_token provided
        }

        mockedPostTokenByAuthCode.mockResolvedValueOnce(fakeTokenResult)
        const config: ProviderConfig = { storage: 'sessionStorage' } as any
        const result = await exchangeTokenByAuthCode(
          'authCode',
          'validState',
          config,
        )

        expect(result).toEqual({
          accessTokenStorage: {
            accessToken: 'access123',
            expiresIn: 3600,
            expiresOn: 'expiryTime',
          },
          refreshTokenStorage: null,
          idTokenBody: null,
        })

        // Ensure state and code verifier keys are removed from sessionStorage
        expect(window.sessionStorage.getItem(SessionStorageKey.State)).toBeNull()
        expect(window.sessionStorage.getItem(SessionStorageKey.CodeVerifier)).toBeNull()

        // Verify that no tokens have been stored for refresh or account
        expect(window.sessionStorage.getItem(StorageKey.RefreshToken)).toBeNull()
        expect(window.sessionStorage.getItem(StorageKey.Account)).toBeNull()
      },
    )

    it(
      'should decode id_token payload correctly with missing padding and url-safe encoding',
      async () => {
        // Set URL with valid code and state
        window.history.pushState(
          {},
          'Test Title',
          '/?code=authcode&state=validState',
        )
        window.sessionStorage.setItem(
          SessionStorageKey.State,
          'validState',
        )
        window.sessionStorage.setItem(
          SessionStorageKey.CodeVerifier,
          'verifierValue',
        )

        // Prepare a fake token result with an id_token that uses URL-safe base64 encoding,
        // removing any "=" padding.
        const payloadObj = {
          foo: 'bar', num: 42,
        }
        const payloadStr = JSON.stringify(payloadObj)
        const base64Encoded = btoa(payloadStr)
        // Create a URL-safe version: replace '+' with '-', '/' with '_' and remove trailing '='.
        const urlSafeB64 = base64Encoded.replace(
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

        const fakeTokenResult = {
          access_token: 'access123',
          expires_in: 3600,
          expires_on: 'expiryTime',
          id_token: `header.${urlSafeB64}.signature`,
        }

        mockedPostTokenByAuthCode.mockResolvedValueOnce(fakeTokenResult)

        const config: ProviderConfig = { storage: 'sessionStorage' } as any
        const result = await exchangeTokenByAuthCode(
          'authCode',
          'validState',
          config,
        )

        // Validate that the idTokenBody is correctly decoded from our URL-safe base64 string.
        expect(result?.idTokenBody).toEqual(payloadObj)
      },
    )

    it(
      'should throw error when postTokenByAuthCode fails',
      async () => {
        // Set URL with valid code and state
        window.history.pushState(
          {},
          'Test Title',
          '/?code=errorCode&state=errorState',
        )
        window.sessionStorage.setItem(
          SessionStorageKey.State,
          'errorState',
        )
        window.sessionStorage.setItem(
          SessionStorageKey.CodeVerifier,
          'errorVerifier',
        )

        // Simulate an error from postTokenByAuthCode
        const errorMessage = 'Network error'
        mockedPostTokenByAuthCode.mockRejectedValueOnce(new Error(errorMessage))

        const config: ProviderConfig = { storage: 'sessionStorage' } as any

        // Ensure the function throws the expected error with our custom message.
        await expect(exchangeTokenByAuthCode(
          'errorCode',
          'errorState',
          config,
        ))
          .rejects.toThrow(`Failed to exchange token by auth code: Error: ${errorMessage}`)
      },
    )

    it(
      'should store tokens in localStorage when config.storage is not sessionStorage',
      async () => {
        // Set URL with valid code and state
        window.history.pushState(
          {},
          'Test Title',
          '/?code=localCode&state=validLocalState',
        )
        window.sessionStorage.setItem(
          SessionStorageKey.State,
          'validLocalState',
        )
        window.sessionStorage.setItem(
          SessionStorageKey.CodeVerifier,
          'localVerifier',
        )

        // Prepare fake token result with both refresh_token and id_token.
        const payloadObj = { local: 'value' }
        const payloadStr = JSON.stringify(payloadObj)
        const encodedPayload = btoa(payloadStr)

        const fakeTokenResult = {
          access_token: 'accessLocal',
          expires_in: 3600,
          expires_on: 'expireLocal',
          refresh_token: 'refreshLocal',
          refresh_token_expires_in: 7200,
          refresh_token_expires_on: 'refreshExpireLocal',
          id_token: `header.${encodedPayload}.signature`,
        }

        mockedPostTokenByAuthCode.mockResolvedValueOnce(fakeTokenResult)

        // Use localStorage by setting config.storage to something other than 'sessionStorage'
        const config: ProviderConfig = { storage: 'localStorage' } as any
        const result = await exchangeTokenByAuthCode(
          'localCode',
          'validLocalState',
          config,
        )

        // Validate returned response has the expected tokens
        expect(result).toEqual({
          accessTokenStorage: {
            accessToken: 'accessLocal',
            expiresIn: 3600,
            expiresOn: 'expireLocal',
          },
          refreshTokenStorage: {
            refreshToken: 'refreshLocal',
            expiresIn: 7200,
            expiresOn: 'refreshExpireLocal',
          },
          idTokenBody: payloadObj,
        })

        // Verify that tokens are stored in localStorage
        expect(window.localStorage.getItem(StorageKey.RefreshToken)).toBe(JSON.stringify({
          refreshToken: 'refreshLocal',
          expiresIn: 7200,
          expiresOn: 'refreshExpireLocal',
        }))
        expect(window.localStorage.getItem(StorageKey.Account)).toBe(payloadStr)

        // Ensure that the tokens are not stored in sessionStorage
        expect(window.sessionStorage.getItem(StorageKey.RefreshToken)).toBeNull()
        expect(window.sessionStorage.getItem(StorageKey.Account)).toBeNull()
      },
    )
  },
)

// Add the following tests for loadCodeAndStateFromUrl function
describe(
  'loadCodeAndStateFromUrl',
  () => {
    it(
      'should return empty code and state if they are not present in the URL',
      () => {
        // Set URL with no code and state parameters
        window.history.pushState(
          {},
          'Test Title',
          '/?foo=bar',
        )
        const result = loadCodeAndStateFromUrl()
        expect(result).toEqual({
          code: '', state: '',
        })
      },
    )

    it(
      'should return the correct code and state from the URL',
      () => {
        // Set URL with both code and state parameters
        window.history.pushState(
          {},
          'Test Title',
          '/?code=auth123&state=state456',
        )
        const result = loadCodeAndStateFromUrl()
        expect(result).toEqual({
          code: 'auth123', state: 'state456',
        })
      },
    )

    it(
      'should return empty code and state if only one parameter exists',
      () => {
        // Set URL with only a code parameter
        window.history.pushState(
          {},
          'Test Title',
          '/?code=onlyCode',
        )
        const result = loadCodeAndStateFromUrl()
        expect(result).toEqual({
          code: '', state: '',
        })
      },
    )
  },
)
