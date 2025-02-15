import React from 'react'
import { render, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useAuth } from './useAuth'
import authContext from './context'
import {
  loginRedirect as rawLoginRedirect,
  logout,
  exchangeTokenByRefreshToken,
  getUserInfo,
} from 'web-sdk'
import * as utils from './utils'

// Mock the functions from web-sdk so that they are spies.
vi.mock('web-sdk', () => ({
  loginRedirect: vi.fn(),
  logout: vi.fn(),
  exchangeTokenByRefreshToken: vi.fn(),
  getUserInfo: vi.fn(),
}))

// A simple wrapper component that calls the useAuth hook and passes its value to onRender.
const HookWrapper = ({
  onRender,
}: {
  onRender: (hookValue: ReturnType<typeof useAuth>) => void
}) => {
  const auth = useAuth()
  onRender(auth)
  return null
}

describe('useAuth Hook', () => {
  let defaultState: any
  let dispatch: any

  beforeEach(() => {
    dispatch = vi.fn()
    defaultState = {
      accessTokenStorage: null,
      refreshTokenStorage: null,
      isAuthenticated: false,
      isAuthenticating: false,
      config: { clientId: 'test-client' },
      userInfo: null,
      account: null,
      isLoadingToken: false,
      isLoadingUserInfo: false,
      authenticationError: null,
      acquireTokenError: null,
      acquireUserInfoError: null,
      loginError: null,
      logoutError: null,
    }
    // Reset all mocks before each test.
    vi.resetAllMocks()
  })

  // A helper that renders the hook within its context and returns the hook's value.
  const renderHookWithState = (stateOverride = {}): ReturnType<typeof useAuth> => {
    const state = { ...defaultState, ...stateOverride }
    let hookValue: ReturnType<typeof useAuth> | undefined
    render(
      <authContext.Provider value={{ state, dispatch }}>
        <HookWrapper onRender={(value) => { hookValue = value }} />
      </authContext.Provider>
    )
    if (!hookValue) throw new Error('Hook did not render')
    return hookValue
  }

  it('should return computed accessToken and refreshToken', () => {
    const futureTime = Math.floor(new Date().getTime() / 1000) + 1000 // valid token
    const state = {
      accessTokenStorage: { accessToken: 'access123', expiresOn: futureTime },
      refreshTokenStorage: { refreshToken: 'refresh123', expiresOn: futureTime },
    }
    const auth = renderHookWithState(state)
    expect(auth.accessToken).toBe('access123')
    expect(auth.refreshToken).toBe('refresh123')
  })

  it('loginRedirect should throw if isAuthenticating is true', () => {
    const auth = renderHookWithState({ isAuthenticating: true })
    expect(() => auth.loginRedirect()).toThrow('Please wait until isAuthenticating=false')
  })

  it('loginRedirect should throw if already authenticated and policy is sign_in_or_sign_up', () => {
    const auth = renderHookWithState({ isAuthenticated: true })
    expect(() => auth.loginRedirect()).toThrow('Already authenticated, please logout first')
  })

  it('loginRedirect should throw if already authenticated and policy is sign_in_or_sign_up when explicitly provided', () => {
    const auth = renderHookWithState({ isAuthenticated: true })
    expect(() =>
      auth.loginRedirect({ locale: 'en', state: 'test', policy: 'sign_in_or_sign_up' })
    ).toThrow('Already authenticated, please logout first')
  })

  it('loginRedirect should call rawLoginRedirect with proper config and props', () => {
    const auth = renderHookWithState({ isAuthenticated: false, isAuthenticating: false })
    // Ensure rawLoginRedirect does not throw.
    ;(rawLoginRedirect as any).mockImplementation(() => {})
    const props = { locale: 'en', state: 'test', policy: 'custom_policy' }
    auth.loginRedirect(props)
    expect(rawLoginRedirect).toHaveBeenCalledWith(defaultState.config, props)
  })

  it('loginRedirect should call rawLoginRedirect when already authenticated with a custom policy', () => {
    const auth = renderHookWithState({ isAuthenticated: true, isAuthenticating: false });
    // Ensure rawLoginRedirect does not throw.
    (rawLoginRedirect as any).mockImplementation(() => {})
    // Use a custom policy that is not "sign_in_or_sign_up".
    const props = { locale: 'en', state: 'test', policy: 'custom_policy' }
    auth.loginRedirect(props)
    expect(rawLoginRedirect).toHaveBeenCalledWith(defaultState.config, props)
  })

  it('loginRedirect should dispatch setLoginError when rawLoginRedirect throws', () => {
    // Simulate rawLoginRedirect throwing an error.
    (rawLoginRedirect as any).mockImplementation(() => { throw new Error('Test error') })
    // Spy on handleError to return a predictable error message.
    vi.spyOn(utils, 'handleError').mockImplementation((e, errorType) => 'handled error message')
    const auth = renderHookWithState({ isAuthenticated: false, isAuthenticating: false })

    // Call loginRedirect which should catch the error and dispatch the login error action.
    auth.loginRedirect({ locale: 'en' })

    expect(dispatch).toHaveBeenCalledWith({
      type: 'setLoginError',
      payload: 'handled error message',
    })
  })

  it('acquireToken should return cached token if valid', async () => {
    const futureTime = Math.floor(new Date().getTime() / 1000) + 1000
    const state = {
      accessTokenStorage: { accessToken: 'cachedToken', expiresOn: futureTime },
    }
    const auth = renderHookWithState(state)
    let token: string = ''
    await act(async () => {
      token = await auth.acquireToken()
    })
    expect(token).toBe('cachedToken')
  })

  it('acquireToken should call exchangeTokenByRefreshToken if refresh token is valid', async () => {
    const currentTime = Math.floor(new Date().getTime() / 1000)
    const state = {
      accessTokenStorage: null,
      refreshTokenStorage: { refreshToken: 'validRefresh', expiresOn: currentTime + 1000 },
    }
    // Simulate exchangeTokenByRefreshToken returning a new access token object.
    const newAccessTokenObj = { accessToken: 'newAccess', expiresOn: currentTime + 1000 }
    ;(exchangeTokenByRefreshToken as any).mockResolvedValue(newAccessTokenObj)
    const auth = renderHookWithState(state)
    let token: string = ''
    await act(async () => {
      token = await auth.acquireToken()
    })
    expect(exchangeTokenByRefreshToken).toHaveBeenCalledWith(defaultState.config, 'validRefresh')
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setAccessTokenStorage',
      payload: newAccessTokenObj,
    })
    expect(token).toBe('newAccess')
  })

  it('acquireToken should dispatch setAcquireTokenError when exchangeTokenByRefreshToken fails', async () => {
    const currentTime = Math.floor(new Date().getTime() / 1000)
    const state = {
      accessTokenStorage: null,
      refreshTokenStorage: { refreshToken: 'validRefresh', expiresOn: currentTime + 1000 },
    }
    // Force handleError to return a predictable error message
    vi.spyOn(utils, 'handleError').mockImplementation((e, errorType) => 'handled acquire token error')
    // Simulate exchangeTokenByRefreshToken throwing an error.
    ;(exchangeTokenByRefreshToken as any).mockRejectedValue(new Error('Test error'))
    const auth = renderHookWithState(state)
    let token: string = ''
    await act(async () => {
      token = await auth.acquireToken()
    })
    expect(exchangeTokenByRefreshToken).toHaveBeenCalledWith(defaultState.config, 'validRefresh')
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setAcquireTokenError',
      payload: 'handled acquire token error',
    })
    // Assuming on error the hook returns an empty string
    expect(token).toBe('')
  })

  it('acquireUserInfo should return userInfo if already present', async () => {
    const user = { name: 'Test User' }
    const state = { userInfo: user }
    const auth = renderHookWithState(state)
    let info: any
    await act(async () => {
      info = await auth.acquireUserInfo()
    })
    expect(info).toEqual(user)
  })

  it('acquireUserInfo should call getUserInfo if userInfo is not present', async () => {
    const futureTime = Math.floor(new Date().getTime() / 1000) + 1000
    const state = {
      accessTokenStorage: { accessToken: 'validToken', expiresOn: futureTime },
      userInfo: null,
    }
    const userInfoResponse = { name: 'New User' }
    ;(getUserInfo as any).mockResolvedValue(userInfoResponse)
    const auth = renderHookWithState(state)
    let info: any
    await act(async () => {
      info = await auth.acquireUserInfo()
    })
    expect(getUserInfo).toHaveBeenCalledWith(defaultState.config, { accessToken: 'validToken' })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setUserInfo',
      payload: userInfoResponse,
    })
    expect(info).toEqual(userInfoResponse)
  })

  it('acquireUserInfo should dispatch setAcquireUserInfoError when getUserInfo fails', async () => {
    const futureTime = Math.floor(new Date().getTime() / 1000) + 1000
    const state = {
      accessTokenStorage: { accessToken: 'validToken', expiresOn: futureTime },
      userInfo: null,
    }
    // Force handleError to return a predictable error message.
    vi.spyOn(utils, 'handleError').mockImplementation((e, errorType) => 'handled fetch user info error')
    // Simulate getUserInfo throwing an error.
    ;(getUserInfo as any).mockRejectedValue(new Error('Test error'))
    const auth = renderHookWithState(state)
    let info: any
    await act(async () => {
      info = await auth.acquireUserInfo()
    })
    expect(getUserInfo).toHaveBeenCalledWith(defaultState.config, { accessToken: 'validToken' })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setAcquireUserInfoError',
      payload: 'handled fetch user info error',
    })
    // Assuming on error the hook returns undefined.
    expect(info).toBeUndefined()
  })

  it('logoutRedirect should call logout with proper parameters when tokens are valid', async () => {
    const futureTime = Math.floor(new Date().getTime() / 1000) + 1000
    const state = {
      accessTokenStorage: { accessToken: 'accessValid', expiresOn: futureTime },
      refreshTokenStorage: { refreshToken: 'refreshValid', expiresOn: futureTime },
    }
    const auth = renderHookWithState(state)
    ;(logout as any).mockResolvedValue(undefined)
    await act(async () => {
      await auth.logoutRedirect({ postLogoutRedirectUri: 'https://redirect' })
    })
    expect(logout).toHaveBeenCalledWith(
      defaultState.config,
      'accessValid',
      'refreshValid',
      'https://redirect',
      false // isLocalOnly is false because both tokens are present
    )
  })

  it('logoutRedirect should call logout with localOnly true if tokens are missing or localOnly flag is set', async () => {
    const state = {
      accessTokenStorage: null,
      refreshTokenStorage: null,
    }
    const auth = renderHookWithState(state)
    ;(logout as any).mockResolvedValue(undefined)
    await act(async () => {
      await auth.logoutRedirect({ postLogoutRedirectUri: 'https://redirect', localOnly: true })
    })
    expect(logout).toHaveBeenCalledWith(
      defaultState.config,
      '', // accessToken will be an empty string because acquireToken returns '' when no valid token is available
      null,
      'https://redirect',
      true // isLocalOnly true because tokens are missing or forced localOnly
    )
  })

  it('logoutRedirect should dispatch setLogoutError when logout fails', async () => {
    const futureTime = Math.floor(new Date().getTime() / 1000) + 1000
    const state = {
      accessTokenStorage: { accessToken: 'accessValid', expiresOn: futureTime },
      refreshTokenStorage: { refreshToken: 'refreshValid', expiresOn: futureTime },
    }
    // Force handleError to return a predictable error message.
    vi.spyOn(utils, 'handleError').mockImplementation((e, errorType) => 'handled logout error')
    // Simulate logout throwing an error.
    ;(logout as any).mockRejectedValue(new Error('Test error'))
    const auth = renderHookWithState(state)
    await act(async () => {
      await auth.logoutRedirect({ postLogoutRedirectUri: 'https://redirect' })
    })
    expect(logout).toHaveBeenCalledWith(
      defaultState.config,
      'accessValid',
      'refreshValid',
      'https://redirect',
      false // isLocalOnly is false because both tokens are present
    )
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setLogoutError',
      payload: 'handled logout error',
    })
  })
}) 