import {
  describe, expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import { View } from './useCurrentView'
import useSocialSignIn from 'pages/hooks/useSocialSignIn'
import {
  routeConfig, typeConfig,
} from 'configs'
import * as requestModule from 'pages/tools/request'
import { Policy } from 'dtos/oauth'

// Mock hooks from hono/jsx.
vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
    useEffect: React.useEffect,
  }),
)

const dummyLocale: typeConfig.Locale = 'en'
// Dummy parameters to simulate a valid AuthorizeParams object.
const dummyParams = {
  clientId: 'abc123',
  redirectUri: 'https://redirect.example.com',
  responseType: 'token',
  state: 'state-123',
  codeChallenge: 'xyz',
  codeChallengeMethod: 'S256',
  policy: Policy.SignInOrSignUp,
  org: 'org-1',
  scope: 'email profile',
  locale: dummyLocale,
}

describe(
  'useSocialSignIn',
  () => {
    test(
      'should return correct socialSignInState',
      () => {
        const { result } = renderHook(() =>
          useSocialSignIn({
            params: dummyParams,
            onSubmitError: vi.fn(),
            locale: dummyLocale,
            onSwitchView: vi.fn(),
          }))

        expect(result.current.socialSignInState).toEqual({
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
      },
    )

    test(
      'handleGoogleSignIn returns false if no credential provided',
      () => {
        const { result } = renderHook(() =>
          useSocialSignIn({
            params: dummyParams,
            onSubmitError: vi.fn(),
            locale: dummyLocale,
            onSwitchView: vi.fn(),
          }))

        const returnVal = result.current.handleGoogleSignIn({})
        expect(returnVal).toBe(false)
      },
    )

    test(
      'handleGoogleSignIn successfully processes valid credential',
      async () => {
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useSocialSignIn({
            params: dummyParams,
            onSubmitError: vi.fn(),
            locale: dummyLocale,
            onSwitchView,
          }))

        const googleResponse = { credential: 'test-google-token' }

        // Setup a fake fetch response.
        const fakeFetchResponse = {
          ok: true,
          json: async () => ({ status: 'ok' }),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeFetchResponse as Response)

        // Spy on handleAuthorizeStep to simulate a successful flow.
        const handleAuthorizeSpy = vi.spyOn(
          requestModule,
          'handleAuthorizeStep',
        ).mockImplementation((
          response, locale, onSwitch,
        ) => {
          onSwitch(View.Consent)
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
          }),
        )
        expect(handleAuthorizeSpy).toHaveBeenCalledWith(
          { status: 'ok' },
          dummyLocale,
          onSwitchView,
        )

        fetchSpy.mockRestore()
        handleAuthorizeSpy.mockRestore()
      },
    )

    test(
      'handleGoogleSignIn calls handleSubmitError on fetch failure',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useSocialSignIn({
            params: dummyParams,
            onSubmitError,
            locale: dummyLocale,
            onSwitchView,
          }))

        const googleResponse = { credential: 'test-google-token' }

        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(new Error('Fetch error'))

        await act(async () => {
          result.current.handleGoogleSignIn(googleResponse)
          await Promise.resolve()
        })

        expect(onSubmitError).toHaveBeenCalledWith(expect.any(Error))
        fetchSpy.mockRestore()
      },
    )

    test(
      'handleFacebookSignIn returns false if invalid response provided',
      () => {
        const { result } = renderHook(() =>
          useSocialSignIn({
            params: dummyParams,
            onSubmitError: vi.fn(),
            locale: dummyLocale,
            onSwitchView: vi.fn(),
          }))

        expect(result.current.handleFacebookSignIn(null)).toBe(false)
        expect(result.current.handleFacebookSignIn({})).toBe(false)
        expect(result.current.handleFacebookSignIn({ authResponse: {} })).toBe(false)
        expect(result.current.handleFacebookSignIn({ authResponse: { accessToken: '' } })).toBe(false)
      },
    )

    test(
      'handleFacebookSignIn successfully processes valid response',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useSocialSignIn({
            params: dummyParams,
            onSubmitError,
            locale: dummyLocale,
            onSwitchView,
          }))

        const facebookResponse = { authResponse: { accessToken: 'test-facebook-token' } }
        const fakeFetchResponse = {
          ok: true,
          json: async () => ({ status: 'ok' }),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeFetchResponse as Response)

        const handleAuthorizeSpy = vi.spyOn(
          requestModule,
          'handleAuthorizeStep',
        ).mockImplementation((
          response, locale, onSwitch,
        ) => {
          onSwitch(View.Consent)
        })

        await act(async () => {
          result.current.handleFacebookSignIn(facebookResponse)
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
          }),
        )
        expect(handleAuthorizeSpy).toHaveBeenCalledWith(
          { status: 'ok' },
          dummyLocale,
          onSwitchView,
        )

        fetchSpy.mockRestore()
        handleAuthorizeSpy.mockRestore()
      },
    )

    test(
      'handleFacebookSignIn calls handleSubmitError on fetch failure',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useSocialSignIn({
            params: dummyParams,
            onSubmitError,
            locale: dummyLocale,
            onSwitchView,
          }))

        const facebookResponse = { authResponse: { accessToken: 'test-facebook-token' } }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(new Error('Facebook fetch error'))

        await act(async () => {
          result.current.handleFacebookSignIn(facebookResponse)
          await Promise.resolve()
        })

        expect(onSubmitError).toHaveBeenCalledWith(expect.any(Error))
        fetchSpy.mockRestore()
      },
    )

    test(
      'handleGetOidcConfigs should fetch OIDC configurations successfully',
      async () => {
        const mockOidcConfigs = {
          configs: [
            {
              id: 'provider1', name: 'Provider 1', authUrl: 'https://provider1.com/auth',
            },
            {
              id: 'provider2', name: 'Provider 2', authUrl: 'https://provider2.com/auth',
            },
          ],
        }

        const fakeFetchResponse = {
          ok: true,
          json: async () => mockOidcConfigs,
        }

        vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeFetchResponse as Response)

        const { result } = renderHook(() =>
          useSocialSignIn({
            params: dummyParams,
            onSubmitError: vi.fn(),
            locale: dummyLocale,
            onSwitchView: vi.fn(),
            oidcProviders: ['provider1', 'provider2'],
          }))

        await act(async () => {
          const response = await result.current.handleGetOidcConfigs()
          expect(response).toEqual(mockOidcConfigs)
        })
      },
    )

    test(
      'oidcConfigs should be initialized as empty array',
      () => {
        const { result } = renderHook(() =>
          useSocialSignIn({
            params: dummyParams,
            onSubmitError: vi.fn(),
            locale: dummyLocale,
            onSwitchView: vi.fn(),
          }))

        expect(result.current.oidcConfigs).toEqual([])
      },
    )

    test(
      'oidcConfigs should be populated when oidcProviders are provided',
      async () => {
        const mockOidcConfigs = {
          configs: [
            {
              id: 'provider1', name: 'Provider 1', authUrl: 'https://provider1.com/auth',
            },
            {
              id: 'provider2', name: 'Provider 2', authUrl: 'https://provider2.com/auth',
            },
          ],
        }

        const fakeFetchResponse = {
          ok: true,
          json: async () => mockOidcConfigs,
        }

        vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeFetchResponse as Response)

        const { result } = renderHook(() =>
          useSocialSignIn({
            params: dummyParams,
            onSubmitError: vi.fn(),
            locale: dummyLocale,
            onSwitchView: vi.fn(),
            oidcProviders: ['provider1', 'provider2'],
          }))

        // Need to wait for the useEffect to run and fetch to complete
        await act(async () => {
          await new Promise((resolve) => setTimeout(
            resolve,
            0,
          ))
        })

        expect(result.current.oidcConfigs).toEqual(mockOidcConfigs.configs)

        vi.restoreAllMocks()
      },
    )

    test(
      'handleGetOidcConfigs should handle fetch errors properly',
      async () => {
        const { result } = renderHook(() =>
          useSocialSignIn({
            params: dummyParams,
            onSubmitError: vi.fn(),
            locale: dummyLocale,
            onSwitchView: vi.fn(),
          }))

        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(new Error('OIDC fetch error'))

        await act(async () => {
          await expect(result.current.handleGetOidcConfigs()).rejects.toThrow('OIDC fetch error')
        })

        fetchSpy.mockRestore()
      },
    )
  },
)
