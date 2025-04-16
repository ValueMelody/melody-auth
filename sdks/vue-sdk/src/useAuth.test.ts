import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import * as webModule from '@melody-auth/web'
import * as shared from '@melody-auth/shared'
import { useAuth } from './useAuth'
import * as utils from './utils'
import { melodyAuthInjectionKey } from './context'

// Mock the external modules
vi.mock(
  '@melody-auth/web',
  () => ({
    getUserInfo: vi.fn(),
    logout: vi.fn(),
    triggerLogin: vi.fn(),
  }),
)

vi.mock(
  './utils',
  () => ({
    handleTokenExchangeByAuthCode: vi.fn(),
    acquireToken: vi.fn(),
  }),
)

vi.mock(
  '@melody-auth/shared',
  () => ({
    handleError: vi.fn(),
    ErrorType: {
      LoginFailed: 'LoginFailed',
      FetchUserInfo: 'FetchUserInfo',
      LogoutFailed: 'LogoutFailed',
    },
  }),
)

// Create a test harness component that provides the auth state
const createTestHarness = (state) => {
  return defineComponent({
    setup () {
      return { state }
    },
    template: '<div><slot /></div>',
    provide () {
      return { [melodyAuthInjectionKey]: this.state }
    },
  })
}

// Create a component that uses the composable
const AuthConsumer = defineComponent({
  setup () {
    const auth = useAuth() // eslint-disable-line react-hooks/rules-of-hooks
    return { auth }
  },
  template: '<div>Auth Consumer</div>',
})

describe(
  'useAuth',
  () => {
  // Mock state for injection
    const mockState = {
      accessTokenStorage: { accessToken: 'mock-access-token' },
      refreshTokenStorage: { refreshToken: 'mock-refresh-token' },
      isAuthenticated: true,
      isAuthenticating: false,
      config: {
        clientId: 'test-client-id', authority: 'https://test-authority.com',
      },
      userInfo: null,
      isLoadingUserInfo: false,
      isLoadingToken: false,
      account: { username: 'test-user' },
      authenticationError: '',
      acquireTokenError: '',
      acquireUserInfoError: '',
      loginError: '',
      logoutError: '',
    }

    let wrapper

    beforeEach(() => {
      vi.clearAllMocks()
    })

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it(
      'should throw error if melody-auth plugin is not installed',
      () => {
        // When mounting the component without providing the injection, it should throw
        expect(() => {
          mount(AuthConsumer)
        }).toThrow('Please install melody-auth plugin first.')
      },
    )

    it(
      'should provide auth properties and methods',
      async () => {
        // Create the test harness with the mock state
        const TestHarness = createTestHarness(mockState)

        // Mount the test harness with the auth consumer as a child
        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        // Get the auth consumer component instance
        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        // Check that all the expected properties and methods are available
        expect(auth.accessToken.value).toBe('mock-access-token')
        expect(auth.refreshToken.value).toBe('mock-refresh-token')
        expect(auth.isAuthenticated.value).toBe(true)
        expect(auth.isAuthenticating.value).toBe(false)
        expect(typeof auth.loginRedirect).toBe('function')
        expect(typeof auth.loginPopup).toBe('function')
        expect(typeof auth.logoutRedirect).toBe('function')
        expect(typeof auth.acquireUserInfo).toBe('function')
        expect(typeof auth.acquireToken).toBe('function')
      },
    )

    it(
      'should call triggerLogin with redirect method',
      async () => {
        const TestHarness = createTestHarness({
          ...mockState,
          isAuthenticated: false,
        })

        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        await auth.loginRedirect({ locale: 'en-US' })

        expect(webModule.triggerLogin).toHaveBeenCalledWith(
          'redirect',
          mockState.config,
          expect.objectContaining({
            locale: 'en-US',
            authorizePopupHandler: expect.any(Function),
          }),
        )
      },
    )

    it(
      'should call handleTokenExchangeByAuthCode when authorizePopupHandler is called',
      async () => {
        const TestHarness = createTestHarness({
          ...mockState,
          isAuthenticated: false,
        })

        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        await auth.loginPopup({ locale: 'en-US' })

        // Extract the authorizePopupHandler function from the call to triggerLogin
        const triggerLoginCall = webModule.triggerLogin.mock.calls[0]
        const options = triggerLoginCall[2]
        const authorizePopupHandler = options.authorizePopupHandler

        // Call the authorizePopupHandler with test data
        const authCode = 'test-auth-code'
        const requestState = 'test-request-state'
        await authorizePopupHandler({
          state: requestState, code: authCode,
        })

        // Verify that handleTokenExchangeByAuthCode was called with the correct parameters
        expect(utils.handleTokenExchangeByAuthCode).toHaveBeenCalledWith(
          authCode,
          requestState,
          expect.objectContaining({
            isAuthenticated: false,
            config: mockState.config,
          }),
          'en-US',
        )
      },
    )

    it(
      'should handle login errors and set loginError',
      async () => {
        const testError = new Error('Login failed')
        webModule.triggerLogin.mockImplementation(() => {
          throw testError
        })

        shared.handleError.mockReturnValue('Error message from handleError')

        const stateWithoutAuth = {
          ...mockState,
          isAuthenticated: false,
          loginError: '',
        }

        const TestHarness = createTestHarness(stateWithoutAuth)

        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        await auth.loginRedirect({ locale: 'en-US' })

        expect(webModule.triggerLogin).toHaveBeenCalled()
        expect(shared.handleError).toHaveBeenCalledWith(
          testError,
          shared.ErrorType.LoginFailed,
        )
        expect(stateWithoutAuth.loginError).toBe('Error message from handleError')
      },
    )

    it(
      'should call triggerLogin with popup method',
      async () => {
        const TestHarness = createTestHarness({
          ...mockState,
          isAuthenticated: false,
        })

        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        await auth.loginPopup({ locale: 'en-US' })

        expect(webModule.triggerLogin).toHaveBeenCalledWith(
          'popup',
          mockState.config,
          expect.objectContaining({
            locale: 'en-US',
            authorizePopupHandler: expect.any(Function),
          }),
        )
      },
    )

    it(
      'should throw error when trying to login while already authenticated',
      async () => {
        const TestHarness = createTestHarness(mockState)

        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        await expect(auth.loginRedirect()).rejects.toThrow('Already authenticated, please logout first')
      },
    )

    it(
      'should throw error when trying to login while authenticating',
      async () => {
        const TestHarness = createTestHarness({
          ...mockState,
          isAuthenticating: true,
          isAuthenticated: false,
        })

        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        await expect(auth.loginRedirect()).rejects.toThrow('Please wait until isAuthenticating=false')
      },
    )

    it(
      'should call acquireToken',
      async () => {
        utils.acquireToken.mockResolvedValue('new-access-token')

        const TestHarness = createTestHarness(mockState)

        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        const result = await auth.acquireToken()

        expect(utils.acquireToken).toHaveBeenCalledWith(mockState)
        expect(result).toBe('new-access-token')
      },
    )

    it(
      'should acquire user info',
      async () => {
        utils.acquireToken.mockResolvedValue('new-access-token')
        webModule.getUserInfo.mockResolvedValue({
          id: 'user-123', name: 'Test User',
        })

        const stateWithoutUserInfo = {
          ...mockState,
          userInfo: null,
        }

        const TestHarness = createTestHarness(stateWithoutUserInfo)

        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        const result = await auth.acquireUserInfo()

        expect(utils.acquireToken).toHaveBeenCalledWith(stateWithoutUserInfo)
        expect(webModule.getUserInfo).toHaveBeenCalledWith(
          stateWithoutUserInfo.config,
          { accessToken: 'new-access-token' },
        )
        expect(result).toEqual({
          id: 'user-123', name: 'Test User',
        })
        expect(stateWithoutUserInfo.userInfo).toEqual({
          id: 'user-123', name: 'Test User',
        })
        expect(stateWithoutUserInfo.isLoadingUserInfo).toBe(false)
      },
    )

    it(
      'should handle errors when acquiring user info',
      async () => {
        const testError = new Error('Failed to get user info')
        utils.acquireToken.mockResolvedValue('new-access-token')
        webModule.getUserInfo.mockRejectedValue(testError)
        shared.handleError.mockReturnValue('Error fetching user info')

        const stateWithoutUserInfo = {
          ...mockState,
          userInfo: null,
          acquireUserInfoError: '',
        }

        const TestHarness = createTestHarness(stateWithoutUserInfo)

        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        const result = await auth.acquireUserInfo()

        expect(utils.acquireToken).toHaveBeenCalledWith(stateWithoutUserInfo)
        expect(webModule.getUserInfo).toHaveBeenCalledWith(
          stateWithoutUserInfo.config,
          { accessToken: 'new-access-token' },
        )
        expect(shared.handleError).toHaveBeenCalledWith(
          testError,
          shared.ErrorType.FetchUserInfo,
        )
        expect(stateWithoutUserInfo.acquireUserInfoError).toBe('Error fetching user info')
        expect(stateWithoutUserInfo.isLoadingUserInfo).toBe(false)
        expect(result).toBeUndefined()
      },
    )

    it(
      'should return existing user info if available',
      async () => {
        const stateWithUserInfo = {
          ...mockState,
          userInfo: {
            id: 'existing-user', name: 'Existing User',
          },
        }

        const TestHarness = createTestHarness(stateWithUserInfo)

        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        const result = await auth.acquireUserInfo()

        expect(utils.acquireToken).not.toHaveBeenCalled()
        expect(webModule.getUserInfo).not.toHaveBeenCalled()
        expect(result).toEqual({
          id: 'existing-user', name: 'Existing User',
        })
      },
    )

    it(
      'should call logout with correct parameters',
      async () => {
        utils.acquireToken.mockResolvedValue('new-access-token')
        webModule.logout.mockResolvedValue(undefined)

        const TestHarness = createTestHarness(mockState)

        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        await auth.logoutRedirect({ postLogoutRedirectUri: 'https://example.com/logout' })

        expect(utils.acquireToken).toHaveBeenCalledWith(mockState)
        expect(webModule.logout).toHaveBeenCalledWith(
          mockState.config,
          'new-access-token',
          'mock-refresh-token',
          'https://example.com/logout',
          false,
        )
      },
    )

    it(
      'should handle errors during logout',
      async () => {
        const testError = new Error('Logout failed')
        utils.acquireToken.mockResolvedValue('new-access-token')
        webModule.logout.mockRejectedValue(testError)
        shared.handleError.mockReturnValue('Error during logout')

        const stateWithoutLogoutError = {
          ...mockState,
          logoutError: '',
        }

        const TestHarness = createTestHarness(stateWithoutLogoutError)

        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        await auth.logoutRedirect({ postLogoutRedirectUri: 'https://example.com/logout' })

        expect(utils.acquireToken).toHaveBeenCalledWith(stateWithoutLogoutError)
        expect(webModule.logout).toHaveBeenCalledWith(
          stateWithoutLogoutError.config,
          'new-access-token',
          'mock-refresh-token',
          'https://example.com/logout',
          false,
        )
        expect(shared.handleError).toHaveBeenCalledWith(
          testError,
          shared.ErrorType.LogoutFailed,
        )
        expect(stateWithoutLogoutError.logoutError).toBe('Error during logout')
      },
    )

    it(
      'should handle local-only logout',
      async () => {
        utils.acquireToken.mockResolvedValue(null)
        webModule.logout.mockResolvedValue(undefined)

        const TestHarness = createTestHarness(mockState)

        wrapper = mount(
          TestHarness,
          { slots: { default: AuthConsumer } },
        )

        const consumer = wrapper.findComponent(AuthConsumer)
        const { auth } = consumer.vm

        await auth.logoutRedirect({ localOnly: true })

        expect(utils.acquireToken).toHaveBeenCalledWith(mockState)
        expect(webModule.logout).toHaveBeenCalledWith(
          mockState.config,
          '',
          'mock-refresh-token',
          '',
          true,
        )
      },
    )
  },
)
