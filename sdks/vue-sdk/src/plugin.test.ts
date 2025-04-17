import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest'
import { createApp } from 'vue'
import * as webModule from '@melody-auth/web'
import * as shared from '@melody-auth/shared'
import { AuthProvider } from './plugin'
import * as utils from './utils'
import { melodyAuthInjectionKey } from './context'

// Mock the external modules
vi.mock(
  '@melody-auth/web',
  () => ({
    loadCodeAndStateFromUrl: vi.fn().mockReturnValue({
      code: '',
      state: '',
    }),
  }),
)

vi.mock(
  './utils',
  () => ({
    handleTokenExchangeByAuthCode: vi.fn(),
    acquireToken: vi.fn(),
  }),
)

// Provide default return values for mocked functions
vi.mock(
  '@melody-auth/shared',
  () => ({
    checkStorage: vi.fn().mockReturnValue({
      storedRefreshToken: null,
      storedAccount: null,
    }),
    getParams: vi.fn().mockReturnValue({}),
    isValidStorage: vi.fn().mockReturnValue(false),
  }),
)

describe(
  'AuthProvider Plugin',
  () => {
    let app
    let capturedMountedHook
    const mockConfig = {
      clientId: 'test-client-id',
      authority: 'https://test-authority.com',
      storage: 'localStorage',
    }

    beforeEach(() => {
    // Create a fresh Vue app for each test
      app = createApp({ template: '<div>Test App</div>' })

      // Reset mocks
      vi.clearAllMocks()

      // Reset default mock return values
      shared.checkStorage.mockReturnValue({
        storedRefreshToken: null,
        storedAccount: null,
      })
      shared.getParams.mockReturnValue({})
      shared.isValidStorage.mockReturnValue(false)

      // Mock window object if needed
      global.window = Object.create(window)

      // Capture the mounted hook when mixin is called
      capturedMountedHook = null
      app.mixin = vi.fn().mockImplementation((mixin) => {
        if (mixin && typeof mixin.mounted === 'function') {
          capturedMountedHook = mixin.mounted
        }
        return app
      })
    })

    afterEach(() => {
      app = null
      capturedMountedHook = null
    })

    it(
      'should install the plugin and provide the auth state',
      () => {
        // Create a variable to capture the provided state
        let capturedState = null

        // Override app.provide to capture the state
        app.provide = (
          key, value,
        ) => {
          if (key === melodyAuthInjectionKey) {
            capturedState = value
          }
        }

        // Install the plugin
        app.use(
          AuthProvider,
          mockConfig,
        )

        // Verify the state was provided
        expect(capturedState).not.toBeNull()
        expect(capturedState?.config).toEqual(mockConfig)
        expect(capturedState?.isAuthenticating).toBe(true)
        expect(capturedState?.isAuthenticated).toBe(false)
      },
    )

    it(
      'should initialize with storage if valid refresh token exists',
      () => {
        const mockRefreshToken = JSON.stringify({
          refreshToken: 'test-refresh-token',
          expiresAt: Date.now() + 3600000, // 1 hour from now
        })

        const mockAccount = JSON.stringify({
          sub: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        })

        shared.checkStorage.mockReturnValue({
          storedRefreshToken: mockRefreshToken,
          storedAccount: mockAccount,
        })

        shared.isValidStorage.mockReturnValue(true)

        // Create a variable to capture the provided state
        let capturedState = null

        // Override app.provide to capture the state
        app.provide = (
          key, value,
        ) => {
          if (key === melodyAuthInjectionKey) {
            capturedState = value
          }
        }

        // Install the plugin
        app.use(
          AuthProvider,
          mockConfig,
        )

        // Check that storage was checked
        expect(shared.checkStorage).toHaveBeenCalledWith(mockConfig.storage)

        // Check that the state was initialized correctly
        expect(capturedState).not.toBeNull()
        expect(capturedState?.refreshTokenStorage).toEqual(JSON.parse(mockRefreshToken))
        expect(capturedState?.account).toEqual(JSON.parse(mockAccount))
        expect(capturedState?.checkedStorage).toBe(true)
      },
    )

    it(
      'should not initialize with storage if refresh token is invalid',
      () => {
        const mockRefreshToken = JSON.stringify({
          refreshToken: 'test-refresh-token',
          expiresAt: Date.now() - 3600000, // 1 hour ago (expired)
        })

        shared.checkStorage.mockReturnValue({
          storedRefreshToken: mockRefreshToken,
          storedAccount: null,
        })

        shared.isValidStorage.mockReturnValue(false) // Invalid token

        // Create a variable to capture the provided state
        let capturedState = null

        // Override app.provide to capture the state
        app.provide = (
          key, value,
        ) => {
          if (key === melodyAuthInjectionKey) {
            capturedState = value
          }
        }

        // Install the plugin
        app.use(
          AuthProvider,
          mockConfig,
        )

        // Check that storage was checked
        expect(shared.checkStorage).toHaveBeenCalledWith(mockConfig.storage)

        // Check that the state was initialized correctly
        expect(capturedState).not.toBeNull()
        expect(capturedState?.refreshTokenStorage).toBeNull()
        expect(capturedState?.account).toBeNull()
        expect(capturedState?.checkedStorage).toBe(true)
      },
    )

    it(
      'should add a mixin with mounted hook',
      () => {
        // Install the plugin
        app.use(
          AuthProvider,
          mockConfig,
        )

        // Check that the plugin called mixin
        expect(app.mixin).toHaveBeenCalled()
        expect(capturedMountedHook).toBeInstanceOf(Function)
      },
    )

    it(
      'should acquire token if refresh token exists but no access token',
      async () => {
        // Create a variable to capture the provided state
        let capturedState = null

        // Override app.provide to capture the state
        app.provide = (
          key, value,
        ) => {
          if (key === melodyAuthInjectionKey) {
            capturedState = value
          }
          return app
        }

        // Install the plugin
        app.use(
          AuthProvider,
          mockConfig,
        )

        // Ensure we have a state and mounted hook
        expect(capturedState).not.toBeNull()
        expect(capturedMountedHook).toBeInstanceOf(Function)

        // Modify the state to simulate having a refresh token but no access token
        if (capturedState) {
          capturedState.refreshTokenStorage = { refreshToken: 'test-refresh-token' }
          capturedState.accessTokenStorage = null
          capturedState.checkedStorage = true
        }

        // Mock getParams to return empty object (no code)
        shared.getParams.mockReturnValue({})

        // Create a component instance that can access the state
        const componentInstance = {
          $options: {},
          // In Vue 3, inject is typically accessed through the component instance
          _: { inject: () => capturedState },
        }

        // Call the mounted hook manually
        capturedMountedHook.call(componentInstance)

        // Check that acquireToken was called with our state
        expect(utils.acquireToken).toHaveBeenCalledWith(capturedState)
      },
    )

    it(
      'should handle token exchange if code is present in URL',
      async () => {
        // Create a variable to capture the provided state
        let capturedState = null

        // Override app.provide to capture the state
        app.provide = (
          key, value,
        ) => {
          if (key === melodyAuthInjectionKey) {
            capturedState = value
          }
          return app
        }

        // Install the plugin
        app.use(
          AuthProvider,
          mockConfig,
        )

        // Ensure we have a state and mounted hook
        expect(capturedState).not.toBeNull()
        expect(capturedMountedHook).toBeInstanceOf(Function)

        // Modify the state to simulate having checked storage but no access token
        if (capturedState) {
          capturedState.checkedStorage = true
          capturedState.accessTokenStorage = null
        }

        // Mock getParams to return code
        shared.getParams.mockReturnValue({
          code: 'test-auth-code', locale: 'en-US',
        })

        // Mock loadCodeAndStateFromUrl
        webModule.loadCodeAndStateFromUrl.mockReturnValue({
          code: 'test-auth-code',
          state: 'test-request-state',
        })

        // Create a component instance that can access the state
        const componentInstance = {
          $options: {},
          // In Vue 3, inject is typically accessed through the component instance
          _: { inject: () => capturedState },
        }

        // Call the mounted hook manually
        capturedMountedHook.call(componentInstance)

        // Check that handleTokenExchangeByAuthCode was called with the correct parameters
        expect(utils.handleTokenExchangeByAuthCode).toHaveBeenCalledWith(
          'test-auth-code',
          'test-request-state',
          capturedState,
          'en-US',
        )
      },
    )

    it(
      'should not do anything if access token already exists',
      async () => {
        // Create a variable to capture the provided state
        let capturedState = null

        // Override app.provide to capture the state
        app.provide = (
          key, value,
        ) => {
          if (key === melodyAuthInjectionKey) {
            capturedState = value
          }
          return app
        }

        // Install the plugin
        app.use(
          AuthProvider,
          mockConfig,
        )

        // Ensure we have a state and mounted hook
        expect(capturedState).not.toBeNull()
        expect(capturedMountedHook).toBeInstanceOf(Function)

        // Modify the state to simulate having an access token
        if (capturedState) {
          capturedState.accessTokenStorage = { accessToken: 'test-access-token' }
        }

        // Create a component instance that can access the state
        const componentInstance = {
          $options: {},
          // In Vue 3, inject is typically accessed through the component instance
          _: { inject: () => capturedState },
        }

        // Call the mounted hook manually
        capturedMountedHook.call(componentInstance)

        // Check that neither acquireToken nor handleTokenExchangeByAuthCode were called
        expect(utils.acquireToken).not.toHaveBeenCalled()
        expect(utils.handleTokenExchangeByAuthCode).not.toHaveBeenCalled()
      },
    )

    it(
      'should handle the case when window is undefined (SSR)',
      () => {
        // Mock window as undefined to simulate SSR
        global.window = undefined as any

        // Install the plugin
        app.use(
          AuthProvider,
          mockConfig,
        )

        // Check that the plugin doesn't crash
        expect(shared.checkStorage).not.toHaveBeenCalled()
      },
    )
  },
)
