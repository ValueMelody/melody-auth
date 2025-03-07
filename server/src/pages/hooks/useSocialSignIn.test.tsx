import { describe, expect, test, vi } from 'vitest'
import * as React from 'react'
import { renderHook, act } from '@testing-library/react'

// Mock hooks from hono/jsx.
vi.mock('hono/jsx', () => ({
  useCallback: React.useCallback,
  useMemo: React.useMemo,
}))

import useSocialSignIn from 'pages/hooks/useSocialSignIn'
import { routeConfig, typeConfig } from 'configs'
import * as requestModule from 'pages/tools/request'

// Dummy parameters to simulate a valid AuthorizeParams object.
const dummyParams = {
  clientId: "abc123",
  redirectUri: "https://redirect.example.com",
  responseType: "token",
  state: "state-123",
  codeChallenge: "xyz",
  codeChallengeMethod: "S256",
  policy: "default",
  org: "org-1",
  scope: "email profile",
}

const dummyLocale: typeConfig.Locale = 'en'

describe('useSocialSignIn', () => {
  test('should return correct githubSignInState', () => {
    const { result } = renderHook(() =>
      useSocialSignIn({
        params: dummyParams,
        handleSubmitError: vi.fn(),
        locale: dummyLocale,
        onSwitchView: vi.fn(),
      })
    )

    expect(result.current.githubSignInState).toEqual({
      clientId: dummyParams.clientId,
      redirectUri: dummyParams.redirectUri,
      responseType: dummyParams.responseType,
      state: dummyParams.state,
      codeChallenge: dummyParams.codeChallenge,
      codeChallengeMethod: dummyParams.codeChallengeMethod,
      locale: dummyLocale,
      policy: dummyParams.policy,
      org: dummyParams.org,
      scopes: ['email', 'profile'],
    })
  })

  test('handleGoogleSignIn returns false if no credential provided', () => {
    const { result } = renderHook(() =>
      useSocialSignIn({
        params: dummyParams,
        handleSubmitError: vi.fn(),
        locale: dummyLocale,
        onSwitchView: vi.fn(),
      })
    )

    const returnVal = result.current.handleGoogleSignIn({})
    expect(returnVal).toBe(false)
  })

  test('handleGoogleSignIn successfully processes valid credential', async () => {
    const handleSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useSocialSignIn({
        params: dummyParams,
        handleSubmitError,
        locale: dummyLocale,
        onSwitchView,
      })
    )

    const googleResponse = { credential: 'test-google-token' }

    // Setup a fake fetch response.
    const fakeFetchResponse = {
      ok: true,
      json: async () => ({ status: 'ok' }),
    }
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(fakeFetchResponse as Response)

    // Spy on handleAuthorizeStep to simulate a successful flow.
    const handleAuthorizeSpy = vi.spyOn(requestModule, 'handleAuthorizeStep').mockImplementation((response, locale, onSwitch) => {
      onSwitch('nextView')
    })

    await act(async () => {
      result.current.handleGoogleSignIn(googleResponse)
      // Allow the promise chain to resolve.
      await Promise.resolve()
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.AuthorizeGoogle,
      expect.objectContaining({
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      })
    )
    expect(handleAuthorizeSpy).toHaveBeenCalledWith({ status: 'ok' }, dummyLocale, onSwitchView)

    fetchSpy.mockRestore()
    handleAuthorizeSpy.mockRestore()
  })

  test('handleGoogleSignIn calls handleSubmitError on fetch failure', async () => {
    const handleSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useSocialSignIn({
        params: dummyParams,
        handleSubmitError,
        locale: dummyLocale,
        onSwitchView,
      })
    )

    const googleResponse = { credential: 'test-google-token' }

    const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Fetch error'))

    await act(async () => {
      result.current.handleGoogleSignIn(googleResponse)
      await Promise.resolve()
    })

    expect(handleSubmitError).toHaveBeenCalledWith(expect.any(Error))
    fetchSpy.mockRestore()
  })

  test('handeFacebookSignIn returns false if invalid response provided', () => {
    const { result } = renderHook(() =>
      useSocialSignIn({
        params: dummyParams,
        handleSubmitError: vi.fn(),
        locale: dummyLocale,
        onSwitchView: vi.fn(),
      })
    )

    expect(result.current.handeFacebookSignIn(null)).toBe(false)
    expect(result.current.handeFacebookSignIn({})).toBe(false)
    expect(result.current.handeFacebookSignIn({ authResponse: {} })).toBe(false)
    expect(result.current.handeFacebookSignIn({ authResponse: { accessToken: '' } })).toBe(false)
  })

  test('handeFacebookSignIn successfully processes valid response', async () => {
    const handleSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useSocialSignIn({
        params: dummyParams,
        handleSubmitError,
        locale: dummyLocale,
        onSwitchView,
      })
    )

    const facebookResponse = { authResponse: { accessToken: 'test-facebook-token' } }
    const fakeFetchResponse = {
      ok: true,
      json: async () => ({ status: 'ok' }),
    }
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(fakeFetchResponse as Response)

    const handleAuthorizeSpy = vi.spyOn(requestModule, 'handleAuthorizeStep').mockImplementation((response, locale, onSwitch) => {
      onSwitch('nextView')
    })

    await act(async () => {
      result.current.handeFacebookSignIn(facebookResponse)
      await Promise.resolve()
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.AuthorizeFacebook,
      expect.objectContaining({
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      })
    )
    expect(handleAuthorizeSpy).toHaveBeenCalledWith({ status: 'ok' }, dummyLocale, onSwitchView)

    fetchSpy.mockRestore()
    handleAuthorizeSpy.mockRestore()
  })

  test('handeFacebookSignIn calls handleSubmitError on fetch failure', async () => {
    const handleSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useSocialSignIn({
        params: dummyParams,
        handleSubmitError,
        locale: dummyLocale,
        onSwitchView,
      })
    )

    const facebookResponse = { authResponse: { accessToken: 'test-facebook-token' } }
    const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Facebook fetch error'))

    await act(async () => {
      result.current.handeFacebookSignIn(facebookResponse)
      await Promise.resolve()
    })

    expect(handleSubmitError).toHaveBeenCalledWith(expect.any(Error))
    fetchSpy.mockRestore()
  })
}) 