import {
  expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import useConsentForm from 'pages/hooks/useConsentForm'

// Mock hooks from hono/jsx.
vi.mock(
  'hono/jsx',
  () => ({
    useMemo: React.useMemo,
    useState: React.useState,
    useCallback: React.useCallback,
  }),
)

// Mock getFollowUpParams to return dummy values.
vi.mock(
  'pages/tools/param',
  () => ({
    getFollowUpParams: vi.fn(() => ({
      code: 'dummy-code',
      org: 'dummy-org',
      redirectUri: 'https://redirect.example.com',
    })),
  }),
)

test(
  'initial state returns null consentInfo',
  () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useConsentForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    // Initially, consentInfo should be null.
    expect(result.current.consentInfo).toBeNull()
  },
)

test(
  'getConsentInfo fetches consent info and updates state',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useConsentForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    const fakeConsent = { consent: 'test-consent' }
    const fakeResponse = {
      ok: true, json: async () => fakeConsent,
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    // Call getConsentInfo.
    act(() => {
      result.current.getConsentInfo()
    })

    // Allow promise chain to resolve.
    await act(async () => {
      await Promise.resolve()
    })

    // Verify fetch was called with the proper URL.
    expect(fetchSpy).toHaveBeenCalledWith(
      '/identity/v1/app-consent?code=dummy-code&locale=en&org=dummy-org',
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      },
    )
    expect(result.current.consentInfo).toEqual(fakeConsent)

    fetchSpy.mockRestore()
  },
)

test(
  'getConsentInfo calls onSubmitError on fetch failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useConsentForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(new Error('Network error'))

    act(() => {
      result.current.getConsentInfo()
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(onSubmitError).toHaveBeenCalledWith(expect.any(Error))
    fetchSpy.mockRestore()
  },
)

test(
  'handleAccept calls onSubmitError on POST failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useConsentForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(new Error('POST error'))

    act(() => {
      result.current.handleAccept()
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(onSubmitError).toHaveBeenCalledWith(expect.any(Error))
    fetchSpy.mockRestore()
  },
)
