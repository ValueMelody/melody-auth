import {
  expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import usePasskeyVerifyForm from 'pages/hooks/usePasskeyVerifyForm'
import { typeConfig } from 'configs'
import * as requestModule from 'pages/tools/request'
import { View } from './useCurrentView'

// Mock hooks from hono/jsx.
vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useState: React.useState,
  }),
)

// A dummy params object for testing.
const dummyParams = {} as any

test(
  'returns initial state with null passkeyOption',
  () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      usePasskeyVerifyForm({
        email: 'user@example.com',
        locale: 'en' as typeConfig.Locale,
        onSubmitError,
        onSwitchView,
        params: dummyParams,
      }))

    expect(result.current.passkeyOption).toBeNull()
    expect(typeof result.current.getPasskeyOption).toBe('function')
    expect(typeof result.current.handleVerifyPasskey).toBe('function')
  },
)

test(
  'getPasskeyOption calls onSubmitError if email validation fails',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    // Pass an empty email to trigger validation error via emailField.
    const { result } = renderHook(() =>
      usePasskeyVerifyForm({
        email: '',
        locale: 'en' as typeConfig.Locale,
        onSubmitError,
        onSwitchView,
        params: dummyParams,
      }))
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    )

    await act(async () => {
      await result.current.getPasskeyOption()
    })

    expect(onSubmitError).toHaveBeenCalled() // with error string from validation
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  },
)

test(
  'getPasskeyOption sets passkeyOption when response contains passkeyOption',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      usePasskeyVerifyForm({
        email: 'user@example.com',
        locale: 'en' as typeConfig.Locale,
        onSubmitError,
        onSwitchView,
        params: dummyParams,
      }))
    const fakePasskeyOption = {
      challenge: 'test-challenge', allowCredentials: [{ id: 'test-id' }],
    }
    const fakeResponse = {
      ok: true, json: async () => ({ passkeyOption: fakePasskeyOption }),
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    await act(async () => {
      await result.current.getPasskeyOption()
    })

    expect(result.current.passkeyOption).toEqual(fakePasskeyOption)
    fetchSpy.mockRestore()
  },
)

test(
  'getPasskeyOption sets passkeyOption to false when response has no passkeyOption',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      usePasskeyVerifyForm({
        email: 'user@example.com',
        locale: 'en' as typeConfig.Locale,
        onSubmitError,
        onSwitchView,
        params: dummyParams,
      }))
    const fakeResponse = {
      ok: true, json: async () => ({}),
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    await act(async () => {
      await result.current.getPasskeyOption()
    })

    expect(result.current.passkeyOption).toBe(false)
    fetchSpy.mockRestore()
  },
)

test(
  'getPasskeyOption calls onSubmitError on fetch failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      usePasskeyVerifyForm({
        email: 'user@example.com',
        locale: 'en' as typeConfig.Locale,
        onSubmitError,
        onSwitchView,
        params: dummyParams,
      }))
    const error = new Error('Network error')
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(error)

    await act(async () => {
      await result.current.getPasskeyOption()
    })

    expect(onSubmitError).toHaveBeenCalledWith(error)
    fetchSpy.mockRestore()
  },
)

test(
  'handleVerifyPasskey does nothing when passkeyOption is falsy',
  () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      usePasskeyVerifyForm({
        email: 'user@example.com',
        locale: 'en' as typeConfig.Locale,
        onSubmitError,
        onSwitchView,
        params: dummyParams,
      }))

    // Ensure passkeyOption is still null.
    expect(result.current.passkeyOption).toBeNull()

    // Override navigator.credentials.get to track calls.
    const credentialsGetSpy = vi.fn()
  ;(navigator as any).credentials = { get: credentialsGetSpy }

    act(() => {
      result.current.handleVerifyPasskey()
    })

    expect(credentialsGetSpy).not.toHaveBeenCalled()
  },
)

test(
  'handleVerifyPasskey submits passkey when credentials.get succeeds',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    // Set up a dummy params object if needed by submitPasskey.
    const params = { dummy: 'value' } as any

  // Set up a simple converter.
  ;(window as any).SimpleWebAuthnBrowser = { base64URLStringToBuffer: (str: string) => str }

    const fakePasskeyOption = {
      challenge: 'test-challenge', allowCredentials: [{ id: 'test-id' }],
    }
    // Simulate GET response in getPasskeyOption.
    const fakeGetResponse = {
      ok: true, json: async () => ({ passkeyOption: fakePasskeyOption }),
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValueOnce(fakeGetResponse as Response)

    const { result } = renderHook(() =>
      usePasskeyVerifyForm({
        email: 'user@example.com',
        locale: 'en' as typeConfig.Locale,
        onSubmitError,
        onSwitchView,
        params,
      }))

    // Set the passkeyOption state.
    await act(async () => {
      await result.current.getPasskeyOption()
    })
    expect(result.current.passkeyOption).toEqual(fakePasskeyOption)

    // Override navigator.credentials.get to resolve with a fake Credential.
    const fakeCredential = { id: 'fake-credential' }
    const navigatorSpy = vi
      .spyOn(
        navigator.credentials,
        'get',
      )
      .mockResolvedValue(fakeCredential as Credential)

    // Simulate the POST fetch inside submitPasskey.
    const fakePostResponse = {
      ok: true, json: async () => ({}),
    }
    // This will be used for the POST call.
    fetchSpy.mockResolvedValueOnce(fakePostResponse as Response)

    // Override handleAuthorizeStep to simulate a successful switch.
    const handleAuthorizeSpy = vi
      .spyOn(
        requestModule,
        'handleAuthorizeStep',
      )
      .mockImplementation((
        response, locale, onSwitchView,
      ) => {
        onSwitchView(View.Consent)
      })

    await act(async () => {
      result.current.handleVerifyPasskey()
      await Promise.resolve()
    })

    // Check that navigator.credentials.get was called with proper parameters.
    expect(navigatorSpy).toHaveBeenCalledWith({
      publicKey: {
        challenge: fakePasskeyOption.challenge,
        allowCredentials: [{
          id: fakePasskeyOption.allowCredentials[0].id, type: 'public-key',
        }],
      },
    })

    // Expect that the POST fetch was triggered (total two calls: one for GET and one for POST).
    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(handleAuthorizeSpy).toHaveBeenCalled()
    expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

    navigatorSpy.mockRestore()
    fetchSpy.mockRestore()
    handleAuthorizeSpy.mockRestore()
  },
)

test(
  'handleVerifyPasskey calls onSubmitError when navigator.credentials.get fails',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      usePasskeyVerifyForm({
        email: 'user@example.com',
        locale: 'en' as typeConfig.Locale,
        onSubmitError,
        onSwitchView,
        params: dummyParams,
      }))

  // Set up SimpleWebAuthnBrowser.
  ;(window as any).SimpleWebAuthnBrowser = { base64URLStringToBuffer: (str: string) => str }

    const fakePasskeyOption = {
      challenge: 'test-challenge', allowCredentials: [{ id: 'test-id' }],
    }
    const fakeGetResponse = {
      ok: true, json: async () => ({ passkeyOption: fakePasskeyOption }),
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValueOnce(fakeGetResponse as Response)

    await act(async () => {
      await result.current.getPasskeyOption()
    })
    expect(result.current.passkeyOption).toEqual(fakePasskeyOption)

    const error = new Error('Credential error')
    const navigatorSpy = vi
      .spyOn(
        navigator.credentials,
        'get',
      )
      .mockRejectedValue(error)

    await act(async () => {
      result.current.handleVerifyPasskey()
      await Promise.resolve()
    })

    expect(onSubmitError).toHaveBeenCalledWith(error)
    navigatorSpy.mockRestore()
    fetchSpy.mockRestore()
  },
)

test(
  'submitPasskey (via handleVerifyPasskey) calls onSubmitError when POST fetch fails',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const params = {} as any

  ;(window as any).SimpleWebAuthnBrowser = { base64URLStringToBuffer: (str: string) => str }

    const fakePasskeyOption = {
      challenge: 'test-challenge', allowCredentials: [{ id: 'test-id' }],
    }
    const fakeGetResponse = {
      ok: true, json: async () => ({ passkeyOption: fakePasskeyOption }),
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValueOnce(fakeGetResponse as Response)

    const { result } = renderHook(() =>
      usePasskeyVerifyForm({
        email: 'user@example.com',
        locale: 'en' as typeConfig.Locale,
        onSubmitError,
        onSwitchView,
        params,
      }))

    await act(async () => {
      await result.current.getPasskeyOption()
    })
    expect(result.current.passkeyOption).toEqual(fakePasskeyOption)

    // Override navigator.credentials.get to resolve successfully.
    const fakeCredential = { id: 'fake-credential' }
    const navigatorSpy = vi
      .spyOn(
        navigator.credentials,
        'get',
      )
      .mockResolvedValue(fakeCredential as Credential)

    const postError = new Error('POST fetch error')
    // Simulate POST fetch failure.
    fetchSpy.mockResolvedValueOnce(Promise.reject(postError) as any)

    await act(async () => {
      result.current.handleVerifyPasskey()
      await Promise.resolve()
    })

    expect(onSubmitError).toHaveBeenCalledWith(postError)
    navigatorSpy.mockRestore()
    fetchSpy.mockRestore()
  },
)
