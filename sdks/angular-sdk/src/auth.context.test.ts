import {
  describe, it, expect, vi, beforeEach, afterEach, Mock,
} from 'vitest'

// Import the mocked functions for easy access in tests
import {
  getParams, checkStorage, isValidStorage, loadRefreshTokenStorageFromParams,
} from '@melody-auth/shared'
import { loadCodeAndStateFromUrl } from '@melody-auth/web'
import { AuthContext } from './auth.context'
import {
  acquireToken, handleTokenExchangeByAuthCode,
} from './utils'

// MOCK external dependencies
vi.mock(
  '@melody-auth/shared',
  () => ({
    getParams: vi.fn(),
    checkStorage: vi.fn(),
    isValidStorage: vi.fn(),
    loadRefreshTokenStorageFromParams: vi.fn(),
  }),
)

vi.mock(
  '@melody-auth/web',
  () => ({ loadCodeAndStateFromUrl: vi.fn() }),
)

vi.mock(
  './utils',
  () => ({
    acquireToken: vi.fn(),
    handleTokenExchangeByAuthCode: vi.fn(),
  }),
)

// Dummy provider config to pass into AuthContext
const dummyConfig = { storage: 'dummyStorage' }

describe(
  'AuthContext',
  () => {
    let originalWindow: any

    beforeEach(() => {
    // Ensure a global window object is available
      originalWindow = global.window
      global.window = {} as any
      vi.clearAllMocks()
    })

    afterEach(() => {
    // Restore original window after each test
      global.window = originalWindow
    })

    it(
      'should initialize state with valid stored token and call acquireToken',
      () => {
        // Setup mocks for a valid stored token scenario
        (checkStorage as Mock).mockReturnValue({
          storedRefreshToken: JSON.stringify({ token: 'dummy-refresh' }),
          storedAccount: JSON.stringify({ id: 'dummy-account' }),
        })
        ;(isValidStorage as Mock).mockReturnValue(true)
        ;(getParams as Mock).mockReturnValue({})

        const acquireTokenMock = acquireToken as Mock
        const handleTokenExchangeByAuthCodeMock = handleTokenExchangeByAuthCode as Mock

        const authContext = new AuthContext(dummyConfig)

        const stateValue = authContext.state()
        expect(stateValue.config).toEqual(dummyConfig)
        expect(stateValue.refreshTokenStorage).toEqual({ token: 'dummy-refresh' })
        expect(stateValue.account).toEqual({ id: 'dummy-account' })
        expect(stateValue.checkedStorage).toBe(true)

        expect(acquireTokenMock).toHaveBeenCalledTimes(1)
        expect(handleTokenExchangeByAuthCodeMock).not.toHaveBeenCalled()
      },
    )

    // New unit test: cover when stored account is null
    it(
      'should initialize state with valid stored token and null stored account and call acquireToken',
      () => {
        // Setup mocks for a valid stored token scenario with storedAccount set to null
        (checkStorage as Mock).mockReturnValue({
          storedRefreshToken: JSON.stringify({ token: 'dummy-refresh-null-account' }),
          storedAccount: null,
        })
        ;(isValidStorage as Mock).mockReturnValue(true)
        ;(getParams as Mock).mockReturnValue({})

        const acquireTokenMock = acquireToken as Mock
        const handleTokenExchangeByAuthCodeMock = handleTokenExchangeByAuthCode as Mock

        const authContext = new AuthContext(dummyConfig)
        const stateValue = authContext.state()

        expect(stateValue.config).toEqual(dummyConfig)
        expect(stateValue.refreshTokenStorage).toEqual({ token: 'dummy-refresh-null-account' })
        expect(stateValue.account).toBeNull()
        expect(stateValue.checkedStorage).toBe(true)

        expect(acquireTokenMock).toHaveBeenCalledTimes(1)
        expect(handleTokenExchangeByAuthCodeMock).not.toHaveBeenCalled()
      },
    )

    it(
      'should initialize state with no stored token and call handleTokenExchangeByAuthCode',
      () => {
        // Setup mocks for a scenario with no stored token
        (checkStorage as Mock).mockReturnValue({
          storedRefreshToken: null,
          storedAccount: null,
        })
        ;(getParams as Mock).mockReturnValue({}) // containsCode will be false
        ;(loadCodeAndStateFromUrl as Mock).mockReturnValue({
          code: 'dummy-code',
          state: 'dummy-requestState',
        })

        const acquireTokenMock = acquireToken as Mock
        const handleTokenExchangeByAuthCodeMock = handleTokenExchangeByAuthCode as Mock

        // Instantiate AuthContext
        const authContext = new AuthContext(dummyConfig)
        const stateValue = authContext.state()
        expect(stateValue.checkedStorage).toBe(true)

        // With no stored token (refreshTokenStorage is null) and no code,
        // the second condition in onMounted fails. However, the third condition is met
        // because checkedStorage is true. Therefore, handleTokenExchangeByAuthCode is called.
        expect(handleTokenExchangeByAuthCodeMock).toHaveBeenCalledTimes(1)
        expect(handleTokenExchangeByAuthCodeMock).toHaveBeenCalledWith(
          'dummy-code',
          'dummy-requestState',
          authContext.state,
          undefined, // no locale since getParams() returned {}
        )
        expect(acquireTokenMock).not.toHaveBeenCalled()
      },
    )

    it(
      'should not call token functions if accessTokenStorage already exists',
      () => {
        // Setup getParams (its value is irrelevant in this branch)
        ;(getParams as Mock).mockReturnValue({ code: 'dummy-code' })
        // Instantiate AuthContext
        const authContext = new AuthContext(dummyConfig)
        // Clear any calls that occurred during constructor initialization
        vi.clearAllMocks()
        // Manually update the state to simulate an existing access token
        authContext.state.update((prev: any) => ({
          ...prev,
          accessTokenStorage: { accessToken: 'existing-token' },
        }))
        // Manually invoke the private onMounted method via bracket notation.
        ;(authContext as any).onMounted()
        // Since accessTokenStorage exists, onMounted should not call either token function.
        expect(acquireToken).not.toHaveBeenCalled()
        expect(handleTokenExchangeByAuthCode).not.toHaveBeenCalled()
      },
    )

    // New unit test: Don't call handleTokenExchangeByAuthCode when authenticationError is present
    // even if getParams contains a code.
    it(
      'should not call handleTokenExchangeByAuthCode if authenticationError is present even if containsCode is true',
      () => {
        // Setup getParams to return a code and locale.
        ;(getParams as Mock).mockReturnValue({
          code: 'dummy-code', locale: 'en',
        })
        // Setup loadCodeAndStateFromUrl to return dummy values.
        ;(loadCodeAndStateFromUrl as Mock).mockReturnValue({
          code: 'dummy-code-from-url',
          state: 'dummy-requestState',
        })
        // Instantiate AuthContext with the dummy config.
        const authContext = new AuthContext(dummyConfig)
        // Update the state to simulate an authentication error and mark storage as checked.
        authContext.state.update((prev: any) => ({
          ...prev,
          authenticationError: 'error occurred',
          checkedStorage: true,
        }))
        // Clear any previous mock calls from constructor execution.
        vi.clearAllMocks()
        // Manually invoke onMounted.
        ;(authContext as any).onMounted()
        // Because authenticationError exists, the condition evaluating
        // !this.state().authenticationError is false so token functions should not be called.
        expect(handleTokenExchangeByAuthCode).not.toHaveBeenCalled()
        expect(acquireToken).not.toHaveBeenCalled()
      },
    )

    // New unit test: cover branch when loadRefreshTokenStorageFromParams returns a value
    it(
      'should initialize state using loadRefreshTokenStorageFromParams when it returns a value',
      () => {
        // Ensure client-side environment
        global.window = {} as any;
        // Setup mocks: loadRefreshTokenStorageFromParams returns a dummy value
        (loadRefreshTokenStorageFromParams as Mock).mockReturnValue({ token: 'dummy-token-from-params' });
        (checkStorage as Mock).mockReturnValue({ storedRefreshToken: JSON.stringify({ token: 'dummy-refresh' }) });
        (isValidStorage as Mock).mockReturnValue(true);
        (getParams as Mock).mockReturnValue({})

        const authContext = new AuthContext(dummyConfig)
        const stateValue = authContext.state()

        expect(stateValue.refreshTokenStorage).toEqual({ token: 'dummy-token-from-params' })
        expect(stateValue.account).toBeNull()
        expect(stateValue.checkedStorage).toBe(true)
      },
    )

    // Existing test: cover when window is undefined so initialWithStorage returns early
    it(
      'should return early from initialWithStorage if window is undefined',
      () => {
        global.window = undefined // simulate server-side environment
        const mockedCheckStorage = checkStorage as any
        mockedCheckStorage.mockClear()

        const authContext = new AuthContext(dummyConfig)
        const stateValue = authContext.state()
        // Expect config to be set by initialize but refreshTokenStorage and checkedStorage remain unchanged
        expect(stateValue.config).toEqual(dummyConfig)
        expect(stateValue.refreshTokenStorage).toBeNull()
        expect(stateValue.checkedStorage).toBe(false)

        // Verify that checkStorage was not called due to the early return.
        expect(mockedCheckStorage).not.toHaveBeenCalled()
      },
    )
  },
)
