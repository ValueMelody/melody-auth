import {
  describe, it, expect, beforeEach, vi,
} from 'vitest'
import {
  triggerLogin, getUserInfo, logout,
} from '@melody-auth/web'
import { AuthService } from './auth.service'
import { acquireToken } from './utils'
import { handleError } from '@melody-auth/shared'

// Mock the external dependencies
vi.mock(
  '@melody-auth/web',
  () => ({
    triggerLogin: vi.fn(),
    getUserInfo: vi.fn(),
    logout: vi.fn(),
  }),
)

vi.mock(
  '@melody-auth/shared',
  async () => {
    const original = await import('@melody-auth/shared')
    return {
      ...original,
      handleError: vi.fn(),
    }
  },
)

vi.mock(
  './utils',
  () => ({
    acquireToken: vi.fn(),
    handleTokenExchangeByAuthCode: vi.fn(),
  }),
)

// Create a helper to mimic Angular's signal
function fakeSignal<T> (initialValue: T) {
  let value = initialValue
  const signalFunc = () => value
  signalFunc.set = (newValue: T) => {
    value = {
      ...value,
      ...newValue,
    }
  }
  signalFunc.update = (updater: (prev: T) => T) => {
    value = updater(value)
  }
  return signalFunc
}

// Create a fake state and AuthContext for testing purposes using fakeSignal
function createFakeState () {
  return fakeSignal({
    accessTokenStorage: { accessToken: 'fake-access-token' },
    refreshTokenStorage: { refreshToken: 'fake-refresh-token' },
    isAuthenticated: false,
    isAuthenticating: false,
    account: { id: 'account1' },
    userInfo: null,
    isLoadingUserInfo: false,
    authenticationError: '',
    acquireTokenError: '',
    acquireUserInfoError: '',
    loginError: '',
    logoutError: '',
    config: { testConfig: true },
  })
}

describe(
  'AuthService',
  () => {
    let fakeState: any, fakeAuthContext: any, authService: AuthService

    beforeEach(() => {
      vi.clearAllMocks()
      fakeState = createFakeState()
      fakeAuthContext = { state: fakeState }
      authService = new AuthService(fakeAuthContext)
    })

    // Test getters that delegate to the authContext state
    describe(
      'getters',
      () => {
        it(
          'should return accessToken from state',
          () => {
            expect(authService.accessToken).toBe('fake-access-token')
          },
        )

        it(
          'should return refreshToken from state',
          () => {
            expect(authService.refreshToken).toBe('fake-refresh-token')
          },
        )

        it(
          'should return isAuthenticated from state',
          () => {
            fakeState.set({ isAuthenticated: true })
            expect(authService.isAuthenticated).toBe(true)
          },
        )

        it(
          'should return isAuthenticating from state',
          () => {
            fakeState.set({ isAuthenticating: true })
            expect(authService.isAuthenticating).toBe(true)
          },
        )

        it(
          'should return account from state',
          () => {
            expect(authService.account).toEqual({ id: 'account1' })
          },
        )

        it(
          'should return userInfo from state',
          () => {
            fakeState.set({ userInfo: { name: 'Test User' } })
            expect(authService.userInfo).toEqual({ name: 'Test User' })
          },
        )

        it(
          'should return isLoadingToken from state',
          () => {
            fakeState.set({ isLoadingToken: true })
            expect(authService.isLoadingToken).toBe(true)
          },
        )

        it(
          'should return isLoadingUserInfo from state',
          () => {
            fakeState.set({ isLoadingUserInfo: true })
            expect(authService.isLoadingUserInfo).toBe(true)
          },
        )

        it(
          'should return authenticationError from state',
          () => {
            fakeState.set({ authenticationError: 'auth error' })
            expect(authService.authenticationError).toBe('auth error')
          },
        )

        it(
          'should return acquireTokenError from state',
          () => {
            fakeState.set({ acquireTokenError: 'token error' })
            expect(authService.acquireTokenError).toBe('token error')
          },
        )

        it(
          'should return acquireUserInfoError from state',
          () => {
            fakeState.set({ acquireUserInfoError: 'user info error' })
            expect(authService.acquireUserInfoError).toBe('user info error')
          },
        )

        it(
          'should return loginError from state',
          () => {
            fakeState.set({ loginError: 'login error' })
            expect(authService.loginError).toBe('login error')
          },
        )

        it(
          'should return logoutError from state',
          () => {
            fakeState.set({ logoutError: 'logout error' })
            expect(authService.logoutError).toBe('logout error')
          },
        )

        // --- New tests for missing storage objects ---
        it(
          'should return null for accessToken when no accessTokenStorage is present',
          () => {
            fakeState.set({ accessTokenStorage: undefined })
            expect(authService.accessToken).toBeNull()
          },
        )

        it(
          'should return null for refreshToken when no refreshTokenStorage is present',
          () => {
            fakeState.set({ refreshTokenStorage: undefined })
            expect(authService.refreshToken).toBeNull()
          },
        )

        it(
          'should return null for accessToken when accessToken is missing in accessTokenStorage',
          () => {
            fakeState.set({ accessTokenStorage: {} })
            expect(authService.accessToken).toBeNull()
          },
        )

        it(
          'should return null for refreshToken when refreshToken is missing in refreshTokenStorage',
          () => {
            fakeState.set({ refreshTokenStorage: {} })
            expect(authService.refreshToken).toBeNull()
          },
        )
      },
    )

    // Tests for login method and its variants
    describe(
      'login method',
      () => {
        it(
          'should return early if authenticationError exists',
          async () => {
            fakeState.set({ authenticationError: 'Some error' })
            await authService.login('popup')
            expect(triggerLogin).not.toHaveBeenCalled()
          },
        )

        it(
          'should throw error if isAuthenticating is true',
          async () => {
            fakeState.set({ isAuthenticating: true })
            await expect(authService.login('popup')).rejects.toThrow('Please wait until isAuthenticating=false')
          },
        )

        it(
          'should throw error if already authenticated with no policy or with "sign_in_or_sign_up" policy',
          async () => {
            fakeState.set({ isAuthenticated: true })
            await expect(authService.login('popup')).rejects.toThrow('Already authenticated, please logout first')
          },
        )

        it(
          'should throw error when already authenticated and policy is sign_in_or_sign_up',
          async () => {
            fakeState.set({ isAuthenticated: true })
            await expect(authService.login(
              'popup',
              { policy: 'sign_in_or_sign_up' },
            )).rejects.toThrow('Already authenticated, please logout first')
          },
        )

        it(
          'should call triggerLogin with correct parameters on successful login',
          async () => {
            // Set state such that login can proceed:
            fakeState.set({ isAuthenticated: false })
            fakeState.set({ isAuthenticating: false })
            fakeState.set({ authenticationError: '' })
            const props = {
              locale: 'en', policy: 'some_policy',
            }
            await authService.login(
              'popup',
              props,
            )
            expect(triggerLogin).toHaveBeenCalledTimes(1)
            const callArgs = (triggerLogin as any).mock.calls[0]
            expect(callArgs[0]).toBe('popup')
            expect(callArgs[1]).toEqual({ testConfig: true })
            // Verify that authorizePopupHandler is defined and props are merged
            expect(typeof callArgs[2].authorizePopupHandler).toBe('function')
            expect(callArgs[2].locale).toBe('en')
            expect(callArgs[2].policy).toBe('some_policy')
          },
        )

        it(
          'should handle errors thrown by triggerLogin and update state.loginError',
          async () => {
            const simulatedError = new Error('Simulated login error');
            // Make triggerLogin throw an error
            (triggerLogin as any).mockImplementation(() => {
              throw simulatedError
            })

            const handleErrorSpy = vi.mocked(handleError).mockReturnValue('Fake login error')

            // Clear any previous loginError
            fakeState.set({ loginError: '' })

            // Act: call the login method
            await authService.login('popup')

            // Assert: verify that loginError is updated as expected
            expect(fakeState().loginError).toBe('Fake login error')

            handleErrorSpy.mockRestore()
          },
        )

        it(
          'should invoke authorizePopupHandler and call handleTokenExchangeByAuthCode with correct parameters',
          async () => {
            // Arrange: Ensure login can proceed by resetting state and provide props with locale.
            fakeState.set({
              isAuthenticated: false, isAuthenticating: false, authenticationError: '',
            })
            const props = {
              locale: 'en', policy: 'some_policy',
            }

            // Spy on handleTokenExchangeByAuthCode in utils module
            const utils = await import('./utils')
            const handleTokenExchangeSpy = vi.spyOn(
              utils,
              'handleTokenExchangeByAuthCode',
            ).mockReturnValue('exchanged-token')

            // Act: Call login so that triggerLogin is invoked with the merged options.
            await authService.login(
              'popup',
              props,
            )

            // Extract the configuration object (third argument) passed to triggerLogin.
            const thirdArg = (triggerLogin as any).mock.calls[0][2]
            expect(typeof thirdArg.authorizePopupHandler).toBe('function')

            // Prepare test values for the handler.
            const testRequestState = { foo: 'bar' }
            const testCode = 'abc123'

            // Invoke the authorizePopupHandler.
            const result = thirdArg.authorizePopupHandler({
              state: testRequestState, code: testCode,
            })

            // Assert: Verify that handleTokenExchangeByAuthCode is called with the proper parameters.
            expect(handleTokenExchangeSpy).toHaveBeenCalledWith(
              testCode,
              testRequestState,
              fakeAuthContext.state,
              props.locale,
            )
            expect(result).toBe('exchanged-token')

            handleTokenExchangeSpy.mockRestore()
          },
        )
      },
    )

    describe(
      'loginRedirect and loginPopup',
      () => {
        it(
          'loginRedirect should call login with method "redirect"',
          async () => {
            fakeState.isAuthenticated = false
            fakeState.isAuthenticating = false
            fakeState.authenticationError = ''
            await authService.loginRedirect({ locale: 'en' })
            expect(triggerLogin).toHaveBeenCalledTimes(1)
            const callArgs = (triggerLogin as any).mock.calls[0]
            expect(callArgs[0]).toBe('redirect')
          },
        )

        it(
          'loginPopup should call login with method "popup"',
          async () => {
            fakeState.isAuthenticated = false
            fakeState.isAuthenticating = false
            fakeState.authenticationError = ''
            await authService.loginPopup({ locale: 'en' })
            expect(triggerLogin).toHaveBeenCalledTimes(1)
            const callArgs = (triggerLogin as any).mock.calls[0]
            expect(callArgs[0]).toBe('popup')
          },
        )
      },
    )

    // Tests for token acquisition
    describe(
      'acquireToken',
      () => {
        it(
          'should call acquireToken and return its value',
          async () => {
            (acquireToken as any).mockResolvedValue('acquired-token')
            const token = await authService.acquireToken()
            expect(token).toBe('acquired-token')
            expect(acquireToken).toHaveBeenCalledTimes(1)
            // Check that acquireToken was called with the authContext.state function
            expect(acquireToken).toHaveBeenCalledWith(fakeAuthContext.state)
          },
        )
      },
    )

    describe(
      'acquireUserInfo',
      () => {
        it(
          'should return existing userInfo if available',
          async () => {
            const existingUserInfo = { name: 'existing-user' }
            fakeState.set({ userInfo: existingUserInfo })
            const result = await authService.acquireUserInfo()
            expect(result).toEqual(existingUserInfo)
            expect(getUserInfo).not.toHaveBeenCalled()
          },
        )

        it(
          'should fetch userInfo if not available and update state accordingly',
          async () => {
            ;(acquireToken as any).mockResolvedValue('acquired-token')
            ;(getUserInfo as any).mockResolvedValue({ name: 'new-user' })

            fakeState.set({ userInfo: null })
            const result = await authService.acquireUserInfo()
            expect(acquireToken).toHaveBeenCalledTimes(1)
            expect(getUserInfo).toHaveBeenCalledWith(
              { testConfig: true },
              { accessToken: 'acquired-token' },
            )
            expect(result).toEqual({ name: 'new-user' })
            expect(fakeState().userInfo).toEqual({ name: 'new-user' })
            expect(fakeState().isLoadingUserInfo).toBe(false)
            expect(fakeState().acquireUserInfoError).toBe('')
          },
        )

        it(
          'should handle errors when fetching userInfo and update state',
          async () => {
            fakeState.userInfo = null
            ;(acquireToken as any).mockResolvedValue('acquired-token')
            const error = new Error()
      ;(getUserInfo as any).mockRejectedValue(error)
            const handleErrorSpy = vi.mocked(handleError).mockReturnValue('Failed to fetch user info')
            const result = await authService.acquireUserInfo()
            expect(result).toBeUndefined()
            expect(getUserInfo).toHaveBeenCalledWith(
              { testConfig: true },
              { accessToken: 'acquired-token' },
            )
            expect(fakeState().acquireUserInfoError).toBe('Failed to fetch user info')
            expect(fakeState().isLoadingUserInfo).toBe(false)

            handleErrorSpy.mockRestore()
          },
        )
      },
    )

    // Tests for logoutRedirect method
    describe(
      'logoutRedirect',
      () => {
        it(
          'should call logout with appropriate parameters when tokens are available',
          async () => {
            (acquireToken as any).mockResolvedValue('acquired-token')
            fakeState.set({ refreshTokenStorage: { refreshToken: 'fake-refresh-token' } })
            await authService.logoutRedirect({
              postLogoutRedirectUri: 'http://redirect.com', localOnly: false,
            })
            expect(acquireToken).toHaveBeenCalledTimes(1)
            expect(logout).toHaveBeenCalledWith(
              { testConfig: true },
              'acquired-token',
              'fake-refresh-token',
              'http://redirect.com',
              false, // accessToken and refreshToken exist and localOnly is false
            )

            vi.clearAllMocks()
          },
        )

        it(
          'should call logout with isLocalOnly true when tokens are missing',
          async () => {
            // Scenario: Missing tokens
            (acquireToken as any).mockResolvedValue(null)
            fakeState.set({ refreshTokenStorage: { refreshToken: null } })
            await authService.logoutRedirect({
              postLogoutRedirectUri: '', localOnly: false,
            })
            expect(acquireToken).toHaveBeenCalledTimes(1)

            expect(logout).toHaveBeenCalledWith(
              { testConfig: true },
              '',
              '',
              '',
              true, // accessToken and refreshToken exist and localOnly is false
            )
          },
        )

        it(
          'should call logout with isLocalOnly true even if tokens exist',
          async () => {
            // Scenario: localOnly flag is true even if tokens exist
            (acquireToken as any).mockResolvedValue('acquired-token')
            fakeState.set({ refreshTokenStorage: { refreshToken: 'fake-refresh-token' } })
            await authService.logoutRedirect({
              postLogoutRedirectUri: 'http://redirect.com', localOnly: true,
            })

            expect(logout).toHaveBeenCalledTimes(1)
            expect(logout).toHaveBeenLastCalledWith(
              { testConfig: true },
              'acquired-token',
              'fake-refresh-token',
              'http://redirect.com',
              true,
            )
          },
        )

        it(
          'should handle errors during logout and update state.logoutError',
          async () => {
            const error = new Error('')
      ;(acquireToken as any).mockResolvedValue('acquired-token')
            ;(logout as any).mockRejectedValue(error)
            const handleErrorSpy = vi.mocked(handleError).mockReturnValue('Unable to initial logout flow')
            await authService.logoutRedirect({
              postLogoutRedirectUri: '', localOnly: false,
            })
            expect(fakeState().logoutError).toBe('Unable to initial logout flow')

            handleErrorSpy.mockRestore()
          },
        )
      },
    )
  },
)
