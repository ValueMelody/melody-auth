import {
  describe, it, expect, vi, beforeEach,
} from 'vitest'

// Import the functions under test and the mocked functions
import {
  exchangeTokenByAuthCode,
  exchangeTokenByRefreshToken,
} from '@melody-auth/web'
import {
  ErrorType,
  isValidTokens,
} from '@melody-auth/shared'
import {
  handleTokenExchangeByAuthCode, acquireToken,
} from './utils'

// MOCK EXTERNAL DEPENDENCIES BEFORE IMPORTING the module under test
vi.mock(
  '@melody-auth/web',
  () => ({
    exchangeTokenByAuthCode: vi.fn(),
    exchangeTokenByRefreshToken: vi.fn(),
  }),
)
vi.mock(
  '@melody-auth/shared',
  () => ({
    handleError: (err) => err,
    ErrorType: {
      ObtainAccessToken: 'ObtainAccessToken',
      ExchangeAccessToken: 'ExchangeAccessToken',
      InvalidRefreshToken: 'InvalidRefreshToken',
    },
    isValidTokens: vi.fn(),
  }),
)

// A helper to simulate Angular's WritableSignal
function createFakeWritableSignal (initialValue: any) {
  let value = initialValue
  const signal = () => value
  signal.update = (updater: (prev: any) => any) => {
    value = updater(value)
  }
  return signal
}

describe(
  'handleTokenExchangeByAuthCode',
  () => {
    beforeEach(() => {
      vi.resetAllMocks()
    })

    it(
      'should update state correctly on a successful token exchange',
      async () => {
        const onLoginSuccess = vi.fn()
        const initialState = {
          config: {
            testConfig: true, onLoginSuccess,
          },
          isAuthenticated: false,
          isAuthenticating: true,
          isLoadingToken: true,
          acquireTokenError: '',
          accessTokenStorage: null,
          refreshTokenStorage: null,
          account: null,
          checkedStorage: false,
        }
        const state = createFakeWritableSignal(initialState)

        const fakeResponse = {
          accessTokenStorage: { accessToken: 'sample-access-token' },
          refreshTokenStorage: { refreshToken: 'sample-refresh-token' },
          idTokenBody: { id: 'account1' },
        }
    // resolve the promise returned by exchangeTokenByAuthCode
    ;(exchangeTokenByAuthCode as any).mockResolvedValue(fakeResponse)

        // Call the function under test
        handleTokenExchangeByAuthCode(
          'sample-code',
          'sample-state',
          state,
          'en',
        )

        // Wait for promise resolution in handleTokenExchangeByAuthCode:
        await new Promise((resolve) => setTimeout(
          resolve,
          0,
        ))

        const updatedState = state()
        expect(updatedState.accessTokenStorage).toEqual(fakeResponse.accessTokenStorage)
        expect(updatedState.isAuthenticated).toBe(true)
        expect(updatedState.isAuthenticating).toBe(false)
        expect(updatedState.isLoadingToken).toBe(false)
        expect(updatedState.acquireTokenError).toBe('')
        expect(updatedState.refreshTokenStorage).toEqual(fakeResponse.refreshTokenStorage)
        expect(updatedState.account).toEqual(fakeResponse.idTokenBody)
        expect(updatedState.checkedStorage).toBe(true)
        expect(onLoginSuccess).toHaveBeenCalledWith({
          state: 'sample-state', locale: 'en',
        })
      },
    )

    it(
      'should update state with error on token exchange failure',
      async () => {
        const initialState = {
          config: { testConfig: true },
          isAuthenticated: false,
          isAuthenticating: true,
          acquireTokenError: '',
        }
        const state = createFakeWritableSignal(initialState)
        const error = new Error('failure')
    ;(exchangeTokenByAuthCode as any).mockRejectedValue(error)

        // Spy on console.error so as not to pollute test output.
        const consoleSpy = vi.spyOn(
          console,
          'error',
        ).mockImplementation(() => {})

        handleTokenExchangeByAuthCode(
          'code',
          'reqState',
          state,
        )

        await new Promise((resolve) => setTimeout(
          resolve,
          0,
        ))

        const updatedState = state()
        expect(updatedState.authenticationError).toBe(error)
        expect(updatedState.isAuthenticating).toBe(false)
        expect(consoleSpy).toHaveBeenCalledWith(
          'Authentication error:',
          error,
        )
        consoleSpy.mockRestore()
      },
    )
  },
)

describe(
  'acquireToken',
  () => {
    beforeEach(() => {
      vi.resetAllMocks()
    })

    it(
      'should immediately return the accessToken if valid',
      async () => {
        const initialState = {
          config: { testConfig: true },
          accessTokenStorage: { accessToken: 'existing-access' },
          refreshTokenStorage: { refreshToken: 'dummy-refresh' },
        }
        const state = createFakeWritableSignal(initialState)
    ;(isValidTokens as any).mockReturnValue({
          hasValidAccessToken: true,
          hasValidRefreshToken: false,
        })

        const token = await acquireToken(state)
        expect(token).toBe('existing-access')
      },
    )

    it(
      'should exchange refresh token if access token is invalid and return new token',
      async () => {
        const initialState = {
          config: { testConfig: true },
          accessTokenStorage: null,
          refreshTokenStorage: { refreshToken: 'dummy-refresh' },
          isAuthenticated: false,
          isAuthenticating: true,
          isLoadingToken: false,
          acquireTokenError: '',
        }
        const state = createFakeWritableSignal(initialState)
    ;(isValidTokens as any).mockReturnValue({
          hasValidAccessToken: false,
          hasValidRefreshToken: true,
        })

        const fakeResponse = { accessToken: 'new-access-token' }
    ;(exchangeTokenByRefreshToken as any).mockResolvedValue(fakeResponse)

        const token = await acquireToken(state)
        expect(token).toBe('new-access-token')

        const updatedState = state()
        expect(updatedState.accessTokenStorage).toEqual(fakeResponse)
        expect(updatedState.isAuthenticated).toBe(true)
        expect(updatedState.isAuthenticating).toBe(false)
        expect(updatedState.isLoadingToken).toBe(false)
        expect(updatedState.acquireTokenError).toBe('')
      },
    )

    it(
      'should update state with error if refresh token exchange fails',
      async () => {
        const initialState = {
          config: { testConfig: true },
          accessTokenStorage: null,
          refreshTokenStorage: { refreshToken: 'dummy-refresh' },
          isAuthenticated: false,
          isAuthenticating: true,
          isLoadingToken: false,
          acquireTokenError: '',
        }
        const state = createFakeWritableSignal(initialState)
    ;(isValidTokens as any).mockReturnValue({
          hasValidAccessToken: false,
          hasValidRefreshToken: true,
        })

        const error = new Error('exchange failed')
    ;(exchangeTokenByRefreshToken as any).mockRejectedValue(error)

        const token = await acquireToken(state)
        expect(token).toBeUndefined()

        const updatedState = state()
        expect(updatedState.acquireTokenError).toBe(error)
        expect(updatedState.isLoadingToken).toBe(false)
        expect(updatedState.isAuthenticating).toBe(false)
      },
    )

    it(
      'should update state with error if no valid tokens are available',
      async () => {
        const initialState = {
          config: { testConfig: true },
          accessTokenStorage: null,
          refreshTokenStorage: null,
          isLoadingToken: true,
          isAuthenticating: true,
          acquireTokenError: '',
        }
        const state = createFakeWritableSignal(initialState)
    ;(isValidTokens as any).mockReturnValue({
          hasValidAccessToken: false,
          hasValidRefreshToken: false,
        })

        const token = await acquireToken(state)
        expect(token).toBeUndefined()

        const updatedState = state()
        expect(updatedState.acquireTokenError).toBe(ErrorType.InvalidRefreshToken)
        expect(updatedState.isLoadingToken).toBe(false)
        expect(updatedState.isAuthenticating).toBe(false)
      },
    )
  },
)

describe(
  'handleTokenExchangeByAuthCode',
  () => {
  // ... existing tests ...

    // New unit test: cover the branch when no accessTokenStorage is returned.
    it(
      'should set isAuthenticating to false if no accessTokenStorage is returned',
      async () => {
        const onLoginSuccess = vi.fn()
        const initialState = {
          config: { onLoginSuccess }, // simulate a config object with an onLoginSuccess callback
          isAuthenticated: false,
          isAuthenticating: true,
          isLoadingToken: true,
          acquireTokenError: '',
          refreshTokenStorage: null,
          account: null,
          checkedStorage: false,
        }

        const state = createFakeWritableSignal(initialState)
        // Simulate a response without accessTokenStorage (and also without refreshTokenStorage).
        const fakeResponse = {};
        (exchangeTokenByAuthCode as any).mockResolvedValue(fakeResponse)

        // Call the function under test.
        handleTokenExchangeByAuthCode(
          'dummy-code',
          'dummy-state',
          state,
        )

        // Wait for the promise resolution.
        await new Promise((resolve) => setTimeout(
          resolve,
          0,
        ))

        const updatedState = state()
        // Since no accessTokenStorage was returned, the else branch should set isAuthenticating to false.
        expect(updatedState.isAuthenticating).toBe(false)
        // Other properties remain unchanged.
        expect(updatedState.isAuthenticated).toBe(false)
        expect(updatedState.isLoadingToken).toBe(true)
      },
    )
  },
)
