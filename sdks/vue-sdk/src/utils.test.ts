import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest'

import {
  exchangeTokenByAuthCode,
  exchangeTokenByRefreshToken,
} from '@melody-auth/web'

import {
  isValidTokens,
  handleError,
  ErrorType,
} from '@melody-auth/shared'

import {
  handleTokenExchangeByAuthCode,
  acquireToken,
} from './utils'

// Define a minimal AuthState interface for tests
type AuthState = {
  config: {
    onLoginSuccess?: (options: { state: string; locale?: string }) => void;
  };
  accessTokenStorage?: { accessToken: string };
  refreshTokenStorage?: { refreshToken: string };
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  isLoadingToken: boolean;
  acquireTokenError: string;
  authenticationError: string;
  account?: any;
  checkedStorage: boolean;
}

vi.mock(
  '@melody-auth/web',
  () => {
    return {
      exchangeTokenByAuthCode: vi.fn(),
      exchangeTokenByRefreshToken: vi.fn(),
    }
  },
)

vi.mock(
  '@melody-auth/shared',
  () => {
    return {
      handleError: vi.fn().mockImplementation((
        e, errorType,
      ) => `handled ${errorType}`),
      isValidTokens: vi.fn(),
      ErrorType: {
        ObtainAccessToken: 'ObtainAccessToken',
        ExchangeAccessToken: 'ExchangeAccessToken',
        InvalidRefreshToken: 'InvalidRefreshToken',
      },
    }
  },
)

describe(
  'handleTokenExchangeByAuthCode',
  () => {
    let state: AuthState
    beforeEach(() => {
      state = {
        config: { onLoginSuccess: vi.fn() },
        accessTokenStorage: undefined,
        refreshTokenStorage: undefined,
        isAuthenticated: false,
        isAuthenticating: true,
        isLoadingToken: false,
        acquireTokenError: '',
        authenticationError: '',
        account: undefined,
        checkedStorage: false,
      }
      vi.clearAllMocks()
    })

    it(
      'should update state on successful exchange with accessTokenStorage and refreshTokenStorage',
      async () => {
        const mockResponse = {
          accessTokenStorage: { accessToken: 'fakeAccess' },
          refreshTokenStorage: { refreshToken: 'fakeRefresh' },
          idTokenBody: { sub: 'user1' },
        }
        const mockedExchangeToken = exchangeTokenByAuthCode as unknown as vi.Mock
        mockedExchangeToken.mockResolvedValue(mockResponse)

        handleTokenExchangeByAuthCode(
          'code123',
          'reqState',
          state,
          'en',
        )

        // Wait for promise resolution
        await Promise.resolve()

        expect(state.accessTokenStorage).toEqual(mockResponse.accessTokenStorage)
        expect(state.isAuthenticated).toBe(true)
        expect(state.isAuthenticating).toBe(false)
        expect(state.isLoadingToken).toBe(false)
        expect(state.acquireTokenError).toBe('')
        expect(state.config.onLoginSuccess).toHaveBeenCalledWith({
          state: 'reqState', locale: 'en',
        })
        expect(state.refreshTokenStorage).toEqual(mockResponse.refreshTokenStorage)
        expect(state.account).toEqual(mockResponse.idTokenBody)
        expect(state.checkedStorage).toBe(true)
      },
    )

    it(
      'should set isAuthenticating to false if response has no accessTokenStorage',
      async () => {
        const mockResponse = {
          // No accessTokenStorage provided
          refreshTokenStorage: { refreshToken: 'fakeRefresh' },
          idTokenBody: { sub: 'user1' },
        }
        const mockedExchangeToken = exchangeTokenByAuthCode as unknown as vi.Mock
        mockedExchangeToken.mockResolvedValue(mockResponse)

        handleTokenExchangeByAuthCode(
          'code123',
          'reqState',
          state,
        )

        await Promise.resolve()

        expect(state.isAuthenticating).toBe(false)
        expect(state.config.onLoginSuccess).not.toHaveBeenCalled()
        expect(state.refreshTokenStorage).toEqual(mockResponse.refreshTokenStorage)
        expect(state.account).toEqual(mockResponse.idTokenBody)
        expect(state.checkedStorage).toBe(true)
      },
    )

    it(
      'should handle error properly if exchangeTokenByAuthCode rejects',
      async () => {
        const error = new Error('Test error')
        const mockedExchangeToken = exchangeTokenByAuthCode as unknown as vi.Mock
        mockedExchangeToken.mockRejectedValue(error)

        // Set up spy on handleError
        const handleErrorSpy = handleError as unknown as vi.Mock

        // Call the function that should trigger the error
        handleTokenExchangeByAuthCode(
          'code123',
          'reqState',
          state,
        )

        // Wait for all promises to resolve/reject
        await new Promise(process.nextTick)

        // Verify the error was handled correctly
        expect(handleErrorSpy).toHaveBeenCalledWith(
          error,
          ErrorType.ObtainAccessToken,
        )
        expect(state.authenticationError).toBe(`handled ${ErrorType.ObtainAccessToken}`)
        expect(state.isAuthenticating).toBe(false)
      },
    )
  },
)

describe(
  'acquireToken',
  () => {
    let state: AuthState
    beforeEach(() => {
      state = {
        config: {},
        accessTokenStorage: undefined,
        refreshTokenStorage: undefined,
        isAuthenticated: false,
        isAuthenticating: true,
        isLoadingToken: false,
        acquireTokenError: '',
        authenticationError: '',
        account: undefined,
        checkedStorage: false,
      }
      vi.clearAllMocks()
    })

    it(
      'should return access token if access token is valid',
      async () => {
        state.accessTokenStorage = { accessToken: 'validAccess' }
        const mockedIsValidTokens = isValidTokens as unknown as vi.Mock
        mockedIsValidTokens.mockReturnValue({
          hasValidAccessToken: true, hasValidRefreshToken: false,
        })

        const token = await acquireToken(state)

        expect(token).toBe('validAccess')
      },
    )

    it(
      'should exchange token when refresh token is valid',
      async () => {
        state.refreshTokenStorage = { refreshToken: 'validRefresh' }
        const mockedIsValidTokens = isValidTokens as unknown as vi.Mock
        mockedIsValidTokens.mockReturnValue({
          hasValidAccessToken: false, hasValidRefreshToken: true,
        })

        const newTokenResponse = { accessToken: 'newAccess' }
        const mockedExchangeByRefreshToken = exchangeTokenByRefreshToken as unknown as vi.Mock
        mockedExchangeByRefreshToken.mockResolvedValue(newTokenResponse)

        const token = await acquireToken(state)

        expect(token).toBe('newAccess')
        expect(state.accessTokenStorage).toEqual(newTokenResponse)
        expect(state.isAuthenticated).toBe(true)
        expect(state.isAuthenticating).toBe(false)
        expect(state.isLoadingToken).toBe(false)
        expect(state.acquireTokenError).toBe('')
      },
    )

    it(
      'should set error for invalid tokens',
      async () => {
        const mockedIsValidTokens = isValidTokens as unknown as vi.Mock
        mockedIsValidTokens.mockReturnValue({
          hasValidAccessToken: false, hasValidRefreshToken: false,
        })

        const token = await acquireToken(state)

        expect(token).toBeUndefined()
        expect(state.acquireTokenError).toBe(ErrorType.InvalidRefreshToken)
        expect(state.isLoadingToken).toBe(false)
        expect(state.isAuthenticating).toBe(false)
      },
    )

    it(
      'should handle error when exchangeTokenByRefreshToken rejects',
      async () => {
        state.refreshTokenStorage = { refreshToken: 'invalidRefresh' }
        const mockedIsValidTokens = isValidTokens as unknown as vi.Mock
        mockedIsValidTokens.mockReturnValue({
          hasValidAccessToken: false, hasValidRefreshToken: true,
        })

        const error = new Error('Refresh error')
        const mockedExchangeByRefreshToken = exchangeTokenByRefreshToken as unknown as vi.Mock
        mockedExchangeByRefreshToken.mockRejectedValue(error)

        const token = await acquireToken(state)

        expect(token).toBeUndefined()
        expect(handleError).toHaveBeenCalledWith(
          error,
          ErrorType.ExchangeAccessToken,
        )
        expect(state.acquireTokenError).toBe(`handled ${ErrorType.ExchangeAccessToken}`)
        expect(state.isLoadingToken).toBe(false)
        expect(state.isAuthenticating).toBe(false)
      },
    )
  },
)
