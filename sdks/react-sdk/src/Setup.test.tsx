import * as React from 'react'
import {
  render, waitFor,
} from '@testing-library/react'
import {
  vi, describe, it, expect, beforeEach,
} from 'vitest'
import {
  exchangeTokenByAuthCode, loadCodeAndStateFromUrl,
} from '@melody-auth/web'
import Setup from './Setup'
import authContext from './context'

// Polyfill for window.history.pushState for tests (if not defined)
if (typeof window.history.pushState !== 'function') {
  window.history.pushState = (
    state: any, title: string, url?: string,
  ) => {
    if (url) {
      // Create a new URL object based on the provided URL and update window.location.
      const newUrl = new URL(
        url,
        window.location.origin,
      )
      Object.defineProperty(
        window,
        'location',
        {
          configurable: true,
          writable: true,
          value: newUrl,
        },
      )
    }
  }
}

// Create a mock for the useAuth hook and its acquireToken function
const mockAcquireToken = vi.fn()
vi.mock(
  './useAuth',
  () => {
    return { useAuth: () => ({ acquireToken: mockAcquireToken }) }
  },
)

vi.mock(
  '@melody-auth/web',
  () => ({
    exchangeTokenByAuthCode: vi.fn(),
    loadCodeAndStateFromUrl: vi.fn(() => {
      const params = new URLSearchParams(window.location.search)
      return {
        code: params.get('code') || '',
        state: params.get('state') || '',
      }
    }),
  }),
)

describe(
  'Setup Component',
  () => {
    let dispatch: ReturnType<typeof vi.fn>
    let defaultState: any

    beforeEach(() => {
      dispatch = vi.fn()
      mockAcquireToken.mockReset()
      // Reset the exchangeTokenByAuthCode mock.
      exchangeTokenByAuthCode.mockReset()

      defaultState = {
        checkedStorage: false,
        accessTokenStorage: null,
        refreshTokenStorage: null,
        config: { onLoginSuccess: vi.fn() },
      }
      // Reset location to a default value.
      window.history.pushState(
        {},
        'Test Title',
        '/',
      )
    })

    it(
      'should do nothing if accessTokenStorage exists',
      async () => {
        const state = {
          ...defaultState, accessTokenStorage: 'existingAccessToken',
        }
        const contextValue = {
          state, dispatch,
        }

        render(<authContext.Provider value={contextValue}>
          <Setup />
        </authContext.Provider>)

        await waitFor(() => {
          // Neither acquireToken nor exchangeTokenByAuthCode should be called.
          expect(mockAcquireToken).not.toHaveBeenCalled()
          expect(exchangeTokenByAuthCode).not.toHaveBeenCalled()
        })
      },
    )

    it(
      'should call acquireToken if no code in URL and refreshTokenStorage exists',
      async () => {
        const state = {
          ...defaultState, refreshTokenStorage: 'existingRefreshToken',
        }
        const contextValue = {
          state, dispatch,
        }
        // Set a URL that does NOT contain a 'code' parameter.
        window.history.pushState(
          {},
          'Test Title',
          '/?someParam=value',
        )

        render(<authContext.Provider value={contextValue}>
          <Setup />
        </authContext.Provider>)

        await waitFor(() => {
          expect(mockAcquireToken).toHaveBeenCalled()
          expect(exchangeTokenByAuthCode).not.toHaveBeenCalled()
        })
      },
    )

    it(
      'should call exchangeTokenByAuthCode and dispatch actions on success when code is present',
      async () => {
        // Set URL with 'code', and additional query params for 'state' and 'locale'
        window.history.pushState(
          {},
          'Test Title',
          '/?code=sampleCode&state=xyz&locale=en',
        )
        const onLoginSuccess = vi.fn()
        const state = {
          ...defaultState, config: { onLoginSuccess },
        }
        const contextValue = {
          state, dispatch,
        }

        const mockResponse = {
          accessTokenStorage: 'newAccessToken',
          refreshTokenStorage: 'newRefreshToken',
          idTokenStorage: {
            idToken: 'header.eyJzdWIiOiIxMjM0NSJ9.signature',
            account: { sub: 'user123' },
          },
        }
        exchangeTokenByAuthCode.mockResolvedValueOnce(mockResponse)

        render(<authContext.Provider value={contextValue}>
          <Setup />
        </authContext.Provider>)

        await waitFor(() => {
          // ensure the token exchange is invoked with the provided config
          expect(exchangeTokenByAuthCode).toHaveBeenCalledWith(
            'sampleCode',
            'xyz',
            state.config,
          )
        })

        await waitFor(() => {
          // dispatch should have been called for setting the access token…
          expect(dispatch).toHaveBeenCalledWith({
            type: 'setAccessTokenStorage',
            payload: 'newAccessToken',
          })
          // …and for setting authentication data.
          expect(dispatch).toHaveBeenCalledWith({
            type: 'setAuth',
            payload: {
              refreshTokenStorage: 'newRefreshToken',
              idTokenBody: { sub: 'user123' },
              idToken: 'header.eyJzdWIiOiIxMjM0NSJ9.signature',
            },
          })
          // onLoginSuccess callback should be invoked with the correct query parameters.
          expect(onLoginSuccess).toHaveBeenCalledWith({
            state: 'xyz', locale: 'en',
          })
        })
      },
    )

    it(
      'should dispatch setIsAuthenticating if exchangeTokenByAuthCode returns without accessTokenStorage',
      async () => {
        window.history.pushState(
          {},
          'Test Title',
          '/?code=sampleCode',
        )
        const state = {
          ...defaultState, config: {},
        }
        const contextValue = {
          state, dispatch,
        }

        const mockResponse = {
          // No accessTokenStorage returned here
          refreshTokenStorage: 'newRefreshToken',
          idTokenStorage: {
            idToken: 'header.eyJzdWIiOiIxMjM0NSJ9.signature',
            account: { sub: 'user456' },
          },
        }
        exchangeTokenByAuthCode.mockResolvedValueOnce(mockResponse)

        render(<authContext.Provider value={contextValue}>
          <Setup />
        </authContext.Provider>)

        await waitFor(() => {
          expect(exchangeTokenByAuthCode).toHaveBeenCalledWith(
            'sampleCode',
            '',
            state.config,
          )
        })

        await waitFor(() => {
          // Since accessTokenStorage is not provided, setIsAuthenticating must be dispatched.
          expect(dispatch).toHaveBeenCalledWith({
            type: 'setIsAuthenticating',
            payload: false,
          })
          // setAuth should still be dispatched.
          expect(dispatch).toHaveBeenCalledWith({
            type: 'setAuth',
            payload: {
              refreshTokenStorage: 'newRefreshToken',
              idTokenBody: { sub: 'user456' },
              idToken: 'header.eyJzdWIiOiIxMjM0NSJ9.signature',
            },
          })
        })
      },
    )

    it(
      'should dispatch authentication error if exchangeTokenByAuthCode fails',
      async () => {
        window.history.pushState(
          {},
          'Test Title',
          '/?code=sampleCode&state=xyz',
        );
        // Ensure that loadCodeAndStateFromUrl returns the expected code and state.
        (loadCodeAndStateFromUrl as vi.Mock).mockReturnValueOnce({
          code: 'sampleCode', state: 'xyz',
        })
        const error = new Error('Token exchange failed')

        const state = {
          ...defaultState, config: {},
        }
        const contextValue = {
          state, dispatch,
        }
        exchangeTokenByAuthCode.mockRejectedValueOnce(error)

        render(<authContext.Provider value={contextValue}>
          <Setup />
        </authContext.Provider>)

        await waitFor(() => {
          expect(exchangeTokenByAuthCode).toHaveBeenCalledWith(
            'sampleCode',
            'xyz',
            state.config,
          )
        })
        await waitFor(() => {
          expect(dispatch).toHaveBeenCalledWith({
            type: 'setAuthenticationError',
            payload: 'Can not obtain access token',
          })
        })
      },
    )

    it(
      'should do nothing on subsequent effect invocations if already initialized',
      async () => {
        // Set the initial state so that checkedStorage is true.
        // This will cause the effect to set initialized.current to true,
        // and trigger exchangeTokenByAuthCode.
        const initialState = {
          ...defaultState, checkedStorage: true,
        }
        const contextValue = {
          state: initialState, dispatch,
        }

        // Set a dummy response for exchangeTokenByAuthCode.
        const dummyResponse = {
          accessTokenStorage: 'dummyAccessToken',
          refreshTokenStorage: null,
          idTokenBody: null,
        }
        exchangeTokenByAuthCode.mockResolvedValueOnce(dummyResponse)

        // Render the component for the first time.
        const { rerender } = render(<authContext.Provider value={contextValue}>
          <Setup />
        </authContext.Provider>)

        // Wait for the initial effect to run and trigger exchangeTokenByAuthCode.
        await waitFor(() => {
          expect(exchangeTokenByAuthCode).toHaveBeenCalledTimes(1)
        })

        // Now update the context to force the effect to re-run.
        // Since initialized.current is already true, the effect should return early.
        const newState = {
          ...initialState, checkedStorage: false,
        }
        const newContextValue = {
          state: newState, dispatch,
        }
        rerender(<authContext.Provider value={newContextValue}>
          <Setup />
        </authContext.Provider>)

        await waitFor(() => {
          // The exchangeTokenByAuthCode should still have been called only once.
          expect(exchangeTokenByAuthCode).toHaveBeenCalledTimes(1)
          // And the acquireToken function should not be called.
          expect(mockAcquireToken).not.toHaveBeenCalled()
        })
      },
    )
  },
)
