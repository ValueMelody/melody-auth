import {
  describe, expect, test, vi, afterEach,
  Mock,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act, waitFor,
} from '@testing-library/react'

import { startAuthentication } from '@simplewebauthn/browser'
import { AuthenticationResponseJSON } from '@simplewebauthn/server'
import { View } from './useCurrentView'
import { InitialProps } from './useInitialProps'
import usePasskeyVerifyForm from 'pages/hooks/usePasskeyVerifyForm'
import { routeConfig } from 'configs'
import * as requestModule from 'pages/tools/request'

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

vi.mock(
  '@simplewebauthn/browser',
  () => ({ startAuthentication: vi.fn() }),
)

describe(
  'usePasskeyVerifyForm hook',
  () => {
    const locale = 'en'
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const params = {
      locale: 'en' as const,
      clientId: 'test-client',
      redirectUri: 'http://redirect.test',
      responseType: 'code',
      state: 'test-state',
      policy: 'sign_in_or_sign_up' as const,
      codeChallenge: 'test-challenge',
      codeChallengeMethod: 'S256',
      org: 'test-org',
      scope: 'openid profile',
    }

    const createInitialProps = (allowPasskey: boolean): InitialProps => ({
      locales: ['en'],
      logoUrl: '',
      enableLocaleSelector: false,
      enableSignUp: true,
      enablePasswordReset: true,
      enablePasswordSignIn: true,
      enablePasswordlessSignIn: false,
      enableMfaRememberDevice: false,
      enableNames: false,
      allowPasskey,
      allowRecoveryCode: false,
      namesIsRequired: false,
      appName: 'Test App',
      termsLink: '',
      privacyPolicyLink: '',
      googleClientId: '',
      facebookClientId: '',
      githubClientId: '',
      discordClientId: '',
      appleClientId: '',
      oidcProviders: [],
      enableUserAttribute: false,
      enableAppBanner: false,
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    test(
      'should return initial state correctly',
      () => {
        const { result } = renderHook(() =>
          usePasskeyVerifyForm({
            locale,
            onSubmitError,
            onSwitchView,
            params,
            initialProps: createInitialProps(false),
          }))

        expect(result.current.isVerifyingPasskey).toBe(false)
        expect(typeof result.current.handleVerifyPasskey).toBe('function')
      },
    )

    test(
      'should not fetch passkey options if allowPasskey is false',
      async () => {
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        )

        renderHook(() =>
          usePasskeyVerifyForm({
            locale,
            onSubmitError,
            onSwitchView,
            params,
            initialProps: createInitialProps(false),
          }))

        await act(async () => {
          await Promise.resolve()
        })

        expect(fetchSpy).not.toHaveBeenCalled()
        fetchSpy.mockRestore()
      },
    )

    test(
      'should fetch passkey options if allowPasskey is true',
      async () => {
        const fakePasskeyOption = {
          challenge: 'test-challenge',
          rpId: 'test-rp',
        }
        const fakeResponse = {
          ok: true,
          json: async () => ({ passkeyOption: fakePasskeyOption }),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeResponse as Response)

        renderHook(() =>
          usePasskeyVerifyForm({
            locale,
            onSubmitError,
            onSwitchView,
            params,
            initialProps: createInitialProps(true),
          }))

        await act(async () => {
          await Promise.resolve()
        })

        expect(fetchSpy).toHaveBeenCalledWith(routeConfig.IdentityRoute.AuthorizePasskeyVerify)
        fetchSpy.mockRestore()
      },
    )

    test(
      'should call onSubmitError when fetching passkey options fails',
      async () => {
        const error = new Error('Fetch failed')
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(error)

        renderHook(() =>
          usePasskeyVerifyForm({
            locale,
            onSubmitError,
            onSwitchView,
            params,
            initialProps: createInitialProps(true),
          }))

        await act(async () => {
          await Promise.resolve()
        })

        await waitFor(() => {
          expect(onSubmitError).toHaveBeenCalledWith(error)
        })
        fetchSpy.mockRestore()
      },
    )

    test(
      'should set passkeyOption to false if response does not contain passkeyOption',
      async () => {
        const fakeResponse = {
          ok: true,
          json: async () => ({}),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeResponse as Response)

        const { result } = renderHook(() =>
          usePasskeyVerifyForm({
            locale,
            onSubmitError,
            onSwitchView,
            params,
            initialProps: createInitialProps(true),
          }))

        await act(async () => {
          await Promise.resolve()
        })

        // handleVerifyPasskey should return early since passkeyOption is false
        act(() => {
          result.current.handleVerifyPasskey()
        })

        expect(startAuthentication).not.toHaveBeenCalled()
        fetchSpy.mockRestore()
      },
    )

    test(
      'handleVerifyPasskey does nothing if passkeyOption is null',
      () => {
        const { result } = renderHook(() =>
          usePasskeyVerifyForm({
            locale,
            onSubmitError,
            onSwitchView,
            params,
            initialProps: createInitialProps(false),
          }))

        act(() => {
          result.current.handleVerifyPasskey()
        })

        expect(startAuthentication).not.toHaveBeenCalled()
      },
    )

    test(
      'handleVerifyPasskey calls startAuthentication and submitPasskey on success',
      async () => {
        const fakePasskeyOption = {
          challenge: 'test-challenge',
          rpId: 'test-rp',
        }
        const fakeGetResponse = {
          ok: true,
          json: async () => ({ passkeyOption: fakePasskeyOption }),
        }
        const fetchSpyGet = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValueOnce(fakeGetResponse as Response)

        const { result } = renderHook(() =>
          usePasskeyVerifyForm({
            locale,
            onSubmitError,
            onSwitchView,
            params,
            initialProps: createInitialProps(true),
          }))

        await act(async () => {
          await Promise.resolve()
        })
        fetchSpyGet.mockRestore()

        // Mock startAuthentication to return a credential
        const fakeCredential = { id: 'passkey-credential-123' }
        ;(startAuthentication as Mock).mockResolvedValueOnce(fakeCredential)

        // Mock the POST request
        const fakePostResponse = {
          ok: true,
          json: async () => ({ nextPage: View.Consent }),
        }
        const fetchSpyPost = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValueOnce(fakePostResponse as Response)

        // Spy on handleAuthorizeStep
        const handleAuthorizeSpy = vi.spyOn(
          requestModule,
          'handleAuthorizeStep',
        ).mockImplementation((
          response, locale, onSwitchViewFn,
        ) => {
          onSwitchViewFn(View.Consent)
        })

        await act(async () => {
          result.current.handleVerifyPasskey()
          await Promise.resolve()
        })

        expect(startAuthentication).toHaveBeenCalledWith({ optionsJSON: fakePasskeyOption })
        expect(fetchSpyPost).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.AuthorizePasskeyVerify,
          expect.objectContaining({
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: expect.any(String),
          }),
        )

        // Verify body contains expected values
        const callArgs = fetchSpyPost.mock.calls[0]
        const body = JSON.parse((callArgs[1] as RequestInit).body as string)
        expect(body.passkeyInfo).toEqual(fakeCredential)
        expect(body.challenge).toBe('test-challenge')
        expect(body.clientId).toBe(params.clientId)
        expect(body.redirectUri).toBe(params.redirectUri)

        expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

        fetchSpyPost.mockRestore()
        handleAuthorizeSpy.mockRestore()
      },
    )

    test(
      'handleVerifyPasskey does not continue if startAuthentication returns undefined',
      async () => {
        const fakePasskeyOption = {
          challenge: 'test-challenge',
          rpId: 'test-rp',
        }
        const fakeGetResponse = {
          ok: true,
          json: async () => ({ passkeyOption: fakePasskeyOption }),
        }
        const fetchSpyGet = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValueOnce(fakeGetResponse as Response)

        const { result } = renderHook(() =>
          usePasskeyVerifyForm({
            locale,
            onSubmitError,
            onSwitchView,
            params,
            initialProps: createInitialProps(true),
          }))

        await act(async () => {
          await Promise.resolve()
        })
        fetchSpyGet.mockRestore()

        // Mock startAuthentication to return undefined
        ;(startAuthentication as Mock).mockResolvedValueOnce(null)

        const fetchSpyPost = vi.spyOn(
          global,
          'fetch',
        )

        await act(async () => {
          result.current.handleVerifyPasskey()
          await Promise.resolve()
        })

        // POST should not be called since startAuthentication returned null
        expect(fetchSpyPost).not.toHaveBeenCalled()
        fetchSpyPost.mockRestore()
      },
    )

    test(
      'handleVerifyPasskey calls onSubmitError when startAuthentication fails',
      async () => {
        const fakePasskeyOption = {
          challenge: 'test-challenge',
          rpId: 'test-rp',
        }
        const fakeGetResponse = {
          ok: true,
          json: async () => ({ passkeyOption: fakePasskeyOption }),
        }
        const fetchSpyGet = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValueOnce(fakeGetResponse as Response)

        const { result } = renderHook(() =>
          usePasskeyVerifyForm({
            locale,
            onSubmitError,
            onSwitchView,
            params,
            initialProps: createInitialProps(true),
          }))

        await act(async () => {
          await Promise.resolve()
        })
        fetchSpyGet.mockRestore()

        // Mock startAuthentication to throw an error
        const error = new Error('Authentication failed')
        ;(startAuthentication as Mock).mockRejectedValueOnce(error)

        await act(async () => {
          result.current.handleVerifyPasskey()
          await Promise.resolve()
        })

        await waitFor(() => {
          expect(onSubmitError).toHaveBeenCalledWith(error)
        })
      },
    )

    test(
      'handleVerifyPasskey calls onSubmitError when submitPasskey fails',
      async () => {
        const fakePasskeyOption = {
          challenge: 'test-challenge',
          rpId: 'test-rp',
        }
        const fakeGetResponse = {
          ok: true,
          json: async () => ({ passkeyOption: fakePasskeyOption }),
        }
        const fetchSpyGet = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValueOnce(fakeGetResponse as Response)

        const { result } = renderHook(() =>
          usePasskeyVerifyForm({
            locale,
            onSubmitError,
            onSwitchView,
            params,
            initialProps: createInitialProps(true),
          }))

        await act(async () => {
          await Promise.resolve()
        })
        fetchSpyGet.mockRestore()

        // Mock startAuthentication to return a credential
        const fakeCredential = { id: 'passkey-credential-123' }
        ;(startAuthentication as Mock).mockResolvedValueOnce(fakeCredential)

        // Mock POST to fail
        const error = new Error('Submit failed')
        const fetchSpyPost = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValueOnce(error)

        await act(async () => {
          result.current.handleVerifyPasskey()
          await Promise.resolve()
        })

        await waitFor(() => {
          expect(onSubmitError).toHaveBeenCalledWith(error)
        })
        expect(onSwitchView).not.toHaveBeenCalled()

        fetchSpyPost.mockRestore()
      },
    )

    test(
      'isVerifyingPasskey is set to true during verification and false after',
      async () => {
        const fakePasskeyOption = {
          challenge: 'test-challenge',
          rpId: 'test-rp',
        }
        const fakeGetResponse = {
          ok: true,
          json: async () => ({ passkeyOption: fakePasskeyOption }),
        }
        const fetchSpyGet = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValueOnce(fakeGetResponse as Response)

        const { result } = renderHook(() =>
          usePasskeyVerifyForm({
            locale,
            onSubmitError,
            onSwitchView,
            params,
            initialProps: createInitialProps(true),
          }))

        await act(async () => {
          await Promise.resolve()
        })
        fetchSpyGet.mockRestore()

        // Create a deferred promise to control timing
        let resolveAuth: (value: AuthenticationResponseJSON) => void
        const authPromise = new Promise<AuthenticationResponseJSON>((resolve) => {
          resolveAuth = resolve
        })
        ;(startAuthentication as Mock).mockReturnValueOnce(authPromise)

        const fakePostResponse = {
          ok: true,
          json: async () => ({ nextPage: View.Consent }),
        }
        const fetchSpyPost = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValueOnce(fakePostResponse as Response)

        vi.spyOn(
          requestModule,
          'handleAuthorizeStep',
        ).mockImplementation(() => {})

        // Start verification
        act(() => {
          result.current.handleVerifyPasskey()
        })

        // Should be verifying now
        expect(result.current.isVerifyingPasskey).toBe(true)

        // Resolve authentication
        await act(async () => {
          resolveAuth!({ id: 'credential' } as unknown as AuthenticationResponseJSON)
          await Promise.resolve()
        })

        // Should be done verifying
        await waitFor(() => {
          expect(result.current.isVerifyingPasskey).toBe(false)
        })

        fetchSpyPost.mockRestore()
      },
    )
  },
)
