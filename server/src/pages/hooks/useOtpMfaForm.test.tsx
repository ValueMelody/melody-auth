import {
  expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import { View } from './useCurrentView'
import useOtpMfaForm from 'pages/hooks/useOtpMfaForm'
import { routeConfig } from 'configs'

// Spy on the handleAuthorizeStep function from the request module.
import * as requestModule from 'pages/tools/request'

// Mock hooks from hono/jsx.
vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
  }),
)

// Mock getFollowUpParams to return test parameters.
vi.mock(
  'pages/tools/param',
  () => ({
    getFollowUpParams: vi.fn(() => ({
      code: 'test-code', org: 'test-org',
    })),
  }),
)

test(
  'returns initial state',
  () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useOtpMfaForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    // otpUri should be empty, allowFallback false, and mfaCode initialized with 6 empty strings.
    expect(result.current.otpUri).toBe('')
    expect(result.current.otpSecret).toBe('')
    expect(result.current.allowFallbackToEmailMfa).toBe(false)
    expect(result.current.values).toEqual({ mfaCode: new Array(6).fill('') })
    // Since the field has not been touched, errors should be undefined.
    expect(result.current.errors).toEqual({ mfaCode: undefined })
    expect(typeof result.current.getOtpSetupInfo).toBe('function')
    expect(typeof result.current.getOtpMfaInfo).toBe('function')
    expect(typeof result.current.handleVerifyMfa).toBe('function')
    expect(typeof result.current.handleChange).toBe('function')
  },
)

test(
  'handleChange updates mfaCode and resets onSubmitError',
  () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useOtpMfaForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    act(() => {
      result.current.handleChange(
        'mfaCode',
        ['1', '2', '3', '4', '5', '6'],
      )
    })

    expect(onSubmitError).toHaveBeenCalledWith(null)
    expect(result.current.values.mfaCode).toEqual(['1', '2', '3', '4', '5', '6'])
  },
)

test(
  'getOtpSetupInfo fetches OTP setup info and updates otpUri',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useOtpMfaForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    // Prepare a fake fetch response containing otpUri.
    const fakeResponse = {
      ok: true,
      json: async () => ({
        otpUri: 'test-uri', otpSecret: 'test-secret',
      }),
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)
    const qs = '?code=test-code&locale=en&org=test-org'

    await act(async () => {
      result.current.getOtpSetupInfo()
      // Ensure the promise chain resolves.
      await Promise.resolve()
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      `${routeConfig.IdentityRoute.OtpMfaSetup}${qs}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
    expect(result.current.otpSecret).toBe('test-secret')
    expect(result.current.otpUri).toBe('test-uri')

    fetchSpy.mockRestore()
  },
)

test(
  'getOtpSetupInfo calls onSubmitError on fetch failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useOtpMfaForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    const fetchError = new Error('Network error')
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(fetchError)

    await act(async () => {
      result.current.getOtpSetupInfo()
      await Promise.resolve()
    })

    expect(onSubmitError).toHaveBeenCalledWith(fetchError)
    // otpUri should remain unchanged on error.
    expect(result.current.otpUri).toBe('')

    fetchSpy.mockRestore()
  },
)

test(
  'getOtpMfaInfo fetches OTP MFA info and updates allowFallbackToEmailMfa',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useOtpMfaForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    // Fake response returning allowFallbackToEmailMfa flag.
    const fakeResponse = {
      ok: true,
      json: async () => ({ allowFallbackToEmailMfa: true }),
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)
    const qs = '?code=test-code&locale=en&org=test-org'

    await act(async () => {
      result.current.getOtpMfaInfo()
      await Promise.resolve()
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      `${routeConfig.IdentityRoute.ProcessOtpMfa}${qs}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
    expect(result.current.allowFallbackToEmailMfa).toBe(true)

    fetchSpy.mockRestore()
  },
)

test(
  'getOtpMfaInfo calls onSubmitError on fetch failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useOtpMfaForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    const fetchError = new Error('Fetch error')
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(fetchError)

    await act(async () => {
      result.current.getOtpMfaInfo()
      await Promise.resolve()
    })

    expect(onSubmitError).toHaveBeenCalledWith(fetchError)

    fetchSpy.mockRestore()
  },
)

test(
  'handleMfa submits data successfully when valid',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useOtpMfaForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    // Set a valid mfaCode.
    act(() => {
      result.current.handleChange(
        'mfaCode',
        ['1', '2', '3', '4', '5', '6'],
      )
    })

    // Prepare a fake POST response.
    const fakeResponseData = { authorized: true }
    const fakeResponse = {
      ok: true,
      json: async () => fakeResponseData,
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)
    // Spy on handleAuthorizeStep and simulate authorization by calling onSwitchView.
    const handleAuthorizeSpy = vi.spyOn(
      requestModule,
      'handleAuthorizeStep',
    ).mockImplementation((
      response, locale, onSwitchView,
    ) => {
      onSwitchView(View.Consent)
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleVerifyMfa(fakeEvent)
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.ProcessOtpMfa,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: expect.any(String), // Request body is a stringified JSON.
      },
    )
    expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

    fetchSpy.mockRestore()
    handleAuthorizeSpy.mockRestore()
  },
)

test(
  'handleMfa does not submit if validation errors exist',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useOtpMfaForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    // Set an invalid mfaCode (e.g. too short).
    act(() => {
      result.current.handleChange(
        'mfaCode',
        ['1', '2', '3'],
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    )

    await act(async () => {
      result.current.handleVerifyMfa(fakeEvent)
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    // As validation failed, no POST fetch should occur.
    expect(fetchSpy).not.toHaveBeenCalled()
    // The errors should now be set because the field was touched.
    expect(result.current.errors.mfaCode).not.toBeUndefined()

    fetchSpy.mockRestore()
  },
)

test(
  'handleMfa calls onSubmitError on fetch failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useOtpMfaForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    // Set a valid mfaCode.
    act(() => {
      result.current.handleChange(
        'mfaCode',
        ['1', '2', '3', '4', '5', '6'],
      )
    })

    const fetchError = new Error('Submission failed')
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(fetchError)
    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleVerifyMfa(fakeEvent)
      await Promise.resolve()
    })

    expect(onSubmitError).toHaveBeenCalledWith(fetchError)

    fetchSpy.mockRestore()
  },
)
