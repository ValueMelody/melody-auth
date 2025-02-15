import {
  render as rtlRender, screen, waitFor,
} from '@testing-library/react'
import {
  beforeEach, describe, it, expect, vi,
} from 'vitest'
import { StorageKey } from 'shared'
import { useContext } from 'react'
import * as React from 'react'
import {
  AuthProvider, reducer,
} from './Provider'
import authContext from './context'

// --- Mock the Setup component so that it doesn't interfere ---
vi.mock(
  '../Setup',
  () => ({ default: () => <div data-testid='setup'>Setup</div> }),
)

// --- Create a simple consumer component that uses the auth context ---
const Consumer: React.FC = () => {
  const { state } = useContext(authContext)
  return (
    <div>
      <div data-testid='checkedStorage'>
        {state.checkedStorage ? 'true' : 'false'}
      </div>
      <div data-testid='account'>
        {state.account ? JSON.stringify(state.account) : 'null'}
      </div>
    </div>
  )
}

const render = (
  ui: React.ReactElement, options = {},
) =>
  rtlRender(
    ui,
    {
      wrapper: ({ children }) => <>{children}</>, ...options,
    },
  )

describe(
  'AuthProvider',
  () => {
    beforeEach(() => {
    // Clear storage before each test.
      window.localStorage.clear()
      window.sessionStorage.clear()
    })

    it(
      'dispatches setAuth when a valid refresh token is found in localStorage',
      async () => {
        const now = Math.floor(Date.now() / 1000)
        // Create a valid token that expires in 60 sec (now + 60) so that it passes the ">= now + 5" check.
        const validToken = {
          refreshToken: 'valid-token', expiresOn: now + 60,
        }
        const account = { username: 'testuser' }

        // Save token and account into localStorage using keys from shared.
        window.localStorage.setItem(
          StorageKey.RefreshToken,
          JSON.stringify(validToken),
        )
        window.localStorage.setItem(
          StorageKey.Account,
          JSON.stringify(account),
        )

        render(<AuthProvider
          serverUri='https://example.com'
          redirectUri='https://example.com'
          storage='localStorage'
          clientId='dummy-client'>
          <Consumer />
        </AuthProvider>)

        await waitFor(() => {
          // Because setAuth also sets checkedStorage to true, we expect true and the correct account object.
          const checkedStorages = screen.getAllByTestId('checkedStorage')
          const accounts = screen.getAllByTestId('account')
          expect(checkedStorages[checkedStorages.length - 1].textContent).toBe('true')
          expect(accounts[accounts.length - 1].textContent).toBe(JSON.stringify(account))
        })
      },
    )

    it(
      'dispatches setCheckedStorage when no refresh token is found in localStorage',
      async () => {
        render(<AuthProvider
          storage='localStorage'
          serverUri='https://example.com'
          redirectUri='https://example.com'
          clientId='dummy-client'>
          <Consumer />
        </AuthProvider>)

        await waitFor(() => {
          // In absence of token, the provider dispatches the setCheckedStorage action.
          const checkedStorages = screen.getAllByTestId('checkedStorage')
          const accounts = screen.getAllByTestId('account')
          expect(checkedStorages[checkedStorages.length - 1].textContent).toBe('true')
          expect(accounts[accounts.length - 1].textContent).toBe('null')
        })
      },
    )

    it(
      'dispatches setCheckedStorage when the refresh token is invalid (expired) in localStorage',
      async () => {
        const now = Math.floor(Date.now() / 1000)
        // Create an invalid token by setting expiresOn to a time less than "now + 5"
        const expiredToken = {
          refreshToken: 'expired-token', expiresOn: now + 3,
        }
        window.localStorage.setItem(
          StorageKey.RefreshToken,
          JSON.stringify(expiredToken),
        )
        // Even if an account is stored, it should be ignored because the token is not valid.
        window.localStorage.setItem(
          StorageKey.Account,
          JSON.stringify({ username: 'testuser' }),
        )

        render(<AuthProvider
          serverUri='https://example.com'
          redirectUri='https://example.com'
          storage='localStorage'
          clientId='dummy-client'>
          <Consumer />
        </AuthProvider>)

        await waitFor(() => {
          const checkedStorages = screen.getAllByTestId('checkedStorage')
          const accounts = screen.getAllByTestId('account')
          expect(checkedStorages[checkedStorages.length - 1].textContent).toBe('true')
          // No valid token means the account remains null.
          expect(accounts[accounts.length - 1].textContent).toBe('null')
        })
      },
    )

    it(
      'works with sessionStorage when a valid refresh token is found',
      async () => {
        const now = Math.floor(Date.now() / 1000)
        const validToken = {
          refreshToken: 'valid-token', expiresOn: now + 60,
        }
        const account = { username: 'sessionUser' }

        window.sessionStorage.setItem(
          StorageKey.RefreshToken,
          JSON.stringify(validToken),
        )
        window.sessionStorage.setItem(
          StorageKey.Account,
          JSON.stringify(account),
        )

        render(<AuthProvider
          serverUri='https://example.com'
          redirectUri='https://example.com'
          storage='sessionStorage'
          clientId='dummy-client'>
          <Consumer />
        </AuthProvider>)

        await waitFor(() => {
          const checkedStorages = screen.getAllByTestId('checkedStorage')
          const accounts = screen.getAllByTestId('account')
          expect(checkedStorages[checkedStorages.length - 1].textContent).toBe('true')
          expect(accounts[accounts.length - 1].textContent).toBe(JSON.stringify(account))
        })
      },
    )

    it(
      'dispatches setAuth with null account when no stored account is found',
      async () => {
        const now = Math.floor(Date.now() / 1000)
        const validToken = {
          refreshToken: 'valid-token', expiresOn: now + 60,
        }
        // Set valid token in localStorage, but do not set a stored account.
        window.localStorage.setItem(
          StorageKey.RefreshToken,
          JSON.stringify(validToken),
        )
        window.localStorage.removeItem(StorageKey.Account)

        render(<AuthProvider
          serverUri='https://example.com'
          redirectUri='https://example.com'
          storage='localStorage'
          clientId='dummy-client'>
          <Consumer />
        </AuthProvider>)

        await waitFor(() => {
          const checkedStorages = screen.getAllByTestId('checkedStorage')
          const accounts = screen.getAllByTestId('account')
          // Even though the token is valid, since no account is stored,
          // the ternary operator sets parsedAccount to null and the Consumer renders "null".
          expect(checkedStorages[checkedStorages.length - 1].textContent).toBe('true')
          expect(accounts[accounts.length - 1].textContent).toBe('null')
        })
      },
    )
  },
)

describe(
  'reducer',
  () => {
    const initialState = {
      isAuthenticating: true,
      authenticationError: '',
      isAuthenticated: false,
      config: {
        serverUri: 'https://example.com',
        redirectUri: 'https://example.com',
        clientId: 'dummy-client',
      },
      userInfo: null,
      account: null,
      accessTokenStorage: null,
      refreshTokenStorage: null,
      checkedStorage: false,
      isLoadingUserInfo: false,
      acquireUserInfoError: '',
      isLoadingToken: false,
      acquireTokenError: '',
      loginError: '',
      logoutError: '',
    }

    it(
      'handles setAccessTokenStorage',
      () => {
        const newToken = { token: 'some-token' }
        const action = {
          type: 'setAccessTokenStorage', payload: newToken,
        } as any
        const result = reducer(
          initialState,
          action,
        )
        expect(result.accessTokenStorage).toEqual(newToken)
        expect(result.isAuthenticated).toBe(true)
        expect(result.isAuthenticating).toBe(false)
        expect(result.isLoadingToken).toBe(false)
        expect(result.acquireTokenError).toBe('')
      },
    )

    it(
      'handles setAuth',
      () => {
        const tokenStorage = {
          refreshToken: 'token', expiresOn: 999999999,
        }
        const idTokenBody = { username: 'user' }
        const action = {
          type: 'setAuth',
          payload: {
            refreshTokenStorage: tokenStorage, idTokenBody,
          },
        } as any
        const result = reducer(
          initialState,
          action,
        )
        expect(result.refreshTokenStorage).toEqual(tokenStorage)
        expect(result.account).toEqual(idTokenBody)
        expect(result.checkedStorage).toBe(true)
      },
    )

    it(
      'handles setIsAuthenticating',
      () => {
        const action = {
          type: 'setIsAuthenticating', payload: false,
        } as any
        const result = reducer(
          initialState,
          action,
        )
        expect(result.isAuthenticating).toBe(false)
      },
    )

    it(
      'handles setAuthenticationError',
      () => {
        const action = {
          type: 'setAuthenticationError', payload: 'Auth error',
        } as any
        const result = reducer(
          initialState,
          action,
        )
        expect(result.authenticationError).toBe('Auth error')
        expect(result.isAuthenticating).toBe(false)
      },
    )

    it(
      'handles setCheckedStorage',
      () => {
        const action = {
          type: 'setCheckedStorage', payload: true,
        } as any
        const result = reducer(
          initialState,
          action,
        )
        expect(result.checkedStorage).toBe(true)
      },
    )

    it(
      'handles setIsLoadingUserInfo',
      () => {
        const action = {
          type: 'setIsLoadingUserInfo', payload: true,
        } as any
        const result = reducer(
          initialState,
          action,
        )
        expect(result.isLoadingUserInfo).toBe(true)
      },
    )

    it(
      'handles setAcquireUserInfoError',
      () => {
        const action = {
          type: 'setAcquireUserInfoError', payload: 'User info error',
        } as any
        const result = reducer(
          initialState,
          action,
        )
        expect(result.acquireUserInfoError).toBe('User info error')
        expect(result.isLoadingUserInfo).toBe(false)
      },
    )

    it(
      'handles setUserInfo',
      () => {
        const userInfo = { name: 'Test User' }
        const action = {
          type: 'setUserInfo', payload: userInfo,
        } as any
        const result = reducer(
          initialState,
          action,
        )
        expect(result.userInfo).toEqual(userInfo)
        expect(result.isLoadingUserInfo).toBe(false)
        expect(result.acquireUserInfoError).toBe('')
      },
    )

    it(
      'handles setAcquireTokenError',
      () => {
        const action = {
          type: 'setAcquireTokenError', payload: 'Token error',
        } as any
        const result = reducer(
          initialState,
          action,
        )
        expect(result.acquireTokenError).toBe('Token error')
        expect(result.isLoadingToken).toBe(false)
        expect(result.isAuthenticating).toBe(false)
      },
    )

    it(
      'handles setIsLoadingToken',
      () => {
        // For setIsLoadingToken, we only set isLoadingToken to true.
        const action = {
          type: 'setIsLoadingToken', payload: undefined,
        } as any
        const result = reducer(
          initialState,
          action,
        )
        expect(result.isLoadingToken).toBe(true)
      },
    )

    it(
      'handles setLoginError',
      () => {
        const action = {
          type: 'setLoginError', payload: 'Login failed',
        } as any
        const result = reducer(
          initialState,
          action,
        )
        expect(result.loginError).toBe('Login failed')
      },
    )

    it(
      'handles setLogoutError',
      () => {
        const action = {
          type: 'setLogoutError', payload: 'Logout failed',
        } as any
        const result = reducer(
          initialState,
          action,
        )
        expect(result.logoutError).toBe('Logout failed')
      },
    )

    it(
      'returns undefined for unknown action type',
      () => {
        const action = {
          type: 'unknown', payload: 'irrelevant',
        } as any
        const result = reducer(
          initialState,
          action,
        )
        expect(result).toBeUndefined()
      },
    )
  },
)
